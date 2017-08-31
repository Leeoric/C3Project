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
			var hasClickSignup = 0,
				hasClickFavorite = 0;
			//立即报名，事件委托，发送请求，改变样式，弹出浮层
			$('.conf-list').on('click', '.sign-count', function (e) {
				if (hasClickSignup == 0) {
					hasClickSignup++;
					console.log('hasClickSignup:', hasClickSignup);
					writeLog(signUpFrom, 'from=' + window.localStorage.getItem('currentPage'));
					//如果没有报名权力，则弹出拒绝对话框
					// if (!accessState) {
					var that = $(this);
					var meetingId = $(this).parent().parent().data('confid');
					// signUp(meetingId, that.find('p'), function (data) {
					// 	opLog.setLog('报名成功', data);
					// 	//报名成功浮层弹出
					// 	enterTips(true);
					// 	//立即报名四个字改为已报名，颜色改变
					// 	that.css({
					// 		'backgroundColor': '#B6B6B6',
					// 		'border': '1px solid #B6B6B6'
					// 	})
					// 		.find('p')
					// 		.data("statusmark", "true")
					// 		.text('您已报名')
					// 		.parent()
					// 		.css('display', 'block');
					// 	//报名数加1
					// 	that.siblings('.sign-num')
					// 		.find('p #aleadySignNum')
					// 		.text(parseInt(that.siblings('.sign-num')
					// 				.find('p #aleadySignNum')
					// 				.text()) + 1);
					// 	hasClickSignup = 0;
					// 	console.log('success,hasClickSignup:', hasClickSignup);
					// }, function () {
					// 	hasClickSignup = 0;
					// 	console.log('error,hasClickSignup:', hasClickSignup);
					// });
					var beforeSendBG = that.css('backgroundColor');
					signUp(meetingId, that.find('span'), {
							beforeSend: function () {
								console.log('beforeSend');
								that.css({
									'backgroundColor': '#B6B6B6'
								}).prepend('<div class="loadcontainer-signup load3"><div class="loader"></div></div>');
							},
							complete: function () {
								// that.src = 'img/starblack.png';
								console.log('complete');
								that.find('div').remove('.loadcontainer-signup');
								hasClickSignup = 0;
							},
							success: function (data) {
								console.log('success');
								opLog.setLog('报名成功', data);
								//报名成功浮层弹出
								enterTips(true);
								//立即报名四个字改为已报名，颜色改变
								that.css({
									'backgroundColor': '#B6B6B6'
								})
									.find('span')
									.data("statusmark", "true")
									.text('您已报名')
									.parent()
									.find('div')
									.remove('.loadcontainer-signup')
									.css('display', 'block');
								//报名数加1
								that.siblings('.sign-num')
									.find('p #aleadySignNum')
									.text(parseInt(that.siblings('.sign-num')
											.find('p #aleadySignNum')
											.text()) + 1);
								hasClickSignup = 0;
								console.log('success,hasClickSignup:', hasClickSignup);
							},
							error: function () {
								console.log('error');
								that.css({
									'backgroundColor': beforeSendBG
								}).find('div').remove('.loadcontainer-signup');
								hasClickSignup = 0;
								console.log('error,hasClickSignup:', hasClickSignup);
							}
						}
					);
				}

			});
			//收藏，事件委托，发送请求，改变样式
			$('.conf-list').on('click', '.sign img', function (e) {
				if (hasClickFavorite == 0) {
					hasClickFavorite++;
					//获取父元素的会议id
					var meetingId = $(this).parent().parent().data('confid');
					opLog.setLog('会议ID', meetingId);
					var that = $(this);
					//首先判断是否已经收藏过
					opLog.setLog('', $(this).data('fav'));
					if (that.data('fav')) {
						//如果已经收藏过，发送ajax请求,取消收藏
						// bookmark(meetingId, true, function (data) {
						// 	that.attr('src', 'img/starblack.png');
						// 	that.data("fav", false);
						// 	hasClickFavorite = 0;
						// }, function () {
						// 	hasClickFavorite = 0;
						// });
						bookmark(meetingId, true, {
							beforeSend: function () {
								// that.attr('src', 'img/down.gif');
								that.addClass('scale-animate');
							},
							complete: function () {
								// that.src = 'img/starblack.png';
								that.removeClass('scale-animate');
								hasClickFavorite = 0;
							},
							success: function () {
								that.attr('src', 'img/starblack.png');
								that.data("fav", false);
								hasClickFavorite = 0;
								that.removeClass('scale-animate');
							},
							error: function () {
								hasClickFavorite = 0;
								that.removeClass('scale-animate');
							}
						});
					} else {
						//如果没有收藏过，发送ajax请求
						// bookmark(meetingId, false, function (data) {
						// 	that.attr('src', 'img/starblack_s.png');
						// 	that.data("fav", true);
						// 	hasClickFavorite = 0;
						// }, function () {
						// 	hasClickFavorite = 0;
						// });
						bookmark(meetingId, false, {
							beforeSend: function () {
								// that.attr('src', 'img/down.gif');
								that.addClass('scale-animate');
							},
							complete: function () {
								// that.src = 'img/starblack.png';
								hasClickFavorite = 0;
								that.removeClass('scale-animate');
							},
							success: function () {
								that.attr('src', 'img/starblack_s.png');
								that.data("fav", true);
								hasClickFavorite = 0;
								that.removeClass('scale-animate');
							},
							error: function () {
								hasClickFavorite = 0;
								that.removeClass('scale-animate');
							}
						});
					}
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
					// "pageSize": 10,
					//当前页数
					// "currentPage": 1
				}),
				dataType: 'json',
				headers: {'Content-Type': 'application/json'},
				timeout: 15000,
				beforeSend: function () {
					delayDiv(true);
				},
				complete: function (xhr, status) {
					delayDiv(false);
					if (status == 'timeout') {
						layer.msg("请求超时，请稍后刷新页面重试。");
					}
				},
				success: function (data) {
					// console.log(data);
					//处理数据
					data.list = self.handleRevData(data.list);
					opLog.setLog('处理后的数据', data);
					//模板引擎渲染
					var confBoxHtml = template('confBox', data);
					$('.conf-list').html(confBoxHtml);
					delayDiv(false);
					self.footerPosition();
				},
				error: function (error) {
					delayDiv(false);
					if (error.readyState == 4 && error.status == 500) {
						layer.msg('获取最新会议列表失败。');
					}
					if (error.readyState == 4 && JSON.parse(error.responseText).errorCode == 1022) {
						layer.msg('身份验证过期，请尝试刷新页面.');
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
					data[i].logoUrl = 'img/placeholderimg.png';
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