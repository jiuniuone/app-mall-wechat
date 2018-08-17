//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    addressList:[]
  },

  selectTap: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.request({
      url: app.globalData.urlPrefix +'/address/update',
      data: {
        token: wx.getStorageSync('token'),
        id:id,
        isDefault:'true'
      },
      success: (res) =>{
        wx.navigateBack({})
      }
    })
  },

  addAddess : function () {
    wx.navigateTo({
      url:"/pages/address/detail/index"
    })
  },
  
  editAddess: function (e) {
    wx.navigateTo({
      url: "/pages/address/detail/index?id=" + e.currentTarget.dataset.id
    })
  },
  
  onLoad: function () {
    console.log('onLoad')

   
  },
  onShow : function () {
    this.initShippingAddress();
  },
  initShippingAddress: function () {
    var that = this;
    wx.request({
      url: app.globalData.urlPrefix +'/address/list',
      data: {
        token: wx.getStorageSync('token')
      },
      success: (res) =>{
        if (res.data.code == 0) {
          that.setData({
            addressList:res.data.data
          });
        } else if (res.data.code == 700){
          that.setData({
            addressList: null
          });
        }
      }
    })
  }

})