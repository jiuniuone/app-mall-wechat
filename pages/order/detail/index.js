var util = require('../../../utils/util.js');
var app = getApp();
Page({
    data: {
        orderId: 0,
        productList: [],
        yunPrice: "0.00"
    },
    onLoad: function (e) {
        var orderId = e.id;
        this.data.orderId = orderId;
        this.setData({
            orderId: orderId
        });
    },
    onShow: function () {
        var that = this;
        util.request({
            url: '/order/detail',
            data: {
                token: util.getStorageSync('token'),
                id: that.data.orderId
            },
            success: (res) => {
                wx.hideLoading();
                if (res.data.code != 0) {
                    util.alert("错误", res.data.message);
                } else {
                    that.setData({order: res.data.data});
                }
            }
        })
        var yunPrice = parseFloat(this.data.yunPrice);
        var allprice = 0;
        var productList = this.data.productList;
        for (var i = 0; i < productList.length; i++) {
            allprice += parseFloat(productList[0].price) * productList[0].number;
        }
        this.setData({
            allProductPrice: allprice,
            yunPrice: yunPrice
        });
    },
    wuliuDetailsTap: function (e) {
        var orderId = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: "/pages/logistics/index?id=" + orderId
        })
    },
    confirmBtnTap: function (e) {
        let that = this;
        let orderId = this.data.orderId;
        let formId = e.detail.formId;
        wx.showModal({
            title: '确认您已收到商品？',
            content: '',
            success: function (res) {
                if (res.confirm) {
                    wx.showLoading();
                    util.request({
                        url: '/order/delivery',
                        data: {
                            token: util.getStorageSync('token'),
                            id: orderId
                        },
                        success: (res) => {
                            if (res.data.code == 0) {
                                that.onShow();
                                // 模板消息，提醒用户进行评价
                                //let postJsonString = {};
                                //postJsonString.keyword1 = {
                                //    value: that.data.orderDetail.orderInfo.orderNumber,
                                //    color: '#173177'
                                //}
                                //let keywords2 = '您已确认收货，期待您的再次光临！';
                                //if (app.globalData.order_reputation_score) {
                                //    keywords2 += '立即好评，系统赠送您' + app.globalData.order_reputation_score + '积分奖励。';
                                //}
                                //postJsonString.keyword2 = {value: keywords2, color: '#173177'}
                            }
                        }
                    })
                }
            }
        })
    },
    submitReputation: function (e) {
        let that = this;
        let formId = e.detail.formId;
        let postJsonString = {};
        postJsonString.token = util.getStorageSync('token');
        postJsonString.orderId = this.data.orderId;
        let reputations = [];
        let i = 0;
        while (e.detail.value["orderProductId" + i]) {
            let orderProductId = e.detail.value["orderProductId" + i];
            let goodReputation = e.detail.value["goodReputation" + i];
            let goodReputationRemark = e.detail.value["goodReputationRemark" + i];

            let reputations_json = {};
            reputations_json.id = orderProductId;
            reputations_json.reputation = goodReputation;
            reputations_json.remark = goodReputationRemark;

            reputations.push(reputations_json);
            i++;
        }
        postJsonString.reputations = reputations;
        wx.showLoading();
        util.request({
            url: '/order/reputation',
            data: {
                postJsonString: postJsonString
            },
            success: (res) => {
                wx.hideLoading();
                if (res.data.code == 0) {
                    that.onShow();
                    // 模板消息，通知用户已评价
                    let postJsonString = {};
                    postJsonString.keyword1 = {value: that.data.orderDetail.orderInfo.orderNumber, color: '#173177'}
                    let keywords2 = '感谢您的评价，期待您的再次光临！';
                    if (app.globalData.order_reputation_score) {
                        keywords2 += app.globalData.order_reputation_score + '积分奖励已发放至您的账户。';
                    }
                    postJsonString.keyword2 = {value: keywords2, color: '#173177'}

                }
            }
        })
    }
})