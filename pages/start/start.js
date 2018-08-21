let util = require('../../utils/util.js')
let app = getApp();
Page({
    data: {
        remind: '加载中',
        angle: 0,
        member: {}
    },
    goToIndex: function () {
        wx.switchTab({
            url: '/pages/index/index',
        });
    },
    onLoad: function () {
        let that = this
        wx.setNavigationBarTitle({
            title: util.getStorageSync('mallName')
        })
    },
    onShow: function () {
        let that = this
        let member = util.getStorageSync('member')
        if (!member) {
            wx.navigateTo({
                url: "/pages/authorize/index"
            })
        } else {
            that.setData({
                member: member
            })
        }
    },
    onReady: function () {
        let that = this;
        setTimeout(function () {
            that.setData({
                remind: ''
            });
        }, 1000);
        wx.onAccelerometerChange(function (res) {
            let angle = -(res.x * 30).toFixed(1);
            if (angle > 14) {
                angle = 14;
            }
            else if (angle < -14) {
                angle = -14;
            }
            if (that.data.angle !== angle) {
                that.setData({
                    angle: angle
                });
            }
        });
    }
});