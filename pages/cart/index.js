//index.js
let app = getApp()
let util = require('../../utils/util.js');
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
        let real = 0;
        try {
            let res = wx.getSystemInfoSync().windowWidth;
            let scale = (750 / 2) / (w / 2);  //以宽度750px设计稿做宽度的自适应
            // console.log(scale);
            real = Math.floor(res / scale);
            return real;
        } catch (e) {
            return false;
            // Do something when catch error
        }
    },
    initEleWidth: function () {
        let delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
        this.setData({
            delBtnWidth: delBtnWidth
        });
    },
    onLoad: function () {
        this.initEleWidth();
        this.onShow();
    },
    onShow: function () {
        let shopList = [];
        // 获取购物车数据
        let shoppingCartInfoMem = util.getStorageSync('shoppingCartInfo');
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
        let index = e.currentTarget.dataset.index;

        if (e.touches.length == 1) {
            let moveX = e.touches[0].clientX;
            let disX = this.data.startX - moveX;
            let delBtnWidth = this.data.delBtnWidth;
            let left = "";
            if (disX == 0 || disX < 0) {//如果移动距离小于等于0，container位置不变
                left = "margin-left:0px";
            } else if (disX > 0) {//移动距离大于0，container left值等于手指移动距离
                left = "margin-left:-" + disX + "px";
                if (disX >= delBtnWidth) {
                    left = "left:-" + delBtnWidth + "px";
                }
            }
            let list = this.data.productList.list;
            if (index != "" && index != null) {
                list[parseInt(index)].left = left;
                this.setProductList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
            }
        }
    },

    touchE: function (e) {
        let index = e.currentTarget.dataset.index;
        if (e.changedTouches.length == 1) {
            let endX = e.changedTouches[0].clientX;
            let disX = this.data.startX - endX;
            let delBtnWidth = this.data.delBtnWidth;
            //如果距离小于删除按钮的1/2，不显示删除按钮
            let left = disX > delBtnWidth / 2 ? "margin-left:-" + delBtnWidth + "px" : "margin-left:0px";
            let list = this.data.productList.list;
            if (index !== "" && index != null) {
                list[parseInt(index)].left = left;
                this.setProductList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);

            }
        }
    },
    delItem: function (e) {
        let index = e.currentTarget.dataset.index;
        let list = this.data.productList.list;
        list.splice(index, 1);
        this.setProductList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
    },
    selectTap: function (e) {
        let index = e.currentTarget.dataset.index;
        let list = this.data.productList.list;
        if (index !== "" && index != null) {
            list[parseInt(index)].active = !list[parseInt(index)].active;
            this.setProductList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
        }
    },
    totalPrice: function () {
        let list = this.data.productList.list;
        let total = 0;
        let totalScoreToPay = 0;
        for (let i = 0; i < list.length; i++) {
            let curItem = list[i];
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
        let list = this.data.productList.list;
        let allSelect = false;
        for (let i = 0; i < list.length; i++) {
            let curItem = list[i];
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
        let list = this.data.productList.list;
        let noSelect = 0;
        for (let i = 0; i < list.length; i++) {
            let curItem = list[i];
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
        let shoppingCartInfo = {};
        let tempNumber = 0;
        shoppingCartInfo.shopList = list;
        for (let i = 0; i < list.length; i++) {
            tempNumber = tempNumber + list[i].number
        }
        shoppingCartInfo.shopNum = tempNumber;
        wx.setStorage({
            key: "shoppingCartInfo",
            data: shoppingCartInfo
        })
    },
    bindAllSelect: function () {
        let currentAllSelect = this.data.productList.allSelect;
        let list = this.data.productList.list;
        if (currentAllSelect) {
            for (let i = 0; i < list.length; i++) {
                let curItem = list[i];
                curItem.active = false;
            }
        } else {
            for (let i = 0; i < list.length; i++) {
                let curItem = list[i];
                curItem.active = true;
            }
        }

        this.setProductList(this.getSaveHide(), this.totalPrice(), !currentAllSelect, this.noSelect(), list);
    },
    jiaBtnTap: function (e) {
        let that = this
        let index = e.currentTarget.dataset.index;
        let list = that.data.productList.list;
        if (index !== "" && index != null) {
            // 添加判断当前商品购买数量是否超过当前商品可购买库存
            let shoppingCartBean = list[parseInt(index)];
            let shoppingCartStore = 0;
            util.request({
                url: '/product/detail',
                data: {
                    id: shoppingCartBean.productId
                },
                success: function (res) {
                    shoppingCartStore = res.data.data.basicInfo.stores;
                    console.log(' currnet product id and stores is :', shoppingCartBean.productId, shoppingCartStore)
                    if (list[parseInt(index)].number < shoppingCartStore) {
                        list[parseInt(index)].number++;
                        that.setProductList(that.getSaveHide(), that.totalPrice(), that.allSelect(), that.noSelect(), list);
                    }
                    that.setData({
                        curTouchProductStore: shoppingCartStore
                    })
                }
            })
        }
    },
    jianBtnTap: function (e) {
        let index = e.currentTarget.dataset.index;
        let list = this.data.productList.list;
        if (index !== "" && index != null) {
            if (list[parseInt(index)].number > 1) {
                list[parseInt(index)].number--;
                this.setProductList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
            }
        }
    },
    editTap: function () {
        let list = this.data.productList.list;
        for (let i = 0; i < list.length; i++) {
            let curItem = list[i];
            curItem.active = false;
        }
        this.setProductList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
    },
    saveTap: function () {
        let list = this.data.productList.list;
        for (let i = 0; i < list.length; i++) {
            let curItem = list[i];
            curItem.active = true;
        }
        this.setProductList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
    },
    getSaveHide: function () {
        let saveHidden = this.data.productList.saveHidden;
        return saveHidden;
    },
    deleteSelected: function () {
        let list = this.data.productList.list;
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
        let that = this;
        if (this.data.productList.noSelect) {
            util.hideLoading();
            return;
        }
        // 重新计算价格，判断库存
        let shopList = [];
        let shoppingCartInfoMem = util.getStorageSync('shoppingCartInfo');
        if (shoppingCartInfoMem && shoppingCartInfoMem.shopList) {
            shopList = shoppingCartInfoMem.shopList.filter(entity => {
                return entity.active;
            });
        }
        if (shopList.length == 0) {
            util.hideLoading();
            return;
        }
        let isFail = false;
        let doneNumber = 0;
        let needDoneNUmber = shopList.length;
        for (let i = 0; i < shopList.length; i++) {
            if (isFail) {
                util.hideLoading();
                return;
            }
            let shoppingCartBean = shopList[i];
            util.request({
                url: '/product/detail?id=' + shoppingCartBean.productId,
                success: function (res) {
                    doneNumber++;
                    let product = res.data.data;
                    if (product) {
                        if (product.stores < shoppingCartBean.number) {
                            util.alert('提示', shoppingCartBean.name + ' 库存不足，请重新购买');
                            isFail = true;
                        }
                    } else {
                        util.alert('提示', shoppingCartBean.name + ' 已经失效，请调整购物车');
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
