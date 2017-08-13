
var w1;
//展现我的联系人窗体
function showAddContactWindow(type, content) {//type:0 添加；1：编辑

    var top = (document.documentElement.scrollTop * 2 + document.body.clientHeight - 247) / 2;
    if (type == 1 && selectedID == null) {
        //window.parent.showAlertWin('', "请先选择联系人！");
        return;
    }
    if (!w1) {
        var t = {};

        t.width = 380;
        t.height = 228;
        //t.title = '添加联系人';
        //t.img = $("txt_img").value;
        t.top = top
        t.isreflashable = false;
        t.ismaxable = false;
        t.isshowclose = true;
        t.isresizeable = false;
        t.isdragable = true;
        t.ismask = true;
        t.isscroll = false;
        t.onclose = disposeWin;
        if (type == 0) {
            t.title = '新建联系人';
        }
        else
            t.title = '编辑联系人';
        w1 = new Wind.UI.Window(t);
    }
    w1.show();
    w1.loadData(content);
}

function disposeWin() {
    if (w1) {
        w1.close();
        w1.dispose();
        w1 = null;
    }
}


function getWindowContent(type) {
    var selected;
    var submitFun;
    var cancelFun;
    var submitAStyle, submitBStyle, cancelAStyle, cancelBStyle;
    if (type == 1) {
        selected = getMyContactLocal(selectedID);
        submitFun = "updateContact()";
        cancelFun = "deleteContactUser()";
        submitAStyle = "saveA";
        submitBStyle = "saveB";
        cancelAStyle = "deleteA";
        cancelBStyle = "deleteB";
    }
    else {
        selected = { ContactUserID: "", ContactName: "", Company: "", MobilePhone: "", Email: "", Department: "", Telephone: "", Position: "", Memo: "" };
        submitFun = "addNewContact()";
        cancelFun = "closeWindow()";
        submitAStyle = "commitA";
        submitBStyle = "commitB";
        cancelAStyle = "cancelA";
        cancelBStyle = "cancelB";
    }

    var content = new StringBuffer();
    content.append("<div class='editBG'>");
    content.append("<div style=''>");
    content.append("<table class='addMyContact_table'>");
    content.append(("<tr><td width='80px' class='title'>姓名：</td><td class='content'><input id='CName' type='text' style=' width:120px; float:left' value='{0}' /><img style ='float:left;margin:5px 10px' src='../images/need.jpg'/></td></tr>").format(selected.ContactName));
    content.append(("<tr><td class='title'>手机：</td><td  class='content'><input id='CMobile' type='text' style=' width:120px; float:left' value='{0}'/><img style ='; float:left;margin:5px 10px' src='../images/need.jpg'/></td></tr>").format(selected.MobilePhone));
    content.append(("<tr><td class='title'>电子邮件：</td><td  class='content'><input id='CEmail' type='text' style=' width:210px; float:left' value='{0}' /><img style ='float:left;margin:5px 10px' src='../images/need.jpg'/></td></tr>").format(selected.Email));
    content.append(("<tr><td class='title'>公司名称：</td><td  class='content'><input id='CCompany' type='text' style=' width:210px' value='{0}' /></td></tr>").format(selected.Company));
    //     content.append("<tr><td width='100px'>部门名称：</td><td ><input id='CDept' type='text' style=' width:250px' /></td></tr>");
    //content.append("<tr><td>职位名称：</td><td ><input id='CPosition'  type='text' style=' width:210px' /></td></tr>");
    content.append(("<tr><td class='title'>公司电话：</td><td  class='content'><input id='CTelComp' type='text' style=' width:210px' value='{0}' /></td></tr>").format(selected.Telephone));
    //     content.append("<tr style=''><td width='100px' style=' vertical-align:top'>备注：</td>");
    //     content.append("<td ><textarea id='CRemark' style='margin:0px;width: 250px; height: 50px; overflow-y:auto;' rows='3' cols='50'  ></textarea></td></tr>");
    content.append("</table>");
    content.append("<div id='ErrorMsg' style=' line-height:25px; color:Red;font-weight:bold;font-size:13px; height:25px;text-align:center'></div>");
    content.append("<div style='width:100%; text-align:center;'>");
    content.append("<table><tr><td>");
    content.append(("<div onclick='{0}' class='{1}'  onmouseout=\"this.className='{2}'\" onmouseover=\"this.className='{3}'\"></div>").format(submitFun, submitAStyle, submitAStyle, submitBStyle));
    content.append("</td><td>");
    content.append(("<div onclick='{0}' class='{1}'  onmouseout=\"this.className='{2}'\" onmouseover=\"this.className='{3}'\"></div>").format(cancelFun, cancelAStyle, cancelAStyle, cancelBStyle));
    content.append("</td></tr></table");
    content.append("</div></div></div>");
    return content.toString();

}