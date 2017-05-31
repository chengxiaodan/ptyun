/**
 * 公共方法
 */
const pt_utils = {
	http: () => {
		//测试
//		const server = "http://dev-api-open.ptdev.cn/";
//		const appid = "1018040505148900352";
//		const secretkey = "07E138230250439E8E24293F19B6D725";
		//线上
		const server = "https://api-open.putao.com/";
		const appid = "1018043273668494336";
		const secretkey = "07E13AFF126A4CAFBE58171AAB1CEE51";
		return {
			server: server,
			appid: appid,
			secretkey: secretkey
		}
	},
	getSign: (str, secretkey) => {
		return hex_sha1(hex_md5(str).toLowerCase() + secretkey).toLowerCase();
	},
	namespace: (...obj) => {
		var a, v, x, o, d, i, j, len1, len2;
		a = obj;
		len1 = a.length;
		// 支持多参数,如两个参数（a.b.c, d.e）
		for(i = 0; i < len1; i++) {
			d = a[i].split('.'); // 分解成数组，如把a.b.c分解成[a,b,c]
			o = window[d[0]] = window[d[0]] || {}; // 保证a是对象,若果全局有就用全局的，如果没有就新建{}
			x = d.slice(1); //取出[b,c]
			len2 = x.length;

			// 支持嵌套，对b和c
			for(j = 0; j < len2; j++) {
				v = x[j]
				o = o[v] = o[v] || {}; // o逐层深入，保证每层都是对象，如果是b，o变为a.b，如果是c，o最后变成a.b.c
			}
		}
	},
	/*判断输入是否为合法的手机号码*/
	isphone: (inputString) => {
		var partten = /^1[0-9]{10}$/;
		var bchk = partten.test(inputString);
		return bchk;
	},
	//验证邮箱
	fChkMail: (mail) => {
		var reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,5}$/;
		var bchk = reg.test(mail);
		return bchk;
	},
	//密码长度应为8-16个字符的英文字母和数字
	fChkPassword: (password) => {
		var reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/;
		var bchk = reg.test(password);
		return bchk;
	},
	dateFormat: (time) => {
		var format_result = time.getFullYear() + "/";

		if(time.getMonth() + 1 < 10) {
			format_result += "0";
		}
		format_result += time.getMonth() + 1 + "/";
		if(time.getDate() < 10) {
			format_result += "0";
		}
		format_result += time.getDate() + " ";
		if(time.getHours() < 10) {
			format_result += "0";
		}
		format_result += time.getHours() + ":";
		if(time.getMinutes() < 10) {
			format_result += "0";
		}
		format_result += time.getMinutes();
		return format_result;
	},
	//邮箱
	goEail: (email, ln) => {
		var Link = document.getElementById(ln);
		var MailLink = email.split("@")[1];
		MailLink = MailLink.toLowerCase();
		var hash = {
			'qq.com': 'http://mail.qq.com',
			'gmail.com': 'http://mail.google.com',
			'sina.com': 'http://mail.sina.com.cn',
			'163.com': 'http://mail.163.com',
			'126.com': 'http://mail.126.com',
			'yeah.net': 'http://www.yeah.net/',
			'sohu.com': 'http://mail.sohu.com/',
			'tom.com': 'http://mail.tom.com/',
			'sogou.com': 'http://mail.sogou.com/',
			'139.com': 'http://mail.10086.cn/',
			'hotmail.com': 'http://www.hotmail.com',
			'live.com': 'http://login.live.com/',
			'live.cn': 'http://login.live.cn/',
			'live.com.cn': 'http://login.live.com.cn',
			'189.com': 'http://webmail16.189.cn/webmail/',
			'yahoo.com.cn': 'http://mail.cn.yahoo.com/',
			'yahoo.cn': 'http://mail.cn.yahoo.com/',
			'eyou.com': 'http://www.eyou.com/',
			'21cn.com': 'http://mail.21cn.com/',
			'188.com': 'http://www.188.com/',
			'foxmail.com': 'http://www.foxmail.com'
		};
		for(var j in hash) {
			if(hash[MailLink]) {
				Link.href = hash[MailLink];
			} else {
				Link.href = "http://mail." + hash[MailLink];
			}
		}
	},
	//进度条
	progress: (id, process) => {
		var canvas = document.getElementById(id);
		if(process == 100) {
			$("#" + id).hide();
		} else {
			$("#" + id).show();
		}
		//x,y 坐标,radius 半径,process 百分比,backColor 中心颜色, proColor 进度颜色, fontColor 中心文字颜色
		var x = canvas.width / 2;
		var y = canvas.height / 2;
		var radius = 60;
		var process = process;
		var backColor = '#f3f3f3';
		var proColor = '#8C61DA';
		var fontColor = '#8C61DA';
		if(canvas.getContext) {
			var cts = canvas.getContext('2d');
		} else {
			return;
		}
		cts.beginPath();
		// 坐标移动到圆心  
		cts.moveTo(x, y);
		// 画圆,圆心是24,24,半径24,从角度0开始,画到2PI结束,最后一个参数是方向顺时针还是逆时针  
		cts.arc(x, y, radius, 0, Math.PI * 2, false);
		cts.closePath();
		// 填充颜色  
		cts.fillStyle = backColor;
		cts.fill();

		cts.beginPath();
		// 画扇形的时候这步很重要,画笔不在圆心画出来的不是扇形  
		cts.moveTo(x, y);
		cts.lineWidth = 10; //预填充环的宽度
		// 跟上面的圆唯一的区别在这里,不画满圆,画个扇形  
		cts.arc(x, y, radius, Math.PI * 1.5, Math.PI * 1.5 - Math.PI * 2 * process / 100, true);
		cts.closePath();
		cts.fillStyle = proColor;
		cts.fill();

		//填充背景白色
		cts.beginPath();
		cts.moveTo(x, y);
		cts.arc(x, y, radius - (radius * 0.26) + 10, 0, Math.PI * 2, true);
		cts.closePath();
		cts.fillStyle = '#ffffff';
		cts.fill();

		//在中间写字 
		cts.font = "bold 9pt Arial";
		cts.fillStyle = fontColor;
		cts.textAlign = 'center';
		cts.textBaseline = 'middle';
		cts.moveTo(x, y);
		cts.fillText(process + "%", x, y);
	},
	// 根据参数名称获取value    
	getUrlParameter: (paramKey) => {
		var sURLVariables, i, sParameterName, sPageURL = window.location.search.substring(1);
		if(sPageURL) {
			sURLVariables = sPageURL.split("&");
			for(i = 0; i < sURLVariables.length; i++) {
				sParameterName = sURLVariables[i].split("=");
				if(sParameterName[0] === paramKey) return sParameterName[1]
			}
		}
	},
	setCookie: (name, value, time) => {
		var strsec = pt_utils.getsec(time);
		var exp = new Date();
		exp.setTime(exp.getTime() + strsec * 1);
		document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
	},
	getsec: (str)=> {
		var str1 = str.substring(1, str.length) * 1;
		var str2 = str.substring(0, 1);
		if(str2 == "s") {
			return str1 * 1000;
		} else if(str2 == "h") {
			return str1 * 60 * 60 * 1000;
		} else if(str2 == "d") {
			return str1 * 24 * 60 * 60 * 1000;
		}
	},
	getCookie: (name) => {
		var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
		if(arr = document.cookie.match(reg))
			return unescape(arr[2]);
		else
			return null;
	},
	delCookie: (name) => {
		var exp = new Date();
		exp.setTime(exp.getTime() - 1);
		var cval = getCookie(name);
		if(cval != null)
			document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
	},
	clearCookie: ()=>{ 
	    var keys=document.cookie.match(/[^ =;]+(?=\=)/g); 
	    if (keys) { 
        		for (var i = keys.length; i--;){
            		document.cookie=keys[i]+'=0;expires=' + new Date( 0).toUTCString();
        		}
        } 
	},
	getToken: ()=>{
		var jsonp = {};
		if(pt_utils.getCookie("token")!==null){
			jsonp.token = pt_utils.getCookie("token");
			jsonp.uid = pt_utils.getCookie("uid");
			jsonp.username = pt_utils.getCookie("username");
		}else{
			Showbo.Msg.confirm("token已过期，请重新登录！",function(flag){
				if(flag){
					window.location.href = "login.html";
				}
			});
		}
		return jsonp;
	},
	showBox: (msg)=>{
		Showbo.Msg.alert(msg);
//		var time = setInterval(function() {
//			Showbo.Msg.hide();
//			clearInterval(time);
//		}, 3000);
	},
	confirmBox: (msg)=>{
		Showbo.Msg.confirm(msg,function(flag){
				if(flag){
					window.location.href = "login.html";
				}
		});
	}
}
export default pt_utils;