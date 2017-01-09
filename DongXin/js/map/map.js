 
    function mgMap(_mapId, _mapType) {
        this.map = null;
        this.mapId = _mapId;
        this.mapType = _mapType;
        this.MAP_CENTER_LAT = 39.91500;
        this.MAP_CENTER_LNG = 116.404;
        this.DEFAULT_ZOOM = 6;   //第一次打开地图显示级别
        this.RefreshTime = 15;
        this.InfoWindow; 
        this.isAutoSetZoom = true;
        this.isRefresh = false; //是否显示倒计时跟新控件
        this.TrafficControl = false; //是否默认加载交通流量状态
        this.isLocateMyCity = false; //是否定位到当前城市
        this.onLocateComplete = function (data) { }; //定位成功后回调函数
        this.onLocateError = function (data) { }; //定位失败后回调函数
        this.panToLocate = false; //加载地图时是否把地图中心设为当前位置
        this.showNavigation = true; //是否显示地图默认的定位按钮
       // this.getCurrentPosition = function () { };
        this.AMAP = "AMAP";
        this.BAIDU = "BAIDU";
    };
    mgMap.prototype.loadMap = function ( ) {
      	mapperKey= this.mapType;
        var _this = this; 
        switch (_this.mapType) {

            case _this.BAIDU: 
                // 百度地图API功能 
                _this.map = new BMap.Map(_this.mapId, { enableMapClick: false });    // 创建Map实例
                _this.centerAndZoom(_this.MAP_CENTER_LNG, _this.MAP_CENTER_LAT, _this.DEFAULT_ZOOM);  // 初始化地图,设置中心点坐标和地图级别
               // _this.setCenter(116.404, 39.91500);
               // _this.setZoom(8); 
                _this.map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
                _this.map.addControl(new BMap.MapTypeControl({ mapTypes: [BMAP_NORMAL_MAP, BMAP_HYBRID_MAP], offset: new BMap.Size(10, 10) }));  //添加 右上角混合 地图
                _this.map.addControl(new BMap.ScaleControl({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT, offset: new BMap.Size(20, 55) }));// 右下角，添加比例尺
                _this.map.enableKeyboard();//启用键盘上下左右键移动地图
                _this.map.enableDoubleClickZoom();
                if (_this.TrafficControl) {
                    var ctrl = new BMapLib.TrafficControl({
                        showPanel: true  //是否显示路况提示面板 ,
                        , offset: new BMap.Size(10, 30)
                    });
                    _this.map.addControl(ctrl);
                    ctrl.setAnchor(BMAP_ANCHOR_TOP_RIGHT);
                }
                // 添加带有定位的导航控件
                var navigationControl = new BMap.NavigationControl({ 
                    // 靠左上角位置
                    anchor: BMAP_ANCHOR_BOTTOM_LEFT,
                   //  LARGE类型
                    type: BMAP_NAVIGATION_CONTROL_LARGE,
                   //  启用显示定位
                    enableGeolocation: true,
                    showZoomInfo: true,
                    offset: new BMap.Size(10, 93)
                });
                _this.map.addControl(navigationControl);
				if(_this.showNavigation)
					_this.navigationControl();
               
                if (_this.isLocateMyCity) {
                    var myCity = new BMap.LocalCity();  //根据ip获取所在城市
                    myCity.get(function (result) {
                        _this.map.setCenter(result.name);
                    });
                }
              
                if (_this.isRefresh) { 
                    // 定义一个控件类,即function
                    function ZoomControl() {
                        // 默认停靠位置和偏移量
                        this.defaultAnchor = BMAP_ANCHOR_TOP_RIGHT;
                        this.defaultOffset = new BMap.Size(10, 1); //(x,y)
                    }

                    // 通过JavaScript的prototype属性继承于BMap.Control
                    ZoomControl.prototype = new BMap.Control();

                    // 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
                    // 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
                    ZoomControl.prototype.initialize = function (map) {
                        // 创建一个DOM元素
                        var div = document.createElement("div");
                        div.id = "div_refreshTime";
                        // 添加文字说明
                        div.appendChild(document.createTextNode(""));
                        // 设置样式
                        div.style.width = "auto";
                        div.style.cursor = "pointer";
                        div.style.border = "1px solid gray";
                        div.style.backgroundColor = "white";
                        // 添加DOM元素到地图中 
                        map.getContainer().appendChild(div);
                        // 将DOM元素返回 
                        return div;
                    }

                    // 创建控件
                    var myZoomCtrl = new ZoomControl();

                    // 添加到地图当中
                    _this.map.addControl(myZoomCtrl);
                    $("#div_refreshTime").html(" <strong>10秒更新<strong/>  <input type='checkbox' id='chkRefresh' checked='true' /> ");
                }

                break;
            case _this.AMAP:
                _this.map = new AMap.Map(_this.mapId, {
                    resizeEnable: true,
                    zoom: _this.DEFAULT_ZOOM,
                    view: new AMap.View2D({
                        center: new AMap.LngLat(116.397428, 39.90923),
                        zoom: 13
                    })
                    // center: [116.397428, 39.90923]
                });
             
                _this.getGeolocation();
               

                // 增加 卫星地图 切换功能
                //_this.map.plugin(["AMap.MapType"], function () {
                //    var type = new AMap.MapType({ defaultType: 0 });
                //    _this.map.addControl(type);
                //});
              
                //var toolBar = new AMap.ToolBar({
                //    visible: true
                //   })
                //_this.map.plugin(["AMap.ToolBar"], function () {   //在地图中添加ToolBar插件      
                //    toolBar = new AMap.ToolBar({ locate: true, offset: AMap.Pixel(220, 220) });
                //    _this.map.addControl(toolBar); 
                //});
                //var map = _this.map;
                //map.plugin(["AMap.Scale"], function () {    //加载比例尺插件      
                //    scale = new AMap.Scale();
                //    _this.map.addControl(scale);
                //    scale.show();
                //});
                //_this.map.addControl(toolBar);
                //function onComplete(data) {
                //    var str = '<p>定位成功</p>';
                //    str += '<p>经度：' + data.position.getLng() + '</p>';
                //    str += '<p>纬度：' + data.position.getLat() + '</p>';
                //    str += '<p>精度：' + data.accuracy + ' 米</p>';
                //    str += '<p>是否经过偏移：' + (data.isConverted ? '是' : '否') + '</p>';

                //  //  _this.panTo(data.position.getLng(), data.position.getLat());
                //}
                //_this.onLocateError = function (data) {
                //    new amModal({ msg: "定位失败,请重试." }).open();
                //}
                // geolocation.getCurrentPosition();
                break;
        }
    };
	 
    //调整地图显示级别
    mgMap.prototype.setZoom = function (Zoom) {
        var _this = this;
        switch (_this.mapType) {
            case _this.BAIDU: 
                _this.map.setZoom(Zoom);
                break;
            case _this.AMAP:
                _this.map.setZoom(Zoom);
                break;
        }
    };

    mgMap.prototype.panTo = function (lng, lat) {
        var _this = this;
        switch (_this.mapType) {
            case _this.BAIDU:
                //var point = new BMap.Point(lng, lat);
                 var point =_this.Point(lng, lat)
                _this.map.panTo(point);
                break;
            case _this.AMAP: 
                _this.map.panTo([lng,lat]);
                break;
        }
    };
    ///设置地图中心
    mgMap.prototype.setCenter = function (lng, lat) {
        var _this = this; 
        switch (_this.mapType) {
            case _this.BAIDU:
                var point = new BMap.Point(lng, lat);
                _this.map.setCenter(point);
                break;
            case _this.AMAP:
                _this.map.panTo([lng, lat]);
                break;
        }
    };

    mgMap.prototype.getCenter = function () {
        var _this = this;
        switch (_this.mapType) {
            case _this.BAIDU:
                _this.map.getCenter();
                break;
            case _this.AMAP:
                return _this.map.getCenter();
        }
    }
    ///设置地图中心已经级别
    mgMap.prototype.centerAndZoom = function (lng, lat, zoom) {
        var _this = this;
        switch (_this.mapType) {
            case _this.BAIDU:
                var point = new BMap.Point(lng, lat);
                _this.map.centerAndZoom(point, zoom);
                break;
            case _this.AMAP:
                _this.map.setZoomAndCenter(zoom, [lng, lat]); 
                break;
        }
    }
    ///清除地图上的覆盖物
    mgMap.prototype.clearOverlays = function (opts) {
        var _this = this;
        switch (_this.mapType)
        {
            case _this.BAIDU: 
                if (opts && opts.clearAll) { 
                    _this.map.clearOverlays();
                    break;
                } 
                if (opts && opts.clearMarker && opts.clearMarker.length > 0) { 
                 	for (var i =0; i< opts.clearMarker.length; i++) { 
                 		_this.map.removeOverlay(opts.clearMarker[i]);
                 	}
                }
                break;
            case _this.AMAP:
                try {
                    if (opts && opts.clearMarker && opts.clearMarker.length > 0) { 
                        _this.map.remove(opts.clearMarker);
                    } else {
                        _this.map.clearMap();
                    }
                } catch (e) {
                    console.log("clearOverlays>...",e);
                } 
                break;
        }
    }
    ///画线
    mgMap.prototype.polyLine = function (points, args) {
        var _this=this;
        switch (this.mapType) {
            case _this.BAIDU:
                var polyline = new BMap.Polyline(points, args);  //定义折线 
                _this.map.addOverlay(polyline);     //添加折线到地图上
                return polyline;
                break;
            case _this.AMAP:
                var polyline = new AMap.Polyline(points);
                return polyline;
                break;

        }
    }
    //计算2点之间的距离
    mgMap.prototype.getDistance = function (point1, point2) {
        var _this =this;
        switch (this.mapType) {
            case _this.BAIDU: 
                return this.map.getDistance(point1, point2);
                break;
            case _this.AMAP:
                break;
        }
    }

    mgMap.prototype.Point = function(lon,lat) {
        var _this = this;
        switch (_this.mapType) {
            case _this.BAIDU: 
                return new BMap.Point(lon,lat); 
            case _this.AMAP:
                return [lon, lat]; 
        }
    }

    mgMap.prototype.style = function(style) { 
        try {
           this. map.setMapStyle({ style: style });
        } catch (e) {
            alert(e);
        } 
    }

    mgMap.prototype.setFitView = function (points) {
        var _this = this;
        try {
            switch (this.mapType) {
                case _this.AMAP:
                    _this.map.setFitView();
                    break;
                case _this.BAIDU:
                	_this.map.setViewport(points);　
                    break;
            }
        } catch (e) {
            console.log("setFitView>..");
        }
      
    }

    mgMap.prototype.setMapType = function (par) {
        var _this = this;
        switch (_this.mapType) {
            case _this.BAIDU:
                //BMAP_HYBRID_MAP 卫星，BMAP_PERSPECTIVE_MAP 2D，BMAP_NORMAL_MAP 普通地图
                _this.map.setMapType(par);
                break;
            case _this.AMAP:
                _this.map.plugin(["AMap.MapType"], function () {
                    //地图类型切换
                    var type = new AMap.MapType({
                        defaultType: par[0] == undefined ? 0 : par[0], //  0是普通地图，1是卫星地图
                        showTraffic: par[1] == undefined ? false : par[1] //是否打开 路况 
                       //showRoad: par[2] == undefined ? true : par[2],  //是否打开路网 
                    });
                   // console.log((par[0] == undefined ? 0 : par[0]), (par[1] == undefined ? true : par[1]) );
                    _this.map.addControl(type);
                     $("#" + _this.mapId + " div.amap-maptypecontrol").hide(); //隐藏高德地图自带的切换图标
                });
               break;
        }
    }
 	
 	mgMap.prototype.navigationControl= function(){
 		var _this =this;
 		switch (_this.mapType){
 			case _this.BAIDU:
 				 // 添加定位控件
		        var geolocationControl = new BMap.GeolocationControl({offset: new BMap.Size(10, 55)}   );
		        geolocationControl.addEventListener("locationSuccess", _this.onLocateComplete); //定位成功回调函数
		        geolocationControl.addEventListener("locationError", _this.onLocateError);//定位失败回调函数
		        _this.map.addControl(geolocationControl);
 				break;
			case _this.AMAP:
			
 				break;
 		}
 		
		
	}
    
    //获取当前位置
    mgMap.prototype.getGeolocation = function (callback) {
        var _this = this;
        var geolocation = null;//, result = document.getElementById('result');
        _this.map.plugin('AMap.Geolocation', function () {
            geolocation = new AMap.Geolocation({
                enableHighAccuracy: true,//是否使用高精度定位，默认:true
                timeout: 10000,          //超过10秒后停止定位，默认：无穷大
                maximumAge: 0,           //定位结果缓存0毫秒，默认：0
                convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
                showButton: true,        //显示定位按钮，默认：true
                buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
                buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
                showCircle: false,        //定位成功后用圆圈表示定位精度范围，默认：true
                panToLocation: false,     //定位成功后将定位到的位置作为地图中心点，默认：true
                zoomToAccuracy: true      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
            });
            _this.map.addControl(geolocation);
            AMap.event.addListener(geolocation, 'error', _this.onLocateError);      //返回定位出错信息
            if (callback) {
                console.log("callback", callback);
                AMap.event.addListener(geolocation, 'complete', callback);
                geolocation.getCurrentPosition();
                return; 
            } else {
                AMap.event.addListener(geolocation, 'complete', _this.onLocateComplete);//返回定位信息
            }
            console.log(_this.panToLocate);
            if (_this.panToLocate) {
                geolocation.getCurrentPosition();
            }
           
        });
    }
	 
    function Marker(options) {
        this.map = options.map;
        this.mapType = options.mapType;
        this.DeviceID = options.DeviceID;
        this.lat = options.lat;
        this.lng = options.lng;
        this.course = options.course || 0;
        switch (this.mapType) {
            case "BAIDU":
                if (options.iconId == undefined) {
                    this.iconId = 1; //图标ＩＤ
                } else {
                    this.iconId = options.iconId;
                } if (options.line == undefined) {
                    this.line = "Online";// 是否在线
                } else {
                    this.line = options.line;
                } if (options.course == undefined) {
                    this.course = "0";  //方向
                } else {
                    this.course = options.course;  //方向
                } if (options.lat == undefined || options.lng == undefined) { 
                    return;
                } 
                this.titleText = options.titleText;
                if (options.marker) {
                   this.marker = options.marker;
                }
                //var myIcon = GetBaiduIcon(options.iconId, options.line, options.course); //new BMap.Icon("http://developer.baidu.com/map/jsdemo/img/fox.gif", new BMap.Size(300, 157));
                //var point = new BMap.Point(options.lng, options.lat);
                //this.marker = new BMap.Marker(point, { icon: myIcon });  // 创建标注 
               
              //  if (options.titleText != undefined) { 
                 //   this.setMarkerTitle({ marker: marker, text: options.titleText });
               // }
                //_this.map.addOverlay(marker);
                //marker.addEventListener("click", function (e) {
                    //$("#a_device_" + v["SerialNumber"]).trigger("click");
                    //options.callBack();
                //});
                break;
            case _this.AMAP:
              
                break;
        }
    }
    
    Marker.prototype.show = function (opts) { 
        var _this = this;
        switch (_this.mapType) {
            case "BAIDU": 
                var point = new BMap.Point(_this.lng, _this.lat);
                var myIcon ;
                if (opts.icon) {
                	myIcon = new BMap.Icon(opts.icon, new BMap.Size(28, 28)); 
                }else{
                	//myIcon = GetBaiduIcon(this.iconId || 1, this.line, this.course); 
                }
                //var myIcon = opts.icon || GetBaiduIcon(this.iconId || 1, this.line, this.course); 
                var marker = new BMap.Marker(point,  { icon: myIcon });  // 创建标注, { icon: myIcon }
                _this.marker = marker;
                _this.map.addOverlay(marker); 
                if (opts.showTitle) {
                    var title = opts && opts.titleText || _this.titleText;
                    _this.setMarkerTitle({ marker: marker, text: title });
                } 
                break;
            case "AMAP":
                var marker = new AMap.Marker({
                    map: _this.map,
                    position: [_this.lng, _this.lat],
                    angle :_this.course - 90,
                    offset: new AMap.Pixel(-15, -8), //相对于基点的偏移位置
                    icon: new AMap.Icon({
                         size: new AMap.Size(32, 16),  //图标大小
                         image: opts.icon || "/images/point.gif", 
                    })
                }); 
                _this.marker = marker;
                break;
        }
    };
 
    Marker.prototype.addEventListener = function (type,callBack) { 
        var _this = this;
        if (this.mapType == "BAIDU") { 
            this.marker.addEventListener(type, function (e) { 
                callBack(_this.DeviceID);
            });
        } else if (this.mapType == _this.AMAP){
            AMap.event.addListener(this.marker, type, function () {
                //  infoWindow.open(map, marker.getPosition());
                callBack(arguments);
            });
        }
    }

    Marker.prototype.clearOverlays = function (opts) {
        switch (this.mapType) {
            case "BAIDU":
                if (opts.marker) {
                    this.map.removeOverlay(opts.marker);
                    return;
                }
                var mkrs = this.map.getOverlays();
                for (var i = 0; i < mkrs.length; i++) { 
                    if (mkrs[i].constructor.name == "ic" && !opts.clearAll) {
                        continue;
                    }
                    this.map.removeOverlay(mkrs[i]); 
                }
                //this.map.clearOverlays();
                break;
        }
    }

    Marker.prototype.setMarkerTitle = function (opts) {
        var text = opts.text == undefined ? this.titleText : opts.text;
        var marker = opts.marker || this;
        var label = new BMap.Label(text, { offset: new BMap.Size(-63, -40) });
        label.setStyle({
            display: "block",
            textAlign: "center",
            width: "152px",
            lineHeight: "35px",
             border: "0px solid blue",
           // backgroundColor:"pink",
            background: "url(/images/map/label_bg.png)"
        });
        marker.setLabel(label);
    }

    function InfoWindow(opts) { 
        this.mapType = opts.marker.mapType; 
        this.InfoWindow;
        switch (this.mapType) {
            case "BAIDU":
                break;
            case "AMAP": 
                this.marker = opts.marker.marker;
                break;
        }
        this.DeviceId = opts.DeviceID;
        this.map = opts.map;

    }
    InfoWindow.prototype.addInfoWindow = function (opts) {
        var _this = this;
        switch (this.mapType) {
            case "BAIDU":
                opts.map = this.map;
                opts.point = opts.point;
                var myCompOverlay = new ComplexCustomOverlay(opts);
                this.CompOverlay = myCompOverlay;
                this.map.addOverlay(myCompOverlay);
                break;
            case "AMAP":
                _this.InfoWindow = new AMap.InfoWindow({
                    content: opts.html,
                    offset: new AMap.Pixel(-3
                        , -0), //相对于基点的偏移位置
                   // offset: new AMap.Pixel(0, -30)
                });
                _this.InfoWindow.open(this.map, this.marker.getPosition());
                break;
        }
    }
    InfoWindow.prototype.setInfoWindowPixel = function () {
        var _this = this; 
        //this.CompOverlay.setPixel(new BMap.Point(116.407845, 39.914101));
    }
    InfoWindow.prototype.remove = function () {
        $("#divInfoWindow").parent().remove();
    }
 	
 	function Circle(opts)
 	{
 		this.map = opts.map;
 		this.mapType = opts.mapType;
 		this.radius = opts.radius;
 		this.point = opts.point;
 		this.geofenceid=null;
 		switch(this.mapType){
 			case "BAIDU": 
 				var circle = new BMap.Circle(this.point,this.radius);
 				opts.map.addOverlay(circle); 
 				this.circle = circle;
 				break;
 			case"AMAP":
 			
 				break;
 		}
 	}
 	///开启圆编辑功能
 	Circle.prototype.enableEditing = function () {
 		var _this = this;
 		switch (_this.mapType){
 			case "BAIDU":
 				_this.circle.enableEditing();
 				break;
 			default:
 				break;
 		}
 	}
 	///关闭圆编辑功能
 	Circle .prototype.disableEditing =function () {
 		var _this = this;
 		switch (_this.mapType){
 			case "BAIDU":
 				_this.circle.disableEditing();
 				break;
 			case"AMAP":
 				break;
 		}
 	}
 	///设置圆形的半径，单位为米。
 	Circle .prototype.setRadius = function (radius) {
 		var _this = this;
 		switch (_this.mapType){
 			case "BAIDU":
 				_this.circle.setRadius(radius);
 				break;
 			case"AMAP":
 				break;
 		}
 	}
 	Circle.prototype.getCenter = function () {
 		var _this = this;
 		switch (_this.mapType){
 			case "BAIDU":
 				return	_this.circle.getCenter();  
 			case"AMAP":
 				break;
 		}
 	}
 	
 	Circle.prototype.setCenter = function (point) {
 		var _this = this;
 		switch (_this.mapType){
 			case "BAIDU":
 				_this.circle.setCenter(point);  
 				break;
 			case"AMAP":
 				break;
 		}
 	}
 	
 	Circle.prototype.getRadius = function () {
 		var _this = this;
 		switch (_this.mapType){
 			case "BAIDU":
 				return	_this.circle.getRadius();  
 			case"AMAP":
 				break;
 		}
 	}
 	
    function ComplexCustomOverlay(opts) { 
        if (opts.isOnly || opts.isOnly == undefined) {
            var mkrs = opts.map.getOverlays();
            for (var i = 0; i < mkrs.length; i++) {
                if (mkrs[i].constructor.name == "ic") {
                    opts.map.removeOverlay(mkrs[i]);
                } 
            }
            if(document.getElementById("divInfoWindow")!= undefined)
            removeElement(document.getElementById("divInfoWindow")); 
        }
        function removeElement(_element){
	         var _parentElement = _element.parentNode;
	         if(_parentElement){
	                _parentElement.removeChild(_element);
	         }
		}
        this.opts = opts;
        this._point = opts.point;
        this._html = opts.html;
        this._overText = opts.mouseoverText;
       
    }
 
    if (typeof (BMap) != "undefined") {
        ComplexCustomOverlay.prototype = new BMap.Overlay();
        ComplexCustomOverlay.prototype.initialize = function (z_map) {
        	
            this._map = z_map;
            var div = this._div = document.createElement("div");
            div.id = "divInfoWindow";
            div.style.position = "absolute";
            div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat);
            div.style.backgroundColor = "#EFEFEF";
            div.style.border = "0px solid #A7C0E0";
            div.style.color = "#000000";
            div.style.height = this.opts.style.height; 
            div.style.width =  this.opts.style.width;  
           
            div.style.padding = "2px";
            div.style.lineHeight = "20px";
            //div.style.whiteSpace = "nowrap";
            div.style.MozUserSelect = "none";
            div.style.zIndex = 5001;
            div.style.fontSize = "12px"
 
            var span = this._span = document.createElement("span");
            span.style.width = div.style.width;
            span.style.height = div.style.height; 
            div.appendChild(span);
            //span.appendChild(document.createTextNode(this._html));
           
            var close = this._close = document.createElement("a");
            close.style.right = "0px";  
            close.style.top = "-3px";
            close.style.position = "absolute";
            close.style.fontSize = "20px";
            close.style.cursor = "pointer";
            close.style.textDecoration = "none";
            close.title = "关闭";
            close.id = "infoWiindowClose";
            close.onclick = function () {
                div.style.display = "none";
            }
            //兼容移动端浏览器
            close.addEventListener("touchstart", function (e) {
                e.preventDefault();
                div.style.display = "none";
            })
            close.appendChild(document.createTextNode("×"));
            //div.appendChild(close);
    
            var arrow = this._arrow = document.createElement("div");
            arrow.style.background = "url(images/maps/label.png) no-repeat center";
            arrow.style.position = "absolute";
            arrow.style.width = "11px";
            arrow.style.height = "10px";
            arrow.style.top = (this.opts.style.height.replace('px', '') ) +"px";
            arrow.style.left = (this.opts.style.width.replace('px', '') / 2 )+"px";
            arrow.style.overflow = "hidden";
            arrow.style.zIndex = 5002;
            //div.appendChild(arrow);

            //div.onmouseover = function () {
            //    this.style.backgroundColor = "#6BADCA";
            //    this.style.borderColor = "#0000ff";
            //    z_index = this.style.zIndex;
            //    this.style.zIndex = 5000;
            //    this.getElementsByTagName("span")[0].innerHTML = that._overText;
            //    arrow.style.backgroundPosition = "0px -10px";
            //}

            //div.onmouseout = function () {
            //    this.style.backgroundColor = "#EE5D5B";
            //    this.style.borderColor = "#BC3B3A";
            //    this.style.zIndex = z_index;
            //    this.getElementsByTagName("span")[0].innerHTML = that._html;
            //    arrow.style.backgroundPosition = "0px 0px";
            //}
            this.opts.map.getPanes().labelPane.appendChild(div);
            //div.parentNode.appendChild(arrow);
		 
            if (this.opts.class) {
                $(div).addClass(this.opts.class);
            }
            return div;
        }
        ComplexCustomOverlay.prototype.draw = function () {
            var z_map = this._map;
            var pixel = z_map.pointToOverlayPixel(this._point); 
            this._div.style.left = pixel.x - (this.opts.style.width.replace('px', '') / 2) + "px";
            this._div.style.top = pixel.y - (parseInt(this._div.style.height) + 30) + "px";
            var top = (this.opts.style.height.replace('px', '') - 0);;
            var left = (this.opts.style.width.replace('px', '') / 2 - 11); 
         
            var span = '<span class="mui-icon iconfont icon-daosanjiao" style="position:absolute;z-index:4999;color:#A6A6A6;font-size:20px;top:' + top + 'px;left:' + left + 'px"></span>';
         
            this._span.innerHTML = this.opts.html + span;  
        }
    }
   

    //只用于百度地图
    function GetBaiduIcon(t, s, c) { 
        if (s == "Arrears") {
            s = "Offline";
        }
        var bIcon = new BMap.Icon("/images/map/carIcon/27_0.png", new BMap.Size(12, 20));
        var course = parseFloat(c);
        t = parseInt(t);
        var icon = "";
        if ((course >= 0 && course < 22.5) || (course >= 337.5 && course < 360) || course >= 360) // 0,360
        {
            if (t == 1) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_27_0.png";
                } else {
                    icon = "/images/map/carIcon/27_0.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 2) {
                icon = "/images/map/carIcon/2.png";
                bIcon = new BMap.Icon(icon, new BMap.Size(14, 18));
            } else if (t == 21) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_27_0.png";
                } else {
                    icon = "/images/map/carIcon/21_0.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 22) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_22_0.png";
                } else {
                    icon = "/images/map/carIcon/22_0.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 23) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_23_0.png";
                } else {
                    icon = "/images/map/carIcon/23_0.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(24, 24));
            } else if (t == 24) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_24_0.png";
                } else {
                    icon = "/images/map/carIcon/24_0.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 25) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_25_0.png";
                } else {
                    icon = "/images/map/carIcon/25_0.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 26) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_26_0.png";
                } else {
                    icon = "/images/map/carIcon/26_0.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            }
        }
        else if (course >= 22.5 && course < 67.5) // 45
        {
            if (t == 1) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_27_45.png";
                } else {
                    icon = "/images/map/carIcon/27_45.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 2) {
                icon = "/images/map/carIcon/2.png";
                bIcon = new BMap.Icon(icon, new BMap.Size(14, 18));
            } else if (t == 21) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_27_45.png";
                } else {
                    icon = "/images/map/carIcon/21_45.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 22) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_22_45.png";
                } else {
                    icon = "/images/map/carIcon/22_45.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 23) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_23_45.png";
                } else {
                    icon = "/images/map/carIcon/23_45.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(24, 24));
            } else if (t == 24) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_24_45.png";
                } else {
                    icon = "/images/map/carIcon/24_45.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 25) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_25_45.png";
                } else {
                    icon = "/images/map/carIcon/25_45.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 26) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_26_45.png";
                } else {
                    icon = "/images/map/carIcon/26_45.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            }
        }
        else if (course >= 67.5 && course < 112.5) // 90
        {
            if (t == 1) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_27_90.png";
                } else {
                    icon = "/images/map/carIcon/27_90.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 2) {
                icon = "/images/map/carIcon/2.png";
                bIcon = new BMap.Icon(icon, new BMap.Size(14, 18));
            } else if (t == 21) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_27_90.png";
                } else {
                    icon = "/images/map/carIcon/21_90.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 22) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_22_90.png";
                } else {
                    icon = "/images/map/carIcon/22_90.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 23) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_23_90.png";
                } else {
                    icon = "/images/map/carIcon/23_90.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(24, 24));
            } else if (t == 24) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_24_90.png";
                } else {
                    icon = "/images/map/carIcon/24_90.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 25) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_25_90.png";
                } else {
                    icon = "/images/map/carIcon/25_90.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 26) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_26_90.png";
                } else {
                    icon = "/images/map/carIcon/26_90.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            }
        }
        else if (course >= 112.5 && course < 157.5) //135
        {
            if (t == 1) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_27_135.png";
                } else {
                    icon = "/images/map/carIcon/27_135.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 2) {
                icon = "/images/map/carIcon/2.png";
                bIcon = new BMap.Icon(icon, new BMap.Size(14, 18));
            } else if (t == 21) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_27_135.png";
                } else {
                    icon = "/images/map/carIcon/21_135.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 22) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_22_135.png";
                } else {
                    icon = "/images/map/carIcon/22_135.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 23) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_23_135.png";
                } else {
                    icon = "/images/map/carIcon/23_135.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(24, 24));
            } else if (t == 24) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_24_135.png";
                } else {
                    icon = "/images/map/carIcon/24_135.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 25) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_25_135.png";
                } else {
                    icon = "/images/map/carIcon/25_135.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 26) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_26_135.png";
                } else {
                    icon = "/images/map/carIcon/26_135.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            }
        }
        else if (course >= 157.5 && course < 202.5) //180
        {
            if (t == 1) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_27_180.png";
                } else {
                    icon = "/images/map/carIcon/27_180.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 2) {
                icon = "/images/map/carIcon/2.png";
                bIcon = new BMap.Icon(icon, new BMap.Size(14, 18));
            } else if (t == 21) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_27_180.png";
                } else {
                    icon = "/images/map/carIcon/21_180.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 22) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_22_180.png";
                } else {
                    icon = "/images/map/carIcon/22_180.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 23) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_23_180.png";
                } else {
                    icon = "/images/map/carIcon/23_180.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(24, 24));
            } else if (t == 24) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_24_180.png";
                } else {
                    icon = "/images/map/carIcon/24_180.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 25) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_25_180.png";
                } else {
                    icon = "/images/map/carIcon/25_180.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 26) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_26_180.png";
                } else {
                    icon = "/images/map/carIcon/26_180.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            }
        }
        else if (course >= 202.5 && course < 247.5) //225
        {
            if (t == 1) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_27_225.png";
                } else {
                    icon = "/images/map/carIcon/27_225.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 2) {
                icon = "/images/map/carIcon/2.png";
                bIcon = new BMap.Icon(icon, new BMap.Size(14, 18));
            } else if (t == 21) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_27_225.png";
                } else {
                    icon = "/images/map/carIcon/21_225.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 22) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_22_225.png";
                } else {
                    icon = "/images/map/carIcon/22_225.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 23) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_23_225.png";
                } else {
                    icon = "/images/map/carIcon/23_225.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(24, 24));
            } else if (t == 24) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_24_225.png";
                } else {
                    icon = "/images/map/carIcon/24_225.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 25) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_25_225.png";
                } else {
                    icon = "/images/map/carIcon/25_225.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 26) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_26_225.png";
                } else {
                    icon = "/images/map/carIcon/26_225.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            }
        }
        else if (course >= 247.5 && course < 292.5) //270
        {
            if (t == 1) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_27_270.png";
                } else {
                    icon = "/images/map/carIcon/27_270.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 2) {
                icon = "/images/map/carIcon/2.png";
                bIcon = new BMap.Icon(icon, new BMap.Size(14, 18));
            } else if (t == 21) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_27_270.png";
                } else {
                    icon = "/images/map/carIcon/21_270.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 22) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_22_270.png";
                } else {
                    icon = "/images/map/carIcon/22_270.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 23) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_23_270.png";
                } else {
                    icon = "/images/map/carIcon/23_270.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(24, 24));
            } else if (t == 24) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_24_270.png";
                } else {
                    icon = "/images/map/carIcon/24_270.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 25) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_25_270.png";
                } else {
                    icon = "/images/map/carIcon/25_270.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 26) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_26_270.png";
                } else {
                    icon = "/images/map/carIcon/26_270.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            }
        }
        else if (course >= 292.5 && course < 337.5) //315
        {
            if (t == 1) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_27_315.png";
                } else {
                    icon = "/images/map/carIcon/27_315.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 2) {
                icon = "/images/map/carIcon/2.png";
                bIcon = new BMap.Icon(icon, new BMap.Size(14, 18));
            } else if (t == 21) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_27_315.png";
                } else {
                    icon = "/images/map/carIcon/21_315.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 22) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_22_315.png";
                } else {
                    icon = "/images/map/carIcon/22_315.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 23) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_23_315.png";
                } else {
                    icon = "/images/map/carIcon/23_315.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(24, 24));
            } else if (t == 24) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_24_315.png";
                } else {
                    icon = "/images/map/carIcon/24_315.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 25) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_25_315.png";
                } else {
                    icon = "/images/map/carIcon/25_315.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            } else if (t == 26) {
                if (s == "Offline") {
                    icon = "/images/map/carIcon/offline_26_315.png";
                } else {
                    icon = "/images/map/carIcon/26_315.png";
                }
                bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
            }
        }
        else {

        }
        if (t == 30) {
            if (s == "Offline") {
                icon = "/images/map/carIcon/offline_30.png";
            } else {
                icon = "/images/map/carIcon/30.png";
            }
            bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
        } else if (t == 31) {
            if (s == "Offline") {
                icon = "/images/map/carIcon/offline_31.png";
            } else {
                icon = "/images/map/carIcon/31.png";
            }
            bIcon = new BMap.Icon(icon, new BMap.Size(28, 28));
        }

        return bIcon;
    }


    function loadJScript() {

        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "http://api.map.baidu.com/api?v=2.0&ak=SAbCayX7PG5UMsqW6d1DZ9K0";
        document.body.appendChild(script);
        console.log(document.body);
    }
   