var FADINGTOOLTIP;
var wnd_height, wnd_width;
var tooltip_height, tooltip_width;
var tooltip_shown=false;
var	transparency = 100;
var timer_id = 1;
var isShow=false;

// override events
window.onload = WindowLoading;
window.onresize = UpdateWindowSize;
//document.onmousemove = AdjustToolTipPosition;

//外界调用方法
function DisPlayDivShow(show,eventObj)
{
    if(arguments.length>=1)
    {
        isShow=show;
    }
    if(eventObj!=null&&eventObj.clientx!=null)
    {
        AdjustToolTipPosition(eventObj);
    }
	DisplayTooltip();
}

function DisplayTooltip()
{
	if (FADINGTOOLTIP) {
		//FADINGTOOLTIP.innerHTML = tooltip_text;
		//tooltip_shown = (tooltip_text != "")? true : false;
		if(isShow&&FADINGTOOLTIP.innerHTML!="")
		{
			// Get tooltip window height
			FADINGTOOLTIP.style.display="block";
			tooltip_height=(FADINGTOOLTIP.style.pixelHeight)? FADINGTOOLTIP.style.pixelHeight : FADINGTOOLTIP.offsetHeight;
			transparency=0;
			ToolTipFading();
		} 
		else 
		{
			clearTimeout(timer_id);
			FADINGTOOLTIP.style.display="none";
		}
	}
}

function AdjustToolTipPosition(e)
{
	if (navigator.userAgent.toLowerCase().indexOf("msie") != -1&&event!=null)
		e = event;
    offset_y = (e.clientY + tooltip_height - document.documentElement.scrollTop + 30 >= wnd_height) ? - 15 - tooltip_height: 20;
	
	var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
	if (!navigator.userAgent.match(/iPad/i)) {
	    FADINGTOOLTIP.style.left = (wnd_width - tooltip_width + 200) / 2 + scrollLeft + 'px';
	}
	else {
	    FADINGTOOLTIP.style.left = '300px';
	}
	var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
	FADINGTOOLTIP.style.top = (wnd_height-180)/2 +scrollTop+ 'px';
	
	if( isShow )
		FADINGTOOLTIP.style.display = "block";
    else
	    FADINGTOOLTIP.style.display="none";
}

function WindowLoading()
{
	FADINGTOOLTIP=document.getElementById('FADINGTOOLTIP');
	// Get tooltip  window width				
	tooltip_width = (FADINGTOOLTIP.style.pixelWidth) ? FADINGTOOLTIP.style.pixelWidth : FADINGTOOLTIP.offsetWidth;
	
	// Get tooltip window height
	tooltip_height=(FADINGTOOLTIP.style.pixelHeight)? FADINGTOOLTIP.style.pixelHeight : FADINGTOOLTIP.offsetHeight;
	UpdateWindowSize();
	
}

function ToolTipFading()
{
	if(transparency <= 100)
	{
		FADINGTOOLTIP.style.filter="alpha(opacity="+transparency+")";
		transparency += 10;
		timer_id = setTimeout('ToolTipFading()', 10);
	}
}
function UpdateWindowSize() 
{
	wnd_height=document.body.clientHeight;
	wnd_width=document.body.clientWidth;
}
function getEvent() 
{        
        var ev = arguments[0] || window.event ;
        return ev;
}

//给div添加删除

var dragobj={};
var divid=0;
//添加关闭按钮
function init_title(obj){
    var tt = document.createElement("div");
    tt.style.cssText = "cursor:hand;float:left";
    var span = document.createElement("span");
    span.innerHTML = obj.innerHTML;
    tt.appendChild(span);
    
    var close = document.createElement("div");
    close.innerHTML = "xX&nbsp;";
    close.style.cssText = "cursor:hand;float:right";
    close.onclick = closeDiv;
    
    obj.innerHTML = "";
    obj.appendChild(tt);
    obj.appendChild(close);
}
//隐藏层
function closeDiv()
{
    FADINGTOOLTIP.style.display="none";
    isShow=false;
}