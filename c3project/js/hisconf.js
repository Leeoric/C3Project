$(function () {
	//写入功能点，入口只有历史会议tab菜单
	writeLog(historyMeetingEntance, 'entance=历史会议TAB菜单');
	//功能点数据来源
	window.localStorage.setItem('currentPage', '历史会议');
	//数据模型
	var itemData = {
		category: [''],
		field: [''],
		startTime: null,
		endTime: null
	};
	var hisConfPageFunc = {
		init: function () {
			//获得合作伙伴
			renderFriendList();
			//刚进入页面时，渲染一次
			this.renderHisConfData(itemData);
			this.setStyle();
			this.bindEvent();
		},
		bindEvent: function () {
			var self = this;
			//选项卡，点击更多后，显示后面的内容
			$('.table-more').on('click', function (e) {
				e.preventDefault();
				$('.table-nav').find('li:gt(11)').slideToggle();
			});
			//第一级全部按钮时，显示数据
			$('#hisConfCategory').on('click', function (e) {
				e.preventDefault();
				//写入功能点，会议筛选类型
				writeLog(historyMeetingType, 'type=' + $(this).text());
				$(this).addClass('nav-active');
				$('.hisConfCategory li a').removeClass('nav-active');
				itemData.category.length = 0;
				self.renderHisConfData(itemData);
			});
			//第一级筛选时，显示相应的数据
			$('.hisConfCategory').on('click', 'li a', function (e) {
				e.preventDefault();
				//写入功能点，会议筛选类型
				writeLog(historyMeetingType, 'type=' + $(this).text());
				$(this).addClass('nav-active').parent().siblings('li').find('a').removeClass('nav-active');
				$('#hisConfCategory').removeClass('nav-active');
				itemData.category = [$(this).data('hisconfcategory')];
				self.renderHisConfData(itemData);
				opLog.setLog('', itemData);
			});
			//第二级全部按钮时，显示数据
			$('#hisConfField').on('click', function (e) {
				e.preventDefault();
				//写入功能点，会议领域类型
				writeLog(historyMeetingIndustry, 'industry=' + $(this).text());
				$(this).addClass('nav-active');
				$('.hisConfField li a').removeClass('nav-active');
				itemData.field.length = 0;
				self.renderHisConfData(itemData);
				opLog.setLog('', itemData);
			});
			//第二级筛选时，显示相应的数据
			$('.hisConfField').on('click', 'li a', function (e) {
				e.preventDefault();
				//写入功能点，会议领域类型
				writeLog(historyMeetingIndustry, 'industry=' + $(this).text());
				$(this).addClass('nav-active').parent().siblings('li').find('a').removeClass('nav-active');
				$('#hisConfField').removeClass('nav-active');
				itemData.field = [$(this).data('hisconffield')];
				self.renderHisConfData(itemData);
				opLog.setLog('', itemData);
			});
			//看速记点击
			$('#hisConfBox').on('click', '.read-doc-for-pdf', function (e) {
				e.preventDefault();
				//写功能点
				writeLog(shortHandBackView, 'from=' + window.localStorage.getItem('currentPage'));
				//弹出PDF阅读页
				var openUrl = getDocuments($(this).data('documentid'), 'SHORTHAND');
				if (openUrl) {
					window.open(host + openUrl);
				}
			});
			//听录音点击
			$('#hisConfBox').on('click', '.read-doc-for-audio', function (e) {
				e.preventDefault();
				//写功能点
				writeLog(audioBackView, 'from=' + window.localStorage.getItem('currentPage'));
				//弹出音频页
				openAudioWindow($(this));
			});
			//看视频点击
			// $('#hisConfBox').on('click', '.read-doc-for-video', function (e) {
			// 	e.preventDefault();
			// 	//写功能点
			// 	writeLog(videoBackView, 'from=' + window.localStorage.getItem('currentPage'));
			// 	//弹出视频页
			// 	window.open('//用id去请求页面地址');
			// });

			//自定义日期发送请求
			$('#diyDateConfirm').on('click', function (e) {
				e.stopPropagation();
				var st = $('#diyDate1').val().replace(/\//g, '');
				var et = $('#diyDate2').val().replace(/\//g, '');
				if (!st) {
					st = getDateStr(0, false, true);
				} else if (!et) {
					et = getDateStr(0, false, true);
				} else if (parseInt(st.replace(/-/g, '')) > parseInt(et.replace(/-/g, ''))) {
					layer.msg('结束日期不可早于开始日期，请重新选择日期.');
				} else {
					itemData.startTime = st;
					itemData.endTime = et;
					self.renderHisConfData(itemData);
					//写入功能点
					//writeLog(confInfoTime, 'time=' + st + '-' + et);
					//$('#diyDatePicker').fadeOut(300);
				}

			});

		},
		setStyle: function () {
			var self = this;
			//日期选择控件
			$('.diy-date').datetimepicker({
				lang:'ch',
				timepicker: false,
				format: 'Y-m-d',
				formatDate: 'Y-m-d'
			});

			$('.main.container').resize(function () {
				self.setFooterPosition();
			});
		},
		//获取历史会议列表
		renderHisConfData: function (param, currentPage) {
			var self = this;
			if (param.category == "") {
				param.category = null;
			}
			if (param.field == "") {
				param.field = null;
			}
			currentPage = currentPage || 1;
			var ajaxSendData = {
				"criteria": {
					"category": param.category,
					"field": param.field,
					"meetingStatus": [
						"ENDED"
					]
				},
				startTime: param.startTime,
				endTime: param.endTime,
				currentPage: currentPage,
				isPaging: true,
				pageSize: 10
			};
			$.ajax({
				// url: host + 'getHistoryMeetingList.json',
				url: host + 'getHistoryMeeting.json',
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
						layer.msg("会议列表请求超时。请稍后尝试重新刷新页面。");
					}
				},
				success: function (data) {
					//处理数据
					// documentsHandle(data.list);
					self.handlerRevData(data.list);
					opLog.setLog('处理后的数据', data);
					//模板引擎渲染
					var hisConf = template('hisConfTlp', data);
					$('#hisConfBox').html(hisConf);
					delayDiv(false);
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
								self.renderHisConfData(param, obj.curr);
							}
						}
					});
					//表格奇偶行变色
					$('#hisConfBox').find('tr:odd').css('backgroundColor', '#f8f8f8');
				},
				error: function (error) {
					opLog.setLog('获取历史会议列表失败', error);
					if (error.readyState == 4 && error.status == 500) {
						layer.msg('获取历史会议列表失败。');
					}
					if (error.readyState == 4 && JSON.parse(error.responseText).errorCode == 1022) {
						layer.msg('身份验证过期，请尝试刷新页面.');
						//清除缓存信息
						personalInfo.removeStorageInfo();
					}
				}
			});
		},
		//处理数据函数
		handlerRevData: function (data) {
			var self = this;
			for (var i = 0, len = data.length; i < len; i++) {
				//如果sponsors有值但是url为空
				// if (data[i].sponsors[0] && data[i].sponsors[0].url == '') {
					//console.log(data[i].sponsors[0]);
					// data[i].sponsors[0].url = 'img/indexitem.png';
				// }
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
								description: "",
								email: "",
								id: -1,
								title: "",
								name: "",
								institute: {
									id: -1,
									name: "",
									category: "",
									description: "",
									url: ""
								},
								phoneNum: "",
								role: "",
								remark: ""
						});
					}
				//处理时间日期格式
				data[i].confTime = stringToDate(data[i].startTime, data[i].endTime);
				//console.log(data[i].confTime);
			}

		},
		// lecturersSort: function (lecturersArray) {
		// 	var lecturerArr = [];
		//
		// 	//如果lecturers无值
		// 	if (lecturersArray.length == 0) {
		// 		lecturersArray.push({
		// 			displayOption: "PRIMARY",
		// 			lecturer: {
		// 				description: "",
		// 				email: "",
		// 				id: -1,
		// 				title: "",
		// 				name: "主讲人",
		// 				institute: {
		// 					id: -1,
		// 					name: "机构",
		// 					category: "",
		// 					description: "",
		// 					url: ""
		// 				},
		// 				phoneNum: "",
		// 				role: "",
		// 				remark: ""
		// 			},
		// 			meetingId: -1,
		// 		});
		// 	}
		//
		// 	$.each(lecturersArray, function (i, v) {
		// 		if (this.displayOption == 'PRIMARY') {
		// 			lecturerArr.unshift(this);
		// 		} else if (this.displayOption == 'SECONDARY') {
		// 			lecturerArr.splice(1, 0, this);
		// 		} else if(this.displayOption == 'NORMAL') {
		// 			lecturerArr.push(lecturersArray[i]);
		// 		}
		// 	});
		// 	console.log('处理后的主讲人排序：', lecturerArr);
		// 	return lecturerArr;
		// }
	};
	hisConfPageFunc.init();
});