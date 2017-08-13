//此文件用于设计开发各个项目自己的js功能
window.onerror=function(){return false;}
//判断文本框控件是否有值
function isNoEmpty(txtControl) {
    var flag = true;

    if (txtControl == null) {
        flag = false;
    } else {
        if (txtControl.value.trim() == "") {
            flag = false;
        }
    }
    return flag;
}

//获取URL中参数param的值
function getQueryString(name) 
{
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); 
    return "";
}
//产生密码
function createPwd() {   
    var au="0000";      
    var num=parseInt(Math.random()*9999);
    if (num < 10)
    {
        au = "000" + num;
    } 
    else if(num < 100)
    {
        au = "00" + num;
    }  
    else if (num < 1000) 
    {
        au = "0" + num;
    }
    else
    {
        au = ""+num;
    }  
    return au;
  
}

function createNum()
{
    var num=createPwd()+createPwd()+createPwd()+createPwd()+createPwd();
    return num;
}
function GetCurrentTime()
{
    var time=new Date();
    return time.getFullYear()+"年"+parseInt(time.getMonth()+1)+"月"+time.getDate()+"日";}

//调用ajax的通用方法
function AjaxInvoke(FunctionName, parameterArray, CompleteFunction) {
    var dataParameters = { MethodAlias: FunctionName, Parameter: parameterArray };
    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", asynchronous: false, data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: CompleteFunction, onError: showError });
}

function AjaxSecureInvoke(FunctionName, parameterArray, CompleteFunction) {
    var dataParameters = { MethodAlias: FunctionName, Parameter: parameterArray };
    Ajax.Request({ url: "AjaxSecureHandler.aspx", type: "POST", asynchronous: false, data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: CompleteFunction, onError: showError });
}
function cutString2(content,lenth) 
{    
    var source;    
    if(typeof(content)=="undefined" )
    {
        return "";
    }    
    if (content!="" && content.length > lenth) 
    {
        source = content.substring(0, lenth) + "...";
        return source;
    }  
    else
    {
        return  content;
    }    
}
function MyDeCode(code) {
    var reg = /\+/g; //创建正则RegExp对象
    var reg2 = /\&/g; //创建正则RegExp对象
    var reg3 = /\•/g;
    var reg4 = /\·/g;
    var str = "";
    str = code.replace(reg, "%2B").replace(reg2, "%26").replace(/ /g, "%20").replace(reg3, "#@$").replace(reg4, "#@$");
    return str;
}
function replaceBracket(content)
{
    var reg1=/</gim;
    var reg2=/>/gim;
    content=content+"";   
    return content.replace(reg1,"&lt;").replace(reg2,"&gt;");  
}
function replaceLtAndGt(content) {
    var reg1 = /&lt;/gim;
    var reg2 = /&gt;/gim;
    var reg3 = /\%2B/g; 
    var reg4 = /\%26/g; 
    var reg5 = "#@$"; 
    var reg6 = /\%20/g; 
    content = content + "";
    return content.trim().replace(reg1, "<").replace(reg2, ">").replace(reg3, "+").replace(reg4, "&").replace(reg5, "•").replace(reg6, " ").replace(reg5, "·");
}
 function IEClose() {
     var ua = navigator.userAgent;
     var ie = navigator.appName == "Microsoft Internet Explorer" ? true : false;
     if (ie) {       
             window.opener = null;
             window.open("", "_self");
             window.close();         
     }
     else {
         window.close()
     }
 }
// 弹出Windows窗体，并在其中嵌入内容页
//win：JCore的windows UI控件
//href：内容页的地址

var w2;
function openWindows(href,iWidth,iHeight,title,left,top,data) {
    //if (!w2) {
        var t = {};
        t.width = (iWidth==null? 800:iWidth);
        t.height =(iHeight==null? 600:iHeight);
        t.left = (document.body.clientWidth - 10 - iWidth) < 0 ? 5 : (document.body.clientWidth - 10 - iWidth) / 2;
        if (left != null) {
             t.left = left;
        }        
        t.top = (document.body.clientHeight - 30 - iHeight) < 0 ? 5 :(document.body.clientHeight - 30 - iHeight)  / 2;   
        if (top != null) {
            t.top = top;
        } 
        t.title = '联系人';
        if(title!= null)
        {
           t.title = title;
        }
       
        t.isreflashable = false;
        t.ismaxable = false;
        t.isshowclose = true;
        t.isresizeable = false;
        t.imagePath = "../resource/images/default/";
        t.isdragable = true;
        t.ismask = true;
        t.isscroll = true;
        if (href != "") {
            t.mode = "iframe";
            t.url = href;
        } else {
            t.data = data;
        }       
        w2 = new Wind.UI.Window(t);
    //}
    w2.show();
}
function closeListWin(){   
    if(w2!=null)
    {
         w2.close();
    }   
}
//去掉字符串的前后空格
function Trim(str) {
    if(typeof(str)=="string")
    {
        str= str.replace(/(^\s*)|(\s*$)/g, '');
    }
   return str;
}
function TransferSpecialChar(content)
{
    var reg = /\%2B/g; //创建正则RegExp对象
    var reg2 = /\%26/g; //创建正则RegExp对象
    if(typeof(content)=="string")
    {
        return content.trim().replace(reg, "+").replace(reg2, "&");   
    }
    else
    {
        return content;
    }
}
function TransferSpecialChar2(content) {
    var reg = /\%2B/g; //创建正则RegExp对象
    var reg2 = /\%26/g; //创建正则RegExp对象
    if (typeof (content) == "string") {
        return content.replace(reg, "+").replace(reg2, "&");
    }
    else {
        return content;
    }
}
function GetStrLen(v_str) {
    var len = 0;
    for (i = 0; i < v_str.length; i++) {
        if (v_str.charCodeAt(i) > 128) {
            len = len + 2;
        }
        else {
            len = len + 1;
        }
    }

    return len;
}

//--------------------------------------------------- 
// 日期计算 
//--------------------------------------------------- 
Date.prototype.DateAdd = function(strInterval, Number) { 
    var dtTmp = this; 
    switch (strInterval) { 
        case 's' :return new Date(Date.parse(dtTmp) + (1000 * Number)); 
        case 'n' :return new Date(Date.parse(dtTmp) + (60000 * Number)); 
        case 'h' :return new Date(Date.parse(dtTmp) + (3600000 * Number)); 
        case 'd' :return new Date(Date.parse(dtTmp) + (86400000 * Number)); 
        case 'w' :return new Date(Date.parse(dtTmp) + ((86400000 * 7) * Number)); 
        case 'q' :return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number*3, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds()); 
        case 'm' :return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds()); 
        case 'y' :return new Date((dtTmp.getFullYear() + Number), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds()); 
    } 
} 

function getScreenHeight()
{
   var height= window.screen.availHeight;
   return height;
}

var FileSuffix="doc,docx,htm,pdf,ppt,pptx,rar,txt,xls,xlsx,zip";
var comErrorMsg="抱歉，系统正忙，请休息一下，稍候再试，谢谢！";

function poneAuth()
{
   var ip = getQueryString("serverinfo");
   if(ip=="") ip = "iWindServer";
   //openWindows("http://" + ip + "/iWind/Activation/MPAuthConfirm.aspx?hiddenClose=false", 480, 428,"");
   //改为支持https模式
   openWindows("/iWind/Activation/MPAuthConfirm.aspx?hiddenClose=false", 480, 428, "");
}

function RecordDownLoadInfo(user,recordID,meetingID,type) {

    //type 1：录音  2 会议纪要或资料
    var parameterArray = new Array(user,recordID,meetingID,type);
    var dataParameters = { MethodAlias: "RecordDownLoadInfo", Parameter: parameterArray }; 
    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onError: showError });
    
}


//jquery的写法
function RecordDownLoadInfo2(user, recordID, meetingID, type) {

    //type 1：录音  2 会议纪要或资料
    var parameterArray = new Array(user, recordID, meetingID, type);
    var dataParameters = { MethodAlias: "RecordDownLoadInfo", Parameter: parameterArray };
    $.ajax({
        type: 'post',
        url: "../AjaxHandler.aspx",
        data: "data=" + encodeURIComponent(JSON2.stringify(dataParameters)),        
        error: showError
    })   
        
}


function isIE() {
    if (! +[1, ]) {
        return true;
    }
    else {
        if (navigator.userAgent.indexOf("Chrome") > 0 || navigator.userAgent.indexOf("Firefox") > 0 || navigator.userAgent.indexOf("Safari") > 0) { return false; }
        else
        { return true; }
    }
 }
