var mask, maskState = false;
var cnt_line, cnt_meeting;
var currStep = 1;
var imagePath = "../resource/images/default/";
var datalist,datalistAgain;
var contactList = []; //选中的联系人
var adminNum = 0;
var applierObj;
var resourcelist =[];
var startDate = null;
var startTime = null;
var endTime = null;
var title = null;
var meetingContent = null;
var w1, isShow = false;
var peerPageSetting = { PageIndex: 1, PageSize: 8 };
var pagetext = "显示{begin} - {end}&nbsp;&nbsp;&nbsp;共{count}条记录";
var imUserList="";
var recreateMeeting=0;
var memberList=[];

function initCurrentLine() {
    startDate = $V("startDate");
    startTime = $V("startDate") + ' ' + $V("startTime");
    endTime = $V("startDate") + ' ' + $V("endTime");
    var msg = CheckDate(startDate, startTime, endTime)
    if (msg != "") {
        cnt_line = 0;
        $("cntLine").innerHTML = cnt_line;
    } else invokeLineAjax();
}


function invokeLineAjax() {
    var parameterArray = new Array(startTime, endTime);
    var dataParameters = { MethodAlias: "GetLineCount", Parameter: parameterArray };
    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: renderLineResult, onError: showErrorHandle });
}


function invokeCurrentuserAjax() {
    var parameterArray = new Array($("HIMUserID").value,1);
    var dataParameters = { MethodAlias: "FindContact", Parameter: parameterArray };

    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: renderCurrentUserResult, onError: showErrorHandle });
}


function renderLineResult(xmlhttp) {
    var result = xmlhttp.responseText.toJSON();
    if (result != null && result != "") {
        if (result.State == 0) {
            if (result.Data != null && result.Data != "") {
                var val = result.Data.toJSON();
                if (val.length > 0) {
                    cnt_line = maxOnlineNum - (val[0].Cnt + val[0].Mnt * obligateNum) - 1; //规定时间内总在线人数不能超过150
                    cnt_meeting = maxMeetingNum - val[0].Mnt; //规定时间内总会议数量不能超过24
                }
                else cnt_line = val;
                cnt_line = cnt_line < 0 ? 0 : cnt_line;
                $("cntLine").innerHTML = cnt_line;
            }
            else {
            }
        } else {
        }
    }
}


function renderCurrentUserResult(xmlhttp) {
    var result = xmlhttp.responseText.toJSON();
    if (result != null && result != "") {
        if (result.State == 0) {
            if (result.Data != null && result.Data != "") {
                var val = result.Data;
                userCompany = replaceLtAndGt(val.Company);
                if(type!="createAgain")
                {
                    contactList = [{ InternalUserId: $("HIMUserID").value, Email: val.IMUserMailAlias, ContactName: val.IMUserName, Company: val.Company, TelMobile: val.Telephone, ContactUserID: loginUserID}];
                    applierObj = contactList[0];
                }
                else
                {
                    applierObj=[{ InternalUserId: $("HIMUserID").value, Email: val.IMUserMailAlias, ContactName: val.IMUserName, Company: val.Company, TelMobile: val.Telephone, ContactUserID: loginUserID}];
                    applierObj=applierObj[0];
                }
                //initData();
            }
            else {
            }
        } else {
            alert(result.ErrorMessage);
            alertW.DataBind('alertWin', { title: '', content: result.ErrorMessage });
        }
    }
}

//Ajax请求失败后的回调，用于输出错误信息
function showErrorHandle(xmlhttp) {

    var mes = "操作过程中发生了错误，请联系管理员! \r\n 错误代码:  " + xmlhttp.status;
    if ((xmlhttp.status + "").substr(0, 3) == "500") {
        showAlertWin('',"您好，由于网络原因导致请求失败，请您稍后再试！");
        //writeErrorLog(mes);
    }
    else {
        showAlertWin('',mes);
    }
}


function Right_Click() {
    switch (currStep) {
        case 1:
            if (baseInfoCheck()) {
                showContactList();
                currStep++;
            }
            break;
        case 2:
            var cl = frames[1].getContacts();
            if (cl.length <= 0) {
                showAlertWin('', "私人会议至少选择一个与会者！");
                return;
            }

            showConfirmInfo();
            initContactList(cl);
            initDataCtrl();
            currStep++;
            break;
        case 3:

            addMeeting_Apply();
            break;
    }
}


function Left_Click() {
    switch (currStep) {
        case 1:
            closeAlertWin();
            break;
        case 2:
            showBaseInfo();
            currStep--;
            break;
        case 3:
            showContactList();
            currStep--;
            break;
    }
}


//step by step跳转调用
function initContactList(val) {
    contactList = [];
    if(typeof(applierObj)!="undefined"  && type!="createAgain")
    {
         contactList.push(applierObj);
    }   
    var tempList = [];
    if (val != "") {
        var result = val;
        var userID;
        var contact;
        for (var i = 0; i < result.length; i++) {
           
           if(result[i].ID)
           {    //说明是通过终端获取联系人。
                if (result[i].ID.toString().indexOf('_') >= 0)
                {
                     userID = 0;
                }
                else
                {
                     userID = result[i].ID;
                }
                contact = { InternalUserId: userID, Email: result[i].Email, ContactName: result[i].Name, Company: result[i].Company, TelMobile: result[i].Mobile, ContactUserID: result[i].ID };
                tempList.push(contact);
           }
           else
           {
                //说明是通过后台获取的会议的联系人。                 
                var internalId=0;
                var contactId="0";
                if(result[i].MemberUserID.length<10)
                {
                    internalId=result[i].MemberUserID;
                }
                else
                {
                    contactId=result[i].MemberUserID;
                }                    
                contact = { InternalUserId: internalId, Email: result[i].UserEmail, ContactName: result[i].MemberUserName, Company: result[i].CompanyName, TelMobile: result[i].UserPhone, ContactUserID: contactId,MeetingRole:result[i].MeetingRole };
                tempList.push(contact);
                
           }
            
        }
        for (var i = 0; i < tempList.length; i++) {
            if(contactList.ContactUserID!=tempList[i].ContactUserID)
            {
                contactList.push(tempList[i]);
            }
        }      
    } 
}



function showBaseInfo() {
    $("Step1").className = "step1_focus";
    $("Step2").className = "step2";
    $("Step3").className = "step3";
    $("BaseInfo").style.display = "block";
    $("content").style.height = "170px";
    $("HeaderTip").style.display = "block";
    $("ContactList").style.display = "none";
    $("btnLeft").className = "btnCancel";
    $("SelectListTR").style.display = "none";
    $("btnRight").className = "btnNext";
}

function showContactList() {
    $("Step1").className = "step1";
    $("Step2").className = "step2_focus";
    $("Step3").className = "step3";
    $("BaseInfo").style.display = "none";
    $("SelectListTR").style.display = "block";
    $("HeaderTip").style.display = "none";
    $("ContactList").style.display = "block";
    $("btnLeft").className = "btnPre";
    $("btnRight").className = "btnNext";
    //如果是重新发起且是第一次的话，初始化列表
    if(memberList.length>0 &&  recreateMeeting==1)
    {   
        window.frames["iChoose"].initJoinMemberList(memberList);   
    }
    recreateMeeting=0; 
}

function showConfirmInfo() {
    $("Step1").className = "step1";
    $("Step2").className = "step2";
    $("Step3").className = "step3_focus";
    $("ContactList").style.display = "none";
    $("BaseInfo").style.display = "block";
    $("content").style.height = "60px";
    $("HeaderTip").style.display = "none";
    $("SelectListTR").style.display = "";
    $("btnLeft").className = "btnPre";
    $("btnRight").className = "btnConfirm";
    
}


function baseInfoCheck() {
    //检查标题内容
    var reg = /\+/g; //创建正则RegExp对象
    var reg2 = /\&/g; //创建正则RegExp对象
    title = $V("title").trim().trim("　").replace(reg, "%2B").replace(reg2, "%26");
    meetingContent = $V("content").trim().trim("　").replace(reg, "%2B").replace(reg2, "%26");
    
    checkInfo(title, "title");//检查标题

    if (!flag) return false; //检查时间
    //检查选择日期
    var msg = "";
    startDate = $V("startDate");
    startTime = startDate + ' ' + $V("startTime");
    endTime = startDate + ' ' + $V("endTime");
    msg = CheckDate(startDate, startTime, endTime);
    if (msg != "") {
        showAlertWin("", msg);
        return false
    };

    checkInfo(meetingContent, "content"); //检查内容
    if (!flag) return false;

    return true;
}


function checkInfo(input, ctrl) {
    flag = true;
    if (ctrl == "title" && input == '') {
        $(ctrl).value = "";
        $(ctrl).focus();
        showAlertWin("", '标题不能为空！');
        flag = false; 
         return;
    }
    else if (ctrl == "content" && input == '') {
        $(ctrl).value = "";
        $(ctrl).focus();
        showAlertWin("", '会议内容不能为空！');
        //alertW.DataBind('alertWin', { title: '', content: '会议内容不能为空！' });
        flag = false; 
         return;
    }
}


//发起会议
function addMeeting_Apply() {
    if (!baseInfoCheck())
        return;

    initCurrentLine();
    if (cnt_line <= 0) {
        showAlertWin("", '该时间段内无空余席位，请重新选择时间段！');
        return;
    }

    adminNum = 0;
    memberLists = GetMemberList();
    if (memberLists.length > cnt_line) {
        showAlertWin("", '与会者人数超出当前空余席位数！');
        return;
    }
    if (memberLists.length < 2) {
        showAlertWin("", '与会者人数至少有两位！');
        return;
    }
    if (adminNum == 0) {
        showAlertWin("", '管理员数量至少为1个！');
        return;
    }
    if (adminNum > 2) {
        showAlertWin("", '管理员数量最多只能为2个！');
        return;
    }
    

    showMask();
    frames["ifmUpLoad"].upload();
}

function addMeetingUpload(msg, val, errCode) {


    if (errCode == "1") {
        setResources(val);
        var jsonParams = GetMeetingInfo(); 
        if (jsonParams == false)
            return;

        var cmd = "{Func:\"3CCreation\"}";
        var groupid = 0;
        var userid = 0;
        try {
            cmd = window.external.ClientFunc(cmd);

            var temp = cmd.toJSON();


            imUserList = temp.groupinfo;

            var imuserlistobj = imUserList.toJSON();
            groupid = imuserlistobj.GroupId;
            userid = imuserlistobj.LoginUserId;

        } catch (err) {
            groupid = 0;
            userid = 0;
        }
        var parameterArray = new Array(JSON2.stringify(jsonParams), 0, groupid, userid);

        AjaxInvoke("CreateWMMeeting", parameterArray);//JavaChu修改


        
    }
    else if (errCode == "0") { hideMask(); showAlertWin("", '暂不支持此浏览器！'); return; }
    else { hideMask(); showAlertWin("", msg);  return; }
}


function setResources(val) {
    if (val != "") {
        var result = val.toJSON();
        var contact;
        for (var i = 0; i < result.length; i++) {
            contact = { ResourceName: MyDeCode(result[i].ResourceName), ResourceType: result[i].ResourceType, ResourceURL: MyDeCode(result[i].ResourceURL) };
            resourcelist.push(contact);
        }
    }
}

function addMeetingNoUpload() {
    var jsonParams = GetMeetingInfo();
    if (jsonParams == false)
        return;


    var cmd = "{Func:\"3CCreation\"}";
    var groupid = 0;
    var userid = 0;
    try {
        cmd = window.external.ClientFunc(cmd);

        var temp = cmd.toJSON();


        imUserList = temp.groupinfo;

        var imuserlistobj = imUserList.toJSON();
        groupid = imuserlistobj.GroupId;
        userid = imuserlistobj.LoginUserId;
       
    } catch (err) {
        groupid = 0;
        userid = 0;
    }
    var parameterArray = new Array(JSON2.stringify(jsonParams), 0, groupid, userid);

    AjaxInvoke("CreateWMMeeting", parameterArray);

}


function AjaxInvoke(method, parameterArray) {

    var dataParameters = { MethodAlias: method, Parameter: parameterArray };
    Ajax.Request({ url: "AjaxSecureHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: renderCreateMeetingResult, onError: showErrorHandle });
}



function GetMeetingInfo() {
    var isOpen = false;//私人会议
    var resourceLists = resourcelist;

    var userID = $("HIMUserID").value; //myInteralUserID; //$v("CurrentUserId");//TODO UserID 和 bookname获取
    var bookerName = userCompany;
    var meetingStatus =  2 //私人为通过，公开为申请
    //公开会议的线路数依据输入的值为准。私有会议的线路数为邀请的具体人数。
    var lines = memberLists.length;
    var applyPerson = applierObj.ContactName;
    var applyCompany = applierObj.Company;
    var isShare=$("chk_share").checked ? 1:0;
    var dataParameters = { MeetingTitle: title, MeetingStartTime: startTime, MeetingEndTime: endTime, MeetingContent: meetingContent, IsOpen: isOpen, MeetingLine: lines, MeetingStatus: meetingStatus, MeetingBookerName: bookerName, UserID: userID, MCLists: memberLists, ResourceLists: resourceLists, ContactLists: contactList, MeetingApplyPerson: applyPerson, MeetingApplyCompany: applyCompany,W08UserID:w08UserID,IsShare:isShare}
    return dataParameters;
}


function renderCreateMeetingResult(xmlhttp) {
    var result = xmlhttp.responseText.toJSON();
    if (result != null && result != "") {
        data = result.Data;
        if (result.State == 0) {
            if (result.Data != null && result.Data != "") {
                hideMask();
                showAlertWinWithCallBack("", "申请会议成功，通知已发给邀请者!");
                try {
                    var cmd = "{Func:\"3CCreateSucc\"}";
                    cmd = window.external.ClientFunc(cmd);
                 } catch (err)
                { }

                //window.opener.getMeetingList(1);
            }
            else {
                hideMask();
                showAlertWin("", '您的申请提交失败！');
            }
        } else {
            showAlertWin("", '您的申请提交失败！');
            hideMask();
        }
    }
}


function GetMemberList() {
    var members = [];
    var myDate = new Date();
    var logindate = myDate.format("yyyy-MM-dd");
    var memberRole, userid;
    for (var i = 0; i < contactList.length; i++) {
        memberRole = setRole(i);
        if (memberRole == 1) adminNum++;
        userid = contactList[i].InternalUserId == 0 ? contactList[i].ContactUserID : contactList[i].InternalUserId;
        members.push({ MeetingRole: memberRole, MeetingPWD: "", UserID: userid, MemberType: "1", MemberName: contactList[i].ContactName, MemberCompany: contactList[i].Company, CreateTime: logindate, IsSendMsg: false, ScheduleID: 0, IsSentEmail: false });
    } //TODO MeetingRole取值3为旁听者，UserID为联系人列表ID，MemberType 1来自申请
    return members;
}


function setRole(rowIndex) {
    var obj = document.getElementsByName('selRole');
    return obj[rowIndex].value;
}

function initDataCtrl() {
  var datalistHeader = [
        { header: "姓名", width: "16%", align: 'center', sortable: false, dataIndex: "ContactName", textAlign: 'left', index: 1 },
        { header: "公司", width: "47%", align: 'center', sortable: false, dataIndex: "Company", textAlign: 'left', index: 2 },
        { header: "会议角色", width: "24%", align: "center", sortable: false, dataIndex: "ContactName", renderer: inviteContact, textAlign: 'left', index: 3 },
        { header: "", width: "13%", align: "center", sortable: false, dataIndex: "ContactName", renderer: inviteDel, textAlign: 'center', index: 4 }
    ];
    
    datalist = new Wind.UI.Datalist2(
        {
            width: "100%",           
            unlockheaders: datalistHeader,
            imagePath: imagePath + "datalist/",
            renderTo: "SelectList",
            isClickSelect: false,
            isEnableAlternating: true,
            isMouseoverSelect: false,
            appendbutton: [],
            emptyText: "无与会者！",
            pageSetting: null
        });
        
        datalist.DataBind(contactList, null);
        ReSizeDataList();
    }
    
function initDataCtrlAgain() {
	
    var datalistHeader2 = [      
        { header: "姓名", width: "16%", align: 'center', sortable: false, dataIndex: "ContactName", textAlign: 'left', index: 1 },
        { header: "公司", width: "47%", align: 'center', sortable: false, dataIndex: "Company", textAlign: 'left', index: 2 },
        { header: "会议角色", width: "24%", align: "center", sortable: false, dataIndex: "MeetingRole", renderer: setRoleList, textAlign: 'left', index: 3 },
        { header: "", width: "13%", align: "center", sortable: false, dataIndex: "MemberName", renderer: inviteDel, textAlign: 'center', index: 4 }
    ];
    datalistAgain = new Wind.UI.Datalist2(
        {
            width: "100%",           
            unlockheaders: datalistHeader2,
            imagePath: imagePath + "datalist/",
            renderTo: "SelectList",
            isClickSelect: false,
            isEnableAlternating: true,
            isMouseoverSelect: false,
            appendbutton: [],
            emptyText: "无与会者！",
            pageSetting: null
        });
        datalistAgain.DataBind(contactList, null);
        ReSizeDataList();
}
function ReSizeDataList() {
    $("SelectList_unlockheaderstable").style.width = "100%";
    $("SelectList_unlockbody").style.height = ($("SelectListTR").style.pixelHeight-25)+"px";
    $("SelectList_unlockbody").style.overflowX = "hidden";
    $("SelectList_unlockbody").style.overflowY = "auto";
    $("SelectList").style.height = "100%";
    $("SelectList_unlockheaders").style.borderBottomColor = "#a7abac";        

}

function delPerson(rowIndex) {
        contactList.splice(rowIndex, 1);
        initDataCtrl();
    }

function ImportMeeting() {
    showContactWindow();
}

function inviteContact(rowIndex) {
    if (rowIndex > 0) return "<select id='selRole' style='z-index:5; width:100px' name='selRole'><option value='1'>管理员</option><option value='3' selected>参与者</option></select>";
    return "<select id='selRole' style='z-index:5; width:100px' name='selRole'><option value='1' selected>管理员</option><option value='3'>参与者</option></select>";
}

function setRoleList(index) {
    var meetingRole=datalistAgain.dataSource[index].MeetingRole;
    if(meetingRole==1)
    {
          return "<select id='selRole' style='z-index:5; width:100px' name='selRole'><option value='1' selected>管理员</option><option value='3'>参与者</option></select>";
    }
    else
    {
          return "<select id='selRole' style='z-index:5; width:100px' name='selRole'><option value='1' >管理员</option><option value='3' selected>参与者</option></select>";
    }
}

function showCalendar(ctrl, strMode) {
    Wind.UI.Calendar.show({ input: ctrl, lang: "cn", exp: "yyyy-mm-dd", mode: strMode, onselect: initCurrentLine, clickToday: initCurrentLine });
}

//时间设置
function showTime(ctrl) {
    selectedTimeCtrl = ctrl;
    CalendarTime.show({ input: ctrl, lang: "cn", exp: "yyyy-mm-dd", mode: "time", onselect: setTimeAndInitLine });
}

function setTimeAndInitLine() {

    if (selectedTimeCtrl == "startTime") {
        var startTimeS = $V("startDate") + ' ' + $V("startTime");
        var endTimeS = (new Date(startTimeS.replace(/-/g, "/"))).DateAdd("h", 1).format("hh:mm");
        $("endTime").value = endTimeS
    }

    initCurrentLine();

}

function showAlertWin(title, msg) {
    var alertWClose = new AlertDialog(null);
    alertWClose.DataBind('alertWin_Home', { title: title, content: msg });
}

function showAlertWinWithCallBack(title, msg) {
    var alertWClose = new AlertDialog(closeAlertWin);
    alertWClose.DataBind('alertWin_Home', { title: title, content: msg });
}

function showAskWin(title, msg, callbackFun) {
    var askWin = new AlertDialog(callbackFun);
    askWin.DataBind('alertWin_Home', { title: title, content: msg }, 2);
}

function showError(msg) {
    showAlertWin("", msg);
}

function showMask() {
    mask.showWait(document.body);
    maskState = true;
}

function hideMask() {
    if (maskState == true)
        mask.hideWait();
}


//展现我的联系人窗体
function showContactWindow() {//type:0 添加；1：编辑
    if (!w1) {
        var t = {};
        t.width = 755;
        t.height = 335;
        t.imagePath = "../resource/images/default/";
        t.isreflashable = false;
        t.ismaxable = false;
        t.isshowclose = true;
        t.isresizeable = false;
        t.isdragable = true;
        t.ismask = true;
        t.isscroll = false;
        t.onclose = disposeWin;
        t.title = '我发起的私人会议列表';
        t.mode = "iframe";
        t.url = "MyPrivateMeeting.aspx";
        
        w1 = new Wind.UI.Window(t);
    }
    w1.show();
    isShow = true;

}

function disposeWin() {
    if (w1) {
        w1.close();
        w1.dispose();
        w1 = null;
        isShow = false;
    }
}
function liability(focus)
{
   var content="会议资料一经提交，代表该资料著作权人同意该资料所有内容通过Wind资讯渠道传播给相关会议所有参会人。该资料所引述机构或个人的观点、言论、数据及其他信息仅作参考和资讯传播之目的，不代表万得信息赞同其观点或证实其描述。"
   var div_Statement=$("div_Statement");
   if(focus==1)
   {
      div_Statement.innerHTML=content;
      div_Statement.style.display="";
   }
   else
   {       
      div_Statement.style.display="none";
      div_Statement.innerHTML="";
   }
}
   
//查询会议的成员列表
function invokeMemberListAjax(pageIndex) { 
    temp=0;
    var myStatus=-1;
    var parameterArray = new Array(meetingid);
    var dataParameters = { MethodAlias: "GetMeetingMembers", Parameter: parameterArray };

    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: renderMemberList, onError: showErrorHandle });
}
function renderMemberList(xmlhttp) {

    var result = xmlhttp.responseText.toJSON();
    if (result  && result.Data ) {
            
        memberList=result.Data.meetingList;
        recreateMeeting=1;    
        initContactList(memberList);
        initDataCtrlAgain();
    }  
}

//读取会议内容
function readConferenceDetails()
{
    var meetingCond={MeetingID:meetingid,UserID:$V("HIMUserID")};    
    var parameterArray = new Array(JSON2.stringify(meetingCond));   
    var dataParameters = { MethodAlias: "GetOneJoinedMeeting", Parameter: parameterArray };
    
    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: setDetail, onError: showErrorHandle });
  
}

function setDetail(xmlhttp)
{ 
    var result = xmlhttp.responseText.toJSON();
    if (result && result.Data) 
    {
        result=result.Data;
        var MeetingContent=replaceBracket(TransferSpecialChar(result.MeetingContent));       
        $("title").value=TransferSpecialChar(result.MeetingTitle); 
        $("content").innerHTML= MeetingContent
     
     }
}