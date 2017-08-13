$(function () {
	//功能点数据来源
	window.localStorage.setItem('currentPage', '我的会议');
	var personPageFunc = {
		//我的会议URL
		myConfAjaxUrl: host + 'getMyMeetingList.json',
		//我的收藏URL
		myFavAjaxUrl: host + 'getBookMarkedMeetingList.json',
		//我的会议和我的收藏数目
		myConfNumber: -1,
		myFavNumber: -1,
		init: function () {
			renderFriendList();
			this.renderHisConfData();
			this.bindEvent();
			this.setStyle();
		},
		//设置样式
		setStyle: function () {
			var self = this;
			//设置左侧边栏高度
			$('.myconf').height($('.footer').offset().top - $('.myconf').offset().top);

			if (self.myConfNumber < 0) {
				//获取我的会议数量
				self.renderHisConfData(self.myConfAjaxUrl, 1, function (data) {
					self.myConfNumber = data.count;
					$('#myConfNum').text(self.myConfNumber);
				});
			}

			if (self.myFavNumber < 0) {
				//获取我的收藏数量
				self.renderHisConfData(self.myFavAjaxUrl, 1, function (data) {
					self.myFavNumber = data.count;
					$('#myFavNum').text(self.myFavNumber);
				});
			}

		},
		//绑定事件
		bindEvent: function () {
			var self = this;
			//左侧tab切换节流阀,1是我的会议，2是我的收藏
			var tabName = 1;
			//我的会议
			$('#myConf').on('click', function () {
				if (tabName != 1) {
					tabName = 1;
					$(this).addClass('per-active');
					$('#myFav').removeClass('per-active');
					//获取我的会议列表
					self.renderHisConfData(self.myConfAjaxUrl);
					//功能点数据来源
					window.localStorage.setItem('currentPage', '我的会议');
				}
			});
			//我的收藏
			$('#myFav').on('click', function () {
				if (tabName != 2) {
					tabName = 2;
					$(this).addClass('per-active');
					$('#myConf').removeClass('per-active');
					//功能点数据来源
					window.localStorage.setItem('currentPage', '我的收藏');
					//获取我的收藏列表
					self.renderHisConfData(self.myFavAjaxUrl);
				}
			});
			//立即报名
			$('.myconf-table').on('click', '#justSignUp', function () {
				var that = $(this);
				signUp($(this).data('meetingid'), $(this), function (data) {
					enterTips(true);
					//立即报名四个字改为已报名，颜色改变
					that.data("statusmark", true)
						.text('您已报名');
				});
			});
			//立即参会--跳转详情页
			$('.myconf-table').on('click', '#justJoin', function () {
				var that = $(this);
				window.location.href = 'confdetail.html?id=' + that.data('meetingid');
			});
			//看速记点击
			$('.myconf-table').on('click', '.read-doc-for-pdf', function (e) {
				e.preventDefault();
				//写功能点
				writeLog(001800040010, 'from=' + window.localStorage.getItem('currentPage'));
				//弹出PDF阅读页
				var openUrl = getDocuments($(this).data('documentid'), 'SHORTHAND');
				if (openUrl) {
					opLog.setLog('', openUrl);
					window.open(host + openUrl);
				}
			});
			//听录音点击
			$('.myconf-table').on('click', '.read-doc-for-audio', function (e) {
				e.preventDefault();
				//写功能点
				writeLog(001800040011, 'from=' + window.localStorage.getItem('currentPage'));
				//弹出音频页
				var docId = $(this).data('documentid');
				window.open('./audioplayer.html?documentid=' + docId + '&meetingtitle=' + encodeURIComponent($(this).attr('title')), '3C中国财经会议', 'width=500, height=140, top=500, left=500');

			});
			//看视频点击
			$('.myconf-table').on('click', '.read-doc-for-video', function (e) {
				e.preventDefault();
				//写功能点
				writeLog(901800040018, 'from=' + window.localStorage.getItem('currentPage'));
				//弹出视频页
				window.open('//用id去请求页面地址');
			});
		},
		//获取我的会议列表
		renderHisConfData: function (url, currentPage, fn) {
			var self = this;
			currentPage = currentPage || 1;
			url = url || host + 'getMyMeetingList.json';
			var ajaxSendData = {
				currentPage: currentPage,
				isPaging: true,
				pageSize: 15
			};
			$.ajax({
				url: url,
				type: 'POST',
				data: JSON.stringify(ajaxSendData),
				dataType: 'json',
				headers: {'Content-Type': 'application/json'},
				beforeSend: function () {
					delayDiv(true);
				},
				timeout: 15000,
				complete : function(xhr,status){
					delayDiv(false);
					if(status=='timeout'){
						layer.msg("列表请求超时。请稍后尝试重新刷新页面。");
					}
				},
				success: function (data) {
					delayDiv(false);
					if (fn) {
						fn(data);
						return;
					}
					//处理数据
					// documentsHandle(data.list);
					var handledData = self.handleRevData(data.list);
					var meetingIdArr = [];
					$.each(handledData.list, function () {
						if (this.meetingStatus != 'ENDED') {
							meetingIdArr.push(this.id);
						}
					});
					//将会议ID数组传给获取收藏状态和报名状态的ajax
					var signUpBookStatus = getMtingSignupBookmark(meetingIdArr);
					//将报名收藏状态数据装入会议列表数据中
					dataMix(handledData, signUpBookStatus);
					opLog.setLog('', handledData);
					var myConf = template('myConfTlp', handledData);
					$('#myConfList').html(myConf);
//					render(handledData);
					//表格奇偶行变色
					$('.table-content').find('tr:odd').css('backgroundColor', '#f8f8f8');
					//分页
					self.paging(url, currentPage, data, ajaxSendData);
				},
				error: function (error) {
					delayDiv(false);
					if (error.readyState == 4 && error.status == 500) {
						layer.msg('获取列表失败。');
					}
					if (error.readyState == 4 && JSON.parse(error.responseText).errorCode == 1022) {
						layer.msg('身份验证已经过期或sessionid非法，请重新登入页面.');
						//清除缓存信息
						personalInfo.removeStorageInfo();
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
		},
		//分页
		paging: function (url, currentPage, data, ajaxSendData) {
			var self = this;
			//分页
			laypage({
				//容器。值支持id名、原生dom对象，jquery对象
				cont: $('#pageIndex'),
				//总页数
				pages: Math.ceil(data.count / ajaxSendData.pageSize),
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
						self.renderHisConfData(url, obj.curr);
					}
				}
			});
		},

	};
	personPageFunc.init();
});