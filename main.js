var map = new AMap.Map('container', {
  zoom: 13, // 初始化地图层级
  rotateEnable: true,
  pitchEnable: true,
  resizeEnable: true, // 是否监控地图容器尺寸变化
  zoom: 17,
  pitch: 30,
  viewMode: '3D', //开启3D视图,默认为关闭
  buildingAnimation: true, //楼块出现是否带动画
  expandZoomRange: true,
  zooms: [3, 20]
})
map.addControl(new AMap.ControlBar({
  showZoomBar: false,
  showControlButton: true,
  position: {
    right: '10px',
    top: '180px'
  }
}))
var marker

// ================================== 加载鹰眼
map.plugin(["AMap.OverView"], function () {
  var view = new AMap.OverView()
  map.addControl(view)
})
// =================================比例尺插件
map.plugin(["AMap.Scale"], function () {
  var scale = new AMap.Scale()
  map.addControl(scale)
})

var weather
map.plugin(["AMap.Weather"], function () {
  weather = new AMap.Weather()
})


var city // 定义一个变量来接收当前地图中心点所在城市
map.getCity(function (data) {
  city = data.city
})

document.getElementById('btn4').onclick = function () {
  console.log(city)
  if (this.innerText === '当前天气') {
    this.style.backgroundColor = "skyblue"
    this.innerText = '关闭查询'
    document.getElementById('weatherShow').style.display = "block"
    AMap.plugin('AMap.Weather', function () {
      var weather = new AMap.Weather()
      //查询实时天气信息, 查询的城市到行政级别的城市，如朝阳区、杭州市
      weather.getLive(city, function (err, data) {
        if (!err) {
          var str = []
          str.push('<h4 >实时天气' + '</h4><hr>')
          str.push('<p>城市/区：' + data.city + '</p>')
          str.push('<p>天气：' + data.weather + '</p>')
          str.push('<p>温度：' + data.temperature + '℃</p>')
          str.push('<p>风向：' + data.windDirection + '</p>')
          str.push('<p>风力：' + data.windPower + ' 级</p>')
          str.push('<p>空气湿度：' + data.humidity + '</p>')
          str.push('<p>发布时间：' + data.reportTime + '</p>')
          marker = new AMap.Marker({
            map: map,
            position: map.getCenter()
          })
          var infoWin = new AMap.InfoWindow({
            content: '<div id="weatherShow2" class="info" style="position:inherit;margin-bottom:0;">' +
              str.join('') + '</div><div class="sharp"></div>',
            isCustom: true,
            offset: new AMap.Pixel(0, -37)
          })
          infoWin.open(map, marker.getPosition())
          marker.on('mouseover', function () {
            infoWin.open(map, marker.getPosition())
          })
        }
      })
      //未来4天天气预报
      weather.getForecast('梅州市', function (err, data) {
        if (err) {
          return
        }
        var str = []
        for (var i = 0, dayWeather; i < data.forecasts.length; i++) {
          dayWeather = data.forecasts[i];
          str.push(dayWeather.date + ' <span class="weather">' + dayWeather.dayWeather + '</span> ' +
            dayWeather.nightTemp + '~' + dayWeather.dayTemp + '℃')
        }
        document.getElementById('forecast').innerHTML = str.join('<br>')
      })
    })
  } else if (this.innerText === '关闭查询') {
    this.style.backgroundColor = "#C4C4C4"
    this.innerText = '当前天气'
    document.getElementById('weatherShow').style.display = "none"
    document.getElementById('weatherShow2').style.display = "none"
    marker.hide()
  }
}
// ==================================距离测量插件
var ruler // 定义一个变量来接收距离测量插件
map.plugin(["AMap.RangingTool"], function () {
  ruler = new AMap.RangingTool(map)
})

document.getElementById('btn3').onclick = function () {
  console.dir(this)
  if (this.innerText === '距离测量') {
    this.style.backgroundColor = "skyblue"
    this.innerText = '关闭测量'
    ruler.turnOn()
    log.success("点击鼠标左键设置起点")
  } else if (this.innerText === '关闭测量') {
    this.style.backgroundColor = "#C4C4C4"
    this.innerText = '距离测量'
    ruler.turnOff()
  }
}

var type
map.plugin(["AMap.MapType"], function () {
  type = new AMap.MapType({
    defaultType: 0 //使用2D地图
  })
})
// =========================================================图层控件
document.getElementById('btn5').onclick = function () {
  console.dir(this)
  if (this.innerText === '图层控件') {
    this.style.backgroundColor = "skyblue"
    this.innerText = '关闭控件'
    // ================================卫星地图切换
    map.addControl(type)
    document.getElementById('tip').style.display = "block"
  } else if (this.innerText === '关闭控件') {
    this.style.backgroundColor = "#C4C4C4"
    this.innerText = '图层控件'
    map.removeControl(type)
    document.getElementById('tip').style.display = "none"
  }
}

// ========================================================= POI搜索

document.getElementById('btn6').onclick = function () {
  console.dir(this)
  if (this.innerText === '地点搜索') {
    this.style.backgroundColor = "skyblue"
    this.innerText = '关闭搜索'
    // ================================卫星地图切换
    document.getElementById('myPageTop').style.display = "block"
  } else if (this.innerText === '关闭搜索') {
    this.style.backgroundColor = "#C4C4C4"
    this.innerText = '地点搜索'
    document.getElementById('myPageTop').style.display = "none"
    placeSearch.clear()
  }
}
// ========================================================= 公交查询


var linesearch
var busLineName
/*公交线路查询*/
function lineSearch() {
  busLineName = document.getElementById('BusLineName').value
  document.getElementById('input-card').style.display = "block"
  console.log(busLineName)
  if (!busLineName) return
  //实例化公交线路查询类，只取回一条路线
  if (!linesearch) {
    linesearch = new AMap.LineSearch({
      pageIndex: 1,
      city: '梅州',
      pageSize: 1,
      extensions: 'all'
    })
  }
  //搜索“5”相关公交线路
  linesearch.search(busLineName, function (status, result) {
    map.clearMap()
    if (status === 'complete' && result.info === 'OK') {
      lineSearch_Callback(result)

    } else {
      alert(result)
    }
  })
}

function lineSearch_Callback(data) {
  var lineArr = data.lineInfo
  var lineNum = data.lineInfo.length
  if (lineNum == 0) {} else {
    for (var i = 0; i < lineNum; i++) {
      var pathArr = lineArr[i].path;
      var stops = lineArr[i].via_stops;
      var startPot = stops[0].location;
      var endPot = stops[stops.length - 1].location;
      if (i == 0) //作为示例，只绘制一条线路
        drawbusLine(startPot, endPot, pathArr);

    }
  }
}
/*绘制路线*/
function drawbusLine(startPot, endPot, BusArr) {
  //绘制起点，终点
  new AMap.Marker({
    map: map,
    position: startPot, //基点位置
    icon: "https://webapi.amap.com/theme/v1.3/markers/n/start.png",
    zIndex: 10
  })
  new AMap.Marker({
    map: map,
    position: endPot, //基点位置
    icon: "https://webapi.amap.com/theme/v1.3/markers/n/end.png",
    zIndex: 10
  })
  //绘制乘车的路线
  busPolyline = new AMap.Polyline({
    map: map,
    path: BusArr,
    strokeColor: "#09f", //线颜色
    strokeOpacity: 0.8, //线透明度
    isOutline: true,
    outlineColor: '#C4C4C4',
    strokeWeight: 6 //线宽
  })
  map.setFitView()
}

document.getElementById('search').onclick = lineSearch

document.getElementById('btn7').onclick = function () {
  if (this.innerText === '公交查询') {
    this.style.backgroundColor = "skyblue"
    this.innerText = '关闭查询'
    lineSearch()
  } else if (this.innerText === '关闭查询') {
    this.style.backgroundColor = "#C4C4C4"
    this.innerText = '公交查询'
    document.getElementById('input-card').style.display = "none"
    map.clearMap()
  }
}
// ===============================创建右键菜单
var lnglat = new AMap.LngLat(116.397, 39.918)
var origin1 = null
var destination1 = null

// ================================自定义菜单类
var menu = new ContextMenu(map)

function ContextMenu(map) {
  var me = this

  // 地图中添加鼠标工具MouseTool插件
  this.mouseTool = new AMap.MouseTool(map)

  this.contextMenuPositon = null

  var content = []

  content.push("<div class='info context_menu'>")
  content.push("  <p onclick='menu.zoomMenu(0)'>缩小</p>")
  content.push("  <p class='split_line' onclick='menu.zoomMenu(1)'>放大</p>")
  content.push("  <i class='menu-icon menu-icon-from'></i><p onclick='menu.addOrigin()'>设为起点</p>")
  content.push("  <p onclick='menu.addWaypoints()'>设为途经点</p>")
  content.push("  <p onclick='menu.addDestination()'>设为终点</p>")

  content.push("  <p onclick='menu.addMarkerMenu()'>添加标记获取经纬度</p>")
  content.push("</div>")

  // 通过content自定义右键菜单内容
  this.contextMenu = new AMap.ContextMenu({
    isCustom: true,
    content: content.join('')
  })

  //地图绑定鼠标右击事件——弹出右键菜单
  map.on('rightclick', function (e) {
    me.contextMenu.open(map, e.lnglat)
    me.contextMenuPositon = e.lnglat //右键菜单位置
  })
}

ContextMenu.prototype.zoomMenu = function zoomMenu(tag) { // 右键菜单缩放地图
  if (tag === 0) {
    map.zoomOut()
  }
  if (tag === 1) {
    map.zoomIn()
  }
  this.contextMenu.close()
}

// =========================封装获取当前经纬度方法
function getLngLat() {
  var lnglatInput = document.getElementById('lnglat')
  lnglatInput.setAttribute('value', lnglat.toString())
}
ContextMenu.prototype.addMarkerMenu = function () { // 右键菜单添加Marker标记
  this.mouseTool.close()
  this.marker = new AMap.Marker({
    map: map,
    position: this.contextMenuPositon //基点位置
  })
  this.contextMenu.close()

  // ==================infowidnow 的 innerHTML
  var infoWindowContent =
    '<div id="infoWindow" className="custom-infowindow input-card">' +
    '<label style="color:grey">当前地点</label>' +
    '<div class="input-item">' +
    '<div class="input-item-prepend">' +
    '<span class="input-item-text" >经纬度</span>' +
    '</div>' +
    '<input id="lnglat" type="text" />' +
    '</div>' +
    // 为 infowindow 添加自定义事件
    '<input id="lnglat2container" type="button" class="btn" value="获取该位置经纬度" onclick="getLngLat()"/>' +
    '</div>'

  // 创建一个自定义内容的 infowindow 实例
  this.infoWindow = new AMap.InfoWindow({
    position: this.contextMenuPositon,
    offset: new AMap.Pixel(0, -35),
    content: infoWindowContent
  })

  this.infoWindow.open(map)

  // 将当前经纬度展示在 infowindow 的 input 中

}
// 定义变量引用导航API
var driving = new AMap.Driving({
  map: map,
  panel: "panel2"
})

// 为设为起点封装方法
ContextMenu.prototype.addOrigin = function () { //右键菜单添加Marker标记
  this.mouseTool.close()
  // 创建一个 Icon
  var startIcon = new AMap.Icon({
    // 图标尺寸
    size: new AMap.Size(25, 34),
    // 图标的取图地址
    image: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/dir-marker.png',
    // 图标所用图片大小
    imageSize: new AMap.Size(135, 40),
    // 图标取图偏移量
    imageOffset: new AMap.Pixel(-9, -3)
  })
  this.origin = new AMap.Marker({
    map: map,
    position: this.contextMenuPositon, //基点位置
    icon: startIcon,
    offset: new AMap.Pixel(-9, -3)
  })
  this.contextMenu.close()
  this.origin1 = this.contextMenuPositon
}

// 为设为途径点封装方法
ContextMenu.prototype.addWaypoints = function () { //右键菜单添加Marker标记
  this.mouseTool.close()
  // 创建一个 Icon
  var viaIcon = new AMap.Icon({
    // 图标尺寸
    size: new AMap.Size(25, 34),
    // 图标的取图地址
    image: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/dir-via-marker.png',
  })
  this.waypoints = new AMap.Marker({
    map: map,
    position: this.contextMenuPositon, //基点位置
    icon: viaIcon,
    offset: new AMap.Pixel(-9, -3)
  })

  this.contextMenu.close()
  this.waypoints1 = this.contextMenuPositon
}

// 为设为终点封装方法
ContextMenu.prototype.addDestination = function () { //右键菜单添加Marker标记
  this.mouseTool.close()
  var endIcon = new AMap.Icon({
    size: new AMap.Size(25, 34),
    image: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/dir-marker.png',
    imageSize: new AMap.Size(135, 40),
    imageOffset: new AMap.Pixel(-95, -3)
  })
  this.destination = new AMap.Marker({
    map: map,
    position: this.contextMenuPositon, //基点位置
    icon: endIcon,
    offset: new AMap.Pixel(-9, -3)
  })

  this.contextMenu.close()
  this.destination1 = this.contextMenuPositon

  // 根据起终点经纬度规划驾车导航路线
  driving.search(this.origin1, this.destination1, {
    waypoints: [this.waypoints1]
  }, function (status, result) {
    // result 即是对应的驾车导航信息
    if (status === 'complete') {
      log.success('绘制驾车路线完成')
      // 因为驾车导航会自动生成相应的点标记，所以之前通过右键设置的点标记要隐藏
      menu.origin.hide()
      menu.waypoints.hide()
      menu.destination.hide()
    } else {
      log.error('获取驾车数据失败：' + result)
    }
  })
}
// menu.contextMenu.open(map, lnglat);
// ===================================输入提示
// 定义变量来接收指定搜索框用户输入的地点
var autoOptions = {
  input: "tipinput"
}
var auto = new AMap.Autocomplete(autoOptions)

// ===================================数据展示
var placeSearch = new AMap.PlaceSearch({
  pageSize: 5, // 单页显示结果条数
  pageIndex: 1, // 页码
  city: "010", // 兴趣点城市
  citylimit: true, //是否强制限制在设置的城市内搜索
  map: map, // 展现结果的地图实例
  panel: "panel", // 结果列表将在此容器中进行展示。
  autoFitView: true // 是否自动调整地图视野使绘制的 Marker点都处于视口的可见范围
}) // 构造地点查询类
AMap.event.addListener(auto, "select", select) //注册监听，当选中某条记录时会触发
function select(e) {
  placeSearch.setCity(e.poi.adcode);
  placeSearch.search(e.poi.name); //关键字查询查询
}
document.getElementById('btn1').onclick = function () {
  console.log('btn被点击了') // 功能调试
  placeSearch.clear()
  driving.clear()
  tipinput.value = ''
  log.success('清除地图信息完成')
  menu.marker.hide()
  menu.infoWindow.close()
}
document.getElementById('btn2').onclick = function () {
  console.log('btn2被点击了') // 功能调试
  auto.search(tipinput.value)
  console.log('btn2被点击了') // 功能调试
}
// =====================================加载提醒
map.on("complete", function () {
  log.success("地图加载完成！")
})
// ======================================工具条
AMap.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.OverView'], function () {
  map.addControl(new AMap.ToolBar());
  map.addControl(new AMap.Scale());
  map.addControl(new AMap.OverView({
    isOpen: true
  }))
})

// ===============================构造路线导航类