//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    coupons:[]
  },
  onLoad: function () {
  },
  onShow : function () {
    this.getMyCoupons();
  },
  getMyCoupons: function () {
    var that = this;
    wx.request({
      url: app.globalData.urlPrefix + '/discounts/my',
      data: {
        token: wx.getStorageSync('token'),
        status: 0
      },
      success: function (res) {
        if (res.data.code == 0) {
          var coupons = res.data.data;
          if (coupons.length > 0) {
            that.setData({
              coupons: coupons
            });
          }
        }
      }
    })
  },
  goBuy:function(){
    wx.reLaunch({
      url: '/pages/index/index'
    })
  }

})
