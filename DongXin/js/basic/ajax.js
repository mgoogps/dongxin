var ajaxPar = function  (way,isloading) {
 	var w;
 	isloading = isloading == undefined ? true : isloading;
 	if(isloading)
 	  	w= plus.nativeUI.showWaiting("加载中...");
 	this.data = {};
 	
	this.soapXml = function(pars)
	{
		pars = pars||{};
	    var loginInfo = app.getState();
	    var UserID = loginInfo.userid;
	    var token = loginInfo.token; 

	    var parstr=""; 
	    for(var k in pars)
	    {
	    	if (k == "userid") {
	    		parstr += "<"+k+">"+ UserID +"</"+k+">";
	    	}else{
		    	parstr += "<"+k+">"+pars[k]+"</"+k+">";
	    	}
	    } 
	    var soapMessage2 =
	          "<soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' 					xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'>" +
	          "  <soap:Header>" +
	              "<AuthHeader xmlns='http://tempuri.org/'>" +
	                  "<UserID>" + UserID+ "</UserID>" +
	                  "<Token>" + token + "</Token>" +
	                  "<Identifies>MgooApp@BAIDU</Identifies>" +
	              "</AuthHeader>" +
	          "</soap:Header>" +
	          "<soap:Body>" + 
	                "<" + way + " xmlns='http://tempuri.org/'>" +
	                parstr +
	                "</" + way + ">" +
	          "</soap:Body>" +
	          "</soap:Envelope>"; 
	    return soapMessage2;  
	}
		 
    this.loadXml = function(data){
		var domElems=data.getElementsByTagName(way+"Result")[0];
 		var nodes=domElems.childNodes[0]; 
		var arr=nodes.nodeValue;	
		return JSON.parse(arr); 
	}
   
    this.ajax = function  (opt) { 
    	var _this =this; 
    	if (opt.url.indexOf("http") < 0) {
    		opt.url ="http://106.14.24.147"+ opt.url ; 
    	} 
    	var _url = opt.url;
    	var _success = opt.success || function(res){};
    	var _error = opt.error || function(xhr,type,errorThrown){};
    	var _headers = opt.headers||{'Content-Type':'text/xml; charset=utf-8'};
    	var _dataType = opt.dataType || "xml";
    	var _type = opt.type || "POST";
    	var _async = opt.async == undefined ? true : opt.async;
    	var _timeout = opt.timeout == 0 ? 0 : (opt.timeout || 10000);
    	var _data={};
    	if (_dataType == "xml") {
    		_data = _this.soapXml(opt.data);
    	}else if(_dataType == "json"){
    		_data = JSON.stringify(opt.data);
    	}
		mui.ajax(_url,{
			data: _data,
			type:_type,
			async:_async,
			dataType:_dataType,
			headers: _headers,
			timeout:_timeout,
			success:function(res){
				 
				if (_dataType == "xml") {
					res = _this.loadXml(res);
				}
				if (res.StatusCode && (res.StatusCode === 501 || res.StatusCode === 502)) {
				
					var state = app.getState();
					if (state.account && state.password) {
						console.log("登录信息失效,正在重新获取token..."); 
						var loginInfo = {
							account: state.account,
							password: state.password,
							ismd5:false,
						}; 
						app.login(loginInfo, function(err) { 
							if (err) {
								plus.nativeUI.toast("登录信息已失效，请重新登录");
								mui.openWindow({
									url: 'login.html',
									id: 'login',
									show: {
										aniShow: 'pop-in'
									}
								});
								return;
							}
							console.log("重新执行ajax..........");
						    _this.ajax(opt);
							return;
						});
					}else{
 						mui.openWindow({
							url: 'login.html',
							id: 'login',
							show: {
								aniShow: 'pop-in'
							}
						});
					}
				}
				
				if(w){w.close();} 
			 
				_success(res); 
			},
			error:function(xhr,type,errorThrown) { 
				if(w){w.close();} 
				plus.nativeUI.toast("网络错误,请检查网络.");
				_error(xhr,type,errorThrown);
			}
		});
    }
}


