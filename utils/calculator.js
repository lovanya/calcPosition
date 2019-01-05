var calculator = {
  // 将数字或者字符串转成保留多少位小数的字符串
  numberToFix: function (value, fractionDigits) {
    if (isNaN(value)) {
      return ''
    }
    if (typeof fractionDigits !== 'number') {
      fractionDigits = 2;
    }
    return Number(value).toFixed(fractionDigits)
  },
  // 根据蓝牙信号强度计算距离
  calcDistanceFromRSSI: function (rssi) {
    var iRssi = Math.abs(rssi);
    var power = (iRssi - 59) / (10 * 2.0);
    return Math.pow(10, power).toFixed(3);
  },
  // 通过三点坐标和到三点的距离，返回第4点位置
  calcPhonePosition: function (x1, y1, d1, x2, y2, d2, x3, y3, d3) {
    var d = {};
    var a11 = 2 * (x1 - x3);
    var a12 = 2 * (y1 - y3);
    var b1 = Math.pow(x1, 2) - Math.pow(x3, 2) +
      Math.pow(y1, 2) - Math.pow(y3, 2) +
      Math.pow(d3, 2) - Math.pow(d1, 2);
    var a21 = 2 * (x2 - x3);
    var a22 = 2 * (y2 - y3);
    var b2 = Math.pow(x2, 2) - Math.pow(x3, 2) +
      Math.pow(y2, 2) - Math.pow(y3, 2) +
      Math.pow(d3, 2) - Math.pow(d2, 2);

    d.x = this.numberToFix((b1 * a22 - a12 * b2) / (a11 * a22 - a12 * a21), 3);
    d.y = this.numberToFix((a11 * b2 - b1 * a21) / (a11 * a22 - a12 * a21), 3);

    return d;
  }
}
module.exports = {
  numberToFix: calculator.numberToFix,
  calcDistanceFromRSSI: calculator.calcDistanceFromRSSI,
  calcPhonePosition: calculator.calcPhonePosition
}