let app = getApp();
let WxParse = require('../../wxParse/wxParse.js');
let util = require('../../utils/util.js')

Page({
    data: {
        autoplay: true,
        interval: 3000,
        duration: 1000,
        productDetail: {},
        swiperCurrent: 0
    },

    //事件处理函数
    swiperchange: function (e) {
        //console.log(e.detail.current)
        this.setData({
            swiperCurrent: e.detail.current
        })
    },
    onLoad: function (e) {
        this.data.id = e.id;
        this.data.kjId = e.kjId;
        this.data.joiner = e.joiner;
        let that = this;
        util.request({
            url: '/product/detail',
            data: {
                id: e.id
            },
            success: function (res) {
                that.data.productDetail = res.data.data;
                if (res.data.data.basicInfo.videoId) {
                    that.getVideoSrc(res.data.data.basicInfo.videoId);
                }
                that.setData({
                    productDetail: res.data.data
                });
                WxParse.wxParse('article', 'html', res.data.data.content, that, 5);
            }
        })
        this.getKanjiaInfo(e.kjId, e.joiner);
        this.getKanjiaInfoMyHelp(e.kjId, e.joiner);
    },
    onShareAppMessage: function () {
        let that = this;
        return {
            title: "帮我来砍价",
            path: "/pages/kanjia/index?kjId=" + that.data.kjId + "&joiner=" + that.data.joiner + "&id=" + that.data.id,
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
    },
    getVideoSrc: function (videoId) {
        let that = this;
        util.request({
            url: '/media/video/detail',
            data: {
                videoId: videoId
            },
            success: function (res) {
                if (res.data.code == 0) {
                    that.setData({
                        videoMp4Src: res.data.data.fdMp4
                    });
                }
            }
        })
    },
    getKanjiaInfo: function (kjid, joiner) {
        let that = this;
        util.request({
            url: '/product/kanjia/info',
            data: {
                kjid: kjid,
                joiner: joiner,
            },
            success: function (res) {
                if (res.data.code != 0) {
                    wx.showModal({
                        title: '错误',
                        content: res.data.msg,
                        showCancel: false
                    })
                    return;
                }
                that.setData({
                    kanjiaInfo: res.data.data
                });
            }
        })
    },
    getKanjiaInfoMyHelp: function (kjid, joiner) {
        let that = this;
        util.request({
            url: '/product/kanjia/myHelp',
            data: {
                kjid: kjid,
                joinerUser: joiner,
                token: util.getStorageSync('token')
            },
            success: function (res) {
                if (res.data.code == 0) {
                    that.setData({
                        kanjiaInfoMyHelp: res.data.data,
                        curuid: util.getStorageSync('uid')
                    });
                }
            }
        })
    },
    helpKanjia: function () {
        let that = this;
        util.request({
            url: '/product/kanjia/help',
            data: {
                kjid: that.data.kjId,
                joinerUser: that.data.joiner,
                token: util.getStorageSync('token')
            },
            success: function (res) {
                if (res.data.code != 0) {
                    wx.showModal({
                        title: '错误',
                        content: res.data.msg,
                        showCancel: false
                    })
                    return;
                }
                that.setData({
                    mykanjiaInfo: res.data.data
                });
                wx.showModal({
                    title: '成功',
                    content: '成功帮好友砍掉 ' + res.data.data.cutPrice + ' 元',
                    showCancel: false
                })
                that.getKanjiaInfo(that.data.kjId, that.data.joiner);
                that.getKanjiaInfoMyHelp(that.data.kjId, that.data.joiner);
            }
        })
    },
    tobuy: function () {
        wx.navigateTo({
            url: "/pages/product/index?id=" + this.data.kanjiaInfo.kanjiaInfo.productId + "&kjId=" + this.data.kanjiaInfo.kanjiaInfo.kjId
        })
    }
})
