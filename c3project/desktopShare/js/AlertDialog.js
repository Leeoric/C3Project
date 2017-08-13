var mybg,callback,btnOkCallBack;
AlertDialog=function(back,layer){
 var p=arguments[0]||{};
 this.height=p["height"];
 callback=back;
 this.layer=layer;

};

AlertDialog.prototype = {
    DataBind: function(id, data,type,CallBack) {
        this.dataSource = data;
        this.__render(id, data,type);
        this.__init(id);
        btnOkCallBack=CallBack;
    },
    __render: function(id, datasource,type) {
        var sHTML = new Array();        
        if(ieVersion=="6")
        {
            if(this.layer==true)
            {
                //防止在IE6下被dropdowmlist控件遮住的bug                 
                //sHTML.push("<iframe id='alert_iframe' frameborder='0' style='position: absolute; z-index: -1;margin-top:-98px; margin-left:-165px; width: 303px; height: 156px;_height: 158px; left: 50%; top: 35%;'></iframe>");
                sHTML.push("<iframe id='alert_iframe' frameborder='0' style='position: absolute; z-index: -1;margin-top:-50px; margin-left:-151.5px; width: 303px; height: 156px;_height: 157px; left: 50%; top: 35%;'></iframe>");
            }            
        }        
        sHTML.push(" <div class=\"mini_alert\">");
        sHTML.push(" <table class=\"mini_alertContent\">");
        sHTML.push(" <tr>");
        sHTML.push(" <td class=\"mini_alertContentTd\">");
        sHTML.push(datasource.content);
        sHTML.push(" </td>");
        sHTML.push(" </tr>");        
        sHTML.push("</table>");        
        sHTML.push("<div style='text-align:center;' > ");
        if(type==2)
        {
            sHTML.push("<div class='alert_btnDiv'>");
            sHTML.push("<a class='alert_close' style='float:right;' href='###' onclick=\"hideAlertWin('" + id + "',1)\" ></a>");
            sHTML.push("<a  class='alertOk' style='float:left;padding-right:20px;' href='###'  onclick=\"hideAlertWin('" + id + "',2); DialogOK();\" ></a>");          
            sHTML.push("</div>");   
        }
        else
        {
             sHTML.push("<input type='button' class='alert_close'  onclick=\"hideAlertWin('" + id + "',0)\" ></input>");  

        }
          
        sHTML.push("</div>");        
        sHTML.push("</div>");
        
        var re = sHTML.join("");
        document.getElementById(id).innerHTML = re;  
    },

    __init: function(id) {

        var myAlert = document.getElementById(id);

        myAlert.style.display = "block";
        myAlert.style.position = "absolute";
        var  height=(window.document.documentElement.clientHeight-80)/2+window.document.documentElement.scrollTop+"px";      
        myAlert.style.top =height;
        //myAlert.style.top = "35%";
        myAlert.style.left = "50%";
        myAlert.style.marginTop = "-75px";
        myAlert.style.marginLeft = "-150px";
        myAlert.style.zIndex = "10001";

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
            mybg.style.zIndex = "10000";
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

function hideAlertWin(id,type) {
    mybg.style.display = 'none';
    document.getElementById(id).style.display = 'none';
    if (callback != null && (type == 0 || type == 2)) 
        callback();
}

function ReSetAlertWin() {
    var obj = document.getElementById('mybg');
    if (obj) {
        mybg.style.width = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) + 'px'; //"100%";
        mybg.style.height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) + 'px'; //"100%";

    }
}

function DialogOK()
{
     if (btnOkCallBack != null ) 
     {
        btnOkCallBack();
     }      
}

var ieVersion = "";

(function getIEVersion(){  
    
    var undef,  
        v = 3,  
        div = document.createElement('div'),  
        all = div.getElementsByTagName('i');  
    
    while (  
        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',  
        all[0]  
    );  
    
    ieVersion=( v > 4 ? v : undef);  
    
})();