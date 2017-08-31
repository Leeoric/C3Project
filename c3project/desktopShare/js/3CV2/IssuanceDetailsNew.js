//记录用户报名、voip参会状态
//0 表示可报名状态（此时用户尚未报名，点击后进入报名页面）
//1 表示可voip参会状态（此时用户已报名，点击后通过网络拨入会议）
var addMeetingStatus = -1;
//记录用户会议收藏状态
var collectState = 0;

//网速阈值设置(KB/s)
var SpeedThreshold = 20;

var isAudioEnd = 0;
var dtMeetingStartTime;
var C3MeetingObj;

var CurMeeting =
{
    MeetingID: "",
    MeetingTitle: "",
    MeetingStartTime: "",
    MeetingEndTime: "",
    MeetingBookerName: "",
    MeetingLine: "",
    IsOpen: "",
    MeetingContent: "",
    PersonCount: 0,
    isCancel: false,
    MeetingIssuance: 1,
    SecCode: "",
    JumpF9: "",
    JoinLimit: "",
    limitCompanyType: ""
};

//保存当前加入会议的会议室号和密码
var JoinInfo =
{
    MeetingRoom: 0,
    MeetingPwd: ""
};

var currentHitType = "";
//读取会议内容
function readConferenceDetails(conferenceID) {
    //将传入的internalid修改imid 修正传入id错误的问题 tfzheng(20151202)
    //var meetingCond={MeetingID:conferenceID,UserID:internalUserID};    
    var meetingCond = { MeetingID: conferenceID, UserID: IMUserID };
    var parameterArray = new Array(JSON2.stringify(meetingCond));
    maskDetail = new Wind.UI.Mask();
    maskDetail.showWaitOnTarget("_body");
    AjaxInvoke("GetOneJoinedMeetingV2", parameterArray, getConferenceDetail);

}
//会议信息读取成功后进行赋值
function getConferenceDetail(xmlhttp) {
    var result = CommonAjaxComplete(xmlhttp)
    setDetail(result);
}
//一个用来处理ajax返回结果的通用处理过程，主要用来判断结果是否正确。
function CommonAjaxComplete(xmlhttp) {
    var result = xmlhttp.responseText.toJSON();
    if (result.State == 0) {
        if (result != null && result != "") {
            return result;
        }
    }
    else if (result.ErrorMessage) {
        alertDialog.DataBind('alertWin', { title: '', content: result.ErrorMessage });
        hideWaitMask();
    }
}


function setDetail(result) {
    if (result && result.Data) {
        var CanJoinStatus = $V("hid_CanJoinStatus");
        result = result.Data;
        if (result.MemberUserID != null && result.MemberUserID != "") {
            myStatus = "1";
        }
        //获取会议收藏信息 未登录im时视为未收藏状态
        collectState = isLoginIwind ? result.IsCollect : 0;
        showCollectState(collectState);

        //保存会议室信息
        JoinInfo.MeetingRoom = result.RoomNum;
        JoinInfo.MeetingPwd = result.MeetingPWD;
        var beginTime = JSON2.dateFormat(result.MeetingStartTime, "yyyy-MM-dd hh:mm:ss");
        //保存会议开始时间
        dtMeetingStartTime = new Date(beginTime.substr(0, 4), beginTime.substr(5, 2) - 1, beginTime.substr(8, 2), beginTime.substr(11, 2), beginTime.substr(14, 2), beginTime.substr(17, 2));
        var endTime = JSON2.dateFormat(result.MeetingEndTime, "yyyy-MM-dd hh:mm:ss");
        var MeetingStatus = result.MeetingStatus;
        if (result.MeetingIssuance == 2) {
            $("div_add").disabled = 'disabled';
            $("div_add").src = "../../3CV32/images/btn_book_wait.png";
        }
        else if (result.MeetingIssuance == 3) {

            if (result.PersonCount >= result.MeetingLine) {
                //会议人数已满
                $("div_add").disabled = 'disabled';
                $("div_add").src = "../../3CV32/images/btn_book_full.png";
            }
            else {
                //                var CancelHourLimit = $V("hid_CancelHourLimit");
                //                CancelHourLimit = CancelHourLimit == "" ? 1 : parseInt(CancelHourLimit);
                //                CancelHourLimit = CancelHourLimit * 10;
                // isCanEdit = compdate(beginTime, new Date(), CancelHourLimit) > 0 ? false : true;
                isCanEdit = compdate(endTime) > 0 ? false : true;
                if (isCanEdit) {
                    //表示还可以加入：会议开始10分钟。 
                    //修改为会议结束前都可以加入
                    if (myStatus != null && myStatus != undefined && myStatus != '' && myStatus != "0") //已报名
                    {
                        //如果会议开始且用户已报名 显示加入会议按钮(tfzheng 20151102)
                        if (compdate(beginTime) < 0) {
                            $("div_add").disabled = 'disabled';
                            $("div_add").src = "../../3CV32/images/btn_book_success.png";
                        }
                        else {
                            //当前已经是可voip参会的状态 addMeetingStatus置1
                            addMeetingStatus = 1;
                            $("div_add").removeAttribute("disabled");
                            $("div_add").style.cursor = "pointer";
                            $("div_add").src = "../../3CV32/images/btn_joinmeeting.png";
                            $("div_add").onmouseover = function () {
                                $("div_add").src = "../../3CV32/images/btn_joinmeeting_hover.png";
                            }
                            $("div_add").onmouseout = function () {
                                $("div_add").src = "../../3CV32/images/btn_joinmeeting.png";
                            }
                        }
                    }
                    else {
                        //当前是正在报名的状态 addMeetingStatus置0
                        addMeetingStatus = 0;
                        $("div_add").removeAttribute("disabled");
                        $("div_add").style.cursor = "pointer";
                        $("div_add").src = "../../3CV32/images/btn_book.png";
                        $("div_add").onmouseover = function () {
                            $("div_add").src = "../../3CV32/images/btn_book_hover.png";
                        }
                        $("div_add").onmouseout = function () {
                            $("div_add").src = "../../3CV32/images/btn_book.png";
                        }
                    }
                }
                else {
                    $("div_add").disabled = 'disabled';
                    $("div_add").src = "../../3CV32/images/btn_book_end.png";
                }
            }
        }
        else if (result.MeetingIssuance == 4 || result.MeetingIssuance == 5) {
            if (myStatus != null && myStatus != undefined && myStatus != '' && myStatus != "0") //已报名
            {
                $("div_add").disabled = 'disabled';
                $("div_add").src = "../../3CV32/images/btn_book_success.png";
            } else {
                $("div_add").disabled = 'disabled';
                $("div_add").src = "../../3CV32/images/btn_book_end.png";
            }
        }
        else if (result.MeetingIssuance == 9 || result.MeetingIssuance == 6) {
            $("div_add").disabled = 'disabled';
            $("div_add").src = "../../3CV32/images/btn_meetingend.png";
        }
        else if (result.MeetingIssuance == 10) {
            //会议人数已满
            if (myStatus != null && myStatus != undefined && myStatus != '' && myStatus != "0") //已报名
            {
                $("div_add").disabled = 'disabled';
                $("div_add").src = "../../3CV32/images/btn_book_success.png";
            } else {
                $("div_add").disabled = 'disabled';
                $("div_add").src = "../../3CV32/images/btn_book_full.png";
            }
        }
        else {
            $("div_add").disabled = 'disabled';
            $("div_add").src = "../../3CV32/images/btn_book_wait.png";

        }
    }
    else {
        alertDialog.DataBind('alertWin', { title: '', content: "您所浏览的会议不存在！" });
        //表示读取会议信息出错
        $("div_add").disabled = 'disabled';
        $("div_add").src = "../../3CV32/images/btn_book_wait.png";
        hideWaitMask();
        return;
    }

    if (result) {
        var MeetingContent = replaceBracket(TransferSpecialChar(result.MeetingContent));
        var MeetingTitle = replaceBracket(TransferSpecialChar(result.MeetingTitle));
        //读取会议详细信息 
        $("lb_meetingTime").innerHTML = JSON2.dateFormat(result.MeetingStartTime, "yyyy-MM-dd") + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + JSON2.dateFormat(result.MeetingStartTime, "hh:mm") + "-" + JSON2.dateFormat(result.MeetingEndTime, "hh:mm")
        //$("lb_meetingTime").innerHTML = result.MeetingStartTime.substr(0, 10) + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + result.MeetingStartTime.substr(11, 5) + "-" + result.MeetingEndTime.substr(11, 5);

        $("lb_Company").innerHTML = replaceBracket(result.MeetingBookerName);
        if (result.MeetingBookerName == undefined || result.MeetingBookerName == "undefined") {
            $("lb_Company").innerHTML = "";
        }
        var workedContent = "";
        workedContent = MeetingContent.replace(/\r\n/g, "<br>");

        workedContent = dealWithUrl(workedContent);
        $("Div_content").innerHTML = workedContent;

        CurMeeting.MeetingTitle = MeetingTitle;
        document.title = CurMeeting.MeetingTitle;

        isCancel = result.MeetingStatus == 99 ? true : false;
        MeetingIssuance = result.MeetingIssuance;
        CurMeeting.MeetingID = result.MeetingID;
        CurMeeting.SecCode = result.SecCode;
        CurMeeting.JoinLimit = result.JoinLimit;
        CurMeeting.limitCompanyType = result.LimitCompany;
        if (result.JumpF9 == "1") {
            var index1 = MeetingTitle.indexOf("(");
            var index2 = MeetingTitle.indexOf("（");
            var index3 = MeetingTitle.indexOf(")");
            var index4 = MeetingTitle.indexOf("）");

            var indexStart = (index2 > 0 ? index2 : (index1 > 0 ? index1 : -1));
            var indexEnd = (index4 > 0 ? index4 : (index3 > 0 ? index3 : -1));
            var titleStart, titleEnd;
            if (indexStart > 0 && indexEnd > 0) {
                titleStart = MeetingTitle.substr(0, indexStart + 1);
                titleEnd = MeetingTitle.substr(indexEnd, MeetingTitle.length - indexEnd);
                if (typeof (CurMeeting.SecCode) == "undefined") {
                    $("lb_title").innerHTML = MeetingTitle;
                }
                else {
                    var newTitle = titleStart + "<a style='text-decoration:none;' href=\"!PAGE('F9'," + CurMeeting.SecCode + ")\">" + CurMeeting.SecCode + "</a>" + titleEnd;
                    $("lb_title").innerHTML = newTitle;
                }
            }
            else {
                $("lb_title").innerHTML = CurMeeting.MeetingTitle;
            }
        }
        else {
            $("lb_title").innerHTML = CurMeeting.MeetingTitle;
        }
    }
    else {
        $("lb_meetingTime").innerHTML = "";
        $("lb_Company").innerHTML = "";
        $("Div_content").innerHTML = "";
        $("lb_title").innerHTML = "";
    }

    //加载详情完成后开始会议倒计时
    startCountDown();

    hideWaitMask();
}

//function compdate(startTime, endTime, interval) {
//    var yyyy = parseFloat(startTime.substr(0, 4));
//    var MM = parseFloat(startTime.substr(5, 2));
//    var dd = parseFloat(startTime.substr(8, 2));
//    var hh = parseFloat(startTime.substr(11, 2));
//    var mm = parseFloat(startTime.substr(14, 2));
//    var ss = parseFloat(startTime.substr(17, 2));
//    //因为会议开始前15分钟可以加入会议。
//    startTime = new Date(yyyy, MM - 1, dd, hh, (parseInt(mm) - parseInt(interval)), ss);
//    alert(startTime);
//    startCount = startTime.getTime();
//    endCount = endTime.getTime();
//    return endCount - startCount;
//}

function compdate(time) {
    var yyyy = parseFloat(time.substr(0, 4));
    var MM = parseFloat(time.substr(5, 2));
    var dd = parseFloat(time.substr(8, 2));
    var hh = parseFloat(time.substr(11, 2));
    var mm = parseFloat(time.substr(14, 2));
    var ss = parseFloat(time.substr(17, 2));

    var endTime = new Date(yyyy, MM - 1, dd, hh, mm, ss);
    var endCount = endTime.getTime();
    var curTime = getSysTime();
    var nowCount = curTime.getTime();
    return nowCount - endCount;
}

var imagePath = "../resource/images/default/";
//Ajax请求失败后的回调，用于输出错误信息
function showError(xmlhttp) {
    var mes = "操作过程中发生了错误，请联系管理员! \r\n 错误代码:  " + xmlhttp.status;
    if ((xmlhttp.status + "").substr(0, 3) == "500") {
        alertDialog.DataBind('alertWin', { title: '', content: "您好，由于网络原因导致请求失败，请您稍后再试！" });
        writeErrorLog(mes);
    }
    else {
        alertDialog.DataBind('alertWin', { title: '', content: mes });
    }
    hideWaitMask();
}
function hideWaitMask() {
    try {
        maskDetail.hideWaitOnTarget();

    }
    catch (e) {

    }
}
function addMeeting() {
    if (IMUserID > 0) {
        openWindows("AddMeeting.aspx?meetingID=" + meetingId, 450, 370);
    }
    else {
        openWindows("AddMeeting.aspx?meetingID=" + meetingId, 450, 350);
    }

}

function dealWithUrl(str) {

    var matchPIC = new RegExp("((?:http|https|ftp|mms|rtsp)://(&(?=amp;)|[A-Za-z0-9\./=\?%_~@#:;\+\-])+(gif|jpg|png))", "ig");
    var matchURL = new RegExp("((?:http|https|ftp|mms|rtsp)://(&(?=amp;)|[A-Za-z0-9\./=\?%_~@&#:;\+\-])+)", "ig");
    var str2 = "";
    str2 = str.replace("&nbsp;", " ")
    if (matchPIC.test(str)) {
        str2 = str2.replace(matchPIC, "<img src=\"$1\" hint=\"$1\"></img>");
    } else {
        str2 = str2.replace(matchURL, "<a target=\"_blank\" href=\"$1\">$1</a>");
    }
    return str2
}

//获取资料列表
function GetResource(meetingId, type) {
    var parameterArray = new Array(meetingId, type);
    currentHitType = type;
    var dataParameters = { MethodAlias: "GetResourceAndRecord", Parameter: parameterArray };

    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: returnResoure, onError: showError });

}

function returnResoure(xmlhttp) {
    var result = xmlhttp.responseText.toJSON();
    clearMaterial("td_material");
    var column = 1;
    if (result && result.Data) {
        var data = result.Data.toJSON();
        var data2 = new Array();
        for (var k = 0; k < data.length; k++) {
            if (data[k].ResourceType) {
                if (data[k].ResourceType == 1) {
                    data2.push(data[k]);
                }
                else if (data[k].ResourceType == 3) {
                    addFile2(data[k]);
                }
            }
            else {

                //是录音文件
                if (data[k].IsDisplay) {
                    addFile3(data[k]);
                }

            }
        }

        var td_material = $("td_material");
        var tableA = $B("table");
        var tbody = $B("tbody");
        tbody.id = "fileTbody";
        tableA.appendChild(tbody);
        tableA.className = 'uploadFileTable EllipsTable'
        var resourceLength = data2.length;
        //3在这里表示一行显示column个附件
        var len1 = resourceLength / column;
        var len2 = resourceLength % column;
        var len3 = parseInt(resourceLength / column);
        var currentIndex = 0;
        if (len1 == len3) {
            //说明刚好是整数被。
            for (var i = 1; i <= len1; i++) {
                var tr = $B("tr");
                for (var j = 1; j <= column; j++) {
                    createSoundTd(tbody, tr, currentIndex, data2, j);
                    currentIndex++;
                }
            }
        }
        else {
            //如果附件个数不是整数倍时
            for (var i = 1; i <= len3 + 1; i++) {
                var tr = $B("tr");
                for (var j = 1; j <= column; j++) {
                    //判断是否还要继续添加
                    if (currentIndex < resourceLength) {
                        createSoundTd(tbody, tr, currentIndex, data2, j);
                        currentIndex++;
                    }
                }
            }
        }
        td_material.appendChild(tableA);

    }
    hideWaitMask();

}

function addFile2(data) {

    var fileName = data.ResourceName;
    var resourceId = data.ResourceID;

    $("div_summary").removeAttribute("disabled");
    $("div_summary").style.cursor = "pointer";
    $("div_summary").src = "../../3CV32/images/btn_summary.png";
    $("div_summary").onmouseover = function () {
        $("div_summary").src = "../../3CV32/images/btn_summary_hover.png";
    }
    $("div_summary").onmouseout = function () {
        $("div_summary").src = "../../3CV32/images/btn_summary.png";
    }

    $("div_summary").onclick = function () {
        //记录下载情况
        document.getElementById('frm').src = "../../DownLoadFile/DownLoadHandler.ashx?ResourceID=" + resourceId;
        RecordDownLoadInfo(IMUserID, data.ResourceID, data.MeetingID, data.ResourceType);

        BehaviorRecord(2, 1, 1, $V("hid_internalID"), data.MeetingID, 1, 0, 1);
        //增加功能点统计（速记"001800040010"）
        AddUserAction(internalUserID, "001800040010");
    }
}

function addFile3(data) {
    var RecordName = data.RecordName;
    var SoundFileID = data.SoundFileID;

    $("div_record").removeAttribute("disabled");
    $("div_record").style.cursor = "pointer";
    $("div_record").src = "../../3CV32/images/btn_record.png";
    $("div_record").onmouseover = function () {
        $("div_record").src = "../../3CV32/images/btn_record_hover.png";
    }
    $("div_record").onmouseout = function () {
        $("div_record").src = "../../3CV32/images/btn_record.png";
    }

    $("div_record").onclick = function (RecordName, SoundFileID) {
        //点击一次后禁用按钮
        $("div_record").disabled = "disabled";
        $("div_record").style.cursor = "default";
        $("div_record").src = "../../3CV32/images/btn_record_disable.png";

        //记录下载情况
        RecordDownLoadInfo(IMUserID, data.RecordID, data.MeetingID, 2);

        BehaviorRecord(2, 1, 1, $V("hid_internalID"), data.MeetingID, 2, 0, 1);
        //增加功能点统计（录音"001800040011"）
        AddUserAction(jQuery("#hid_internalID").val(), "001800040011");

        //进行录音播放
        var fieldId = data.SoundFileID;
        isAudioEnd = isFinalRecord(fieldId);

        if (!fieldId || fieldId == lastFileId) {
            //如果后续的实时录音文件没有找到 也显示播放完毕 不再播放
            $("playStatusHint").innerText = "会议录音播放完毕";
            return;
        }

        lastFileId = fieldId;
        playRecord($V("txt_SoundFilePath"), fieldId);
        return;
    }
}

function playAudio(name, SoundFileID) {

    //现在不是调用自己的播放器播放音乐文件，而是调用unix服务器上的播放。
    var url = $V("txt_SoundFilePath");
    var randomNum = createNum();
    randomNum += SoundFileID + new Date().getHours();
    url += randomNum;
    window.open(url, 'new', 'height=80px,width=600px');

}
function createSoundTd(tbody, tr, currentIndex, data, j) {
    var uploadFile = data[currentIndex];
    var Index = uploadFile.ResourceName.lastIndexOf(".");
    var fileName = replaceLtAndGt(uploadFile.ResourceName);
    var resourceId = data[currentIndex].ResourceID;
    var td = $B("td");
    //为每个单元格加样式
    addFile(tbody, tr, td, fileName, resourceId, data);
}
function clearMaterial(argElement) {
    var td_material = $(argElement);
    var count = td_material.childNodes.length;
    for (var j = 0; j < count; j++) {
        td_material.removeChild(td_material.firstChild);
    }
}
function addFile(container, tr, td, fileName, resourceId, data) {
    var Index = fileName.lastIndexOf(".");
    var suffix = fileName.substring(Index);
    var simSuffix = suffix.substring(1, suffix.length);
    var regFile = new RegExp(simSuffix);
    var matchsFile = regFile.exec(FileSuffix);
    //加文件图标
    var fileIcon = $B("img");
    fileIcon.src = "../images/3C_38.gif";

    //加连接
    var resource = $B("a");
    resource.title = fileName;
    resource.onclick = (function () {
        return function () {
            //记录下载情况
            document.getElementById('frm').src = "../../DownLoadFile/DownLoadHandler.ashx?ResourceID=" + resourceId;
            RecordDownLoadInfo(IMUserID, data[0].ResourceID, data[0].MeetingID, 1);
        }
    })();

    resource.innerHTML = cutString2(fileName, 30);
    resource.className = "fileASyle";
    fileIcon.className = "handStyle";
    td.appendChild(fileIcon);
    td.appendChild(resource);
    tr.appendChild(td);
    container.appendChild(tr);
}

function createEmceeList(obj, data, type) {
    obj.innerHTML = "";
    var count = data.length;
    var html = new StringBuffer();
    html.append("<table style='width:95%;' ><tr><td style='width:80px; vertical-align:top; padding-top:2px;'>");
    if (type == 2) {
        html.append("<div class='typeNameStyle'>会议主讲人：</div>");
    }
    else {
        html.append("<div class='typeNameStyle'>会议主持人：</div>");
    }
    html.append("</td>");
    html.append("<td  vertical-align:top;>");
    html.append("<table style='width:100%;' >");

    for (var i = 0; i < count; i++) {
        var position1 = data[i].Position == undefined ? "" : data[i].Position;
        position1 = (position1 == "" ? "" : "[" + position1 + "]");

        var Description = typeof (data[i].Description) == "undefined" ? "" : data[i].Description;

        html.append("<tr>");
        if (data[i].IwindID == "") {
            html.append("<td style='width:50%;height:35px;vertical-align:top;line-height:25px;  '>");
        }
        else {
            html.append("<td style='width:50%;height:35px;vertical-align:top;'>");
        }
        if (Description != "") {
            html.append("<span class='nameStyle' id='span_" + i + type + "' onmouseover='showDescription(\"" + Description + "\",\"span_" + i + type + "\")' >" + data[i].UserName + "</span>");
        }
        else {
            html.append("<span class='nameStyle' id='span_" + i + type + "' >" + data[i].UserName + "</span>");
        }
        html.append("<span class='PositionStyle' title='" + data[i].Position + "'>" + position1 + "</span>");
        if (data[i].IwindID) {
            //增加一个加好友的功能
            html.append("<button  class='addFriend' onclick='addFriend(\"" + data[i].IwindID + "\")' onmouseout=this.className='addFriend' onmouseover=this.className='addFriendHover'></button>");
        }
        html.append("</td>");
        html.append("</tr>");
    }
    html.append("</table>");
    html.append("</td>");
    html.append("</tr></table>");

    $(obj).innerHTML = html.toString();
    html.clear();
}

function getEmceeData() {
    var parameterArray = new Array($.Request("meetingId"));
    var dataParameters = { MethodAlias: "GetEmceeList", Parameter: parameterArray };
    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: renderEmceeData, onError: showError });
}

function renderEmceeData(xmlhttp) {
    var result = xmlhttp.responseText.toJSON();
    if (result && result.Data) {
        var speechData = getEmccDate(result.Data, 2);
        var emceeData = getEmccDate(result.Data, 1);

        if (speechData.length) {
            createEmceeList("div_speechmaker", speechData, 2);
        }
        if (emceeData.length) {
            createEmceeList("div_emcee", emceeData, 1);
        }

    }
}

function getEmccDate(data, type) {
    var listData = [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].Role == type) {
            listData.push(data[i]);
        }
    }
    return listData;
}

function showDescription(content, target) {
    var p = {};
    p["target"] = target;
    p["width"] = "150";
    p["msg"] = content;
    p["time"] = 20;
    Wind.UI.Hint(p);
}

function addFriend(account) {
    window.location.href = "!COMMANDPARAM(149,Email=" + account + ";1)";
}

//判断是否要去获取客户类型
function checkLimit() {

    //增加判断，是否有Iwind帐号，如果没有，不允许报名
    if (isLoginIwind == false) {
        CanotJoinMeeting();
        return;
    }

    if (CurMeeting.limitCompanyType && CurMeeting.limitCompanyType.length > 0) {
        if (isLimit()) {
            alertDialog.DataBind('alertWin', { title: '', content: "对不起，您没有权限报名参加该场会议，给您带来的不便深表抱歉!" });
        }
        else {
            //修改为按状态进行判断 预约还是voip参会(tfzheng 20151103)
            bookOrJoinMeeting();
        }
    }
    else {
        //修改为按状态进行判断 预约还是voip参会(tfzheng 20151103)
        bookOrJoinMeeting();
    }
}



//判断是否在限制列表中
function isLimit() {
    var limitArray = CurMeeting.limitCompanyType.split(',');
    var returnValue = "";
    if (!currentPersonCompanyType) {
        currentPersonCompanyType = "未知行业";
    }
    for (var i = 0; i < limitArray.length; i++) {
        if (limitArray[i] == currentPersonCompanyType) {
            return currentPersonCompanyType;
        }
    }
    return returnValue;
}


function FindContact() {

    var parameterArray = new Array($V("hid_InternalID"), 0);
    var dataParameters = { MethodAlias: "FindContact", Parameter: parameterArray };

    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: returnFindContact, onError: showError });

}

function returnFindContact(xmlhttp) {
    var result = xmlhttp.responseText.toJSON();
    if (result != null && result != "") {
        if (result.State == 0) {
            var contact = result.Data;
            if (contact) {
                IMUserID = contact.IMID;
                currentPersonCompanyType = contact.CompanyType;
            }
        }
    }

    //tfzheng (20151202)
    //因为在查询会议信息时查询我的收藏 所以需要先获取到imid之后才能调用readConferenceDetails
    //因此将readConferenceDetails的调用移至FindContact的回调函数中
    //但im响应慢的时候会影响页面加载速度 后续需要进行业务调整与优化
    readConferenceDetails(meetingId);
}



function isLogin() {
    var parameterArray = new Array($V("hid_internalID"));
    var dataParameters = { MethodAlias: "IsUserOnlineByCRMId", Parameter: parameterArray };

    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: returnIsLogin, onError: showError });
}


function returnIsLogin(xmlhttp) {

    var result = xmlhttp.responseText.toJSON();

    //tfzheng (20160202)
    //如果用户已登录，再去查询用户信息
    //否则直接查询会议信息
    if (result && result.Data == true) {
        isLoginIwind = true;
        FindContact();
    }
    else {
        isLoginIwind = false;
        readConferenceDetails(meetingId);
    }
}


function CanotJoinMeeting() {
    var alertWClose = new AlertDialog(loginInIwind);
    alertWClose.DataBind('alertWin', { title: '', content: "报名参加3C中国财经会议，请先登录iWind" });
}

function loginInIwind() {
    $("#logonIwind").click();
}

//使用示例图片进行网络测试
var speedMeasureST;
var speedMeasureET;
function speedMeasure() {
    var imgtest = document.createElement("div");
    var html = "<img style='width:0px; height:0px; display:none;' src='../../3CV32/images/speedmeasure.png' onload='getSpeed();'></img>";
    imgtest.innerHTML = html;

    speedMeasureST = new Date();
    document.appendChild(imgtest);
}

function getSpeed() {
    speedMeasureET = new Date();
    var fileSize = 67537; //B
    var speed = fileSize / (speedMeasureET - speedMeasureST) / 1.024; //KB/s
    if (speed > SpeedThreshold) {
        joinVoip();
    }
    else {
        alertDialog.DataBind('alertWin', { title: '', content: "您的网速较慢，请使用电话拨入" });
    }
}


//提示用户是否立即下载该文件
function confirmDownload() {
    if (confirm("请安装最新版3CMeeting客户端,是否立即下载?")) {
        var heightNew = 250;
        var widthNew = 400;   
        var leftNew = 0;
        var topNew = 0;

        try {
            leftNew = (screen.width - widthNew) / 2;
            topNew = (screen.height - heightNew) / 2;
        }
        catch (e) {

        }

        window.open($V("hid_3CSetupUrl"), 'Download', "left=" + leftNew + ",top=" + topNew + ",width=" + widthNew + ",height=" + heightNew);
        window.close();
    }
}

//检查ActiveX插件是否安装
//wft为32位
function checkVoip() {
    C3MeetingObj = document.getElementById("C3MeetingOcx");

    //版本校验
    try {
        //需要下载最新版本客户端
        if (C3MeetingObj.GetCurVersion(0) != "1.3.0.0") {
            confirmDownload();
            return;
        }
    }
    catch (e) {
        //尚未安装客户端
        confirmDownload();
        return;
    }

    //进行网速测试
    speedMeasure();
}

//调用voip加入会议接口 (tfzheng 20151103)
function joinVoip() {
    try {
        var svrIp = $V("#hid_VoipServerUrl");
        var stunSvr = $V("#hid_StunServerUrl");
        var strKeys = "";
        if (JoinInfo.MeetingRoom.toString() != "" && JoinInfo.MeetingPwd.toString() != "") {
            strKeys = JoinInfo.MeetingRoom.toString() + "#" + JoinInfo.MeetingPwd.toString() + "#";
        }
        if (strKeys != "") {
            C3MeetingObj.VoipQuickClose();
            var ret = C3MeetingObj.VoipQuickCall(svrIp, strKeys, stunSvr, 0);
            if (ret == 0) {
                $("PlayerInterface").show();
                $("playStatusHint").innerText = "您已成功进入会议室";
                updateJoinMeetingTime();
            }
            else {
                $("playStatusHint").innerText = "加入会议失败(" + ret + ")";
            }
        }
        else {
            alert("会议室密码异常");
        }
    }
    catch (e) {
        
    }
}

function closePage() {
    try {
        C3MeetingObj.VoipQuickClose();
    }
    catch (e) {

    }
}

//按状态进行判断 预约还是voip参会(tfzheng 20151103)
function bookOrJoinMeeting() {
    if (addMeetingStatus == 0) {
        addMeeting();
    }
    else if (addMeetingStatus == 1) {
        $("div_add").disabled = 'disabled';
        $("div_add").style.cursor = "default";
        checkVoip();
    }
}

function playRecord(serverIp, fileId) {
    if (isAudioEnd == -1) {
        //无录音文件
    }
    else if (isAudioEnd == 1 && playCnt == 0) {
        playCnt++;
        //直接打开就是最终录音文件 显示进度条与当前时间
        $("PlayerInterface").show();
        $("playStatusHint").innerText = "正在播放会议录音...";
        s_createAudio(serverIp, fileId, "AudioObj", "PI_BB", "PI_PB", "AudioCurTime", "AudioTotalTime", 3);
    }
    else {
        playCnt++;
        //实时录音 只显示当前时间
        $("PlayerInterface").show();
        $("playStatusHint").innerText = "正在播放会议实时录音...";
        s_createAudio(serverIp, fileId, "AudioObj", "PI_BB", "PI_PB", "AudioCurTime", "AudioTotalTime", 1);
    }
}

var playCnt = 0;
var lastFileId = "";
//获取(实时)录音信息
function getRecord() {

    //type为2时查询录音
    var parameterArray = new Array(meetingId, 2);
    var dataParameters = { MethodAlias: "GetResourceAndRecord", Parameter: parameterArray };
    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: renderGetRecord, onError: showError });
}

//getRecord回调
function renderGetRecord(xmlhttp) {
    var result = xmlhttp.responseText.toJSON();
    if (result && result.Data) {
        var data = result.Data.toJSON();
        for (var k = 0; k < data.length; k++) {
            if (data[k].ResourceType) {

            }
            else {
                //是录音文件
                if (data[k].IsDisplay) {
                    var fieldId = data[k].SoundFileID;
                    isAudioEnd = isFinalRecord(fieldId);

                    if (!fieldId || fieldId == lastFileId) {
                        //如果后续的实时录音文件没有找到 也显示播放完毕 不再播放
                        $("playStatusHint").innerText = "会议录音播放完毕";
                        return;
                    }

                    lastFileId = fieldId;
                    playRecord($V("txt_SoundFilePath"), fieldId);
                    return;
                }
            }
        }
    }
}

//根据录音文件名判断录音文件是否是最终文件 是返回1 否返回0
function isFinalRecord(fieldId) {
    if (fieldId.substr(fieldId.length - 1, 1) == "-")
        return 0;
    return 1;
}


//当前录音文件播放完毕后 audioplayer.js将回调该方法播放下一录音
function audioSwitchCallBack() {
    if (isAudioEnd == 0) {
        getRecord();
        return;
    }
    $("playStatusHint").innerText = "会议录音播放完毕";
}



//倒计时牌代码
var msCountDown;
var leftHour = 0;
var leftMinute = 0;
var leftSecond = 0;
//校时间隔 单位秒
var updateCTInterval = 300;
//校时计数
var updateCTCount = 0;

function startCountDown() {
    var dtCurrentTime = getSysTime();
    msCountDown = dtMeetingStartTime - dtCurrentTime;
    if (msCountDown > 0) {
        updateCountDownPerSec();
    }
}

//获取服务器时间
function getServerTime() {
    var xmlHttp = false;
    try {
        xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
    }
    catch (e) {
        try {
            xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        catch (e) {
            xmlHttp = false;
        }
    }

    if (!xmlHttp && typeof XMLHttpRequest != 'undefined') {
        xmlHttp = new XMLHttpRequest();
    }

    xmlHttp.open("GET", "null.txt", false);
    xmlHttp.setRequestHeader("Range", "bytes=-1");
    xmlHttp.send(null);

    //获取服务器时间
    return (new Date(xmlHttp.getResponseHeader("Date")));
}

//获取本地时间
function getLocalTime() {
    return (new Date());
}

//获取系统时间
function getSysTime() {
    var tmpRetTime;
    //先获取服务器时间 如果获取系统时间失败则获取本地时间
    try {
        tmpRetTime = getServerTime();
    }
    catch (e) {
        tmpRetTime = getLocalTime();
    }
    return tmpRetTime;
}

//每秒刷新倒计时时间
function updateCountDownPerSec() {

    //每过updateCTInterval秒进行校时
    if (updateCTCount >= updateCTInterval) {
        var dtCurrentTime = getSysTime();
        msCountDown = dtMeetingStartTime - dtCurrentTime;
        updateCTCount = 0;
    }

    //到达会议开始时间
    if (msCountDown <= 0) {
        $("divHourLeft").innerText = toTwoDigit(0);
        $("divMinLeft").innerText = toTwoDigit(0);
        $("divSecLeft").innerText = toTwoDigit(0);

        //会议开始后自动刷新页面是否可参会状态
        if (myStatus == "1") {
            //当前已经是可voip参会的状态 addMeetingStatus置1
            addMeetingStatus = 1;
            $("div_add").removeAttribute("disabled");
            $("div_add").style.cursor = "pointer";
            $("div_add").src = "../../3CV32/images/btn_joinmeeting.png";
            $("div_add").onmouseover = function () {
                $("div_add").src = "../../3CV32/images/btn_joinmeeting_hover.png";
            }
            $("div_add").onmouseout = function () {
                $("div_add").src = "../../3CV32/images/btn_joinmeeting.png";
            }
        }
        return;
    }

    leftHour = Math.floor(msCountDown / (3600 * 1000));
    //计算出小时数
    var leave1 = msCountDown % (24 * 3600 * 1000);     //计算天数后剩余的毫秒数
    //计算相差分钟数
    var leave2 = leave1 % (3600 * 1000);         //计算小时数后剩余的毫秒数
    leftMinute = Math.floor(leave2 / (60 * 1000));
    //计算相差秒数
    var leave3 = leave2 % (60 * 1000);       //计算分钟数后剩余的毫秒数
    leftSecond = Math.round(leave3 / 1000);

    $("divHourLeft").innerText = toTwoDigit(leftHour);
    $("divMinLeft").innerText = toTwoDigit(leftMinute);
    $("divSecLeft").innerText = toTwoDigit(leftSecond);

    msCountDown -= 1000;
    updateCTCount++;
    setTimeout("updateCountDownPerSec()", 1000);
}

//更新会议收藏状态 state 1添加到收藏 0取消收藏
function updateCollectState(meetingid, imid, state) {
    $("div_collect").disabled = "disabled";
    //state为1时表示已收藏 此时更新收藏状态时对应取消收藏操作 isValid为false
    var isValid = state == 1 ? false : true;
    CollectOperation(meetingid, imid, isValid, false);
}

//更新会议收藏状态回调函数
function collectOperationCallBack(xmlhttp) {
    var result = xmlhttp;
    if (result && result.Data == 1) {
        //更新成功后更改图标显示状态
        collectState = collectState == 1 ? 0 : 1;
        showCollectState(collectState);
    }
}

function showCollectState(state) {
    if (state == 1) {
        $("div_collect").style.cursor = "pointer";
        $("div_collect").src = "../../3CV32/images/btn_cancelcollect.png";
        $("div_collect").onmouseover = function () {
            $("div_collect").src = "../../3CV32/images/btn_cancelcollect_hover.png";
        }
        $("div_collect").onmouseout = function () {
            $("div_collect").src = "../../3CV32/images/btn_cancelcollect.png";
        }
    }
    else {
        $("div_collect").style.cursor = "pointer";
        $("div_collect").src = "../../3CV32/images/btn_addcollect.png";
        $("div_collect").onmouseover = function () {
            $("div_collect").src = "../../3CV32/images/btn_addcollect_hover.png";
        }
        $("div_collect").onmouseout = function () {
            $("div_collect").src = "../../3CV32/images/btn_addcollect.png";
        }
    }
    $("div_collect").removeAttribute("disabled");
}

//收藏按钮onclick事件调用 (tfzheng 20151211)
function collectAction() {
    //如果未登陆im 不允许收藏会议
    if (isLoginIwind) {
        AddUserAction(jQuery("#hid_internalID").val(), "901800040020");
        updateCollectState(meetingId, IMUserID, collectState);
    }
    else {
        var alertWClose = new AlertDialog(loginInIwind);
        alertWClose.DataBind('alertWin', { title: '', content: "如需收藏会议，请先登录iWind" });
    }
}

//调整录音播放音量 (tfzheng 20151202)
function setVolume(curVol, maxVol) {
    try {
        for (var i = 1; i <= maxVol; ++i) {
            var objVolCtrlId = "volCtrl_" + i.toString();
            if (i <= curVol) {
                document.getElementById(objVolCtrlId).style.backgroundColor = "#1C86EE";
            }
            else {
                document.getElementById(objVolCtrlId).style.backgroundColor = "#969696";
            }
        }

        setAudioPlayerVolume(curVol / maxVol);
    }
    catch (e) {

    }
}

//报名成功后回调函数
function closeListWin() {
    window.location.href = window.location.href;
}

var joinTime = 0;
//voip参会时定时更新加入会议时间
function updateJoinMeetingTime() {
    document.getElementById("AudioCurTime").innerText = timeFormat(joinTime / 1000);
    joinTime += 200;
    setTimeout("updateJoinMeetingTime()", 200);
}

//wm登录刷新页面
function WebFunc(a) {

    try {
        var obj = eval('(' + a + ')');
        if (obj.WIMLoginChange == "-47165918" || obj.WIMLoginChange == "-47165919") {
            //window.navigate(window.location.href + "?d=" + getTimeStamp());
            //window.location.reload();
            window.location.href = window.location.href;
        }
    } catch (err) { }
};