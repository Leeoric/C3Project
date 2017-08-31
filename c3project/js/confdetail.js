$(function () {
	//写入功能点，记录打开来源
	writeLog(confDetailFrom, 'from=' + sourcePage);
	//功能点数据
	window.localStorage.setItem('currentPage', '会议详情');

	var replyStatus = false,
		replyId = '',
		replyName = '',
		replyText = '';

	var meetingIDFromUrl = getQueryString(location.search, 'id');

	var confDetailPageFunc = {
		isPlay: true,
		//获取音频地址，以便“立即参会”时使用
		audioUrlTemp: '',
		//获得视频播放代码
		videoCode: '',
		//获取会议类型，以便“立即参会”使用
		meetingType: '',
		//获得会议状态，以便参会使用
		meetingStatus: '',
		//刷新评论定时器
		refrashTimer : null,
		//评论请求节流
		isCommentBack: false,
		init: function () {
			//获取合作伙伴
			renderFriendList();
			//刚进入页面后，评论数据渲染
			this.renderDialog();
			//判断会议类型，根据不同的会议类型渲染页面，第一次渲染页面后得到会议类型、状态、以及媒体相关代码
			this.renderConfDetail(meetingIDFromUrl);
			this.setStyle();
			this.bindEvent();
		},
		bindEvent: function () {
			var self = this;
			var hasClickSignup = 0,
				hasClickFavorite = 0;
			//浮动通知层
			//accessState为进入状态标记
			//如果进入状态为true，则弹出恭喜报名成功的浮层
			//如果进入状态为false，则弹出很遗憾的浮层
			// var accessState = session
			// Storage.getItem('accessState');
			//立即报名，事件委托，发送请求，改变样式，弹出浮层
			// $('.conf-header').on('click', '#signUp', function (e) {
			// 	e.preventDefault();
			// 	if (hasClickSignup == 0) {
			// 		hasClickSignup++;
			// 		var that = $(this);
			// 		var meetingId = meetingIDFromUrl;
			// 		signUp(meetingId, that, function (data) {
			// 			//报名成功浮层弹出
			// 			//$('#websoundJoinSuccess').fadeIn(300);
			// 			enterTips(true);
			// 			//立即报名四个字改为已报名，颜色改变
			// 			that.css({
			// 				'backgroundColor': '#B6B6B6',
			// 			}).data("statusmark", true)
			// 				.find('#signUpText')
			// 				.text('报名成功');
			// 			//报名数加1
			// 			that.find('.sign-up-num-already')
			// 				.text(parseInt(that.find('.sign-up-num-already')
			// 						.text()) + 1);
			// 			hasClickSignup = 0;
			// 			console.log('success,hasClickSignup:', hasClickSignup);
			// 		}, function () {
			// 			hasClickSignup = 0;
			// 			console.log('error,hasClickSignup:', hasClickSignup);
			// 		});
			// 	}
			// });

			$('.conf-header').on('click', '#signUp', function (e) {
				e.preventDefault();
				if (hasClickSignup == 0) {
					hasClickSignup++;
					var that = $(this);
					var beforeSendBG = that.css('backgroundColor');
					var meetingId = meetingIDFromUrl;
					signUp(meetingId, that, {
						beforeSend: function () {
							console.log('beforeSend');
							that.css({
								'backgroundColor': '#B6B6B6'
							}).prepend('<div class="loadcontainer-signup load3"><div class="loader"></div></div>');
						},
						complete: function () {
							console.log('complete');
							that.find('div').remove('.loadcontainer-signup');
							hasClickSignup = 0;
						},
						success: function () {
							//报名成功浮层弹出
							//$('#websoundJoinSuccess').fadeIn(300);
							enterTips(true);
							//立即报名四个字改为已报名，颜色改变
							that.css({
								'backgroundColor': '#B6B6B6',
							}).data("statusmark", true)
								.find('#signUpText')
								.text('报名成功');
							//报名数加1
							that.find('.sign-up-num-already')
								.text(parseInt(that.find('.sign-up-num-already')
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
					});
				}
			});
			//立即参会，电话会议无此按钮
			//只有会议开始时才会有这个按钮，获取到的必然是音频流，不是MP3或者wav
			//只有会议开始时才会有这个按钮，获取到的必然是视频直播代码，而不是回看代码
			$('.conf-header').on('click', '#startedMeeting', function (e) {
				e.preventDefault();
				if (self.meetingStatus != 'STARTED') {
					opLog.setLog('会议状态不为STARTED，return false.', self.meetingStatus);
					return false;
				}
				//如果没有报名权力，则弹出拒绝对话框
				if (sessionStorage.getItem('accessState') == 0) {
					// $('#floatDivReject').fadeIn(300);
					opLog.setLog('', 'sessionStorage.getItem(accessState) == 0,没有报名权限');
					enterTips(false);
					return false;
				}
				//如果有报名权力
				opLog.setLog('', '有报名权力');
				var that = $(this);
				var beforeSendBG = that.css('backgroundColor');
				that.css({
					'backgroundColor': '#B6B6B6'
				});
				//如果已经报过名，p标签的自定义属性statusmark应该为true
				if (that.data("statusmark") == true) {
					//直接参会,弹出音频框
					//写入功能点:立即参会功能点
					writeLog(joinMeetingFrom, 'from=' + sourcePage);
					opLog.setLog('', '已经报过名');
					if (self.meetingType == 'PHONE') {
						layer.alert('该会议为电话会议，请您拨打报名短信上的电话号码参会。', {
							title: '提示',
							icon: 1,
							btnAlign: 'c'
						});
						opLog.setLog('', '这是电话会议，弹窗结束');
					} else if (self.meetingType == 'WEBVIDEO') {
						//如果已经获得地址，才执行，防止重复获取地址
						if (!self.videoCode) {
							self.videoCode = self.getOwnerId(meetingIDFromUrl, self.meetingStatus);
							opLog.setLog('获取视频直播ownerid', self.videoCode);
							self.showVideo(self.videoCode, self.meetingStatus);
						} else {
							opLog.setLog('已经获得视频直播ownerid,禁止重复获取', self.videoCode);
						}
						// that.css({
						// 	'backgroundColor': beforeSendBG
						// });
					} else {
						//如果已经获得地址，才执行，防止重复获取地址
						if (!self.audioUrlTemp) {
							self.audioUrlTemp = self.getStreamingMediaUrl(getQueryString(location.search, 'id'));
							opLog.setLog('开始获取音频流...音频流地址为：', self.audioUrlTemp);
							if (self.audioUrlTemp) {
								self.player(self.audioUrlTemp);
							} else {
								layer.msg('未获取到有效音频流。');
							}
						} else {
							opLog.setLog('已经获得音频流地址，禁止重复获取, 地址为：', self.audioUrlTemp);
						}
						// that.css({
							// 'backgroundColor': beforeSendBG
						// });
					}
				} else {
					//如果没有报名，发送报名请求
					var meetingId = meetingIDFromUrl;
					opLog.setLog('', '没有报过名，即将报名...');
					// signUp(meetingId, that, function (data) {
					// 	//报名成功后参会
					// 	that.data("statusmark", true);
					// 	if (self.meetingType == 'PHONE') {
					// 		layer.alert('已将参会信息发至您的手机，请注意查收！', {
					// 			title: '提示',
					// 			icon: 1,
					// 			btnAlign: 'c'
					// 		});
					// 	} else if (self.meetingType == 'WEBVIDEO') {
					// 		//如果已经获得地址，才执行，防止重复获取地址
					// 		if (!self.videoCode) {
					// 			self.videoCode = self.getOwnerId(meetingIDFromUrl, self.meetingStatus);
					// 			opLog.setLog('获取视频直播ownerid：', self.videoCode);
					// 			self.showVideo(self.videoCode, self.meetingStatus);
					// 			//写入功能点:立即参会功能点
					// 			writeLog(audioBackView, 'from=' + window.localStorage.getItem('currentPage'));
					// 		} else {
					// 			opLog.setLog('已经获得视频直播ownerid,禁止重复获取：', self.videoCode);
					// 		}
					// 	} else {
					// 		//音频
					// 		//如果已经获得地址，才执行，防止重复获取地址
					// 		if (!self.audioUrlTemp) {
					// 			self.audioUrlTemp = self.getStreamingMediaUrl(meetingIDFromUrl);
					// 			opLog.setLog('开始获取音频流...音频流地址为：', self.audioUrlTemp);
					// 			if (self.audioUrlTemp) {
					// 				self.player(self.audioUrlTemp);
					// 			}
					// 			//写入功能点:立即参会功能点
					// 			writeLog(audioBackView, 'from=' + window.localStorage.getItem('currentPage'));
					// 		}
					// 	}
					// });
					signUp(meetingId, that, {
						beforeSend: function () {
							console.log('beforeSend');
							that.css({
								'backgroundColor': '#B6B6B6'
							}).prepend('<div class="loadcontainer-signup load3"><div class="loader"></div></div>');
						},
						complete: function () {
							console.log('complete');
							that.find('div').remove('.loadcontainer-signup');
							hasClickSignup = 0;
						},
						success: function () {
								//报名成功后参会
								that.data("statusmark", true);
								if (self.meetingType == 'PHONE') {
									layer.alert('已将参会信息发至您的手机，请注意查收！', {
										title: '提示',
										icon: 1,
										btnAlign: 'c'
									});
								} else if (self.meetingType == 'WEBVIDEO') {
									//如果已经获得地址，才执行，防止重复获取地址
									if (!self.videoCode) {
										self.videoCode = self.getOwnerId(meetingIDFromUrl, self.meetingStatus);
										opLog.setLog('获取视频直播ownerid：', self.videoCode);
										self.showVideo(self.videoCode, self.meetingStatus);
										//写入功能点:立即参会功能点
										writeLog(audioBackView, 'from=' + window.localStorage.getItem('currentPage'));
									} else {
										opLog.setLog('已经获得视频直播ownerid,禁止重复获取：', self.videoCode);
									}
								} else {
									//音频
									//如果已经获得地址，才执行，防止重复获取地址
									if (!self.audioUrlTemp) {
										self.audioUrlTemp = self.getStreamingMediaUrl(meetingIDFromUrl);
										opLog.setLog('开始获取音频流...音频流地址为：', self.audioUrlTemp);
										if (self.audioUrlTemp) {
											self.player(self.audioUrlTemp);
										}
										//写入功能点:立即参会功能点
										writeLog(audioBackView, 'from=' + window.localStorage.getItem('currentPage'));
									}
								}
						},
						error: function () {
							console.log('error');
							that.css({
								'backgroundColor': beforeSendBG
							}).find('div').remove('.loadcontainer-signup');
							hasClickSignup = 0;
							console.log('error,hasClickSignup:', hasClickSignup);
						}
					});

				}

			});
			//收藏，事件委托，发送请求，改变样式
			$('.conf-header').on('click', '#fav', function (e) {
				e.preventDefault();
				if (hasClickFavorite == 0) {
					hasClickFavorite++;
					//获取父元素的会议id
					var meetingId = meetingIDFromUrl;
					opLog.setLog('会议ID：', meetingId);
					var that = $(this);
					//首先判断是否已经收藏过
					opLog.setLog('', $(this).data('fav'));
					if (that.data('fav')) {
						//如果已经收藏过，发送ajax请求,取消收藏
						// bookmark(meetingId, true, function (data) {
						// 	that.css('backgroundColor', '#3f8de9')
						// 		.data("fav", false)
						// 		.text('收藏');
						// 	hasClickFavorite = 0;
						// }, function () {
						// 	hasClickFavorite = 0;
						// });
						bookmark(meetingId, true, {
							beforeSend: function () {
								that.css('backgroundColor', '#b6b6b6')
									.prepend('<div class="loadcontainer load3"><div class="loader"></div></div>');
							},
							complete: function () {
								// that.src = 'img/starblack.png';
								hasClickFavorite = 0;
							},
							success: function () {
								that.css('backgroundColor', '#3f8de9')
									.data("fav", false)
									.text('收藏');
								hasClickFavorite = 0;
							},
							error: function () {
								hasClickFavorite = 0;
								that.css('backgroundColor', '#3f8de9')
									.find('div')
									.remove('.loadcontainer');
							}
						});
					} else {
						//如果没有收藏过，发送ajax请求
						// bookmark(meetingId, false, function (data) {
						// 	that.css('backgroundColor', '#3f8de9')
						// 		.data("fav", true)
						// 		.text('取消收藏');
						// 	hasClickFavorite = 0;
						// }, function () {
						// 	hasClickFavorite = 0;
						// });
						bookmark(meetingId, false, {
							beforeSend: function () {
								that.css('backgroundColor', '#b6b6b6')
									.prepend('<div class="loadcontainer load3"><div class="loader"></div></div>');
							},
							complete: function () {
								// that.src = 'img/starblack.png';
								hasClickFavorite = 0;
							},
							success: function () {
								that.css('backgroundColor', '#3f8de9')
									.data("fav", true)
									.text('取消收藏');
								hasClickFavorite = 0;
							},
							error: function () {
								hasClickFavorite = 0;
								that.css('backgroundColor', '#3f8de9')
									.find('div')
									.remove('.loadcontainer');
							}
						});
					}
				}
			});
			//点击听录音,只有会议结束后才有这个按钮
			$('.conf-header').on('click', '#meetingSound', function (e) {
				e.preventDefault();
				opLog.setLog('', self.meetingStatus);
				if (self.isPlay) {
					if (self.meetingStatus == 'ENDED') {
						writeLog(audioBackView, 'from=' + window.localStorage.getItem('currentPage'));
						if ($(this).data('documentid') != 0) {
							var audioUrl = getDocuments($(this).data('documentid'), 'AUDIO');
							self.player(audioUrl);
						}
					}
					self.isPlay = false;
				}
			});
			//点击看速记
			$('.conf-header').on('click', '#record', function (e) {
				e.preventDefault();
				writeLog(audioBackView, 'from=' + window.localStorage.getItem('currentPage'));
				opLog.setLog('', $(this).data('documentid'));
				if ($(this).data('documentid') != 0) {
					var pdfUrl = getDocuments($(this).data('documentid'), 'SHORTHAND');
					opLog.setLog('', pdfUrl);
					if (pdfUrl) {
						window.open(host + pdfUrl, '会议速记');
					}
				}
			});
			//点击看视频
			$('.conf-header').on('click', '#meetingVideo', function (e) {
				e.preventDefault();
				opLog.setLog('', self.meetingStatus);
				if (self.meetingStatus == 'ENDED') {
					writeLog(videoBackView, 'from=' + window.localStorage.getItem('currentPage'));
					//和参会一样
					//如果已经获得地址，才执行，防止重复获取地址
					if (!self.videoCode) {
						self.videoCode = self.getOwnerId(meetingIDFromUrl, self.meetingStatus);
						opLog.setLog('获取视频直播ownerid：', self.videoCode);
						self.showVideo(self.videoCode, self.meetingStatus);
						//写入功能点:立即参会功能点
						writeLog(audioBackView, 'from=' + window.localStorage.getItem('currentPage'));
					} else {
						opLog.setLog('已经获得视频直播ownerid,禁止重复获取：', self.videoCode);
					}
				}
			});
			//点击下载附件
			$('#confDetailContent').on('click', '#confAttachment a', function (e) {
				var attachmentUrl = getDocuments($(this).data('documentid'), 'OTHER');
				if (attachmentUrl) {
					$(this).attr('href', host + attachmentUrl);
				} else {
					$(this).removeAttr('download');
				}
				//写入功能点:立即参会功能点
				writeLog(attachmentDownload, 'from=' + sourcePage);
			});
			//点击回复，回复评论
			$('.dialog-box').on('click', '.reply', function () {
				var reName = $(this).siblings('span[data-uid]').text();
				var reId = $(this).siblings('span[data-uid]').data('uid');
				replyStatus = true;
				replyId = reId;
				replyName = reName;
				replyText = '回复 ' + reName + '：';

				opLog.setLog('', replyStatus + replyId + replyName);
				$('#commentContent').focus().val(replyText);
				$('.push-msg').text('回复');
			});
			//如果文本域字数超过140，则提示错误
			$('#commentContent').on('keyup', function () {
				//如果处于回复状态
				if (replyStatus) {
					//如果删除了replyText的一部分，就视为发送
					if ($('#commentContent').val().indexOf(replyText) == -1) {
						//var textVal = $('#commentContent').val();
						replyStatus = false;
						$('.push-msg').text('发送');
					}
				}
				opLog.setLog('回复状态', replyStatus);
				var num = 140 - $('#commentContent').val().replace(replyText, '').length;
				if (num < 0) {
					$('.push-msg').attr('disabled', 'disabled').css({
						border: '1px solid #E4E4E4',
						backgroundColor: '#b5b2b3'
					});
					$('#fontNum').css('color', 'red');
					layer.msg('超出字数限制啦！');
				} else {
					$('.push-msg').removeAttr('disabled').css('backgroundColor', '#5470b5');
					$('#fontNum').css('color', '#000');
				}
				$('#fontNum').text(num);
			});
			//点击发送--发送评论
			$('#sendMsgBtn').on('click', function () {
				if (!replyStatus) {
					replyId = '';
				}
				opLog.setLog('replyId', replyId);
				self.sendMsg(replyId);

				$('#commentContent').val("");
				replyStatus = false;
				replyId = '';
				replyName = '';
				replyText = '';
				$('#fontNum').text(140 - $('#commentContent').val().replace(replyText, '').length);
			});
			//15s后自动刷新评论
			$('#refrashCommentBtn').on('click', function () {
				//console.log($(this).is(':checked'));
				clearInterval(self.refrashTimer);
				if ($(this).is(':checked')) {
					layer.msg('已开启自动刷新评论');
					self.refrashTimer = setInterval(function () {
						self.renderDialog();
						console.log('刷新一次评论');
					}, 15000);
				} else {
					console.log('取消刷新');
					layer.msg('评论刷新取消');
					clearInterval(self.refrashTimer);
				}
			});
			//分享按钮
			$('#shareBtn').on('click', function () {
					layer.open({
						type: 1,
						title: false,
						area: ['175px', '173px'], //宽高
						content: '<div class="qrcode-box"><div id="qrcode" class="qrcode"></div></div>',
						success: function(layero, index){
							// console.log(layero, index);
							self.makeQRCode();
						}
					});

			});
		},
		setStyle: function () {
			//PPT箭头
			$('.pdf-container').hover(function () {
				$('.previous-pdf').fadeIn(300);
				$('.next-pdf').fadeIn(300);
			}, function () {
				$('.previous-pdf').fadeOut(300);
				$('.next-pdf').fadeOut(300);
			});
		},
		//发送评论
		sendMsg: function (parentCommentId) {
			var self = this;
			var content = $('#commentContent').val().replace(replyText, '');
			if (!$.trim(content)) {
				layer.msg('评论内容为空，请输入评论内容。');
				return false;
			}
			var isAnony = $('#anony').is(':checked');
			var pId = parentCommentId || "";
			if ($('#commentContent').val() == '') {
				pId = '';
			}
			$.ajax({
				url: host + 'commentMeeting.json',
				type: 'POST',
				data: JSON.stringify({
						content: content,
						isAnonymous: isAnony,
						parentCommentId: pId,
						meeting: {id: meetingIDFromUrl}
					}
				),
				dataType: 'text',
				headers: {'Content-Type': 'application/json'},
				timeout: 15000,
				complete: function (xhr, status) {
					if (status == 'timeout') {
						layer.msg("评论请求超时。");
					}
				},
				success: function (data) {
					opLog.setLog('发送评论成功：', data);
					layer.msg("评论成功！");
					$('.push-msg').text('发送');
					self.renderDialog();
				},
				error: function (error) {
					opLog.setLog('发送评论失败：', error);
					layer.msg("评论发送失败。");
				}

			});
		},
		//评论数据渲染
		renderDialog: function () {
			var self = this;
			$.ajax({
				url: host + 'getMeetingCommentsDetail.json',
				type: 'POST',
				data: JSON.stringify({
					criteria: {meetingId: meetingIDFromUrl},
					isPaging: false
				}),
				dataType: 'json',
				headers: {'Content-Type': 'application/json'},
				timeout: 15000,
				complete: function (xhr, status) {
					self.isCommentBack = true;
					if (status == 'timeout') {
						layer.msg("评论数据请求超时。");
					}
				},
				success: function (data) {
					opLog.setLog('评论数据请求完成：', data);
					self.isCommentBack = true;
					//处理数据
					data = data.list;
					var handleDialogData = self.handlerDialogListData(data);
					//模板渲染
					var dialog = template('dialog', handleDialogData);
					$('#dialogBox').html(dialog);
					//最新互动数目
					$('#commentNum').text(handleDialogData.list.length);
				},
				error: function (error) {
					self.isCommentBack = true;
					opLog.setLog('评论数据请求错误，错误码：', error);
				}
			});
		},
		//拿到会议id后，ajax渲染页面
		renderConfDetail: function (meetingid) {
			var self = this;
			$.ajax({
				// url: host + 'getMeetingInfo.json',
				url: host + 'getMeetingDetail.json',
				type: 'GET',
				data: {
					"meetingId": meetingid
				},
				//改成同步以便获取数据
				async: false,
				dataType: 'json',
				beforeSend: function () {
					delayDiv(true);
				},
				timeout: 15000,
				complete: function (xhr, status) {
					delayDiv(false);
					if (status == 'timeout') {
						layer.msg("会议详情内容获取超时。");
					}
				},
				success: function (data) {
					//设置标题栏
					document.title = data.title;
					//写入功能点，记录会议类型
					if (data.meetingStatus == 'PUBLISHED' || data.meetingStatus == 'STARTED') {
						var commandMeetingType = '最新会议';
					} else if (data.meetingStatus == 'ENDED') {
						var commandMeetingType = '历史会议';
					} else {
						var commandMeetingType = '类型未知';
					}
					writeLog(meetingType, 'type=' + commandMeetingType);
					//获取会议类型
					self.meetingType = data.broadcastType;
					//处理数据
					var handledData = self.handlerRevData(data);
					// documentsHandle(handledData.list);
					// self.audioUrlTemp = data.documents.url.audioUrl;
					// self.videoCode = data.documents.url.videoUrl;
					//将会议ID数组传给获取收藏状态和报名状态的ajax
					// var signUpBookStatus = getMtingSignupBookmark(meetingid);
					//将报名收藏状态数据装入会议列表数据中
					// dataMix(handledData, signUpBookStatus);
					opLog.setLog('根据会议id请求数据，请求成功，处理后的数据：', handledData);
					//变更会议状态
					self.meetingStatus = handledData.list[0].meetingStatus;
					opLog.setLog('会议状态：', self.meetingStatus);
					//模板引擎渲染
					var confHeaderHtml = template('confHeader', handledData);
					$('.conf-header').html(confHeaderHtml);
					var confDetail = template('confDetail', handledData);
					$('#confDetailContent').html(confDetail);

					//PPT的展示
					//PDF.js在IE9+中表现不好，暂时未解决兼容问题，因此在IE11及以下全部显示下载PPT的方式
					if (data.pptId != 0 && !isIEX(11)) {
						self.showPdf(host + getDocuments(data.pptId, 'PPT'), 'the-canvas');
					} else if (data.pptId != 0 && isIEX(11)) {
						$('#confDetailContent .conf-view').css('border', 'none').html('<div class="conf-content-detail">' +
							'<div class="conf-intro">' +
							'<h3>会议展示文稿</h3>' +
							'<p><a href="' + host + getDocuments(data.pptId, 'PPT') + '">下载会议介绍PPT</a></p>' +
							'</div>' +
							'</div>');
					}
					delayDiv(false);
				},
				error: function (error) {
					delayDiv(false);
					opLog.setLog('根据会议id请求数据，请求错误，错误码：', error);
					if (error.readyState == 4 && JSON.parse(error.responseText).errorCode == 1022) {
						layer.msg('身份验证过期，请尝试刷新页面.');
						//清除缓存信息
						personalInfo.removeStorageInfo();
					}
				}
			});
		},
		//获取音频直播流
		getStreamingMediaUrl: function (meetingId) {
			var mediaUrl = '';
			$.ajax({
				url: host + 'getMeetingBroadcastUrl.json',
				type: 'GET',
				data: {
					"meetingId": meetingId
				},
				async: false,
				dataType: 'text',
				beforeSend: function () {
					opLog.setLog('', '正在获取直播流...');
				},
				timeout: 15000,
				complete: function (xhr, status) {
					if (status == 'timeout') {
						layer.msg("请求超时。");
					}
				},
				success: function (data) {
					opLog.setLog('音频直播流获取成功： ', data);
					mediaUrl = decodeURIComponent(data);
				},
				error: function (error) {
					opLog.setLog('获取音频直播流失败： ', error);
				}
			});
			return mediaUrl;
		},
		//处理页面数据,与其他页面不同，不可通用
		handlerRevData: function (data) {
			//如果sponsors有值但是url为空
			// if (data.sponsors[0] && data.sponsors[0].url == '') {
			// data.sponsors[0].url = 'img/indexitem.png';
			// }

			$.each(data.attachments, function (i, v) {
				v.documentName = decodeURIComponent(v.documentName);
			});

			//如果sponsors无值
			if (data.sponsors.length == 0) {
				data.sponsors.push({
					id: -1,
					name: '',
					category: '',
					description: '',
					url: 'img/indexitem.png'
				});
			}
			//如果lecturers无值
			if (data.lecturers.length == 0) {
				data.lecturers.push({
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
			if (data.broadcastType == 'WEBVIDEO') {
				data.broadcastTypeIMG = 'img/u193.png';
			}

			//处理时间日期格式
			data.confTime = stringToDate(data.startTime, data.endTime);

			//判断是否显示主讲人描述
			if (data.lecturers) {
				$.each(data.lecturers, function (i, v) {
					if (v.description) {
						data.isDisplayLecturersDescription = true;
					}
				})
			}

			var handledData = {
				list: [data]
			};




			return handledData;
		},
		//处理评论列表数据
		handlerDialogListData: function (data) {
			for (var i = 0; i < data.length; i++) {
				var nowTime = new Date().getTime();
				var t = nowTime - new Date(data[i].commentTime).getTime();
				//当前时间-评论时间<1分钟，显示时间：“刚刚”
				if (t < 60000) {
					data[i].timeMark = '刚刚';
				} else if (t > 60000 && t < 3600000) {
					//1分钟<当前时间-评论时间<60分钟，显示时间“X分钟前”
					data[i].timeMark = Math.ceil(t / 60000) + '分钟前';
				} else if (t >= 3600000 && t < 86400000) {
					//（当前时间-评论时间>=60分钟）&&（当前时间-评论时间<24*60分钟），显示时间“X小时前”
					data[i].timeMark = Math.ceil(t / 3600000) + '小时前';
				} else {
					//当前时间-评论时间>=24*60分钟，即评论时间超过24小时，则显示“X天前”，
					data[i].timeMark = Math.ceil(t / 86400000) + '天前';
				}
			}
			var hdata = {
				list: data
			};
			return hdata;
		},
		//音频播放器
		player: function (url) {
			var self = this;
			if (self.meetingStatus == 'STARTED') {
				//如果会议状态是已经开始的状态，就用直播流地址，否则获取录音文件
				var realUrl = url;
			} else if (self.meetingStatus == 'ENDED') {
				//会议已经结束，获取录音文件，格式为MP3或者wav
				//从PHP页面中解析出资源地址
				var realUrl = getRealDocUrl(url);
			} else {
				opLog.setLog('', '会议状态不是STARTED或ENDED，return false');
				return false;
			}
			opLog.setLog('播放地址为', realUrl);
			//音频直播，打开播放器
			if (this.isPlay) {
				if (isIEX()) {
					var audioType = getQueryString(url, 'videoExten');
					//如果是IE9-的浏览器，使用audio标签播放，不使用百度播放器
					if (audioType == '.wav') {
						$('#playercontainer').html('<iframe width="770" height="80" frameborder=0 marginheight=0 marginwidth=0 scrolling=no src=' + url + '></iframe>');
						$('#playercontainer').css({
							'width': '770px',
							'height': '80px'
						});
						$('.player-container').css({
							'width': '770px',
							'height': '80px'
						});
					} else {
						$('#playercontainer').html('<iframe width="770" height="530" frameborder=0 marginheight=0 marginwidth=0 scrolling=no src=' + url + '></iframe>');
						$('#playercontainer').css({
							'width': '770px',
							'height': '530px'
						});
						$('.player-container').css({
							'width': '770px',
							'height': '530px'
						});
					}

					$('.player-container').slideDown(300);
				} else {
					//用资源地址播放
					if (realUrl.substr(-3, 4) == 'wav') {
						//如果是wav，用浏览器自带播放器播放
						$('#audioPlayer').attr('src', realUrl);
						$('#audioPlayer').attr('autoplay', 'autoplay');
						$('#audioPlayer').attr('controls', 'controls');
						$('#audioPlayer').css({
							'width': '737px',
							'height': '33px',
							'background': '#000'
						});
						$('#audioPlayer')[0].volume = .5;
						//移除百度播放器节点
						$('#playercontainer').remove();

						$('.player-container').slideDown(300);
					} else {
						var myPlayer = cyberplayer("playercontainer").setup({
							width: 737,
							height: 33,
							backcolor: "#000",
							stretching: "uniform",
							file: realUrl,
							ak: "66e6eed2c8e34dcc8df5617eccd5a56f",
							autoStart: false,
							repeat: false,
							volume: 100,
							controls: "over",
							rightclick: [ // 右键配置
								{
									title: "Wind资讯3C中国财经会议", // 标题1
									link: "javascript:void(0)" // 跳转链接
								}
							],
						});
						$('.player-container').slideDown(300);
						myPlayer.play();
					}
				}
				//重新载入音频播放器
				$('#refreshMedia').on('click', function () {
					self.isPlay = true;
					self.player(url);
				});
			}
			self.isPlay = false;
		},
		//PPT的PDF展示
		showPdf: function (url, canvasId) {
			opLog.setLog('', url);
			// If absolute URL from the remote server is provided, configure the CORS
			// header on that server.
			// var url = '111.pdf';
			// var url = 'compressed.tracemonkey-pldi-09.pdf';
			// The workerSrc property shall be specified.
			PDFJS.workerSrc = 'lib/pdf/pdf.worker.js';

			var pdfDoc = null,
				pageNum = 1,
				pageRendering = false,
				pageNumPending = null,
				//scale = 0.5,
				//        scale = 0.5,
				canvas = document.getElementById(canvasId),
				ctx = canvas.getContext('2d');

			var pdfContainer = document.getElementById('pdfContainer');

			/**
			 * Get page info from document, resize canvas accordingly, and render page.
			 * @param num Page number.
			 */
			function renderPage(num) {
				pageRendering = true;
				// Using promise to fetch the page
				pdfDoc.getPage(num).then(function (page) {

					//scale 等于PDF容器的宽度除以pdf的宽度
					scale = pdfContainer.offsetWidth / page.getViewport().viewBox[2];

					var viewport = page.getViewport(scale);

					canvas.height = viewport.height;
					canvas.width = viewport.width;

					// Render PDF page into canvas context
					var renderContext = {
						canvasContext: ctx,
						viewport: viewport
					};
					var renderTask = page.render(renderContext);

					// Wait for rendering to finish
					renderTask.promise.then(function () {
						pageRendering = false;
						if (pageNumPending !== null) {
							// New page rendering is pending
							renderPage(pageNumPending);
							pageNumPending = null;
						}
					});
				});

				// Update page counters
				document.getElementById('page_num').textContent = pageNum;
			}

			/**
			 * If another page rendering in progress, waits until the rendering is
			 * finised. Otherwise, executes rendering immediately.
			 */
			function queueRenderPage(num) {
				if (pageRendering) {
					pageNumPending = num;
				} else {
					renderPage(num);
				}
			}

			/**
			 * Displays previous page.
			 */
			function onPrevPage() {
				if (pageNum <= 1) {
					return;
				}
				pageNum--;
				queueRenderPage(pageNum);
			}

			document.getElementById('prev').addEventListener('click', onPrevPage);

			/**
			 * Displays next page.
			 */
			function onNextPage() {
				if (pageNum >= pdfDoc.numPages) {
					return;
				}
				pageNum++;
				queueRenderPage(pageNum);
			}

			document.getElementById('next').addEventListener('click', onNextPage);

			/**
			 * Asynchronously downloads PDF.
			 */
			PDFJS.getDocument(url).then(function (pdfDoc_) {
				pdfDoc = pdfDoc_;
				document.getElementById('page_count').textContent = pdfDoc.numPages;

				// Initial/first page rendering
				renderPage(pageNum);
			});
		},
		//获取gensee的ownerid
		getOwnerId: function (meetingId, meetingStatus) {
			var ownerId = '';
			var dist = '';
			if (!meetingId || !meetingStatus) {
				opLog.setLog('', '没有传入meetingID或broadcastType！return！');
				return false;
			}
			if (meetingStatus == 'STARTED') {
				dist = 'getMeetingBroadcastUrl.json';
			} else if (meetingStatus == 'ENDED') {
				dist = 'getMeetingPlaybackUrl.json';
			} else {
				opLog.setLog('', '会议状态不是已开始或已结束，return false!');
			}

			if (debug) {
				return '928236f800a4445d900889b68bd4027b';
			}

			$.ajax({
				url: host + dist,
				type: 'GET',
				data: {
					meetingId: meetingId
				},
				async: false,
				dataType: 'text',
				headers: {'Content-Type': 'application/json'},
				timeout: 15000,
				complete: function (xhr, status) {
					if (status == 'timeout') {
						layer.msg("视频播放码请求超时。");
					}
				},
				success: function (data) {
					opLog.setLog('ownerId获取成功：', data);
					ownerId = data;
					if (!data) {
						layer.msg('视频播放id错误，请联系运营人员。');
					}
				},
				error: function (error) {
					opLog.setLog('ownerId获取失败： ', error);
					layer.msg('视频播放id获取失败，请联系运营人员。');
				}
			});
			return ownerId;
		},
		//播放视频
		showVideo: function (videoCode, meetingStatus) {
			if (!videoCode || !meetingStatus) {
				opLog.setLog('', 'showVideo函数中没有传入videoCode或者meetingStatus，return');
				return false;
			}
			opLog.setLog('', '获得视频直播ownerid： ' + videoCode, '正在创建播放器。。。');
			var genseeDocBox = '<div class="doc-widget">' +
				'<gs:doc id="genseeDocComponent" site="wind.gensee.com" ownerid="' + videoCode + '" fullscreen="true" bgcolor="#000000" />' +
				'</div>';
			$('#genseeDocBox').html(genseeDocBox).slideDown(300);
			if (meetingStatus == 'STARTED') {
				var genseeVideoBox = '<div class="gensee-player">' +
					'<gs:video-live site="wind.gensee.com" ownerid="' + videoCode + '" id="genseePlayer"/>' +
					'</div>';
			} else {
				var genseeVideoBox = '<div class="gensee-player">' +
					'<gs:video-vod site="wind.gensee.com" ownerid="' + videoCode + '" id="genseePlayer"/>' +
					'</div>';
			}
			$('#genseeVideoBox').html(genseeVideoBox).slideDown(300);
			opLog.setLog('', 'load播放器tag...');
			if (document.getElementsByTagName("gs:video-vod").length != 0) {
				opLog.setLog('', '读取vod标签');
				GS.loadTag('video-vod', document.getElementsByTagName("gs:video-vod")[0]);
			}
			if (document.getElementsByTagName("gs:video-live").length != 0) {
				opLog.setLog('', '读取live标签');
				GS.loadTag('video-live', document.getElementsByTagName("gs:video-live")[0]);
			}
			if (document.getElementsByTagName("gs:doc").length != 0) {
				opLog.setLog('', '读取doc标签');
				GS.loadTag('doc', document.getElementsByTagName("gs:doc")[0]);
			}

		},
		//生成二维码
		makeQRCode: function () {
			//1.拼接url
			var h5url = window.location.origin + '/3CMobile/html/sharedMeeting.html?meetingId=' + meetingIDFromUrl;
			//2.生成二维码
			//容错级别，可设置为：
			//QRCode.CorrectLevel.L
			//QRCode.CorrectLevel.M
			//QRCode.CorrectLevel.Q
			//QRCode.CorrectLevel.H
			var qrcode = new QRCode('qrcode', {
				text: '分享至朋友圈',
				width: 150,
				height: 150,
				colorDark : '#000000',
				colorLight : '#ffffff',
				correctLevel : QRCode.CorrectLevel.H
			});
			qrcode.makeCode(h5url);
			// qrcode.makeCode('http://www.baidu.com');
		}
	};
	confDetailPageFunc.init();
});