var app = getApp()
var util = require('../../../utils/util.js');
Page({
    data: {
        totalScoreToPay: 0,
        productList: [],
        allProductPrice: 0,
        yunPrice: 0,
        allProductAndYunPrice: 0,
        orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，
        hasNoCoupons: true,
        coupons: [],
        youhuijine: 0, //优惠券金额
        curCoupon: null // 当前选择使用的优惠券
    },
    onShow: function () {
        var that = this;
        var shopList = [];
        console.log(that.data);
        if ("buyNow" == that.data.orderType) {//立即购买下单
            var buyNowInfoMem = util.getStorageSync('buyNowInfo');
            that.data.kjId = buyNowInfoMem.kjId;
            if (buyNowInfoMem && buyNowInfoMem.shopList) {
                shopList = buyNowInfoMem.shopList
            }
        } else {//购物车下单
            var shoppingCartInfoMem = util.getStorageSync('shoppingCartInfo');
            that.data.kjId = shoppingCartInfoMem.kjId;
            if (shoppingCartInfoMem && shoppingCartInfoMem.shopList) {
                shopList = shoppingCartInfoMem.shopList.filter(entity => {
                    return entity.active;
                });
            }
        }
        that.setData({productList: shopList});
        that.initShippingAddress();
    },

    onLoad: function (e) {
        var that = this;
        that.setData({orderType: e.orderType});
    },
    createOrder: function (e) {
        wx.showLoading();
        var that = this;
        var loginToken = util.getStorageSync('token');
        var remark = "";
        if (e) {
            remark = e.detail.value.remark; // 备注信息
        }

        var postData = {
            token: loginToken,
            productJsonStr: that.data.productJsonStr,
            remark: remark
        };
        if (!that.data.curAddressData) {
            wx.hideLoading();
            util.alert('错误', '请先设置您的收货地址！');
            return;
        }
        console.log("createOrder", that.data);
        postData.addressId = that.data.curAddressData.id;
        if (that.data.curCoupon) postData.couponId = that.data.curCoupon.id;
        console.log(postData)
        util.request({
            url: '/order/create',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: postData, // 设置请求的 参数
            success: (res) => {
                wx.hideLoading();
                if (res.data.code != 0) {
                    wx.showModal({
                        title: '错误',
                        content: res.data.msg,
                        showCancel: false
                    })
                    return;
                }

                if (e && "buyNow" != that.data.orderType) {
                    // 清空购物车数据
                    wx.removeStorageSync('shoppingCartInfo');
                }
                var data = res.data.data;
                if (!e) {
                    that.setData({
                        totalScoreToPay: data.score,
                        allProductPrice: data.amountTotle,
                        allProductAndYunPrice: data.amountLogistics + data.amountTotle,
                        yunPrice: data.amountLogistics
                    });
                    that.getMyCoupons();
                    return;
                }
                wx.redirectTo({
                    url: "/pages/order/list/index"
                });
            }
        })
    },
    initShippingAddress: function () {
        var that = this;
        util.request({
            url: '/address/default',
            data: {
                token: util.getStorageSync('token')
            },
            success: (res) => {
                if (res.data.code == 0) {
                    that.setData({
                        curAddressData: res.data.data
                    });
                } else {
                    that.setData({
                        curAddressData: null
                    });
                }
                that.processYunfei();
            }
        })
    },
    processYunfei: function () {
        var that = this;
        var productList = this.data.productList;
        var productJsonStr = "[";
        var allProductPrice = 0;

        for (let i = 0; i < productList.length; i++) {
            let carShopBean = productList[i];
            allProductPrice += carShopBean.price * carShopBean.number;
            var productJsonStrTmp = '';
            if (i > 0) {
                productJsonStrTmp = ",";
            }
            let inviter_id = 0;
            let inviter_id_storge = util.getStorageSync('inviter_id_' + carShopBean.productId);
            if (inviter_id_storge) {
                inviter_id = inviter_id_storge;
            }

            console.log(carShopBean)
            productJsonStrTmp += '{"product_id":' + carShopBean.productId + ',"count":' + carShopBean.number + ',"items":"' + carShopBean.itemIds + '","logisticsType":0, "inviter_id":' + inviter_id + '}';
            productJsonStr += productJsonStrTmp;


        }
        productJsonStr += "]";
        that.setData({
            productJsonStr: productJsonStr
        });
        //that.createOrder();
    },
    addAddress: function () {
        wx.navigateTo({
            url: "/pages/address/detail/index"
        })
    },
    selectAddress: function () {
        wx.navigateTo({
            url: "/pages/address/list/index"
        })
    },
    getMyCoupons: function () {
        var that = this;
        util.request({
            url: '/discounts/my',
            data: {
                token: util.getStorageSync('token'),
                status: 0
            },
            success: function (res) {
                if (res.data.code == 0) {
                    var coupons = res.data.data.filter(entity => {
                        return entity.moneyHreshold <= that.data.allProductAndYunPrice;
                    });
                    if (coupons.length > 0) {
                        that.setData({
                            hasNoCoupons: false,
                            coupons: coupons
                        });
                    }
                }
            }
        })
    },
    bindChangeCoupon: function (e) {
        const selIndex = e.detail.value[0] - 1;
        if (selIndex == -1) {
            this.setData({
                youhuijine: 0,
                curCoupon: null
            });
            return;
        }
        //console.log("selIndex:" + selIndex);
        this.setData({
            youhuijine: this.data.coupons[selIndex].money,
            curCoupon: this.data.coupons[selIndex]
        });
    }
})
