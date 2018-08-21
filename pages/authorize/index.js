let util = require('../../utils/util.js')
let app = getApp();
Page({
    data: {},
    onLoad: function (options) {
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
    },
    bindGetUserInfo: function (e) {
        if (!e.detail.userInfo) {
            return;
        }
        wx.setStorageSync('member', e.detail.userInfo);
        this.login();
    },
    login: function () {
        let that = this;
        let token = util.getStorageSync('token');
        if (token) {
            util.request({
                url: '/member/check-token', data: {token: token},
                success: function (res) {
                    if (res.data.code == 0) {
                        wx.navigateBack();
                    } else {
                        wx.removeStorageSync('token');
                        that.login();
                    }
                }
            })
            return;
        }
        wx.login({
            success: function (res) {
                util.request({
                    url: '/member/login', data: {code: res.code},
                    success: function (res) {
                        if (res.data.code == 10000) { // 去注册
                            that.registerUser();
                            return;
                        }
                        if (res.data.code != 0) { // 登录错误
                            wx.hideLoading();
                            wx.showModal({title: '提示', content: '无法登录，请重试', showCancel: false});
                            return;
                        }
                        wx.setStorageSync('token', res.data.data.token)
                        wx.setStorageSync('uid', res.data.data.uid)
                        wx.navigateBack();
                    }
                })
            }
        })
    },
    registerUser: function () {
        let that = this;
        wx.login({
            success: function (res) {
                let code = res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
                wx.getUserInfo({
                    success: function (res) {
                        util.request({
                            url: '/member/register', data: {code: code, rawData: res.rawData, iv: res.iv},
                            success: (res) => {
                                wx.hideLoading();
                                if (res.data.code == 0) {
                                    that.login();
                                } else {
                                    wx.showModal({title: '提示', content: '无法登录，请重试', showCancel: false});
                                }
                            }
                        })
                    }
                });
            }
        });
    }
});