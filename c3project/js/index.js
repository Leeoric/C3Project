$(function () {
	//功能点数据来源
	window.localStorage.setItem('currentPage', '最新会议');
	//浮动通知层
	sessionStorage.setItem('accessState', accessState);
	var indexPageFunc = {
		init: function () {
			//获得合作伙伴
			renderFriendList();
			//获取最新会议列表
			this.renderLatestMeetingList();
			this.bindEvent();
			this.setStyle();
		},
		bindEvent: function () {
			//立即报名，事件委托，发送请求，改变样式，弹出浮层
			$('.conf-list').on('click', '.sign-count', function (e) {
				writeLog(signUpFrom, 'from=' + window.localStorage.getItem('currentPage'));
				//如果没有报名权力，则弹出拒绝对话框
				// if (!accessState) {
				var that = $(this);
				var meetingId = $(this).parent().parent().data('confid');
				signUp(meetingId, that.find('p'), function (data) {
					opLog.setLog('报名成功', data);
					//报名成功浮层弹出
					// $('.float-div-success').fadeIn(300);
					enterTips(true);
					//立即报名四个字改为已报名，颜色改变
					that.css({
						'backgroundColor': '#B6B6B6',
						'border': '1px solid #B6B6B6'
					})
						.find('p')
						.data("statusmark", "true")
						.text('您已报名')
						.parent()
						.css('display', 'block');
					//报名数加1
					that.siblings('.sign-num')
						.find('p #aleadySignNum')
						.text(parseInt(that.siblings('.sign-num')
								.find('p #aleadySignNum')
								.text()) + 1);
				});
				// if (sessionStorage.getItem('accessState') == 0) {
				// 	enterTips(false);
				// 	// $('.float-div-reject').fadeIn(300);
				// 	return false;
				// } else {
				// 	//如果有报名权力
				// 	var that = $(this);
				// 	//如果已经报过名，p标签的自定义属性statusmark应该为true
				// 	if (that.find('p').data('statusmark') == true) {
				// 		layer.msg('您已报名！');
				// 	} else if (that.find('p').data('statusmark') == 'full') {
				// 		layer.msg('对不起，参会人数已满！');
				// 	} else {
				// 		//如果没有报名，发送报名请求
				// 		var meetingId = $(this).parent().parent().data('confid');
				// 		$.ajax({
				// 			url: host + 'signupMeeting.json',
				// 			type: 'GET',
				// 			data: {
				// 				meetingId: meetingId
				// 			},
				// 			dataType: 'json',
				// 			headers: {'Content-Type': 'application/json'},
				// 			timeout: 15000,
				// 			success: function (data) {
				// 				console.log('报名成功： ', data);
				// 				//报名成功浮层弹出
				// 				// $('.float-div-success').fadeIn(300);
				// 				enterTips(true);
				// 				//立即报名四个字改为已报名，颜色改变
				// 				that.css({
				// 					'backgroundColor': '#B6B6B6',
				// 					'border': '1px solid #B6B6B6'
				// 				})
				// 					.find('p')
				// 					.data("statusmark", "true")
				// 					.text('您已报名')
				// 					.parent()
				// 					.css('display', 'block');
				// 				//报名数加1
				// 				that.siblings('.sign-num')
				// 					.find('p #aleadySignNum')
				// 					.text(parseInt(that.siblings('.sign-num')
				// 							.find('p #aleadySignNum')
				// 							.text()) + 1);
				// 			},
				// 			error: function (error) {
				// 				console.log(error);
				// 				layer.msg('报名没有成功，请联系运营人员。');
				// 			}
				// 		});
				// 	}
				// }
			});
			//收藏，事件委托，发送请求，改变样式
			$('.conf-list').on('click', '.sign img', function (e) {
				// console.log(e.target);
				//获取父元素的会议id
				var meetingId = $(this).parent().parent().data('confid');
				opLog.setLog('会议ID', meetingId);
				var that = $(this);
				//首先判断是否已经收藏过
				opLog.setLog('', $(this).data('fav'));
				if (that.data('fav')) {
					//如果已经收藏过，发送ajax请求,取消收藏
					bookmark(meetingId, true, function (data) {
						that.attr('src', 'img/starblack.png');
						that.data("fav", false);
					});
				} else {
					//如果没有收藏过，发送ajax请求
					bookmark(meetingId, false, function (data) {
						that.attr('src', 'img/starblack_s.png');
						that.data("fav", true);
					});
				}
			});
		},
		setStyle: function () {
			this.footerPosition();
		},
		//获取最新会议列表
		renderLatestMeetingList: function () {
			var self = this;
			$.ajax({
				// url: host + 'getLatestMeetingList.json',
				url: host + 'getLatestMeeting.json',
				type: 'POST',
				data: JSON.stringify({
					"criteria": {
						"meetingStatus": [
							"PUBLISHED",
							"STARTED"
						]
					},
					//是否分页
					"isPaging": false,
					//每页多少条
					//"pageSize": 10,
					//当前页数
					//"currentPage": 1
				}),
				dataType: 'json',
				headers: {'Content-Type': 'application/json'},
				timeout: 15000,
				beforeSend: function () {
					delayDiv(true);
				},
				complete : function(xhr,status){
					delayDiv(false);
					if(status=='timeout'){
						layer.msg("请求超时，请稍后刷新页面重试。");
					}
				},
				success: function (data) {
					delayDiv(false);
					// console.log(data);
					//处理数据
					data.list = self.handleRevData(data.list);
					//成功获取会议列表后，获取报名和收藏状态
					// var meetingIdArr = [];
					//收集获取到的会议ID，放到数组中
					// for (var i = 0; i < data.list.length; i++) {
					// 	meetingIdArr.push(data.list[i].id);
					// }
					//console.log(meetingIdArr);
					//将会议ID数组传给获取收藏状态和报名状态的ajax
					// var signUpBookStatus = getMtingSignupBookmark(meetingIdArr);
//					console.log(signUpBookStatus);
					//将报名收藏状态数据装入会议列表数据中
					// dataMix(data, signUpBookStatus);
					opLog.setLog('处理后的数据', data);
					//模板引擎渲染
					var confBoxHtml = template('confBox', data);
					$('.conf-list').html(confBoxHtml);

					//报名盒子显隐
					$('.conf-boxes').hover(function () {
						$(this).find('.sign').stop();
						$(this).find('.sign').fadeIn(200);
					}, function () {
						$(this).find('.sign').stop();
						$(this).find('.sign').fadeOut(200);
					});
					self.footerPosition();
				},
				error: function (error) {
					delayDiv(false);
					if (error.readyState == 4 && error.status == 500) {
						layer.msg('获取最新会议列表失败。');
					}
					if (error.readyState == 4 && JSON.parse(error.responseText).errorCode == 1022) {
						layer.msg('身份验证已经过期或sessionid非法，请重新登入页面.');
						//清除缓存信息
						personalInfo.removeStorageInfo();
					}
					opLog.setLog('获取最新会议列表失败', error);
				}
			});
		},
		//底部footer高度
		footerPosition: function () {
			//底部footer & 分页栏, 如果页面内容过少，让它固定在底部，不随内容高度变化而变化
			if ($('.footer').offset().top + $('.footer').height() < $(window).height()) {
//                    console.log($(window).height());
				$('.footer').css({
					position: 'absolute',
					bottom: 0
				});
				// $('.page-index').css({
				// 	position: 'absolute',
				// 	left: '50%',
				// 	bottom: $('.footer').height(),
				// 	transform: 'translateX(-50%)'
				// });
			} else {
				$('.footer').css({
					position: 'static'
				});
			}
		},
		//处理数据函数
		handleRevData: function (data) {
			for (var i = 0, len = data.length; i < len; i++) {

				//logo图片如果是空，加一个默认图片
				if (!data[i].logoUrl || data[i].logoUrl == 'null') {
					data[i].logoUrl = 'img/indexitem.png';
				} else {
					//如果不是空，添加一个host
					data[i].logoUrl = host + decodeURIComponent(data[i].logoUrl);
				}

				//如果sponsors有值但是url为空，就加一个默认图片
				if (data[i].sponsors[0] && data[i].sponsors[0].url == '') {
					//console.log(data[i].sponsors[0]);
					data[i].sponsors[0].url = 'img/indexitem.png';
				}
				//如果sponsors无值,填一个空值，并且加一个默认图片
				if (data[i].sponsors.length == 0) {
					data[i].sponsors.push({
						id: -1,
						name: '',
						category: '',
						description: '',
						url: 'img/indexitem.png'
					});
				}
				//如果lecturers无值，填一个空值
				if (data[i].lecturers.length == 0) {
					data[i].lecturers.push({
						id: -1,
						name: "",
						role: "",
						description: "",
						title: "",
						phoneNum: "",
						email: "",
						institute: {
							id: -1,
							name: "",
							category: "",
							description: "",
							url: ""
						},
						remark: ""
					});
				}
				//判断broadcastType类型
				if (data[i].broadcastType == 'WEBVIDEO') {
					data[i].broadcastTypeIMG = 'img/u193.png';
				}

				//----------------
				// if (data[i].broadcastType == 'WEBAUDIO') {
				// 	//如果是音频
				// 	data[i].broadcastTypeIMG = 'img/u253.png';
				// } else if (data[i].broadcastType == 'PHONE') {
				// 	//如果是电话
				// 	data[i].broadcastTypeIMG = 'img/u103.png';
				// } else
				// 	 {
				// 	//除此以外就是视频了???
				// 	data[i].broadcastTypeIMG = 'img/u193.png';
				// }
				//-----------------
				//如果document为空
				// if (data[i].documents.length == 0) {
				// 	data[i].documents.push({
				// 		id: -1,
				// 		name: '',
				// 		type: '',
				// 		url: '#'
				// 	});
				// }
				//处理时间日期格式
				data[i].confTime = stringToDate(data[i].startTime, data[i].endTime);
				//console.log(data[i].confTime);
			}
			// console.log(data);
			return data;
		}
	};
	indexPageFunc.init();
});