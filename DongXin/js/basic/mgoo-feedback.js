 	var feedback ={}; 

	feedback.imageList =[];
	
	feedback.imgDiv=null;
	
	feedback.galleryImg=function(imgDiv) {
		var _this =this;
		feedback.imgDiv= imgDiv;
		plus.gallery.pick(function(a) {  
            plus.io.resolveLocalFileSystemURL(a, function(entry) { 
            	 
            	entry.file(function(file){
            		if (file.size > 2097152) { //图片大于2M.... 
	            		plus.nativeUI.toast("单张图片不能大于2M~");
	            		return;
	            	} 
	            	plus.io.resolveLocalFileSystemURL("_doc/", function(root) { 
	                    root.getFile("feedback.png", {}, function(file) {
	                        //文件已存在 
	                        console.log("");
	                        //文件存在 则删除
	                        file.remove(function() { 
	                            //console.log("file remove success"); 
	                            entry.copyTo(root, 'feedback.png', function(e) { 
	                                    var e = e.fullPath + "?version=" + new Date().getTime();
	                                    _this.ShowImage(e); /*显示图片*/  
	                                }, 
	                                function(e) { 
	                                    console.log('copy image fail:' + e.message); 
	                                }); 
	                        }, function() { 
	                            console.log("delete image fail:" + e.message); 
	                        }); 
	                    }, function() { 
	                        //文件不存在 
	                        console.log("文件不存在");
	                        entry.copyTo(root, 'feedback.png', function(e) { 
	                                var path = e.fullPath + "?version=" + new Date().getTime(); 
	                                _this.ShowImage(path); /*显示图片*/ 
	                            }, 
	                            function(e) { 
	                                console.log('copy image fail:' + e.message); 
	                            }); 
	                    }); 
	                }, function(e) { 
	                    console.log("get _www folder fail"); 
	                })
            	},function (err) { 
            		console.log(err.message);
            	});
            	
               
            }, function(e) { 
                console.log("读取拍照文件错误：" + e.message); 
            }); 
        }, function(a) {}, { 
            filter: "image" //打开系统相册
        })  
	};
 
	feedback.ShowImage=function(imgPath) { 
		var _this= this;
        var mainImage = document.createElement("img"); 
        mainImage.src = imgPath;
        mainImage.style.width = "65px"; 
        mainImage.style.height = "65px";  
		_this.imgDiv.innerHTML="";
		_this.imgDiv.appendChild(mainImage);
        var image = new Image(); 
        image.src = imgPath; 
        image.onload = function() {
           _this.getBase64Image(image); 
        } 
	} 
	//将图片压缩转成base64 
	feedback.getBase64Image=function(img) { 
        var canvas = document.createElement("canvas"); 
        var width = img.width; 
        var height = img.height;  
        canvas.width = width;   /*设置新的图片的宽度*/ 
        canvas.height = height; /*设置新的图片的长度*/ 
        var ctx = canvas.getContext("2d"); 
        ctx.drawImage(img, 0, 0,width,height); /*绘图*/ 
        var dataURL = canvas.toDataURL("image/png").replace("data:image/png;base64,", "");
        var imgIndex = this.imgDiv.getAttribute("image-index"); 
        this.imageList[imgIndex] = dataURL;
        return dataURL; 
    }   
	  
	feedback.feedbackSubmit=function()
	{
		var _this =this;
		var question = document.getElementById("question").value;
		var contact = document.getElementById("contact").value;
		console.log("图片长度："+this.imageList.length);
		var img1 = _this.imageList[0] || "";
		var img2 =_this.imageList[1] || "";
		var img3 = _this.imageList[2] || "";
		var img4 = _this.imageList[3] ||"";
		var a = new ajaxPar("Feedback");
        a.ajax({
        	url:"http://106.14.24.147/ajax/MessageAjax.asmx?op=Feedback",
        	data:{ question:question,contact:contact,image1:img1,image2: img2,image3:img3,image4:img4 },
        	timeout:60000,
        	success:function (res) {
        		plus.nativeUI.toast(res.Message);
        		if (res.StatusCode == 200) {
        			this.imageList =[];
        			mui('.image-item').each(function (index,element) {
						element.innerHTML="";
					})
        		}
        		console.log(res); 
        	},
        	error:function(err){
        		console.log("上传图片出错。。。。。。。。。。");
        	}
        })

	}

 