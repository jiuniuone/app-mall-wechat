var wxpay = require('../../../utils/pay.js');
var app = getApp();
Page({
    data: {
        statusType: ["待付款", "待发货", "待收货", "待评价", "已完成"],
        currentType: 0,
        tabClass: ["", "", "", "", ""]
    },
    statusTap: function (e) {
        var curType = e.currentTarget.dataset.index;
        this.data.currentType = curType
        this.setData({
            currentType: curType
        });
        this.onShow();
    },
    orderDetail: function (e) {
        var orderId = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: "/pages/order/details/index?id=" + orderId
        })
    },
    cancelOrderTap: function (e) {
        var that = this;
        var orderId = e.currentTarget.dataset.id;
        wx.showModal({
            title: '确定要取消该订单吗？',
            content: '',
            success: function (res) {
                if (res.confirm) {
                    wx.showLoading();
                    wx.request({
                        url: app.globalData.urlPrefix + '/order/close',
                        data: {
                            token: wx.getStorageSync('token'),
                            id: orderId
                        },
                        success: (res) => {
                            wx.hideLoading();
                            if (res.data.code == 0) {
                                that.onShow();
                            }
                        }
                    })
                }
            }
        })
    },
    toPayTap: function (e) {
        var that = this;
        var orderId = e.currentTarget.dataset.id;
        var money = e.currentTarget.dataset.money;
        var needScore = e.currentTarget.dataset.score;
        wx.request({
            url: app.globalData.urlPrefix + '/user/amount',
            data: {
                token: wx.getStorageSync('token')
            },
            success: function (res) {
                if (res.data.code == 0) {
                    // res.data.data.balance
                    money = money - res.data.data.balance;
                    if (res.data.data.score < needScore) {
                        wx.showModal({
                            title: '错误',
                            content: '您的积分不足，无法支付',
                            showCancel: false
                        })
                        return;
                    }
                    if (money <= 0) {
                        // 直接使用余额支付
                        wx.request({
                            url: app.globalData.urlPrefix + '/order/pay',
                            method: 'POST',
                            header: {
                                'content-type': 'application/x-www-form-urlencoded'
                            },
                            data: {
                                token: wx.getStorageSync('token'),
                                orderId: orderId
                            },
                            success: function (res2) {
                                that.onShow();
                            }
                        })
                    } else {
                        wxpay.wxpay(app, money, orderId, "/pages/order/list/index");
                    }
                } else {
                    wx.showModal({
                        title: '错误',
                        content: '无法获取用户资金信息',
                        showCancel: false
                    })
                }
            }
        })
    },
    getOrderStatistics: function () {
        var that = this;
        wx.request({
            url: app.globalData.urlPrefix + '/order/statistics',
            data: {token: wx.getStorageSync('token')},
            success: (res) => {
                wx.hideLoading();
                if (res.data.code == 0) {
                    let tabClass = that.data.tabClass;
                    let data = res.data.data;
                    tabClass[0] = data.count_id_no_pay > 0 ? "red-dot" : "";
                    tabClass[1] = data.count_id_no_transfer > 0 ? "red-dot" : "";
                    tabClass[2] = data.count_id_no_confirm > 0 ? "red-dot" : "";
                    tabClass[3] = data.count_id_no_reputation > 0 ? "red-dot" : "";
                    that.setData({
                        tabClass: tabClass,
                    });
                }
            }
        })
    },
    onShow: function () {
        wx.showLoading();
        var that = this;
        this.getOrderStatistics();
        wx.request({
            url: app.globalData.urlPrefix + '/order/list', data: {token:wx.getStorageSync('token'),status:that.data.currentType},
            success: (res) => {
                wx.hideLoading();
                let orders = res.data.code == 0 ? res.data.data : null;
                that.setData({orders: orders})
            }
        })

    }
});
