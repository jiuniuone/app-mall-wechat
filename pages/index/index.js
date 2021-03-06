let util = require('../../utils/util.js');
let app = getApp();
Page({
    data: {
        indicatorDots: true,
        autoplay: true,
        interval: 3000,
        duration: 1000,
        loadingHidden: false, // loading
        member: {},
        swiperCurrent: 0,
        selectCurrent: 0,
        categories: [],
        activeCategoryId: 0,
        product: [],
        scrollTop: 0,
        loadingMoreHidden: true,
        hasNoCoupons: true,
        coupons: [],
        searchInput: '',
    },

    tabClick: function (e) {
        this.setData({
            activeCategoryId: e.currentTarget.id
        });
        this.getProductList(this.data.activeCategoryId);
    },
    //事件处理函数
    swiperchange: function (e) {
        //console.log(e.detail.current)
        this.setData({
            swiperCurrent: e.detail.current
        })
    },
    toDetailsTap: function (e) {
        wx.navigateTo({
            url: "/pages/product/index?id=" + e.currentTarget.dataset.id
        })
    },
    tapBanner: function (e) {
        if (e.currentTarget.dataset.id != 0) {
            wx.navigateTo({
                url: "/pages/product/index?id=" + e.currentTarget.dataset.id
            })
        }
    },
    bindTypeTap: function (e) {
        this.setData({
            selectCurrent: e.index
        })
    },
    onLoad: function () {
        let that = this
        wx.setNavigationBarTitle({
            title: util.getStorageSync('mallName')
        })
        util.request({
            url: '/banner/list',
            data: {
                key: 'mallName'
            },
            success: function (res) {
                if (res.data.code == 404) {
                    wx.showModal({title: '提示', content: '请在后台添加 banner 轮播图片', showCancel: false})
                } else {
                    that.setData({banners: res.data.data});
                }
            }
        }),
            util.request({
                url: '/product/category/all',
                success: function (res) {
                    let categories = [{id: 0, name: "全部"}];
                    if (res.data.code == 0) {
                        for (let i = 0; i < res.data.data.length; i++) {
                            categories.push(res.data.data[i]);
                        }
                    }
                    that.setData({
                        categories: categories,
                        activeCategoryId: 0
                    });
                    that.getProductList(0);
                }
            })
        that.getCoupons();
        that.getNotice();
    },
    onPageScroll(e) {
        let scrollTop = this.data.scrollTop
        this.setData({
            scrollTop: e.scrollTop
        })
    },
    getProductList: function (categoryId) {
        if (categoryId == 0) {
            categoryId = "";
        }
        console.log(categoryId)
        let that = this;
        util.request({
            url: '/product/list',
            data: {
                categoryId: categoryId,
                nameLike: that.data.searchInput
            },
            success: function (res) {
                that.setData({
                    product: [],
                    loadingMoreHidden: true
                });
                let product = [];
                if (res.data.code != 0 || res.data.data.length == 0) {
                    that.setData({
                        loadingMoreHidden: false,
                    });
                    return;
                }
                for (let i = 0; i < res.data.data.length; i++) {
                    product.push(res.data.data[i]);
                }
                that.setData({
                    product: product,
                });
            }
        })
    },
    getCoupons: function () {
        let that = this;
        util.request({
            url: '/discounts/coupons',
            success: function (res) {
                if (res.data.code == 0) {
                    that.setData({hasNoCoupons: false, coupons: res.data.data});
                }
            }
        })
    },
    gitCoupon: function (e) {
        let that = this;
        util.request({
            url: '/discounts/fetch',
            data: {
                id: e.currentTarget.dataset.id,
                token: util.getStorageSync('token')
            },
            success: function (res) {
                if (res.data.code == 20001 || res.data.code == 20002) {
                    wx.showModal({
                        title: '错误',
                        content: '来晚了',
                        showCancel: false
                    })
                    return;
                }
                if (res.data.code == 20003) {
                    wx.showModal({
                        title: '错误',
                        content: '你领过了，别贪心哦~',
                        showCancel: false
                    })
                    return;
                }
                if (res.data.code == 30001) {
                    wx.showModal({
                        title: '错误',
                        content: '您的积分不足',
                        showCancel: false
                    })
                    return;
                }
                if (res.data.code == 20004) {
                    wx.showModal({
                        title: '错误',
                        content: '已过期~',
                        showCancel: false
                    })
                    return;
                }
                if (res.data.code == 0) {
                    wx.showToast({
                        title: '领取成功，赶紧去下单吧~',
                        icon: 'success',
                        duration: 2000
                    })
                } else {
                    wx.showModal({
                        title: '错误',
                        content: res.data.msg,
                        showCancel: false
                    })
                }
            }
        })
    },
    onShareAppMessage: function () {
        return {
            title: util.getStorageSync('mallName') + '——' + app.globalData.shareProfile,
            path: '/pages/index/index',
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
    },
    getNotice: function () {
        let that = this;
        util.request({
            url: '/notice/list',
            data: {pageSize: 5},
            success: function (res) {
                if (res.data.code == 0) that.setData({noticeList: res.data.data});
            }
        })
    },
    listenerSearchInput: function (e) {
        this.setData({
            searchInput: e.detail.value
        })

    },
    toSearch: function () {
        this.getProductList(this.data.activeCategoryId);
    }
})
