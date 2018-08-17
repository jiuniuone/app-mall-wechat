const app = getApp();
var util = require('../../utils/util.js');
Page({
    data: {
        balance: 0,
        freeze: 0,
        score: 0,
        score_sign_continuous: 0
    },
    onLoad() {
    },
    onShow() {
        let that = this;
        let member = wx.getStorageSync('member')
        if (!member) {
            wx.navigateTo({url: "/pages/authorize/index"});
        } else {
            that.setData({member: member, version: app.globalData.version});
        }
        this.loadMember();
    },
    aboutUs: function () {
        wx.showModal({
            title: '关于我们',
            content: '深圳市某某科技有限公司出品',
            showCancel: false
        })
    },
    getPhoneNumber: function (e) {
        if (!e.detail.errMsg || e.detail.errMsg != "getPhoneNumber:ok") {
            wx.showModal({title: '提示', content: '无法获取手机号码', showCancel: false})
            return;
        }
        var that = this;
        wx.request({
            url: app.globalData.urlPrefix + '/user/wxapp/bindMobile',
            data: {
                token: wx.getStorageSync('token'),
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv
            },
            success: function (res) {
                if (res.data.code == 0) {
                    wx.showToast({
                        title: '绑定成功',
                        icon: 'success',
                        duration: 2000
                    })
                    that.getUserApiInfo();
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '绑定失败',
                        showCancel: false
                    })
                }
            }
        })
    },
    loadMember: function () {
        var that = this;
        wx.request({
            url: app.globalData.urlPrefix + '/member/detail', data: {token: wx.getStorageSync('token')},
            success: function (res) {
                if (res.data.code == 0) {
                    var member = res.data.data;
                    that.setData({member: member});
                }
            }
        })

    },
    scoresign: function () {
        var that = this;
        wx.request({
            url: app.globalData.urlPrefix + '/member/sign', data: {token: wx.getStorageSync('token')},
            success: function (res) {
                if (res.data.code == 0) {
                    that.loadMember();
                } else {
                    util.alert('错误', res.data.message);
                }
            }
        })
    },
    relogin: function () {
        wx.navigateTo({url: "/pages/authorize/index"});
    },
    recharge: function () {
        wx.navigateTo({url: "/pages/recharge/index"});
    },
    withdraw: function () {
        wx.navigateTo({url: "/pages/withdraw/index"});
    }
});