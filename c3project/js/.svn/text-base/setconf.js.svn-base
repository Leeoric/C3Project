$(function () {
	//功能点数据来源
	window.localStorage.setItem('currentPage', '发起会议');
	//验证电子邮箱的正则
	var emailREG = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
	var phoneREG = /^1[0-9]{10}$/;
	var state = 'PUBLIC';
	//是否提交成功？
	var isSubmit = false;
	var callbackData = null;
	var ivtedCount = 0;
	//actionCode: 1：查看，2：编辑，3：添加
	var actionCode = 1;
	var sendFriObj = {};
	layer.config({
		extend: 'myskin/layer.css', //加载新皮肤
		skin: 'layer-ext-myskin' //一旦设定，所有弹层风格都采用此主题。
	});
	var createConfPageFunc = {
		init: function () {
			//获取合作伙伴
			renderFriendList();
			//进入页面的时候先渲染一次创建公共会议的页面
			this.renderConf(state);
			this.bindEvent();
			this.tabSwitchEvent();
		},
		bindEvent: function () {
			var self = this;
			//私人会议中，邀请参会嘉宾
			$('body').on('click', '#addPerson', function () {
				//弹出选择页
				$('.float-div').fadeIn(300);
				self.initializeLeftForm();
			});
			//搜索好友，确定搜索后，下方渲染好友列表
			//点击搜索图标搜索
			$('body').on('click', '#searchImg', function () {
				self.searchFriend($(this).siblings('input').val());
			});
			//回车键搜索
			$('body').on('keydown', '#searchInput', function (e) {
				if (e.keyCode == 13) {
					self.searchFriend($(this).val());
				}
			});
			//快速查找好友，点击字母，将对应条目滚动到屏幕最上方
			$('body').on('click', '#alphaIndex li', function () {
				opLog.setLog('', $(this).text());
				if ($(this).text() == '全') {
					self.renderLeftFri(callbackData);
				} else {
					for (var i = 0; i < callbackData.length; i++) {
						if (callbackData[i].key == $(this).text()) {
							var searchData = [callbackData[i]];
							self.renderLeftFri(searchData);
						}
					}
				}
			});
			//点击关闭邀请参会嘉宾
			$('#closeAttendImg').on('click', function () {
				$('.float-div').fadeOut(300);
				//如果添加好友打开，就一起关闭
				$('#addMyFriend').fadeOut(300);
			});
			//点击取消关闭邀请参会嘉宾
			$('#closeAttendBtn').on('click', function () {
				$('.float-div').fadeOut(300);
				//如果添加好友打开，就一起关闭
				$('#addMyFriend').fadeOut(300);
			});
			//点击按钮切换会议类型
			$('#pubConf').on('click', function () {
				state = 'PUBLIC';
				self.renderConf(state);
				$(this).addClass('tab-active');
				$('#priConf').removeClass('tab-active');
				opLog.setLog('', 'state = PUBLIC');
			});
			$('#priConf').on('click', function () {
				state = 'PRIVATE';
				self.renderConf(state);
				$(this).addClass('tab-active');
				$('#pubConf').removeClass('tab-active');
				opLog.setLog('', 'state = PRIVATE');
			});
			//点击表单提交按钮
			$('body').on('click', '#formSubmit', function (e) {
				if (isSubmit) {
					layer.msg('您已经提交成功，请勿重复提交。')
					return false;
				}
				//e.stopPropagation();
				//表单验证（提交时）
				//如果主题为空
				if ($('#confTitle').val().length == 0) {
					$('#confTitle').addClass('outside-highlight').siblings('span.form-tips').text('(会议主题不可为空)');
					return false;
				}
				//时间
				var st, et;
				if (state === 'PUBLIC') {
					st = $('#some_class_1').val();
					et = $('#some_class_2').val();
				} else if (state === 'PRIVATE') {
					st = $('#some_class_3').val();
					et = $('#some_class_4').val();
				}
				//如果会议内容为空
				if ($('.conf-desc').val().length == 0) {
					$('.conf-desc').addClass('outside-highlight').siblings('span.form-tips').text('(请填写会议内容)');
					return false;
				}
				//分类型
				if (state === 'PUBLIC') {
					//console.log(e.target);
					//主题
					//console.log($('#confTitle').val());
					//开始时间
					//console.log($('#some_class_1').val().replace(/\//g, '-') + ':00');
					//结束时间
					//console.log($('#some_class_2').val().replace(/\//g, '-') + ':00');
					//简介
					//console.log($('#desc').val());
					//时间必选
					if ($('#some_class_1').val().length == 0) {
						$('#some_class_1').addClass('outside-highlight')
							.siblings('span.form-tips')
							.text('(时间不能为空)');
						return false;
					} else if ($('#some_class_2').val().length == 0) {
						$('#some_class_2').addClass('outside-highlight')
							.siblings('span.form-tips')
							.text('(时间不能为空)');
						return false;
					}
					st = $('#some_class_1').val();
					et = $('#some_class_2').val();
					//开始时间必须比现在延迟15分钟
					if ((parseInt(st.replace(/\/|\s+|:/g, '')) - parseInt(getDateStr(0, true).replace(/-/g, ''))) < 15) {
						//console.log(parseInt(st.replace(/\/|\s+|:/g, '')));
						//console.log(parseInt(getDateStr(0,true).replace(/-/g, '')));
						//console.log(parseInt(st.replace(/\/|\s+|:/g, '')) - parseInt(getDateStr(0, true).replace(/-/g, '')));
						$('#some_class_1').addClass('outside-highlight')
							.siblings('span.form-tips')
							.text('(会议开始时间最快应该在当前时间的15分钟以后，请重新选择日期.)');
						return false;
					}
					//如果结束时间早于开始时间
					if (parseInt(st.replace(/\/|\s+|:/g, '')) > parseInt(et.replace(/\/|\s+|:/g, ''))) {
						$('#some_class_2').addClass('outside-highlight')
							.siblings('span.form-tips')
							.text('(结束日期不可早于开始日期，请重新选择日期.)');
						return false;
					} else {
						$('#some_class_2').removeClass('outside-highlight')
							.siblings('span.form-tips')
							.text('');
					}
					//发送请求！
					self.createConf({
						title: $('#confTitle').val(),
						startTime: $('#some_class_1').val().replace(/\//g, '-') + ':00',
						endTime: $('#some_class_2').val().replace(/\//g, '-') + ':00',
						meetingType: state,
						description: $('#desc').val()
					});

					return false;
				} else if (state === 'PRIVATE') {
					//console.log(e.target);
					//主题
					//console.log($('#confTitle').val());
					//开始时间
					//console.log($('#some_class_3').val().replace(/\//g, '-') + ':00');
					//结束时间
					//console.log($('#some_class_4').val().replace(/\//g, '-') + ':00');
					// console.log($('#forbiddenText').val());
					//简介
					//console.log($('#desc').val());
					//桌面共享
					//console.log($('#shareDesk').is(':checked'));

					st = $('#some_class_3').val();
					et = $('#some_class_4').val();
					//开始时间必须比现在延迟15分钟
					if ((parseInt(st.replace(/\/|\s+|:/g, '')) - parseInt(getDateStr(0, true).replace(/-/g, ''))) < 15) {
						//console.log(parseInt(st.replace(/\/|\s+|:/g, '')));
						//console.log(parseInt(getDateStr(0, true).replace(/-/g, '')));
						$('#some_class_3').addClass('outside-highlight')
							.siblings('span.form-tips')
							.text('(会议开始时间最快应该在当前时间的15分钟以后，请重新选择日期.)');
						return false;
					}
					//结束时间早于开始时间
					if (parseInt(st.replace(/\/|\s+|:/g, '')) > parseInt(et.replace(/\/|\s+|:/g, ''))) {
						$('#some_class_4').addClass('outside-highlight')
							.siblings('span.form-tips')
							.text('(结束日期不可早于开始日期，请重新选择日期.)');
						return false;
					} else {
						$('#some_class_4').removeClass('outside-highlight')
							.siblings('span.form-tips')
							.text('');
					}
					//发送请求！
					if ($('#some_class_3').val().length == 0) {
						$('#some_class_3').addClass('outside-highlight')
							.siblings('span.form-tips')
							.text('(时间不能为空)');
						return false;
					} else if ($('#some_class_4').val().length == 0) {
						$('#some_class_4').addClass('outside-highlight')
							.siblings('span.form-tips')
							.text('(时间不能为空)');
						return false;
					}
					//提交时如果没有选择参会嘉宾
					if (!$('#ivtInput').val()) {
						$('#ivtInput').addClass('outside-highlight').siblings('span.form-tips').text('(请选择参会嘉宾)');
						return false;
					}

					self.createConf({
						title: $('#confTitle').val(),
						startTime: $('#some_class_3').val().replace(/\//g, '-') + ':00',
						endTime: $('#some_class_4').val().replace(/\//g, '-') + ':00',
						meetingType: state,
						description: $('#desc').val(),
						desktopShare: $('#shareDesk').is(':checked'),
						user: self.sendUserInfo(sendFriObj)
					}, host + 'createPrivateMeeting.json');
					return false;
				}
			});
			//表单验证(在输入时）
			//如果主题内容字数大于30
			$('body').on('keyup change', '.conf-title', function () {
				if ($('#confTitle').val().length > 30) {
					$(this).addClass('outside-highlight').siblings('span.form-tips').text('(会议主题不可超过30个字)');
				} else {
					$(this).removeClass('outside-highlight').siblings('span.form-tips').text('');
				}
			});
			//如果结束时间早于开始时间
			$('body').on('change', '.some_class', function () {
				var st, et;
				if (state === 'PUBLIC') {
					st = $('#some_class_1').val();
					et = $('#some_class_2').val();
				} else if (state === 'PRIVATE') {
					st = $('#some_class_3').val();
					et = $('#some_class_4').val();
				}
				//console.log(parseInt(st.replace(/\/|\s+|:/g, '')));
				//console.log(parseInt(et.replace(/\/|\s+|:/g, '')));
				if (parseInt(st.replace(/\/|\s+|:/g, '')) >= parseInt(et.replace(/\/|\s+|:/g, ''))) {
					$(this).addClass('outside-highlight')
						.siblings('span.form-tips')
						.text('(结束日期不可早于或等于开始日期，请重新选择日期.)');
				} else {
					$(this)
						.removeClass('outside-highlight')
						.siblings('span.form-tips').text('');
				}
			});
			//如果内容超过1000个字
			$('body').on('change', '.conf-desc', function () {
				if ($(this).val().length > 1000) {
					$(this).addClass('outside-highlight').siblings('span.form-tips').text('(内容不可超过1000个字)');
				} else {
					$(this).removeClass('outside-highlight').siblings('span.form-tips').text('');
				}
			});
			//如果选择了参会嘉宾
			$('#ivtInput').on('change', function () {
				opLog.setLog('', $(this).val());
				if (!$(this).val()) {
					$(this).addClass('outside-highlight').siblings('span.form-tips').text('(请选择参会嘉宾)');
				} else {
					$(this).removeClass('outside-highlight').siblings('span.form-tips').text('');
				}
			});
			//-----------添加好友开始---------------
			//点击添加好友，出现弹窗
			$('body').on('click', '#addFriend', function () {
				$('#addMyFriend').fadeIn(300);

				var renderData = {
					actionCode: 3,
					list: [{
						"userName": "",
						"userID": "",
						"company": "",
						"department": "",
						"email": "",
						"iMID": "",
						"memo": "",
						"mobilePhone": "",
						"position": "",
						"telephone": "",
						"userFrom": "2",
						"userRank": 2,
						"type": 0
					}]
				};
				var addFriend = template('addFriendTpl', renderData);
				$('#addMyFriend').html(addFriend);
			});
			//点击关闭添加好友
			$('body').on('click', '#closeMyFriend', function () {
				$('#addMyFriend').fadeOut(300);
			});
			//点击取消按钮关闭添加好友
			$('body').on('click', '#addFriCancel', function () {
				$('#addMyFriend').fadeOut(300);
			});
			//增  点击确定，发送添加请求
			$('body').on('click', '#addFriSubmit', function () {
				if (self.validateContactsForm() === false) {
					return false;
				}
				var crmid = JSON.parse(sessionStorage.getItem('userinfo')).crmId;
				var contactData = {
					"addstatus": false,
					"userID": "",
					"userName": $('#addName').val(),
					"mobilePhone": $('#addCellphone').val(),
					"email": $('#addEmail').val(),
					"company": $('#addCompanyName').val(),
					"telephone": $('#addCompanyTel').val(),
					"crmId": crmid,
					"department": "",
					"iMID": "",
					"memo": "",
					"position": "",
					"type": 0,
					"userFrom": "2",
					"userRank": 0
				};
				opLog.setLog('增加的联系人', contactData);
				self.handlerContacts(1, contactData, function (data) {
					layer.msg('添加联系人成功！', {icon: 1});
					contactData.userID = data + '';
					self.insertToObj(contactData, callbackData);
					self.initializeLeftForm();
					$('#addMyFriend').fadeOut(300);
				}, function () {
					layer.msg('添加联系人失败', {icon: 2});
				});
			});
			//删  点击删除按钮删除好友
			$('body').on('click', '#addFriDel', function () {
				var uid = $(this).parent().data('uidinfo').toString();
				//询问框
				layer.confirm('确定删除该联系人？', {
					title: '是否确定',
					btn: ['确定', '取消']
				}, function () {
					var oppositeObj = self.getContactObjByUID(uid);
					opLog.setLog('要删除的联系人对象', oppositeObj);
					self.handlerContacts(3, oppositeObj, function () {
						self.getContactObjByUID(uid, 1);
						self.initializeLeftForm();
						layer.msg('已删除联系人。', {icon: 1});
						$('#addMyFriend').fadeOut(300);
					}, function () {
						layer.msg('删除联系人失败', {icon: 2});
					});
				}, function () {
				});
			});
			//改  保存编辑后的联系人
			$('body').on('click', '#saveFriBtn', function () {
				if (self.validateContactsForm() === false) {
					return false;
				}
				var uid = $(this).parent().data('uidinfo').toString();
				var crmid = JSON.parse(sessionStorage.getItem('userinfo')).crmId;
				var oppositeObj = self.getContactObjByUID(uid);
				opLog.setLog('相应的对象', oppositeObj);
				var contactData = {
					userID: uid,
					userName: $('#addName').val(),
					mobilePhone: $('#addCellphone').val(),
					email: $('#addEmail').val(),
					company: $('#addCompanyName').val(),
					telephone: $('#addCompanyTel').val(),
					crmId: crmid
				};
				opLog.setLog('要保存的对象', contactData);
				if (self.compareObj(contactData, oppositeObj)) {
					//如果两个对象键值相同，说明没有修改
					layer.msg('您没有修改联系人资料', {icon: 1});
					return;
				}
				self.handlerContacts(2, contactData, function () {
					layer.msg('编辑联系人信息成功！', {icon: 1});
					self.compareObj(contactData, oppositeObj, true);
					self.initializeLeftForm();
					$('#addMyFriend').fadeOut(300);
				}, function () {
					layer.msg('编辑联系人信息失败', {icon: 2});
				});

			});
			//查  看好友信息
			$('body').on('click', '#checkUserInfo', function () {
				$('#addMyFriend').fadeIn(300);
				var uid = $(this).parent().siblings('.add-state').data('uid').toString();
				var renderList = [];
				renderList[0] = self.getContactObjByUID(uid);
				var renderData = {
					actionCode: 1,
					list: renderList
				};
				var addFriend = template('addFriendTpl', renderData);
				$('#addMyFriend').html(addFriend);
			});
			//-----------添加好友结束---------------
			//编辑好友信息
			$('body').on('click', '#editUserInfo', function () {
				$('#addMyFriend').fadeIn(300);
				var uid = $(this).parent().siblings('.add-state').data('uid').toString();
				var renderList = [];
				renderList[0] = self.getContactObjByUID(uid);
				var renderData = {
					actionCode: 2,
					list: renderList
				};
				var addFriend = template('addFriendTpl', renderData);
				$('#addMyFriend').html(addFriend);
			});
		},
		validateContactsForm: function () {
			//表单验证
			if (!$('#addName').val()) {
				$('#addName').addClass('outside-highlight');
				$('.addfri-tips').text('姓名不可为空!');
				return false;
			} else {
				$('#addName').removeClass('outside-highlight');
				$('.addfri-tips').text('');
			}
			if (!$('#addCellphone').val()) {
				$('#addCellphone').addClass('outside-highlight');
				$('.addfri-tips').text('手机不可为空!');
				return false;
			} else if (!phoneREG.test($('#addCellphone').val())) {
				$('#addCellphone').addClass('outside-highlight');
				$('.addfri-tips').text('请输入正确的手机号!');
				return false;
			} else {
				$('#addCellphone').removeClass('outside-highlight');
				$('.addfri-tips').text('');
			}
			if (!$('#addEmail').val()) {
				$('#addEmail').addClass('outside-highlight');
				$('.addfri-tips').text('电子邮件不可为空!');
				return false;
			} else if (!emailREG.test($('#addEmail').val())) {
				$('#addEmail').addClass('outside-highlight');
				$('.addfri-tips').text('电子邮件格式错误!');
				return false;
			} else {
				$('#addEmail').removeClass('outside-highlight');
				$('.addfri-tips').text('');
			}
		},
		//获取联系人列表（同步ajax请求，成功后为callbackData赋值，与callbackData的位置谨慎改变！）
		getUserListGroup: function () {
			var ContactListType = {type: 1};
			$.ajax({
				url: host + 'getUserListGroup.json',
				type: 'GET',
				data: ContactListType,
				//同步！
				async: false,
				dataType: 'json',
				beforeSend: function () {
					delayDiv(true);
				},
				timeout: 15000,
				complete: function (xhr, status) {
					delayDiv(false);
					if (status == 'timeout') {
						layer.msg("请求超时。请稍后尝试重新刷新页面。");
					}
				},
				success: function (data) {
					opLog.setLog('获得联系人数据: ', data);
					delayDiv(false);
					callbackData = data;
				},
				error: function (error) {
					delayDiv(false);
					if (error.readyState == 4 && error.status == 500) {
						layer.msg('服务器异常，获得联系人数据失败。');
					}
					opLog.setLog('', error);
				}
			});
		},
		//初始化左侧好友列表
		initializeLeftForm: function (isRefresh) {
			isRefresh = isRefresh || false;
			if (!callbackData || isRefresh) {
				// alert('从服务器获取列表！');
				this.getUserListGroup();
				//处理数据
				callbackData = this.handleContactList(callbackData);
			}
			opLog.setLog('要渲染的数据： ', callbackData);
			this.renderLeftFri(callbackData);
			//渲染旁边的首字母速查
			this.alphaCheck(callbackData);
		},
		//点击选中好友，左边显示已添加，右边加一个好友
		//---------------------左右栏切换开始---------------------
		tabSwitchEvent: function () {
			var self = this;
			//点击添加好友按钮
			$('#iwindFriendBox').on('click', '.add-state', function () {
				opLog.setLog('', $(this).data('addstatus'));
				//如果添加状态是false，表示还未添加到右边，此时可以进行添加或修改操作
				if ($(this).data('addstatus') == false) {
					//数据层改变
					var uid = $(this).data('uid').toString();
					$.each(callbackData, function (i, val) {
						$.each(val.userList, function (i, v) {
							if (uid == v.userID) {
								this.addstatus = true;
							}
						})
					});
					//改变文字，改变状态标记，改变鼠标样式
					$(this).text('已添加')
						.css({
							'cursor': 'auto'
						});
					//编辑按钮隐藏
					$(this).siblings('.fri-info-edit').find('img').css('display', 'none');
					//右边多一个好友
					self.renderRightFri(callbackData);
				}
			});

			//右边，删除邀请好友，删除后，左边好友状态相应改变，显示已经添加数目，
			//tip：动态dom，要事件委托，不可事件绑定
			$('#ivtFriBox').on('click', '.icon-del', function () {
				opLog.setLog('', $(this).data('deluid'));
				//拿到uid，找到uid的对象，删除这个对象成员
				var uid = $(this).data('deluid').toString();
				$.each(callbackData, function (i, val) {
					$.each(val.userList, function (i, v) {
						if (uid == v.userID) {
							this.addstatus = false;
							// ivtedCount--;
						}
					});
				});
				//渲染右侧好友
				self.renderRightFri(callbackData);
				//右边参会嘉宾数目改变
				$('#ivtedNum').text(ivtedCount);
				//左边好友的选中图片相应改变
				$('.iwind-friend-box > li span[data-uid = "' + uid + '"]').html('<img src="img/m2.png">');
				//左边好友 data 选中状态改变
				$('.iwind-friend-box > li span[data-uid = "' + uid + '"]')
				// .data('addstatus', false)
					.css({
						cursor: 'pointer'
					});
				//左边好友的编辑图标相应改变
				$('.iwind-friend-box > li span[data-uid = "' + uid + '"]')
					.siblings('.fri-info-edit').find('img')
				// .data('addstatus', false)
					.css('display', 'inline-block');
			});

			//点击确定后传输数据
			$('#confirmBtn').on('click', function () {
				//一组数据显示在input中，只有人名
				var displayNameArr = [];
				//如果没有选嘉宾直接点击确定，就直接隐藏弹窗，并且return
				if (isObjectEmpty(sendFriObj)) {
					$('.float-div').fadeOut(300);
					return;
				}
				$.each(sendFriObj.list, function (i, v) {
					displayNameArr.push(v.userName);
				});
				var displayNameStr = displayNameArr.join('、');
				$('#ivtInput').attr('value', displayNameStr);
				// //完事，关闭对话框
				$('.float-div').fadeOut(300);
			});
		},
		//接收一个userID，返回一个callbackData中相应userID的对象
		getContactObjByUID: function (uid, handler) {
			//handler: 找到这个对象后相应的操作。 1： 删除 2: 更新
			var obj = {};
			$.each(callbackData, function (i, val) {
				$.each(val.userList, function (j, v) {
					if (uid == v.userID) {
						if (handler == 1) {
							// callbackData[i].userList.splice(j + 1, 1);
							val.userList.removeByValue(v);
							opLog.setLog('', callbackData);
							return false;
						} else {
							obj = v;
							return false;
						}
					}
				});
			});
			var crmid = JSON.parse(sessionStorage.getItem('userinfo')).crmId;
			obj.crmId = crmid;
			return obj;
		},
		//对比两个对象中的键值,obj1需要对比的obj，obj2完整的源obj
		compareObj: function (obj1, obj2, handler) {
			var count = 0;
			for (var k in obj1) {
				if (obj1[k] != obj2[k]) {
					if (handler) {
						//如果不同，那么源数据中也做相应更改
						obj2[k] = obj1[k];
					}
					count++;
				}
			}
			if (count == 0) {
				return true;
			} else {
				return false;
			}
		},
		insertToObj: function (obj, data) {

			//取得obj中的首字母，如果是汉字，就是汉字首字母，英文就是英文的首字母
			if (CheckChinese(obj.userName)) {
				//是汉字，用pinyin.js获得首字母
				var alpha = pinyin.getCamelChars(obj.userName).charAt(0);
			} else {
				//不是汉字，取第一个字符
				var alpha = obj.userName.charAt(0).toUpperCase();
			}
			//obj中取得的首字母与data中的key对比，如果相同，插入到该字母userlist中的第一项
			var isEqual = false;
			$.each(data, function (i, v) {
				if (alpha === v.key) {
					opLog.setLog(alpha, v.key);
					v.userList.unshift(obj);
					isEqual = true;
				}
			});
			//如果添加的人首字母在当前列表中找不到，那么自行添加进去，放在相应的位置
			if (!isEqual) {
				var tempObj = {
					key: alpha,
					userList: [obj]
				};
				//如果已经有好友
				if (data.length > 0) {
					$.each(data, function (i, v) {
						if (tempObj.key < v.key) {
							//放在这个key的前面
							data.splice(i, 0, tempObj);
							return false;
						}
					});
				} else {
					//如果没有好友，是个空列表，直接push
					data.push(tempObj);
				}

			}

		},
		//左侧好友渲染
		renderLeftFri: function (data) {
			if (!data) {
				return false;
			}
			var handleData = {
				// count: count,
				list: data
			}
			opLog.setLog('左侧好友渲染: ', handleData);
			var contactListInfo = template('contactListInfo', handleData);
			$('#iwindFriendBox').html(contactListInfo);
		},
		//右侧好友渲染
		renderRightFri: function (data) {
			if (!data) {
				return false;
			}
			var renderArray = [];
			$.each(data, function (i, val) {
				$.each(val.userList, function (i, v) {
					if (this.addstatus == true) {
						renderArray.push(this);
					}
				});
			});
			var handleData = {
				list: renderArray
			};
			sendFriObj = handleData;
			ivtedCount = renderArray.length;
			opLog.setLog('右侧好友渲染: ', handleData);
			$('#ivtedNum').text(ivtedCount);
			var ivtFri = template('ivtFri', handleData);
			$('#ivtFriBox').html(ivtFri);
		},
		//处理获取到的联系人数据，不可通用
		handleContactList: function (data) {

			var uid = 0;
			var count = 0;
			if (!data) {
				return false;
			}
			for (var i = 0; i < data.length; i++) {
				for (var j = 0; j < data[i].userList.length; j++) {
					//userID是用于区分用户的唯一字段
					//如果联系人列表中没有这个字段，则加上一个临时userID
					if (data[i].userList[j].userID == null || data[i].userList[j].userID == "null" || data[i].userList[j].userID == undefined || !data[i].userList[j].userID) {
						data[i].userList[j].userID = 'tempUID' + uid;
						uid++;
					}
					//addstatus是添加状态的标记
					data[i].userList[j].addstatus = false;
					//如果值是"null"或者null，替换为空字符串
					for (var k in data[i].userList[j]) {
						if (data[i].userList[j][k] === 'null' || data[i].userList[j][k] === null) {
							data[i].userList[j][k] = '';
						}
					}
				}
				count += data[i].userList.length;
			}
			opLog.setLog('处理后的联系人数据: ', data);
			opLog.setLog('处理后的联系人数据数目: ', count);
			return data;
		},
		//搜索好友封装
		searchFriend: function (val) {
			var searchData = [];
			var searchUserList = [];
			for (var i = 0; i < callbackData.length; i++) {
				for (var j = 0; j < callbackData[i].userList.length; j++) {
					//精确搜索
					//if (callbackData[i].userList[j].userName == $(this).val()) {
					//console.log(callbackData[i].userList[j].userName.indexOf($(this).val()));
					if (callbackData[i].userList[j].userName.indexOf(val) != -1) {
						searchUserList.push(callbackData[i].userList[j]);
					}
				}
			}
			searchData.push({
				// key: callbackData[i].key,
				userList: searchUserList
			});
			this.renderLeftFri(searchData);
		},
		//首字母速查
		alphaCheck: function (callbackdata) {
			if (callbackdata) {
				var strArr = [];
				var str = '';
				for (var i = 0; i < callbackdata.length; i++) {
					if (/^[0-9]/.test(callbackdata[i].key)) {
						callbackdata[i].key = "#";
					}
					strArr.push(callbackdata[i].key);
				}
				var strArrUnique = strArr.unique();
				$.each(strArrUnique, function (i, v) {
					str +=  '<li>' + v + '</li>';
				});
				$('#alphaIndex').html('<li>全</li>' + str);
			}
		},
		//---------------------左右栏切换结束---------------------
		//渲染不同公会或私会
		renderConf: function (state) {
			if (state === 'PUBLIC') {
				var publicConf = template('publicConf');
				$('.conf-area').html(publicConf);
				//jquery.datetimepicker插件使用方法，日期时间选择组件
				$('.some_class').datetimepicker({
					// format:"Y-m-d H:i:s",
					// timepicker:false
					lang: 'ch',
					minDate: '-1970/01/01',
					step: 10
				});
			} else if (state === 'PRIVATE') {
				var privateConf = template('privateConf');
				$('.conf-area').html(privateConf);
				//jquery.datetimepicker插件使用方法，日期时间选择组件
				$('.some_class').datetimepicker({
					// format:"Y-m-d H:i:s",
					// timepicker:false
					lang: 'ch',
					minDate: '-1970/01/01',
					step: 10
				});
			}
		},
		//创建会议
		createConf: function (obj, url) {
			url = url || (host + 'createNewMeeting.json');
			console.log(obj);
			$.ajax({
				url: url,
				type: 'POST',
				data: JSON.stringify(obj),
				dataType: 'json',
				headers: {'Content-Type': 'application/json'},
				timeout: 15000,
				beforeSend: function () {
					delayDiv(true);
				},
				complete: function (xhr, status) {
					delayDiv(false);
					if (status == 'timeout') {
						layer.msg("请求超时。请稍后尝试重新刷新页面。");
					}
				},
				success: function (data) {
					delayDiv(false);
					isSubmit = true;
					opLog.setLog('', data);
					if (state == 'PUBLIC') {
						// layer.msg('会议创建成功！请等待3C平台审核，工作日审核时间为2小时。3秒后跳转到首页。', 3000);
						layer.alert('会议创建成功！请等待3C平台审核，工作日审核时间为2小时。3秒后跳转到首页。', {
							time: 3000,
							title: ' ',
							btn: ['去首页'],
							success: function (layero, index) {
								setTimeout(function () {
									window.location.href = 'index.html';
								}, 3000);
							}
						},function () {
							window.location.href = 'index.html';
						});
					} else if (state == 'PRIVATE') {
						// layer.msg('会议创建成功！3秒后跳转到首页。', 3000);
						layer.alert('会议创建成功！3秒后跳转到首页。', {
							time: 3000,
							title: ' ',
							btn: ['去首页'],
							success: function (layero, index) {
								setTimeout(function () {
									window.location.href = 'index.html';
								}, 3000);
							},
						},function () {
							window.location.href = 'index.html';
						});
					}
					setTimeout(function () {
						window.location.href = 'index.html';
					}, 3000);
				},
				error: function (error) {
					delayDiv(false);
					if (error.readyState == 4 && error.status == 500) {
						layer.msg('服务器状态异常，发起会议失败。');
					} else if (error.readyState == 4 && error.status == 500 && error.errorCode == 1029) {
						layer.msg('会议开始时间最快应该在当前时间的15分钟以后，请检查本机时间，并重新选择日期.');
					}
					opLog.setLog('', error);
				}
			});
		},
		//发送好友的信息,接收一个参数，好友信息模型
		sendUserInfo: function (friData) {
			opLog.setLog('接收到的对象： ', friData);
			var sendUserInfoArr = [];
			$.each(friData.list, function (i, v) {
				opLog.setLog(i, v);
				var sendUserPro = new Object();
				sendUserPro.id = v.userID;
				sendUserPro.imId = v.iMID;
				sendUserPro.name = v.userName;
				sendUserPro.phoneNum = v.mobilePhone;
				sendUserPro.email = v.email;
				sendUserInfoArr.push(sendUserPro);
			});
			opLog.setLog('发送好友信息： ', sendUserInfoArr);
			return sendUserInfoArr;
		},
		handlerContacts: function (type, contactData, fn1, fn2) {
			if (type == 1) {
				//创建联系人
				var distUrl = 'createContact.json';
			} else if (type == 2) {
				//编辑联系人
				var distUrl = 'editContact.json';
			} else if (type == 3) {
				//删除联系人
				var distUrl = 'deleteContact.json';
			}

			$.ajax({
				url: host + distUrl,
				type: 'POST',
				data: JSON.stringify(contactData),
				dataType: 'json',
				headers: {'Content-Type': 'application/json'},
				timeout: 15000,
				beforeSend: function () {

				},
				complete: function (xhr, status) {
					if (status == 'timeout') {
						layer.msg("请求超时。");
					}
				},
				success: function (data) {
					if (fn1) {
						fn1(data);
					}
					opLog.setLog('', data);
				},
				error: function (error) {
					opLog.setLog('', error);
					if (fn2) {
						fn2();
					}
				}
			});
		}
	};
	createConfPageFunc.init();
});

