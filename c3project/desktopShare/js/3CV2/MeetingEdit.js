var CurMeeting=
{
    MeetingID:"",
    MeetingTitle:"",
    MeetingStartTime:"",
    MeetingEndTime:"",
    MeetingBookerName:"",
    MeetingLine:"",
    IsOpen:"",
    MeetingContent:"", 
    isCancel:false,
    CreateUser:"",
    NewMeetingLine:"",
    CurrentDay:""
};

var isCancelMeeting=false;
var oldMemberListCount=0;
var contactList=[];
var djCount=0;
var memberList=null;
var isCanncelMeeting=false;

var myIMUserID="";
var maxOnlineNum="";
var obligateNum="";
var publicDJCount="";
var loginAccount="";
var pageSize=20;
var pageIndex=1;
var pageIndex2=1;
var resourcelist=[];
var manageLogList;
var flag;
var mask;


var temp;
var startDate = null;
var startTime = null;
var endTime = null;

var datalistHeader = [ [
        { header: "姓名", width: '16%', align: 'left', sortable: false, dataIndex: "MemberName", textAlign: 'left', index: 1 },
        { header: "会议角色", width: '17%', align: "center",  sortable: false, dataIndex:"MeetingRole", renderer: inviteContact, textAlign: 'center',index: 2 },
        { header: "通知", width: '10%', align: "center",  sortable: false, dataIndex:"MemberName", renderer: sendNotice, textAlign: 'center', index: 6 },
        { header: "删除", width: '10%', align: "center",  sortable: false, dataIndex:"MemberName", renderer: delMember, textAlign: 'center', index: 6 }
        
    ]];   
    
var datalistHeader2 = [ [
        { header: "姓名", width: '16%', align: 'left', sortable: false, dataIndex: "MemberName", textAlign: 'left', index: 1 },
        { header: "会议角色", width: '17%', align: "center",  sortable: false, dataIndex:"MeetingRole", renderer: inviteContact, textAlign: 'center',index: 2 },
        { header: "参会状态", width: '10%', align: "center",  sortable: false, dataIndex:"MyStatus", renderer: rendStatus, textAlign: 'center', index: 3 },
        { header: "进入时间", width: '10%', align: "center",  sortable: false, dataIndex:"CallTime", renderer: rendCallTime, textAlign: 'center', index: 4 }
        
    ]];   
    
function rendStatus(rowIndex)
{
   var MyStatus = datalist.dataSource[rowIndex].MyStatus; 
   return MyStatus==3? "参加":"未参加";
}  
function rendCallTime(rowIndex)
{
   var CallTime = datalist.dataSource[rowIndex].CallTime;
   if(CallTime!=null) 
   {
         return  JSON2.dateFormat(CallTime, "hh:mm");
   }
   else
   {
      return "";
   }
  
}  
function inviteContact(rowIndex) 
{
    var MeetingRole = datalist.dataSource[rowIndex].MeetingRole; 
    var returnValue="";
    if(oldMemberListCount<=rowIndex)
    {
        //新增的成员，可以修改会议角色
        switch(MeetingRole)
        {
            case 1:
                returnValue="<select id='selRole' style='z-index:5;' name='selRole'><option value='1' selected>管理员</option><option value='3' >参与者</option></select>";
                break;
            case 3:
                returnValue="<select id='selRole' style='z-index:5;' name='selRole' ><option value='1'>管理员</option><option value='3' selected>参与者</option></select>";
                break;
            case 4:
                returnValue="<select id='selRole' style='z-index:5;' name='selRole'><option value='1'>管理员</option><option value='3' >参与者</option></select>";
                break;
        }
    }
    else
    {
        //说明是以前存在的,所以不能编辑
        switch(MeetingRole)
        {
            case 1:
                returnValue="<select id='selRole' style='z-index:5;' name='selRole' disabled='disabled'><option value='1' selected>管理员</option><option value='3' >参与者</option></select>";
                break;
            case 3:
                returnValue="<select id='selRole' style='z-index:5;' name='selRole' disabled='disabled'><option value='1'>管理员</option><option value='3' selected>参与者</option></select>";
                break;
            case 4:
                returnValue="<select id='selRole' style='z-index:5;' name='selRole' disabled='disabled'><option value='1'>管理员</option><option value='3' >参与者</option></select>";
                break;
        }
    }
  
    return returnValue;     
}
function delMember(rowIndex)
{    
   var delMem
   
   if(isCanncelMeeting)
   {
       delMem="<input class='w_buttonA' type='button' disabled='disabled';   title='删除该人员'  value='删除'></input>";
   } 
   else
   {
       //判断是否是发起人自己，如果是，则不显示删除按钮。
       var memberUserId= datalist.dataSource[rowIndex].UserID+"";        
       //由于123456_llll的用parseInt会变成123456，所以转换之前先判断位数，以免联系人也算成自己。
       if(memberUserId.length==8)
       {
            memberUserId=parseInt(memberUserId);
       }
       if(isCanncelMeeting)
       {
          return "<input class='w_buttonA' type='button' disabled='disabled';   title='不能删除发起人'  value='删除'></input>";
       }
        //如果结束的会议及取消的会议不能操作
       var endTime=CurMeeting.MeetingEndTime;
       var msg=compareTime(endTime);
       if (msg != "")
       {
           return "<input class='w_buttonA' type='button' disabled='disabled';   title='不能删除发起人'  value='删除'></input>";
       }
                 
       if(myIMUserID!=memberUserId) 
       {
            delMem="<input class='w_buttonA' type='button'  title='删除该人员' onclick='(function(rowIndex){return (function (){delMemberByID(rowIndex)})()})("+rowIndex+")' value='删除'></input>";
       }
       else
       {
           delMem="<input class='w_buttonA' type='button' disabled='disabled';   title='不能删除发起人'  value='删除'></input>";
       }   
      
   }   
    return delMem;
}

function compareTime(time)
{
     if (new Date(endTime.replace(/-/g, "/")).getTime() <= new Date().getTime()) 
     {
         return  "所传时间比当前时间小" ; 
     }
     else
     {
       return "";
     }
}

function delMemberByID(rowIndex)
{
    if(isCancel)
    {
        return; 
    }    
    var userID = datalist.dataSource[rowIndex].UserID; 
    var MemberName = datalist.dataSource[rowIndex].MemberName; 
    var UserEmail= datalist.dataSource[rowIndex].UserEmail; 
    if(userID==null)
    {
        //这样的情况一般是还没保存好友。不用提交到数据库
        var IMUserId=datalist.dataSource[rowIndex].IMUserId;
        if(IMUserId!=null)
        {
             //从datalist中删除就可以了。             
             
             var newContactList=[];
             for(var i=0;i<contactList.length;i++)
             {
                var imUserId=contactList[i].IMUserId;
                if(imUserId!=IMUserId)
                {
                    newContactList.push(contactList[i]);
                }
             }             
             $("div_MemberList").style.height="215px";                
             datalist.DataBind(newContactList);
             contactList=newContactList;
        }        
        return;
    }
    //从数据库中删除该人员
    if(!confirm("是否删除参会者："+MemberName))
    {
        return;
    }
    var parameterArray = new Array(userID,CurMeeting.MeetingID);   
    var dataParameters = { MethodAlias: "DeleteMeetingMember", Parameter: parameterArray };    
    maskDetail.showWaitOnTarget("form1"); 
    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: returndelMember, onError: showErrorHandle });

    
}
function returndelMember(xmlhttp)
{
    hideWaitMask();
    if(xmlhttp && xmlhttp.responseText.toJSON().Data==true)
    {        
        invokeMemberListAjax(pageIndex);
        alertDialog.DataBind('alertWin', {title: '', content: "删除成功！"} );
        updateMeetingLine(CurMeeting.NewMeetingLine-1);
    }
    else
    {
        alertDialog.DataBind('alertWin', {title: '', content: "删除参会人员失败！"} );
    }
}
function sendNotice(rowIndex) 
{    
   var strNotice;
  //如果结束的会议及取消的会议不能操作  
   var endTime=CurMeeting.MeetingEndTime;
   var msg=compareTime(endTime);
   if (msg != "")
   {
        return "<input class='w_buttonA' type='button' disabled='disabled'; title='重新发送通知' onclick='(function(rowIndex){return (function (){sendEmail(rowIndex)})()})("+rowIndex+")' value='通知'></input>";
   }
   if(isCanncelMeeting)
   {
   
       strNotice="<input class='w_buttonA' type='button' disabled='disabled'; title='重新发送通知' onclick='(function(rowIndex){return (function (){sendEmail(rowIndex)})()})("+rowIndex+")' value='通知'></input>";
   } 
   else
   {
       strNotice="<input class='w_buttonA' type='button'  title='重新发送通知' onclick='(function(rowIndex){return (function (){sendEmail(rowIndex)})()})("+rowIndex+")' value='通知'></input>";
   }
    
    return strNotice;
}
//重新发送邮件
function sendEmail(rowIndex)
{
    //发送邮件前需先判断会议是否取消，取消的就不能再发邮件了
    if(isCancel)
    {
        return; 
    }    
    //获取每个人的UserID;到业务层再找到他们的Email，然后发送邮件。
    var userID = datalist.dataSource[rowIndex].UserID; 
    if(userID==null)
    {
        //这样的情况一般是还没保存好友就开始发送短信。
        if(datalist.dataSource[rowIndex].IMUserId!=null)
        {
            alertDialog.DataBind('alertWin', {title: '', content: "如果还没保存邀请的好友，请先保存后再使用重发邮件功能！"} );
        }
        else
        {
            alertDialog.DataBind('alertWin', {title: '', content: "获取数据失败，重发邮件未能完成！"} );
        }
        return;
    }
    var role=datalist.dataSource[rowIndex].MeetingRole; 
    var MemberName=datalist.dataSource[rowIndex].MemberName; 
    var UserEmail=datalist.dataSource[rowIndex].UserEmail;     
    
    var parameterArray = new Array(userID,myIMUserID,role,$.Request("meetingId"));
    var dataParameters = { MethodAlias: "SendEmailToMember", Parameter: parameterArray };
    maskDetail.showWaitOnTarget("form1"); 
    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: returnSendEmail, onError: showErrorHandle });

}
function returnSendEmail(xmlhttp)
{
    hideWaitMask();
    if(xmlhttp && xmlhttp.responseText.toJSON().Data==true)
    {
        alertDialog.DataBind('alertWin', {title: '', content: "发送成功！"} );
    }
    else
    {
        alertDialog.DataBind('alertWin', {title: '', content: "发送失败！"} );
    }
}
function initCurrentLine(){   
     
    startDate=$V("startDate");
    startTime=$V("startDate")+' '+$V("startTime");
    endTime=$V("startDate")+' '+$V("endTime");
    getCurrentLine();  
}
function getCurrentLine(){   
    //时间存在才去计算
    if(!!startTime  && !!endTime)
    {
        var parameterArray = new Array(startTime,endTime);
        var dataParameters = { MethodAlias: "GetLineCount", Parameter: parameterArray };
        
        Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: renderLineResult, onError: showErrorHandle });
    }
}

function renderLineResult(xmlhttp) {
    var result = xmlhttp.responseText.toJSON();
    if (result != null && result != "") {
        if (result.State == 0) {
            if (result.Data != null && result.Data != "") {
                var val=result.Data.toJSON();
                if(val.length>0){
                    cnt_line = maxOnlineNum - (val[0].Cnt+val[0].Mnt*obligateNum) - 1; //规定时间内总在线人数不能超过150                   
                }
                else cnt_line=val;
                $("hid_leaveLines").value=cnt_line<0?0:cnt_line;              
            }
            else {
            }
        } else {
        }
    }   
}
//获取会议信息
function GetMeetingInfo() { 
    var bookerName = CurMeeting.MeetingBookerName;  
    var members=GetMemberList();   
    var dataParameters = { MeetingID: CurMeeting.MeetingID,MeetingTitle:CurMeeting.MeetingTitle, MeetingStartTime: CurMeeting.MeetingStartTime, MeetingEndTime: CurMeeting.MeetingEndTime, MeetingContent: CurMeeting.MeetingContent, IsOpen: CurMeeting.IsOpen, MeetingLine: CurMeeting.NewMeetingLine, MeetingStatus: 2, MeetingBookerName: bookerName, UserID: myIMUserID, MCLists:members, ResourceLists: [], ContactLists: newcCntactList }
    return dataParameters;
}
//得到会议成员列表：是新增成员
var newcCntactList=[];
function GetMemberList() { 
    var members = [];
    //djCount=temp; 
    djCount=0;   
    var myDate = new Date();
    var logindate =myDate.format("yyyy-MM-dd");
    var memberRole,userid;
    
    for (var i = oldMemberListCount; i < contactList.length; i++) {
        memberRole = setRole(i);
        if(memberRole==1) djCount++;
        userid=contactList[i].IMUserId;

        members.push({ MeetingRole: memberRole, MeetingPWD: "", UserID: userid, MemberType: "1", MemberName: contactList[i].MemberName, CreateTime: logindate, MemberCompany: contactList[i].MemberCompany, IsSendMsg: false, ScheduleID: 0,IsSentEmail:false});
        newcCntactList.push({ Email: contactList[i].UserEmail, ContactName: contactList[i].MemberName, Company: contactList[i].MemberCompany, TelMobile: contactList[i].UserPhone, ContactUserID: userid,UserID:userid });
    } //TODO MeetingRole取值3为旁听者，UserID为联系人列表ID，MemberType 1来自申请
    //oldMemberListCount=contactList.length;
    //更新会议的Line
    //如果还有足够的线路，允许添加会议成员
    var leaveLines=getLeaveLines();

    if(contactList.length>CurMeeting.MeetingLine)
    {
        CurMeeting.NewMeetingLine=contactList.length;
    }
    return members;
}
function setRole(rowIndex){
    var obj = document.getElementsByName('selRole'); 
    return obj[rowIndex].value;
}
//读取会议内容
function readConferenceDetails(meetingID)
{
    var meetingCond={MeetingID:meetingID,UserID:myIMUserID};    
    var parameterArray = new Array(JSON2.stringify(meetingCond));
    maskDetail = new Wind.UI.Mask(); 
    maskDetail.showWaitOnTarget("form1");    
    AjaxInvoke("GetOneJoinedMeeting",parameterArray,getConferenceDetail);  
  
}
//会议信息读取成功后进行赋值
function getConferenceDetail(xmlhttp)
{       
     var result=CommonAjaxComplete(xmlhttp);     
     setDetail(result); 
}
//一个用来处理ajax返回结果的通用处理过程，主要用来判断结果是否正确。
function CommonAjaxComplete(xmlhttp)
{    
    var result=xmlhttp.responseText.toJSON();    
    if(result.State==0)
    {
        if(result!=null && result!="")
        {            
            return result;            
        }
    }
    else if(result.ErrorMessage)
    {
       alertDialog.DataBind('alertWin', {title: '', content: result.ErrorMessage} );
    }   
}
function setDetail(result)
{ 
    if(result.Data)
    {
        result=result.Data;
        //表示该会议时我创建的，能修改该会议
        
        if(result && result.CreatorID)
        {
            if(parseInt($V("hid_IMUserId"))!=result.CreatorID)
            {
                //提示用户无权限进入该页面               
                hideWaitMask();
                document.write("您没有权限进入该页面！");
                return;
            }
        }        
        
        var beginTime=result.MeetingStartTime;
        var endTime=result.MeetingEndTime;
        var MeetingStatus=result.MeetingStatus;
        if(MeetingStatus==99)
        {           
            $("btn_cancelMeeting").disabled='disabled'; 
            $("btn_ModifyMeeting").disabled='disabled';
            $("div_invite").disabled='disabled';              
            $("div_invite").title="会议已被取消";
            isCanncelMeeting=true;                   
        }   
        else
        {
            var CancelHourLimit=$V("hid_CancelHourLimit");
            CancelHourLimit=CancelHourLimit==""? 1:parseInt(CancelHourLimit); 
            CancelHourLimit=CancelHourLimit*60;
            isCanEdit=compdate(beginTime,new Date(),CancelHourLimit)>0 ? false: true;
            //看该会议是否结束
            isEnded=compdate(endTime,new Date(),0)<0 ? false: true;
            if(isCanEdit)
            {
                $("div_invite").removeAttribute("disabled");                  
                $("div_invite").title=""; 
            }
            else if(isEnded==false)
            {            
               //表示已过正常修改时间：会议开始前1小时,但会议还没结束。 现在做的修改都需要进行标识，因为会议室可能已经创建。                
                $("div_invite").removeAttribute("disabled");
                $("btn_cancelMeeting").disabled='disabled';
                $("div_invite").title="";
                //这个时候不允许用于修改会议时间
                $("img_startDay").disabled='disabled'; 
                $("startTime").onclick=null; 
                $("startDate").onclick=null; 
                $("endTime").onclick=null; 
                $("btn_cancelMeeting").title="已过会议取消时间，只能在会议开始时间1小时以上才能取消会议。";
            }
            else if (isEnded==true)
            {
                //表示会议已经结束
                $("div_invite").style.display="none";
                $("btn_cancelMeeting").disabled='disabled';
                //这个时候不允许用于修改会议时间
                $("img_startDay").disabled='disabled'; 
                $("startTime").onclick=null; 
                $("endTime").onclick=null; 
                $("startDate").onclick=null; 
                $("btn_cancelMeeting").title="已过会议取消时间，只能在会议开始时间1小时以上才能取消会议。";
                
                
                //会议结束后，可以再次发起。
                $("btn_ModifyMeeting").style.display="none";
                $("btn_sendAgain").style.display="";
                
            }
        }            
        $("div_MemberList").show(); 
       
    }
    else
    {
        alertDialog.DataBind('alertWin', { title: '', content: "您没有权限修改该会议！" });
        //表示不能修改该会议       
        $("btn_cancelMeeting").disabled='disabled';
        $("btn_ModifyMeeting").disabled='disabled';
        $("div_MemberList").hide();         
        return ;
    }
    
    if(result)  
    {
        var MeetingContent=replaceBracket(TransferSpecialChar(result.MeetingContent));
        var MeetingTitle=TransferSpecialChar(result.MeetingTitle);   
         //读取会议详细信息       
         $("startDate").value=JSON2.dateFormat(result.MeetingStartTime,"yyyy-MM-dd");
         $("startTime").value=JSON2.dateFormat(result.MeetingStartTime,"hh:mm");
         $("endTime").value=JSON2.dateFormat(result.MeetingEndTime,"hh:mm");         
         $("txt_Title").value=MeetingTitle;
        
         if(result.MeetingBookerName==undefined || result.MeetingBookerName=="undefined")
         {
            $("lb_meetingBookName").innerHTML="";
         }
         else
         {
            $("lb_meetingBookName").innerHTML=replaceBracket(result.MeetingBookerName);
         }
         $("content").value=MeetingContent;
                        
         $("lb_roomNum").innerHTML=result.RoomNum;  
         $("lb_passWord").innerHTML=result.MeetingPWD;  
         document.title=MeetingTitle;
         CurMeeting.MeetingTitle=MeetingTitle;       
         isCancel=result.MeetingStatus==99? true:false;         
      
         CurMeeting.MeetingStartTime=JSON2.dateFormat(result.MeetingStartTime,"yyyy-MM-dd hh:mm:ss");
         CurMeeting.MeetingEndTime=JSON2.dateFormat(result.MeetingEndTime,"yyyy-MM-dd hh:mm:ss");
         refleshTime=result.MeetingStartTime;
         CurMeeting.MeetingID=result.MeetingID; 
         CurMeeting.MeetingContent=result.MeetingContent; 
         CurMeeting.MeetingLine=result.MeetingLine; 
         CurMeeting.NewMeetingLine=result.PersonCount; 
         CurMeeting.IsOpen=(result.IsOpen==0 ? true: false);
         CurMeeting.CreateUser=result.UserName; 
         CurMeeting.MeetingBookerName=result.MeetingBookerName; 
         CurMeeting.CurrentDay=JSON2.dateFormat(result.MeetingStartTime,"yyyy-MM-dd");      
         
         //查询当前时间剩余线路
         initCurrentLine();   
         initMembers();               

    }
    else
    {        
        $("startDate").value="";
        $("content").value="";  
        $("lb_meetingBookName").value="";               
    }
    hideWaitMask();
    
}

 var imagePath = "../resource/images/default/";
 
function initMembers() {
   var time=new Date();    
   var startDate=$V("startDate");
   var endTime=$V("startDate")+' '+$V("endTime");
   var month=parseInt(time.getMonth()+1)>=10? parseInt(time.getMonth()+1):"0"+parseInt(time.getMonth()+1); 
   var newEndTime= new Date( endTime.replace(/-/g, "/"));  
   if(time>newEndTime)
   {
        //结束的会议显示参会人的参会状态
       datalist=createDatalist();   
   }
   else
   {
       datalist=createDatalist2();   
   }
   invokeMemberListAjax(1); 
}

function createDatalist2()
{
       return new Wind.UI.Datalist2(
        {           
            height: 215,
            unlockheaders: datalistHeader,
            imagePath: imagePath + "datalist/",
            renderTo: "div_MemberList",
            isClickSelect: true,
            isEnableAlternating: true,
            pageSetting: null
        });
}

function createDatalist()
{
       return new Wind.UI.Datalist2(
        {           
            height: 215,
            unlockheaders: datalistHeader2,
            imagePath: imagePath + "datalist/",
            renderTo: "div_MemberList",
            isClickSelect: true,
            isEnableAlternating: true,
            pageSetting: null
        });
}

//查询会议的成员列表
function invokeMemberListAjax(pageIndex) { 
    temp=0;
    var myStatus=$("chk_Called").checked==true ? 3:-1;
    var parameterArray = new Array($.Request("meetingId"),myStatus);
    var dataParameters = { MethodAlias: "IwindMeetingMemberList", Parameter: parameterArray };

    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: renderMemberList, onError: showErrorHandle });
}
function renderMemberList(xmlhttp) {

    var result = xmlhttp.responseText.toJSON();
    if (result != null && result != "") {
        if (result.State == 0) {            
            if (result.Data != null && result.Data != "") {
                  memberList=result.Data.toJSON();
                  //把初始化的列表个数保存起来。
                  oldMemberListCount=memberList.length;
                  contactList=memberList;  
                  $("div_MemberList").style.height="215px";                                  
                  datalist.DataBind(memberList,null);  
                  $("div_MemberList_unlockheaders").style.borderBottomColor="#a7abac";
                  changeStyle();
                  computePublicDJCount(contactList); 
            }
            else {
                datalist.DataBind(eval("[]"), null);
            }
        } else {          
            alertDialog.DataBind('alertWin', { title: '', content: result.ErrorMessage });
        }
    }
    hideWaitMask();
}

//Ajax请求失败后的回调，用于输出错误信息
function showErrorHandle(xmlhttp) {   
    var mes= "操作过程中发生了错误，请联系管理员! \r\n 错误代码:  "+ xmlhttp.status;
    if((xmlhttp.status+"").substr(0,3)=="500")
    {
        alertDialog.DataBind('alertWin', {title: '', content: "您好，由于网络原因导致请求失败，请您稍后再试！"} );
        writeErrorLog(mes);
    }
    else
    {
        alertDialog.DataBind('alertWin', {title: '', content: mes} );   
    } 
}

//保存会议成员及会议资料(时间)
function saveMeetingMembers()
{
    var jsonParams = GetMeetingInfo();
    if (jsonParams && jsonParams.ContactLists.length==0)
    {      
      return;
    }
    //如果之前就有多个管理员，而新增的成员中没有管理员，也允许保存。这样可以兼容之前的。
    
    if(djCount>0 && (djCount+temp)>publicDJCount)
    {
        alertDialog.DataBind('alertWin', { title: '', content: '最多只能有'+publicDJCount+'个管理员！' });
        return;
    }   
    //私人会议至少一个管理员
    if(temp+djCount<1)
    {
        alertDialog.DataBind('alertWin', { title: '', content: '至少要有1个管理员！' });
        return;
    }    
    if(djCount>0 && (djCount+temp)>publicDJCount)
    {
        alertDialog.DataBind('alertWin', { title: '', content: '最多只能有'+publicDJCount+'个管理员！' });
        return;
    }  
    var parameterArray = new Array(JSON2.stringify(jsonParams));    
    var dataParameters = { MethodAlias: "addMeetingMembers", Parameter: parameterArray };
    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: saveMeetingMembersReturn, onError: showErrorHandle });
  
}
function saveMeetingMembersReturn(xmlhttp)
{
    if(xmlhttp && xmlhttp.responseText.toJSON().Data==true)
    {
        newcCntactList=[];    
        showAlertWin("", '保存信息成功！'); 
          
        initMembers();
        //保存成功后重新计算剩余线路数。
        initCurrentLine();        
    }
    else
    {
       hideWaitMask();
    }
}
/*添加新的邀请者,会多绑定一些信息到datalist，这样在保存的时候才能保存到，如Email等*/
var tempList = [];
function setContacts(val) {
    if (val != "") {
        var result = val;
        var userID;
        var contact;
        for (var i = 0; i < result.length; i++) {
            userID = result[i].ID;
            if (checkRepeat(result[i])) {
                contact = {MeetingRole:3,IMUserId: result[i].ID, UserEmail: result[i].Email, MemberName: result[i].Name, MemberCompany: result[i].Company,  UserPhone: result[i].Mobile };
                tempList.push(contact);
            }
        }  
        var leaveLines=getLeaveLines();      
        if (tempList.length + contactList.length > parseInt(leaveLines)) {  
                 
            var alt="会议人员已满，不能再邀请参会人员！";
            showAlertWin("", alt);        
            tempList = [];
            return;
        }
        else {
            for (var i = 0; i < tempList.length; i++) {
                contactList.push(tempList[i]);
            }
            if(tempList.length>0)
            {
                $("div_MemberList").style.height="215px"; 
                if($.Browse.IEVer()==6)
                {
                    $("div_MemberList").style.height="215px"; 
                }         
                tempList = [];  
                datalist.DataBind(contactList);
            }          
        }
    }
}
//检查是否有重复的人员:判断人员的UserID是否相同
function checkRepeat(result) {

    for (var i = 0; i < contactList.length; i++) {
        if (contactList[i].UserID == result.ID || contactList[i].IMUserId == result.ID)
            return false;
        else
            continue;
    }
    return true;
}
//计算会议管理员角色
function computePublicDJCount(list)
{
    for(var i=0;i<list.length;i++)
    {
         memberRole = setRole(i);
        if(memberRole==1)
        {
            temp++;
        } 
    }
    return ;
}

function inviteMember()
{
    openWindows("ContactChooseAdmin.aspx?openType=1&interUserID="+$V("hid_internalId")+"&imUserID="+$V("hid_IMUserId")+"",650,570);
}

function hideWaitMask()
{
    try
    {
        maskDetail.hideWaitOnTarget();
        mask.hideWait(); 
    }
    catch(e)
    {
        try
        {        
            mask.hideWait(); 
        }
        catch(e)
        {
            
        }    
    }  
}

window.onresize=function()
{
    try
    {
        if(datalist)
        {
            if(memberList.length>0)
            {
               
                 initDatalistAgain();
            }
        }
    }
    catch(e)
    {

    }
}

function initDatalistAgain()
{
    datalist=createDatalist2();
    $("div_MemberList").style.height="215px";    
    datalist.DataBind(contactList);  
    window.onresize=null;
}
function compdate(startTime, endTime,interval) 
{

    var yyyy=JSON2.dateFormat(startTime,"yyyy");
    var MM=JSON2.dateFormat(startTime,"MM");
    var dd=JSON2.dateFormat(startTime,"dd");
    var hh=JSON2.dateFormat(startTime,"hh");
    var mm=JSON2.dateFormat(startTime,"mm");
    var ss=JSON2.dateFormat(startTime,"ss");
    //因为会议开始前15分钟可以加入会议。
    startTime=new Date(yyyy,MM-1,dd,hh,(parseInt(mm)-parseInt(interval)),ss);
    startCount = startTime.getTime();
    endCount = endTime.getTime();   
    return endCount-startCount;
}
function IscancalMeeting(){
    
     alertDialog.DataBind('alertWin', { title: '', content: "你确定要取消该会议吗？" },2,cancalMeeting);
}
function cancalMeeting(){
 
    var parameterArray = new Array($.Request("meetingId"));
    var dataParameters = { MethodAlias: "CancelMeeting", Parameter: parameterArray }; 
    maskCancel = new Wind.UI.Mask();    
    maskCancel.showWaitOnTarget(form1);
    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: rendercancalMeeting, onError: showErrorHandle });

}

function rendercancalMeeting(xmlhttp) 
{
    var result = xmlhttp.responseText.toJSON();
    if (result != null && result != "")
    {
        if (result.State == 0)
        {
            alertDialog.DataBind('alertWin', { title: '', content: result.ErrorMessage },1);            
            $("btn_cancelMeeting").disabled='disabled'; 
            $("btn_ModifyMeeting").disabled='disabled';         
            $("div_invite").disabled='disabled';             
            $("div_invite").title="会议已被取消";                
            isCancel=true;       
            
             //刷新父页面
            try
            {
                if(window.parent)
                {
                     window.parent.getMeetingList(1);
                } 
            }
            catch(e)
            {
                
            }   
        }
        else
        {   
            alertDialog.DataBind('alertWin', { title: '', content: result.ErrorMessage },1);
        }         
    }
    try
    {        
        maskCancel.hideWait(); 
    }
    catch(e)
    {
        
    }       
}

function showAlertWin(title,msg) {
    var alert =  new AlertDialog(null);
    alert.DataBind('alertWin', { title: title, content: msg });
}

function showAskWin(title, msg, callbackFun) {
    var askWin = new AlertDialog(callbackFun);
    askWin.DataBind('alertWin', { title: title, content: msg},2);
}

function getLeaveLines()
{
    //如果设置成一个过去的时间，则不进行判断。
    //私人会议最多40人
    var returnValue=0;
    var time=new Date();    
    var month=parseInt(time.getMonth()+1)>=10? parseInt(time.getMonth()+1):"0"+parseInt(time.getMonth()+1);
    var nowTime=parseInt(time.getFullYear()+""+month+time.getDate()+time.getHours()+time.getMinutes()+time.getSeconds());

    var haveLine=parseInt(CurMeeting.MeetingLine);
    
    
    var leaveLines=parseInt($V("hid_leaveLines"));

    var initStartTime=CurMeeting.MeetingStartTime;
    var initEndTime=CurMeeting.MeetingEndTime;
    
   
    
    var newInitStartTime=parseInt(initStartTime.replace(/:/g,"").replace(/-/g,"").replace(/ /g,""));                
    var newInitEndTime=parseInt(initEndTime.replace(/:/g,"").replace(/-/g,"").replace(/ /g,""));
    
    var newStartTime=parseInt(startTime.replace(/:/g,"").replace(/-/g,"").replace(/ /g,""))*100;
    var newEndTime=parseInt(endTime.replace(/:/g,"").replace(/-/g,"").replace(/ /g,""))*100;

    
//    if(nowTime>newStartTime)
//    {
//        //结束的会议不进行判断
//        return 0;
//    }
    
    //会议开始日期相同，则比较会议开始时间                        
     var compare1=(newInitStartTime <=newStartTime && newEndTime<=newInitEndTime);  //中间
     var compare2=(newStartTime <=newInitStartTime && newInitEndTime<=newEndTime);  //外面
     var compare3=(newInitStartTime <=newStartTime　&& newStartTime<=newInitEndTime &&  newInitEndTime<= newEndTime);  //右交叉
     var compare4=(newInitStartTime >=newStartTime　&&   newInitStartTime<= newEndTime  && newEndTime<=newInitEndTime);  //左交叉
    
    var returnValue=true;
    
    if(compare1 ||  compare2 ||  compare3 || compare4) //表示这个时间点还有这么多线路可用，不包含改会议的线路数。
    {
        //如：该会议有50条线路，还剩余100条，则可以改成150条。否则只能改成100条。
        
        returnValue= leaveLines+haveLine;          
    }
    else
    {       
       returnValue= leaveLines;         
    }
    return returnValue;
}

function showCalendar(ctrl, strMode) {
    Wind.UI.Calendar.show({ input: ctrl, lang: "cn", exp: "yyyy-mm-dd",  mode: "default",onselect: initCurrentLine, clickToday: initCurrentLine });
}
function showTime(ctrl) {

    CalendarTime.show({ input: ctrl, lang: "cn", exp: "yyyy-mm-dd", mode: "time", onselect:initCurrentLine });
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

function showError(xmlhttp)
{
    showErrorHandle(xmlhttp);    
}

//保存会议信息
function updateMeetingInfo()
{
    var reg = /\+/g; //创建正则RegExp对象
    var reg2 = /\&/g; //创建正则RegExp对象
    var title=$V("txt_Title").trim().replace(reg, "%2B").replace(reg2, "%26");
    var meetingLine=contactList.length;
    var startDate=$V("startDate")+""; 
    var content=$V("content").trim().replace(reg, "%2B").replace(reg2, "%26");
    startTime = startDate + ' ' + $V("startTime");
    endTime = startDate + ' ' + $V("endTime");
    checkInfo(title, "txt_Title");   
    if(!flag)
    {        
        return;
    }  
    checkInfo(startDate, "startDate");   
    if(!flag)
    {        
        return;
    }  
    checkInfo(content, "content");
    if(!flag)
    {
        return;
    }
    var leaveLines=getLeaveLines();
    if(contactList.length>leaveLines)
    {
        showAlertWin("", '该时间段会议人数已满，请重新选择！'); 
        return ;
    }
    mask.showWaitOnTarget(document.body);
    var parameterArray = new Array(CurMeeting.MeetingID,title,content,meetingLine,startTime,endTime);
    var dataParameters = { MethodAlias: "updateMeeting_priEdit", Parameter: parameterArray };
    var saveResult=saveMeetingMembers();
    if(saveResult=="false")
    {       
        hideWaitMask();
        return;
    }
    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: ReturnUpdateMeetingInfo, onError: showErrorHandle });
 
}

function ReturnUpdateMeetingInfo(xmlhttp)
{
    var result = xmlhttp.responseText.toJSON();
    if (result != null && result != "")
    {
       if(result.Data!=null && result.Data==true)
       {
          //更新会议信息完成
          if(newcCntactList.length==0)
          {            
             showAlertWin("", '保存信息成功！'); 
          }         
       }
    }
    hideWaitMask();
}

function updateMeetingLine(meetingLine)
{    
    var parameterArray = new Array(CurMeeting.MeetingID,meetingLine);
    var dataParameters = { MethodAlias: "updateMeetingLine", Parameter: parameterArray };   
    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: ReturnUpdateMeetingLine, onError: showErrorHandle });
 
}
function ReturnUpdateMeetingLine(xmlhttp)
{   
}
function checkInfo(input,ctrl){ 
    flag=true;
    var len=GetStrLen(input);
    if (ctrl == "txt_Title" && input == '') {
        $(ctrl).value = "";
        $(ctrl).focus();
        showAlertWin("", '标题不能为空！');        
        flag= false;
        return;
    }
    else if(ctrl == "txt_Title"  &&  len>60)
    {
        showAlertWin("", '标题内容过长，请重新输入！');   
        flag= false;
        return;   
    }
    if (ctrl == "startDate" && input == '') {
        $(ctrl).value = "";
        $(ctrl).focus();
        showAlertWin("", '会议时间不能为空！');        
        flag= false;
        return;
    }
    if (ctrl == "startTime" && input == '') {
        $(ctrl).value = "";
        $(ctrl).focus();
        showAlertWin("", '会议时间不能为空！');        
        flag= false;
        return;
    }
    if (ctrl == "endTime" && input == '') {
        $(ctrl).value = "";
        $(ctrl).focus();
        showAlertWin("", '会议时间不能为空！');        
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



function refurbish()
{

      $("div_MemberList").style.height="215px";                                  
      datalist.DataBind(memberList,null);  
      $("div_MemberList_unlockheaders").style.borderBottomColor="#a7abac";
      changeStyle();
}


window.onresize=function ()
{
    if($.Browse.IEVer()==6)
    {
        // setTimeout(refurbish,600);
    }
    else
    {
        refurbish();
    }
   
}
function needKnow()
{
  window.open("NeedKnow.aspx?type=2",'NeedKnow','height=530px,width=600px');   
}


function CreateMeetingAgain()
{
     window.open("PrivateMeeting.aspx?t="+new Date().getSeconds()+"&type=createAgain&meetingId="+meetingId,'PrivateMeeting', 'height=650px,width=820px');
}