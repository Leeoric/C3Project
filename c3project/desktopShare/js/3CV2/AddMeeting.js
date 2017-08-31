var CurMeeting=
{
    MeetingID:"",
    MeetingTitle:"",
    MeetingStartTime: "",
    MeetingEndTime: "",
    RoomNum:"",
    sort:"MeetingStartTime",
    personCount:"",
    MeetingStatus:"",
    IsOpen:"",
    MeetingLine:0,
    JoinLimit:0
};
var CurrentPerson=
{
    MeetingPWD:"",
    RoomNum:"",
    isJoinMeeting:false,
    MeetingRole:-10
};




//读取会议内容
function readConferenceDetails(meetingID)
{   
    var meetingCond={MeetingID:meetingID,UserID:internalUserID};    
    var parameterArray = new Array(JSON2.stringify(meetingCond));
    maskDetail = new Wind.UI.Mask();    
    AjaxInvoke("GetOneJoinedMeeting",parameterArray,returnMeetingDetail);  
  
}
//会议信息读取成功后进行赋值
function returnMeetingDetail(xmlhttp)
{
      var result=CommonAjaxComplete(xmlhttp)   
      if(result && result.Data)  
      {
        setDetail(result.Data); 
      }
      else
      {
         maskDetailHide();
      }
      
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
       _alertDialog.DataBind('alertWin', {title: '', content: result.ErrorMessage} );
    }   
}
function setDetail(result)
{ 
    if(result)  
    {
        var reg = /\%2B/g; //创建正则RegExp对象
        var reg2 = /\%26/g; //创建正则RegExp对象
        var meetingTime=JSON2.dateFormat(result.MeetingStartTime,"hh:mm")+"~"+JSON2.dateFormat(result.MeetingEndTime,"hh:mm");
        $("lb_MeetingTitle").innerHTML=replaceBracket(result.MeetingTitle.trim().replace(reg, "+").replace(reg2, "&"));           
        
        CurrentPerson.MeetingRole=result.MeetingRole==undefined? -10:result.MeetingRole;
        CurMeeting.MeetingStartTime = result.MeetingStartTime;
        CurMeeting.MeetingEndTime = result.MeetingEndTime;
        CurMeeting.MeetingLine=result.MeetingLine;
        CurMeeting.personCount=result.PersonCount;
        CurMeeting.MeetingID=result.MeetingID;
        CurMeeting.JoinLimit=result.JoinLimit;
        IsOrNotAttendResult();
    }   
    maskDetailHide();
    
}
//Ajax请求失败后的回调，用于输出错误信息
function showError(xmlhttp) {
    maskDetailHide();
    maskBookHide();
    var mes= "系统正忙，稍候再试! \r\n 代码:  "+ xmlhttp.status;
    if((xmlhttp.status+"").substr(0,3)=="500")
    {
        _alertDialog.DataBind('alertWin', {title: '', content: "您好，由于网络原因导致请求失败，请您稍后再试！"} );
        writeErrorLog(mes);
    }
    else
    {
        if(typeof(comErrorMsg)=="string" && comErrorMsg)
        {
            _alertDialog.DataBind('alertWin', {title: '', content: comErrorMsg} );    
        }
        else
        {
            _alertDialog.DataBind('alertWin', {title: '', content: "抱歉，系统正忙，请休息一下，稍候再试，谢谢！"} );    
        }
    } 
   
}
function writeErrorLog(msg) {
 
    var parameterArray = new Array(msg);
    var dataParameters = { MethodAlias: "writeLog", Parameter: parameterArray };    
  
    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: returnWriteErrorLog, onError: showError });
    
}
function returnWriteErrorLog(xmlhttp) {    
   
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

    //按钮预定事件
function btn_Apply_onclick()
{ 
    var jsonObject ={};
    if(myIMUserID>0)
    {
         jsonObject={ IMAccount: $V("sp_account"), MobilePhone: $V("sp_phone"), UserName: $V("hid_name"),InternalUserId:internalUserID,CompanyEmail:$V("sp_email"),IMUserID:myIMUserID,MeetingRole:4,Company: $V("hid_company"),CompanyType:companyType};
    }
    else
    {
        //提交前需要对输入的邮箱和手机进行验证，防止坏数据进入
        if(Trim($V("txt_name"))=="")
        {
              _alertDialog.DataBind('alertWin', {title: '', content: "姓名不能为空!"} );           
              return; 
        }      
        if(Trim($V("txt_company"))=="")
        {
               _alertDialog.DataBind('alertWin', {title: '', content: "公司不能为空!"} );           
                return;        
        }      
        if(Trim($V("txt_Email"))!="")
        {
            if(!Validator.email($V("txt_Email")))
            {
                _alertDialog.DataBind('alertWin', {title: '', content: "邮箱格式不正确!"} );           
                return; 
            }
        }
        else
        {
                _alertDialog.DataBind('alertWin', {title: '', content: "邮箱不能为空!"} );           
                return; 
        }
        if(Trim($V("txt_Phone"))!="")
        {
            if(!Validator.mobile($V("txt_Phone")) || ( $V("txt_Phone").length!=11))
            {
                _alertDialog.DataBind('alertWin', {title: '', content: "请输入正确的手机号码!"} );         
                return; 
            }
        }
        else
        {
             _alertDialog.DataBind('alertWin', {title: '', content: "手机号码不能为空!"} );           
             return; 
        }
         jsonObject={ Email: $V("txt_Email"), MobilePhone: $V("txt_Phone"), UserName: $V("txt_Name"),InternalUserId:internalUserID,IMUserID:myIMUserID,MeetingRole:4,Company: $V("hid_company")};
    }

    maskBook = new Wind.UI.Mask();     
    var parameterArray=new Array(JSON2.stringify(jsonObject),CurMeeting.MeetingID);       
    var dataParameters = { MethodAlias: "JoinMeeting", Parameter: parameterArray };
    Ajax.Request({ url: "../AjaxSecureHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: completeApply, onError: showError });
}

//Ajax成功与后台交互后的回调事件
function completeApply(xmlhttp)
{    
    maskBookHide();
   
    var result=CommonAjaxComplete(xmlhttp);
    if(result && result.Data)
    {           
        var AppData=result.Data;
        if(AppData.MeetingPWD=="" || AppData.ErrorCode<0)
        {
             _alertDialog.DataBind('alertWin', {title: '', content:AppData.ErrorMessage} );
             return;
        }      
        CurrentPerson.MeetingPWD=AppData.MeetingPWD;            
        CurrentPerson.MeetingRole=4;        
        var alertWClose = new AlertDialog(closeParentWindow);
        
        if(AppData.ErrorCode==1)
        {
             
            alertWClose.DataBind('alertWin', {title: '', content:"已经加入过该会议！"} );
             
        }
        else if(AppData.ErrorCode==0)
        {                  
            alertWClose.DataBind('alertWin', {title: '', content:"加入会议成功！"} );
            
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
    }
    else if(result.ErrorCode && result.ErrorCode<0)
    {  
        _alertDialog.DataBind('alertWin', {title: '', content:result.ErrorMessage} );
        
    } 
}

function returnTime()
{
   var yy= JSON2.dateFormat(CurMeeting.MeetingStartTime,"yyyy");
   var MM= JSON2.dateFormat(CurMeeting.MeetingStartTime,"MM");
   var dd= JSON2.dateFormat(CurMeeting.MeetingStartTime,"dd");
   var hh= JSON2.dateFormat(CurMeeting.MeetingStartTime,"hh");
   var mm= JSON2.dateFormat(CurMeeting.MeetingStartTime,"mm");
    
    return yy+"年"+MM+"月"+dd+"日"+hh+":"+mm;
}


function maskDetailHide()
{
    try
    {        
        maskDetail.hideWaitOnTarget();
    }
    catch(e)
    {
        
    }    
}
function maskBookHide()
{
    try
    {        
        maskBook.hideWaitOnTarget();
    }
    catch(e)
    {
        
    }    
}




function IsOrNotAttendResult ()
{
    var resultValue=false;
    var interval=$V("hid_addMeetingInterval");
    if(CurrentPerson.MeetingRole>0)
    {
        resultValue=true;
    }
    if(resultValue)
    {          
        $("btn_Apply").disabled='disabled';
        $("btn_Apply").className="disbaleAdd";     
        
        //现在正在召开的会议也要显示，所以要加个逻辑，如果我参加的且已经召开的会议，不显示取消参加的按钮。
        
        var TimeResult= compdate(CurMeeting.MeetingStartTime,new Date(),0);
         if(TimeResult>=0)
         {         
            //会议已经处于召开状态，隐藏申请或取消按钮，但爱你是相关信息           
            $("btn_Apply").disabled='disabled';
            $("btn_Apply").className="disbaleAdd"; 
         }       
     }
     else
     {
         //var TimeResult= compdate(CurMeeting.MeetingStartTime,new Date(),interval);
         var TimeResult = compdate(CurMeeting.MeetingEndTime, new Date(), 0);
         //改为会议结束前都能加入会议
         if(TimeResult>=0)
         {         
             //隐藏申请或取消按钮
            $("btn_Apply").disabled='disabled';
            $("btn_Apply").className="disbaleAdd";    
            $("div_personCountWarning").innerHTML="已过加入会议的时间！";  
            $("div_personCountWarning").show();
         }
         else //没有结束
         {                        
             //总人数
                var MeetingLine=CurMeeting.MeetingLine;
                //已参加的人数               
               var personCount=CurMeeting.personCount;
                //判断会议人数是否加满
                if(personCount<MeetingLine)
                {
                     $("btn_Apply").show();                     
                }   
                else //人数已满
                {
                    //隐藏申请或取消按钮
                    $("btn_Apply").disabled='disabled';
                    $("btn_Apply").className="disbaleAdd";  
                    $("div_personCountWarning").innerHTML="会议人数已满，无法再加入会议！";  
                    $("div_personCountWarning").show();                                 
                }              
         
        }   
       
     }   
}

function closeParentWindow()
{
    try
    {
        window.parent.closeListWin();
    }
    catch(e)
    {
    
    }
}

function closePage()
{    
    try
    {
        if(typeof(parent.closeListWin)=="function")
        {
            parent.closeListWin();
        }
    }
    catch(e)
    {
      IEClose();
    }
}

function emailClick()
{
    var btn_Email=$("btn_Email");
    var txt_companyEmail=$("txt_companyEmail");
    var sp_email=$("sp_email");
    if(btn_Email.value=="修改")
    {
        txt_companyEmail.style.display="";
        sp_email.style.display="none";
        $("txt_companyEmail").value=sp_email.innerText;
        btn_Email.value="保存";
    }
    else
    {       
        //保存邮箱
        if(Trim($V("txt_companyEmail"))!="")
        {
            if(!Validator.email($V("txt_companyEmail")))
            {
                _alertDialog.DataBind('alertWin', {title: '', content: "公司邮箱格式不正确!"} );           
                return; 
            }           
        }      
        updateCompanyEmail();
    }
}

function updateCompanyEmail() {
 
    var parameterArray = new Array(myIMUserID,$("txt_companyEmail").value);
    var dataParameters = { MethodAlias: "updateCompanyEmail", Parameter: parameterArray };    
  
    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: renderCompanyEmail, onError: showError });
    
}

function renderCompanyEmail(xmlhttp) {    
   
    var result = xmlhttp.responseText.toJSON();
  
    if (result != null && result != "") {      
        if (result.State == 0) {            
         var contact=result.Data;
         if(contact)
         {           
              $("txt_companyEmail").style.display="none";
              $("btn_Email").value="修改";
              $("sp_email").innerHTML=$("txt_companyEmail").value;
              sp_email.style.display="";            
         }
         else
         {
             _alertDialog.DataBind('alertWin', { title: '', content: "修改公司邮箱失败！" });
         }        
        
        } else {           
            _alertDialog.DataBind('alertWin', { title: '', content: result.ErrorMessage });
        }
    }
}

function poneAuth()
{
   var ip = getQueryString("serverinfo");
   if(ip=="") ip = "iWindServer";
   //window.open("http://" + ip + "/iWind/Activation/MPAuthConfirm.aspx?hiddenClose=false",'adminPage','height=410,width=480');
   //改为支持https模式
   window.open("/iWind/Activation/MPAuthConfirm.aspx?hiddenClose=false", 'adminPage', 'height=410,width=480');
   
}

