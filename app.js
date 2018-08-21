let util = require('./utils/util.js');
App({
    onLaunch: function () {
        let that = this;

        //  获取商城名称
        util.request({
            url: '/config',
            data: {
                key: 'mallName'
            },
            success: function (res) {
                if (res.data.code == 0) {
                    wx.setStorageSync('mallName', res.data.data.value);
                }
            }
        })
        util.request({
            url: '/score/send/rule',
            data: {
                code: 'goodReputation'
            },
            success: function (res) {
                if (res.data.code == 0) {
                    that.globalData.order_reputation_score = res.data.data[0].score;
                }
            }
        })
        util.request({
            url: '/config',
            data: {
                key: 'recharge_amount_min'
            },
            success: function (res) {
                if (res.data.code == 0) {
                    that.globalData.recharge_amount_min = res.data.data.value;
                }
            }
        })
        // 获取砍价设置
        util.request({
            url: '/product/kanjia/list',
            data: {},
            success: function (res) {
                if (res.data.code == 0) {
                    that.globalData.kanjiaList = res.data.data.result;
                }
            }
        })
        // 判断是否登录
        let token = util.getStorageSync('token');
        if (!token) {
            that.goLoginPageTimeOut()
            return
        }
        util.request({
            url: '/member/check-token',
            data: {
                token: token
            },
            success: function (res) {
                if (res.data.code != 0) {
                    wx.removeStorageSync('token')
                    that.goLoginPageTimeOut()
                }
            }
        })
    },


    goLoginPageTimeOut: function () {
        setTimeout(function () {
            wx.navigateTo({
                url: "/pages/authorize/index"
            })
        }, 1000)
    },
    globalData: {
        member: null,
        //urlPrefix: "http://192.168.31.100/api/mall",
        //urlPrefix: "http://192.168.31.80/api/mall",

        version: "3.0.1",
        shareProfile: '百款精品商品，总有一款适合您' // 首页转发的时候话术
    }
});
