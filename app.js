//app.js
App({
    onLaunch: function () {
        var that = this;
        //  获取商城名称
        wx.request({
            url: that.globalData.urlPrefix + '/config',
            data: {
                key: 'mallName'
            },
            success: function (res) {
                if (res.data.code == 0) {
                    wx.setStorageSync('mallName', res.data.data.value);
                }
            }
        })
        wx.request({
            url: that.globalData.urlPrefix + '/score/send/rule',
            data: {
                code: 'goodReputation'
            },
            success: function (res) {
                if (res.data.code == 0) {
                    that.globalData.order_reputation_score = res.data.data[0].score;
                }
            }
        })
        wx.request({
            url: that.globalData.urlPrefix + '/config',
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
        wx.request({
            url: that.globalData.urlPrefix + '/product/kanjia/list',
            data: {},
            success: function (res) {
                if (res.data.code == 0) {
                    that.globalData.kanjiaList = res.data.data.result;
                }
            }
        })
        // 判断是否登录
        let token = wx.getStorageSync('token');
        if (!token) {
            that.goLoginPageTimeOut()
            return
        }
        wx.request({
            url: that.globalData.urlPrefix + '/member/check-token',
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
        urlPrefix: "http://192.168.31.100/api/mall",
        version: "3.0.1",
        shareProfile: '百款精品商品，总有一款适合您' // 首页转发的时候话术
    }
    /*
    根据自己需要修改下单时候的模板消息内容设置，可增加关闭订单、收货时候模板消息提醒；
    1、/pages/to-pay-order/index.js 中已添加关闭订单、商家发货后提醒消费者；
    2、/pages/order/details/index.js 中已添加用户确认收货后提供用户参与评价；评价后提醒消费者好评奖励积分已到账；
    3、请自行修改上面几处的模板消息ID，参数为您自己的变量设置即可。
     */
})
