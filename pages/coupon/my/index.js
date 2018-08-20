var util = require('../../../utils/util.js')
var app = getApp()
Page({
    data: {
        coupons: []
    },
    onLoad: function () {
    },
    onShow: function () {
        this.getMyCoupons();
    },
    getMyCoupons: function () {
        var that = this;
        util.request({
            url: '/discounts/my',
            data: {token: util.getStorageSync('token'),},
            success: function (res) {
                if (res.data.code == 0) {
                    var coupons = res.data.data;
                    if (coupons.length > 0) {
                        that.setData({coupons: coupons});
                    }
                }
            }
        })
    },
    goBuy: function () {
        wx.reLaunch({url: '/pages/index/index'})
    }

})
