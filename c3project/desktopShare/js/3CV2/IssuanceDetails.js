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

var currentHitType = "";
//读取会议内容
function readConferenceDetails(conferenceID) {


    var meetingCond = { MeetingID: conferenceID, UserID: internalUserID };
    var parameterArray = new Array(JSON2.stringify(meetingCond));
    maskDetail = new Wind.UI.Mask();
    maskDetail.showWaitOnTarget("_body");
    AjaxInvoke("GetOneJoinedMeeting", parameterArray, getConferenceDetail);

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

function pad(number) {
    if (number < 10) {
        return '0' + number;
    }
    return number;
}

Date.prototype.toISOString = function () {

    return this.getUTCFullYear() +
        '-' + pad(this.getUTCMonth() + 1) +
        '-' + pad(this.getUTCDate()) +
        ' ' + pad(this.getUTCHours()) +
        ':' + pad(this.getUTCMinutes()) +
        ':' + pad(this.getUTCSeconds())
        ;
};

Date.prototype.toISOStrings = function () {
    return this.getUTCFullYear() +
        '-' + pad(this.getUTCMonth() + 1) +
        '-' + pad(this.getUTCDate());
};

Date.prototype.toISOStringt = function () {
    return pad(this.getUTCHours()) +
        ':' + pad(this.getUTCMinutes());
};

function setDetail(result) {
    if (result && result.Data) {
        var CanJoinStatus = $V("hid_CanJoinStatus");
        result = result.Data;

        var item = new Date(parseInt(result.MeetingStartTime.replace('Date(', '').replace(')', '').replace('/', '').replace('/', '').replace('+0800', '')) + 28800000);
        var item1 = new Date(parseInt(result.MeetingEndTime.replace('Date(', '').replace(')', '').replace('/', '').replace('/', '').replace('+0800', '')) + 28800000);

        //var item1 = new Date(result.MeetingEndTime);
        if (navigator.userAgent.indexOf('MSIE') >= 0) {
            var beginTime = JSON2.dateFormat(result.MeetingStartTime, "yyyy-MM-dd hh:mm:ss");
            var endTime = JSON2.dateFormat(result.MeetingEndTime, "yyyy-MM-dd hh:mm:ss");
        }
        else {

            var beginTime = item.toISOString();

            var endTime = item1.toISOString()
        }
        var MeetingStatus = result.MeetingStatus;

        if (result.MeetingIssuance == 2) {
            $("div_add").disabled = 'disabled';
            $("div_add").className = "waiting";
        }
        else if (result.MeetingIssuance == 3) {

            if (result.PersonCount >= result.MeetingLine) {
                //会议人数已满
                $("div_add").disabled = 'disabled';
                $("div_add").className = "MeetingFull_detail";
            }
            else {
                //                var CancelHourLimit = $V("hid_CancelHourLimit");
                //                CancelHourLimit = CancelHourLimit == "" ? 1 : parseInt(CancelHourLimit);
                //                CancelHourLimit = CancelHourLimit * 10;
                // isCanEdit = compdate(beginTime, new Date(), CancelHourLimit) > 0 ? false : true;
                isCanEdit = compdate(endTime) > 0 ? false : true;
                if (isCanEdit) {
                    //表示还可以加入：会议开始10分钟。 
                    if (myStatus != null && myStatus != undefined && myStatus != '' && myStatus != "0") //已报名
                    {
                        $("div_add").disabled = 'disabled';
                        $("div_add").className = "IssuanceAdded";
                    }
                    else {
                        $("div_add").removeAttribute("disabled");
                        $("div_add").className = "IssuanceAdd";
                    }

                }
                else {
                    $("div_add").disabled = 'disabled';
                    $("div_add").className = "IssuanceUnableAdd";
                }
            }
        }
        else if (result.MeetingIssuance == 4 || result.MeetingIssuance == 5) {
            if (myStatus != null && myStatus != undefined && myStatus != '' && myStatus != "0") //已报名
            {
                $("div_add").disabled = 'disabled';
                $("div_add").className = "IssuanceAdded";
            } else {
                $("div_add").disabled = 'disabled';
                $("div_add").className = "AddEndMeeting_detail";
            }
        }
        else if (result.MeetingIssuance == 9 || result.MeetingIssuance == 6) {
            $("div_add").disabled = 'disabled';
            $("div_add").className = "MeetingEnd_detail";
        }
        else if (result.MeetingIssuance == 10) {
            //会议人数已满
            if (myStatus != null && myStatus != undefined && myStatus != '' && myStatus != "0") //已报名
            {
                $("div_add").disabled = 'disabled';
                $("div_add").className = "IssuanceAdded";
            } else {
                $("div_add").disabled = 'disabled';
                $("div_add").className = "MeetingFull_detail";
            }
        }
        else {
            $("div_add").disabled = 'disabled';
            $("div_add").className = "IssuanceUnableAdd";

        }
    }
    else {
        alertDialog.DataBind('alertWin', { title: '', content: "您所浏览的会议不存在！" });
        //表示读取会议信息出错
        $("div_add").disabled = 'disabled';
        $("div_add").className = "IssuanceUnableAdd";
        hideWaitMask();
        return;
    }

    if (result) {
        var item = new Date(parseInt(result.MeetingStartTime.replace('Date(', '').replace(')', '').replace('/', '').replace('/', '').replace('+0800', '')) + 28800000);
        var item1 = new Date(parseInt(result.MeetingEndTime.replace('Date(', '').replace(')', '').replace('/', '').replace('/', '').replace('+0800', '')) + 28800000);

        var MeetingContent = replaceBracket(TransferSpecialChar(result.MeetingContent));
        var MeetingTitle = replaceBracket(TransferSpecialChar(result.MeetingTitle));
        //读取会议详细信息
        if (navigator.userAgent.indexOf('MSIE') >= 0) {
            //读取会议详细信息
            $("lb_meetingTime").innerHTML = JSON2.dateFormat(result.MeetingStartTime, "yyyy-MM-dd") + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + JSON2.dateFormat(result.MeetingStartTime, "hh:mm") + "-" + JSON2.dateFormat(result.MeetingEndTime, "hh:mm")

        }
        else {
            $("lb_meetingTime").innerHTML = item.toISOStrings() + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + item.toISOStringt() + "-" + item1.toISOStringt();
        }
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

function compdate(endTime) {
    var yyyy = parseFloat(endTime.substr(0, 4));
    var MM = parseFloat(endTime.substr(5, 2));
    var dd = parseFloat(endTime.substr(8, 2));
    var hh = parseFloat(endTime.substr(11, 2));
    var mm = parseFloat(endTime.substr(14, 2));
    var ss = parseFloat(endTime.substr(17, 2));

    endTime = new Date(yyyy, MM - 1, dd, hh, mm, ss);
    endCount = endTime.getTime();
    nowCount = new Date().getTime();
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
    var href_Material = $("href_summary");
    href_Material.style.display = "";
    var fileName = data.ResourceName;
    var resourceId = data.ResourceID;
    href_Material.className = "fileASyle";
    href_Material.onclick = (function () {
        return function () {
            //记录下载情况
            document.getElementById('frm').src = "../../DownLoadFile/DownLoadHandler.ashx?ResourceID=" + resourceId;
            RecordDownLoadInfo(IMUserID, data.ResourceID, data.MeetingID, data.ResourceType);

            BehaviorRecord(2, 1, 1, $V("hid_internalID"), data.MeetingID, 1, 0, 1);
            //增加功能点统计（速记"001800040010"）
            AddUserAction(internalUserID, "001800040010");
        }
    })();
}

function addFile3(data) {
    var href_Sound = $("href_record");
    href_Sound.style.display = "";
    var RecordName = data.RecordName;
    var SoundFileID = data.SoundFileID;
    href_Sound.className = "fileASyle";
    href_Sound.onclick = (function (RecordName, SoundFileID) {
        return function () {
            playAudio(RecordName, SoundFileID);

            //记录下载情况
            RecordDownLoadInfo(IMUserID, data.RecordID, data.MeetingID, 2);

            BehaviorRecord(2, 1, 1, $V("hid_internalID"), data.MeetingID, 2, 0, 1);
            //增加功能点统计（录音"001800040011"）
            AddUserAction(internalUserID, "001800040011");
        }
    })(RecordName, SoundFileID);

}
function playAudio(name, SoundFileID) {

    //现在不是调用自己的播放器播放音乐文件，而是调用unix服务器上的播放。
    var url = $V("txt_SoundFilePath");
    var randomNum = createNum();
    randomNum += SoundFileID + new Date().getHours();
    url += randomNum;
    //window.open(url,'new','height=80px,width=600px');
    myIEAdapter.openURL(url, '', 120, 640);

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
            addMeeting();
        }
    }
    else {
        addMeeting();
    }
}

//判断是否在限制列表中
function isLimit() {
    var limitArray = CurMeeting.limitCompanyType.split(',');
    var returnValue = "";
    if (!currentPersonCompanyType) {
        currentPersonCompanyType = "其它";
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

}



function isLogin() {
    var parameterArray = new Array($V("hid_internalID"));
    var dataParameters = { MethodAlias: "IsUserOnlineByCRMId", Parameter: parameterArray };

    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: returnIsLogin, onError: showError });
}


function returnIsLogin(xmlhttp) {

    var result = xmlhttp.responseText.toJSON();

    if (result && result.Data == true) {

        isLoginIwind = true;
    }
    else {
        isLoginIwind = false;
    }
}


function CanotJoinMeeting() {
    var alertWClose = new AlertDialog(loginInIwind);
    alertWClose.DataBind('alertWin', { title: '', content: "报名参加3C中国财经会议，请先登录iWind。" });
}

function loginInIwind() {
    $("#logonIwind").click();
}