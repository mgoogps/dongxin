 function checkUpdate_wgt(){
 	var version ;
 	plus.runtime.getProperty(plus.runtime.appid,function(inf){
 		version = inf.version;
		//console.log("获取本地应用资源版本号："+inf.version);
		mui.ajax('http://106.14.24.147/ajax/update.asmx/appcheck_wgt',{
			data:{ version: version},
			dataType:'json',//服务器返回json格式数据
			type:'post',//HTTP请求类型
			timeout:10000,//超时时间设置为10秒；
			headers:{'Content-Type':'application/json'},	              
			success:function(res){
				console.log(JSON.stringify(res));
				res = JSON.parse(res.d);
				if (res.StatusCode == 200) {
					//有新版本
					console.log(res.Message);
					downWgt(res.Result);
				} 
			},
			error:function(xhr,type,errorThrown){
				//异常处理；
				//console.log(type);
			}
		});
	});
 	
 
 	/*var wgtver =null;
 	plus.runtime.getProperty(plus.runtime.appid,function(Inf){
 		console.log(Inf.version);
 		wgtver=Inf.version;
 		console.log(wgtver);
 		/*mui.alert("当前版本"+wgtver); 
 		localStorage.setItem("Version",wgtver);
 	});*/
  
}

	function downWgt(url) {
		//var url='http://106.14.24.147/update/update.wgt';
	    console.log("checkupdate....");
	    console.log(url);
	  
	    var dtask = plus.downloader.createDownload( url, {method:"GET"}, function(d,status){ 
	    	//console.log(status);
	        if ( status == 200 ) { 
	            console.log("下载成功 " + d.filename ); 
	            plus.runtime.install(d.filename,{},function(){
	            	console.log(d.filename + "install success....");
	            	if (d.filename.indexOf(".apk") >= 0) {
	            		plus.nativeUI.closeWaiting();
	            		plus.nativeUI.alert("安装成功是否重启",function(){
	                  		plus.runtime.restart();
	                	});
	            	} 
	                //plus.runtime.restart();
	            },function(e){
	            	console.log("install error....");
	            	if (d.filename.indexOf(".apk") >= 0) {
	            		mui.alert("安装失败:"+e.message);
	            	}
	                //plus.nativeUI.closeWaiting();
	                //alert("安装失败: "+e.message);
	            });
	        } else {
	        	console.log("download error....");
	            //plus.nativeUI.closeWaiting();
	           // alert( "下载失败: " + status ); 
	        } 
	    } );      
	    dtask.addEventListener('statechanged',function(d,status){
	        //console.log("statechanged: "+d.state);
	    });
	    dtask.start();
	}
	

function checkUpdate_apk (showWaiting) {
	if (mui.os.android) {
		if (showWaiting) { 
			plus.nativeUI.showWaiting("检测更新...");
		}
		plus.runtime.getProperty(plus.runtime.appid,function(inf){
 			var version = inf.version;
 			mui.ajax('http://106.14.24.147/ajax/update.asmx/appcheck_apk',{
				data:{ version: version},
				dataType:'json',//服务器返回json格式数据
				type:'post',//HTTP请求类型
				timeout:10000,//超时时间设置为10秒；
				headers:{'Content-Type':'application/json'},	              
				success:function(res){
					plus.nativeUI.closeWaiting();
					console.log(JSON.stringify(res));
					res = JSON.parse(res.d);
					if (res.StatusCode == 200) {
						//有新版本 
						console.log(res.Message);
						mui.confirm('检测到新版本,是否更新?','提示',['取消','确认'],function (e) {
							if(e.index == 1){
								plus.nativeUI.showWaiting("正在下载...");
								downWgt(res.Result);
							}
						},'div') 
					}else{
						if (showWaiting) {
							plus.nativeUI.toast(res.Message);
						}
					}
				},
				error:function(xhr,type,errorThrown){
					//异常处理；
					//console.log(type);
				}
			});
 		}); 
	}else if(mui.os.ios){
		//ios 需要跳转到AppStore更新
		var url='itms-apps://itunes.apple.com/cn/app/hello-h5+/id682211190?l=zh&mt=8';// HelloH5应用在appstore的地址
		plus.runtime.openURL(url);
	}
}
