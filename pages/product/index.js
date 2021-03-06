let app = getApp();
let WxParse = require('../../wxParse/wxParse.js');
let util = require('../../utils/util.js');
Page({
    data: {
        autoplay: true,
        interval: 3000,
        duration: 1000,
        product: {},
        swiperCurrent: 0,
        hasMoreSelect: false,
        selectSize: "选择：",
        selectSizePrice: 0,
        totalScoreToPay: 0,
        shopNum: 0,
        hideShopPopup: true,
        buyNumber: 0,
        buyNumMin: 1,
        buyNumMax: 0,
        itemIds: "",
        itemNames: "",
        canSubmit: false, //  选中规格尺寸时候是否允许加入购物车
        shoppingCartInfo: {},
        shopType: "addShopCar",//购物类型，加入购物车或立即购买，默认为加入购物车
    },

    swiperchange: function (e) {
        this.setData({swiperCurrent: e.detail.current})
    },
    onLoad: function (e) {
        if (e.inviter_id) {
            wx.setStorage({key: 'inviter_id_' + e.id, data: e.inviter_id});
        }
        let that = this;
        that.data.kjId = e.kjId;
        // 获取购物车数据
        wx.getStorage({
            key: 'shoppingCartInfo', success: function (res) {
                that.setData({
                    shoppingCartInfo: res.data,
                    shopNum: res.data.shopNum
                });
            }
        })
        util.request({
            url: '/product/detail', data: {id: e.id},
            success: function (res) {
                let selectSizeTemp = "";
                let product = res.data.data;
                if (product.properties) {
                    for (let i = 0; i < product.properties.length; i++) {
                        selectSizeTemp = selectSizeTemp + " " + product.properties[i].name;
                    }
                    that.setData({
                        hasMoreSelect: true,
                        selectSize: that.data.selectSize + selectSizeTemp,
                        //selectSizePrice: res.data.data.basicInfo.minPrice,
                        selectSizePrice: product.price,
                        totalScoreToPay: product.score
                    });
                }
                that.data.product = product;
                if (product.video_id) {
                    that.getVideoSrc(product.video_id);
                }
                that.setData({
                    product: product,
                    selectSizePrice: product.price,
                    totalScoreToPay: product.score,
                    buyNumMax: product.stores,
                    buyNumber: (product.stores > 0) ? 1 : 0
                });
                WxParse.wxParse('article', 'html', res.data.data.content, that, 5);
            }
        })
        this.reputation(e.id);
    },
    goShopCar: function () {
        wx.reLaunch({
            url: "/pages/cart/index"
        });
    },
    toAddShopCar: function () {
        this.setData({
            shopType: "addShopCar"
        })
        this.bindGuiGeTap();
    },
    tobuy: function () {
        this.setData({
            shopType: "tobuy"
        });
        this.bindGuiGeTap();
        /*    if (this.data.product.properties && !this.data.canSubmit) {
              this.bindGuiGeTap();
              return;
            }
            if(this.data.buyNumber < 1){
              wx.showModal({
                title: '提示',
                content: '暂时缺货哦~',
                showCancel:false
              })
              return;
            }
            this.addShopCar();
            this.goShopCar();*/
    },
    /**
     * 规格选择弹出框
     */
    bindGuiGeTap: function () {
        this.setData({hideShopPopup: false})
    },
    /**
     * 规格选择弹出框隐藏
     */
    closePopupTap: function () {
        this.setData({hideShopPopup: true})
    },
    numJianTap: function () {
        if (this.data.buyNumber > this.data.buyNumMin) {
            let currentNum = this.data.buyNumber;
            currentNum--;
            this.setData({
                buyNumber: currentNum
            })
        }
    },
    numJiaTap: function () {
        if (this.data.buyNumber < this.data.buyNumMax) {
            let currentNum = this.data.buyNumber;
            currentNum++;
            this.setData({
                buyNumber: currentNum
            })
        }
    },
    /**
     * 选择商品规格
     * @param {Object} e
     */
    labelItemTap: function (e) {
        let product = this.data.product;
        let that = this;
        // 取消该分类下的子栏目所有的选中状态
        let propertyIndex = e.currentTarget.dataset.propertyindex;
        let childs = product.properties[propertyIndex].items;
        let itemIndex = e.currentTarget.dataset.propertychildindex;
        for (let i = 0; i < childs.length; i++) {
            product.properties[propertyIndex].items[i].active = itemIndex == i;
        }
        // 获取所有的选中规格尺寸数据
        let needSelectNum = product.properties.length;
        let curSelectNum = 0;
        let itemIds = "";
        let itemNames = "";
        let selectedItems = [];
        for (let i = 0; i < product.properties.length; i++) {
            let property = product.properties[i];
            let items = property.items;
            for (let j = 0; j < items.length; j++) {
                let item = items[j];
                if (item.active) {
                    curSelectNum++;
                    itemIds += property.id + ":" + item.id + ",";
                    itemNames += property.name + ":" + item.name + "  ";
                    selectedItems[selectedItems.length] = item;
                }
            }
        }

        let canSubmit = false;
        if (needSelectNum == curSelectNum) {
            canSubmit = true;
        }
        // 计算当前价格
        if (canSubmit) {
            let price = 0
            for (let i in selectedItems) {
                if (selectedItems[i].price > 0) price = selectedItems[i].price;
            }
            that.setData({
                selectSizePrice: price,
                totalScoreToPay: product.score,
                itemIds: itemIds,
                itemNames: itemNames,
                buyNumMax: product.stores,
                buyNumber: (product.stores > 0) ? 1 : 0
            });

        }

        this.setData({
            product: that.data.product,
            canSubmit: canSubmit
        })
    },
    /**
     * 加入购物车
     */
    addShopCar: function () {
        if (this.data.product.properties && !this.data.canSubmit) {
            if (!this.data.canSubmit) {
                wx.showModal({
                    title: '提示',
                    content: '请选择商品规格！',
                    showCancel: false
                })
            }
            this.bindGuiGeTap();
            return;
        }
        if (this.data.buyNumber < 1) {
            wx.showModal({
                title: '提示',
                content: '购买数量不能为0！',
                showCancel: false
            })
            return;
        }
        //组建购物车
        let shoppingCartInfo = this.bulidShopCarInfo();

        this.setData({
            shoppingCartInfo: shoppingCartInfo,
            shopNum: shoppingCartInfo.shopNum
        });

        // 写入本地存储
        wx.setStorage({
            key: 'shoppingCartInfo',
            data: shoppingCartInfo
        })
        this.closePopupTap();
        wx.showToast({
            title: '加入购物车成功',
            icon: 'success',
            duration: 2000
        })
        //console.log(shoppingCartInfo);

        //shoppingCartInfo = {shopNum:12,shopList:[]}
    },
    /**
     * 立即购买
     */
    buyNow: function () {
        if (this.data.product.properties && !this.data.canSubmit) {
            if (!this.data.canSubmit) {
                wx.showModal({
                    title: '提示',
                    content: '请选择商品规格！',
                    showCancel: false
                })
            }
            this.bindGuiGeTap();
            wx.showModal({
                title: '提示',
                content: '请先选择规格尺寸哦~',
                showCancel: false
            })
            return;
        }
        if (this.data.buyNumber < 1) {
            wx.showModal({
                title: '提示',
                content: '购买数量不能为0！',
                showCancel: false
            })
            return;
        }
        //组建立即购买信息
        let buyNowInfo = this.buliduBuyNowInfo();
        // 写入本地存储
        wx.setStorage({
            key: "buyNowInfo",
            data: buyNowInfo
        })
        this.closePopupTap();

        wx.navigateTo({
            url: "/pages/order/add/index?orderType=buyNow"
        })
    },
    /**
     * 组建购物车信息
     */
    bulidShopCarInfo: function () {
        // 加入购物车
        let shopCarMap = {};
        shopCarMap.productId = this.data.product.id;
        shopCarMap.pic = this.data.product.image_url;
        shopCarMap.name = this.data.product.name;
        shopCarMap.itemIds = this.data.itemIds;
        shopCarMap.label = this.data.itemNames;
        shopCarMap.price = this.data.selectSizePrice;
        shopCarMap.score = this.data.totalScoreToPay;
        shopCarMap.left = "";
        shopCarMap.active = true;
        shopCarMap.number = this.data.buyNumber;
        shopCarMap.logisticsType = this.data.product.logisticsId;
        shopCarMap.logistics = this.data.product.logistics;
        shopCarMap.weight = this.data.product.weight;

        let shoppingCartInfo = this.data.shoppingCartInfo;
        if (!shoppingCartInfo.shopNum) {
            shoppingCartInfo.shopNum = 0;
        }
        if (!shoppingCartInfo.shopList) {
            shoppingCartInfo.shopList = [];
        }
        let hasSameProductIndex = -1;
        for (let i = 0; i < shoppingCartInfo.shopList.length; i++) {
            let tmpShopCarMap = shoppingCartInfo.shopList[i];
            if (tmpShopCarMap.productId == shopCarMap.productId && tmpShopCarMap.itemIds == shopCarMap.itemIds) {
                hasSameProductIndex = i;
                shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
                break;
            }
        }

        shoppingCartInfo.shopNum = shoppingCartInfo.shopNum + this.data.buyNumber;
        if (hasSameProductIndex > -1) {
            shoppingCartInfo.shopList.splice(hasSameProductIndex, 1, shopCarMap);
        } else {
            shoppingCartInfo.shopList.push(shopCarMap);
        }
        shoppingCartInfo.kjId = this.data.kjId;
        return shoppingCartInfo;
    },
    /**
     * 组建立即购买信息
     */
    buliduBuyNowInfo: function () {
        let shopCarMap = {};
        console.log(this.data.product);
        shopCarMap.productId = this.data.product.id;
        shopCarMap.image_url = this.data.product.image_url;
        shopCarMap.name = this.data.product.name;
        // shopCarMap.label=this.data.product.id; 规格尺寸
        shopCarMap.itemIds = this.data.itemIds;
        shopCarMap.label = this.data.itemNames;
        shopCarMap.price = this.data.selectSizePrice;
        shopCarMap.score = this.data.totalScoreToPay;
        shopCarMap.left = "";
        shopCarMap.active = true;
        shopCarMap.number = this.data.buyNumber;
        shopCarMap.logisticsType = this.data.product.logisticsId;
        shopCarMap.logistics = this.data.product.logistics;
        shopCarMap.weight = this.data.product.weight;

        let buyNowInfo = {};
        if (!buyNowInfo.shopNum) {
            buyNowInfo.shopNum = 0;
        }
        if (!buyNowInfo.shopList) {
            buyNowInfo.shopList = [];
        }
        buyNowInfo.shopList.push(shopCarMap);
        buyNowInfo.kjId = this.data.kjId;
        return buyNowInfo;
    },
    onShareAppMessage: function () {
        return {
            title: this.data.product.name,
            path: '/pages/product/index?id=' + this.data.product.id + '&inviter_id=' + util.getStorageSync('uid'),
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
    },
    reputation: function (productId) {
        let that = this;
        util.request({
            url: '/product/reputation', data: {productId: productId},
            success: function (res) {
                if (res.data.code == 0) {
                    that.setData({
                        reputations: res.data.data
                    });
                }
            }
        })
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
});
