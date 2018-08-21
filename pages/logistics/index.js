let util = require('../../utils/util.js');
let app = getApp()
Page({
    data: {},
    onLoad: function (e) {
        this.data.orderId = e.id;
    },
    onShow: function () {
        let that = this;
        util.request({
            url: '/order/detail',
            data: {
                token: util.getStorageSync('token'),
                id: that.data.orderId
            },
            success: (res) => {
                wx.hideLoading();
                if (res.data.code != 0) {
                    util.alert('错误', res.data.message);
                    return;
                }
                that.setData({
                    order: res.data.data,
                });
            }
        })
    }
})
