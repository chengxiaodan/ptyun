import PT_utils from './pt_util.es6.js';
PT_utils.namespace('PT.register');

PT.register = function() {
	var self = this;
	this.valid = true;
	this.time =null;
	this.http = PT_utils.http();
	this.init();
	this.bindEvent();
}

PT.register.prototype = {
	init: function() {
		var self = this;
		self.active("register");
		$("#register_step1").show();
		$("#register_step2").hide();
		$("#flash").on("click",function(){
			$("#code").attr("src",self.http.server+"?identity=imgcode&random="+Math.random()+"&method=verify.image.get");
		});
		//发送验证码
		$("#nextStep1").click(function() {
			if(self.validate()) {
				self.sendCode();
			}
		});
		//重新获取
		$("#regetCode").click(function(){
			self.sendCode();
		});
		//注册
		$("#nextStep2").on("click",function() {
			if(self.validRg()) {
				self.register();
			}
		});
		//进入邮箱
//		$("#goEail").click(function(){
//			PT_utils.goEail($('#address').text(),'goEail');
//		});
	},
	bindEvent: function() {
		var self = this;
		var username = $("#username");
		var codetext = $("#codetext");
		var getCode = $("#getCode");
		var password = $("#password");
		var password2 = $("#secondPW");
		
		username.focus(function(){
			username.css('border', '1px solid #dbdbdb');
			$("#un_error").hide();
			codetext.css('border', '1px solid #dbdbdb');
			$("#co_error").hide();
		});
		username.blur(function(){
			self.validUser(username);
		});
		codetext.focus(function(){
			codetext.css('border', '1px solid #dbdbdb');
			$("#co_error").hide();
		});
		codetext.blur(function(){
			self.validCode(codetext);
		});
		getCode.focus(function(){
			getCode.css('border', '1px solid #dbdbdb');
//			$("#spw_error").hide();
		});
		password.focus(function(){
			password.css('border', '1px solid #dbdbdb');
//			$("#spw_error").hide();
		});
		password.blur(function(){
			self.validPW(password);
		});
		password2.focus(function(){
			password2.css('border', '1px solid #dbdbdb');
//			$("#spw_error").hide();
		});
		password2.blur(function(){
			self.validRePw(password2,password);
		});
	},
	validRg: function(){
		var self = this;
		var valid = true;
		var getCode = $("#getCode");
		var password = $("#password");
		var password2 = $("#secondPW");
		(function() {
			var flag = self.validPW(password);
			valid = valid && flag;
		})();
		(function() {
			var flag = self.validRePw(password2,password);
			valid = valid && flag;
		})();
		return valid;
	},
	validRePw:function(password2,password){
		var flag = true;
		if(null == $.trim(password2.val()) || "" == $.trim(password2.val()) ||
			$.trim(password2.val()).length == 0) {
			flag = false;
			password2.css('border', '1px solid #f15556');
			$("#spw_error").text("请再次输入登录密码");
			$("#spw_error").show();
		} else if($.trim(password2.val()) !== $.trim(password.val())) {
			flag = false;
			password2.css('border', '1px solid #f15556');
			$("#spw_error").text("请确认两次密码是否一致");
			$("#spw_error").show();
		} else {
			password2.css('border', '1px solid #dbdbdb');
//			$("#spw_error").hide();
			flag = true;
		}
		return flag;
	},
	validPW: function(password){
		var flag = true;
		if(null == password.val() || "" == password.val() ||
			password.val().length == 0) {
			flag = false;
			password.css('border', '1px solid #f15556');
			$("#spw_error").text("请输入登录密码");
			$("#spw_error").show();
		} else if(!PT_utils.fChkPassword($.trim(password.val()))) {
			flag = false;
			password.css('border', '1px solid #f15556');
			$("#spw_error").text("密码长度应为8-16个字符的英文字母和数字");
			$("#spw_error").show();
		} else {
			password.css('border', '1px solid #dbdbdb');
//			$("#spw_error").hide();
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
			username.css('border', '1px solid #f15556');
			$("#un_error").text("请输入手机号/邮箱地址");
			$("#un_error").show();
		}else if(!PT_utils.fChkMail(username.val()) && !PT_utils.isphone(username.val())) {
			flag = false;
			username.css('border', '1px solid #f15556');
			$("#un_error").text("手机号/邮箱输入格式错误");
			$("#un_error").show();
		} else {
			flag = self.asyncUnit();
		}
		return flag;
	},
	//验证账号唯一性
	asyncUnit: function(){
		var self = this;
		var flag = true;
		var username= $("#username");
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
//          beforeSend: function() {
//              var loading  =  $('<div class="loadingMask"></div>');
//              var loadEffect = $('<div class="loadEffect"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>');
//              loadEffect.appendTo(loading);
//              loading.appendTo("body");
//          },
//          complete:   function() {
//              $(".loadingMask").remove();
//          },
            cache: false,
            async: false,
			success: function(data){
				if(data.error_code == 0){
					username.css('border', '1px solid #dbdbdb');
					$("#un_error").hide();
					flag = true;
				}else {
					username.css('border', '1px solid #f15556');
					$("#un_error").text(data.msg);
					$("#un_error").show();
					flag = false;
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
			}
		});
		return flag;
	},
	validCode: function(codetext){
		var self = this;
		var flag = true;
		if(codetext.val() == null || codetext.val() == '' ||
			codetext.val() == undefined) {
			codetext.css('border', '1px solid #f15556');
			$("#co_error").text("请输入识别码");
			$("#co_error").show();
			flag = false;
		}else{
			flag = self.checkCode(codetext);
		}
		return flag;
	},
	validate: function() {
		var self = this;
		var valid = true;
		var username = $("#username");
		var codetext = $("#codetext");
		
		(function() {
			var flag = self.validUser(username);
			valid = valid && flag;
		})();
		
		(function() {
			var flag = self.validCode(codetext);
			valid = valid && flag;
		})();
		return valid;
	},
	checkCode: function(codetext){
		var self = this;
		var obj = {
			identity: "imgcode",
			code: codetext.val()
		}
		var flag = true;
		$.ajax({
			    type: 'post',
	            url : self.http.server,
	            headers: {
					"method": "verify.image.check",
					"appid": self.http.appid,
					"sign": PT_utils.getSign(JSON.stringify(obj),self.http.secretkey),
					"timestramp" : Date.parse(new Date())/1000
				},
				data: JSON.stringify(obj),
	            dataType: 'json',
	            contentType: "application/json; charset=utf-8",
	//          beforeSend: function() {
	//              var loading  =  $('<div class="loadingMask"></div>');
	//              var loadEffect = $('<div class="loadEffect"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>');
	//              loadEffect.appendTo(loading);
	//              loading.appendTo("body");
	//          },
	//          complete:   function() {
	//              $(".loadingMask").remove();
	//          },
	            cache: false,
	            async: false,
				success: function(data){
					if(data.error_code == 0){
						codetext.css('border', '1px solid #dbdbdb');
						$("#co_error").hide();
						flag = true;
					}else{
						codetext.css('border', '1px solid #f15556');
						$("#co_error").text("识别码错误");
						$("#co_error").show();
						flag = false;
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
				}
			});
		return flag;
	},
	//发送验证码
	sendCode: function(){
		var self = this;
		var obj = {
			addr: $("#username").val(),
			identity: "imgcode",
			code: $("#codetext").val()
		}
		$.ajax({
		    type: 'post',
            url : self.http.server,
            headers: {
				"method": "cloud.oauth.verify.send",
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
					$("#register_step1").hide();
					$("#register_step2").show();
					PT_utils.showBox("发送验证码成功");
				}else{
					$("#co_error").text(data.msg);
					$("#co_error").show();
				}
				
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
			}
		});
	},
	/**
	 * 注册
	 */
	register: function() {
		var self = this;
		var username = $("#username").val();
		var password = $("#password").val();
		var repassword = $("#secondPW").val();
		var code = $("#getCode").val();
		var obj = {};
		var method = "";
		if(PT_utils.isphone(username)) {
			obj = {
				mobile: username,
				password: password,
				repassword: repassword,
				code:code
			};
			method = "cloud.oauth.mobile.register";
		} else if(PT_utils.fChkMail(username)) {
			obj = {
				email: username,
				password: password,
				repassword: repassword,
				code:code
			};
			method = "cloud.oauth.email.register";
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
                var loading  =  $('<div id="loadingMask" class="loadingMask"></div>');
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
					$("#spw_error").hide();
					//成功之后显示发送验证邮件页面
					self.active("rg_success");
					self.timer();
				}else{
					$("#spw_error").text(data.msg);
					$("#spw_error").show();
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				
			}
		});
	},
	timer: function(){
		var self = this;
		var num = 5;
		self.time = setInterval(function() {
			num--;
			if(num == 0) {
				window.location.href = "login.html";
				clearInterval(self.time);
			} else {
				$(".timer").text(num+"");
			}
		}, 1000);
	},
	//显示的页面
	active: function(str) {
		var self = this;
		var arr = ['register', 'rg_success'];
		$.each(arr, function(i, value) {
			if(str == value) {
				$('#' + value).show();
				$.each(arr, function(j, other) {
					if(other !== value) {
						$('#' + other).hide();
					}
				});
			}
		});
	}
}
$(document).ready(()=> {
	new PT.register();
})
	
