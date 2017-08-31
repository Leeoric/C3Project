$(function () {
	//功能点数据来源
	window.localStorage.setItem('currentPage', '搜索');
	var searchVal = sessionStorage.getItem('searchInput');
	var searchPageFunc = {
		canSearch: true,
		init: function () {
			//获取合作伙伴
			renderFriendList();
			this.bindEvent();
			$('#searchInput').val(searchVal);
			this.searchMeeting(searchVal);
		},
		bindEvent: function () {
			var self = this;
			var hasClickSignup = 0;
			var lastSearch = sessionStorage.getItem('searchInput');
			$('#searchBtn').on('click', function () {
				if (self.canSearch) {
					var latestSearch = $('#searchInput').val();
					if (lastSearch == latestSearch) {
						layer.msg('您输入的搜索内容与上一次搜索内容相同');
						return false;
					}
					sessionStorage.setItem('searchInput', latestSearch);
					var searchVal = sessionStorage.getItem('searchInput');
					if (searchVal) {
						self.searchMeeting(searchVal);
					} else {
						layer.msg('请输入要搜索的内容.');
					}
				} else {
					layer.msg('搜索内容请不要超过38个字符');
				}

			});
			//回车键搜索
			$('#searchInput').on('keydown', function (e) {
				if (e.keyCode == 13) {
					if (self.canSearch) {
						var lastSearch = sessionStorage.getItem('searchInput');
						var latestSearch = $('#searchInput').val();
						if (lastSearch == latestSearch) {
							layer.msg('您输入的搜索内容与上一次搜索内容相同');
							return false;
						}
						sessionStorage.setItem('searchInput', $('#searchInput').val());
						var searchVal = sessionStorage.getItem('searchInput');
						if (searchVal) {
							self.searchMeeting(searchVal);
						} else {
							layer.msg('请输入要搜索的内容.');
						}
					} else {
						layer.msg('搜索内容请不要超过38个字符');
					}
				}
			});
			//如果搜索框字数超过38，则提示错误
			$('#searchInput').on('keyup', function (e) {
				e.stopPropagation();
				var num = 38 - $(this).val().length;
				if (num < 0) {
					self.canSearch = false;
					layer.msg('搜索内容请不要超过38个字符');
				} else {
					self.canSearch = true;
				}
			});
			//立即报名
			$('#hisConfBox').on('click', '.just-sign-up', function () {
				var that = $(this);
				if (hasClickSignup == 0) {
					hasClickSignup++;
					// signUp($(this).data('meetingid'), $(this), function (data) {
					// 	enterTips(true);
					// 	//立即报名四个字改为已报名，颜色改变
					// 	that.data("statusmark", true)
					// 		.text('您已报名');
					// 	hasClickSignup = 0;
					// 	console.log('success,hasClickSignup:', hasClickSignup);
					// }, function () {
					// 	hasClickSignup = 0;
					// 	console.log('error,hasClickSignup:', hasClickSignup);
					// });
					var beforeSendFontColor = that.css('color');
					signUp($(this).data('meetingid'), $(this), {
						beforeSend: function () {
							console.log('beforeSend');
							that.css({
								'color': '#B6B6B6'
							});
						},
						complete: function () {
							// that.src = 'img/starblack.png';
							console.log('complete');
							hasClickSignup = 0;
						},
						success: function (data) {
							console.log('success');
							enterTips(true);
							//立即报名四个字改为已报名，颜色改变
							that.data("statusmark", true)
								.text('您已报名');
							that.css('color', '#B6B6B6');
							hasClickSignup = 0;
							console.log('success,hasClickSignup:', hasClickSignup);
						},
						error: function () {
							hasClickSignup = 0;
							that.css('color', beforeSendFontColor);
							console.log('error,hasClickSignup:', hasClickSignup);
						}
					});

				}
			});
			//立即参会--跳转详情页
			$('#hisConfBox').on('click', '.just-join-it', function () {
				var that = $(this);
				window.open('confdetail.html?id=' + that.data('meetingid'));
			});
			//看速记点击
			$('#hisConfBox').on('click', '.read-doc-for-pdf', function (e) {
				e.preventDefault();
				//写功能点
				writeLog(shortHandBackView, 'from=' + window.localStorage.getItem('currentPage'));
				//弹出PDF阅读页
				var openUrl = getDocuments($(this).data('documentid'), 'SHORTHAND');
				if (openUrl) {
					opLog.setLog('', openUrl);
					window.open(host + openUrl);
				}
			});
			//听录音点击
			$('#hisConfBox').on('click', '.read-doc-for-audio', function (e) {
				e.preventDefault();
				//写功能点
				writeLog(audioBackView, 'from=' + window.localStorage.getItem('currentPage'));
				//弹出音频页
				var docId = $(this).data('documentid');
				var meetingtitle = encodeURIComponent($(this).attr('title'));

				var meetinglecturers = $(this).data('lecturers');
				//弹出音频页
				openAudioWindow($(this));
				// window.open('./audioplayer.html?documentid=' + docId + '&meetingtitle=' + meetingtitle + '&meetinglecturers=' + meetinglecturers, '3C中国财经会议', 'width=500, height=140, top=500, left=500');
			});
			//看视频点击
			// $('#hisConfBox').on('click', '.read-doc-for-video', function (e) {
			// 	e.preventDefault();
			// 	//写功能点
			// 	writeLog(videoBackView, 'from=' + window.localStorage.getItem('currentPage'));
			// 	//弹出视频页
			// 	window.open('//用id去请求页面地址');
			// });
		},
		searchMeeting: function (searchVal, currentPage) {
			var self = this;
			//写入功能点，搜索词
			writeLog(searchWord, 'searchWord=' + searchVal);
			//写入功能点，搜索打开来源
			writeLog(searchFrom, 'from=' + sourcePage);
			var sendData = {
				criteria: {
					name: searchVal,
					lecturer: searchVal,
					sponsor: searchVal
				},
				currentPage: currentPage || 1,
				isPaging: true,
				pageSize: 12
			};
			$.ajax({
				url: host + 'searchMeeting.json',
				type: 'POST',
				data: JSON.stringify(sendData),
				dataType: 'json',
				headers: {'Content-Type': 'application/json'},
				timeout: 15000,
				beforeSend: function () {
					delayDiv(true);
				},
				complete: function (xhr, status) {
					delayDiv(false);
					if (status == 'timeout') {
						layer.msg("列表请求超时。请稍后尝试重新刷新页面。");
					}
				},
				success: function (data) {
					opLog.setLog('', data);
					//处理数据
					// documentsHandle(data.list);
					var handledData = self.handleRevData(data.list);
					var meetingIdArr = [];
					$.each(handledData.list, function () {
						if (this.meetingStatus != 'ENDED') {
							meetingIdArr.push(this.id);
						}
					})
					//将会议ID数组传给获取收藏状态和报名状态的ajax
					var signUpBookStatus = getMtingSignupBookmark(meetingIdArr);
					//将报名收藏状态数据装入会议列表数据中
					dataMix(handledData, signUpBookStatus);
					opLog.setLog('', handledData);
					//模板引擎渲染
					var searchConfHtml = template('searchConf', handledData);
					$('#hisConfBox').html(searchConfHtml);
					//搜索提示
					$('#searchCount').text(data.count);
					$('#searchTipText').text(searchVal);
					delayDiv(false);
					//分页
					laypage({
						//容器。值支持id名、原生dom对象，jquery对象
						cont: $('#pageIndex'),
						//总页数
						pages: Math.ceil(data.count / sendData.pageSize),
						//是否开启跳页
						skip: true,
						//样式
						skin: '#AF0000',
						//当前页
						curr: currentPage || 1,
						//连续显示分页数
						groups: 5,
						//触发分页后的回调
						jump: function (obj, first) {
							//一定要加此判断，否则初始时会无限刷新
							if (!first) {
								//点击跳页触发函数自身，并传递当前页：obj.curr
								self.searchMeeting(searchVal, obj.curr);
							}
						}
					});
					//表格奇偶行变色
					$('#hisConfBox').find('tr:odd').css('backgroundColor', '#f8f8f8');

				},
				error: function (error) {
					delayDiv(false);
					if (error.readyState == 4 && error.status == 500) {
						layer.msg('获取列表失败。');
					}
					opLog.setLog('', error);
				}
			});
		},
		//处理数据函数
		handleRevData: function (data) {
			for (var i = 0, len = data.length; i < len; i++) {
				//如果sponsors有值但是url为空
				if (data[i].sponsors[0] && data[i].sponsors[0].url == '') {
					//console.log(data[i].sponsors[0]);
					data[i].sponsors[0].url = 'img/indexitem.png';
				}
				//如果sponsors无值
				if (data[i].sponsors.length == 0) {
					data[i].sponsors.push({
						id: -1,
						name: '',
						category: '',
						description: '',
						url: 'img/indexitem.png'
					});
				}
				//如果lecturers无值
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
				// if (data.broadcastType == 'WEBVIDEO') {
				// 	data.broadcastTypeIMG = 'img/u193.png';
				// }
				//--------------------------------------------------------
				//判断broadcastType类型
				// if (data[i].broadcastType == 'WEBAUDIO') {
				//     //如果是音频
				//     data[i].broadcastTypeIMG = 'img/u253.png';
				//     data[i].broadcastTypeString = '听录音';
				// } else if (data[i].broadcastType == 'PHONE') {
				//     //如果是电话
				//     data[i].broadcastTypeIMG = 'img/u103.png';
				//     data[i].broadcastTypeString = '听录音';
				// } else {
				//     //除此以外就是视频了???
				//     data[i].broadcastTypeIMG = 'img/u193.png';
				//     data[i].broadcastTypeString = '看视频';
				// }
				//如果document为空
				// if (data[i].documents.length == 0) {
				//     data[i].documents.push({
				//         id: -1,
				//         name: '',
				//         type: '',
				//         url: '#'
				//     });
				// }
				//--------------------------------------------------------

				//处理时间日期格式
				data[i].confTime = stringToDate(data[i].startTime, data[i].endTime);
				//console.log(data[i].confTime);
			}
//            console.log(data);
			//将数组处理为对象
			var recvData = {};
			recvData.list = data;
//            console.log(recvData);
			return recvData;
		}
	};
	searchPageFunc.init();
});