var choosedContacts = []; //选中的联系人 缓存
var myContacts = []; //我的联系人数据缓存
var imContacts = []; //im联系人数据缓存
var smyContacts = []; //搜索结果我的联系人数据缓存
var simContacts = []; //搜索结果im联系人数据缓存
var selectObj = { id: "", obj: "" };
var editObj = { id: "", obj: "" };
var w1, isShow = false;
var isAllContacts;

var internalUserID;
var imUserID;

var sortType = 0; //0:按姓名， 1：按WM分组

//内部传递数据模型{ ID: "", ContactName: "", Company: "", MobilePhone: "", Email: "", Department: "", Telephone: "", Position: "", Memo: "" };
//外部发布数据模型{ ID: "", Name: "", Company: "", Mobile: "", Email: ""};


//我的联系人样式显示隐藏
function ChangeUpDown() {
    var oDiv = $("GroupContainer");
    if (oDiv.style.display == "none") {
        oDiv.style.display = "block";
        $("direct").src = "../images/3CV2/down.gif";
    }
    else {
        oDiv.style.display = "none";
        $("direct").src = "../images/3CV2/up.gif";

    }
}

function getWindowContent(type) {
    //var selected ;
    var submitFun;
    var cancelFun;
    var submitAStyle, cancelAStyle;
    if (type == 1) {
        //selected = editObj.obj;
        submitFun = "updateContact()";
        cancelFun = "deleteContactUser()";
        submitAStyle = "saveA";
        cancelAStyle = "deleteA";
    }
    else {
        //selected = { UserID: "", UserName: "", Company: "", MobilePhone: "", Email: "", Telephone: "", Position: "" };
        submitFun = "addNewContact()";
        cancelFun = "closeWindow()";
        submitAStyle = "commitA";
        cancelAStyle = "cancelA";
    }


    var content = new StringBuffer();
    content.append("<div class='editBG'>");
    content.append("<div style=''>");
    content.append("<table class='addMyContact_table'>");
    content.append("<tr><td width='80px' class='title'>姓名：</td><td class='content'><input id='CName' type='text' maxlength='15' style=' width:120px; float:left' value='' /><img style ='float:left;margin:5px 10px' src='../images/need.jpg'/></td></tr>");
    content.append("<tr><td class='title'>手机：</td><td  class='content'><input id='CMobile'  type='text' maxlength='11' style=' width:120px; float:left' value=''/><img style ='; float:left;margin:5px 10px' src='../images/need.jpg'/></td></tr>");
    content.append("<tr><td class='title'>电子邮件：</td><td  class='content'><input id='CEmail' type='text'  maxlength='40' style=' width:210px; float:left' value='' /><img style ='float:left;margin:5px 10px' src='../images/need.jpg'/></td></tr>");
    content.append("<tr><td class='title'>公司名称：</td><td  class='content'><input id='CCompany'  type='text'  maxlength='30' style=' width:210px' value='' /></td></tr>");
    content.append("<tr><td class='title'>公司电话：</td><td  class='content'><input id='CTelComp' type='text'  maxlength='20' style=' width:210px' value='' /></td></tr>");
    content.append("</table>");
    content.append("<div id='ErrorMsg' style=' line-height:25px; color:Red;font-weight:bold;font-size:13px; height:25px;text-align:center'></div>");
    content.append("<div style='width:100%; text-align:center;'>");
    content.append("<table><tr><td>");
    content.append(("<div onclick='{0}' class='{1}'></div>").format(submitFun, submitAStyle));
    content.append("</td><td>");
    content.append(("<div onclick='{0}' class='{1}'></div>").format(cancelFun, cancelAStyle));
    content.append("</td></tr></table>");
    content.append("</div></div></div>");
    return content.toString();

}


function getDetailWindow() {
    var submitFun;
    submitFun = "closeWindow()";

    var content = new StringBuffer();
    content.append("<div class='detailBG' style='height:220px'>");
    content.append("<div style=''>");
    content.append("<table class='addMyContact_table'>");
    content.append("<tr><td width='80px' class='title'>姓名：</td><td class='content'><input id='CName' type='text' readonly=true maxlength='15' style=' width:120px; float:left' value='' /><img style ='float:left;margin:5px 10px' src='../images/need.jpg'/></td></tr>");
    content.append("<tr><td class='title'>手机：</td><td  class='content'><input id='CMobile' readonly=true type='text' maxlength='11' style=' width:120px; float:left' value=''/><img style ='; float:left;margin:5px 10px' src='../images/need.jpg'/></td></tr>");
    content.append("<tr><td class='title'>电子邮件：</td><td  class='content'><input id='CEmail' readonly=true type='text'  maxlength='40' style=' width:210px; float:left' value='' /><img style ='float:left;margin:5px 10px' src='../images/need.jpg'/></td></tr>");
    content.append("<tr><td class='title'>公司名称：</td><td  class='content'><input id='CCompany' readonly=true type='text'  maxlength='30' style=' width:210px' value='' /></td></tr>");
   
    content.append("</table>");
    content.append("<div id='ErrorMsg' style=' line-height:25px; color:Red;font-weight:bold;font-size:13px; height:25px;text-align:center'></div>");
    content.append("<div style='width:100%; text-align:center;'>");
    content.append("<table><tr><td style='text-align:center;'>");
    content.append(("<div onclick='{0}' class='btnOK'></div>").format(submitFun));
    content.append("</td></tr></table></div></div></div>");
    return content.toString();

}


//展现我的联系人窗体
function showContactWindow(type) {//type:0 添加；1：编辑；2：浏览
    var top = (document.documentElement.scrollTop * 2 + document.body.clientHeight - 247) / 2;
    if (type == 1 && selectObj.id == "") {
        window.parent.showAlertWin('', "请先选择联系人！");
        return;
    }
    if (!w1) {
        var t = {};

        t.width = 380;
        t.height = 248;
        t.top = top
        t.isreflashable = false;
        t.ismaxable = false;
        t.isshowclose = true;
        t.isresizeable = false;
        t.isdragable = true;
        t.ismask = false;
        t.isscroll = false;
        t.onclose = disposeWin;
        if (type == 0) {
            t.title = '添加联系人';
        }
        else if (type == 1)
            t.title = '编辑联系人';
        else {
            t.title = 'IM联系人详情';
            t.height = 220;
        }
        w1 = new Wind.UI.Window(t);
    }
    w1.show();
    isShow = true;
    if (type == 2)
        w1.loadData(getDetailWindow());
    else
        w1.loadData(getWindowContent(type));

}

function disposeWin() {
    if (w1) {
        w1.close();
        w1.dispose();
        w1 = null;
        isShow = false;
    }
}

function showAddContactWindow() {
    if (isShow == false) {
        showContactWindow(0);
    }
}

function showEditContactWindow() {
    if (isShow == false) {
        editObj.id = selectObj.id;
        editObj.obj = selectObj.obj;
        showContactWindow(1);

        $("CCompany").value =typeof(editObj.obj.Company)=="undefined"? "":decodeHtmlToStr(editObj.obj.Company);
        $("CName").value =typeof(editObj.obj.UserName)=="undefined"? "":editObj.obj.UserName;
        $("CMobile").value =typeof(editObj.obj.MobilePhone)=="undefined"? "":editObj.obj.MobilePhone;
        $("CEmail").value =typeof(editObj.obj.Email)=="undefined"? "":editObj.obj.Email;
        $("CTelComp").value =typeof(editObj.obj.Telephone)=="undefined"? "":editObj.obj.Telephone;
    }
}

function showImContactDetailWindow() {
    if (isShow == false) {
        editObj.id = selectObj.id;
        editObj.obj = selectObj.obj;
        showContactWindow(2);

        $("CCompany").value =typeof(editObj.obj.Company)=="undefined"? "":editObj.obj.Company; 
        $("CName").value = editObj.obj.UserName;
        $("CMobile").value =typeof(editObj.obj.MobilePhone)=="undefined"? "":editObj.obj.MobilePhone; 
        $("CEmail").value = editObj.obj.Email;
    }
}

function closeWindow() {
    disposeWin();
}


//获取我的联系人列表
function getMyContact() {
    var parameterArray = new Array(internalUserID,imUserID,1);
    if (internalUserID != "")
    {
        AjaxNoSecureInvoke("GetUserListGroup", parameterArray, renderGetContactsInfo);
    }
    else
    {
        AjaxInvoke("GetUserListGroup", parameterArray, renderGetContactsInfo);
    }
      
}


function reLoad() {
    var parameterArray = new Array(internalUserID, imUserID);

    var sort = $("idoNameGroup");
    var sortFun;

    if ((sort.checked && sortType == 0) || (!sort.checked && sortType == 1))
        return;
    //重新加载
    var container = $('GroupContainer');
    container.innerHTML = "<img src=\"../resource/images/default/shared/blue-loading.gif\" style=\"width: 25px; height: 25px\" />"
    
    if (sort.checked) {
        sortType = 0;
        parameterArray.push(1);
    }
    else {
        sortType = 1;
        parameterArray.push(2);
    }        
    if (internalUserID != "")
    {
        AjaxNoSecureInvoke("GetUserListGroup", parameterArray, renderGetContactsInfo);
    }
    else
    {
        AjaxInvoke("GetUserListGroup", parameterArray, renderGetContactsInfo);
    }
}


function pushMyContactsList(list) {
    myContacts = list;
    var num = 0;
    for (var i = 0; i < list.length; i++) {
        for (var j = 0; j < list[i].UserList.length; j++) {
            num++;
        }
    }
    $("ListCount").innerHTML = num;
}


//添加新的我的联系人
function addNewContact() {

    var jsonParams = initParameters(0);

    if (jsonParams != undefined) {
        var group;
        if (sortType == 1)//不同分组添加到不同的组里面
            group = "其他";
        else
            group = "";
        var parameterArray = new Array(group, JSON2.stringify(jsonParams), imUserID,0);
        
        AjaxNoSecureInvoke("InsertOrUpdateContactV2", parameterArray, renderAddInfo);
        
    }
}

function updateContact() {
    var jsonParams = initParameters(1);
    if (jsonParams != undefined) {   
        jsonParams.UserID = editObj.obj.UserID;
        var group;
        if (sortType == 1)//不同分组更新到不同的组里面
            group = "其他";
        else
            group = "";

        var parameterArray = new Array(group, JSON2.stringify(jsonParams), imUserID,1);
  
        AjaxNoSecureInvoke("InsertOrUpdateContactV2", parameterArray, renderUpdateInfo);
        
    }
}

function deleteContactUser() {
    window.parent.showAskWin("", "确定要删除该联系人？", sendDeleteContactUser);
}



function sendDeleteContactUser() {
    closeWindow();
    var userID = selectObj.id;
    var parameterArray = new Array(userID, imUserID);  
    AjaxNoSecureInvoke("DeleteMyContactV2", parameterArray, renderDeleteInfo);
    
}



//获取我的联系人列表呈现
function renderGetContactsInfo(xmlhttp) {
    var result = xmlhttp.responseText.toJSON();

    if (result != "") {
        if (result.State == 0) {
            if (result.Data != null) {
                pushMyContactsList(result.Data);
                buildGroupList(myContacts, false);
            }
        }
        else {
            window.parent.showAlertWin('', result.ErrorMessage);
        }
    }
}


//添加联系人呈现
function renderAddInfo(xmlhttp) {
    var myContactID;
    var key;
    var info;
    var result = xmlhttp.responseText.toJSON();

    if (result != "") {
        if (result.State == 0) {
            if (result.Data != null && result.Data != "") {
                if (result.Data!= "") {
                    window.parent.showAlertWin('', "信息保存成功！");
                    myContactID = result.Data.UserList[0].UserID;
                    key = result.Data.Key;
                    info = result.Data.UserList;
                    addLocalObject(key, info);
                }
                else {
                    window.parent.showAlertWin('', "添加失败，请联系管理员！");
                }

            }

        }
        else {
            window.parent.showAlertWin('', result.ErrorMessage);
        }
    }
}


//更新联系人呈现
function renderUpdateInfo(xmlhttp) {
    var result = xmlhttp.responseText.toJSON();

    if (result != "") {
        if (result.State == 0) {
            if (result.Data != null && result.Data != "") {
                var obj = result.Data;
          
                    window.parent.showAlertWin('', "信息更新成功！");
                    updateLocalObject(obj.UserList[0]); //更新本地数据，此处返回对象为ContactUserInfo，并非：ContactListInfo
           
            }

        }
        else {
            window.parent.showAlertWin('', result.ErrorMessage);
        }
    }
}




//更新联系人呈现
function renderDeleteInfo(xmlhttp) {
    var myContactID;
    var result = xmlhttp.responseText.toJSON();
    if (result != "") {        
        if (result.Data != null && result.Data != "") {
            var obj = result.Data;
            if (obj == 1) {
                window.parent.showAlertWin('', "联系人删除成功！");
                deleteLocakObject(editObj.id);
            }
            else {
                window.parent.showAlertWin('', result.ErrorMessage);

            }
        }
    }
}

//更新本地数据
function addLocalObject(key,info) {
    var group;
    info=info[0];
    var sKey = key;
    var groupNum = 0;
    outloop://跳出外循环
    for (var j = 0; j < myContacts.length; j++) {
        if (myContacts[j].Key == key) {
            group = myContacts[j];
            groupNum = j;
            break outloop;
        }
    }


    if (group != null) {
        myContacts[j].UserList.push(info);
    }
    else {
        var other = { Key: key, UserList: [] };
        other.UserList = [];
        other.UserList.push(info);
        //联系人缓存中插入新分组
        var tempList = [];
        if (myContacts[0].Key > key) {
            tempList.push(other);
        }
        for (var i = 0; i < myContacts.length - 1; i++) {
            tempList.push(myContacts[i]);
            if (myContacts[i].Key < key && myContacts[i + 1].Key > key) {
                tempList.push(other);
            }
        }
        tempList.push(myContacts[myContacts.length - 1]);
        if (myContacts[myContacts.length - 1].Key < key) {
            tempList.push(other);
        }
        myContacts = tempList;


    }

    buildGroupList(myContacts, false);

    $("Group_" + groupNum).click();

    selectContact(info.UserID);

    chooseMyContact(info.UserID, sKey);
        
    
}

//更新本地数据
function updateLocalObject(retObj) {


    //修改成功后，修改项为选中项
    selectObj.id = retObj.UserID;
    selectObj.obj = getMyContactLocal(selectObj.id);

    selectObj.obj.Company = retObj.Company;
    selectObj.obj.Email = retObj.Email;
    selectObj.obj.MobilePhone = retObj.MobilePhone;
    selectObj.obj.Telephone = retObj.Telephone;
    selectObj.obj.UserName = retObj.UserName;

    var groupObj = getMyContactGroup(selectObj.id);

    $("contact_" + groupObj.Key).innerHTML = buildGroupContact(groupObj);
    
    if ($(selectObj.id) != null) {
        $(selectObj.id).focus();
        $(selectObj.id).className = "myContact_hover";
    }
    

    var tempObj = getMyContactObject(selectObj.obj);
    //缓存选中联系人数据
    for (var i = 0; i < choosedContacts.length; i++) {
        if (choosedContacts[i].ID == selectObj.id) {
            choosedContacts[i] = tempObj;
            break;
        }
    }

    //选中的对象
    var divAdded = $("added" + selectObj.id);
    if (divAdded != null) {
        divAdded.childNodes[0].innerHTML = tempObj.Name;
        divAdded.childNodes[0].title = tempObj.Name;
        divAdded.childNodes[1].innerHTML = tempObj.Company;
        divAdded.childNodes[1].title = tempObj.Company;
    }

}

function deleteLocakObject(deleteID) {

    //缓存选中联系人数据
    for (var i = 0; i < choosedContacts.length; i++) {
        if (choosedContacts[i].ID == deleteID) {
            choosedContacts.remove(choosedContacts[i]);
            break;
        }
    }

    outloop://跳出外循环
    for (var j = 0; j < myContacts.length; j++) {
        for (var t = 0; t < myContacts[j].UserList.length; t++) {
            if (myContacts[j].UserList[t].UserID == deleteID) {
                myContacts[j].UserList.remove(myContacts[j].UserList[t]);
                break outloop;
            }
        }
    }

    var node = $(deleteID);
    node.parentNode.removeChild(node);
    selectObj.obj = "";
    selectObj.id = "";

    var addedNode = $("added" + deleteID);
    if (addedNode != null)
        addedNode.parentNode.removeChild(addedNode);

    $("SelectedNum").innerHTML = choosedContacts.length;
}





function AjaxInvoke(method, parameterArray, CompleteFunction) {
    var dataParameters = { MethodAlias: method, Parameter: parameterArray };
    Ajax.Request({ url: "../AjaxSecureHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: CompleteFunction, onError: showError });
}

function AjaxNoSecureInvoke(method, parameterArray, CompleteFunction) {
    var dataParameters = { MethodAlias: method, Parameter: parameterArray };
    Ajax.Request({ url: "../AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: CompleteFunction, onError: showError });
}

function showError(xmlhttp) {
    var mes = "操作过程中发生了错误，请联系管理员! \r\n 错误代码:  " + xmlhttp.status;
    if ((xmlhttp.status + "").substr(0, 3) == "500") {
        window.parent.showAlertWin('', "您好，由于网络原因导致请求失败，请您稍后再试！");
        writeErrorLog(mes);
    }
    else {
        window.parent.showAlertWin('', mes);
    }
}


//将联系人信息构造成联系人对象的json格式
function initParameters(type) {
    $('ErrorMsg').innerHTML = "";

    var email = $V("CEmail").replace(/\s/g, "");
    var contactName = $V("CName").replace(/\s/g, "");
    var company = $V("CCompany").replace(/\s/g, "");
    var telComp = $V("CTelComp").replace(/\s/g, "");
    var telMobile = $V("CMobile").replace(/\s/g, "");

    var remark = $V("CRemark").replace(/\s/g, "");

    var re = false;


    var dupValue = CheckEmailDuplicate(email, telMobile, type);


    if (!Validator.required(contactName)) {
        //alert('姓名不能为空');
        $('ErrorMsg').innerHTML = "姓名不能为空!"
        $('CName').focus();
        re = false;
    }
    else if (Validator.CName(contactName)) {
        $('ErrorMsg').innerHTML = "姓名只能输入英文字符、数字或中文!"
        $('CName').focus();
        re = false;
    }
    else if (!Validator.required(telMobile)) {
        $('ErrorMsg').innerHTML = "手机号不能为空!"
        $('CMobile').focus();
        re = false;
    }
    else if (!Validator.mobile(telMobile) || (telMobile.length != 11)) {
        $('ErrorMsg').innerHTML = "请输入正确的手机号码!"
        $('CMobile').focus();
        re = false;
    }
    else if (!Validator.required(email)) {
        $('ErrorMsg').innerHTML = "邮箱不能为空!"
        $('CEmail').focus();
        re = false;
    }

    else if (!Validator.email(email)) {
        $('ErrorMsg').innerHTML = "邮箱格式不对!"
        $('CEmail').focus();
        re = false;
    }

    else if (telComp.length > 0 && !Validator.phone(telComp)) {
        $('ErrorMsg').innerHTML = "公司电话只能为数字,分机请加\"-\"!"
        $('CTelComp').focus();
        re = false;
    }

    else if (dupValue == 2) {
        $('ErrorMsg').innerHTML = "手机号在联系人列表中已经存在!"
        $('CMobile').focus();
        re = false;
    }
    else if (dupValue == 1) {
        $('ErrorMsg').innerHTML = "电子邮件在联系人列表中已经存在!"
        $('CEmail').focus();
        re = false;
    }

    else {
        re = true;
    }
    if (re) {

        var dataParameters = { UserID: "", UserName: contactName, MobilePhone: telMobile, Email: email, Company: company,  Telephone: telComp};

        closeWindow();
        return dataParameters;
    }
}



//检查联系人Email重复
function CheckEmailDuplicate(mail, Mobile, type) {
    if (type == 0) {//添加
        for (var i = 0; i < myContacts.length; i++) {
            for (var j = 0; j < myContacts[i].UserList.length; j++) {
                if (myContacts[i].UserList[j].MobilePhone == Mobile)
                    return 2;
                if (myContacts[i].UserList[j].Email == mail)
                    return 1;
            }

        }
    }
    else { //更新
        for (var i = 0; i < myContacts.length; i++) {
            for (var j = 0; j < myContacts[i].UserList.length; j++) {
                if (myContacts[i].UserList[j].UserID != editObj.obj.UserID && myContacts[i].UserList[j].Email == mail)
                    return 1;
                if (myContacts[i].UserList[j].UserID != editObj.obj.UserID && myContacts[i].UserList[j].MobilePhone == Mobile)
                    return 2;
            }
        }
    }
    return 0;
}





//*********画联系人列表***********//
//构建IM联系人列表
function buildMyContact(obj, isBrand,index) {
    var brand = isBrand == true ? "block" : "none";
    var load = isBrand == true ? "1" : "0";
    var content = new StringBuffer();
    content.append(("<div id='group_{3}' onclick=\"loadContact(this,'{2}','{3}')\" loaded='{1}' class='group'>{0}</div>").format(obj.Key,load, decodeHtmlToStr(obj.Key),index));
    content.append(("<div id=\"contact_{0}\" style=\"display:{1}\">").format(index, brand));
    if (isBrand == true) {
        content.append(buildGroupContact(obj,index));
    }
    content.append("</div>");
    return content.toString();
}

function buildGroupContact(obj,index) {

    var content = new StringBuffer();
    content.append("<table style='table-layout:fixed; '>");
    for (var index = 0; index < obj.UserList.length; index++) {
        content.append(("<tr class='myContact' id='{0}' onclick=\"selectContact('{1}')\" ondblclick=\"chooseMyContact('{1}','{2}')\"><td style='width:30px'>").format(obj.UserList[index].UserID, obj.UserList[index].UserID, obj.Key));
        var auth = "";
        if (obj.UserList[index].UserRank == "1")
            auth = "<img alt='' src='../images/3CV2/phone.gif' style='Margin-left:10px' />";
        else if (obj.UserList[index].UserRank == "2")
            auth = "<img alt='' src='../images/3CV2/v.gif' style='Margin-left:10px'/>";
        content.append(auth);
        content.append("</td><td style='width:80px'>");
        content.append(("<div class='myContact_Name'>{0}</div>").format(obj.UserList[index].UserName));
        content.append("</td><td  style='width:180px'>");
        content.append(("<div class='myContact_Comp'>{0}</div></div>").format(obj.UserList[index].Company));
        content.append("</td><td>");
        if (obj.UserList[index].UserFrom == "1")
            content.append(("<div class='myContact_Detail' onclick=\"showDetailInfo('{0}')\"></div>").format(obj.UserList[index].UserID));
        else
            content.append(("<div class='myContact_Edit' onclick=\"selectContactAndEdit('{0}')\"></div>").format(obj.UserList[index].UserID));
        content.append("</td></tr>");
    }
    content.append("</table>");
    return content.toString();
}


//隐藏显示联系人分组列表
function ShowHidden(sid) {
    var oDiv = document.getElementById(sid);
    oDiv.style.display = oDiv.style.display == "none" ? "block" : "none";
}

function loadContact(obj, key,index) {
    var load = obj.getAttribute("loaded");
    var groupObj;
    if (load == '1')
        ShowHidden("contact_" + index);
    else {
        for (var i = 0; i < myContacts.length; i++) {
            if (decodeHtmlToStr(myContacts[i].Key) == key) {
                groupObj = myContacts[i];
                break;
            }
        }
        if (groupObj != null) {
            $("contact_" + index).innerHTML = buildGroupContact(groupObj);
            document.getElementById("contact_" + index).style.display = "block";
            obj.setAttribute("loaded", '1');
        }
    }

}


//1:IM,2:Iwind
function selectContact(sid) {
    if (sid == "")
        return;

    if ($(selectObj.id) != null) {
        $(selectObj.id).className = "myContact"; //恢复以前选中的颜色
        selectObj.id = "";
        selectObj.obj = "";
    }

    selectObj.id = sid;
    selectObj.obj = getMyContactLocal(selectObj.id);
    $(sid).className = "myContact_hover";

}


function selectContactAndEdit(sid) {
    selectContact(sid);
    showEditContactWindow();
}


function showDetailInfo(sid) {
    selectContact(sid);
    showImContactDetailWindow();
}

//双击添加IM联系人
function chooseMyContact(sid, key) {
    if (sid == "")
        return;

    var selected;
    for (var i = 0; i < myContacts.length; i++) {
        if (myContacts[i].Key == key) {
            selected = myContacts[i].UserList;
            break;
        }
    }

    if (!checkContactExist(sid)) {
        var obj = getIMContactObject(selected, sid);
        choosedContacts.push(obj);
        $("SelectedNum").innerHTML = choosedContacts.length; //更新选中数量
        var item = new StringBuffer();
        var id = 'added' + sid;
        item.append(("<div class='addedContact' id = '{0}'>").format(id));
        item.append(("<div class='addedContact_userName'>{0}</div>").format(obj.Name));
        item.append(("<div class='addedContact_Comp'>{0}</div>").format(obj.Company));
        item.append(("<div class='deleteDiv'><img style='vertical-align:bottom; cursor:pointer;' src='../images/3CV2/delete-f.gif' onmouseleave=\"this.src ='../images/3CV2/delete-f.gif'\" onmouseover=\"this.src ='../images/3CV2/delete.gif'\" onclick=\"deleteContact('{0}')\"/></div></div>").format(sid));

        var container = $('Contact_Choosed');
        container.innerHTML = container.innerHTML + item.toString();
    }
}



//获取IM联系人对象_对外使用
function getIMContactObject(groupObj, sid) {
    var obj = { ID: "", Name: "", Company: "", Mobile: "", Email: "" };
    var temp = null;
    for (var i = 0; i < groupObj.length; i++) {
        if (groupObj[i].UserID == sid) {
            temp = groupObj[i];
            break;
        }
    }
    if (temp != null) {
        obj.ID = temp.UserID;
        obj.Name = temp.UserName;
        obj.Company = temp.Company;
        obj.Mobile = temp.MobilePhone;
        obj.Email = temp.Email;

    }
    return obj;
}


//获取我的联系人对象_对外使用
function getMyContactObject(localObj) {
    var obj = { ID: "", Name: "", Company: "", Mobile: "", Email: "" };

    obj.ID = localObj.UserID;
    obj.Name = localObj.UserName;
    obj.Company = localObj.Company;
    obj.Mobile = localObj.MobilePhone;
    obj.Email = localObj.Email;

    return obj;
}


//获取我的联系人对象_对内使用
function getMyContactLocal(sid) {
    var temp = null;
    outloop:
    for (var j = 0; j < myContacts.length; j++) {
        for (var t = 0; t < myContacts[j].UserList.length; t++) {
            if (myContacts[j].UserList[t].UserID == sid) {
                temp = myContacts[j].UserList[t];
                break outloop;
            }
        }
    }
    return temp;
}


function getMyContactGroup(sid) {
    var temp = null;
    outloop:
    for (var j = 0; j < myContacts.length; j++) {
        for (var t = 0; t < myContacts[j].UserList.length; t++) {
            if (myContacts[j].UserList[t].UserID == sid) {
                temp = myContacts[j];
                break outloop;
            }
        }
    }
    return temp;
}



//检查联系人是否已经选中
function checkContactExist(sid) {
    for (var i = 0; i < choosedContacts.length; i++) {
        if (choosedContacts[i].ID == sid)
            return true;
    }
    return false;
}

//删除选中的联系人
function deleteContact(sid) {
    for (var i = 0; i < choosedContacts.length; i++) {
        if (choosedContacts[i].ID == sid) {
            choosedContacts.remove(choosedContacts[i]);
            break;
        }
    }
    var id = 'added' + sid;
    var node = $(id);
    node.parentNode.removeChild(node);
    $("SelectedNum").innerHTML = choosedContacts.length;

}
//*********画联系人列表***********//

function searchContacts() {
    var vText = $V("searchInput").trim().toLowerCase();
    if (vText == "请输入姓名或者单位名称")
        vText = "";
    var result;
    if (vText.length > 0) {
        getSearchResult(vText);
        buildGroupList(smyContacts, true);
        isAllContacts = false;
    }
    else if (isAllContacts == false) {
        buildGroupList(myContacts, false);
        isAllContacts = true;
    }
}

function buildGroupList(myList, isBrand) {
    var content = new StringBuffer();
    for (var i = 0; i < myList.length; i++) {
        content.append(buildMyContact(myList[i], isBrand,i));
    }
    var container = $('GroupContainer');
    if (content.toString().length > 0)
        container.innerHTML = content.toString();
    else
        container.innerHTML = "<div style='text-align:center;'>无匹配数据！</div>";

}

//查询匹配联系人
function getSearchResult(vText) {
    smyContacts = [];
    for (var j = 0; j < myContacts.length; j++) {
        var tempList = new Array();
        for (var t = 0; t < myContacts[j].UserList.length; t++) {
            
           if( typeof(myContacts[j].UserList[t].Company)=="undefined")
           {
                if (myContacts[j].UserList[t].UserName.toLowerCase().indexOf(vText) >= 0 ) {
                    tempList.push(myContacts[j].UserList[t]);
                }
           }
           else
           {
                if (myContacts[j].UserList[t].UserName.toLowerCase().indexOf(vText) >= 0 || myContacts[j].UserList[t].Company.toLowerCase().indexOf(vText) >= 0) {
                    tempList.push(myContacts[j].UserList[t]);
                }
           }            
        }
        if (tempList.length > 0) {
            var tempGroup = { Key: myContacts[j].Key, UserList: tempList };
            smyContacts.push(tempGroup);
        }
    }
}

function btnSubmit() {
    window.parent.setContacts(choosedContacts);
    window.parent.closeListWin();
}

function btnCancel() {
    window.parent.closeListWin();
}

function writeErrorLog(msg) {

    var parameterArray = new Array(msg);
    var dataParameters = { MethodAlias: "writeLog", Parameter: parameterArray };

    Ajax.Request({ url: "AjaxHandler.aspx", type: "POST", data: "data=" + escape(JSON2.stringify(dataParameters)), onComplete: returnWriteErrorLog, onError: showError });

}
function returnWriteErrorLog(xmlhttp) {

}


function getContacts() {
    return choosedContacts;
}


function onSearchInputChange() {
    var vText = $V("searchInput").trim().toLowerCase();
    if (vText == "请输入姓名或者单位名称")
        vText = "";
    if (vText.length == 0 && isAllContacts == false) {
        buildGroupList(myContacts, false);
        isAllContacts = true;
    }
}

function decodeHtmlToStr(str)
{
    document.getElementById("div_decode").innerHTML=str;
    
    return document.getElementById("div_decode").innerText;
}


//重新发起时初始化已添加的人员列表
function initJoinMemberList(contactList) {

    for(var i=0;i<contactList.length;i++)
    {
        obj=contactList[i];
        if (!checkContactExist(obj.MemberUserID)) {

            choosedContacts.push(obj);
            $("SelectedNum").innerHTML = choosedContacts.length; //更新选中数量
            var item = new StringBuffer();
            var id = 'added' + obj.MemberUserID;
            item.append(("<div class='addedContact' id = '{0}'>").format(id));
            item.append(("<div class='addedContact_userName'>{0}</div>").format(obj.MemberUserName));
            item.append(("<div class='addedContact_Comp'>{0}</div>").format(obj.CompanyName));
            item.append(("<div class='deleteDiv'><img style='vertical-align:bottom; cursor:pointer;' src='../images/3CV2/delete-f.gif' onmouseleave=\"this.src ='../images/3CV2/delete-f.gif'\" onmouseover=\"this.src ='../images/3CV2/delete.gif'\" onclick=\"deleteContact('{0}')\"/></div></div>").format(obj.MemberUserID));

            var container = $('Contact_Choosed');
            container.innerHTML = container.innerHTML + item.toString();
        }
    }
  
}
