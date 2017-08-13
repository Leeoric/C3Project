WinSound = function() {
    var p = arguments[0] || {};
};


WinSound.prototype = {
    DataBind: function(title, url, id, idContainer, width, height, callback) {
        this.__render(title, url, id, idContainer, width, height, callback);
        this.__init(id);
    },

    __render: function(title, url, id, idContainer, width, height, callback) {
        var sHTML = new Array();

        sHTML.push("<div class=\"playerWinTitle_left\"></div> ");
        sHTML.push("<div class=\"playerWinTitle_content\">");
        sHTML.push("<div style=\"float:left;width:20px;\">");
        sHTML.push("<img src=\"../images/listen.gif\" />");
        sHTML.push("</div>");
        sHTML.push("<div style=\"float:left;width:320px;\">");
        sHTML.push("<span>会议录音播放</span>");
        sHTML.push("</div>");
        sHTML.push("<div style=\"float:left;width:20px;\">");
        sHTML.push("<a onclick=\"closeSound('" + idContainer + "'," + callback + ",'phx')\" style=\"cursor:pointer\">X</a>");
        sHTML.push("</div>");

        sHTML.push("</div>");
        sHTML.push("<div class=\"playerWinTitle_right\"></div>");
        sHTML.push("<div class=\"playerWinContent_left\"></div>");
        sHTML.push("<div class=\"playerWinContent_content\"> ");
        sHTML.push("<div style=\"margin: 10px 0px 5px 12px;\" style=\"\">");

        //sHTML.push(" <div class=\"divShow\">");
        sHTML.push("<div  style=\"width:350px;text-align:center\">" + title + "</div>");

        //sHTML.push("<div id=\"time\" style=\"width:150px;float:left\">正在加载媒体...</div>");
        //sHTML.push("<div id=\"endtime\" style=\"width:80px;float:right\"></div>");
        sHTML.push("<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" id=bar style=\"width:360px;height:13px;\">");
        sHTML.push("<tr>");

        sHTML.push("<td >");
        sHTML.push("<div class=\"v_player\">");
        sHTML.push("<div class=\"v_mid2\">");
        sHTML.push(" <div id=\"playzone\">");
        sHTML.push("      <div id=\"playerList\">");

        sHTML.push("<object classid=\"clsid:6BF52A52-394A-11D3-B153-00C04F79FAA6\" id=\"phx\" width=\"" + width + "\" height=\"" + height + "\">");
        sHTML.push("   <param name=\"ShowControls\" value=\"0\">");
        sHTML.push("   <param name=\"ShowAudioControls\" value=\"0\">");
        sHTML.push("   <param name=\"ShowDisplay\" value=\"0\">");
        sHTML.push("   <param name=\"ShowPositionControls\" value=\"0\">");
        sHTML.push("   <param name=\"URL\" value=\"" + url + "\">");
        sHTML.push("   <param name=\"rate\" value=\"1\">");
        sHTML.push("   <param name=\"balance\" value=\"0\">");
        sHTML.push("   <param name=\"currentPosition\" value=\"0\">");
        sHTML.push("  <param name=\"defaultFrame\" value=\"\">");
        sHTML.push("   <param name=\"playCount\" value=\"1\">");
        sHTML.push("   <param name=\"autoStart\" value=\"-1\">");
        sHTML.push("   <param name=\"currentMarker\" value=\"0\">");
        sHTML.push("   <param name=\"invokeURLs\" value=\"-1\">");
        sHTML.push("   <param name=\"baseURL\" value=\"\">");
        sHTML.push("   <param name=\"volume\" value=\"50\">");
        sHTML.push("   <param name=\"mute\" value=\"0\">");
        sHTML.push("   <param name=\"CanScan \" value=\"-1\">");
        sHTML.push("   <param name=\"CanSeek  \" value=\"-1\">");
        sHTML.push("   <param name=\"EnableTracker\" value=\"-1\">");
        sHTML.push("   <param name=\"Volume\" value=\"0\">");

        sHTML.push("   <param name=\"uiMode\" value=\"full\">");
        sHTML.push("   <param name=\"stretchToFit\" value=\"0\">");
        sHTML.push("   <param name=\"windowlessVideo\" value=\"0\">");
        sHTML.push("   <param name=\"enabled\" value=\"-1\">");
        sHTML.push("   <param name=\"enableContextMenu\" value=\"-1\">");
        sHTML.push("   <param name=\"fullScreen\" value=\"0\">");
        sHTML.push("   <param name=\"SAMIStyle\" value=\"\">");
        sHTML.push("   <param name=\"SAMILang\" value=\"\">");
        sHTML.push("   <param name=\"SAMIFilename\" value=\"\">");
        sHTML.push("   <param name=\"captioningID\" value=\"\">");
        sHTML.push("   <param name=\"enableErrorDialogs\" value=\"0\">");
        sHTML.push("  <param name=\"_cx\" value=\"6482\">");
        sHTML.push("   <param name=\"_cy\" value=\"6350\">");
        sHTML.push(" </object>");


        sHTML.push("      </div>");
        sHTML.push("   </div>");
        sHTML.push("  <div class=\"m_info\">");
        sHTML.push("      <div id=\"mediaTime\">");
        sHTML.push("          </div>");
        sHTML.push("       <div id=\"mediaInfo\"></div>");
        sHTML.push("     <br class=\"clear\" />");
        sHTML.push("  </div>");
        sHTML.push("</div>");
        sHTML.push("  <br class=\"clear\" />");
        sHTML.push(" </div>");
        sHTML.push("<div class=\"v_player\">");
        sHTML.push("    <div class=\"cnt_control\">");
        sHTML.push("       <div class=\"btnInfo\">");
        sHTML.push("           <div class=\"pbar\">    ");
        sHTML.push("              <div class=\"v_loading\">");

        sHTML.push("<div id=\"container\" class=\"container\">");
        sHTML.push("<div class=\"bargrbg\"></div>");
        sHTML.push("<div style=\"float:left;width:5px\"><img src=\"../images/barleft.gif\" width=\"5\" height=\"13\" /></div>");
        sHTML.push("<div id=\"aaaa\" class=\"barbg\"></div>");
        //sHTML.push("<div class=\"barmark\" id=\"barmark\"><img src=\"../images/barmark.gif\" width=\"28\" height=\"28\" border=\"0px\" /></div>");

        sHTML.push("<div onmousedown=\"mouseDown(0)\" class=\"barmark\" id=\"pZone\">");
        sHTML.push("<img id=\"pBox\" height=\"28\" alt=\"视频进度调节\" src=\"../images/barmark.gif\" width=\"28\" /></div>");

        sHTML.push("<div class=\"barright\" id=\"barright\"><img src=\"../images/bargrright.gif\" width=\"5\" height=\"12\" /></div>");
        sHTML.push("</div>");

        sHTML.push("  </div>");
        sHTML.push("           <div id=\"v_info\">");
        sHTML.push("           </div>");
        sHTML.push("    </div>");
        sHTML.push("   </div>");
        sHTML.push(" </div>");

        sHTML.push("</td>");
        sHTML.push("</tr>");
        sHTML.push("</table>");


        sHTML.push("</div>");
       // sHTML.push("</div>");
        sHTML.push("<div style=\"margin-top:10px;text-align:center;vertical-align:bottom\">");
        //sHTML.push(" <input type=\"button\" id=\"close\" class=\"button\"  value=\"关闭\" onclick=\"hideAlertWin('" + id + "')\" />");

        sHTML.push("<table width=\"370px\" height=\"70px\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" background=\"../images/SoundBg.jpg\">");
        sHTML.push("<tr>");
        sHTML.push("<td width=\"20%\">&nbsp;</td>");
        sHTML.push("<td width=\"20%\"><img src=\"../images/soundLeft.png\" onclick=\"sfastForward('phx');\" width=\"58\" height=\"57\" /></td>");
        sHTML.push("<td width=\"20%\"><img src=\"../images/SoundPlay.png\"   onclick=\"playSound('phx');\" width=\"58\" height=\"57\" id=\"soundPlaybtn\" style=\"display:none\" /><img id=\"soundPausebtn\"  onclick=\"puaseSound('phx');\"  src=\"../images/SoundPuese.png\" width=\"57\" height=\"57\" /></td>");
        sHTML.push("<td width=\"20%\"><img src=\"../images/SoundRight.png\" onclick=\"sfastReverse('phx');\" width=\"61\" width=\"58\" height=\"57\" /></td>");
        sHTML.push("<td width=\"20%\">&nbsp;</td>");
        sHTML.push("</tr>");
        sHTML.push("</table>");

        sHTML.push(" </div> ");
        sHTML.push("</div>");
        sHTML.push("<div class=\"playerWinContent_right\"></div>");
        sHTML.push("<div class=\"playerWinBottom_left\"></div>");
        sHTML.push(" <div class=\"playerWinBottom_content\"></div>");
        sHTML.push(" <div class=\"playerWinBottom_right\"></div>");

        var re = sHTML.join("");
        document.getElementById(idContainer).innerHTML = re;
    },
    __init: function(id) {
        OnloadFun();
        //var volv = phx.settings.volume;
        //setInterval("if(document.getElementById('" + id + "').playState==3){time.innerText=document.getElementById('" + id + "').controls.currentPositionString}", 1000);
        //setInterval("if(document.getElementById('" + id + "').playState==3){endtime.innerText=document.getElementById('" + id + "').currentMedia.durationString}", 1000);
        // setInterval("if(phx.playState==3){itcn.style.width=parseInt(245*(phx.controls.currentPosition/phx.currentMedia.duration))}", 1000);
        //setInterval("if(document.getElementById('" + id + "').playState==3){aaaa.style.width=parseInt(300*(document.getElementById('" + id + "').controls.currentPosition/document.getElementById('" + id + "').currentMedia.duration))}", 100);
    }
}



//function hideAlertWin(id) {
//    document.getElementById(id).innerHTML = '';
//    var obj = document.getElementById('mybg');

//    document.getElementById('mybg').style.display = "none";
//    document.body.removeChild(obj);
//}

function volup() {
    if (volv < 100) {
        volv += 5;
        phx.settings.volume = volv;
        time.innerText = volv;
    }
    else { time.innerText = '最大'; }
}
//快退
function sfastForward(id) {
    //phx.controls.fastForward();
    document.getElementById(id).controls.currentPosition -= 60;
}
//快进
function sfastReverse(id) {
    //phx.controls.fastReverse();
    var tot = document.getElementById(id).currentMedia.duration;
    var cur = document.getElementById(id).controls.currentPosition;
    if (cur + 60 <= tot) {
        document.getElementById(id).controls.currentPosition += 60;
    }
    else {
        document.getElementById(id).controls.currentPosition = tot;
        document.getElementById('aaaa').style.width = '290px';
    }
}

function voldown() {
    if (volv > 0) {
        volv -= 5;
        phx.settings.volume = volv;
        time.innerText = volv;
    }
    else { time.innerText = '最小'; }
}

function playSound(id) {
    document.getElementById(id).controls.play();
    mediaInfo.innerText = '播放'
    document.getElementById('soundPausebtn').style.display = '';
    document.getElementById('soundPlaybtn').style.display = 'none';
}
function puaseSound(id) {
    document.getElementById(id).controls.pause();
    mediaInfo.innerText = '暂停'
    document.getElementById('soundPausebtn').style.display = 'none';
    document.getElementById('soundPlaybtn').style.display = '';
}

function closeSound(idContainer, callback, id) {
    document.getElementById(id).controls.stop();
    document.getElementById(idContainer).style.display = "none";
    if (callback) {
        callback();
    }
}

