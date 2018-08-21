let app = getApp();
let WxParse = require('../../wxParse/wxParse.js');
let util = require('../../utils/util.js')
Page({
    data: {},
    onLoad: function (options) {
        let that = this;
        util.request({
            url: '/notice/detail',
            data: {id: options.id},
            success: function (res) {
                if (res.data.code == 0) {
                    that.setData({notice: res.data.data});
                    WxParse.wxParse('article', 'html', res.data.data.content, that, 5);
                }
            }
        })
    },
    onReady: function () {
    },
    onShow: function () {
    },
    onHide: function () {
    },
    onUnload: function () {
    },
    onPullDownRefresh: function () {
    },
    onReachBottom: function () {
    },
    onShareAppMessage: function () {
    }
})