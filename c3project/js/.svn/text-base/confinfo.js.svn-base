$(function () {
	//功能点数据来源
	window.localStorage.setItem('currentPage', '会议资讯');
	var item = {
		meetingCategory: '',
		city: '',
		startTime: '',
		endTime: ''
	};
	var confInfoPageFunc = {
		init: function () {
			//获取合作伙伴
			renderFriendList();
			//进入页面，先渲染一次
			this.renderOfflineConfData({});
			this.setStyle();
			this.bindEvent();
		},
		bindEvent: function () {
			var self = this;
			//第一级全部按钮时，显示数据
			$('#confInfoCategory').on('click', function (e) {
				e.preventDefault();
				//写入功能点，会议资讯类型
				writeLog(922300090021, 'type=' + $(this).text());
				$(this).addClass('nav-active');
				$('.hisConfCategory li a').removeClass('nav-active');
				item.meetingCategory = '';
				self.renderOfflineConfData(item);
			});
			//第一级筛选时，显示相应的数据
			$('.hisConfCategory').on('click', 'li a', function (e) {
				e.preventDefault();
				//写入功能点，会议资讯类型
				writeLog(922300090021, 'type=' + $(this).text());
				$(this).addClass('nav-active').parent().siblings('li').find('a').removeClass('nav-active');
				$('#confInfoCategory').removeClass('nav-active');
				item.meetingCategory = $(this).data("meetingcategory");
				opLog.setLog('','选择了类型： ' + $(this).text() + ' 编码： ' + $(this).data("meetingcategory"));
				self.renderOfflineConfData(item);
			});
			//第二级全部按钮时，显示数据
			$('#confInfoCity').on('click', function (e) {
				e.preventDefault();
				//写入功能点，会议资讯地点
				writeLog(922300090022, 'place=' + $(this).text());
				$(this).addClass('nav-active');
				$('.hisConfField li a').removeClass('nav-active');
				item.city = '';
				self.renderOfflineConfData(item);
			});
			//第二级筛选时，显示相应的数据
			$('.hisConfField').on('click', 'li a', function (e) {
				e.preventDefault();
				//写入功能点，会议资讯地点
				writeLog(922300090022, 'place=' + $(this).text());
				$(this).addClass('nav-active').parent().siblings('li').find('a').removeClass('nav-active');
				$('#confInfoCity').removeClass('nav-active');
				item.city = $(this).data("cityvalue");
				opLog.setLog('', '选择了城市： ' + $(this).text() + ' 编码： ' + $(this).data("cityvalue"));
				self.renderOfflineConfData(item);
			});
			//第三级全部按钮时，显示数据
			$('#confInfoDate').on('click', function (e) {
				e.preventDefault();
				//写入功能点，会议资讯时间
				writeLog(922300090023, 'time=' + $(this).text());
				$(this).addClass('nav-active');
				$('.confInfoDate li a').removeClass('nav-active');
				item.startTime = '';
				item.endTime = '';
				self.renderOfflineConfData(item);
			});
			//第三级筛选时，显示相应的数据
			$('.confInfoDate').on('click', 'li a', function (e) {
				e.preventDefault();
				//写入功能点，会议资讯时间
				writeLog(922300090023, 'time=' + $(this).text());
				$(this).addClass('nav-active').parent().siblings('li').find('a').removeClass('nav-active');
				$('#confInfoDate').removeClass('nav-active');
				item.startTime = getDateStr(0, false, true);
				item.endTime = getDateStr($(this).data('adddate'), false, true);
				self.renderOfflineConfData(item);
			});

			//点击自定义日期，弹出选择日期的提示框
			$('#diyDate').on('click', function (e) {
				e.stopPropagation();
				$('#diyDatePicker').fadeIn(300);
			});
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
					item.startTime = st;
					item.endTime = et;
					self.renderOfflineConfData(item);
					//写入功能点，会议资讯时间
					writeLog(922300090023, 'time=' + st + '-' + et);
					$('#diyDatePicker').fadeOut(300);
				}

			});
			//点击取消，隐藏日期选择框
			$('#diyDateCancel').on('click', function (e) {
				e.stopPropagation();
				$('#diyDatePicker').fadeOut(300);
			});
		},
		setStyle: function () {
			var self = this;
			//日期选择控件
			$('.diy-date').datetimepicker({
				lang:'ch',
				timepicker: false,
				format: 'Y/m/d',
				formatDate: 'Y/m/d'
			});
			//设置自定义日期的位置，跟随那个li
			$('#diyDatePicker').css({
				left: $('#diyDate').position().left + $('#diyDate').width(),
				top: $('#diyDate').position().top
			});
		},
		//渲染页面
		renderOfflineConfData: function (param, currentPage) {
			var self = this;
			if (param.meetingCategory == "") {
				param.meetingCategory = null;
			}
			if (param.city == "" || param.city == undefined) {
				param.city = null;
			}
			if (param.endTime == "" || param.endTime == undefined) {
				//如果没有定义结束时间，那么结束时间为720天以后
				param.endTime = getDateStr(720).replace(/-/g, '');
			}
			if (param.startTime == "" || param.startTime == undefined) {
				//如果没有定义开始时间，那么开始时间为当前日期
				param.startTime = getDateStr(0).replace(/-/g, '');
			}
			currentPage = currentPage || 1;
			opLog.setLog('', param)
			var ajaxSendData = {
				criteria: {
					"meetingCategory": param.meetingCategory,
					"city": param.city
				},
				startTime: param.startTime || null,
				endTime: param.endTime || null,
				currentPage: currentPage,
				isPaging: true,
				pageSize: 10
			};

			$.ajax({
				url: host + 'getOfflineMeetingList.json',
				type: 'POST',
				data: JSON.stringify(ajaxSendData),
				dataType: 'json',
				headers: {'Content-Type': 'application/json'},
				timeOut: 1500,
				beforeSend: function () {
					delayDiv(true);
				},
				complete : function(xhr,status){
					delayDiv(false);
					if(status=='timeout'){
						layer.msg("获取会议资讯列表超时。");
					}
				},
				success: function (data) {
					delayDiv(false);
					opLog.setLog('', data);
					//处理数据
//					documentsHandle(data.list);
					var handledData = self.handleRevData(data.list);
					//模板引擎渲染
					var confInfo = template('confInfoTlp', handledData);
					$('#confInfoBox').html(confInfo);
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
								self.renderOfflineConfData(param, obj.curr);
							}
						}
					});
					//表格奇偶行变色
					$('.table-content').find('tr:odd').css('backgroundColor', '#f8f8f8');
					// $('.page-index').css({
					// 	position: 'absolute',
					// 	right: $('.table-content').offset().left,
					// 	bottom: $('.footer').height(),
					// });
					//底部footer & 分页栏, 如果页面内容过少，让它固定在底部，不随内容高度变化而变化
					// if ($('.footer').offset().top + $('.footer').height() < $(window).height()) {
					// 	// console.log($(window).height());
					// 	$('.footer').css({
					// 		position: 'absolute',
					// 		bottom: 0
					// 	});
					// }
					self.setFooterPosition();
				},
				error: function (error) {
					delayDiv(false);
					if (error.readyState == 4 && error.status == 500) {
						layer.msg('获取会议资讯列表失败。');
					}
				}
			});
		},
		//处理数据函数
		handleRevData: function (data) {
			for (var i = 0, len = data.length; i < len; i++) {
				//如果sponsors无值
				if (!data[i].sponsors) {
					data[i].sponsors = '';
				}
				//处理时间日期格式
				// data[i].confTime = stringToDate(data[i].startTime, data[i].endTime);
				// console.log(data[i].confTime);
				//data[i].date = confinfoDateHandle(data[i].date);
			}
//            console.log(data);
			//将数组处理为对象
			var recvData = {};
			recvData.list = data;
//            console.log(recvData);
			return recvData;
		},
		setFooterPosition: function () {
			//底部footer & 分页栏, 如果页面内容过少，让它固定在底部，不随内容高度变化而变化
			if ($('.footer').offset().top + $('.footer').height() < $(window).height()) {
				// console.log($(window).height());
				$('.footer').css({
					position: 'absolute',
					bottom: 0
				});
			} else {
				$('.footer').css({
					position: 'static',
				});
			}
		},
	};
	confInfoPageFunc.init();
});