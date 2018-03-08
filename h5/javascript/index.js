/**
 * 文件说明: 浏览器兼容提示公共js
 * 详细描述:
 * 创建者: ycl
 * 创建时间: 2017/5/26
 * 变更记录:
 */

(function () {
  function clean() {
    debugger
    var lodHtml = document.getElementById("browser_ie");
    lodHtml.parentNode.removeChild(lodHtml);
  }


  var browser = "<div style='width: 100%; height: 100%; background: #eaeaea; position: fixed; text-align: center'>" +
    "<div style='width: 1000px; height: auto;display: inline-block;margin: 0px auto; margin-top: 6%'>" +
    "<div><img src='http://img1.timeface.cn/common/ie_enable.png'/></div>" +
    "<div style='width:1000px;font-size: 37px; display: inline-block; color: #000000'>对不起，本站不支持Internet Explorer 9及以下版本的浏览器为了更好的浏览网站，建议您使用以下浏览器</div>" +
    "<div style='width: 1000px; height: 23px; display: inline-block; margin-top: 20px'>" +
    "<a style='height:23px; padding-left: 28px; background:url(http://img1.timeface.cn/common/ie_enable_box.png) 0px 0px no-repeat;color: #2e2e2e; text-decoration: none' href='http://se.360.cn' target='_blank'>360安全浏览器</a>" +
    "<a style='margin-left:15px;height:23px; padding-left: 28px; background:url(http://img1.timeface.cn/common/ie_enable_box.png) -153px 0px no-repeat;color: #2e2e2e; text-decoration: none' href='http://chrome.360.cn' target='_blank'>360极速浏览器</a>" +
    "<a style='margin-left:15px;height:23px; padding-left: 28px; background:url(http://img1.timeface.cn/common/ie_enable_box.png) -304px 0px no-repeat;color: #2e2e2e; text-decoration: none' href='http://browser.qq.com' target='_blank'>QQ浏览器</a>" +
    "<a style='margin-left:15px;height:23px; padding-left: 28px; background:url(http://img1.timeface.cn/common/ie_enable_box.png) -432px 0px no-repeat;color: #2e2e2e; text-decoration: none' href='http://down.tech.sina.com.cn/content/40975.html' target='_blank'>chrome</a>" +
    "<a style='margin-left:15px;height:23px; padding-left: 28px; background:url(http://img1.timeface.cn/common/ie_enable_box.png) -541px 0px no-repeat;color: #2e2e2e; text-decoration: none' href='http://www.uc.cn' target='_blank'>UC浏览器</a>" +
    "<a style='margin-left:15px;height:23px; padding-left: 28px; background:url(http://img1.timeface.cn/common/ie_enable_box.png) -660px 0px no-repeat;color: #2e2e2e; text-decoration: none' href='http://www.liebao.cn/download.html' target='_blank'>猎豹浏览器</a>" +
    "<a style='margin-left:15px;height:23px; padding-left: 28px; background:url(http://img1.timeface.cn/common/ie_enable_box.png) -787px 0px no-repeat;color: #2e2e2e; text-decoration: none' href='http://windows.microsoft.com/zh-cn/internet-explorer/download-ie' target='_blank'>Internet Explorer 11</a>" +
    "</div>" +
    "</div>" +
    "</div>";


  setTimeout(function() {
      var tf = document.getElementsByTagName("body")[0];
      tf.innerHTML = browser;
    },
    100),
    window.browser = {
      close:clean
    }



})()

