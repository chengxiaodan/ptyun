import PT_utils from './pt_util.es6.js';
PT_utils.namespace('PT.Signin');
PT.Signin = function() {
	this.lock = false;
	this.http = PT_utils.http();
	this.init();
	this.bindEvent();
}
PT.Signin.prototype = {
	init: function() {
		var self = this;
		$('#login').click(function() {
			if(self.validate()) {
				self.sendSignin();
			}
		});
		$(window).keypress(function(event) {
			if(event.which == 13) {
				$('#login').click();
				event.preventDefault();
			}
		});
	},
	bindEvent: function() {
		var self = this;
		var username = $('#username');
		var password = $('#password');
		for(var i = 0; i < username.length; i++) {
			(function(Index) {
				$(username[i]).keyup(function() {
					var content_len = $(this).val().length;
					if(content_len ==0) {
						$(this).siblings(".tip").hide();
					}else{
						$(this).siblings(".tip").show();
					}
				});
				$(username[i]).keydown(function() {
					var content_len = $(this).val().length;
					if(content_len ==0) {
						$(this).siblings(".tip").hide();
					}else{
						$(this).siblings(".tip").show();
					}
				});
			})(i)
		}
		for(var j = 0; j < password.length; j++) {
			(function(Index) {
				$(password[j]).keyup(function() {
					var content_len = $(this).val().length;
					if(content_len ==0) {
						$(this).siblings(".tip").hide();
					}else{
						$(this).siblings(".tip").show();
					}
				});
			})(j)
		}
		password.keyup(function() {
			this.value = this.value.replace(/[^\w\.\/]/ig, '');
		});
	},
	validPw: function(password){
		var flag = true;
		if(null == password.val() || "" == password.val() ||
			password.val().length == 0) {
			flag = false;
			$("#pw").text("请输入登录密码");
			$("#pw").show();
		} else if(!PT_utils.fChkPassword(password.val())) {
			flag = false;
			$("#pw").text("密码长度应为8-16个字符的英文字母和数字");
			$("#pw").show();
		} else {
			flag = true;
		}
		return flag;
	},
	validUser: function(username){
		var self = this;
		var flag = true;
		if(null == username.val() || "" == username.val() ||
			username.val().length == 0) {
			flag = false;
			$("#pw").text("请输入手机号/邮箱地址");
			$("#pw").show();
		}else if(!PT_utils.fChkMail(username.val()) && !PT_utils.isphone(username.val())) {
			flag = false;
			$("#pw").text("手机号/邮箱输入格式错误");
			$("#pw").show();
		}
//		else{
//			flag = self.asyncUnit(username);
//		}
		return flag;
	},
	//验证账号唯一性
	asyncUnit: function(username){
		var self = this;
		var flag = true;
		var obj = {};
		var method = "";
		var url = "";
		if(PT_utils.isphone(username.val())) {
			obj = {
				mobile: username.val()
			}
			method ="cloud.oauth.mobile.check";
			url = self.http.server+"?mobile="+obj.mobile+"&method="+method;
		} else if(PT_utils.fChkMail(username.val())) {
			obj = {
				email: username.val()
			}
			method ="cloud.oauth.email.check";
			url = self.http.server+"?email="+obj.email+"&method="+method;
		}
		
		$.ajax({
		    type: 'get',
            url : url,
            headers: {
				"method": method,
				"appid": self.http.appid,
				"sign": PT_utils.getSign(JSON.stringify(obj),self.http.secretkey),
				"timestramp" : Date.parse(new Date())/1000
			},
            cache: false,
            async: false,
			success: function(data){
				if(data.error_code == 0){
					$("#pw").text("该账户不存在，请先注册账户");
					$("#pw").show();
					flag = false;
				}else {
					$("#pw").hide();
					flag = true;
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
			}
		});
		return flag;
	},
	validate: function() {
		var self = this;
		var valid = true;
		var username = $('#username');
		var password = $('#password');

		(function() {
			var flag = self.validUser(username);
			valid = valid && flag;
		})();

		(function() {
			var flag = self.validPw(password);
			valid = valid && flag;
		})();

		return valid;
	},
	sendSignin: function() {
		var self = this;
		var username = $('#username');
		var password = $('#password');
		var obj = {};
		var method = "";
		if(PT_utils.fChkMail(username.val())) {
			obj = {
				email: username.val(),
				password: password.val()
			};
			method = "cloud.oauth.email.login";
		}else if(PT_utils.isphone(username.val())) {
			obj = {
				mobile: username.val(),
				password: password.val()
			};
			method = "cloud.oauth.mobile.login";
		}
		$.ajax({
	    		  type: 'post',
	          url : self.http.server,
	          headers: {
					"method": method,
					"appid": self.http.appid,
					"sign": PT_utils.getSign(JSON.stringify(obj),self.http.secretkey),
					"timestramp" : Date.parse(new Date())/1000
				},
	          data: JSON.stringify(obj),
	          dataType: 'json',
	          contentType: "application/json; charset=utf-8",
	          beforeSend: function() {
	              var loading  =  $('<div class="loadingMask"></div>');
	              var loadEffect = $('<div class="loadEffect"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>');
	              loadEffect.appendTo(loading);
	              loading.appendTo("body");
	          },
	          complete: function() {
	              $(".loadingMask").remove();
	          },
	          cache: false,
			  success: function(data){
				if(data.error_code == 0){
					$("#pw").hide();
					self.setWeek(data);
				}else if(data.error_code == 61001){
					$("#pw").text("用户已存在");
					$("#pw").show();
				}else{
					$("#pw").text(data.msg);
					$("#pw").show();
				}
			  },
			  error: function (XMLHttpRequest, textStatus, errorThrown) {
			  }
		});
	},
	setWeek: function(data){
		var self = this;
		PT_utils.clearCookie();
		if($("#login_selected")[0].checked == true){
			PT_utils.setCookie("token",data.token,"d7");
			PT_utils.setCookie("uid",data.uid,"d7");
			PT_utils.setCookie("username",$('#username').val(),"d7");
		} else {
			PT_utils.setCookie("token",data.token,"h8");
			PT_utils.setCookie("uid",data.uid,"h8");
			PT_utils.setCookie("username",$('#username').val(),"h8");
		}
		window.location.href = "index.html";
	},
	//显示的页面
	active: function(str) {
		$("#"+str).siblings(".error").hide();
	}
}
$(document).ready(()=> {
	var service = decodeURI(PT_utils.getUrlParameter("service"));
	var callback = decodeURI(PT_utils.getUrlParameter("callback"));
	if(service!=="undefined" && callback!=="undefined" && PT_utils.getCookie("token") !== null) {
		window.location.href = callback+"?token="+PT_utils.getCookie("token")+"&uid="+PT_utils.getCookie("uid");
	}
	new PT.Signin();
})
