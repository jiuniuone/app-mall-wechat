var util = require('../../../utils/util.js')
var app = getApp()
Page({
  data: {
    addressList:[]
  },

  selectTap: function (e) {
    var id = e.currentTarget.dataset.id;
    util.request({
      url:  '/address/update',
      data: {
        token: util.getStorageSync('token'),
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
    util.request({
      url:  '/address/list',
      data: {
        token: util.getStorageSync('token')
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
