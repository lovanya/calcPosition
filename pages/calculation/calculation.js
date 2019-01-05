//index.js
//获取应用实例
var calc = require('../../utils/calculator');
var app = getApp()

Page({
  data: {
    deviceList: [], //deviceslist
    userInfo: {},
    avatarUrl: '../index/bg-image.jpg',
    enableSubmit: false, // 是否允许计算
  },

  onLoad: function (query) {
    // 接收从上个页面传递过来的参数
    var self = this;
    var devices = JSON.parse(query.devices);
    self.setData({
      deviceList: devices
    })
    console.log('选中的设备：', devices);

    if (app.globalData.userInfo) {
      self.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (self.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        self.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          self.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },

  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  // 绑定输入
  bindXInput(e) {
    var ID = e.currentTarget.dataset.id;
    var item = this.findDeviceById(ID);
    if (!e.detail.value && e.detail.value !== 0) {
      item.x = null;
    } else {
      item.x = !isNaN(e.detail.value) ? Number(e.detail.value) : null;
    }

    this.checkInput();
  },
  bindYInput(e) {
    var ID = e.currentTarget.dataset.id;
    var item = this.findDeviceById(ID);
    if (!e.detail.value && e.detail.value !== 0) {
      item.y = null;
    } else {
      item.y = !isNaN(e.detail.value) ? Number(e.detail.value) : null;
    }
    this.checkInput();
  },

  // 校验输入
  checkInput: function () {
    var devices = this.data.deviceList;
    if (!devices.length) {
      this.setData({
        enableSubmit: false
      })
      return;
    }
    let flag = true;

    devices.forEach(function (item) {
      if (typeof item.x === 'number' && typeof item.y === 'number') {
        flag = flag && true;
      } else {
        flag = flag && false;
      }
    });

    this.setData({
      enableSubmit: flag
    })
  },
  // 根据 deviceId 获取 device
  findDeviceById(ID) {
    var devices = this.data.deviceList;
    var item = devices.find(function (item) {
      return item.deviceId === ID;
    })

    return item;
  },
  // 三边测量法，通过三点坐标和到三点的距离，返回第4点位置
  calcPosition: function () {
    var devices = this.data.deviceList;
    console.log('开始计算：', devices);
    if (!devices.length || devices.length < 3) {
      wx.showModal({
        title: '计算失败',
        content: '设备个数不足三个',
        showCancel: false,
        success: function (res) { }
      });
      return;
    }

    var pointA = devices[0];
    var pointB = devices[1];
    var pointC = devices[2];

    var d = calc.calcPhonePosition(
      pointA.x,
      pointA.y,
      pointA.distance,
      pointB.x,
      pointB.y,
      pointB.distance,
      pointC.x,
      pointC.y,
      pointC.distance
    );

    wx.showModal({
      title: '手机坐标',
      content: 'X：' + d.x + '  ' + 'Y：' + d.y,
      showCancel: false,
      success: function (res) { }
    });
    console.log('坐标X：', d.x, '坐标Y：', d.y);
  }

})