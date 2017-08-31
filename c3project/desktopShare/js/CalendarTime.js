﻿CalendarTime=function(){};CalendarTime.__instance=null;CalendarTime.__getInstance=function(){if(!CalendarTime.__instance){CalendarTime.__instance=new CalendarTime()}return CalendarTime.__instance};CalendarTime.show=function(){CalendarTime.__getInstance().__setValue(arguments[0]).__render("jcorecalendarpanel")};CalendarTime.prototype={__setValue:function(b){if(typeof b.input=="string"){this.input=$(b.input)}else{this.input=b.input}this.lang=b.lang||this["lang"]||"cn";this.exp=b.exp||this["exp"]||"yyyy-mm-dd";this.mode=b.mode||this["mode"]||"default";if(this.lang=="cn"){this.word={year:"年",month:"月",week:["日","一","二","三","四","五","六"],today:"今天",close:"关闭",confirm:"确定",cancel:"取消",time:"时间",months:["一","二","三","四","五","六","七","八","九","十","十一","十二"]}}else{this.word={year:"年",month:"月",week:["S","M","T","W","T","F","S"],today:"Today",close:"Close",confirm:"Ok",cancel:"Cancel",time:"time",months:["January","February","March","April","May","June","July","August","September","October","November","December"]}}this.onselect=b.onselect||this["onselect"]||null;this.frameID="Calendar_frame";this.previousMonthAID="Calendar_a_previousMonth";this.yearmonthPID="Calendar_p_yearmonth";this.nextMonthAID="Calendar_a_nextMonth";this.todayBtnID="Calendar_btn_today";this.mainTbodyID="Calendar_main_tbody";this.closeBtnID="Calendar_btn_close";this.timeBtnID="Calendar_btn_time";this.YMSelectPanelID="Calendar_ymselectpanel";this.TimeSelectPanelID="Calendar_timeselectpanel";this.MSelectPanelID="Calendar_mselectpanel";this.YSelectPanelID="Calendar_yselectpanel";this.HourSelectPanelID="Calendar_hourselectpanel";this.MinuteSelectPanelID="Calendar_minuteselectpanel";this.previousYearAID="Calendar_a_previousYear";this.nextYearAID="Calendar_a_nextYear";this.confirmYMSelectBtnID="Calendar_btn_confirmYMSelect";this.cancelYMSelectBtnID="Calendar_btn_cancelYMSelect";this.confirmHMSelectBtnID="Calendar_btn_confirmHMSelect";this.cancelHMSelectBtnID="Calendar_btn_cancelHMSelect";this.weektextTrID="Calendar_tr_weektext";this.bottomTdID="Calendar_td_bottom";this.today=new Date();return this},__render:function(d){this.__setDate();if(!$(d)){var c=document.createElement("div");c.id=d;document.body.appendChild(c)}this.__showTimeSelectPanel()},__renderTD:function(f,e,d){if((d==0||d==6)&&e!="calendar-body-td-gray"){return"<td class='{0}' title=''><a href='###' style='color:{2}'>{1}</a></td>".format(e,f,"red")}else{return"<td class='{0}' title=''><a href='###'>{1}</a></td>".format(e,f)}},__setFrameStyle:function(){$(this.frameID).style.left="0px";$(this.frameID).style.top="0px";if($(this.frameID).style.display=="none"){$(this.frameID).style.display="block"}var b=this.__getLeftTop();$(this.frameID).style.left=b.left+"px";$(this.frameID).style.top=b.top+"px"},__setHMSelPanelStyle:function(){$(this.TimeSelectPanelID).style.left="0px";$(this.TimeSelectPanelID).style.top="0px";if($(this.TimeSelectPanelID).style.display=="none"){$(this.TimeSelectPanelID).style.display="block"}var f=this.__getLeftTop();$(this.TimeSelectPanelID).style.left=f.left+"px";$(this.TimeSelectPanelID).style.top=f.top+"px";var e=$("#"+this.HourSelectPanelID+" td");for(var d=0;d<e.length;d++){if(e[d].childNodes[0].innerHTML==this.hour){e[d].className="sel"}else{e[d].className=""}}e=$("#"+this.MinuteSelectPanelID+" td");for(var d=0;d<e.length;d++){if(e[d].childNodes[0].innerHTML==this.minute){e[d].className="sel"}else{e[d].className=""}}},__getDay:function(c){var d=new Date(this.yearselected,this.monthselected,1);d.setDate(d.getDate()+c);return d},__today:function(){this.yearselected=this.today.getFullYear();this.monthselected=this.today.getMonth();this.dateselected=this.today.getDate();if(this.mode!="time"){this.__outputDate();this.__close()}else{this.__showTimeSelectPanel()}},__close:function(){if($(this.TimeSelectPanelID)){$(this.TimeSelectPanelID).style.display="none"}},__cancelYMSel:function(){$(this.YMSelectPanelID).style.display="none"},__confirmHMSel:function(){var c=$("#"+this.HourSelectPanelID+" td");for(var d=0;d<c.length;d++){if(c[d].className=="sel"){this.hour=c[d].childNodes[0].innerHTML}}c=$("#"+this.MinuteSelectPanelID+" td");for(var d=0;d<c.length;d++){if(c[d].className=="sel"){this.minute=c[d].childNodes[0].innerHTML}}this.__cancelHMSel();this.__outputDate();this.__close();if(this.onselect){this.onselect()}},__cancelHMSel:function(){$(this.TimeSelectPanelID).style.display="none"},__selectHour:function(f){var g=$("#"+this.HourSelectPanelID+" td");for(var h=0;h<g.length;h++){g[h].className=""}var j=f;if($.Browse.isIE()){var i=Utils.event.getEvent();j=i.srcElement.parentNode}j.className="sel"},__selectMinute:function(f){var g=$("#"+this.MinuteSelectPanelID+" td");for(var h=0;h<g.length;h++){g[h].className=""}var j=f;if($.Browse.isIE()){var i=Utils.event.getEvent();j=i.srcElement.parentNode}j.className="sel";this.__confirmHMSel()},__getSpliter:function(){for(var d=0;d<this.exp.length;d++){var c=this.exp.charAt(d);if(c!="y"&&c!="m"&&c!="d"){return c}}},__outputDate:function(){var e=this.__getSpliter();var f=this.exp.split(e);var d=[];this.input.value=d.join(e);if(this.mode=="time"){if(this.hour&&this.minute){this.input.value+=this.hour+":"+this.minute}}},__buling:function(h,g){var j="";var b=g-h.toString().length;if(b>0){for(var i=0;i<b;i++){j+="0"}}return j+h},__setDate:function(){if(this.input&&this.input.value!=""){var b=this.input.value.trim();this.hour=this.minute=0;if(b){if(b.split(":").length==2){this.hour=b.split(":")[0];this.minute=b.split(":")[1]}}}else{this.hour=this.minute=0}},__setDate2:function(d){var c=new Date(this.yearselected,this.monthselected,15);c.setMonth(c.getMonth()+d);this.yearselected=c.getFullYear();this.monthselected=c.getMonth()},__showTimeSelectPanel:function(){if(!$(this.TimeSelectPanelID)){var d=new StringBuffer();d.append("<div id='{0}' style='height:auto !important' class='calendar_YMSelPanel'>".format(this.TimeSelectPanelID));d.append("<iframe style='position:absolute; z-index:-1;_filter:alpha(opacity=0);opacity=0; width:166px; height:200px ' ></iframe>");d.append("<div style='height:170px !important; margin-top:0px' class='calendar_frame_YMselect' >");d.append("<div style='width:100%;height: 140px;'><div style='width:10%; height:140px; float:left; border-right:#DFECFB 1px solid; writing-mode:tb-rl; text-align:center; color:#15428B'>小时</div>");d.append("<div id='{0}' style='width:79%;height:140px; float:left'>".format(this.HourSelectPanelID));d.append(this.__renderHourPanel());d.append("</div></div><div style='border-top:#DFECFB 1px solid;white-space: nowrap;'>");d.append("</div>");d.append("<div style='width:100%;height: 28px;'><div style='width:10%; height:28px; float:left; border-right:#DFECFB 1px solid; writing-mode:tb-rl; color:#15428B'>分钟</div>");d.append("<div id='{0}' style='float:left;width:72%;margin-left:6px;' >".format(this.MinuteSelectPanelID));d.append(this.__renderMinutePanel());d.append("</div></div></div><div class='calendar-bottom' style='height:20px;'>");d.append("<button id='{0}' type='button' >{1}</button>".format(this.confirmHMSelectBtnID,this.word.confirm));d.append("<button id='{0}' type='button' >{1}</button>".format(this.cancelHMSelectBtnID,this.word.cancel));d.append("</div></div>");var c=document.createElement("div");c.id="jcorecalendarTimeSelectPanel";document.body.appendChild(c);$(c.id).innerHTML=d.toString();d.clear();this.__bindEvent_HMSel()}$(this.confirmHMSelectBtnID).innerHTML=this.word.confirm;$(this.cancelHMSelectBtnID).innerHTML=this.word.cancel;this.__setHMSelPanelStyle()},__renderHourPanel:function(){var c=new StringBuffer();c.append("<table cellspacing='0'>");for(var d=0;d<24;d++){c.append("<tr>");c.append("<td><a href='###' >{0}</a></td>".format(d));c.append("<td><a href='###' >{0}</a></td>".format(++d));c.append("<td><a href='###' >{0}</a></td>".format(++d));c.append("<td><a href='###' >{0}</a></td>".format(++d));c.append("</tr>")}c.append("</table>");return c.toString()},__renderMinutePanel:function(){var b=new StringBuffer();b.append("<table cellspacing='0'>");b.append("<tr>");b.append("<td><a href='###'>{0}</a></td>".format("00"));b.append("<td><a href='###'>{0}</a></td>".format("10"));b.append("<td><a href='###'>{0}</a></td>".format("20"));b.append("<td><a href='###'>{0}</a></td>".format("30"));b.append("<td><a href='###'>{0}</a></td>".format("40"));b.append("<td><a href='###'>{0}</a></td>".format("50"));b.append("</tr>");b.append("</table>");return b.toString()},__bindEvent_HMSel:function(){Utils.event.clickBlankOutOfTarget(this.TimeSelectPanelID,"mousedown","__close",this);var c=$("#"+this.HourSelectPanelID+" td");for(var d=0;d<c.length;d++){Utils.event.addEventHandler(c[d],"click",function(a){return function(){a.__selectHour(this)}}(this))}c=$("#"+this.MinuteSelectPanelID+" td");for(var d=0;d<c.length;d++){Utils.event.addEventHandler(c[d],"click",function(a){return function(){a.__selectMinute(this)}}(this))}Utils.event.addEventHandler($(this.confirmHMSelectBtnID),"mousedown",function(a){return function(){a.__confirmHMSel()}}(this));Utils.event.addEventHandler($(this.cancelHMSelectBtnID),"mousedown",function(a){return function(){a.__cancelHMSel()}}(this))},__getLeftTop:function(){var b={};if(document.documentElement.clientWidth-Utils.getOffset(this.input,"left")<145){b.left=Utils.getOffset(this.input,"left")-this.input.offsetWidth-10}else{b.left=Utils.getOffset(this.input,"left")}if(Utils.getOffset(this.input,"top")-document.documentElement.scrollTop+this.input.offsetHeight>document.documentElement.clientHeight){b.top=Utils.getOffset(this.input,"top")-$(this.frameID).offsetHeight}else{b.top=Utils.getOffset(this.input,"top")+this.input.offsetHeight}return b},__reflashWeekText:function(){var d=$("#"+this.weektextTrID+" th");for(var c=0;c<d.length;c++){d[c].childNodes[0].innerHTML=this.word.week[c]}},__reflashBottom:function(){var b=new StringBuffer();b.append("<button id='{0}' type='button'>{1}</button><button id='{2}' type='button'>{3}</button>".format(this.todayBtnID,this.word.today,this.closeBtnID,this.word.close));if(this.mode=="time"){b.append("<button id='{0}' type='button'>{1}</button>".format(this.timeBtnID,this.word.time))}return b.toString()}};
