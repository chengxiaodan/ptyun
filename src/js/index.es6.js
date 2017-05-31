import PT_utils from './pt_util.es6.js';
PT_utils.namespace('PT.Index');

PT.Index = function() {
	this.appList = 10;
	this.count = 0; // 总数
	this.pageCount = 0; // 后台总页数
	this.current = 1; // 当前页
	this.limit = 10;
	this.mark = 0;
	this.http = PT_utils.http();
	this.datas = [];
	var cookieObj = {};
	this.init();
	this.bindEvent();
}
PT.Index.prototype = {
	init: function() {
		var self = this;
		self.appList = 10;
		self.cookieObj=PT_utils.getToken();
		self.active("appManage");
		self.getApplist("appManage");
	},
	bindEvent: function() {
		var self = this;
		$("#appSecretKey").val(self.http.secretkey);
		var list = $(".left-main ul li");
		for(var i = 0; i < list.length; i++) {
			(function(Index) {
				$(list[i]).click(function() {
					$(this).siblings('li').find("a").removeClass('active');
					$(this).find("a").addClass("active");
					var id = $(this).find("a").data("id");
					self.active(id);
				})
			})(i)
		};
		var inputtext = $("input");
		inputtext.keyup(function() {
			var content_len = $(this).val().length;
			if(content_len ==0) {
				$(this).siblings(".tip").hide();
			}else{
				$(this).siblings(".tip").show();
			}
		});
		var textarea = $("textarea");
		
		textarea.keyup(function() {
			var content_len = $(this).val().length;
			if(content_len ==0) {
				$(this).siblings(".tip").hide();
			}else{
				$(this).siblings(".tip").show();
			}
		});
		$("#addAPPbtn").click(function() {
			$("#addAppUrl").val("");
			$("#addAppType").val("");
			$("#addAppBuildId").val("");
			$("#addAppDes").val("");
			$("#addAppName").val("");
			$("#addAppVersion").val("");
			$("#addapp_error").hide();
			$("#addAPP").show();
		});
		$("#save_addApp").on("click",function(e) {
			if($.trim($("#addAppName").val()) !== ""){
				self.addApp();
			}else{
				$("#addapp_error").text("应用名称不能为空");
				$("#addapp_error").show();
			}
			e.preventDefault();
		});
		$("#deleteAPPbtn").click(function() {
			self.deleteValue();
		});
		$(".cancle").click(function() {
			$("#addAPP").hide();
			$("#editAPP").hide();
			$("#deleteAPP").hide();
		})
	},
	getApplist: function(str) {
		var self = this;
//		//滚动条分页
//		$("#" + str + "Table").scroll(function(e) {
//			var viewH = $(this).height(); //可见高度
//			var contentH = $(this)[0].scrollHeight; //内容高度
//			var scrollTop = $(this).scrollTop(); //滚动高度
//			if(scrollTop / (contentH - viewH) >= 1) {
//				//此处加载数据
//				self.getApplist(str);
//			}
//			e.preventDefault();
//		});
		var requestData = {
			"limit": self.limit+"", //每页信息最多显示条数
			"offset": (self.mark == 0)?self.mark+"":self.appList+"" //请求第多少条数据 比如 0 10 20
		};

		$.ajax({
			type: 'post',
			url: self.http.server,
			headers: {
				"method": "cloud.app.list",
				"appid": self.http.appid,
				"sign": PT_utils.getSign(JSON.stringify(requestData), self.http.secretkey),
				"timestramp": Date.parse(new Date()) / 1000,
				"token": self.cookieObj.token,
				"uid": self.cookieObj.uid
			},
			data: JSON.stringify(requestData),
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
			success: function(data) {
				if(data.error_code == 62002) {
					PT_utils.confirmBox("token错误,请重新登录!");
				}else if(data.error_code == 0) {
					var dataList = data.data;
					self.count = data.count;
					if(dataList.length !== 0) {
						$.each(dataList, function(index, item) {
							self.datas.push(item);
							if(index<=9){
								self.renderTable(str, item);
							}
						});
						self.clickBtn();
					}
					if(self.count>10){
						$("#appPage").show();
						self.pageCount = Math.ceil(self.count/self.limit);
						self.current = (self.mark == 0)?1:self.appList/self.limit+1;
						self.mark =1;
						$('#appPage').perfectPager({
							pageCount: self.pageCount,
							current:  self.current,
							easyMode: true,
							callback: function(currentNum) {
								//此处是激活当前页
								//currentNum 当前页码
								self.appList =(currentNum - 1) * self.limit;//从后台获取第多少条开始获取数据 比如 0 10 20
								$("#" + str + "Table").empty(); //清空之前渲染数据
								self.getApplist(str);
							}
						}).appendTo($('#appPage'));
					}else{
						$("#appPage").hide();
					}
				} else {
					PT_utils.showBox("获取数据失败");
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
			}
		});
	},
	//点击操作按钮
	clickBtn: function() {
		var self = this;
		$('#appManage tr td a').on("click",function() {
			var tdSeq = $(this).parent().parent().find("td").index($(this).parent()); //触发的列数
			var trSeq = $(this).parent().parent().parent().find("tr").index($(this).parent().parent()); //触发的行数
			var data_id = $(this).parent().parent().parent().find("tr:eq(" + trSeq + ")").data('id').substring(3);
			var that = $(this);
			$.each(self.datas, function(index, item) {
				if(parseInt(data_id) == item.id) {
					var str = that.text();
					switch(str) {
						case "编辑":
							self.editValue(item);
							break;
					}
				}
			});
		});
	},
	cacheData: function() {
		var self = this;
		var checkeds =[];
		var selects = $('#appManageTable  td input[type=checkbox]');
		for(var i = 0; i < selects.length; i++) {
			(function(Index) {
				var td = $(selects[Index]).parent().parent().parent();
				var tr = $(selects[Index]).parent().parent().parent().parent();
				if(selects[Index].checked == true) {
					checkeds.push(parseInt(tr.data("id").substring(3)));
				}
			})(i)
		}
		return checkeds;
	},
	getCheckApp: function() {
		var self = this;
		var checkedDatas = [];
		var checkeds = self.cacheData();
		for(var i = 0; i < checkeds.length; i++) {
			$.each(self.datas, function(index, item) {
				if(checkeds[i] == item.id) {
					checkedDatas.push(item);
				}
			});
		}
		return checkedDatas;
	},
	reset: function(){
		var self = this;
		self.appList = 10;
		$("#appManageTable").empty();
		self.getApplist("appManage");
		$("#addAPP").hide();
		$("#editAPP").hide();
		$("#deleteAPP").hide();
	},
	addApp: function() {
		var self = this;
		var checkedAttrs = [];
		var list = $("#addAPP").find("ul li input[type=checkbox]");
		for(var i = 0; i < list.length; i++) {
			(function(Index) {
				if(list[Index].checked == true) {
					checkedAttrs.push(list[Index].value); 
				}
			})(i);
		}
		var attrs = self.getSelected(checkedAttrs) + "";
		var requestData = {
			"name": $("#addAppName").val(),
			"description": $("#addAppDes").val(),
			"version": $("#addAppVersion").val(),
			"url": $("#addAppUrl").val(),
			"type": $("#addAppType").val(),
			"build_id": $("#addAppBuildId").val(),
			"attrs": attrs
		};
		$.ajax({
			type: 'post',
			url: self.http.server,
			headers: {
				"method": "cloud.app.add",
				"appid": self.http.appid,
				"sign": PT_utils.getSign(JSON.stringify(requestData), self.http.secretkey),
				"timestramp": Date.parse(new Date()) / 1000,
				"token": self.cookieObj.token,
				"uid": self.cookieObj.uid
			},
			data: JSON.stringify(requestData),
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
			success: function(data) {
				if(data.error_code == 62002) {
					PT_utils.confirmBox("token错误,请重新登录!");
				}else if(data.error_code == 0) {
					self.reset();
//					PT_utils.showBox("添加成功")
					$("#addapp_error").hide();
				} else {
					PT_utils.showBox(data.msg);
				}

			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {}
		});
	},
	showTip: function(){
		var inputlist = $("input");
		for(var j = 0; j< inputlist.length; j++){
			(function(Index) {
				if($.trim($(inputlist[Index]).val()).length ==0) {
					$(inputlist[Index]).siblings(".tip").hide();
				}else{
					$(inputlist[Index]).siblings(".tip").show();
				}
			})(j)
		}
		if($.trim($("textarea").val()).length ==0) {
			$("textarea").siblings(".tip").hide();
		}else{
			$("textarea").siblings(".tip").show();
		}	
	},
	editValue: function(obj) {
		var self = this;
		$("#editapp_error").hide();
		$("#editAppId").val("");
		$("#editAppUrl").val("");
		$("#editAppType").val("");
		$("#editAppBuildId").val("");
		$("#editAppDes").val("");
		$("#editAppName").val("");
		$("#editAppVersion").val("");
		
		
		$("#editAppId").val(obj.appid);
		$("#editAppUrl").val(obj.url);
		$("#editAppType").val(obj.type);
		$("#editAppBuildId").val(obj.build_id);
		$("#editAppDes").val(obj.description);
		$("#editAppName").val(obj.name);
		$("#editAppVersion").val(obj.version);
		var list = $("#editAPP").find("ul li input[type=checkbox]");
		var service = self.getService(parseInt(obj.attrs));
		for(var i = 0; i < list.length; i++) {
			(function(Index) {
				$.each(service, function(j, item) {
					if(list[Index].value == item.serviceName) {
						if(item.state) {
							list[Index].checked = true;
						}
					}
				});
			})(i)
		}
		
		self.showTip();
		$("#editAPP").show();
		
		$("#save_editApp").click(function() {
			if($.trim($("#editAppName").val()) !== ""){
				var checkedAttrs = [];
				for(var j = 0; j < list.length; j++) {
					if(list[j].checked == true) {
						checkedAttrs.push(list[j].value);
					}
				}
				var attrs = self.getSelected(checkedAttrs);
				obj.attrs = attrs + "";
				self.editApp(obj);
			}else{
				$("#editapp_error").text("应用名称不能为空");
				$("#editapp_error").show();
			}
		});
	},
	editApp: function(obj) {
		var self = this;
		var requestData = {
			"appid": obj.appid,
			"name": $("#editAppName").val(),
			"description": $("#editAppDes").val(),
			"version": $("#editAppVersion").val(),
			"url": $("#editAppUrl").val(),
			"type": $("#editAppType").val(),
			"build_id": $("#editAppBuildId").val(),
			"attrs": obj.attrs
		};
		$.ajax({
			type: 'post',
			url: self.http.server,
			headers: {
				"method": "cloud.app.edit",
				"appid": self.http.appid,
				"sign": PT_utils.getSign(JSON.stringify(requestData), self.http.secretkey),
				"timestramp": Date.parse(new Date()) / 1000,
				"token": self.cookieObj.token,
				"uid": self.cookieObj.uid
			},
			data: JSON.stringify(requestData),
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
			success: function(data) {
				if(data.error_code == 62002) {
					PT_utils.confirmBox("token错误,请重新登录!");
				}else if(data.error_code == 0) {
					self.reset();
					$("#editapp_error").hide();
//					PT_utils.showBox("编辑成功");
				} else {
					PT_utils.showBox("编辑失败");
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {}
		});
	},
	deleteValue: function() {
		var self = this;
		var selects = self.getCheckApp();
		var obj = [];
		if(selects.length == 0) {
			PT_utils.showBox("请选择数据");
		}else {
			$("#deleteAPP").show();
			$("#deletetr").on("click",function() {
				obj = selects; 
				var appids = [];
				$.each(obj, function(index,item) {
					appids.push(item.appid);
				});
				self.deleteApp(appids);
			});
		}
	},
	deleteApp: function(appids) {
		var self = this;
		var appid = "";
		for(var i = 0; i < appids.length; i++) {
			if(i==0){
				appid = appids[i]+"";
			}else {
				appid = appid+";"+appids[i] ;
			}
		}
		var requestData = {
			appid: appid
		};
		$.ajax({
			type: 'post',
			url: self.http.server,
			headers: {
				"method": "cloud.app.delete",
				"appid": self.http.appid,
				"sign": PT_utils.getSign(JSON.stringify(requestData), self.http.secretkey),
				"timestramp": Date.parse(new Date()) / 1000,
				"token": self.cookieObj.token,
				"uid": self.cookieObj.uid
			},
			data: JSON.stringify(requestData),
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
			success: function(data) {
				if(data.error_code == 62002) {
					PT_utils.confirmBox("token错误,请重新登录!");
//					window.location.href= "login.html";
				}else if(data.error_code == 0) {
					self.reset();
//					PT_utils.showBox("删除成功");
				} else {
					PT_utils.showBox("删除失败");
				}

			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {}
		});
	},
	//有数据
	renderTable: function(item, data) {
		var self = this;
		var $tr = $('<tr data-id="tr_'+data.id+'"></tr>');
		if(item == "appManage") {
			var $checkbox = $('<td><div class="cloud-check"><div class="checkbox">' +
				'<input type="checkbox" name="checkbox" id="app_' + data.id + '" />' +
				'<label for="app_' + data.id + '" class="btn-check"></label></div></div></td>');
//			var $appId = $('<td title="'+data.id+'">' + data.id + '</td>');
			var $appName = $('<td title="'+data.name+'">' + data.name + '</td>');
			var $appCode = $('<td title="'+data.appid+'">' + data.appid + '</td>');
			var $secret_key = $('<td title="'+data.secret_key+'">' + data.secret_key + '</td>');
			var $td = $('<td></td>');
			var $service = $('<div class="service-list"></div>');
			var $ul = $('<ul></ul>');
			var $ul2 = $('<ul></ul>');
			var $ul3 = $('<ul></ul>');
			var $ul4 = $('<ul></ul>');
			var $li = null;
			var $li2 = null;
			var $li3 = null;
			var $li4 = null;
			var service = self.getService(parseInt(data.attrs));
			$.each(service, function(index, item) {
				if(index <= 1) {
					if(item.state) {
						$li = $('<li><div class="service-info success" data-state="true">' + item.serviceName + '</li>');
					} else {
						$li = $('<li><div class="service-info fail">' + item.serviceName + '</li>');
					}
					$li.appendTo($ul);
				} else if(index>1 && index <= 3) {
					if(item.state) {
						$li2 = $('<li><div class="service-info success">' + item.serviceName + '</li>');
					} else {
						$li2 = $('<li><div class="service-info fail">' + item.serviceName + '</li>');
					}
					$li2.appendTo($ul2);
				}else if(index>3 && index <= 5) {
					if(item.state) {
						$li3 = $('<li><div class="service-info success">' + item.serviceName + '</li>');
					} else {
						$li3 = $('<li><div class="service-info fail">' + item.serviceName + '</li>');
					}
					$li3.appendTo($ul3);
				}else if(index>5 && index <= 7) {
					if(item.state) {
						$li4 = $('<li><div class="service-info success">' + item.serviceName + '</li>');
					} else {
						$li4 = $('<li><div class="service-info fail">' + item.serviceName + '</li>');
					}
					$li4.appendTo($ul4);
				}
			});
			$service.appendTo($td);
			$ul.appendTo($service);
			$li.appendTo($ul);
			if($li2 !== null) {
				$ul2.appendTo($service);
				$ul3.appendTo($service);
				$ul4.appendTo($service);
			}
			var $version = $('<td title="'+data.version+'">' + data.version + '</td>');
			var $btn = $('<td><a>编辑</a></td>');
			$checkbox.appendTo($tr);
//			$appId.appendTo($tr);
			$appName.appendTo($tr);
			$secret_key.appendTo($tr);
			$appCode.appendTo($tr);
			$td.appendTo($tr);
			$version.appendTo($tr);
			$btn.appendTo($tr);
		}
		$("#" + item + "Table").append($tr);
	},
	getSelected: function(arr) {
		var attrs = 0;
		for(var i=0; i<arr.length;i++){
			switch(arr[i]) {
				case "消息推送":
					attrs = attrs + 1;
					break;
				case "日志收集":
					attrs = attrs + 2;
					break;
				case "崩溃收集":
					attrs = attrs + 4;
					break;
				case "数据采集":
					attrs = attrs + 8;
					break;
				case "服务提供":
					attrs = attrs + 16;
					break;
				case "云存储":
					attrs = attrs + 32;
					break;
				case "语言识别":
					attrs = attrs + 64;
					break;
			}
		}
		
		return attrs;
	},
	getService: function(attrs) {
		var res = [];
		var service = {};
		service.serviceName = "消息推送";
		service.state = (attrs & 1) ? true : false;
		res.push(service);

		service = new Object();
		service.serviceName = "日志收集";
		service.state = (attrs & 2) ? true : false;
		res.push(service);

		service = new Object();
		service.serviceName = "崩溃收集";
		service.state = (attrs & 4) ? true : false;
		res.push(service);

		service = new Object();
		service.serviceName = "数据采集";
		service.state = (attrs & 8) ? true : false;
		res.push(service);

		service = new Object();
		service.serviceName = "服务提供";
		service.state = (attrs & 16) ? true : false;
		res.push(service);

		service = new Object();
		service.serviceName = "云存储";
		service.state = (attrs & 32) ? true : false;
		res.push(service);

		service = new Object();
		service.serviceName = "语言识别";
		service.state = (attrs & 64) ? true : false;
		res.push(service);

		return res;
	},
	//显示的页面
	active: function(str) {
		var self = this;
		var arr = ['appManage', 'second', 'third'];
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
$(document).ready(() => {
	new PT.Index();
})