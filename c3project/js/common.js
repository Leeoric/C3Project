//version: 20170724-1423

//host
// var host = 'http://10.102.16.202:8080/3CWeb/';
// var host = 'http://10.100.2.131:8080/3CWeb/';
// var host = 'http://10.202.32.15/3CWeb/';
// var host = 'http://10.10.100.42/3CWeb/';
var host = '/3CWeb/';

//获取来源页
var sourcePage = window.localStorage.getItem('currentPage');
var opLog = outPutLog();

//将从终端获取到的serverinfo从本地取出，避免重复多次获取
var serverInfoCache = function (serverName) {
	return window.sessionStorage.getItem(serverName);
}

//serverinfo中videoserver获取奇慢，现进入页面就缓存一次
getIPAdressFromClient('VideoServer');

//accessState为进入状态标记
//如果进入状态为1，则弹出恭喜报名成功的浮层
//如果进入状态为0，则弹出很遗憾的浮层
var accessState = 1;
//终端测试方法
var debug = false;
// var debug = true;

//允许浏览器跨域访问
$.support.cors = true;
//如果是IE9-浏览器，重写console函数，使其兼容
if (isIEX()) {
	window._console = window.console;//将原始console对象缓存
	window.console = (function (orgConsole) {
		return {//构造的新console对象
			log: getConsoleFn("log"),
			debug: getConsoleFn("debug"),
			info: getConsoleFn("info"),
			warn: getConsoleFn("warn"),
			exception: getConsoleFn("exception"),
			assert: getConsoleFn("assert"),
			dir: getConsoleFn("dir"),
			dirxml: getConsoleFn("dirxml"),
			trace: getConsoleFn("trace"),
			group: getConsoleFn("group"),
			groupCollapsed: getConsoleFn("groupCollapsed"),
			groupEnd: getConsoleFn("groupEnd"),
			profile: getConsoleFn("profile"),
			profileEnd: getConsoleFn("profileEnd"),
			count: getConsoleFn("count"),
			clear: getConsoleFn("clear"),
			time: getConsoleFn("time"),
			timeEnd: getConsoleFn("timeEnd"),
			timeStamp: getConsoleFn("timeStamp"),
			table: getConsoleFn("table"),
			error: getConsoleFn("error"),
			memory: getConsoleFn("memory"),
			markTimeline: getConsoleFn("markTimeline"),
			timeline: getConsoleFn("timeline"),
			timelineEnd: getConsoleFn("timelineEnd")
		};
		function getConsoleFn(name) {
			return function actionConsole() {
				if (typeof (orgConsole) !== "object") return;
				//判断原始console对象中是否含有此方法，若没有则直接返回
				if (typeof (orgConsole[name]) !== "function") return;
				//调用原始函数
				return orgConsole[name].apply(orgConsole, Array.prototype.slice.call(arguments));
			};
		}
	}(window._console));
}

//get sessionID
//该方法会调用终端方法,在网页中调试时需要手动设置sessionid
var personalInfo = {
	userName: '',
	userCompany: '',
	userId: '',
	userCrmId: '',
	userEmail: '',
	userPhoneNum: '',
	userPhoto: '',
	isLoadingStorage: false,
	isLogin: window.sessionStorage.getItem('isLogin'),
	init: function () {
		var self = this;
		if (this.isLogin != 'yes') {
			var sessionId = this.getSessionID();
			this.getPriviteInfo(sessionId);
		} else {
			var renderData = JSON.parse(window.sessionStorage.getItem('userinfo'));
			self.renderUserInfo(renderData);
			//根据CRM获取头像
			self.getUserImg(renderData.crmId);
		}

		//测试！
		if (debug) {
			this.userPhoto = 'img/m1.png';
			this.userName = '宋庆席';
			this.userCompany = 'Wind资讯';
		}
	},
	getSessionID: function () {
		var sid = null;
		var sidStorage = window.sessionStorage.getItem('sessionid');
		//浏览器地址栏是否手动写入sessionid
		var sidFromUrl = getQueryString(window.location.search, 'wind.sessionid');
		if (sidFromUrl) {
			opLog.setLog('', 'sidFromUrl: ' + sidFromUrl);
			sid = sidFromUrl;
		} else {
			//如果浏览器地址栏没有手动写入sessionid，那么从终端获取
			var clientSid = getSessionIdFromClient();
			if (clientSid) {
				sid = clientSid;
			} else {
				//如果终端也没取到，就返回
				return false;
			}
		}
		//将获取到的sid与本地存储的sessionid比较，如果相同，则返回任意一个
		if (sid == sidStorage) {
			opLog.setLog('', '获取到的ID与本地相同，读取缓存login信息、头像');
			//使用本地缓存的login信息、头像
			this.isLoadingStorage = true;
			return sid;
		} else {
			//如果不同，说明本地存储的过期了，那么发送新的login请求、头像请求
			opLog.setLog('', '获取到的ID与本地不同，重新发送请求');
			this.isLoadingStorage = false;
			window.sessionStorage.setItem('isLogin', 'no');
			window.sessionStorage.setItem('sessionid', sid);
			return sid;
		}
	},
	getPriviteInfo: function (sessionID) {
		var self = this;
		//检查是否有参数传进来
		if (!sessionID) {
			opLog.setLog('', '没有获取到sessionid，不能发送login请求');
			return false;
		}
		if (self.isLoadingStorage && window.sessionStorage.getItem('userinfo')) {
			//检查本地是否保存用户信息
			var renderData = JSON.parse(window.sessionStorage.getItem('userinfo'));
			self.renderUserInfo(renderData);
			//根据CRM获取头像
			self.getUserImg(renderData.crmId);
			return;
		}
		$.ajax({
			url: host + 'login.json',
			type: 'GET',
			data: 'wind.sessionid=' + sessionID,
			dataType: 'json',
			async: false,
			timeout: 15000,
			complete: function (xhr, status) {
				if (status == 'timeout') {
					opLog.setLog('login timeout', '获取登录信息超时');
					window.sessionStorage.setItem('isLogin', 'no');
				}
			},
			success: function (data) {
				opLog.setLog('login success', data);
				window.sessionStorage.setItem('isLogin', 'yes');
				window.sessionStorage.setItem('userinfo', JSON.stringify(data));
				self.renderUserInfo(data);
				//根据CRM获取头像
				self.getUserImg(data.crmId);
			},
			error: function (error) {
				opLog.setLog('login fail', error);
				window.sessionStorage.setItem('isLogin', 'no');
				window.sessionStorage.setItem('sessionid', '');
				$('#userImg').attr('src', 'img/m1.png');
				if (JSON.parse(error.responseText).errorCode == 1022) {
					layer.msg('身份验证已经过期，请重新登入页面.');
				}
				if (JSON.parse(error.responseText).errorCode == 1003) {
					layer.msg('未知错误，错误码1003');
				}
			}
		});
	},
	renderUserInfo: function (data) {
		var self = this;
		self.userName = data.name;
		self.userCompany = data.institutionName;
		self.userId = data.id;
		self.userCrmId = data.crmId;
		self.userEmail = data.email;
		self.userPhoneNum = data.phoneNum;
		//渲染用户信息
		$('#userName').text(self.userName);
		$('#userCompany').text(self.userCompany);
		$('#userImg').attr('src', self.userPhoto);
	},
	getUserImg: function (crmid) {
		var self = this;
		if (debug) {
			$('#userImg').attr('src', 'img/m1.png');
			return false;
		}
		//检查本地是否保存用户头像
		if (self.isLoadingStorage && window.sessionStorage.getItem('userImage')) {
			$('#userImg').attr('src', 'data:image/png;base64,' + window.sessionStorage.getItem('userImage'));
			return;
		}
		$.ajax({
			url: host + 'getUserHeadPortraitByCRMId.json',
			type: 'GET',
			data: 'crmId=' + crmid,
			async: false,
			dataType: 'json',
			timeout: 15000,
			complete: function (xhr, status) {
				if (status == 'timeout') {
					opLog.setLog('', 'getting user img timeout');
				}
			},
			success: function (data) {
				opLog.setLog('', 'getting user img success');
				if (data[0].iconData.length <= 8) {
					$('#userImg').attr('src', 'img/m1.png');
				} else {
					$('#userImg').attr('src', 'data:image/png;base64,' + data[0].iconData);
					window.sessionStorage.setItem('userImage', data);
				}
			},
			error: function (error) {
				opLog.setLog('getting user img failed', error);
				$('#userImg').attr('src', 'img/m1.png');
			}
		});
	},
	removeStorageInfo: function () {
		window.sessionStorage.removeItem('isLogin');
		window.sessionStorage.removeItem('sessionid');
		window.sessionStorage.removeItem('userinfo');
	}
};
personalInfo.init();

function getSessionIdFromClient() {
	var cmd = "{func:'querydata', isGlobal:1, name : 'sessionid'}";
	if (window.external.ClientFunc) {
		var ret_data = window.external.ClientFunc(cmd);
	} else {
		opLog.setLog('', 'can not support client function');
		layer.msg('不能识别当前环境，请手动设置ID或在终端内打开页面。');
		return '';
	}
	var sessionID = JSON.parse(ret_data).value;
	if (!sessionID) {
		opLog.setLog('', 'can not get session id from client');
		layer.msg('无法识别您的身份，请在终端内打开页面。');
		return '';
	} else {
		opLog.setLog('has got session id', sessionID);
		window.sessionStorage.setItem('sessionid', sessionID);
		return sessionID;
	}
}
// 浮动层，禁止通过
// var forbidden = '<div class="float-div float-div-reject hide">' +
// 	'<div class="float-info">' +
// 	'<span class="float-cancel"><img src="img/u488.png"></span>' +
// 	'<p>很遗憾，您未能获得主办方审核，不能参加本场会议。如有疑问请联系会议秘书或者拨打：025-68673555转0</p>' +
// 	'<span class="float-confirm">关闭</span>' +
// 	'</div>' +
// 	'</div>';
// 浮动层，允许通过
// var allow = '<div class="float-div float-div-success hide">' +
// 	'<div class="float-info">' +
// 	'<span class="float-cancel"><img src="img/u488.png"></span>' +
// 	'<p>恭喜您！报名成功！</p>' +
// 	'<span class="float-confirm">确认</span>' +
// 	'</div>' +
// 	'</div>';
//浮动层是否已经显示，如果是true才显示
var isDisplay = true;
//等待数据的遮罩层
function shadeStr(msg) {
	var str = '<div class="shade-wrap">' +
		'<div class="shade">' +
		'<img src="img/down.gif">' +
		'<span>' + msg + '</span>' +
		'</div>' +
		'</div>';
	return str;
}

//功能点编号
//Banner广告
var bannerADEntance = 901800040022,
	//最新会议打开来源
	latstMeetingEntance = 1800040005,
	//历史会议打开来源
	historyMeetingEntance = 1800040006,
	//搜索打开来源
	searchMeetingEntance = 1800040004,
	//立即参会打开来源
	joinMeetingFrom = 901800040023,
	//立即报名打开来源
	signUpFrom = 901800040024,
	//会议详情页面打开来源
	confDetailFrom = 001800040009,
	//会议详情页面会议类型
	meetingType = 001800040009,
	//视频回看打开来源
	videoBackView = 901800040018,
	//听录音打开来源
	audioBackView = 001800040011,
	//看速记打开来源
	shortHandBackView = 001800040010,
	//桌面共享软件下载
	softwareDownload = 901800040031,
	//历史会议类型筛选
	historyMeetingType = 901800040102,
	//历史会议领域筛选
	historyMeetingIndustry = 901800040101,
	//取消收藏会议打开来源
	favouriteMeetingCancelEntance = 901800040035,
	//收藏会议打开来源
	favouriteMeetingEntance = 901800040020,
	//会议资讯类型筛选
	confInfoType = 922300090021,
	//会议资讯时间筛选
	confInfoTime = 922300090023,
	//会议资讯地点筛选
	confInfoPlace = 922300090022,
	//搜索词
	searchWord = 001800040004,
	//搜索打开来源
	searchFrom = 001800040004,
	//合作伙伴内容
	partnersContent = 901800040108,
	//合作伙伴点击次数
	partnersNumber = 901800040108,
	//下载附件
	attachmentDownload = 901800040103;


//弹出浮动层
function enterTips(isAllow) {
	if (isAllow) {
		layer.alert('恭喜您！报名成功！', {
			title: '提示',
			btnAlign: 'c'
		});
	} else if (!isAllow) {
		layer.alert('很遗憾，您未能获得主办方审核，不能参加本场会议。如有疑问请联系会议秘书或者拨打：025-68673555转0', {
			title: '提示',
			icon: 2,
			btnAlign: 'c'
		});
	}
}

//计算字符串长度(英文占1个字符，中文汉字占2个字符)
String.prototype.gblen = function () {
	var len = 0;
	for (var i = 0; i < this.length; i++) {
		if (this.charCodeAt(i) > 127 || this.charCodeAt(i) == 94) {
			len += 2;
		} else {
			len++;
		}
	}
	return len;
}
//-------------终端功能点相关函数开始----------------
// 关闭错误提示
window.onerror = function () {
	return false;
}
function requestCmd(cmd) {
	try {
		var json = window.external.ClientFunc(cmd);
		//if(debug) alert("requestCmd.returnJson:" + json);
		if (json != null || json != undefined || json != null) {
			json = string2json(json);
		} else {
			json = undefined;
		}
		return json;
	}
	catch (e) {
	}
	return "";
}

function string2json(strJson) {
	try {
		var j = "(" + strJson + ")"; // 用括号将json字符串括起来
		return eval(j); // 返回json对象
	}
	catch (e) {
		return null;
	}
}

//设置功能点日志
function writeLog(commandname, parm) {
	//先判断终端的版本
	var cmd = "{\"func\":\"querydata\", \"name\":\"version2\", \"isGlobal\":\"1\"}";
	var temp = requestCmd(cmd);
	var flag = false;
	try {
		if (parseInt(temp.result) > 141337471) {
			flag = true;
		}
	} catch (err) {
	}
	if (flag) {
		var cmd = "{\"func\":\"writeauditlog\",\"isGlobal\":\"1\",\"Commandname\":\"" + commandname + "\",\"param\":\"" + "" + "\",\"propertys\":\"" + parm + "\"}";
		requestCmd(cmd);
	}
	else {
		var cmd = "{\"func\":\"writeauditlog\",\"isGlobal\":\"1\",\"Commandname\":\"" + commandname + "\",\"param\":\"" + "" + "\"}";
		requestCmd(cmd);
	}
}

//-------------终端功能点相关函数结束----------------
//获取报名和收藏状态
function getMtingSignupBookmark(meetingId) {
	//var meetingId = [1,2,3,5,4,84,222];
	var revdata;
	if (meetingId.length == 0) {
		return false;
	}
	opLog.setLog('', 'will get sign up and fav with synchronize...');
	$.ajax({
		url: host + 'getMeetingAttendance.json?meetingId=' + meetingId,
		type: 'GET',
		//不可异步，必须同步！
		async: false,
		dataType: 'json',
		timeout: 15000,
		complete: function (xhr, status) {
			if (status == 'timeout') {
				layer.msg("报名收藏状态请求超时。");
			}
		},
		success: function (data) {
			opLog.setLog('getting sign up and fav status success', data);
			revdata = data;
		},
		error: function (error) {
			opLog.setLog('getting sign up and fav status failed', error);
		}
	});
	return revdata;
}

//将报名收藏状态数据装入会议列表数据中
function dataMix(data, signUpBookStatus) {
	if (!data.list || !signUpBookStatus || data.list.length == 0 || !signUpBookStatus.length || signUpBookStatus.length == 0) {
		return false;
	}
	//遍历会议列表和收藏报名状态
	for (var i = 0; i < data.list.length; i++) {
		for (var j = 0; j < signUpBookStatus.length; j++) {
			//如果id相等，说明是同一场会议，加入状态值
			if (signUpBookStatus[j].meetingId == data.list[i].id) {
				//报名
				data.list[i].signupStatus = signUpBookStatus[j].signupStatus;
				//收藏
				data.list[i].bookmarkStatus = signUpBookStatus[j].bookmarkStatus;
				//不再循环
				break;
			} else {
				//如果两者ID对不上，说明没有报名和收藏，加入状态值
				data.list[i].signupStatus = false;
				data.list[i].bookmarkStatus = false;
			}
		}
	}
}

function getDocuments(documentId, documentType) {
	opLog.setLog('Request doc id', documentId);
	opLog.setLog('Request doc type', documentType);
	var url = '';
	$.ajax({
		url: host + 'getDocumentUrl.json',
		type: 'GET',
		data: {
			documentId: documentId,
			documentType: documentType
		},
		dataType: 'text',
		//必须改成同步请求，否则无法赋值
		async: false,
		timeout: 15000,
		headers: {'Content-Type': 'application/json'},
		beforeSend: function () {
			delayDiv(true, '正在获取资料,请稍后...');
		},
		complete: function (xhr, status) {
			delayDiv(false);
			if (status == 'timeout') {
				layer.msg("获取文档请求超时。");
			}
		},
		success: function (data) {
			opLog.setLog('getting doc success', data);
			delayDiv(false);
			url = decodeURIComponent(data);
		},
		error: function (error) {
			delayDiv(false);
			opLog.setLog('get doc failed', error);
			if (error.errorCode == 1033) {
				layer.alert('很遗憾，您未符合主办方审核条件，无法查看本场会议相关资料。如有疑问请联系会议秘书或者拨打：025-68673555转0', {
					title: '提示',
					btnAlign: 'c'
				});
			}
		}
	});
	return url;
}

//合作伙伴渲染
function renderFriendList() {
	var clickNum = 0;
	$.ajax({
		url: host + 'getPartners.json',
		type: 'GET',
		dataType: 'json',
		headers: {'Content-Type': 'application/json'},
		timeout: 15000,
		complete: function (xhr, status) {
			delayDiv(false);
			if (status == 'timeout') {
				opLog.setLog('', 'getting cooperative partner timeout');
			}
		},
		success: function (data) {
			opLog.setLog('', 'getting cooperative partner success');
			var handlerData = {
				friendList: data
			};
			var friTpl = template('friendTpl', handlerData);
			$('#friendList').html(friTpl);
			//写入功能点
			$('#friendList').on('click', 'li a', function () {
				writeLog(901800040108, 'content=' + $(this).text());
				clickNum++;
				writeLog(901800040108, 'number=' + clickNum);
			});
		},
		error: function (error) {
			opLog.setLog('', 'getting cooperative partner failed');
		}
	});
}

//将startTime和endTime的时间格式转换过来
//
function stringToDate(st, et) {
	var handledDateArr = [];
	var handledDate = '';
	var handledStArr = timeHandle(st);
	var handledEtArr = timeHandle(et);
	//handledDate1 = handledStArr[0] + ' ' + handledStArr[1] + '-' + handledEtArr[1];
	var weekArr = ['周日', '周一', '周二', '周三', '周四', '周五', '周六', '今天']
	//日期转为星期
	var weekArrIndex;
	//如果传入的时间和当前时间日期相等，就显示”今天“
	var inputDate = '' + new Date(handledStArr[0]).getFullYear() + new Date(handledStArr[0]).getMonth() + new Date(handledStArr[0]).getDay();
	var nowDate = '' + new Date().getFullYear() + new Date().getMonth() + new Date().getDay();
	if (inputDate == nowDate) {
		weekArrIndex = 7;
	} else {
		weekArrIndex = new Date(handledStArr[0]).getDay();
	}
	var week = weekArr[weekArrIndex];
	//["2017", "03", "10"]
	if (!handledStArr[0] || handledStArr[0] == 'null') {
		var fullDateString = [null, null, null];
	} else {
		var fullDateString = handledStArr[0].split("-");
	}


	//年-
	handledDateArr.push(fullDateString[0] + '-');
	//月-日
	handledDateArr.push(fullDateString[1] + '-' + fullDateString[2]);
	//星期
	handledDateArr.push(week);
	//开始结束时分
	handledDateArr.push(handledStArr[1] + '-' + handledEtArr[1]);
	//['2017-', '03-10', '周五', '09:30-10:00']
	return handledDateArr;
}

//处理时间格式核心函数
//接收 "2017-03-10 09:30:00"
//返回 ["2017-03-10", "09:30"]
function timeHandle(time) {
	if (!time) {
		return ["null", "null"];
	}
	//"2017-03-10 09:30:00"
	var timeArr = [];
	//["2017-03-10", "09:30:00"]
	var fullDateArr = time.split(" ");
	//["09","30","00"]
	var fullHourArr = fullDateArr[1].split(":");
	//"09:30"
	var fullHourString = fullHourArr[0] + ':' + fullHourArr[1];
	//["2017-03-10", "09:30"]
	timeArr.push(fullDateArr[0], fullHourString);
	return timeArr;
}

//模仿安卓Toast消息
function toastMsg(msg, delayTime) {
	if (msg == null || $.trim(msg) == "") return false;
	delayTime = delayTime || 1000;
	$("<div>" + msg + "</div>").css({
		"width": "200px",
		"padding": "15px",
		"line-height": "1.5em",
		"text-align": "center",
		"background": "#333",
		"opacity": ".8",
		"filter": "alpha(opacity=80)",
		"filter": "progid:DXImageTransform.Microsoft.Alpha(opacity=80)",
		"color": "#fff",
		"border-radius": "5px",
		"box-shadow": "1px 1px 5px rgba(204,204,204,.4)",
		"position": "fixed",
		"z-index": "99999",
		"bottom": "50%",
		"left": "50%",
		"margin-left": "-100px"
	}).appendTo("body").delay(delayTime).fadeOut(1000, function () {
		$(this).remove()
	});
};
function delayDiv(handle, msg) {
	if (!msg) {
		msg = '加载中...';
	}
	if (handle) {
		$('body').append(shadeStr(msg));
		$('.shade-wrap').css({
			position: 'absolute',
			left: '0',
			top: '0',
			width: '100%',
			height: '100%',
			background: 'rgba(0,0,0,.5)',
			zIndex: '99999'
		});
		$('.shade').css({
			position: 'absolute',
			top: '0',
			bottom: '0',
			left: '0',
			right: '0',
			margin: 'auto',
			zIndex: '99999',
			width: '150px',
			height: '50px',
			lineHeight: '50px',
			border: '1px solid #ccc',
			borderRadius: '3px',
			textAlign: 'center',
			backgroundColor: '#fff'
		});
	}
	if (!handle) {
		$('.shade-wrap').remove();
	}
}

//获取N天后的日期，接收参数为空则返回今天日期，接收数字，返回格式yyyy-mm-dd
//getDateStr(-1)--昨天日期
//getDateStr(30)--30天后日期
//如果all为true，返回年-月-日-时-分。如果为false，返回年-月-日
function getDateStr(count, forSetConfPage, forConfinfoPage) {
	count = count || 0;
	var d = new Date();
	//获取Count天后的日期
	d.setDate(d.getDate() + count);
	var yy = d.getFullYear();
	var mm = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1)
		: d.getMonth() + 1;
	var dd = d.getDate() < 10 ? '0' + d.getDate()
		: d.getDate();

	var hh = d.getHours();
	var mi = d.getMinutes();
	var ss = d.getSeconds();
	if (!forConfinfoPage) {
		return forSetConfPage ? yy + "-" + mm + "-" + dd + "-" + hh + "-" + mi
			: yy + "-" + mm + "-" + dd;
	} else {
		return yy + mm + dd;
	}

}

//报名
function signUp(meetingId, jQueryDom, fn) {
	// console.log(typeof jQueryDom.data('statusmark'), jQueryDom.data('statusmark'));;
	meetingId = meetingId || href[1];
	//如果没有报名权力，则弹出拒绝对话框
	if (sessionStorage.getItem('accessState') == 0) {
		enterTips(false);
		return false;
	} else {
		//如果有报名权力
		//写入功能点:立即报名功能点
		writeLog(signUpFrom, 'from=' + sourcePage);
		//如果已经报过名，p标签的自定义属性statusmark应该为true
		if (jQueryDom.data('statusmark') == true || jQueryDom.data('statusmark') == 'true') {
			opLog.setLog('', 'you have already signuped...');
			layer.msg('您已报名！');
		} else if (jQueryDom.data('statusmark') == 'full') {
			opLog.setLog('', 'The number is full');
			layer.msg('对不起，参会人数已满！');
		} else {
			//如果没有报名，发送报名请求
			opLog.setLog('', 'have not signup...will signup soon');
			$.ajax({
				url: host + 'signupMeeting.json',
				type: 'GET',
				data: {
					meetingId: meetingId
				},
				dataType: 'json',
				headers: {'Content-Type': 'application/json'},
				timeout: 15000,
				complete: function (xhr, status) {
					if (status == 'timeout') {
						layer.msg("报名请求超时。");
					}
				},
				success: function (data) {
					opLog.setLog('send signup request success', data);
					if (fn) {
						fn(data);
					}
				},
				error: function (error) {
					opLog.setLog('send signup request failed', error);
					if (error.status == 500 && JSON.parse(error.responseText).errorCode == 1033) {
						layer.alert('很遗憾，报名未成功。如有疑问请联系会议秘书或者拨打：025-68673555转0', {
							title: '提示',
							icon: 2,
							btnAlign: 'c'
						});
					} else if (error.status == 500 && JSON.parse(error.responseText).errorCode != 1033) {
						layer.msg('服务器异常，报名失败。');
					} else {
						layer.msg('报名失败。');
					}

				}
			});
		}
	}
}

//收藏
function bookmark(meetingId, bookmarked, fn) {
	$.ajax({
		url: host + 'bookmarkMeeting.json',
		type: 'GET',
		data: {
			meetingId: meetingId,
			bookmarked: bookmarked
		},
		dataType: 'json',
		timeout: 15000,
		complete: function (xhr, status) {
			if (status == 'timeout') {
				layer.msg("收藏请求超时。");
			}
		},
		success: function (data) {
			if (bookmarked) {
				opLog.setLog('cancel fav success', data);
				layer.msg('取消收藏！');
				//写入功能点，取消收藏
				writeLog(901800040035, 'entance=' + sourcePage);
			} else {
				opLog.setLog('get fav success', data);
				layer.msg('已经收藏！');
				//写入功能点，收藏
				writeLog(901800040020, 'entance=' + sourcePage);
			}
			if (fn) {
				fn(data);
			}
		},
		error: function (error) {
			if (error.readyState == 4 && error.status == 500) {
				layer.msg('收藏/取消收藏，请求失败。');
			}
			opLog.setLog('cancel fav failed', error);
		}
	});
}

//会议资讯页面、会议资讯跳转页面，处理date
function confinfoDateHandle(date) {
	//20170513
	var y = date.slice(0, 4),//2017
		m = date.slice(4, 6),//05
		d = date.slice(6);//13
	return y + '年' + m + '月' + d + '日';
}

//如果是IE9及以下的浏览器，返回true
function isIEX(num) {
	num = num || 10;
	if (num > 5 && num < 15) {
		var userAgent = navigator.userAgent;
		var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
		reIE.test(userAgent);
		var ieVersion = parseFloat(RegExp["$1"]);
		if (ieVersion < num) {
			return true;
		} else {
			return false;
		}
	}
}
function getIPAdressFromClient(serverName) {
	//如果浏览器地址栏输入了serverName
	if (getQueryString(location.search, serverName)) {
		window.sessionStorage.setItem(serverName, getQueryString(location.search, serverName));
		opLog.setLog('serverinfo has catched at sessionstorage', getQueryString(location.search, serverName));
		return getQueryString(location.search, serverName);
	} else if (serverInfoCache(serverName)) {
		//如果本地缓存中有serverName
		opLog.setLog('从本地sessionStorage中提取serverinfo.', serverInfoCache(serverName));
		return serverInfoCache(serverName);
	} else {
		//否则，从终端获取
		opLog.setLog('', '正在从终端获取serverinfo...');
		var cmd = "{\"func\":\"serverInfo\", \"name\":\"" + serverName + "\", \"isGlobal\":\"1\"}";
		var temp = requestCmd(cmd);
		var retryCount = 0;
		//如果第一次没取到，再取两次
		while (!temp && retryCount < 3) {
			opLog.setLog('', '没取到serverinfo,再取一次...');
			retryCount++;
			temp = requestCmd(cmd);
		}
	}
	if (temp) {
		window.sessionStorage.setItem(serverName, temp.serverInfoAddress);
		opLog.setLog('已经将 ' + serverName + ' 替换为:', temp);
		return temp.serverInfoAddress;
	} else {
		opLog.setLog('', '从终端获取到的temp为： ' + temp + ' ,值为false，return null');
		return null;
	}
}
//从PHP页面中解析出媒体地址
function getRealDocUrl(param) {
	opLog.setLog('从PHP中解析地址的函数接收到url参数，参数为：', param);
	//http://videoserver或者http://XX.XX.XX.XX
	var urlReg = /[a-zA-z]+:\/\/[\d+.\w+]*/;
	//http://或者https://
	var protocolReg = /[a-zA-z]+:\/\//;
	//IP检查
	var ipReg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
	//协议名： http://或者https://
	var protocolString = param.match(protocolReg);
	//http://videoserver或者http://XX.XX.XX.XX
	var docHostUrl = param.match(urlReg)[0];
	//videoserver或者XX.XX.XX.XX
	var docHostString = docHostUrl.replace(protocolReg, '');
	opLog.setLog('servername: ', docHostString);
	//如果docHostString不是IP地址，是个serverinfo，那么替换为相应的IP
	if (!ipReg.test(docHostString)) {
		var phpUrlHost = getIPAdressFromClient(docHostString);
		var phpUrl = param.replace(docHostString, phpUrlHost);
		opLog.setLog('phpUrlHost: ', phpUrlHost);
		opLog.setLog('phpUrl: ', phpUrl);
	} else {
		//如果是IP地址，直接使用
		var phpUrlHost = docHostString;
		var phpUrl = param;
		opLog.setLog('phpUrlHost: ', phpUrlHost);
		opLog.setLog('phpUrl: ', phpUrl);
	}
	var realUrl = '';
	var audioType = getQueryString(param, 'videoExten');
	$.ajax({
		url: phpUrl,
		dataType: 'html',
		type: 'GET',
		async: false,
		timeout: 10000,
		complete: function (xhr, status) {
			if (status == 'timeout') {
				layer.msg("解析音频地址请求超时，请重试。");
			}
		},
		success: function (data) {
			opLog.setLog('PHP页面获取成功！', data);
			if (audioType == '.wav') {
				if (isIEX()) {
					// var data1 = data.split('SRC="')[1].split('" NAME');
					var data1 = param;
				} else {
					var data1 = data.split('src="')[1].split('" controls');
				}
				opLog.setLog('wav格式文件从PHP页面解析完成！解析后数据： ', data1);
			} else {
				var data1 = data.split('flashvars="file=')[1].split('&');
				opLog.setLog('非wav格式文件从PHP页面解析完成！解析后数据： ', data1);
			}
			realUrl = data1[0];
			opLog.setLog('realUrl:', realUrl);
		},
		error: function (error) {
			opLog.setLog('PHP页面获取失败：', error);
		}
	});
	opLog.setLog('', protocolString + phpUrlHost + realUrl);
	return '' + protocolString + phpUrlHost + realUrl;
}
//从地址中获取参数
function getQueryString(url, name) {
	if (url) {
		var str = url.split('?')[1];
	} else {
		return null;
	}
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = str.match(reg);
	if (r != null) {
		return decodeURIComponent(r[2]);
	}
	return null;
}

function CheckChinese(val) {
	var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
	if (val) {
		val = val.charAt(0);
		if (reg.test(val)) {
			return true;
		} else {
			return false;
		}
	}

}
Array.prototype.removeByValue = function (val) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == val) {
			this.splice(i, 1);
			break;
		}
	}
}
Array.prototype.unique = function () {
	var hash = {}, result = [], type = '', item;
	for (var i = 0; i < this.length; i++) {
		item = this[i];
		type = Object.prototype.toString.call(item);

		if ( !hash[item + type] ) {
			hash[item + type] = true;
			result.push(item);
		}
	}
	return result;
}


//判断一个对象是否为空对象,如果是空对象，返回true，非空返回false
function isObjectEmpty(obj) {
	for (var key in obj) {
		return false;
	}
	return true;
}
//----------以下为通用点击事件-----------
var commonFunc = {
	init: function () {
		this.bindEvent();
	},
	bindEvent: function () {
		//搜索按钮鼠标点击
		$('body').on('click', '#navSearch span', function () {
			var searchVal = $(this).siblings('input').val();
			if ($.trim(searchVal) == '') {
				layer.msg('请输入您要搜索的内容。')
			} else {
				sessionStorage.setItem('searchInput', $.trim(searchVal));
				//写入功能点，搜索来源
				writeLog(searchMeetingEntance, 'entance=搜索图标');
				window.location.href = './search.html';
			}
		});
		//回车键搜索
		$('body').on('keydown', '#navSearch input', function (e) {
			if (e.keyCode == 13) {
				var searchVal = $(this).val();
				if ($.trim(searchVal) == '') {
					layer.msg('请输入您要搜索的内容。')
				} else {
					sessionStorage.setItem('searchInput', $.trim(searchVal));
					//写入功能点，搜索来源
					writeLog(searchMeetingEntance, 'entance=搜索图标');
					window.location.href = './search.html';
				}
			}
		});
		//点击浮层中的X，或者点击浮层中的“知道了”后，浮层隐藏
		$('body').on('click', '.float-confirm, .float-cancel', function () {
			$('.float-div').hide();
			isDisplay = true;
		});
		//点击页脚的软件下载，写入功能点
		$('#softwareDownload').on('click', function () {
			writeLog(901800040031, 'from=' + window.localStorage.getItem('currentPage'));
		});
	}
};
commonFunc.init();

//------log-------
function outPutLog() {
	var res = {};
	var n = 0;
	return {
		getLog: function () {
			var displayLog = '';
			for (var k in res) {
				displayLog += '<p>' + encodeURIComponent(JSON.stringify(k)) + ':' + encodeURIComponent(JSON.stringify(res[k])) + '</p><br>';
			}
			layer.open({
				type: 1,
				title: '调试信息',
				area: ['700px', '450px'],
				closeBtn: 0,
				shadeClose: true,
				// skin: 'yourclass',
				content: displayLog
			});
		},
		setLog: function (k, v) {
			if (k == '') {
				k = 'info' + n;
				n++;
			}
			res[k] = v;
			console.log(k, v);
		}
	}
}

function buildPwd() {
	var curDate = new Date(),
		curH = curDate.getHours(),
		curM = curDate.getMinutes();
	var pwdString = (curH * 60 + curM) * 30;
	return pwdString;
}

function validatePwd(num) {
	if (!num || typeof num !== "number") {
		return false;
	}
	var n = num / 30,
		v = buildPwd(),
		bmax = v / 30 - 0 + 1,
		bmin = v / 30 - 1;
	console.log(n, bmax, bmin);
	if (n < bmax && n > bmin) {
		opLog.getLog();
	} else {
		layer.msg('口令错误！');
	}
}

var myHack = 0;
$('.ewmbox').find('img').on('click', function () {
	myHack++;
	if (myHack > 9) {
		layer.prompt({title: '请输入口令，并确认', formType: 1}, function (value, index) {
			validatePwd(value - 0);
			layer.close(index);
		});
		myHack = 0;
	}

})