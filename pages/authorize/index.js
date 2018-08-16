// pages/authorize/index.js
var app = getApp();
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
        wx.setStorageSync('userInfo', e.detail.userInfo);
        this.login();
    },
    login: function () {
        let that = this;
        let token = wx.getStorageSync('token');
        if (token) {
            wx.request({
                url: app.globalData.urlPrefix + '/member/check-token', data: {token: token},
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
                wx.request({
                    url: app.globalData.urlPrefix + '/member/login', data: {code: res.code},
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
                        // 回到原来的地方放
                        wx.navigateBack();
                    }
                })
            }
        })
    },
    registerUser: function () {
        var that = this;
        wx.login({
            success: function (res) {
                var code = res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
                wx.getUserInfo({
                    success: function (res) {
                        wx.request({
                            url: app.globalData.urlPrefix + '/member/register', data: {code: code, rawData: res.rawData, iv: res.iv},
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