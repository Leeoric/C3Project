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
    NewMeetingLine:""
};
var CurrentPerson=
{
    MeetingPWD:"",
    RoomNum:"",
    isJoinMeeting:false,
    MeetingRole:-10
};
var isCancelMeeting=false;
var isCanncelMeeting=false;
var myIMUserID="";
var flag;
var mask;


var temp;
var startDate = null;
var startTime = null;
var endTime = null;

var meetingType="";

//读取会议内容
function readConferenceDetails(meetingID)
{
    var meetingCond={MeetingID:meetingID,UserID:$V("hid_IMUserId")};    
    var parameterArray = new Array(JSON2.stringify(meetingCond));
    maskDetail = new Wind.UI.Mask(); 
    maskDetail.showWaitOnTarget("form1");    
    AjaxInvoke("GetOneJoinedMeeting",parameterArray,getConferenceDetail);  
  
}
//会议信息读取成功后进行赋值
function getConferenceDetail(xmlhttp)
{
      var result=CommonAjaxComplete(xmlhttp)     
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
    }
    else
    {    
        hideWaitMask();
        return ;
    }

    if(result)  
    {
        var MeetingContent=replaceBracket(TransferSpecialChar(result.MeetingContent));
        var MeetingTitle=TransferSpecialChar(result.MeetingTitle);   
         //读取会议详细信息       
         $("lb_startDay").innerHTML=JSON2.dateFormat(result.MeetingStartTime,"yyyy-MM-dd");
         $("lb_startTime").innerHTML=JSON2.dateFormat(result.MeetingStartTime,"hh:mm");
         $("lb_endTime").innerHTML=JSON2.dateFormat(result.MeetingEndTime,"hh:mm");         
         $("lb_meetingTitle").innerHTML=MeetingTitle;
        
         if(result.MeetingBookerName==undefined || result.MeetingBookerName=="undefined")
         {
            $("lb_meetingBookName").innerHTML="";
         }
         else
         {
            $("lb_meetingBookName").innerHTML=replaceBracket(result.MeetingBookerName);
         }
         $("lb_Content").innerHTML=MeetingContent.replace(/\r\n/g,"<br>");
                        
         $("lb_roomNum").innerHTML=result.RoomNum;  
         $("lb_passWord").innerHTML=typeof(result.MeetingPWD)=="undefined"?"":result.MeetingPWD;
         document.title=MeetingTitle;
         CurMeeting.MeetingTitle=MeetingTitle;       
         isCancel=result.MeetingStatus==99? true:false;   
              
         CurrentPerson.MeetingRole=result.MeetingRole;
         
         CurMeeting.IsOpen=result.IsOpen
         CurMeeting.MeetingStartTime=JSON2.dateFormat(result.MeetingStartTime,"yyyy-MM-dd hh:mm:ss");
         CurMeeting.MeetingEndTime=JSON2.dateFormat(result.MeetingEndTime,"yyyy-MM-dd hh:mm:ss");
         refleshTime=result.MeetingStartTime;
         CurMeeting.MeetingID=result.MeetingID; 
                    
    }  
    hideWaitMask();
    
    if(CurMeeting.IsOpen==false)
    {
        return;
    }
    if(CurrentPerson.MeetingRole>0)
    {       
        //表示我加入过该会议
        $("btn_cancelMeeting").style.display="";         
        var beginTime=result.MeetingStartTime;
        var MeetingStatus=result.MeetingStatus;
        if(MeetingStatus==99)
        {                          
            $("btn_cancelMeeting").disabled='disabled';    
        }   
        else
        {
            var CancelHourLimit=$V("hid_CancelHourLimit");
            CancelHourLimit=CancelHourLimit==""? 1:parseInt(CancelHourLimit); 
            CancelHourLimit=CancelHourLimit*60;
            isCanEdit=compdate(beginTime,new Date(),CancelHourLimit)>0 ? false: true;
            if(isCanEdit)
            {
                //表示已过修改时间：会议开始前1小时。                 
                 $("btn_cancelMeeting").removeAttribute("disabled");               
            }
            else
            {            
                $("btn_cancelMeeting").disabled='disabled';    
                $("btn_cancelMeeting").title="已过取消报名时间，只能在会议开始时间1小时以上才能取消报名。"  
            }
        }
    }
    else
    {
         $("btn_cancelMeeting").style.display="none";
    } 
    
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

function showError(xmlhttp)
{
    showErrorHandle(xmlhttp);    
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


//按钮的取消预定事件
function cancalAddMeeting()
{ 
    var parameterArray=new Array(myIMUserID,CurMeeting.MeetingID); 
    maskCancel = new Wind.UI.Mask();     
    AjaxInvoke("IwindCancelJoinMeeting",parameterArray,completeCancelApply);  
 
}

function completeCancelApply(xmlhttp)
{   
    var result=CommonAjaxComplete(xmlhttp);   
    if(result && result.Data)
    {
        resultValue=result.Data;
        if(resultValue==true)
        {           
            alertDialog.DataBind('alertWin', {title: '', content: "取消加入会议成功！"} );
            $("btn_cancelMeeting").style.display="none";
            
            //刷新父页面
            try
            {
                if(window.parent)
                {
                     window.opener.getMeetingList(1);
                } 
            }
            catch(e)
            {
                
            }   
           
        }
    }
}
//参会须知
function needKnow()
{
    //公开会议1； 私人会议参与者3；
    if(CurMeeting.IsOpen==true)
    {
        window.open("NeedKnow.aspx?type=1",'NeedKnow','height=530px,width=600px');
    }
    else
    {
        window.open("NeedKnow.aspx?type=3",'NeedKnow','height=450px,width=600px');
    }
    
}