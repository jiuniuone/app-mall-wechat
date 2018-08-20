let wxpay = require('../../../utils/pay.js');
let util = require('../../../utils/util.js');
let app = getApp();
Page({
    data: {
        statusType: ["待付款", "待发货", "待收货", "待评价", "已完成"],
        currentType: 0,
        tabClass: ["", "", "", "", ""]
    },
    statusTap: function (e) {
        let curType = e.currentTarget.dataset.index;
        this.data.currentType = curType
        this.setData({
            currentType: curType
        });
        this.onShow();
    },
    orderDetail: function (e) {
        let orderId = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: "/pages/order/detail/index?id=" + orderId
        })
    },
    cancelOrderTap: function (e) {
        let that = this;
        let orderId = e.currentTarget.dataset.id;
        wx.showModal({
            title: '确定要取消该订单吗？',
            content: '',
            success: function (res) {
                if (res.confirm) {
                    wx.showLoading();
                    util.request({
                        url: '/order/close',
                        data: {
                            token: util.getStorageSync('token'),
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
        let that = this;
        let order = e.currentTarget.dataset;
        console.log("order", e.currentTarget)
        let orderId = order.id;
        let money = order.money;
        util.request({
            url:   '/member/detail', data: {token: util.getStorageSync('token')},
            success: function (res) {
                if (res.data.code == 0) {
                    let member = res.data.data;
                    money = money - member.balance;
                    if (money <= 0) {
                        util.request({
                            url:   '/order/pay/balance',
                            method: 'POST',
                            header: {'content-type': 'application/x-www-form-urlencoded'},
                            data: {token: util.getStorageSync('token'), orderId: orderId},
                            success: function (payResponse) {
                                that.onShow();
                            }
                        })
                    } else {
                        wxpay.wxpay(app, money, orderId, "/pages/order/list/index");
                    }
                } else {
                    util.alert('错误', '无法获取用户资金信息');
                }
            }
        })
    },
    getOrderStatistics: function () {
        let that = this;
        util.request({
            url:   '/order/statistics',
            data: {token: util.getStorageSync('token')},
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
        let that = this;
        this.getOrderStatistics();
        util.request({
            url:   '/order/list',
            data: {token: util.getStorageSync('token'), status: that.data.currentType},
            success: (res) => {
                wx.hideLoading();
                let orders = res.data.code == 0 ? res.data.data : null;
                that.setData({orders: orders})
            }
        })

    }
});
