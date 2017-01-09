			mui.init(); 
		    var mgoo=null,interval=null,CurrentDeviceID=null,Waiting= null;var device_list=null,imei=null;
		    var point=null,rmoveMarkList=[],circleTemp=null,isload=false;
			function plusReady(){
				// 确保DOM解析完成
				if(!window.plus){return};
				 
				setTimeout("checkUpdate_wgt()",5000);
				if (mui.os.android) {
					checkUpdate_apk(false);	
				} 
				if (!mgoo) {
					mgoo = new mgMap("allmap","BAIDU"); 
					mgoo.DEFAULT_ZOOM = 18;
					mgoo.MAP_CENTER_LAT = 23.5520006;
					mgoo.MAP_CENTER_LNG = 113.136383;
					mgoo.loadMap(); 
				} 
				//onload();
				console.log(CurrentDeviceID );
				device_list = mui.preload({
					"id": 'device_list',
					"url": 'devices/device_list.html'
				});
				memuclick(); 

				mui.oldBack = mui.back;
				var backButtonPress = 0;
				mui.back = function(event) {
					backButtonPress++;
					if (backButtonPress > 1) {
						plus.runtime.quit();
					} else {
						plus.nativeUI.toast('再按一次退出应用');
					}
					setTimeout(function() {
						backButtonPress = 0;
					}, 1000);
					return false;
				};
			}
			
			if(window.plus){
				
				plusReady();
				
			}else{
				document.addEventListener("plusready",plusReady,false);
			}
			// DOMContentloaded事件处理
			document.addEventListener("DOMContentLoaded",function(){ 
				plusReady();
			},false);
			window.addEventListener('show',function(event){  
				CurrentDeviceID = event.detail.id; 
				circleTemp = null;
				//console.log("CurrentDeviceID222:" + event.detail.id);
				onload();
			},false);
			function onload()
			{
				var self = plus.webview.currentWebview();
				
				if (!mgoo) {
					mgoo = new mgMap("allmap","BAIDU"); 
					mgoo.DEFAULT_ZOOM = 18;
					mgoo.MAP_CENTER_LAT = 23.5520006;
					mgoo.MAP_CENTER_LNG = 113.136383;
					mgoo.loadMap(); 
				} 
				mgoo.clearOverlays({clearAll:true}); 
				if (!CurrentDeviceID) {
					console.log("未登录.");
					return;
				} 
				Waiting = plus.nativeUI.showWaiting("加载中...");
				getGeoFence();
				loadMap();
			
				if (interval) {
					clearInterval(interval);
				}
				interval = setInterval("loadMap()",3000); 
			}
			function loadMap () {  
				if (CurrentDeviceID) { 
					//console.log("CurrentDeviceID1:"+CurrentDeviceID); 
				  	var a = new ajaxPar("GetMonitorByDeviceID",false);
				  	a.ajax({
				  		url:"/ajax/DevicesAjax.asmx?op=GetMonitorByDeviceID",
				  		data:{deviceid:CurrentDeviceID}, 
				  		//async:true,
				  		success:function(res){ 
				  			//console.log(JSON.stringify(res));
				  			if (!res.SerialNumber) { 
				  				clearInterval(interval);
				  				document.getElementById("title").innerText ="请选择设备";
				  				if(Waiting) {Waiting.close()};
				  					//mui.fire(device_list, 'show',  { id: undefined});
									//device_list.show("pop-in");
									return;
				  			}else{
				  				imei = res.SerialNumber;
				  				point = mgoo.Point(res.OLng,res.OLat);
				  				mgoo.panTo( res.OLng,res.OLat );	
				  				//mgoo.map.panTo(new BMap.Point(res.OLng,res.OLat)); 
							    document.getElementById("title").innerText = res.DeviceName || res.SerialNumber;  
					  			craeteMarker(res);
				  			}
				  		}
				  	}); 
			   
			   		
				}
			}
			function craeteMarker (d) {
				
 
				var marker = new Marker({
			        map: mgoo.map, mapType: mgoo.mapType, lng: d.OLng, lat: d.OLat,
			        course: d.Course
			    });
			    mgoo.clearOverlays({clearMarker:rmoveMarkList});
			    rmoveMarkList = [];
			    
			    document.getElementById("speed").innerText= d.Speed.replace(".00","")+ "km";
			    var iconsrc = "";
			    if (d.Status == "2") { //离线
			    	iconsrc = "images/maps/point-escape.gif";
			    } else {
			        iconsrc = "images/maps/point-online.gif";
			        var dc = d.DataContext.split('-')[4]
			        if (dc && parseInt(dc) < 20) {
			            iconsrc = new BMap.Icon("images/maps/point-warning.gif", new BMap.Size(24, 24));
			        }
			    }
			    marker.show({ showTitle: false, titleText: d.DeviceName,icon: iconsrc});
			    rmoveMarkList.push(marker.marker)
			    createWindowInfo(d,marker);
			}
			function createWindowInfo (d,marker) {
				var height = "80px",width="200px";
				var cs = CarStatus(d.CarStatus);
				console.log(d.CarStatus);
				console.log(JSON.stringify(cs));
				var html = []; 
				html.push("<div style='border:1px solid #A6A6A6;background-color:#ECEDF1; -webkit-border-radius: 10px;z-index:5000;"+
				"-moz-border-radius:15px;border-radius：15px;-moz-border-radius: 15px;height:"+height+";width:"+width+";'>");
				html.push(d.DeviceDate+"<span style='width:5px;height:3px;left:20px;font-size:10px' class='mui-icon iconfont "+cs.dianchi.icon+"'>"+cs.dianchi.dianliang+"</span>");
				html.push("<span class='mui-icon iconfont "+cs.gsm.icon+"' style='margin-left:25px;font-size:10px'>"+cs.gsm.xinhao+"</span>")
				html.push("<span class='mui-icon iconfont "+cs.gps.icon+"' style='font-size:10px'>"+cs.gps.count+"</span>")
			 
				html.push(" <hr/>");
				html.push(d.Address+"</div>")
		 
    			var infoBox = new InfoWindow({marker: marker});
    			infoBox.map = mgoo.map;
    			
    			infoBox.addInfoWindow({
			        style: { //filter:alpha(Opacity=80),color: "red", , overflow: "hidden" map: mgoo.map, 
			            fontSize: "18px",  height: height, width:  width, "-moz-border-radius": "15px", "border-radius": "15px"
			        }, html: html.join(''), point: mgoo.Point(d.OLng,d.OLat) 
			    }); 
			    rmoveMarkList.push(infoBox.CompOverlay)
		    	if (Waiting) {
			  		Waiting.close();
			  		mgoo.setZoom(18);
			  		Waiting = null;
			  	}
		    	
			}
		
		
			function memuclick () {
				 
				var mycenter = mui.preload({
					"id": 'mycenter',
					"url": 'mycenter/center_index.html'
				});
				document.getElementById('mapmemu_history').addEventListener('tap',function () {
					clearInterval(interval);
		        	mui.openWindow({  
					    url: 'devices/history.html',
					    id: "history",  
					    styles: { },  
					    extras: { deviceid:CurrentDeviceID,device_name : document.getElementById("title").innerText }  ,
					    show: {aniShow: 'pop-in' },  
					    waiting: {  
					        autoShow: true, //自动显示等待框，默认为true  
					        title: '正在加载...', //等待对话框上显示的提示内容  
					        options: {   }  
					    }  
					})
				});
				
				document.getElementById('mapmemu_fence').addEventListener('tap',function () {
			 	
					//mgoo.clearOverlays({clearMarker:[circleTemp]})
					
					//console.log("围栏ID："+circleTemp.geofenceid);
					
					if (circleTemp) { 
						console.log("设置园半径");
						circleTemp.setCenter(point);					 
					}else{ 
						console.log( point);
						circleTemp= new Circle({mapType: mgoo.mapType,map:mgoo.map,point:point,radius:100 }); 
					} 
				    console.log("geofenceid:"+circleTemp.geofenceid);
				    //c.enableEditing();
				    mgoo.setZoom(18)
				    mui.prompt('默认100米','半径','半径',['取消','清除','保存'],function (e) { 
					    if (e.index == 2) { //点了保存按钮 
				    		var radius = document.querySelector('.mui-popup-input input').value;
				    		circleTemp.setRadius( radius ) 
					    	if (!circleTemp.geofenceid) { //新增 
						    	addGeoFence(); 
					    	}else {//修改
					    		updateGeoFence();
					    	} 
					    }else if (e.index == 1) { //清除按钮
					    	console.log("delete...");  
					   	 	deleteGeoFence(circleTemp.geofenceid)
					    }
				   },'div');
				   document.querySelector('.mui-popup-input input').type="number";
				   document.querySelector('.mui-popup-input input').value=circleTemp.getRadius();
				   document.querySelector('.mui-popup-input input').onkeyup=function(){
				   	/*	if (this.value > 10000) {
				   			this.value = 10000;
				   		}else if(this.value < 0){
				   			this.value=0;
				   		}
				   		c.setRadius(this.value);*/
				   }
				})
				document.getElementById("mycenter").addEventListener("tap",function (e) {
					clearInterval(interval)
					mui.fire(mycenter, 'show',  {});
					mycenter.show("pop-in");
				})
				document.getElementById("more").addEventListener("tap",function(){
 
					var actionbuttons=[{title:"设备信息"},{title:"命令下发"}];//{title:"添加围栏"},
					plus.nativeUI.actionSheet( {title:"请选择",cancel:"取消",buttons:actionbuttons}, function(e){
 
						moreMemuClick(e.index);
					});
				});
				document.getElementById("switch_device_list").addEventListener("tap",function(){
					clearInterval( interval);//关闭定时器
					mui.fire(device_list, 'show',  { id:"0"});
					device_list.show("pop-in"); 
				});
			 
			}
			
			function moreMemuClick(index)
			{
				if (index>0) {
					clearInterval(interval);
				}
				switch (index){
					case 1: 
						mui.openWindow({  
						    url: 'devices/device_detail.html',
						    id: "device_detail",  
						    styles: { },  
						    extras: { deviceid:CurrentDeviceID}  ,
						    show: {aniShow: 'pop-in' },  
						    waiting: {  
						        autoShow: true, //自动显示等待框，默认为true  
						        title: '正在加载...', //等待对话框上显示的提示内容  
						        options: {   }  
						    }  
						})
						break;
					case 2: 
						mui.openWindow({  
						    url: 'devices/command.html',
						    id: "command",  
						    styles: { },  
						    extras: { deviceid:CurrentDeviceID,imei:imei}  ,
						    show: {aniShow: 'pop-in' },  
						    waiting: {  
						        autoShow: true, //自动显示等待框，默认为true  
						        title: '正在加载...', //等待对话框上显示的提示内容  
						        options: {   }  
						    }  
						})
						break;
					default:
						break;
				}
			}
			
			function addGeoFence () {
				var p = circleTemp.getCenter();
		    	var r = circleTemp.getRadius(); 
				var fencename = "一键围栏"; 
				var a = new ajaxPar("AddGeoFence");
				var state = app.getState();
				var fenceData ={
			     	fencename: fencename,userid:state.userid,
			     	deviceid:CurrentDeviceID,latitude:p.lat,
			     	longitude:p.lng,radius:r,description:''
		     	}
		    	a.ajax({
		    		url:"/ajax/DevicesAjax.asmx?op=AddGeoFence",
		    		data:fenceData,
		    		success:function (res) {
		    			plus.nativeUI.toast(res.Message);
		    			if (res.StatusCode == 200) {
		    				circleTemp.geofenceid = res.Result;
		    			}
		    		}
		    	});
			}
			
			function getGeoFence () {
				//console.log("getGeoFence:"+CurrentDeviceID);
				var a = new ajaxPar("GetGeoFenceListByDeviceID");
				a.ajax({
					url:"/ajax/DevicesAjax.asmx?op=GetGeoFenceListByDeviceID",
					data:{deviceid : CurrentDeviceID},
					success:function (res) {  
						if (res.length <= 0) {
							return;
						}
						//for (var i = 0; i < res.length; i++) {
							//if (res[i].FenceName == "akeyfence") { //是否是一件围栏
						res = res[0];
						circleTemp = new Circle({
							mapType: mgoo.mapType,map:mgoo.map,point:mgoo.Point(res.Longitude,res.Latitude),radius:res.Radius
						});
						//mgoo.panTo( res.Longitude,res.Latitude );
						
						circleTemp.geofenceid = res.GeofenceID;
							//}
						//}
						//document.getElementById("mapmemu_fence").innerText="关闭围栏";
					}
				});
			}			
			
			function deleteGeoFence (fenceid) {
				if (fenceid) {
		   	 		var a = new ajaxPar("DeleteGeoFence");
		   	 		a.ajax({
		   	 			url:"/ajax/DevicesAjax.asmx?op=DeleteGeoFence",
		   	 			data:{fenceid : circleTemp.geofenceid},
		   	 			success:function (res) {
		   	 				plus.nativeUI.toast(res.Message);
		   	 				if (res.StatusCode == 200) {
			   	 				mgoo.clearOverlays({clearMarker:[circleTemp.circle]});
			   	 				circleTemp = null;	
		   	 				}
		   	 			}
		   	 		});
		   	 	}else{
		   	 		mgoo.clearOverlays({clearMarker:[circleTemp.circle]});
		   	 		circleTemp = null;
		   	 	} 
			}			
			function updateGeoFence () {
				var fencename = "一键围栏"; 
				var p = circleTemp.getCenter();
		    	var r = circleTemp.getRadius(); 
				var a = new ajaxPar("UpdateGeoFence");
	    		a.ajax({
	    			url:"/ajax/DevicesAjax.asmx?op=UpdateGeoFence",
	    			data:{fenceid : circleTemp.geofenceid, fencename:fencename,latitude:p.lat,longitude:p.lng,radius:r,description:''},
	    			success:function (res) {
	    				plus.nativeUI.toast(res.Message); 
	    			}
	    		})
			}
				
			function CarStatus(cs1)
			{
				var str = {};
				var cst = cs1.split(",");
				if(cst[0]) { 
					var gps = cst[0]
					str.gps = {count:gps };
					if (gps >= 0 && gps <= 4) {
						str.gps.icon = "icon-gps0";
					}else if(gps>4 && gps <= 8){
						str.gps.icon = "icon-gps1";
					}else {
						str.gps.icon = "icon-gps2";
					}
				}
				if (cst[1]) { 
					var gsm = cst[1];
					str.gsm = {};
					if (gsm >= 0 && gsm <= 10) { 
						str.gsm.xinhao = 1;
						str.gsm.icon = "icon-xinhao01";
					}else if(gsm >= 11 && gsm <= 20){
						str.gsm.xinhao = 2;
						str.gsm.icon = "icon-xinhao02";
					}else if(gsm >= 21 && gsm <= 30){
						str.gsm.xinhao = 3;
						str.gsm.icon = "icon-xinhao03";
					}else {//if(gsm >= 31 && gsm <= 41)
						str.gsm.xinhao = 4;
						str.gsm.icon = "icon-xinhao04";
					}
				}
				if (cst[2]) {
					var dianchi = cst[2];
					str.dianchi = {};
					switch (dianchi){
						case '6': 
							str.dianchi.dianliang = "100%";
							str.dianchi.icon = "icon-dianliang3";
							break;
						case '5':
							str.dianchi.icon = "icon-dianliang2";
							str.dianchi.dianliang = "80%" 
							break;
						case '4':
							str.dianchi.icon = "icon-dianliang2";
							str.dianchi.dianliang = "60%"  
							break;
						case '3':
							str.dianchi.icon = "icon-dianliang1";
							str.dianchi.dianliang = "20%" 
							break;
						case '2':
							str.dianchi.icon = "icon-dianliang1";
							str.dianchi.dianliang = "10%"  
							break;
						default:
							str.dianchi.icon = "icon-dianliang1";
							str.dianchi.dianliang = "0%"   
							break;
					}
				}
				return str;
			}
