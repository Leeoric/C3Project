var mybg,callback;
AlertWin=function(back){
 var p=arguments[0]||{};
 this.height=p["height"];
 callback=back;
};

AlertWin.prototype = {
    DataBind: function(id, data) {
        this.dataSource = data;
        this.__render(id, data);
        this.__init(id);
    },
    __render: function(id, datasource) {
        var sHTML = new Array();

        sHTML.push("<div class=\"alertWinTitle_left\"></div> ");
        sHTML.push("<div class=\"alertWinTitle_content\"><img src=\"../images/title_icon.gif\" /><span>" + datasource.title + "</span></div>");
        sHTML.push("<div class=\"alertWinTitle_right\"></div>");
        sHTML.push("<div class=\"alertWinContent_left\"></div>");
        sHTML.push("<div class=\"alertWinContent_content\"> ");
        sHTML.push("<div style=\"margin: 5px 5px 5px 5px;\">");

        sHTML.push(" <div class=\"divShow\">");
        sHTML.push(datasource.content);
        sHTML.push("</div>");
        sHTML.push("</div>");
        sHTML.push("<div style=\"margin-top:10px;text-align:center;vertical-align:bottom\">");
        sHTML.push(" <input type=\"button\" id=\"close\" class=\"button\"  value=\"关闭\" onclick=\"hideAlertWin('" + id + "')\" />");
        sHTML.push(" </div> ");
        sHTML.push("</div>");
        sHTML.push("<div class=\"alertWinContent_right\"></div>");
        sHTML.push("<div class=\"alertWinBottom_left\"></div>");
        sHTML.push(" <div class=\"alertWinBottom_content\"></div>");
        sHTML.push(" <div class=\"alertWinBottom_right\"></div>");

        var re = sHTML.join("");
        document.getElementById(id).innerHTML = re;
        //document.write(re);
    },

    __init: function(id) {

        var myAlert = document.getElementById(id);

        myAlert.style.display = "block";
        myAlert.style.position = "absolute";
        myAlert.style.top = "35%";
        myAlert.style.left = "50%";
        myAlert.style.marginTop = "-75px";
        myAlert.style.marginLeft = "-150px";

        if (mybg == null) {
            mybg = document.createElement("div");
            mybg.setAttribute("id", "mybg");
            mybg.setAttribute("name", "mybg");
            mybg.style.background = "#000";
            mybg.style.width = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) + 'px'; //"100%";
            mybg.style.height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)+'px'; //"100%";
            mybg.style.position = "absolute";
            mybg.style.top = "0";
            mybg.style.left = "0";
            mybg.style.zIndex = "500";
            mybg.style.opacity = "0.8";
            mybg.style.filter = "Alpha(opacity=30)";
            document.body.appendChild(mybg);
        }
        else {
            mybg.style.width = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) + 'px'; //"100%";
            mybg.style.height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) + 'px'; //"100%";
            mybg.style.display = 'block';
        }

    }
}

function hideAlertWin(id) {
    mybg.style.display = 'none';
    document.getElementById(id).style.display = 'none';
    if(callback!=null) callback();
}

function ReSetAlertWin() {
    var obj = document.getElementById('mybg');
    if (obj) {
        mybg.style.width = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) + 'px'; //"100%";
        mybg.style.height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) + 'px'; //"100%";

    }
}