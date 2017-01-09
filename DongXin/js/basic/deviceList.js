// H5 plus事件处理
var mapPage= null;
function plusReady(){
	mui('.mui-scroll-wrapper').scroll({
		indicators: true //是否显示滚动条
	});
	mui('.mui-control-item').each(function (index,element) {
		element.addEventListener("tap",function (e) {
			memuClick(this.getAttribute("value"));
		});
	});
	
 	mapPage = mui.preload({
		"id": 'webmap',
		"url": '../webmap.html', 
	});
	window.addEventListener('show',function(event){ 
		GetGroupList();
	});
	var _back = mui.back;
	mui.back = function(event) { 
		mui.fire(mapPage,"show",{ id : app.getCurrentDeviceID() });
		_back();
	};
}
if(window.plus){
	plusReady();
}else{
	document.addEventListener("plusready",plusReady,false);
}
function GetGroupList () {
	var way = new ajaxPar("GetGroupList");
	way.ajax({
		url:"/ajax/DevicesAjax.asmx?op=GetGroupList",
		data:{userid:"0"},
		success:function(res){
			var html=[];
			mui.each(res,function (index,item) {
				if (item.GroupID == "-1") {
					html.push('<li class="mui-table-view-cell mui-collapse mui-active">');	
				}else{
					html.push('<li class="mui-table-view-cell mui-collapse">');
				} 
				html.push('<a class="mui-navigate-right" href="#">'+  item.GroupName +'</a>'); 
				html.push('<ul class="mui-table-view" name="Group'+item.GroupID+'"></ul>');
				html.push('</li>'); 
			})
			 
			mui('ul.grouplsit').each(function (index,element) {
				element.innerHTML = html.join('');
				var liGroups = element.getElementsByTagName("li");
				for (var i = 0; i<liGroups.length;i++) {
					var GroupItem= liGroups[i].lastChild;
					var gid = GroupItem.parentNode.parentNode.getAttribute("id") + "_" + GroupItem.getAttribute("name");
					GroupItem.setAttribute("id",gid); //给各个状态下的分组设置id  gid  offlineGroupList_Group-1 
				}
			})
			GetDevicesList();
		}
	}); 
}
function GetDevicesList () {
	var url ="/ajax/DevicesAjax.asmx?op=GetDevicesList";
		var way = new ajaxPar("GetDevicesList"); 
		way.ajax({
		 	url:url,
		 	data:{userid:"0"},
		 	success:function(res){
		 		mui.each(res,function (index,item) { 
		 			var li = createLi(item); 
			 	  	if (item.Status == "1") {
			 	  	  	document.getElementById("onlineGroupList_Group"+item.GroupID).appendChild(li);   
			 	  	}else if(item.Status == "2" || item.Status == "4"){
			 	  		document.getElementById("offlineGroupList_Group"+item.GroupID).appendChild(li);
			 	  	}else if(item.Status == "3"){
			 	  		document.getElementById("inactivatedGroupList_Group"+item.GroupID).appendChild(li);
			 	  	}
			 	  	var li = createLi(item);
			 	  	li.id="liDevices_"+item.DeviceID+"_all";
			 	  	document.getElementById("allGroupList_Group"+item.GroupID).appendChild(li);    
		 		}); 
		 	    memuClick(mui(".mui-active")[0].getAttribute("value"));
			}
		});
}
function createLi(item) {
	var spanClass ;
	if (item.Status == "1") {
		spanClass ="mui-badge-success online";
	}else if(item.Status == "2" || item.Status == "4") {
		spanClass = "offline";
	}else if(item.Status == "3"){
		spanClass = "inactivated";
	}
	var li = document.createElement("li");
	li.setAttribute("imei", item.SerialNumber); 
 	li.setAttribute("status",item.Status);
 	li.name="liDevices";
 	li.setAttribute("class","mui-table-view-cell");// mui-media  
  	li.innerHTML = (item.DeviceName || item.SerialNumber) +'<span class="mui-badge '+spanClass+'">'+ getStatus(item.Status,item.Speed)+'</span>'; 
  	li.addEventListener("tap",deviceLiClick);
  	li.id= "liDevices_"+item.DeviceID; 
  	return li;
}
function getStatus (i,speed) { 
	if (i==1) { 
		if (speed > 0) {
			return parseInt(speed) +"km/h";
		}
		return"停止";
	}
	else if(i==2){return "离线";}
	else if(i==3){return "未激活"}
	else {return"已过期";}
}
function deviceLiClick (e) {
	if (this.innerText.indexOf("未激活") > 0 ) {
		plus.nativeUI.toast("该设备未激活");
		return;
	} 
	var id = this.getAttribute("id").split('_')[1];
	app.setCurrentDeviceID(id); //设置选中的设备，下次登录时选择上次退出时选中的设备 
	mui.fire(mapPage, 'show',  {id:id});
	mui.openWindow({ 
		id: 'webmap',
		//createNew:true,
		//url: '../webmap.html',
		show: {
			autoShow: true,
			//aniShow: 'pop-in'
		},
		styles: {
			popGesture: 'hide'
		},
		waiting: {
			autoShow: true,
			title: '正在加载...',
		},
		extras:{
		 
		}
	});
}
function memuClick (t) {
	  
	var OnLineList =  mui("#allGroupList .online");
	var OffLineList = mui("#allGroupList .offline");
	var InactivatedList = mui("#allGroupList .inactivated");
	var AllList = mui("#allGroupList .mui-badge");
	document.getElementById("aOnLine").innerText="在线("+OnLineList.length+")";
	document.getElementById("aOffLine").innerText="离线("+OffLineList.length+")";
	document.getElementById("aInactivaed").innerText="未激活("+ InactivatedList.length+")";
	document.getElementById("aAll").innerText="全部(" + AllList.length + ")";
	
}