# Gaode-API
# 功能实现与设计方法
## 获取高德地图key
- 进入高德地图开放平台，注册高德地图账号、登陆、认证为开发者，然后进入个人控制台、创建新应用，在创建的应用上点击“添加key”按钮。
![](https://user-gold-cdn.xitu.io/2019/6/29/16ba30a6509fedff?w=778&h=243&f=png&s=25410)

- 这里我们需要用到的高德地图的JavaScript API ，所以点击添加按钮后我们选择Web 服务的JS API如图
![](https://user-gold-cdn.xitu.io/2019/6/29/16ba30acc9958d13?w=615&h=498&f=png&s=67767)

## 底图切换与图层显示
- 功能实现
+ 利用高德地图提供的JavaScript API 加载底图，同时增加一个新的地图控件来把原有的标准底图切换到卫星影像底图，方便了用户根据自己的实际需要能够加载恰当的背景地图，当用户点击对应的卫星图层时，底图会切换为卫星影像图，再点击图标，底图会切换为原来的标准底图。同时加入图层显示插件，可以在任一底图之上显示路况路网图层。
- 关键代码
```
// 定义一个变量来引入卫星底图API
    var satellite = new AMap.TileLayer.Satellite({
      map: map,
      zIndex: 2,
      zooms: [3, 18]
    })
   // 点击按钮实现切换卫星底图，再点击就关闭卫星底图。
     document.getElementById('btn5').onclick = function() {
      if (this.innerText === '卫星') {
        this.style.backgroundColor = "skyblue"
        this.innerText = '地图'
        satellite.show()
      } else if (this.innerText === '地图') {
        this.style.backgroundColor = "white"
        this.innerText = '卫星'
        satellite.hide()
    }
  ```
- 运行结果
![](https://user-gold-cdn.xitu.io/2019/6/29/16ba30d636ec9271?w=780&h=253&f=png&s=460510)

- 设计方法
+ 判断当用户点击按钮，按钮名称为卫星时，底图切换为卫星图层也就是卫星图层变量satellite调用show（）方法显示，同时按钮名称变为地图，当按钮名称为地图时，鼠标点击，底图会切换为标准底图，这是satellite调用hide（）方法隐藏。而在后续更是可以通过加载插件AMap.MapType来增加图层显示功能，无论是在标准底图和卫星底图为当前地图都可以在之上显示路况图层或者路网图层。两者也可以同时显示，高德地图已经把这个功能封装进AMap.MapType插件了，当我们需要的时候引用此插件即可。

## 天气查询
- 功能实现
+ 点击按钮获得当地当前的天气情况以及未来四天的天气预报显示在界面右上角部分，让用户比较简单的获取想要的天气咨询。
- 关键代码
```
var city   // 定义一个变量来接收当前地图中心点所在城市
  map.getCity(function (data) {
    city = data.city
  })
AMap.plugin('AMap.Weather', function() {
      var weather = new AMap.Weather()
      //根据上面获取到的当前城市名称city来搜索当前天气
      weather.getLive(city, function(err, data) {
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
              content: '<div id="weatherShow2" class="info" style="position:inherit;margin-bottom:0;">' + str.join('') + '</div><div class="sharp"></div>',
              isCustom: true,
              offset: new AMap.Pixel(0, -37)
            })
            infoWin.open(map, marker.getPosition())
            marker.on('mouseover', function() {
              infoWin.open(map, marker.getPosition())
            })
          }
        })

 ```
- 运行结果

![](https://user-gold-cdn.xitu.io/2019/6/29/16ba30edb3f6b177?w=779&h=273&f=png&s=175065)

- 设计方法
+ 判断当用户点击按钮，按钮名称为天气查询时，使用变量weather来引用API天气插件AMap.Weather然后调用其中的getLive方法，此方法需要传入一个地点参数作为查询地点才能得到目标地点结果，所以我在运行这个代码之前先定义一个city变量，为这个变量赋值，值为map.getCity方法得到的当前城市地点名称。
传入city函数调用方法会得到当前地点的天气咨询，但是都是数据类型，我们需要把这些数据图像化呈现出来，所以之后代码就是把得到的查询结果放置在相应的中文结果名称上，再以可视化显示到界面上。这样就完成了天气查询功能了。
另外，为了优化用户体验，可以添加一个普通的点标记来记录当前地图中心点并把得到的结果显示在此标记上面，这样我们再后续移动页面的时候不会对结果造成遮挡。
此外，天气查询功能还增加了查询未来4天天气预报的功能，也是通过变量weather来调用getForecast方法来获取结果并显示在界面上，原理同上。
## 距离测量
- 功能实现
+ 点击按钮实现进入距离测量功能，鼠标左键点击起始点，确定位置留下一个记号N，再点击下一个点得到两个点之前的直线物理距离，单位为公里（km），此时距离测量功能还没结束，还可以点击下一个地点得到三个点之间的直线距离总和，以此类推，可以供用户测量多个点的总和长度和每两个点之间的长度。按右键结束当前测量。
- 关键代码
```
var ruler // 定义一个变量来接收距离测量插件
  map.plugin(["AMap.RangingTool"], function() {
    ruler = new AMap.RangingTool(map)
  })

  document.getElementById('btn3').onclick = function() {
    console.dir(this)
    if (this.innerText === '距离测量') {
      this.style.backgroundColor = "skyblue"
      this.innerText = '关闭测量'
      ruler.turnOn()
    } else if (this.innerText === '关闭测量') {
      this.style.backgroundColor = "white"
      this.innerText = '距离测量'
      ruler.turnOff()
    }
  }
```
- 运行结果

![](https://user-gold-cdn.xitu.io/2019/6/29/16ba31070207fc8c?w=780&h=247&f=png&s=170230)

- 设计方法
+ 判断当用户点击按钮，按钮名称为距离测量时，通过定义新的变量ruler来引入API距离测量插件AMap.RangingTool(map)，来调用其封装的turnOn方法进入测量模式。
这里需要注意的是跟底图切换功能不同，这里引入API时需要传入当前地图对象map，因为该功能时需要对整个地图对象map进行一个操作调用方法实现的功能，进入测量模式后点击多个地方测量各个地点的距离和总和距离。通过用户点击鼠标右键来结束当前这一次的距离测量，但是需要注意的是此时还没有退出距离测量模式，这时再点击鼠标左键的话会进行新的距离测量方法。
所以为了提高用户体验，在原按钮上也应该增加点击按钮彻底退出距离测量模式的功能，此方法原理同底图切换功能，这里不再赘述。
## 输入提示与POI搜索
- 功能实现
+ 用户在地点查询搜索框中输入地点名称时，搜索框会自动根据用户当前输入的地点自动生成关键地点提示，并以列表的形式展现在输入框下面，可以让用户不必输入完整的地点就可以之间看到可能出现匹配的目的地地点。
当用户点击出现的匹配列表中的某一个具体地点时，则代表用户需要搜索这个地点的所在位置和相关信息，界面应该跳转到用户输入的地点，并且如果通过POI搜索得到多个结果，界面应该缩小到可以同时显示多个相关地点的程度来让用户更加直观的看到搜索结果。
如果POI搜索结果出现多个匹配的地点，需要在搜索框下面呈现这些匹配的地点并以列表图像化的形式出现在界面上，当用户点击某个匹配的地点的时候，界面应该跳到用户点击地点的所在位置并根据目标所占面积放大或缩小到适当的程度。
- 关键代码
```
// 定义变量来接收指定搜索框用户输入的地点，下面的变量tipinput是指页面元素输入框的id值，以此来接收用户在特点输入框输入的内容。
  var autoOptions = {
    input: "tipinput"
  }
  var auto = new AMap.Autocomplete(autoOptions)
  // ===========================================================数据展示
  var placeSearch = new AMap.PlaceSearch({
      pageSize: 5,                                 // 单页显示结果总条数
      pageIndex: 1,                               // 页码
             panel: "panel",                               // 结果列表将在此容器中进行展示
      city: "010",                                 // 兴趣点城市
      citylimit: true,                               //是否强制限制在设置的城市内搜索
      map: map,                                  // 展现结果的当前地图对象
      autoFitView: true                            // 选择是否自动调整当前地图视野来使绘制的 Marker点都处于当前视口的可见范围内
    })                                           // 构造地点查询类
  AMap.event.addListener(auto, "select", select) //注册监听，当选中匹配地点时会触发
  function select(e) {
    placeSearch.setCity(e.poi.adcode);                 //设置当前城市编码查询
    placeSearch.search(e.poi.name);                  //关键字查询查询
  }
```
- 运行结果
- 输入提示
![](https://user-gold-cdn.xitu.io/2019/6/29/16ba311771f3f372?w=779&h=328&f=png&s=214142)

- POI搜索

![](https://user-gold-cdn.xitu.io/2019/6/29/16ba311c133910a7?w=779&h=326&f=png&s=188462)
- 设计方法
+ 输入提示与POI搜索功能其实非常巧妙的用到了两个功能的API组合来完成。因为地点查询功能是用户使用地图的时候最常见也是最重要的功能，所以我们一般把输入框放在界面上，可以适当的通过CSS类样式做一点的美化。重点是利用输入框的ID值来记录用户的输入内容才能完成下面两个插件的功能。
为了提升用户体验，系统应该充分利用地图关键点数据库，在日常使用地图的情况下，当用户想要搜索某个地点的时候，往往会遇到目标地点名称过长或者忘记了目标地点的完整名称时，输入提示功能就有着极高的使用率和十分良好的使用体验，当用户输入目标地点前几个名称的时候，系统会根据地图关键点数据库来查询当中是否有与用户输入部分名称匹配的地点，再把这些地点以列表的形式展示给用户看，整个过程都不影响用户的正常输入。
也就是说，在不影响用户输入的情况下，给用户提供一个可供参考的地点来提高用户选择地点的准确性。同时，用户打字输入名称一般都是很快的，时间可以以秒位单位，为了提高搜索数据库的效率，可以给自动输入设定限定城市搜索，不过为了提高数据的范围性，本系统还是使用全国的范围进行搜索目的来提示用户。
为了接收到HTML界面用户在输入框输入的地点名称，我们先定义一个变量autoOptions来根据输入框的ID值来接收用户在此输入框输入的内容。然后定义一个新变量auto引用API输入提示AMap.Autocomplete(autoOptions)，传入刚才的变量，根据这个变量得到的内容查询数据库并把得到的结果呈现在输入框下方。
+ 这时，为输入提示列表中的每一条数据都绑定一个监听事件，通过上面的代码可以看到当用户选择列表中的某条数据的时候，会触发预先封装好的select 方法，而select方法的功能就是POI搜索功能。
定义一个变量placeSearch引用POI搜索API AMap.PlaceSearch。在引用的同时可以给这个POI搜索API功能设置相应的属性，比如本系统设置pageSize为5意思是查询到的数据会以每页5条数据展示出来，citylimit为true则表示在当前城市进行POI搜索，panel的值表示呈现结果的容器应该放到界面的哪一个元素内，这个容器需要在HTML页面中预先设置好标签ID值来呈现结果。其他属性可以看上面代码或者在API参考手册中自己查看，每一个属性都有其意义和重要性所在。
触发POI搜索功能后得到的具体地点结果会呈现到panel属性中，系统可以对这个容器做相应的CSS样式调整来让界面更加易用，此时得到结果的同时，地图界面会移动到搜索结果所在地。如果通过POI搜索得到多个地点，因为我们在引用此API时设置了其属性autoFitView的值为true，那么界面会调整视野把所有搜索到的地点呈现在当前窗口可见范围内。这个功能对于有多个出入口和停车场的大型建筑或者设施非常方便，如学校、购物广场等。当然更多的是在搜索一个城市的连锁店上比较常见，如KFC，金拱门等。
## 梅州公交线路查询
- 功能实现
点击按钮实现查询梅州市公交某一路的路线图，默认查询梅州公交5路，用户可以在下面出现的查询框中输入想要查询的公交路线图。
- 关键代码
```
var linesearch
    var busLineName
    /*公交线路查询*/
    function lineSearch() {
      busLineName = document.getElementById('BusLineName').value
      document.getElementById('input-card').style.display = "block"
      console.log(busLineName)
      if (!busLineName) return
      //定义变量先实例化公交线路查询，然后选择取回一条路线
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
```
- 运行结果

![](https://user-gold-cdn.xitu.io/2019/6/29/16ba31500700fcd2?w=778&h=363&f=png&s=224052)

- 设计方法
+ 用户点击按钮，系统会预先将设定的好梅州公交5路呈现给用户，先获取路线路的所有路线，再将路线绘制成路线图，并同时加入起点和终点的标志，下面的查询框中的查询按钮也通过onclick绑定了查询功能。让用户能够自己选择查询某条路线来选择查询的路线。

## 右键菜单
- 功能实现
+ 在日常使用地图的时候，用户一般的操作就只有鼠标拖拽，左键点击，右键菜单了，可以说鼠标的右键菜单功能是很重要的一个功能，我们可以在菜单中设置一些比较实用的功能，如放大、缩小、设置起点、途径点、终点以及添加标记等等，所以这个功能的重点不是其中某一个功能，而是实现右键打开的菜单中出现我们想要的功能，同时，为这些菜单上的选项绑定我们需要的功能才是最重要的。
- 关键代码
```
 //  =====================================================自定义右键菜单类
  var menu = new ContextMenu(map)
  function ContextMenu(map) {
    var me = this
    // 地图中添加鼠标工具MouseTool插件
    this.mouseTool = new AMap.MouseTool(map)
    this.contextMenuPositon = null
    var content = []                              // 创建一个容器来设置右键菜单的样式
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

    //地图map绑定鼠标右击事件——弹出右键菜单
    map.on('rightclick', function(e) {
      me.contextMenu.open(map, e.lnglat)
      me.contextMenuPositon = e.lnglat                    //右键菜单出现的位置
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
```
- 运行结果

![](https://user-gold-cdn.xitu.io/2019/6/29/16ba315ae4dc5948?w=779&h=354&f=png&s=228860)

- 设计方法
+ 高德地图的右键菜单API不需要引入插件，直接定义一个变量引用API右键菜单AMap.ContextMenu（map）传入一个地图对象就可以了，这样我们地图有可以出现一个菜单列表，但是按照我们普通用户的实用习惯一般都是通过点击鼠标右键来生成这个菜单，所以本系统还需要定义一个变量mouseTool来引用一个API鼠标工具AMap.MouseTool（map）。
这里本系统通过DOM操作的方式来设置右键菜单的文字内容和CSS样式，所以定义一个变量content通过push方法来不断添加需要的功能名称，这里的重点是通过DOM操作可以给这些功能都增加一个点击事件oncilck的名称。然后再为这个菜单的出现位置绑定一个地图右键事件，当通过地图对象map的on事件绑定，使用其参数(e）来获取鼠标当前位置的经纬度lnglat。通过上面一系列设置能够实现用户在地图任一地点点击鼠标右键能让右键的菜单正确的出现在用户点击的地方。
+ 因为这个功能涉及的方法很多，所以本系统采用重新封装一个新的构造函数ContextMenu（map）为后面绑定菜单各自功能的操作更加方便。
这里我们以右键缩放地图功能为例，通过ContextMenu.protorype.zoomMenu也就是给这个构造函数的原型prototype添加一个方法属性zoomMenu来封装缩放功能的方法，通过这个方法使用一个参数（tag）来判断用户点的是放大还是缩小，这里就需要上文所说的onclick事件，在设置右键菜单中的放大、缩小两个名称菜单的同时给他们绑定好了onclick事件，点击就调用zoomMenu（tag）方法，参数上本系统选择0为放大，1为缩小，最后不要忘记点击事件后要使用close方法把右键菜单关闭。

## 添加标记获取经纬度
- 功能实现
+ 在上文通过封装一个新的构造函数ContextMenu来初始化了右键菜单，那么添加标记功能也可以通过右键菜单来执行，获取目标点经纬度是用户使用地图很常用的一个功能，地图上的每一个点都可以通过经纬度来表达其所在位置，所以本系统通过要让用户在目标点右键出现菜单中选择添加标记获取经纬度功能来获取目的点的经纬度并以数据的形式直接展现在点标记上面。
- 关键代码
```
//=========================封装获取当前经纬度方法
  function getLngLat() {
    var lnglatInput = document.getElementById('lnglat')
    lnglatInput.setAttribute('value', lnglat.toString())
  }
  ContextMenu.prototype.addMarkerMenu = function() { // 右键菜单添加Marker标记
    this.mouseTool.close()
    this.marker = new AMap.Marker({
      map: map,
      position: this.contextMenuPositon //基点位置
    })
    this.contextMenu.close()

    // ==================infowidnow 窗口的 innerHTML
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

    // 创建自定义内容的 infowindow 实例
    this.infoWindow = new AMap.InfoWindow({
      position: this.contextMenuPositon,
      offset: new AMap.Pixel(0, -35),
      content: infoWindowContent
    })
    this.infoWindow.open(map)
    // 将当前经纬度展示在 infowindow 的 input 中
  }
```
- 运行结果

![](https://user-gold-cdn.xitu.io/2019/6/29/16ba31675ea1eadd?w=779&h=363&f=png&s=230560)
- 设计方法
+ 这个功能主要还是依靠右键菜单绑定的onclick来触发，首先获取当前经纬度这个功能可以先封装为一个方法getLngLat。然后就是通过DOM操作定义变量infoWindowContent来创建要出现在选定地点的信息窗口，id值为infoWindow，信息窗口也是高德地图JavaScript API一个比较实用的功能，可以通过设置其position属性来设置这个信息窗口出现在界面上的位置，这里信息窗体的内容content就是上面的变量infoWindowContent。
还有添加标记也是需要用到地图map的API点标记AMap.Marker,同理也是需要定义一个变量来引用此API，但是这个功能不同，因为是在构造函数ContextMenu内，所以这里需要把这个变量作为ContextMenu的一个新属性来引用这个API。
最后回来右键菜单中的“添加标记获取经纬度”选项，用户点击这个选项，会在鼠标所在经纬度添加一个点标记，并且在点标记上面出现一个信息窗口，上面有一个按钮点击获取经纬度，当用户点击这个按钮时，再触发之前封装好的getLngLat方法，然后把得到的内容显示在经纬度的窗口内。
## 设置起终点规划驾车导航
- 功能实现
+ 规划驾车导航一般情况下需要一个起点和一个终点，系统就可以通过算法的数据将规划路线从起点到终点。所以用户在起点处点击右键，在弹出的菜单中选择设为起点，此时地图会在当前鼠标位置生成一个点标记，名称为“起”，然后用户可以选择一个途径点，同样在途径点处点击鼠标右键在弹出的菜单中选择设为途径点，最后用户在想要导航到的终点处点击鼠标右键，在弹出的菜单中选择设为终点。在用户点击后，地图会自动出现一个导航信息列表，其内容包括选择走哪一条路走多米后左转或者右转等导航信息。而在地图上会出现由起点到途径点再到终点的路线。这就是规划驾车导航功能。
- 关键代码
```
// 定义变量引用导航API
  var driving = new AMap.Driving({
    map: map,
    panel: "panel2"
  })
  // 为设为起点封装方法
  ContextMenu.prototype.addOrigin = function() { //右键菜单添加Marker标记
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
  ContextMenu.prototype.addWaypoints = function() { //右键菜单添加Marker标记
    this.mouseTool.close()
    var viaIcon = new AMap.Icon({
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
  ContextMenu.prototype.addDestination = function() { //右键菜单添加Marker标记
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
      }, function(status, result) {
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
```
- 运行结果

![](https://user-gold-cdn.xitu.io/2019/6/29/16ba3176071f16fd?w=778&h=362&f=png&s=227997)

- 设计方法
+ 这个功能是本系统较为复杂的功能，因为是需要用到右键菜单来设置起点、途径点和终点的，先是在右键菜单中加入设置起点、设置途径点、设置终点三个选项，分别给三个选项都设置onclick事件为addOrigin、addWaypoints、addDestination。
用户在某一点右键弹出菜单，然后点击设置起点，这个时候系统首先会通过close方法关闭菜单，然后再用户鼠标的当前位置放置一个点标记，同时，为了提高用户体验，这里用到了地图对象map的Icon属性API，也就是字体图标，为了让用户知道哪个是起点，哪个是途径点，哪个是终点，定义变量startIcon、viaIcon、endIcon分别为其三个关键点的图标，三个图标是有样式属性的起、经、终三个中文名称的字体图标。
+ 三个设为关键的方法都是通过给构造函数ContextMenu新增方法来添加，这样做有利于起点、途径点和终点的经纬度保存到变量中，再把变量作为构造函数的新属性的值。用户添加好起点、途径点和终点时，三个关键点的经纬度都保存好了。
+ 接下来就时通过定义一个变量driving来引用高德地图的导航功能API也就是AMap.Driving，传入地图对象map和导航信息出现的一个HTML标签已经提前准备的窗口panel2。
本系统选择在当用户选择设为终点的选项后，立即通过变量driving调用其search方法，把之前保存在构造函数的起点、途径点和终点的变量传进入，然后在回调函数中增加导航完成提醒和获取驾车数据失败提醒。