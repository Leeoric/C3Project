Date.prototype.format = function(format){var args = {"M+" : this.getMonth() + 1,"d+" : this.getDate(),"h+" : this.getHours(),"m+" : this.getMinutes(),"s+" : this.getSeconds(),"q+" : Math.floor((this.getMonth() + 3) / 3),  //quarter
"S" : this.getMilliseconds()};	if(/(y+)/.test(format))	 format = format.replace(RegExp.$1,(this.getFullYear() + "").substr(4 - RegExp.$1.length));	for(var i in args)	{	 var n = args[i];	 if(new RegExp("("+ i +")").test(format))	 format = format.replace(RegExp.$1,RegExp.$1.length == 1 ? n : ("00" + n).substr(("" + n).length));	}	return format;};                 


function inviteDel(rowIndex) {
    return "<img src='../images/3C_36.gif' onmouseleave=\"this.src ='../images/3C_36.gif'\" onmouseover=\"this.src ='../images/3C_34.gif'\" title='删除' style='cursor:hand' border='0' onclick='delPerson(" + rowIndex + ")' />";
}
function setDefaultTime() {
    $("startDate").value = new Date().format("yyyy-MM-dd");
    $("startTime").value=new Date().DateAdd("h",0.09).format("hh:mm");
    $("endTime").value=new Date().DateAdd("h",1.1).format("hh:mm");
}
function showCalendar(ctrl) {
    Wind.UI.Calendar.show({ input: ctrl, lang: "cn", exp: "yyyy-mm-dd", mode: "default",onselect: initCurrentLine, clickToday: initCurrentLine });
}
function CheckDate(startDate,startTime,endTime){ 
    var msg="",min=0;
    if (new Date(startDate.replace(/-/g, "/")) < new Date(new Date().format("yyyy, MM, dd").replace(/,/g, "/"))) {
        msg = '会议日期不能早于今天！'; return msg;
    }
    if (new Date(startTime.replace(/-/g, "/")).getTime() <= new Date().getTime()) {
        msg = '会议开始时间不能早于当前时间！';
        return msg;
    }
    if (new Date(startTime.replace(/-/g, "/")).getTime() <= new Date().DateAdd("n", 0).getTime()) {
        msg = '会议开始时间必须早于当前时间' + min + '分钟！';
        return msg;
    }
    if (new Date(endTime.replace(/-/g, "/")).getTime() <= new Date(startTime.replace(/-/g, "/")).getTime()) {
        msg = '会议的结束时间不能早于开始时间!';
        return msg;
    }

    if (new Date(startDate.replace(/-/g, "/")) < new Date("1754/1/1") || new Date(startDate.replace(/-/g, "/")) > new Date("9998/1/1")) {
        msg = '日期必须介于1754/1/1和9998/1/1之间';
        return msg;
    }
    
    return msg;
}
function getdate()
{   
  var now=new Date();
  y=now.getFullYear();
  m=now.getMonth()+1;
  d=now.getDate();
  m=m<10?"0"+m:m;
  d=d<10?"0"+d:d;
  return y+"-"+m+"-"+d;
}
function closeAlertWin()
{
     window.opener = null;
     window.open("", "_self");
     window.close();
}
var popUp
/*
弹出Windows窗体，并在其中嵌入内容页
win：JCore的windows UI控件
href：内容页的地址
*/
var w2;
function openWindows(href) {
    //if (!w2) {
        var t = {};

        var iWidth = 660;
        var iHeight = 570;
        t.width = iWidth;
        t.height = iHeight;
        t.left = (document.body.clientWidth - 10 - iWidth) < 0 ? 5 : (document.body.clientWidth - 10 - iWidth) / 2;
        t.top = (document.body.clientHeight - 30 - iHeight) < 0 ? 5 :(document.body.clientHeight - 30 - iHeight)  / 2;
        t.title = '联系人';
        t.isreflashable = false;
        t.ismaxable = false;
        t.isshowclose = true;
        t.isresizeable = false;
        t.imagePath = "../resource/images/default/";
        t.isdragable = true;
        t.ismask = true;
        t.isscroll = true;
        t.mode = "iframe";
        t.url = href+"?r="+Math.random();
        w2 = new Wind.UI.Window(t);
    //}
    w2.show();
}
function closeListWin(){   
    w2.close();
}
var timer 
function set(t,l){ 
if($V(t).length> l) 
$(t).value=$(t).value.substr(0,l) 
timer=setTimeout( "set( ' "+t+ " ', "+l+ ") ",1) 
} 
function clr(){ 
clearTimeout(timer) 
}