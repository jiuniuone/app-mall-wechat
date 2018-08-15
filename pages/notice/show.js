var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
Page({
    data: {},
    onLoad: function (options) {
        var that = this;
        wx.request({
            url: app.globalData.urlPrefix + '/notice/detail',
            data: {id: options.id},
            success: function (res) {
                if (res.data.code == 0) {
                    that.setData({notice: res.data.data});
                    WxParse.wxParse('article', 'html', res.data.data.content, that, 5);
                }
            }
        })
    },
    onReady: function () { },
    onShow: function () {},
    onHide: function () {},
    onUnload: function () {},
    onPullDownRefresh: function () {},
    onReachBottom: function () {},
    onShareAppMessage: function () {}
})