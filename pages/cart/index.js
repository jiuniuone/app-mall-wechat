//index.js
var app = getApp()
var util = require('../../utils/util.js');
Page({
    data: {
        productList: {
            saveHidden: true,
            totalPrice: 0,
            totalScoreToPay: 0,
            allSelect: true,
            noSelect: false,
            list: []
        },
        delBtnWidth: 120,    //删除按钮宽度单位（rpx）
    },

    //获取元素自适应后的实际宽度
    getEleWidth: function (w) {
        var real = 0;
        try {
            var res = wx.getSystemInfoSync().windowWidth;
            var scale = (750 / 2) / (w / 2);  //以宽度750px设计稿做宽度的自适应
            // console.log(scale);
            real = Math.floor(res / scale);
            return real;
        } catch (e) {
            return false;
            // Do something when catch error
        }
    },
    initEleWidth: function () {
        var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
        this.setData({
            delBtnWidth: delBtnWidth
        });
    },
    onLoad: function () {
        this.initEleWidth();
        this.onShow();
    },
    onShow: function () {
        var shopList = [];
        // 获取购物车数据
        var shoppingCartInfoMem = util.getStorageSync('shoppingCartInfo');
        if (shoppingCartInfoMem && shoppingCartInfoMem.shopList) {
            shopList = shoppingCartInfoMem.shopList
        }
        this.data.productList.list = shopList;
        this.setProductList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), shopList);
    },
    toIndexPage: function () {
        wx.switchTab({
            url: "/pages/index/index"
        });
    },

    touchS: function (e) {
        if (e.touches.length == 1) {
            this.setData({
                startX: e.touches[0].clientX
            });
        }
    },
    touchM: function (e) {
        var index = e.currentTarget.dataset.index;

        if (e.touches.length == 1) {
            var moveX = e.touches[0].clientX;
            var disX = this.data.startX - moveX;
            var delBtnWidth = this.data.delBtnWidth;
            var left = "";
            if (disX == 0 || disX < 0) {//如果移动距离小于等于0，container位置不变
                left = "margin-left:0px";
            } else if (disX > 0) {//移动距离大于0，container left值等于手指移动距离
                left = "margin-left:-" + disX + "px";
                if (disX >= delBtnWidth) {
                    left = "left:-" + delBtnWidth + "px";
                }
            }
            var list = this.data.productList.list;
            if (index != "" && index != null) {
                list[parseInt(index)].left = left;
                this.setProductList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
            }
        }
    },

    touchE: function (e) {
        var index = e.currentTarget.dataset.index;
        if (e.changedTouches.length == 1) {
            var endX = e.changedTouches[0].clientX;
            var disX = this.data.startX - endX;
            var delBtnWidth = this.data.delBtnWidth;
            //如果距离小于删除按钮的1/2，不显示删除按钮
            var left = disX > delBtnWidth / 2 ? "margin-left:-" + delBtnWidth + "px" : "margin-left:0px";
            var list = this.data.productList.list;
            if (index !== "" && index != null) {
                list[parseInt(index)].left = left;
                this.setProductList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);

            }
        }
    },
    delItem: function (e) {
        var index = e.currentTarget.dataset.index;
        var list = this.data.productList.list;
        list.splice(index, 1);
        this.setProductList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
    },
    selectTap: function (e) {
        var index = e.currentTarget.dataset.index;
        var list = this.data.productList.list;
        if (index !== "" && index != null) {
            list[parseInt(index)].active = !list[parseInt(index)].active;
            this.setProductList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
        }
    },
    totalPrice: function () {
        var list = this.data.productList.list;
        var total = 0;
        let totalScoreToPay = 0;
        for (var i = 0; i < list.length; i++) {
            var curItem = list[i];
            if (curItem.active) {
                total += parseFloat(curItem.price) * curItem.number;
                totalScoreToPay += curItem.score * curItem.number;
            }
        }
        this.data.productList.totalScoreToPay = totalScoreToPay;
        total = parseFloat(total.toFixed(2));//js浮点计算bug，取两位小数精度
        return total;
    },
    allSelect: function () {
        var list = this.data.productList.list;
        var allSelect = false;
        for (var i = 0; i < list.length; i++) {
            var curItem = list[i];
            if (curItem.active) {
                allSelect = true;
            } else {
                allSelect = false;
                break;
            }
        }
        return allSelect;
    },
    noSelect: function () {
        var list = this.data.productList.list;
        var noSelect = 0;
        for (var i = 0; i < list.length; i++) {
            var curItem = list[i];
            if (!curItem.active) {
                noSelect++;
            }
        }
        if (noSelect == list.length) {
            return true;
        } else {
            return false;
        }
    },
    setProductList: function (saveHidden, total, allSelect, noSelect, list) {
        this.setData({
            productList: {
                saveHidden: saveHidden,
                totalPrice: total,
                allSelect: allSelect,
                noSelect: noSelect,
                list: list,
                totalScoreToPay: this.data.productList.totalScoreToPay
            }
        });
        var shoppingCartInfo = {};
        var tempNumber = 0;
        shoppingCartInfo.shopList = list;
        for (var i = 0; i < list.length; i++) {
            tempNumber = tempNumber + list[i].number
        }
        shoppingCartInfo.shopNum = tempNumber;
        wx.setStorage({
            key: "shoppingCartInfo",
            data: shoppingCartInfo
        })
    },
    bindAllSelect: function () {
        var currentAllSelect = this.data.productList.allSelect;
        var list = this.data.productList.list;
        if (currentAllSelect) {
            for (var i = 0; i < list.length; i++) {
                var curItem = list[i];
                curItem.active = false;
            }
        } else {
            for (var i = 0; i < list.length; i++) {
                var curItem = list[i];
                curItem.active = true;
            }
        }

        this.setProductList(this.getSaveHide(), this.totalPrice(), !currentAllSelect, this.noSelect(), list);
    },
    jiaBtnTap: function (e) {
        var that = this
        var index = e.currentTarget.dataset.index;
        var list = that.data.productList.list;
        if (index !== "" && index != null) {
            // 添加判断当前商品购买数量是否超过当前商品可购买库存
            var carShopBean = list[parseInt(index)];
            var carShopBeanStores = 0;
            util.request({
                url:   '/product/detail',
                data: {
                    id: carShopBean.productId
                },
                success: function (res) {
                    carShopBeanStores = res.data.data.basicInfo.stores;
                    console.log(' currnet good id and stores is :', carShopBean.productId, carShopBeanStores)
                    if (list[parseInt(index)].number < carShopBeanStores) {
                        list[parseInt(index)].number++;
                        that.setProductList(that.getSaveHide(), that.totalPrice(), that.allSelect(), that.noSelect(), list);
                    }
                    that.setData({
                        curTouchGoodStore: carShopBeanStores
                    })
                }
            })
        }
    },
    jianBtnTap: function (e) {
        var index = e.currentTarget.dataset.index;
        var list = this.data.productList.list;
        if (index !== "" && index != null) {
            if (list[parseInt(index)].number > 1) {
                list[parseInt(index)].number--;
                this.setProductList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
            }
        }
    },
    editTap: function () {
        var list = this.data.productList.list;
        for (var i = 0; i < list.length; i++) {
            var curItem = list[i];
            curItem.active = false;
        }
        this.setProductList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
    },
    saveTap: function () {
        var list = this.data.productList.list;
        for (var i = 0; i < list.length; i++) {
            var curItem = list[i];
            curItem.active = true;
        }
        this.setProductList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
    },
    getSaveHide: function () {
        var saveHidden = this.data.productList.saveHidden;
        return saveHidden;
    },
    deleteSelected: function () {
        var list = this.data.productList.list;
        /*
         for(let i = 0 ; i < list.length ; i++){
               let curItem = list[i];
               if(curItem.active){
                 list.splice(i,1);
               }
         }
         */
        // above codes that remove elements in a for statement may change the length of list dynamically
        list = list.filter(function (curProduct) {
            return !curProduct.active;
        });
        this.setProductList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
    },
    toPayOrder: function () {
        wx.showLoading();
        var that = this;
        if (this.data.productList.noSelect) {
            util.hideLoading();
            return;
        }
        // 重新计算价格，判断库存
        var shopList = [];
        var shoppingCartInfoMem = util.getStorageSync('shoppingCartInfo');
        if (shoppingCartInfoMem && shoppingCartInfoMem.shopList) {
            shopList = shoppingCartInfoMem.shopList.filter(entity => {
                return entity.active;
            });
        }
        if (shopList.length == 0) {
            util.hideLoading();
            return;
        }
        var isFail = false;
        var doneNumber = 0;
        var needDoneNUmber = shopList.length;
        for (let i = 0; i < shopList.length; i++) {
            if (isFail) {
                util.hideLoading();
                return;
            }
            let carShopBean = shopList[i];
            util.request({
                url:   '/product/detail?id=' + carShopBean.productId,
                success: function (res) {
                    doneNumber++;
                    var product = res.data.data;
                    if (product) {
                        if (product.stores < carShopBean.number) {
                            util.alert('提示', carShopBean.name + ' 库存不足，请重新购买');
                            isFail = true;
                        }
                    } else {
                        util.alert('提示', carShopBean.name + ' 已经失效，请调整购物车');
                        isFail = true;
                    }
                    if (isFail) {
                        util.hideLoading();
                        return;
                    }
                    if (needDoneNUmber == doneNumber) {
                        that.navigateToPayOrder();
                    }
                }
            })
        }
    },
    navigateToPayOrder: function () {
        util.hideLoading();
        util.navigateTo({url: "/pages/order/add/index"})
    }
});
