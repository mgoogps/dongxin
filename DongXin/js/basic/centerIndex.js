function getUserInfo(userid)
{
	var a = new ajaxPar("GetUserInfoByID");
	a.ajax({
		url:"/ajax/UsersAjax.asmx?op=GetUserInfoByID",
		data:{userid:userid}, 
		success:function(res){ 
		 	document.getElementById("txtUserName").value = res.UserName;
		 	document.getElementById("txtLoginName").value = res.LoginName;
		 	document.getElementById("txtFirstName").value = res.FirstName;
		 	document.getElementById("txtCellPhone").value = res.CellPhone;
		 	document.getElementById("txtEmail").value = res.PrimaryEmail;
		 	document.getElementById("txtAddress").value = res.Address;
		}
	}) 
}

function saveUserInfo () {
	var res = {}; 
 	res.firstname = document.getElementById("txtFirstName").value;
 	res.callphone = document.getElementById("txtCellPhone").value;
 	res.primaryemail = document.getElementById("txtEmail").value;
 	res.address = document.getElementById("txtAddress").value;
 	var state = app.getState();
 	res.userid = state.userid;
 	
 	var a = new ajaxPar("UpdateUserInfoByID");
 	a.ajax({
 		url:"/ajax/UsersAjax.asmx?op=UpdateUserInfoByID",
 		data:res,
 		success:function(res){
 			plus.nativeUI.toast(res.Message);
			if (res.StatusCode === 200) {
				getUserInfo(res.userid);
	 			mui.back();
			}
 		}
 	});
}