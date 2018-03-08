
(function () {
	/**
	 * 书本类
	 * @param data
	 * @constructor
	 */
	var FB = function (data) {
		var that = this;
		var baseURL = data.baseURL ? 'http://open.v5time.net':'http://open.timeface.cn';
		$.ajax({
			type:'POST',
			url:baseURL +"/openpod/api/authorize/",
			data:{
				'app_id':data.app_id ,
				'app_secret':data.app_secret,
				'user_object':JSON.stringify(data.user_object)
			},
			success: function (res) {
				if(res.error_code == 10000){
					var bookData = res.data;
					getBookData(bookData)
				}else{
					alert(podData.info)
				}

			},
			error:function (err) {
				alert(err)
			}
		})


		function getBookData(bookData) {
			$.ajax({
				type:'POST',
				url:baseURL + "/openpod/pod/pod",
				data:{
					'access_token':bookData.access_token,
					'unionid':bookData.unionid,
					'book_id':data.book_id,
					'book_type':data.book_type,
					'rebuild':'0'
				},
				success:function (podData) {
					if(podData.error_code == 10000){
// 当前页
						var clBookData = podData.data
						that.currentPageIndex = 0;
						data.podData = clBookData.content_list;
						// 总页数
						that.allPageCount = 0;
						data.width = clBookData.book_width * data.ratioWidth;
						data.height = clBookData.book_height * data.ratioHeight;
						data.startIndex=clBookData.content_start_index;
						data.allPageCount=clBookData.content_list.length;
						// 参数设置
						that._bookData = data;

						// 书页
						that.pageList = [];

						that.isAutoZoom = false;

						that.zoomScale = 1;

						for(var i=0; i<1;i++){
							that.initTemplate(i);
						}
						that.initSilider();
						that.init();

						// 触屏区域
						that.touchRectSize = new FB.Size(that.width / 2, that.height / 2);
					}else{
						alert(podData.info)
					}
				},
				error:function (err) {
					alert(err)
				}
			})
		}

	};
	/*var FB = function (data) {
		console.log('data',data);


		// 当前页
		this.currentPageIndex = 0;

		// 总页数
		this.allPageCount = 0;
		data.width = data.width*data.ratioWidth;
		data.height = data.height*data.ratioHeight;
		// 参数设置
		this._bookData = data;

		// 书页
		this.pageList = [];

		this.isAutoZoom = false;

		this.zoomScale = 1;

		for(var i=0; i<1;i++){
			this.initTemplate(i);
		}
		this.initSilider()
		this.init();

		// 触屏区域
		this.touchRectSize = new FB.Size(this.width / 4, this.height / 4);
	};*/
	/**
	 * 坐标类
	 * @param x
	 * @param y
	 * @returns {{x: *, y: *}}
	 * @constructor
	 */
	FB.Point = function (x, y) {
		return {
			x: x,
			y: y
		}
	};

	/**
	 * Size大小类
	 * @param w
	 * @param h
	 * @returns {{width: *, height: *}}
	 * @constructor
	 */
	FB.Size = function (w, h) {
		return {
			width: w,
			height: h
		};
	};

	/**
	 * 触屏区域
	 * @type {{LeftTop: number, LeftBottom: number, RightTop: number, RightBottom: number}}
	 */
	FB.TouchPostion = {
		LeftTop: 0,
		LeftBottom: 1,
		RightTop: 2,
		RightBottom: 3
	};

	var transformName = "transform";
	var transformNameMs = "-ms-transform";
	var transformNameMoz = "-moz-transform";
	var transformNameWebkit = "-webkit-transform";
	var transformNameO = "-o-transform";
	var vendor;

	/**
	 * 初始化书本
	 * @param obj
	 */
	FB.prototype.init = function (obj) {
		obj = obj || this._bookData;
		this._bookData = obj;


		if (!this._bookData) {
			this._bookData = obj;
		}

		// 书页宽度
		this.width = obj.width;

		// 书页高度
		this.height = obj.height;
		this.startIndex = obj.startIndex;
		//编辑链接地址
		this.editUrl = obj.editUrl;
		//缩放宽
		this.ratioWidth = obj.ratioWidth || 1;
		//缩放高
		this.ratioHeight = obj.ratioHeight || 1;
		vendor = this.getPrefix();
		obj.zoomScale && (this.zoomScale = obj.zoomScale);

		this._isSinglePage = obj.isSinglePage;

		this.startKeyboard = obj.startKeyboard;

		var container = $(obj.container);
		this.container = container;
		var children = container.children();
		this.OriginChildren = children;

		// 如果是自动单页
		if (this._isSinglePage == 'auto' && this.isSinglePage()) {
			this.autoZoom();
		}

		//this._onPageFlipStart = obj.onPageFlipStart;
		this._onFlipEndPage = obj.onFlipEndPage;
		//this._onPageMissing = obj.onPageMissing;
		this._onInitComplete = obj.onInitComplete;

		var cPaddingY = this.isAutoZoom ? (window.innerHeight - this.height) / 2 : (this.getBigRectWidth() - this.height);
		//container.width(this.width * (this.isSinglePage() ? 1 : 2)).css('overflow', 'hidden').css('padding', cPaddingY + 'px 0px');
		container.width(this.width * (this.isSinglePage() ? 1 : 2))

		this.fbStage = $('<div class="FBStage"></div>');
		var fbStage = this.fbStage;
		fbStage.width(this.width * (this.isSinglePage() ? 1 : 2)).height(this.height);

		var target = this;


		this.allPageCount = obj.allPageCount;
		children.each(function (index, item) {
			target.addPage.call(target, item);
		});

		if (this.isSinglePage()) {
			var blankPage = $('<div class="FBBlankPage"></div>').width(obj.width).height(obj.height);
			this._BlankPage = this.generatePage(blankPage);
			this.fbStage.append(this._BlankPage);
		}

		// 阴影
		this._pageShadow = $('<div class="FBPageShadow"></div>');
		this._pageShadow.width(this.width * (this.isSinglePage() ? 1 : 2)).height(this.height);
		fbStage.append(this._pageShadow);
		this.pageList[this.currentPageIndex].css('z-index', 9);
		container.append(fbStage);

		this.initEvent();

		this._onInitComplete && this._onInitComplete.call(this);
	};

	/**
	 * 自动缩放以适应屏幕
	 */
	FB.prototype.autoZoom = function () {
		var xPercent = window.innerWidth / this.width,
			yPercent = window.innerHeight / this.height;
		this.width *= xPercent;
		this.height *= xPercent;
		console.log('this.width',document.documentElement.clientWidth);
		this.OriginChildren.each(function () {
			$(this).css('transform-origin', 'center center 0px').css('transform', 'scale(' + xPercent + ')');
			$(this).css('-webkit-transform-origin', 'center center 0px').css('-webkit-transform', 'scale(' + xPercent + ')');
			$(this).css('-ms-transform-origin', 'center center 0px').css('-ms-transform', 'scale(' + xPercent + ')');
			$(this).css('-moz-transform-origin', 'center center 0px').css('-moz-transform', 'scale(' + xPercent + ')');
			$(this).css('-o-transform-origin', 'center center 0px').css('-o-transform', 'scale(' + xPercent + ')');
		});
		this.isAutoZoom = true;
		console.log('this.zoomScale',xPercent);
		this.zoomScale = xPercent;

		var data =  this._bookData;
		var that = this;
		$('#bookShadow').css({
			width:data.width* that.zoomScale+'px',
			height:data.height* that.zoomScale+'px'
		})
		$('#main,#pageList').css({
			width:that.zoomScale ==1 ? data.width *2+'px' : data.width * that.zoomScale+'px',
			height:that.zoomScale ==1 ? data.height +'px' : data.height * that.zoomScale+'px'
		})
	};

	/**
	 * 生成DOM Page
	 * @param item
	 */
	FB.prototype.generatePage = function (item) {
		var page = $('<div class="FBPage" ></div>');
		page.css('left', this.width * (this.isSinglePage() ? 0 : 1) + 'px').css('z-index', 0);

		page.FBContainer = $('<div class="FBPageContainer"></div>');
		page.FBContainer.width(this.getBigRectWidth()).height(this.getBigRectWidth());
		this.isNext ? page.width(this.width).height(this.height).append(page.FBContainer).appendTo(this.fbStage) :
			page.width(this.width).height(this.height).append(page.FBContainer).prependTo(this.fbStage);

		page.FBPage = $('<div class="FBInnerPage"></div>');
		page.FBPage.width(this.width).height(this.height);

		page.OriginPage = $(item);
		if (this.isAutoZoom || this.zoomScale != 1) {

			$(item).css('transform-origin-origin', '0% 0%').css('transform', 'scale(' + this.zoomScale + ')');
			$(item).css('-webkit-transform-origin', '0% 0%').css('-webkit-transform', 'scale(' + this.zoomScale + ')');
			$(item).css('-ms-transform-origin', '0% 0%').css('-ms-transform', 'scale(' + this.zoomScale + ')');
			$(item).css('-moz-transform-origin', '0% 0%').css('-moz-transform', 'scale(' + this.zoomScale + ')');
			$(item).css('-o-transform-origin', '0% 0%').css('-o-transform', 'scale(' + this.zoomScale + ')');
		}
		page.FBPage.append(page.OriginPage).appendTo(page.FBContainer);

		// 光效
		var FBLight = $('<div class="FBPageLight"></div>');
		FBLight.width(this.width).height(this.height);
		page.FBLight = FBLight;
		page.FBPage.append(FBLight);
		return page;
	};

	/**
	 * 是否是单页
	 * @returns {boolean}
	 */
	FB.prototype.isSinglePage = function () {
		if (this._isSinglePage != undefined && this._isSinglePage != 'auto') {
			return !!this._isSinglePage;
		} else {
			return window.innerHeight > window.innerWidth;
		}
	};

	/**
	 * 获取点击事件响应数据,返回参照点
	 * @param p
	 */
	FB.prototype.getReferencePoint = function (p) {
		var trs = this.touchRectSize;
		var x = this.isSinglePage() ? 1 : 2;
		// 右上
		if (p.x > this.width * x - trs.width && p.x <= this.width * x
			&& p.y >= 0 && p.y <  trs.height) {
			// 参照点
			return {
				x: this.width * x,
				y: 0,
				direct: FB.TouchPostion.RightTop
			};
		}
		// 右下
		if (p.x > this.width * x - trs.width && p.x <= this.width * x
			&& p.y > this.height - trs.height && p.y <= this.height) {
			return {
				x: this.width * x,
				y: this.height,
				direct: FB.TouchPostion.RightBottom
			};
		}
		// 左上
		if (p.x >= 0 && p.x < trs.width
			&& p.y >= 0 && p.y < trs.height) {
			return {
				x: 0,
				y: 0,
				direct: FB.TouchPostion.LeftTop
			};
		}
		// 左下
		if (p.x >= 0 && p.x < trs.width
			&& p.y > this.height - trs.height && p.y <= this.height) {
			return {
				x: 0,
				y: this.height,
				direct: FB.TouchPostion.LeftBottom
			};
		}
		/*
		 * 修改源码，源码返回null后第一次打开点击左边后再次点击后边翻页此方法不执行，
		 * 所以做如下修改
		 * */
		return null
	};

	/**
	 * 初始化翻书事件
	 */
	FB.prototype.initEvent = function () {
		var isOnFlipBook = false;
		var isOnBackScrolling = false;
		var t = this;

		// 触屏开始事件
		var _onTouchStart = function (e) {
			if (!isOnBackScrolling) {
				//console.log('Touch start');
				isOnFlipBook = true;
				// 获取舞台中的相对坐标点
				var sp = t.getStagePoint(e);
				t._onTouches.call(t, sp, 0);
			}
			return false;
		};

		// 触屏移动事件
		var _onTouchMove = function (e) {
			if (isOnFlipBook && !isOnBackScrolling) {
				//console.log('Touch move.');
				var sp = t.getStagePoint(e);
				t._onTouches.call(t, sp, 1);
			}
			return false;
		};

		// 触屏结束事件
		var _onTouchEnd = function (e) {
			if (isOnFlipBook) {
				isOnFlipBook = false;
				if (!isOnBackScrolling) {
					isOnBackScrolling = true;
					var sp = t.getStagePoint(e);
					var mp = t._referPoint;
					if (!mp) {
						isOnBackScrolling = false;
						return false;
					}
					var d2sLong = t.getTwoPointLong(sp, mp);

					var endPoint = mp;
					var isNext = false;
					if (d2sLong > t.getBigRectWidth() / 20) {
						endPoint = {
							x: t.isSinglePage() ? -t.width : 0,
							y: mp.y
						};
						if (mp.x == 0) {
							endPoint.x = t.width * 2;
						}
						isNext = true;
					}
					var animateCount = 30;
					var xUnit = (endPoint.x - sp.x) / animateCount,
						yUnit = (endPoint.y - sp.y) / animateCount;

					var _timeFrame = 0;
					var endInterval = setInterval(function () {

						isOnBackScrolling = true;
						sp = {
							x: sp.x + xUnit,
							y: sp.y + yUnit
						};
						var isEnd = false;
						if ((Math.abs(Math.abs(sp.x) - Math.abs(endPoint.x)) <= Math.abs(xUnit)) || (Math.abs(Math.abs(sp.y) - Math.abs(endPoint.y)) <= Math.abs(yUnit))) {
							sp.x = endPoint.x;
							sp.y = endPoint.y;
							clearInterval(endInterval);
							isEnd = true;
						}
						t._onTouches.call(t, sp, 1);
						if (isEnd && isNext) {
							if (mp.direct == 0 || mp.direct == 1) {
								t.currentPageIndex -= t.isSinglePage() ? 1 : 2;
							} else {
								t.currentPageIndex += t.isSinglePage() ? 1 : 2;
							}
							if (t.currentPageIndex < 0) {
								t.currentPageIndex = 0;
							} else if (t.currentPageIndex >= t.allPageCount) {
								t.currentPageIndex = t.isSinglePage() ? t.allPageCount - 1 : t.allPageCount;
							}
							t.onPageFlipEnd ? t.onPageFlipEnd.call(t) : null;
							t._onFlipEndPage ? t._onFlipEndPage.call(t) : null;
						}
						if (isEnd) {
							isOnBackScrolling = false;

							// clearTimeout(endTimeout);
						}
					}, _timeFrame);

					// var endTimeout = setTimeout(function () {
					//     clearInterval(endInterval);
					//     isOnBackScrolling = false;
					// }, _timeFrame * (animateCount + 1));
				}
			}
		};
		//新添加键盘翻页
		var keyTouch = this.keyTouch = function (ops) {
			if(isOnBackScrolling){
				// 翻页动画执行时不再处理键盘事件
				return;
			}
			var sp = {
				x: ops.x,
				y: ops.y
			};
			t._onTouches.call(t, sp, 0);
			t._onTouches.call(t, sp, 1);
			if (!isOnBackScrolling) {
				isOnBackScrolling = true;
				var mp = t._referPoint;
				if (!mp) {
					isOnBackScrolling = false;
					return false;
				}

				var d2sLong = t.getTwoPointLong(sp, mp);

				var endPoint = mp;
				var isNext = false;
				if (d2sLong > t.getBigRectWidth() / 8) {
					endPoint = {
						x: t.isSinglePage() ? -t.width : 0,
						y: mp.y
					};
					if (mp.x == 0) {
						endPoint.x = t.width * 2;
					}
					isNext = true;
				}
				var animateCount = 15;
				var xUnit = (endPoint.x - sp.x) / animateCount,
					yUnit = (endPoint.y - sp.y) / animateCount;

				var _timeFrame = 20;
				var endInterval = setInterval(function () {
					isOnBackScrolling = true;
					sp = {
						x: sp.x + xUnit,
						y: sp.y + yUnit
					};
					var isEnd = false;
					if ((Math.abs(Math.abs(sp.x) - Math.abs(endPoint.x)) <= Math.abs(xUnit)) || (Math.abs(Math.abs(sp.y) - Math.abs(endPoint.y)) <= Math.abs(yUnit))) {
						sp.x = endPoint.x;
						sp.y = endPoint.y;
						clearInterval(endInterval);
						isEnd = true;
					}
					t._onTouches.call(t, sp, 1);
					if (isEnd && isNext) {
						if (mp.direct == 0 || mp.direct == 1) {
							t.currentPageIndex -= t.isSinglePage() ? 1 : 2;
						} else {
							t.currentPageIndex += t.isSinglePage() ? 1 : 2;
						}
						if (t.currentPageIndex < 0) {
							t.currentPageIndex = 0;
						} else if (t.currentPageIndex >= t.allPageCount) {
							t.currentPageIndex = t.isSinglePage() ? t.allPageCount - 1 : t.allPageCount;
						}
						t.onPageFlipEnd ? t.onPageFlipEnd.call(t) : null;
						t._onFlipEndPage ? t._onFlipEndPage.call(t) : null;
					}
					if (isEnd) {
						isOnBackScrolling = false;
						// clearTimeout(endTimeout);
					}
				}, _timeFrame);

				// var endTimeout = setTimeout(function () {
				//     clearInterval(endInterval);
				//     isOnBackScrolling = false;
				// }, _timeFrame * (animateCount + 1));
			}

		}



		var _keyboard = function (e) {
			console.log('key',t);
			console.log('key1',e);
			var xPercent = window.innerWidth / t.width,
				yPercent = window.innerHeight / t.height;
			if(!t.startKeyboard){
				return;
			}
			var previous = 37, next = 39;

			if(t.currentPageIndex >= t.allPageCount && e.keyCode == 39){
				return;
			}
			if(t.currentPageIndex == 0 && e.keyCode == 37){
				return;
			}
			console.log('t', t.height);
			e.stopPropagation()
			var is_sing_page =  t.isSinglePage() ? 1 : 2;
			switch (e.keyCode) {
				case previous:
					var sp = {
						x:100 * t.ratioWidth,
						y:t.height - (150 * t.ratioHeight)
					};
					keyTouch(sp);
					break;
				case next:
					var sp = {
						x: t.width *is_sing_page - (100 * t.ratioWidth),
						y:t.height - (150 * t.ratioHeight)
					};
					keyTouch(sp);
					break;
			}
		}
		this.fbStage.on("mousedown", _onTouchStart);
		this.container.on("mousemove", _onTouchMove);
		this.container.on("mouseup", _onTouchEnd);
		this.fbStage.on("touchstart", _onTouchStart);
		this.container.on("touchmove", _onTouchMove);
		this.container.on("touchend", _onTouchEnd);
		$('body').on("keydown", _keyboard);
	};

	/**
	 * 增加页面
	 * @param html
	 * @param index
	 */
	FB.prototype.addPage = function (html, index) {
		var node = html;
		if (typeof html === 'string') {
			node = $(html);
		}
		if (!this.pageList[index]) {
			var page = this.generatePage.call(this, node);
			page.addClass("FBPage-" + index || 0);
			if (arguments.length == 1) {
				this.pageList.push(page)
				// this.pageList.splice(index, 0, page)
			} else {
				if (this.isNext === true || this.isNext === false) {
					//this.pageList.splice(index, 1, page)
					// 因为存在跨页,所以无法使用splice方法
					this.pageList[index] = page;
				} else {
					console.warn('Replace page index is %d, but all page count is %d. add page failed.', index, this.allPageCount);
				}
			}


			/*      if(index >= 0 && index < this.allPageCount) {
			 if (this.pageList[index]) {
			 this.deletePageDom(index);
			 }
			 this.pageList[index] = page;
			 } else {
			 console.warn('Replace page index is %d, but all page count is %d. add page failed.', index, this.allPageCount);
			 }*/
		}
		// 总页数由外部传入,不根据pageList的长度计算
		//this.allPageCount = this.pageList.length;
	};

	/**
	 * 删除第几页的DOM对象
	 * @param index
	 */
	FB.prototype.deletePageDom = function (index, callback) {
		if (index >= 0 && index <= this.allPageCount) {
			if (this.pageList[index]) {
				// 判断是否有回调函数处理删除逻辑,否则直接移除dom元素
				if (typeof callback === 'function'){
					callback(this.pageList[index]);
				}else {
					this.pageList[index].remove();
				}
				this.pageList[index] = null;
				/*  this.isNext ?  this.pageList.splice(0,1) :this.pageList.splice(this.allPageCount,1)*/
				/*   this.pageList.splice(index,1)*/
			} else {

			}
		} else {
			console.warn('Delete page index is %d, but all page count is %d. delete page failed.', index, this.allPageCount);
		}
	};

	/**
	 * 触屏事件处理
	 * @param sp
	 * @param type
	 * @returns {boolean}
	 * @private
	 */
	FB.prototype._onTouches = function (sp, type) {
		if (type == 2) {
			// 结束事件
		} else {
			// 获取参照点
			var mp;
			if (type == 0) {
				mp = this.getReferencePoint(sp);
				this._referPoint = mp;
			} else {
				mp = this._referPoint;
			}
			if (mp) {
				var coreData = this.culCoreData(sp, mp);
				// 判断有效值(是否可以移动到该位置)
				if (!this.checkIsValidMove(mp, sp, coreData.xDistance)) {
					// console.warn('Invalid point...');
					return false;
				}
				var data = this.getCurrentCutPageData(coreData.angle, coreData.containerMove, coreData.pageMove, coreData.distance, sp);

				if (!this.isSinglePage()) {
					if ((data.isNext && this.currentPageIndex >= 0 && this.currentPageIndex < this.allPageCount)
						|| (!data.isNext && this.currentPageIndex > 0 && this.currentPageIndex <= this.allPageCount)) {
						if (type == 0) {
							this.flipCutStart(data);
						}
						this.renderCutPage(data);
					}
				} else {
					if ((data.isNext && this.currentPageIndex >= 0 && this.currentPageIndex < this.allPageCount - 1)
						|| (!data.isNext && this.currentPageIndex > 0 && this.currentPageIndex <= this.allPageCount)) {
						if (type == 0) {
							this.flipCutStart(data);
						}
						this.renderCutPage(data);
					}
				}
			}
		}
		return true;
	};

	/**
	 * 核心数据计算
	 * @param sp
	 * @param mp
	 * @returns {{distance: number, angle: number, hd: number, containerMove: {x: number, y: number}, pageMove: {x: number, y: number}}}
	 */
	FB.prototype.culCoreData = function (sp, mp) {
		var distance = this.getTwoPointLong(sp, mp);

		// 计算以参照点为顶点的角度
		var angle = this.getAngle(sp, mp);
		// 计算出与x轴交点
		// 发现一个异常，当角度小于该值时，计算出的xDistance出现值巨大的异常，因此加上此判断修复该问题
		if (angle < -57.29577951308232){
			angle = -57;
		}
		if (angle > 57.29577951308232){
			angle = 57;
		}
		var hd = 2 * Math.PI / 360 * angle;
		var xDistance = (distance / 2) / Math.cos(hd);

		// 计算出与y轴交点
		var hd2 = 2 * Math.PI / 360 * (90 - angle);
		var yDistance = (distance / 2) / Math.cos(hd2);

		// Container移动的距离计算
		// 对角线长度
		var maxL = this.getBigRectWidth();
		var containerMove = {
			x: (this.width - xDistance) * Math.cos(hd) - maxL,
			y: (sp.y >= 0 && sp.y <= this.height) ? 0 : this.width * Math.tan(hd) * Math.cos(hd)
		};

		// Page移动的距离计算
		var pageMove = {
			x: (this.width - xDistance) * Math.cos(hd) - distance / 2,
			y: (this.width - xDistance) * Math.sin(hd) + (distance / 2) * Math.tan(hd)
		};

		return {
			distance: distance,
			angle: angle,
			hd: hd,
			containerMove: containerMove,
			pageMove: pageMove,
			xDistance: xDistance,
			yDistance: yDistance
		};
	};

	/**
	 * 移动的点是否有效
	 * @param mp
	 * @param sp
	 * @param xDistance
	 * @returns {boolean}
	 */
	FB.prototype.checkIsValidMove = function (mp, sp, xDistance) {
		var maxL = this.getBigRectWidth();
		var diagonalPoint = this.getDiagonalPoint(mp.direct);
		var d2sLong = this.getTwoPointLong(diagonalPoint, sp);
		return !(xDistance > this.width || d2sLong > maxL);
	};

	/**
	 * 获取剪切页面的数据信息
	 * @param angle
	 * @param moveP
	 * @param pageMoveP
	 * @param distance
	 * @param sp
	 * @returns {*}
	 */
	FB.prototype.getCurrentCutPageData = function (angle, moveP, pageMoveP, distance, sp) {
		var data = {
			sp: sp,
			angle: angle,
			distance: distance
		};
		data.fbCP = {left: 0, right: 0};
		data.fbCOrigin = {x: 0, y: 0};
		data.fbCTransfrom = {x: 0, y: 0};
		data.fbCAngle = angle;
		data.fbPTransform1 = {x: 0, y: 0};
		data.fbPTransform2 = {x: 0, y: 0};
		data.fbPAngle = angle;

		var maxL = this.getBigRectWidth();
		switch (this._referPoint.direct) {
			case FB.TouchPostion.RightTop:
				data.pLeft = this.isSinglePage() ? 0 : this.width;
				data.fbCP = {left: 0, top: 0};
				data.fbCOrigin = {x: 0, y: 0};
				data.fbCTransfrom = {x: moveP.x, y: moveP.y};
				data.fbCAngle = -angle;
				data.fbPTransform1 = {x: -moveP.x, y: -moveP.y};
				data.fbPTransform2 = {x: pageMoveP.x, y: pageMoveP.y};
				data.fbPAngle = -angle;
				data.isNext = true;
				break;
			case FB.TouchPostion.RightBottom:
				data.pLeft = this.isSinglePage() ? 0 : this.width;
				data.fbCP = {left: 0, top: this.height - maxL};
				data.fbCOrigin = {x: 0, y: 100};
				data.fbCTransfrom = {x: moveP.x, y: moveP.y};
				data.fbCAngle = -angle;
				data.fbPTransform1 = {x: -moveP.x, y: (-moveP.y + maxL - this.height)};
				data.fbPTransform2 = {x: pageMoveP.x, y: pageMoveP.y};
				data.fbPAngle = -angle;
				data.isNext = true;
				break;
			case FB.TouchPostion.LeftTop:
				data.pLeft = 0;
				data.fbCP = {left: this.width - maxL, top: 0};
				data.fbCOrigin = {x: 100, y: 0};
				data.fbCTransfrom = {x: -moveP.x, y: moveP.y};
				data.fbCAngle = angle;
				data.fbPTransform1 = {x: -this.width, y: moveP.y};
				data.fbPTransform2 = {x: distance / 2, y: Math.abs(pageMoveP.y)};
				data.fbPAngle = angle;
				data.isNext = false;
				break;
			case FB.TouchPostion.LeftBottom:
				data.pLeft = 0;
				data.fbCP = {left: this.width - maxL, top: this.height - maxL};
				data.fbCOrigin = {x: 100, y: 100};
				data.fbCTransfrom = {x: -moveP.x, y: moveP.y};
				data.fbCAngle = angle;
				data.fbPTransform1 = {x: -this.width, y: -moveP.y + maxL - this.height};
				data.fbPTransform2 = {x: distance / 2, y: pageMoveP.y};
				data.fbPAngle = angle;
				data.isNext = false;
				break;
			default:
				return null;
		}
		return data;
	};

	/**
	 * 翻页开始执行事件
	 */
	FB.prototype.flipCutStart = function (data) {
		//console.log('Total Page Count:', this.allPageCount);
		//添加参数判断上一页还是下一页
		this.isNext = data.isNext;
		this.onPageFlipStart && this.onPageFlipStart();
		this.pageList.forEach(function (item) {
			console.log('item',item);
			if (item) item.hide().css('z-index', 0);
		});

		var isSingle = this.isSinglePage();


		var c = data.isNext ? this.currentPageIndex : this.currentPageIndex - 1;
		// 上一页或下一页(剪切页)
		var p = data.isNext ? c + 1 : c - 1;

		var b = data.isNext ? p + 1 : p - 1;
		// 剪切页,如不存在,则调用missing
		var cutPage = this.pageList[p] || (this.onPageMissing && this.onPageMissing.call(this, p));
		if (isSingle) {
			c = this.currentPageIndex;
			cutPage = this._BlankPage; // Blank Page
			b = data.isNext ? c + 1 : c - 1;
		} else {
				if (this.lastPageIndex != null) {
			 // 如果为跳页翻书,则显示上一页码的页面
			 if(data.isNext){
			 this.pageList[this.lastPageIndex - 1] && this.pageList[this.lastPageIndex - 1].show().css('z-index', 0);
			 this.pageList[this.lastPageIndex] && this.pageList[this.lastPageIndex].hide().css('z-index', 7);
			 }else{
			 this.pageList[this.lastPageIndex - 1] && this.pageList[this.lastPageIndex - 1].show().css('z-index', 0);
			 this.pageList[this.lastPageIndex] && this.pageList[this.lastPageIndex].show().css('z-index', 7);
			 }
			 }else {
			 this.pageList[this.currentPageIndex - 1] && this.pageList[this.currentPageIndex - 1].show().css('z-index', 9);
			 this.pageList[this.currentPageIndex] && this.pageList[this.currentPageIndex].show().css('z-index', 9);
			 }

			/*this.pageList[this.currentPageIndex - 1] && this.pageList[this.currentPageIndex - 1].show().css('z-index', 9);
			this.pageList[this.currentPageIndex] && this.pageList[this.currentPageIndex].show().css('z-index', 9);*/
		}
		if (!cutPage) {
			console.warn('No next page.');
			return;
		}

		// 当前页
		var currentPage = this.pageList[c] || (this.onPageMissing && this.onPageMissing.call(this, c));

		// 底页
		var bottomPage = this.pageList[b] || (this.onPageMissing && this.onPageMissing.call(this, b));

		// 当前页
		currentPage.show().css('z-index', 9);

		// 处理上一页或下一页(剪切页)
		cutPage.show().css('z-index', 10);

		// 上上一页或下下一页(底页)
		bottomPage && bottomPage.show().css('z-index', 7);

		// 翻页结束处理事件
		/*		this._onPageFlipEnd = function () {
		 // 将右页的FBPage层级从 7 调成 11
		 console.log('翻页结束');
		 bottomPage ? bottomPage.css('z-index', 11) : ''

		 }*/
	};

	/**
	 * 绘制剪切页面
	 * @param data
	 */
	FB.prototype.renderCutPage = function (data) {
		//console.log(data);
		this.isNext = data.isNext;
		var isSingle = this.isSinglePage();
		var c = data.isNext ? this.currentPageIndex : this.currentPageIndex - 1;

		// 上一页或下一页(剪切页)
		var p = data.isNext ? c + 1 : c - 1;

		var b = data.isNext ? p + 1 : p - 1;
		// 剪切页
		var cutPage = this.pageList[p] || (this.onPageMissing && this.onPageMissing.call(this, p));

		if (isSingle) {
			c = this.currentPageIndex;
			cutPage = this._BlankPage; // Blank Page
			b = data.isNext ? c + 1 : c - 1;
		}
		if (!cutPage) {
			console.warn('No next page for render.');
			return;
		}
		// 当前页
		var currentPage = this.pageList[c] || (this.onPageMissing && this.onPageMissing.call(this, c));

		// 底页
		var bottomPage = this.pageList[b] || (this.onPageMissing && this.onPageMissing.call(this, b));
		//console.log('b',b);
		// 当前页
		currentPage.css('left', data.pLeft + 'px');
		currentPage.FBContainer.css('left', data.fbCP.left + 'px').css('top', data.fbCP.top + 'px');
		currentPage.FBContainer.css('transform-origin', data.fbCOrigin.x + '% ' + data.fbCOrigin.y + '% 0px');
		currentPage.FBContainer.css('-ms-transform-origin', data.fbCOrigin.x + '% ' + data.fbCOrigin.y + '% 0px');
		currentPage.FBContainer.css('-moz-transform-origin', data.fbCOrigin.x + '% ' + data.fbCOrigin.y + '% 0px');
		currentPage.FBContainer.css('-webkit-transform-origin', data.fbCOrigin.x + '% ' + data.fbCOrigin.y + '% 0px');
		currentPage.FBContainer.css('-o-transform-origin', data.fbCOrigin.x + '% ' + data.fbCOrigin.y + '% 0px');
		currentPage.FBContainer.css(transformName, "rotate(" + data.fbCAngle + "deg) translate3d(" + data.fbCTransfrom.x + "px, " + data.fbCTransfrom.y + "px, 0px)");
		currentPage.FBContainer.css(transformNameMs, "rotate(" + data.fbCAngle + "deg) translate3d(" + data.fbCTransfrom.x + "px, " + data.fbCTransfrom.y + "px, 0px)");
		currentPage.FBContainer.css(transformNameMoz, "rotate(" + data.fbCAngle + "deg) translate3d(" + data.fbCTransfrom.x + "px, " + data.fbCTransfrom.y + "px, 0px)");
		currentPage.FBContainer.css(transformNameWebkit, "rotate(" + data.fbCAngle + "deg) translate3d(" + data.fbCTransfrom.x + "px, " + data.fbCTransfrom.y + "px, 0px)");
		currentPage.FBContainer.css(transformNameO, "rotate(" + data.fbCAngle + "deg) translate3d(" + data.fbCTransfrom.x + "px, " + data.fbCTransfrom.y + "px, 0px)");

		currentPage.FBPage.css('transform-origin', data.fbCOrigin.x + '% ' + data.fbCOrigin.y + '% 0px');
		currentPage.FBPage.css('-ms-transform-origin', data.fbCOrigin.x + '% ' + data.fbCOrigin.y + '% 0px');
		currentPage.FBPage.css('-moz-transform-origin', data.fbCOrigin.x + '% ' + data.fbCOrigin.y + '% 0px');
		currentPage.FBPage.css('-webkit-transform-origin', data.fbCOrigin.x + '% ' + data.fbCOrigin.y + '% 0px');
		currentPage.FBPage.css('-o-transform-origin', data.fbCOrigin.x + '% ' + data.fbCOrigin.y + '% 0px');
		if (data.isNext) {
			currentPage.FBPage.css(transformName, "translate3d(" + data.fbPTransform1.x + "px, " + data.fbPTransform1.y + "px, 0px) rotate(" + (360 - data.fbCAngle) + "deg)");
			currentPage.FBPage.css(transformNameMs, "translate3d(" + data.fbPTransform1.x + "px, " + data.fbPTransform1.y + "px, 0px) rotate(" + (360 - data.fbCAngle) + "deg)");
			currentPage.FBPage.css(transformNameMoz, "translate3d(" + data.fbPTransform1.x + "px, " + data.fbPTransform1.y + "px, 0px) rotate(" + (360 - data.fbCAngle) + "deg)");
			currentPage.FBPage.css(transformNameWebkit, "translate3d(" + data.fbPTransform1.x + "px, " + data.fbPTransform1.y + "px, 0px) rotate(" + (360 - data.fbCAngle) + "deg)");
			currentPage.FBPage.css(transformNameO, "translate3d(" + data.fbPTransform1.x + "px, " + data.fbPTransform1.y + "px, 0px) rotate(" + (360 - data.fbCAngle) + "deg)");
		} else {
			var ly = 0;
			if (this._referPoint.direct == 1) {
				ly = -(data.fbCTransfrom.y + this.height - this.getBigRectWidth());
			} else if (this._referPoint.direct == 0) {
				ly = data.fbCTransfrom.y < 0 ? -data.fbCTransfrom.y : 0;
			}
			var lx = -(data.fbCTransfrom.x + this.width - this.getBigRectWidth());
			currentPage.FBPage.css(transformName, "translate3d(" + lx + "px, " + ly + "px, 0px) rotate(" + (360 - data.fbCAngle) + "deg)");
			currentPage.FBPage.css(transformNameMs, "translate3d(" + lx + "px, " + ly + "px, 0px) rotate(" + (360 - data.fbCAngle) + "deg)");
			currentPage.FBPage.css(transformNameMoz, "translate3d(" + lx + "px, " + ly + "px, 0px) rotate(" + (360 - data.fbCAngle) + "deg)");
			currentPage.FBPage.css(transformNameWebkit, "translate3d(" + lx + "px, " + ly + "px, 0px) rotate(" + (360 - data.fbCAngle) + "deg)");
			currentPage.FBPage.css(transformNameO, "translate3d(" + lx + "px, " + ly + "px, 0px) rotate(" + (360 - data.fbCAngle) + "deg)");
		}

		// 处理上一页或下一页(剪切页)
		cutPage.css('left', data.pLeft + 'px');

		cutPage.FBContainer.css('left', data.fbCP.left + 'px').css('top', data.fbCP.top + 'px');
		cutPage.FBContainer.css('transform-origin', data.fbCOrigin.x + '% ' + data.fbCOrigin.y + '% 0px');
		cutPage.FBContainer.css('-ms-transform', data.fbCOrigin.x + '% ' + data.fbCOrigin.y + '% 0px');
		cutPage.FBContainer.css('-moz-transform', data.fbCOrigin.x + '% ' + data.fbCOrigin.y + '% 0px');
		cutPage.FBContainer.css('-webkit-transform-origin', data.fbCOrigin.x + '% ' + data.fbCOrigin.y + '% 0px');
		cutPage.FBContainer.css('-o-transform-origin', data.fbCOrigin.x + '% ' + data.fbCOrigin.y + '% 0px');
		cutPage.FBContainer.css(transformName, "rotate(" + data.fbCAngle + "deg) translate3d(" + data.fbCTransfrom.x + "px, " + data.fbCTransfrom.y + "px, 0px)");
		cutPage.FBContainer.css(transformNameMs, "rotate(" + data.fbCAngle + "deg) translate3d(" + data.fbCTransfrom.x + "px, " + data.fbCTransfrom.y + "px, 0px)");
		cutPage.FBContainer.css(transformNameMoz, "rotate(" + data.fbCAngle + "deg) translate3d(" + data.fbCTransfrom.x + "px, " + data.fbCTransfrom.y + "px, 0px)");
		cutPage.FBContainer.css(transformNameWebkit, "rotate(" + data.fbCAngle + "deg) translate3d(" + data.fbCTransfrom.x + "px, " + data.fbCTransfrom.y + "px, 0px)");
		cutPage.FBContainer.css(transformNameO, "rotate(" + data.fbCAngle + "deg) translate3d(" + data.fbCTransfrom.x + "px, " + data.fbCTransfrom.y + "px, 0px)");

		cutPage.FBPage.css('transform-origin', data.fbCOrigin.x + '% ' + data.fbCOrigin.y + '% 0px');
		cutPage.FBPage.css('-ms-transform-origin', data.fbCOrigin.x + '% ' + data.fbCOrigin.y + '% 0px');
		cutPage.FBPage.css('-moz-transform-origin', data.fbCOrigin.x + '% ' + data.fbCOrigin.y + '% 0px');
		cutPage.FBPage.css('-webkit-transform-origin', data.fbCOrigin.x + '% ' + data.fbCOrigin.y + '% 0px');
		cutPage.FBPage.css('-o-transform-origin', data.fbCOrigin.x + '% ' + data.fbCOrigin.y + '% 0px');
		cutPage.FBPage.css(transformName, "translate3d(" + data.fbPTransform1.x + "px, " + data.fbPTransform1.y + "px, 0px) translate3d(" + data.fbPTransform2.x + "px, " + data.fbPTransform2.y + "px, 0px) rotate(" + data.fbPAngle + "deg)");
		cutPage.FBPage.css(transformNameMs, "translate3d(" + data.fbPTransform1.x + "px, " + data.fbPTransform1.y + "px, 0px) translate3d(" + data.fbPTransform2.x + "px, " + data.fbPTransform2.y + "px, 0px) rotate(" + data.fbPAngle + "deg)");
		cutPage.FBPage.css(transformNameMoz, "translate3d(" + data.fbPTransform1.x + "px, " + data.fbPTransform1.y + "px, 0px) translate3d(" + data.fbPTransform2.x + "px, " + data.fbPTransform2.y + "px, 0px) rotate(" + data.fbPAngle + "deg)");
		cutPage.FBPage.css(transformNameWebkit, "translate3d(" + data.fbPTransform1.x + "px, " + data.fbPTransform1.y + "px, 0px) translate3d(" + data.fbPTransform2.x + "px, " + data.fbPTransform2.y + "px, 0px) rotate(" + data.fbPAngle + "deg)");
		cutPage.FBPage.css(transformNameO, "translate3d(" + data.fbPTransform1.x + "px, " + data.fbPTransform1.y + "px, 0px) translate3d(" + data.fbPTransform2.x + "px, " + data.fbPTransform2.y + "px, 0px) rotate(" + data.fbPAngle + "deg)");


		//bottomPage.css('left', data.pLeft + 'px');
		//上上一页或下下一页
		if (bottomPage) {
			// 向前翻页
			bottomPage.css('left', data.pLeft + 'px');
			bottomPage.FBContainer.css('left', '0px').css('top', '0px');
			bottomPage.FBContainer.css('transform-origin', '0% 0% 0px');
			bottomPage.FBContainer.css('-ms-transform-origin', '0% 0% 0px');
			bottomPage.FBContainer.css('-moz-transform-origin', '0% 0% 0px');
			bottomPage.FBContainer.css('-webkit-transform-origin', '0% 0% 0px');
			bottomPage.FBContainer.css('-o-transform-origin', '0% 0% 0px');
			bottomPage.FBContainer.css(transformName, "rotate(0deg) translate3d(" + data.fbCP.left + "px, " + 0 + "px, 0px)");
			bottomPage.FBContainer.css(transformNameMs, "rotate(0deg) translate3d(" + data.fbCP.left + "px, " + 0 + "px, 0px)");
			bottomPage.FBContainer.css(transformNameMoz, "rotate(0deg) translate3d(" + data.fbCP.left + "px, " + 0 + "px, 0px)");
			bottomPage.FBContainer.css(transformNameWebkit, "rotate(0deg) translate3d(" + data.fbCP.left + "px, " + 0 + "px, 0px)");
			bottomPage.FBContainer.css(transformNameO, "rotate(0deg) translate3d(" + data.fbCP.left + "px, " + 0 + "px, 0px)");

			bottomPage.FBPage.css('transform-origin', '0% 0% 0px');
			bottomPage.FBPage.css('-ms-transform-origin', '0% 0% 0px');
			bottomPage.FBPage.css('-moz-transform-origin', '0% 0% 0px');
			bottomPage.FBPage.css('-webkit-transform-origin', '0% 0% 0px');
			bottomPage.FBPage.css('-o-transform-origin', '0% 0% 0px');
			bottomPage.FBPage.css(transformName, "rotate(0deg) translate3d(" + (data.fbCP.left * -1) + "px, " + 0 + "px, 0px)");
			bottomPage.FBPage.css(transformNameMs, "rotate(0deg) translate3d(" + (data.fbCP.left * -1) + "px, " + 0 + "px, 0px)");
			bottomPage.FBPage.css(transformNameMoz, "rotate(0deg) translate3d(" + (data.fbCP.left * -1) + "px, " + 0 + "px, 0px)");
			bottomPage.FBPage.css(transformNameWebkit, "rotate(0deg) translate3d(" + (data.fbCP.left * -1) + "px, " + 0 + "px, 0px)");
			bottomPage.FBPage.css(transformNameO, "rotate(0deg) translate3d(" + (data.fbCP.left * -1) + "px, " + 0 + "px, 0px)");

		}

		// 上上一页或下下一页(底页)
		if (isSingle) {
			bottomPage.css('left', '0px');
			bottomPage.FBContainer.css('left', '0px').css('top', '0px');
			bottomPage.FBContainer.css('transform-origin', '0% 0% 0px');
			bottomPage.FBContainer.css('-ms-transform-origin', '0% 0% 0px');
			bottomPage.FBContainer.css('-moz-transform-origin', '0% 0% 0px');
			bottomPage.FBContainer.css('-webkit-transform-origin', '0% 0% 0px');
			bottomPage.FBContainer.css('-o-transform-origin', '0% 0% 0px');
			bottomPage.FBContainer.css(transformName, "rotate(0deg) translate3d(0px, 0px, 0px)");
			bottomPage.FBContainer.css(transformNameMs, "rotate(0deg) translate3d(0px, 0px, 0px)");
			bottomPage.FBContainer.css(transformNameMoz, "rotate(0deg) translate3d(0px, 0px, 0px)");
			bottomPage.FBContainer.css(transformNameWebkit, "rotate(0deg) translate3d(0px, 0px, 0px)");
			bottomPage.FBContainer.css(transformNameO, "rotate(0deg) translate3d(0px, 0px, 0px)");

			bottomPage.FBPage.css('transform-origin', '0% 0% 0px');
			bottomPage.FBPage.css('-ms-transform-origin', '0% 0% 0px');
			bottomPage.FBPage.css('-moz-transform-origin', '0% 0% 0px');
			bottomPage.FBPage.css('-webkit-transform-origin', '0% 0% 0px');
			bottomPage.FBPage.css('-o-transform-origin', '0% 0% 0px');
			bottomPage.FBPage.css(transformName, "translate3d(0px, 0px, 0px) translate3d(0px, 0px, 0px) rotate(0deg)");
			bottomPage.FBPage.css(transformNameMs, "translate3d(0px, 0px, 0px) translate3d(0px, 0px, 0px) rotate(0deg)");
			bottomPage.FBPage.css(transformNameMoz, "translate3d(0px, 0px, 0px) translate3d(0px, 0px, 0px) rotate(0deg)");
			bottomPage.FBPage.css(transformNameWebkit, "translate3d(0px, 0px, 0px) translate3d(0px, 0px, 0px) rotate(0deg)");
			bottomPage.FBPage.css(transformNameO, "translate3d(0px, 0px, 0px) translate3d(0px, 0px, 0px) rotate(0deg)");
		}

		// 底部阴影处理
		if ((!isSingle && ((this.currentPageIndex >= this.allPageCount - 2 && data.isNext) || (this.currentPageIndex <= 3 && !data.isNext)))
			|| (isSingle && ((this.currentPageIndex >= this.allPageCount - 1 && data.isNext) || (this.currentPageIndex <= 0 && !data.isNext)))
		) {

		} else {
			var opacity = 1 - Math.abs(data.sp.x - this._referPoint.x) / (this.width * 2);

			var bColors = [[0.4, 'rgba(0,0,0,0)'], [0.5, 'rgba(0,0,0,' + (0.4 * opacity) + ')'], [0.6, 'rgba(0,0,0,0)']], cols = [], b
			/**
			 * 计算横坐标和纵坐标百分比
			 * */
			var b1 = {
				x: this._referPoint.x / this._pageShadow.width() * 100,
				y: this._referPoint.y / this._pageShadow.height() * 100
			}
			var b2 = {x: data.sp.x / this._pageShadow.width() * 100, y: data.sp.y / this._pageShadow.height() * 100}
			if (vendor == '-webkit-') {
				//chrome翻页渐变
				this._pageShadow.css('z-index', 8)
					.css('background-image', '-webkit-gradient(linear, ' + this._referPoint.x + ' ' + this._referPoint.y + ', ' + data.sp.x + ' ' + data.sp.y
						+ ', from(rgba(0, 0, 0, 0)),to(rgba(0, 0, 0, 0)), color-stop(0.4, rgba(0,0,0,0)), color-stop(0.5, rgba(0,0,0,' + (0.5 * opacity) + ')), color-stop(0.6, rgba(0,0,0,0)))');

			} else {

				var c0 = {x: b1.x / 100 * this._pageShadow.width(), y: b1.y / 100 * this._pageShadow.height()};
				var c1 = {x: b2.x / 100 * this._pageShadow.width(), y: b2.y / 100 * this._pageShadow.height()};
				var dx = c1.x - c0.x, dy = c1.y - c0.y;
				var bAngle = Math.atan2(dy, dx);
				var angle2 = bAngle - Math.PI / 2,
					diagonal = Math.abs(this._pageShadow.width() * Math.sin(angle2)) + Math.abs(this._pageShadow.height() * Math.cos(angle2)),
					gradientDiagonal = Math.sqrt(dy * dy + dx * dx),
					corner = FB.Point((c1.x < c0.x) ? this._pageShadow.width() : 0, (c1.y < c0.y) ? this._pageShadow.height() : 0),
					slope = Math.tan(bAngle),
					inverse = -1 / slope,
					x = (inverse * corner.x - corner.y - slope * c0.x + c0.y) / (inverse - slope),
					c = {x: x, y: inverse * x - inverse * corner.x + corner.y},
					segA = (Math.sqrt(Math.pow(c.x - c0.x, 2) + Math.pow(c.y - c0.y, 2)));
				/**
				 *兼容除chrome渐变颜色值
				 */
				for (b = 0; b < 3; b++) {
					cols.push(' ' + bColors[b][1] + ' ' + ((segA + gradientDiagonal * bColors[b][0]) * 100 / diagonal) + '%');
				}
				this._pageShadow.css('z-index', 8)
					.css('background-image', '' + vendor + 'linear-gradient( ' + (-bAngle) +
						'rad,rgba(0, 0, 0, 0),rgba(0, 0, 0, 0),' + cols.join(',') + ')');
			}

		}
		var opacity = 1 - Math.abs(data.sp.x - this._referPoint.x) / (this.width * 2);
		// 光效处理
		var hd = 2 * Math.PI / 360 * data.angle;
		var light_SP = {
			x: data.fbCOrigin.x * this.width / 100,
			y: data.fbCOrigin.y * this.height / 100
		};

		var light_EP = {
			x: (data.distance / 2) * Math.cos(hd),
			y: (data.distance / 2) * Math.sin(hd) + ((this._referPoint.direct % 2 != 0) ? this.height : 0)
		};

		if (this._referPoint.direct < 2) {
			light_EP.x = this.width - light_EP.x;
		}


		var colors = [[0.6, 'rgba(0,0,0,0)'], [0.8, 'rgba(0,0,0,' + (0.3 * opacity) + ')'], [1, 'rgba(0,0,0,0)']]

		var p0 = {x: light_SP.x, y: light_SP.y}
		var p1 = {x: light_EP.x, y: light_EP.y}
		var l0 = {x: p0.x / this.width * 100, y: p0.y / this.height * 100}
		var l1 = {x: p1.x / this.width * 100, y: p1.y / this.height * 100}
		var cols = [], cols1 = [];
		if (vendor == '-webkit-') {
			/**
			 *兼容chrome渐变颜色值
			 */
			for (var j = 0; j < 3; j++) {
				cols1.push('color-stop(' + colors[j][0] + ', ' + colors[j][1] + ')');
			}
			cutPage.FBLight.css('background-image',
				'-webkit-gradient(linear, ' +
				l0.x + '% ' +
				l0.y + '%,' +
				l1.x + '% ' +
				l1.y + '%, ' +
				cols1.join(',') + ' )');
			//box-shadow:0 0 10px rgba(0, 204, 204, .5);
		} else {
			var dx = p1.x - p0.x,
				dy = p1.y - p0.y,
				angle = Math.atan2(dy, dx),
				angle2 = angle - Math.PI / 2,
				diagonal = Math.abs(this.width * Math.sin(angle2)) + Math.abs(this.height * Math.cos(angle2)),
				gradientDiagonal = Math.sqrt(dy * dy + dx * dx),
				corner = FB.Point((p1.x < p0.x) ? this.width : 0, (p1.y < p0.y) ? this.height : 0),
				slope = Math.tan(angle),
				inverse = -1 / slope,
				x = (inverse * corner.x - corner.y - slope * p0.x + p0.y) / (inverse - slope),
				c = {x: x, y: inverse * x - inverse * corner.x + corner.y},
				segA = (Math.sqrt(Math.pow(c.x - p0.x, 2) + Math.pow(c.y - p0.y, 2)));
			/**
			 *兼容除chrome渐变颜色值
			 */
			for (var j = 0; j < 3; j++) {
				cols.push(' ' + colors[j][1] + ' ' + ((segA + gradientDiagonal * colors[j][0]) * 100 / diagonal) + '%');
			}
			cutPage.FBLight.css('background-image', '' + vendor + 'linear-gradient(' + (-angle) + 'rad,' + cols.join(',') + ')');
		}


	};

	/**
	 * 获取对角点
	 * @param pointType
	 * @returns {FB.Point}
	 */
	FB.prototype.getDiagonalPoint = function (pointType) {
		var p = new FB.Point(0, 0);
		switch (pointType) {
			case FB.TouchPostion.LeftTop:
				p.x = this.width;
				p.y = this.height;
				break;
			case FB.TouchPostion.LeftBottom:
				p.x = this.width;
				p.y = 0;
				break;
			case FB.TouchPostion.RightTop:
				p.x = this.isSinglePage() ? 0 : this.width;
				p.y = this.height;
				break;
			case FB.TouchPostion.RightBottom:
				p.x = this.isSinglePage() ? 0 : this.width;
				p.y = 0;
				break;
			default :
				p = null;
		}
		return p;
	};

	/**
	 * 获取当前位置在Stage上的坐标
	 * @param e
	 * @returns {FB.Point}
	 */
	FB.prototype.getStagePoint = function (e) {
		var isTouch = e.type.indexOf('touch') != -1;
		var pageX = isTouch ? e.originalEvent.changedTouches[0].pageX : e.pageX,
			pageY = isTouch ? e.originalEvent.changedTouches[0].pageY : e.pageY;
		var offset = this.fbStage.offset();
		return new FB.Point(pageX - offset.left, pageY - offset.top)
	};

	/**
	 * 获取两点之间的距离
	 * @param start
	 * @param end
	 * @returns {number}
	 */
	FB.prototype.getTwoPointLong = function (start, end) {
		var dx = start.x - end.x,
			dy = start.y - end.y;
		return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
	};

	/**
	 * 获取大方块边长
	 * @returns {number|*}
	 */
	FB.prototype.getBigRectWidth = function () {
		if (!this._FBBigRectWidth) {
			this._FBBigRectWidth = Math.sqrt(Math.pow(this.width, 2) + Math.pow(this.height, 2));

		}
		return this._FBBigRectWidth;
	};

	/**
	 * 获取角度
	 * @param start
	 * @param end
	 * @returns {number}
	 */
	FB.prototype.getAngle = function (start, end) {
		var x = start.x - end.x;
		var y = start.y - end.y;
		var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
		if (z == 0) {
			return 0;
		}
		return (Math.asin(y / z) / Math.PI * 180);
	};

	// Gets the CSS3 vendor prefix

	FB.prototype.getPrefix = function () {

		var vendorPrefixes = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'],
			len = vendorPrefixes.length,
			vendor = '';

		while (len--) {
			if ((vendorPrefixes[len] + 'Transform') in document.body.style) {
				vendor = '-' + vendorPrefixes[len].toLowerCase() + '-';
			}
		}
		return vendor;

	}

	/**
	 *翻页开始执行事件
	 */
	FB.prototype.onPageFlipStart = function (n) {

		console.log('1111n',n);
		console.log('aaaa',this);
		var currentIndex = this.currentPageIndex;
		var allIndex = this.allPageCount;
		var index,pageHtml;
		//判断往前还是后翻页
		/*if(this.isNext && (currentIndex +3) < allIndex){
		 index = this.currentPageIndex +3;
		 pageHtml =  this.bookTemplate(index);
		 this.addPage(pageHtml,index)
		 }

		 if(!this.isNext && currentIndex > 2 ){
		 index = this.currentPageIndex -3;
		 pageHtml =  this.bookTemplate(index);
		 this.addPage(pageHtml,index)
		 }*/


		if(this.isNext && (currentIndex+1 < allIndex)) {
			// 从目标页的前一页到后两页
			for(var i= currentIndex;i <= currentIndex + 3;i++){
				// 页码符合规则且该页不存在的时候添加插入页面
				if(i>0 &&i<allIndex && !$('#page' + i)[0]){
					pageHtml = document.createElement('div');
					pageHtml.setAttribute("id","page"+i);
					this.addPage(pageHtml, i);
					$('#page'+i).html(this.bookTemplate(i))
					/*ReactDom.render(React.createElement(PodPage, {
					 handOpenVideo:podC.handOpenVideo.bind(podC),
					 cropOpen:podC.cropOpen.bind(podC),
					 isMySelf:podC.props.isMySelf,
					 handDeleteWxAction:podC.handDeleteWxAction.bind(podC),
					 actions:podC.props.actions,
					 podData: podC.props.podStore.page[i],
					 locationType:podC.props.locationType,
					 podStyle: podStyle,
					 podIndex: i,
					 podBid:podC.props.podBid,
					 podType: podC.props.podStore.type
					 }), document.getElementById("page"+i));*/
				}
			}

		}else if(!this.isNext && (currentIndex-1) >= 0 ){
			for(var i=currentIndex - 1 ;i>= currentIndex - 3;i--){
				if(i>=0 &&  !$('#page' + i)[0]){
					pageHtml = document.createElement('div');
					pageHtml.setAttribute("id","page"+i);
					this.addPage(pageHtml, i);
					$('#page'+i).html(this.bookTemplate(i))
					/*ReactDom.render(React.createElement(PodPage, {
					 handOpenVideo:podC.handOpenVideo.bind(podC),
					 cropOpen:podC.cropOpen.bind(podC),
					 isMySelf:podC.props.isMySelf,
					 handDeleteWxAction:podC.handDeleteWxAction.bind(podC),
					 actions:podC.props.actions,
					 locationType:podC.props.locationType,
					 podData: podC.props.podStore.page[i],
					 podStyle: podStyle,
					 podIndex: i,
					 podBid:podC.props.podBid,
					 podType: podC.props.podStore.type
					 }), document.getElementById("page"+i));*/
				}
			}
		}




		if (this.isNext && currentIndex !== allIndex) {
			this.pageList[currentIndex + 1] && this.pageList[currentIndex + 1].FBPage.css('box-shadow', 'rgba(0, 0, 0, 0.2) 0px 0px 20px');
		} else {
			this.pageList[currentIndex - 2] && this.pageList[currentIndex - 2].FBPage.css('box-shadow', 'rgba(0, 0, 0, 0.2) 0px 0px 20px');
		}

	};
	/**
	 *翻页结束执行事件
	 */
	FB.prototype.onPageFlipEnd = function () {
		var currentIndex = this.currentPageIndex;
		var allIndex = this.allPageCount;
		var index,pageHtml;

		console.log('currentIndex',currentIndex);
		slider.update({
			from: currentIndex
			// etc.
		});
		//判断往前还是后翻页
		/*if(this.isNext && (currentIndex + 2) < allIndex){
		 index = this.currentPageIndex +2;
		 pageHtml =  this.bookTemplate(index);
		 this.addPage(pageHtml,index);
		 if(this.currentPageIndex > 2){
		 this.deletePageDom(this.currentPageIndex -4)
		 this.deletePageDom(this.currentPageIndex -3)
		 }
		 }

		 if(!this.isNext && currentIndex>1){
		 index = this.currentPageIndex - 2;
		 pageHtml =  this.bookTemplate(index);
		 this.addPage(pageHtml,index);
		 if(currentIndex > 0 && currentIndex + 2 < allIndex){
		 this.deletePageDom(this.currentPageIndex +4)
		 this.deletePageDom(this.currentPageIndex +3)
		 }
		 }*/

		/*var removeDom = function (index) {
		 this.deletePageDom(index)
		 };*/
		var j;
		var setZindex = this.isNext ? currentIndex : currentIndex-1;
		//翻页结束后修改当前页面zindex
		this.pageList[setZindex] ? this.pageList[setZindex].css('z-index', 11) : null;
		// 回收页面元素
		for(var i = 0, len = this.pageList.length; i < len; i++){
			if(this.pageList[i] && ((i < currentIndex - 3) || (i > currentIndex + 2)) ){
				this.deletePageDom(i)
			}
		}


		//清除拖动翻页保留页
		if (this.lastPageIndex != null) {
			this.pageList[this.lastPageIndex] && this.pageList[this.lastPageIndex].hide();
			this.lastPageIndex = null;
		}

		if (this.isNext && currentIndex !== 0) {
			this.pageList[currentIndex - 1] && this.pageList[currentIndex - 1].FBPage.css('box-shadow', 'none');
		} else {
			this.pageList[currentIndex] && this.pageList[currentIndex].FBPage.css('box-shadow', 'none');
		}
		this.pageList[currentIndex] && this.pageList[currentIndex].find('img.imgLoading').lazyload({
			effect : "fadeIn"
		});
		this.pageList[currentIndex-1] && this.pageList[currentIndex-1].find('img.imgLoading').lazyload({
			effect : "fadeIn"
		});

	};



	FB.prototype.onPageMissing = function (pageIndex) {
		console.log('pageIndex',pageIndex);
		if(pageIndex >=0 && pageIndex<this.allPageCount &&!$('#page' + pageIndex)[0]){
			var page = document.createElement('div');
			page.setAttribute("id","page" + pageIndex);
			this.addPage(page, pageIndex);
			$("#page"+pageIndex).html(this.bookTemplate(pageIndex))
			/*ReactDom.render(React.createElement(PodPage, {
			 handOpenVideo:podC.handOpenVideo.bind(podC),
			 cropOpen:podC.cropOpen.bind(podC),
			 isMySelf:podC.props.isMySelf,
			 handDeleteWxAction:podC.handDeleteWxAction.bind(podC),
			 actions:podC.props.actions,
			 podData: podC.props.podStore.page[pageIndex],
			 locationType:podC.props.locationType,
			 podStyle: podStyle,
			 podIndex: pageIndex,
			 podBid:podC.props.podBid,
			 podType: podC.props.podStore.type
			 }), document.getElementById("page"+pageIndex));*/
			return this.pageList[pageIndex];
		}
		if($('#page' + pageIndex)[0]) {
			return $('#page' + pageIndex).parents('.FBPage');
		}
	}
	/**
	 *绘制pod模板
	 */
	FB.prototype.bookTemplate = function (n) {

		var podData = this._bookData.podData;
		var data =  this._bookData;
		console.log('this',this.width)
		var pageBox = $('<div class="page"></div>');
		if(data.editUrl && podData[n].content_type != 4&& podData[n].content_type != 5){
			var editBtn = $('<a class="tf_btn" href="'+data.editUrl+ '?page='+n+'&contentType='+podData[n].content_type+'">编辑当前页面</a>');
			editBtn.css({
				position: 'absolute',
				background: 'rgba(0,0,0,.8)',
				color: '#fff',
				fontSize: '14px',
				borderRadius: '4px',
				cursor: 'pointer',
				width: '120px',
				textAlign: 'center',
				height: '30px',
				lineHeight: '30px',
				left: '50%',
				zIndex: '30',
				marginLeft: '-60px',
				top: '50%',
				marginTop: '15px',
				display:'none',
				textDecoration:'none'
			});
			editBtn.appendTo(pageBox);
			$('.FBPage').hover(function () {
				$(this).find('.tf_btn').show();
			},function () {
				$(this).find('.tf_btn').hide();
			})
		}
		if(n>0 && n<data.allPageCount && this._bookData.isSinglePage){
			if(n%2){
				pageBox.addClass('even')
			}else{
				pageBox.addClass('odd')
			}
		}

		/**
		 *设置文字居中居左居右
		 * @param ops
		 * @returns {*}
		 */
		function fontAlign(ops){
			switch(ops){
				case 1:
					return 'left';
				case 2:
					return 'right';
				case 3:
					return 'center';
			}
		}
		//得到图片自身的旋转
		function getOrientationRotation(orientation) {
			switch (orientation) {
				case 3:
					return 180;
				case 6:
					return 90;
				case 8:
					return 270;
				default:
					return 0;
			}
		}


		function canvasImages(imgUrl,maskUrl,svgIndex,imageMetaData,imageStyle,pageBgWidth,pageBgHeight) {
			var loadImg = new Image();
			loadImg.src = imgUrl + '@70q.jpg'
			loadImg.onload = function () {
				var canvas = document.getElementById('imageCanvas'+svgIndex);
				var img = document.getElementById('image'+svgIndex);
				var imgMask = document.getElementById('imageMask'+svgIndex);

				//获取图片的高宽
				var w = imageStyle.width;
				var h = imageStyle.height;
				//获取遮罩图片的高宽
				var mw = pageBgWidth;
				var mh = pageBgHeight;
				var rot = imageMetaData.image_content_expand.image_rotation + getOrientationRotation(imageMetaData.image_content_expand.image_orientation);
				if(rot == 90 || rot == 270){
					h = imageStyle.width;
					w = imageStyle.height;
				}
				//角度转为弧度
				var rotation = Math.PI * rot / 180;
				var c = Math.round(Math.cos(rotation) * 1000) / 1000;
				var s = Math.round(Math.sin(rotation) * 1000) / 1000;
				//绘图开始
				var context = canvas.getContext("2d");
				context.save();
				//旋转后canvas标签的大小
				canvas.height = Math.abs(c * h) + Math.abs(s * w);
				canvas.width = Math.abs(c * w) + Math.abs(s * h);
				// 放在改变旋转中心点之前绘制遮罩
				if(imgMask){
					var maskImg = new Image();
					maskImg.src = maskUrl
					maskImg.onload = function () {
						context.drawImage(maskImg, 0, 0, mw, mh);
						context.globalCompositeOperation = 'source-atop';
						drawImage(canvas,context,rotation,rot,imageStyle,loadImg,w,h,s,c)

					}
				}else{
          drawImage(canvas,context,rotation,rot,imageStyle,loadImg,w,h,s,c)
				}
			}

		}

		function drawImage(canvas,context,rotation,rot,imageStyle,loadImg,w,h,s,c) {
      //改变中心点
      if (rotation <= Math.PI / 2) {
        context.translate(s * h, 0);
      } else if (rotation <= Math.PI) {
        context.translate(canvas.width, -c * h);
      } else if (rotation <= 1.5 * Math.PI) {
        context.translate(-c * w, canvas.height);
      } else {
        context.translate(0, -s * w);
      }
      //旋转
      context.rotate(rotation);
      var top,left;
      //绘制cover
      switch (rot){
        case 90:
          top = imageStyle.top;
          left = -imageStyle.left;
          break;
        case 180:
          top = -imageStyle.left;
          left = -imageStyle.top;
          break;
        case 270:
          top = -imageStyle.top;
          left = imageStyle.left;
          break;
        default:
          top = imageStyle.left;
          left = imageStyle.top;
          break;
      }
      context.drawImage(loadImg, top, left, w, h);
      context.restore();
    }

		function handlePostionXY(imageMetaData,data) {
			//显示区域的大小
			var width = imageMetaData.element_width - imageMetaData.element_content_left - imageMetaData.element_content_right;
			var height = imageMetaData.element_height - imageMetaData.element_content_top - imageMetaData.element_content_bottom;
			//图片的宽高     //旋转就调换宽高
			var oWidth = imageMetaData.image_content_expand.image_height;
			var oHeight = imageMetaData.image_content_expand.image_width;
			//要显示图片的大小
			var scale, x1, y1, ox, oy, oScale;
			// 居中裁剪方式
			if ((oWidth / oHeight) > (width / height)) {// 宽度超过，以高度为准
				scale = (height / oHeight).toFixed(2);
			} else {// 高度超过，以宽度为准
				scale = (width / oWidth).toFixed(2);
			}

			//旋转后的高宽
			var rotated_width = oHeight * scale * data.ratioWidth;
			var rotated_height = oWidth * scale * data.ratioHeight;

			// 0度时候 得到其居中裁剪的值
			if ((oHeight / oWidth) > (width / height)) {// 宽度超过，以高度为准
				oScale = (height / oWidth).toFixed(2);
				oy = 0;
				ox = -(oHeight * oScale - width) / 2;
			} else {// 高度超过，以宽度为准
				oScale = (width / oHeight).toFixed(2);
				ox = 0;
				oy = -(oWidth * oScale - height) / 2;
			}

			//原始的高宽
			var original_width = oHeight * oScale * data.ratioWidth;
			var original_height = oWidth * oScale * data.ratioHeight;

			//计算偏移量
			var dx = (rotated_width - original_width) / 2;
			var dy = (rotated_height - original_height) / 2;
			x1 = -(dx + Math.abs(ox));
			y1 = -(dy + Math.abs(oy));
			return {x: x1, y: y1}
		}
		/**
		 *绘制pod内页元素
		 */
		console.log('n111',n);
		if(podData[n].element_list.length>0){
			for(var j=0; j<podData[n].element_list.length;j++){
				var liStyle = podData[n].element_list[j];
				var pageList = $('<div class="page_center_list podPage_'+n+'"></div>');
				var imgBox = $('<div class="imgBox"></div>');
				var pageImg = $('<img class="imgLoading"  />');
				var pageCanvasImg = $('<div></div>');
				var imageCfig = liStyle.image_content_expand;
				var imageRotation = imageCfig.image_rotation;

				var rotation = imageCfig.image_rotation + getOrientationRotation(imageCfig.image_orientation);
				var boxWidth = Math.floor(liStyle.element_width*data.ratioWidth);
				var boxHeight =Math.floor(liStyle.element_height*data.ratioHeight);
				var pageBgWidth = liStyle.element_width - (liStyle.element_content_left+liStyle.element_content_right+imageCfig.image_padding_left)* data.ratioWidth;
				var pageBgHeight =  liStyle.element_height-(liStyle.element_content_top+liStyle.element_content_bottom+imageCfig.image_padding_top)* data.ratioHeight;
				var imgData = {};
				pageList.css({
					width:boxWidth < 1 ? 1: boxWidth,
					height:boxHeight < 1 ? 1: boxHeight,
					'position': 'absolute',
					'top':liStyle.element_top*data.ratioHeight,
					'left':liStyle.element_left*data.ratioWidth,
					'overflow':'hidden',
					'backgroundImage':liStyle.element_background ? 'url('+liStyle.element_background+')' : 'none',
					'backgroundSize':'100% 100%',
					'zIndex':liStyle.element_depth,
					'transform':'rotate('+liStyle.element_rotation +'deg)'
				});
				if(liStyle.element_mask_image){
			/*		var svgWidth = liStyle.element_width*data.ratioWidth - (liStyle.element_content_left+liStyle.element_content_right+imageCfig.image_padding_left)* data.ratioWidth
					var svgHeight =  liStyle.element_height*data.ratioHeight-(liStyle.element_content_top+liStyle.element_content_bottom+imageCfig.image_padding_top)* data.ratioHeight
					var svgTransform =  'rotate(' + imageRotation + ' ' + (svgWidth/2) + ' ' + (svgHeight/2) +')';
					var top = (imageCfig.image_padding_top + imageCfig.image_start_point_y) * data.ratioHeight;
					var left = (imageCfig.image_padding_left + imageCfig.image_start_point_x ) * data.ratioWidth;

					var imageWidth = imageCfig.image_width * imageCfig.image_scale * data.ratioWidth;
					var imageHeight = imageCfig.image_height * imageCfig.image_scale * data.ratioHeight;

          if(rotation == 90 || rotation == 270) {
            imageWidth = imageCfig.image_height * imageCfig.image_scale * data.ratioHeight;
            imageHeight = imageCfig.image_width * imageCfig.image_scale * data.ratioWidth;
          }



					var imgBox1=$("<svg id='svg_mask_wrap"+n+"' width='"+svgWidth+"' height='"+svgHeight+"' baseProfile='full' version='1.2'>" +
					"<defs><mask id='svg_mask_"+n+"' maskUnits='userSpaceOnUse' maskContentUnits='userSpaceOnUse'" +
					"transform='scale(1)'><image fill='black' width='"+svgWidth+"' height='"+svgHeight+"' xlink:href='" +
						liStyle.element_mask_image+"' /></mask></defs><image mask='url(#svg_mask_"+n+")'  y='"+top +"' x='"+left +"' " +
					"width='"+imageWidth+"' height='"+imageHeight+"'  xlink:href='" +
						liStyle.image_content_expand.image_url+"' /><rect mask='url(#svg_mask_"+n+")' x='0' y='0' width='100%' height='100%'  class='svg_hover_style'  fill='#000000' opacity='0'/></svg>");
					imgBox1.appendTo(imgBox);*/
				}else{

				}
				imgBox.css({
					'top':Math.floor(liStyle.element_content_top*data.ratioWidth),
					'left':Math.floor(liStyle.element_content_left*data.ratioHeight),
					'right':Math.floor(liStyle.element_content_right*data.ratioHeight),
					'bottom':Math.floor(liStyle.element_content_bottom*data.ratioWidth),
					'position': 'absolute',
					'overflow':'hidden'
				});
				imgBox.appendTo(pageList)
				switch (liStyle.element_type){
					case 1:
						if(!liStyle.element_deleted){
						if(!liStyle.element_content){
							pageList.css({
								display:'none'
							})
						}

							if(rotation == 90 || rotation == 270){
								imgData.width = Math.floor(imageCfig.image_height *data.ratioHeight)* imageCfig.image_scale;
								imgData.height = Math.floor(imageCfig.image_width *data.ratioWidth)* imageCfig.image_scale;
							}else{
								imgData.width = Math.floor(imageCfig.image_width *data.ratioWidth)* imageCfig.image_scale;
								imgData.height = Math.floor(imageCfig.image_height *data.ratioHeight)* imageCfig.image_scale;
							}
							//图片样式
							var imageStyle = {
								width:imgData.width,
								height:imgData.height,
								top:Math.floor((imageCfig.image_padding_top + imageCfig.image_start_point_y)) *data.ratioHeight,
								left:Math.floor((imageCfig.image_padding_left + imageCfig.image_start_point_x ))*data.ratioWidth,
								position: 'absolute'

							};
							var svgIndex = j + liStyle.element_mask_image  + imageCfig.image_url+n;

							if(liStyle.element_mask_image){
								var hideImageHtml = $('<img style="display: none;" crossorigin="anonymous" id="imageMsk'+svgIndex+'" src="'+liStyle.element_mask_image+'" />')
								hideImageHtml.appendTo(imgBox)
							}


							var canvasHtml = $('<canvas id="imageCanvas'+svgIndex+'" ></canvas>');
							canvasHtml.appendTo(imgBox)

							if(liStyle.element_mask_image) {
								var maskHtml = $('<img style="visibility:hidden" crossorigin="anonymous" id="imageMask'+svgIndex+'" src="'+liStyle.element_mask_image+'"} />');
								maskHtml.appendTo(imgBox)
							}

							var imageHtml = $('<img  style="visibility:hidden" id="image'+svgIndex+'" crossorigin="anonymous" src="'+imageCfig.image_url+'@70q.jpg" />')
							imageHtml.css(imageStyle)
							imageHtml.appendTo(imgBox)

							canvasImages(imageCfig.image_url,liStyle.element_mask_image,svgIndex,liStyle,imageStyle,pageBgWidth,pageBgHeight)
						if(!liStyle.element_mask_image){


						/*	if(liStyle.element_mask_image){
								var hideImageHtml = $('<img style="display: none;" crossorigin="anonymous" id="imageMsk '+svgIndex+'" src="'+liStyle.element_mask_image+'" />')
								hideImageHtml.appendTo(pageCanvasImg)
							}
							var imageHtml = $('<img  style="display: none;" id="image'+svgIndex+'" crossorigin="anonymous" src="'+imageCfig.image_url+'" />')
							imageHtml.css(imageStyle)*/
							//imageHtml.attr('onload',canvasImages.bind(this,svgIndex,liStyle,imageStyle,pageBgWidth,pageBgHeight))


							/*pageImg.attr({
								'data-original':imageCfig.image_url
							});

              if(rotation == 90 || rotation == 270){
                imgData.width = Math.floor(imageCfig.image_height *data.ratioHeight)* imageCfig.image_scale;
                	imgData.height = Math.floor(imageCfig.image_width *data.ratioWidth)* imageCfig.image_scale;
                }else{
                	imgData.width = Math.floor(imageCfig.image_width *data.ratioWidth)* imageCfig.image_scale;
                	imgData.height = Math.floor(imageCfig.image_height *data.ratioHeight)* imageCfig.image_scale;
                }
							pageImg.css({
								width:imgData.width,
								height:imgData.height,
								'top':Math.floor((imageCfig.image_padding_top + imageCfig.image_start_point_y)) *data.ratioHeight,
								'left':Math.floor((imageCfig.image_padding_left + imageCfig.image_start_point_x ))*data.ratioWidth,
								'position': 'absolute'
								/!*'transform':'rotate('+imageRotation +'deg)'*!/
							});*/
							//imageHtml.appendTo(pageCanvasImg)



							}
						}
						break;
					case 5:
						if(!liStyle.element_deleted) {
						pageImg.attr({
							'data-original':imageCfig.image_url
						});
              var gWidth =Math.floor(Math.floor(imageCfig.image_width *data.ratioWidth)* imageCfig.image_scale);
              var gHeight = Math.floor(Math.floor(imageCfig.image_height *data.ratioHeight)* imageCfig.image_scale);
						pageImg.css({
							width:gWidth <1 ? 1: gWidth,
							height:gHeight < 1 ? 1:gHeight,
							'top':Math.floor((imageCfig.image_padding_top + imageCfig.image_start_point_y)*data.ratioHeight),
							'left':Math.floor((imageCfig.image_padding_left + imageCfig.image_start_point_x )*data.ratioWidth),
							'position': 'absolute'
						});


							pageImg.appendTo(imgBox)
						}
						break;
					case 2:
						console.log('liStyle',liStyle);
						if(!liStyle.element_deleted) {
						pageImg.attr({
							'data-original':imageCfig.image_url
						});
						pageImg.css({
							width:Math.floor(imageCfig.image_width *data.ratioWidth)* imageCfig.image_scale,
							height:Math.floor(imageCfig.image_height* data.ratioHeight)* imageCfig.image_scale,
							'top':(imageCfig.image_padding_top + imageCfig.image_start_point_y)*data.ratioHeight,
							'left':(imageCfig.image_padding_left + imageCfig.image_start_point_x )*data.ratioWidth,
							'position': 'absolute'
						});

							pageImg.appendTo(imgBox)
						}
						break;
				}
			/*	pageImg.lazyload({
					effect : "fadeIn"
				});*/
				pageList.appendTo(pageBox)


			}
		}




		return pageBox.css({
			'background-image':'url('+podData[n].page_image+')',
			'background-color':podData[n].page_color,
			'background-size':100+'%',
			'width':data.width+'px',
			'height':data.height+'px',
			'position':'relative'
		});
	};


	/*初始化渲染*/
	FB.prototype.initTemplate = function (index) {
		var data =  this._bookData;
		var that = this;
		console.log('that.zoomScale',that.zoomScale);
		$('#bookShadow').css({
			width:data.width+'px',
			height:data.height+'px'
		})
		$('#main,#pageList').css({
			width:data.width *2+'px',
			height:data.height +'px'
		})

		var pageHtml =  this.bookTemplate(index);
		var appenDom = this._bookData.container;
		pageHtml.appendTo(appenDom);
		$('img.imgLoading').lazyload({
			effect : "fadeIn"
		});

		setTimeout(function () {
			$('.FBPage').hover(function () {
				$(this).find('.tf_btn').show();
			},function () {
				$(this).find('.tf_btn').hide();
			})
		},100)



	};
	/**
	 *po拖动翻页
	 */
	FB.prototype.initSilider = function () {
		var podBox = this._bookData;
		var that = this;
		 var silider = $('<div class="range_slider" >' +
			 '<input type="text" id="example_id" name="example_name" value="" />' +
			 '</div>');
		 silider.appendTo('#main');
		 var selector = '[data-rangeSlider]',
		 elements = document.querySelectorAll(selector);
		var sp;
		$("#example_id").ionRangeSlider({
			min:0,
			max:podBox.allPageCount -1,
			from:0,
			type:'single',

			onChange:function (data) {
				//console.log(2,data)

			},
			onFinish:function (data) {
				console.log('that',that.ratioHeight);
				var value =  data.from;
				var isNext = value > that.currentPageIndex ? true : false;
				var currNum;
				if(isNext){
					if(value -that.currentPageIndex == 1){
						currNum = value;
					}else{
						currNum = value-1;
					}


				}else{
					//console.log('减法',value -fb.currentPageIndex);
					if(value -that.currentPageIndex == -1 || value -that.currentPageIndex == -2){
						currNum = value+1
					}else{
						currNum = value +2
					}

				}

				if(that.zoomScale ==1){
					sp = {
						x:isNext ? that.width *2 - 100  : 100 * that.ratioWidth,
						y:that.height - (150 * that.ratioHeight)
					};
				}else{
					sp = {
						x:isNext ? that.width - (100 *that.zoomScale) : 100 * that.zoomScale,
						y:that.height - (150 * that.zoomScale)
					};
				}

				//fb.currentPageIndex == value ? null : fb.keyTouch(sp);
				if (that.currentPageIndex != value  && that.currentPageIndex != currNum) {
					//保留上次页码
					that.lastPageIndex = that.currentPageIndex;
					//只翻偶数页
					if(currNum % 2 > 0 && that.zoomScale ==1){
						isNext ? that.currentPageIndex = currNum - 1 : that.currentPageIndex = currNum + 1;
					}else{
						if(value == 0){
							that.currentPageIndex = that.zoomScale ==1 ? value +2 :value +1
						}else if(value == podBox.allPageCount){
							that.currentPageIndex = that.zoomScale ==1 ? value -2 :value -1
						}else{
							that.currentPageIndex = currNum
						}
					}
					that.keyTouch(sp);
				}
			},
			prettify:function (num) {

				if(num ==0){
					return '封面'
				}else if(num == podBox.allPageCount-1){
					return '封底'
				} else{
					console.log('页面样式',that._bookData)
					var bookData = that._bookData.podData;
					if(bookData[num].content_type == 8){
						return '扉页'
					}else if(bookData[num].content_type == 9){
						return '寄语'
					}else if(bookData[num].content_type == 4){
						return '封面'
					}else if(bookData[num].content_type == 5){
						return '封底'
					}else{
						return num - that.startIndex + 1;
					}

				}
			}
		});
		window.slider = $("#example_id").data("ionRangeSlider");
	}
	/**
	 *左右翻页
	 */
	FB.prototype.aboutFlip = function (ops) {
		var xPercent = window.innerWidth / this.width,
			yPercent = window.innerHeight / this.height;
    console.log('this.isSinglePage()',this.isSinglePage())
		var is_sing_page = this.isSinglePage() ? 1:2;
		if(ops == 'next'){
			var sp = {
				x:(this.width  *is_sing_page - (100*this.ratioHeight)),
				y: this.height -(150  *this.ratioHeight)
			};
			this.keyTouch(sp);
		}

		if(ops == 'previous'){
			var sp = {
				x:100 * this.ratioWidth,
				y: this.height -(150  *this.ratioHeight)
			};
			this.keyTouch(sp);
		}
	}
	window.Timeface = window.Timeface || {};
	Timeface.FlipBook = FB;
})();
