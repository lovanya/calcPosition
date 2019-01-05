//index.js
//获取应用实例
var calc = require('../../utils/calculator');
var app = getApp()

Page({
  data: {
    devicesList: [
      // {
      //   name: 'd1',
      //   deviceId: 'dfasdffsdfs',
      //   RSSI: 100,
      //   distance: 112.20
      // }, {
      //   name: 'd2',
      //   deviceId: 'dfasdfa3423sdfas',
      //   RSSI: 13,
      //   distance: 0.01
      // }, {
      //   name: 'd3',
      //   deviceId: 'dfasdfasdf32434as',
      //   RSSI: 83,
      //   distance: 15.85
      // }
    ], //发现的蓝牙设备列表
    devicesChecked: [], // 选中的设备列表
    DevicesConnected: [{
      DevicesDisplay: "none",
      name: "",
      deviceId: "",
    }],

  },

  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
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

  //开始或关闭搜索附近的蓝牙设备
  BluetoothSwitchChange: function (e) {
    var that = this;
    if (e.detail.value) {
      wx.openBluetoothAdapter({
        success: function (res) {
          console.log(res)
          that.onBluetoothAdapterStateChange(); //监听蓝牙适配器状态变化事件
          that.getBluetoothAdapterState();
        },
        fail: function (err) {
          that.setData({
            'switchChecked': false
          });
          console.log(err);
          wx.showModal({
            title: '错误',
            content: '初始化蓝牙失败，请检查是否开启蓝牙设备',
          })
        }
      })
    } else {
      //关闭蓝牙模块--断开与低功耗蓝牙设备的连接
      wx.closeBluetoothAdapter({
        success: function (res) {
          that.setData({
            'devicesList': [],
            'DevicesConnected': [{
              DevicesDisplay: "none",
              name: "",
              deviceId: "",
            }],
          });
          console.log("关闭蓝牙模块")
          console.log(res)
        }
      })
    }
  },
  //获取本机蓝牙适配器状态
  getBluetoothAdapterState: function () {
    var that = this;
    wx.getBluetoothAdapterState({
      success: function (res) {
        console.log(res)
        var available = res.available; //蓝牙适配器是否可用
        var discovering = res.discovering; //是否正在搜索设备
        if (!available) {
          wx.showModal({
            title: '错误',
            content: '蓝牙适配器状态不可用',
          })
        }
        if (!discovering) {
          that.startBluetoothDevicesDiscovery();
        }
      }
    })
  },
  //开始搜寻附近的蓝牙外围设备。注意，该操作比较耗费系统资源，请在搜索并连接到设备后调用 stop 方法停止搜索。
  startBluetoothDevicesDiscovery: function () {
    var that = this;
    wx.startBluetoothDevicesDiscovery({
      // services: [],
      success: function (res) {
        console.log(res)
        if (res.isDiscovering) {
          console.log("开始搜索设备：")
          that.getBluetoothDevices();
        }
      },
      fail: function (err) {
        console.log(err);
        wx.showModal({
          title: '错误',
          content: '搜寻附近的蓝牙外围设备失败',
        })
      }
    })
  },
  //获取所有已发现的蓝牙设备  
  getBluetoothDevices: function () {
    var that = this;
    var length = 0;
    var count = 0;
    wx.showLoading({
      title: '搜索蓝牙设备',
      mask: true
    })
    var devicesList = [];
    setTimeout(
      function () {
        wx.getBluetoothDevices({
          success: function (res) {
            console.log(res)
            devicesList = res.devices || [];

            devicesList.map(function (item) {
              item.distance = calc.calcDistanceFromRSSI(item.RSSI);
              return item;
            })

            that.setData({
              'devicesList': devicesList
            });
          },
        })
        wx.hideLoading()
      }, 10000) //搜寻设备10秒

  },

  //监听蓝牙适配器状态变化事件
  onBluetoothAdapterStateChange: function () {
    wx.onBluetoothAdapterStateChange(function (res) {
      console.log(`adapterState changed, now is`, res)
      var available = res.available;
      if (!available) {
        wx.showModal({
          title: '提示',
          content: '蓝牙已断开',
        })
      }
    })
  },
  // 多选值变更事件
  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value);

    var items = this.data.devicesList;
    var values = e.detail.value;
    var checkeds = [];

    if (!Array.isArray(items)) {
      this.setData({
        devicesList: [],
        devicesChecked: []
      });
      return;
    }

    items.forEach(function (item, index) {
      item.checked = false;

      for (var j = 0, len = values.length; j < len; ++j) {
        if (item.deviceId == values[j]) {
          item.checked = true;
          break;
        }
      }

      if (item.checked) {
        checkeds.push(item);
      }
    });

    this.setData({
      devicesList: items,
      devicesChecked: checkeds
    });
  },
  // 跳转到计算页面
  toCalcPage: function () {

    // 排序
    var devices = this.data.devicesChecked;
    devices.sort(function (a, b) {
      return a.distance - b.distance;
    });

    //选取距离最近的三个，将该对象转为 string
    var str = JSON.stringify(devices.slice(0, 3));

    wx.navigateTo({
      url: "../calculation/calculation?devices=" + str,
    })
  }
})