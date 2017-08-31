var startDate = null;
var startTime = null;
var endTime = null;
var commendStartTime1 = null;
var commendEndTime1 = null;
var commendStartTime2 = null;
var commendEndTime2 = null;
var commendStartTime3 = null;
var commendEndTime3 = null;
var resourcelist;
var contactList,applierObj;
var memberLists=[];
var commend1=false;
var commend2=false;
var commend3=false;
var commend4=false;
var commend5=false;
var commend6=false;
var setTimeType=0;
var setTimeType2=0;
var commendStartTime;
var commendEndTime;

function initCurrentLine(){   
    startDate=$V("startDate");
    startTime=$V("startDate")+' '+$V("startTime");
    endTime=$V("startDate")+' '+$V("endTime");
    setTimeType=0;
    commend1=false;
    commend2=false;
    commend3=false;
    $("div_commend").style.display="none";
    var msg =CheckDate(startDate,startTime,endTime)
    if(msg!=""){        
        $("cnt_pub").innerHTML=0;     
    }else invokeLineAjax(startTime,endTime);   
}

function invokeLineAjax(startTime,endTime){
    var parameterArray = new Array(startTime, endTime);
    var dataParameters = { MethodAlias: "GetLineCount", Parameter: parameterArray };
    
    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: renderLineResult, onError: showErrorHandle });
}

function renderLineResult(xmlhttp) {
    var result = xmlhttp.responseText.toJSON();
    if (result  && result.Data ) {
        var val=result.Data.toJSON();
        if(val.length>0){
            cnt_line = maxOnlineNum - (val[0].Cnt+val[0].Mnt*obligateNum) - 1; //规定时间内总在线人数不能超过150
            cnt_meeting = maxMeetingNum - val[0].Mnt; //规定时间内总会议数量不能超过24
        }
        else cnt_line = val;
        cnt_line = cnt_line < 0 ? 0 : cnt_line;
        if(setTimeType==0)
        {
             $("cnt_pub").innerHTML = cnt_line;
        }
        
        //进入推荐逻辑
       if(setTimeType==0  && cnt_line==0 )
       {
            $("lb_day").innerHTML=startDate+"&nbsp;&nbsp;"+$V("startTime");
            $("lb_endTime").innerHTML=$V("endTime");            
          
            //推荐第一个时间段
            setTimeType=1;
            
           commendStartTime= getDataTime(startTime);
           commendEndTime= getDataTime(endTime)
            
           commendTime(commendStartTime,commendEndTime);           
       }
       else if(setTimeType==1 && cnt_line>0)
       {
            //记下第一次推荐的时间
            $("lb_time1").innerHTML=commendStartTime1.format("yyyy-MM-dd hh:mm")+"-"+commendEndTime1.format("hh:mm");
            $("lb_count1").innerHTML=cnt_line;       
            commend1=true; 
            //第二次推荐
            setTimeType=2;
            commendTime1(commendStartTime1,commendEndTime1);
       }
       else if(setTimeType==1 && cnt_line==0)
       {
            //继续第一次推荐
            commendTime(commendStartTime1,commendEndTime1);  
       }
       if(setTimeType==2  && cnt_line==0)
       {
           //继续第二次推荐
           commendTime1(commendStartTime2,commendEndTime2);
       }
       else if(setTimeType==2  && cnt_line>0)
       {
            //记下第二次推荐的时间
            $("lb_time2").innerHTML=commendStartTime2.format("yyyy-MM-dd hh:mm")+"-"+commendEndTime2.format("hh:mm");
            $("lb_count2").innerHTML=cnt_line;      
            commend2=true;
            setTimeType=3;           
            commendTime2(commendStartTime,commendEndTime);
       }
       if(setTimeType==3  && cnt_line==0)
       {
           //第三次推荐
           commendTime2(commendStartTime3,commendEndTime3);
       }
       else if(setTimeType==3  && cnt_line>0)
       {
            //记下第三次推荐的时间
            $("lb_time3").innerHTML=commendStartTime3.format("yyyy-MM-dd hh:mm")+"-"+commendEndTime3.format("hh:mm");
            $("lb_count3").innerHTML=cnt_line;      
            commend3=true;
       }
       if(commend1 && commend2 && commend3)
       {
            //都推荐出来后，显示推荐框
            $("div_commend").style.display="";
       }
    }
}


//Ajax请求失败后的回调，用于输出错误信息
function showErrorHandle(xmlhttp) {  
    var mes= "操作过程中发生了错误，请联系管理员! \r\n 错误代码:  "+ xmlhttp.status;
    if((xmlhttp.status+"").substr(0,3)=="500")
    {       
        showAlertWin("", "您好，由于网络原因导致请求失败，请您稍后再试！"); 
    }
    else
    {       
        showAlertWin("", mes); 
    } 
}

function setDefaultTime() {
    if(new Date().getHours() > 21) {
        $("startDate").value = new Date().DateAdd("d",1).format("yyyy-MM-dd");
        $("startTime").value="00:30";
        $("endTime").value="01:30"; 
    }
    else{
        $("startDate").value = new Date().format("yyyy-MM-dd");
        if(new Date().getMinutes()>=30){
            $("startTime").value=new Date().DateAdd("h",1).format("hh:30");
            $("endTime").value=new Date().DateAdd("h",2).format("hh:30");
        }else{
            $("startTime").value=new Date().DateAdd("h",1).format("hh:00");
            $("endTime").value=new Date().DateAdd("h",2).format("hh:00");
        }
        
    }
}
//设置控件的日期
function showCalendar(ctrl,type) {
    setTimeType=type;
    Wind.UI.Calendar.show({ input: ctrl, lang: "cn", exp: "yyyy-mm-dd", mode: "default",onselect: initCurrentLine, clickToday: initCurrentLine });
}
function CheckDate(startDate,startTime,endTime){ 
    var msg="",min=30;  
    
    if(startDate=="" || startTime=="" || endTime=="")
    {
        msg='请输入会议时间！'; return msg;
    }
     
    if (new Date(startDate.replace(/-/g, "/")) < new Date(new Date().format("yyyy, MM, dd").replace(/,/g, "/"))) {
        msg='日期不能小于今天！'; return msg;
    }
    if (new Date(startTime.replace(/-/g, "/")).getTime() <= new Date().getTime()) {
        msg= '开始时间不能小于当前时间！' ;
        return msg;
    } 
    if (new Date(startTime.replace(/-/g, "/")).getTime() <= new Date().DateAdd("n",min).getTime()) {
        msg= '当前时间必须早于开始时间前'+min+'分钟！' ;
        return msg;
    }    
    if (new Date(endTime.replace(/-/g, "/")).getTime() <= new Date(startTime.replace(/-/g, "/")).getTime()) {
        msg= '结束时间不能小于等于开始时间' ;
        return msg;
    }

    if (new Date(startDate.replace(/-/g, "/")) < new Date("1754/1/1") || new Date(startDate.replace(/-/g, "/")) > new Date("9998/1/1")) {
        msg = '日期必须介于1754/1/1和9998/1/1之间';
        return msg;
    }
    
    return msg;
}

//设置控件的时间
function showTime(ctrl,type) {
    selectedTimeCtrl = ctrl;
    setTimeType=type;
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


//父页面调用发起会议
function addMeeting_Apply() {
    if (!addMeeting_PreCheck())
        return

    initCurrentLine();
    if (cnt_line <= 0) {
        showAlertWin("", '该时间段内无空余席位，请重新选择时间段！');
        return;
    }    
  
    showMask();
    frames["ifmUpLoad"].upload();    

}

function addMeeting_PreCheck() {
    //检查标题内容
    var reg = /\+/g; //创建正则RegExp对象
    var reg2 = /\&/g; //创建正则RegExp对象
    title = $V("title").trim().replace(reg, "%2B").replace(reg2, "%26");
    meetingContent = $V("content").trim().replace(reg, "%2B").replace(reg2, "%26");
    checkInfo(title, "title");
    if (!flag) return false;
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
  
    //公开会议检查
    memberCount = $V("memberCount");
    if (memberCount == "") {
        $("memberCount").focus();
        $("memberCount").value = "";
        showAlertWin("", '会议人数不能为空，请输入会议人数且数目大于等于2！'); 
        return false;
    }
    var reNum = /^\d*$/;
    if (!reNum.test(memberCount) || memberCount == 0 || memberCount == 1) {
        $("memberCount").focus();
        $("memberCount").value = "";
        showAlertWin("", '会议人数输入有误，必须是大于等于2的整数！'); 
        return false; 
    }
    if (memberCount > parseInt($V("cnt_pub"))) {
        showAlertWin("", "选定的人数超出空余席位数"); 
        return false
    }
    
    checkInfo(meetingContent, "content");
    if (!flag) return false;
    
    
    return true;
}
function showAlertWin(title, msg) {
    var alertWClose = new AlertDialog(null);
    alertWClose.DataBind('alertWin', { title: title, content: msg });
}

function checkInfo(input,ctrl){ 
    flag=true;
    var len=GetStrLen(input);
    if (ctrl == "title" && input == '') {
        $(ctrl).value = "";
        $(ctrl).focus();
        showAlertWin("", '标题不能为空！');        
        flag= false;
        return;
    }
    else if(ctrl == "title"  &&  len>60)
    {
        showAlertWin("", '标题内容过长，请重新输入！');   
        flag= false;
        return;   
    }
    if (ctrl == "content" && input == '') {
        $(ctrl).value="";
        $(ctrl).focus();
        showAlertWin("", '会议内容不能为空！');       
        flag= false;
        return;
    }
    else if(ctrl == "content"  &&  len>2000)
    {
        showAlertWin("", '会议内容过长，请重新输入！');   
        flag= false;
        return;   
    }
}

/***从url中获取参数***/
function getQueryString(name) {
    var sReg = "[\\?\\&]({0})=([^\\&]+)";
    var reg = new RegExp(sReg.format(name));
    var match = location.search.match(reg);
    if (match != null) {
        var result = match[2];
        return result;
    }
    return null;
}


function addMeetingUpload(msg,val,errCode) { 
    if(errCode=="1"){            
        setResources(val);
        var jsonParams = GetMeetingInfo();//公共会议
        if (jsonParams == false)
            return;
        var parameterArray = new Array(JSON2.stringify(jsonParams), getQueryString("ITEMID"), getQueryString("PRODUCTID"));

        AjaxInvoke("CreateMarketMeeting", parameterArray);
           
        
    }
    else if (errCode == "0") { hideMask(); showAlertWin("", '暂不支持此浏览器！');return; }
    else { hideMask(); showAlertWin("", msg);return; }
}
function addMeetingNoUpload() { 
    var jsonParams = GetMeetingInfo();//公共会议
    if (jsonParams == false)
        return;
    var parameterArray = new Array(JSON2.stringify(jsonParams), getQueryString("ITEMID"), getQueryString("PRODUCTID"));
   
    AjaxInvoke("CreateMarketMeeting", parameterArray);
    
   
}
function AjaxInvoke(method, parameterArray) {
    var dataParameters = { MethodAlias: method, Parameter: parameterArray };
    Ajax.Request({ url: "AjaxSecureHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: renderCreateMeetingResult, onError: showErrorHandle });
}


function renderCreateMeetingResult(xmlhttp) {    
    var result = xmlhttp.responseText.toJSON();
    if (result != null && result != "") {
        data = result.Data;
        if (result.State == 0) {
            if (result.Data != null && result.Data != "") {
                hideMask();                                    
                msgOk="您的申请已提交，待系统审核通过后发布。"             
                var alertWClose2 = new AlertDialog(closePage);
                alertWClose2.DataBind('alertWin', {title:"", content: msgOk });
            }
            else {
                hideMask();  
                showAlertWin("", '您的申请提交失败！');                 
            }
        } else {
                hideMask();
            }
    }
    
}

function closePage()
{    
    window.close();
}

function setResources(val) {
    if (val != "") {
        var result = val.toJSON();
        var contact;
        for (var i = 0; i < result.length; i++) {
           contact = {ResourceName:MyDeCode(result[i].ResourceName),ResourceType:result[i].ResourceType,ResourceURL:MyDeCode(result[i].ResourceURL)};
           resourcelist.push(contact);
        }
    }
}
function showMask() {
    mask.showWait(document.body);
}

function hideMask() {   
    mask.hideWait();
}
function GetMeetingInfo() {
    var isOpen =true;    
    var resourceLists = GetResourceList();
    
    var userID = myIMUserId;
    var bookerName = userCompany;
    var meetingStatus =0;
    //公开会议的线路数依据输入的值为准。
    var lines=memberCount;
    var applyPerson = applierObj.ContactName;
    var applyCompany = applierObj.Company;
    var limitCompanys=$("txt_limitCompany").value=="请选择禁止参会的行业！" ? "":$("txt_limitCompany").value;
    var memberLists=[];
    var Limit=limitCompanys.length>0? 1 :0;
    var isShare=$("chk_share").checked ? 1:0;
    var dataParameters = { MeetingTitle: title, MeetingStartTime: startTime, MeetingEndTime: endTime, MeetingContent: meetingContent, IsOpen: isOpen, MeetingLine: lines, MeetingStatus: meetingStatus, MeetingBookerName: bookerName, UserID: userID, MCLists: memberLists, ResourceLists: resourceLists, ContactLists: contactList, MeetingApplyPerson: applyPerson, MeetingApplyCompany: applyCompany,JoinLimit:Limit,LimitCompany:limitCompanys,IsShare:isShare }
    return dataParameters;
}
function invokeCurrentuserAjax() {  
    var parameterArray = new Array(myIMUserId,1);
    var dataParameters = { MethodAlias: "FindContact", Parameter: parameterArray };

    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: renderCurrentUserResult, onError: showErrorHandle });
}
function renderCurrentUserResult(xmlhttp) {
    var result = xmlhttp.responseText.toJSON();
    if (result != null && result != "") {
        if (result.State == 0) {
            if (result.Data != null && result.Data != "") {
                var val = result.Data;
                userCompany = replaceLtAndGt(val.Company);
                contactList = [{ InternalUserId: myIMUserId, Email: val.IMUserMailAlias, ContactName: val.IMUserName, Company: val.Company, TelMobile: val.Telephone, ContactUserID: loginUserID }];            
                applierObj = contactList[0];
               
            }
            else {
            }
        } else {         
            showAlertWin("",result.ErrorMessage);
        }
    }
}
function GetResourceList() {
    var resources = [];
    resources = resourcelist;
    return resources;
}

function GetMemberList() {
    var members = [];
    var myDate = new Date();
    var logindate = myDate.format("yyyy-MM-dd");    
    userid=myIMUserId;
    members.push({ MeetingRole: 2, MeetingPWD: "", UserID: userid, MemberType: "1", MemberName: contactList[0].ContactName, MemberCompany: contactList[0].Company, CreateTime: logindate, IsSendMsg: false, ScheduleID: 0, IsSentEmail: false });
    return members;
}

function showError(msg)
{
    showAlertWin("", msg);        
}
   function copyRight(focus)
   {
       var content="会议纪要或会议记录将在终端显示，万得信息声明拥有、保留会议纪要、录音及其他衍生信息之版权，同时声明上述信息未经万得信息书面授权不得传播，如有任何问题请致信<span style=' color:#065db6; font-family:Arial;'>3C@wind.com.cn</span>。"
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
   function liability(focus)
   {
       var content="会议资料一经提交，代表该资料著作权人同意该资料所有内容通过Wind资讯渠道进行对外传播。该资料所引述机构或个人的观点、言论、数据及其他信息仅作参考和资讯传播之目的，不代表万得信息赞同其观点或证实其描述。"
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

function openLimitCompany()
{
     var limitCompany=$V("txt_limitCompany");
     openWindows("../3CV2/LimitCompanyList.htm?limitCompanyType="+limitCompany, 550, 240,"",169,143);
}

function setLimitCompany(LimitCompanys)
{
    $("txt_limitCompany").value=LimitCompanys;
    closeListWin();
}

function closeLimitCompanyList()
{
     closeListWin();
}

function commendTime(commendStartTime,commendEndTime)
{    
    //获取用户输入的时间。然后在这个基础上往后延长半小时。
    
    commendStartTime1= commendStartTime.DateAdd("h",0.5);
    commendEndTime1= commendEndTime.DateAdd("h",0.5);
    
    //获取一个当天的下午6点的时间点，因为推荐的时间点不能晚于6点。如果晚于6点，就从第二天9点开始继续推荐。
    var AppointTime=getAppointTime(commendStartTime1);
   
    if(commendStartTime1>=AppointTime)
    {
       var diff=parseInt((commendEndTime1-commendStartTime1)/3600000);
       commendStartTime1= getAppointTime2(commendStartTime1);        
       commendEndTime1=commendStartTime1.DateAdd("h",diff);       
    }
    
    if(setTimeType2>0)
    {
        invokeLineAjax2(commendStartTime1.format("yyyy-MM-dd hh:mm"),commendEndTime1.format("yyyy-MM-dd hh:mm"));
    }
    else
    {
        invokeLineAjax(commendStartTime1.format("yyyy-MM-dd hh:mm"),commendEndTime1.format("yyyy-MM-dd hh:mm"));
    }
    
}

function commendTime1()
{    
    //获取用户输入的时间。然后在这个基础上往后延长半小时。    

    commendStartTime2=commendStartTime1.DateAdd("h",0.5);
    commendEndTime2=commendEndTime1.DateAdd("h",0.5);
   
    var AppointTime=getAppointTime(commendStartTime2);
    if(commendStartTime2>=AppointTime)
    {
       var diff=parseInt((commendEndTime2-commendStartTime2)/3600000);
       commendStartTime2= getAppointTime2(commendStartTime2);        
       commendEndTime2=commendStartTime2.DateAdd("h",diff);       
    }
   
    if(setTimeType2>0)
    {
         invokeLineAjax2(commendStartTime2.format("yyyy-MM-dd hh:mm"),commendEndTime2.format("yyyy-MM-dd hh:mm"));
    }
    else
    {
         invokeLineAjax(commendStartTime2.format("yyyy-MM-dd hh:mm"),commendEndTime2.format("yyyy-MM-dd hh:mm"));
    }
}

function commendTime2(commendStartTime,commendEndTime)
{    
    //获取用户输入的时间。然后在这个基础上往后延长半小时。    

    commendStartTime3=commendStartTime.DateAdd("h",24);
    commendEndTime3=commendEndTime.DateAdd("h",24);
    
    var AppointTime=getAppointTime(commendStartTime3);
    if(commendStartTime3>=AppointTime)
    {
       var diff=parseInt((commendEndTime3-commendStartTime3)/3600000);
       commendStartTime3= getAppointTime2(commendStartTime3);        
       commendEndTime3=commendStartTime3.DateAdd("h",diff);       
    }
    
    if(setTimeType2>0)
    {
         invokeLineAjax2(commendStartTime3.format("yyyy-MM-dd hh:mm"),commendEndTime3.format("yyyy-MM-dd hh:mm"));
    }
    else
    {
        invokeLineAjax(commendStartTime3.format("yyyy-MM-dd hh:mm"),commendEndTime3.format("yyyy-MM-dd hh:mm"));
    }
}

function setCommendTime()
{
    var date;
    if($("radio1").checked)
    {
      date=getDataTime($V("lb_time1"));
    }
    else if($("radio2").checked)
    {
        date=getDataTime($V("lb_time2"));
    }
    else if($("radio3").checked)
    {
        date=getDataTime($V("lb_time3"));
    }
    $("startDate").value=date.format("yyyy-MM-dd");
    $("startTime").value=date.format("hh:mm");
    $("endTime").value=date.DateAdd("h",1).format("hh:mm");
    initCurrentLine();
}


function getDataTime(strTime)
{
    var year=strTime.substr(0,4);
    var month=parseInt(strTime.substr(5,2)-1);
    var day=strTime.substr(8,2);
    var HH=strTime.substr(11,2);
    var MM=strTime.substr(14,2);
    
    return new Date(year,month,day,HH,MM);
}

function getAppointTime(Time)
{
    var year=Time.getFullYear();
    var month=Time.getMonth();
    var day=Time.getDate();    
    
    return new Date(year,month,day,18,0);
}

function getAppointTime2(Time)
{
    var year=Time.getFullYear();
    var month=Time.getMonth();
    var day=Time.getDate()+1;
    
    return new Date(year,month,day,9,0);
}

function cannelCommend(){
   $("div_commend").style.display="none";
}

function checkMemberCount()
{
    var memberCount=parseInt($V("memberCount")=="" ? 0:$V("memberCount"));
    var hasMember=parseInt($V("cnt_pub"));
    setTimeType2=0;
    if (memberCount>hasMember && memberCount<maxOnlineNum)
    { 
         invokeLineAjax2(startTime,endTime);   
    }
}


function invokeLineAjax2(startTime,endTime){
    var parameterArray = new Array(startTime, endTime);
    var dataParameters = { MethodAlias: "GetLineCount", Parameter: parameterArray };
    
    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: renderLineResult2, onError: showErrorHandle });
}

function renderLineResult2(xmlhttp) {
    var result = xmlhttp.responseText.toJSON();
    if (result  && result.Data ) {
        var val=result.Data.toJSON();
        if(val.length>0){
            cnt_line = maxOnlineNum - (val[0].Cnt+val[0].Mnt*obligateNum) - 1; //规定时间内总在线人数不能超过150
            cnt_meeting = maxMeetingNum - val[0].Mnt; //规定时间内总会议数量不能超过24
        }
        else cnt_line = val;
        cnt_line = cnt_line < 0 ? 0 : cnt_line;
     
        
        var inputCount= parseInt($V("memberCount"));
        
        //进入推荐逻辑
       if(setTimeType2==0  && inputCount<maxOnlineNum && cnt_line<inputCount)
       {
            $("lb_day").innerHTML=startDate+"&nbsp;&nbsp;"+$V("startTime");
            $("lb_endTime").innerHTML=$V("endTime");            
          
            //推荐第一个时间段
            setTimeType2=1;
            
           commendStartTime= getDataTime(startTime);
           commendEndTime= getDataTime(endTime)
            
           commendTime(commendStartTime,commendEndTime);   
           return;        
       }
       else if(setTimeType2==1 && cnt_line>=inputCount)
       {
            //记下第一次推荐的时间
            $("lb_time1").innerHTML=commendStartTime1.format("yyyy-MM-dd hh:mm")+"-"+commendEndTime1.format("hh:mm");
            $("lb_count1").innerHTML=cnt_line;       
            commend4=true; 
            //第二次推荐
            setTimeType2=2;
            commendTime1(commendStartTime1,commendEndTime1);
            return;     
       }
       else if(setTimeType2==1 && cnt_line<inputCount)
       {
            //继续第一次推荐
            commendTime(commendStartTime1,commendEndTime1);  
            return;     
       }
       
       
       if(setTimeType2==2  && cnt_line<inputCount)
       {
           //继续第二次推荐
           commendTime1(commendStartTime2,commendEndTime2);
           return;     
       }
       else if(setTimeType2==2  && cnt_line>=inputCount)
       {
            //记下第二次推荐的时间
            $("lb_time2").innerHTML=commendStartTime2.format("yyyy-MM-dd hh:mm")+"-"+commendEndTime2.format("hh:mm");
            $("lb_count2").innerHTML=cnt_line;      
            commend5=true;
            setTimeType2=3;           
            commendTime2(commendStartTime,commendEndTime);
            return;     
       }
       
       
       if(setTimeType2==3  && cnt_line<inputCount)
       {
           //第三次推荐
           commendTime2(commendStartTime3,commendEndTime3);
           return;     
       }
       else if(setTimeType2==3  && cnt_line>=inputCount)
       {
            //记下第三次推荐的时间
            $("lb_time3").innerHTML=commendStartTime3.format("yyyy-MM-dd hh:mm")+"-"+commendEndTime3.format("hh:mm");
            $("lb_count3").innerHTML=cnt_line;      
            commend6=true;
       }
       
       if(commend4 && commend5 && commend6)
       {
            //都推荐出来后，显示推荐框
            $("div_commend").style.display="";
       }
    }
}
