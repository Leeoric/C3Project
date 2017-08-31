<!--
var isPorV = 0;
var fFlag= false;

//drag func
var pFlag = false;
var pZoneWidth = 310;
var infoChange = 1;

var bufferingProgress;
var downloadProgress;
var bitRate;
var currentPositionString;
var mediaTitle;
var itemTitle;
var mediaInfo;

function getOLeft(myObj){
    curObj = myObj;
    var objLT = curObj.offsetLeft;
    while(curObj!=curObj.offsetParent && curObj.offsetParent) {
        curObj=curObj.offsetParent;
        if(curObj.tagName=="DIV") {
            objLT += curObj.offsetLeft;
        }
    }    
    return objLT;
}

//truncation string
function trunStr(str) {
    if (str.length > 35){
        return str.substr(0,35) + "...";
    }    
    else{
        return str;
    }    
}

function toDisplay(v){
		var P=$("playzone").getElementsByTagName("div");
		if(v){
			P[0].style.display='none';
			//P[1].style.display='block';
		}
		else{		
			//P[1].style.display='none';
			P[0].style.display='block';
		}		
}

function mouseDown(objSign) {
isPorV = objSign;
    if(isPorV == 0) {
        if($("phx").currentMedia.duration > 0) {
            pFlag = true;
            if(window.event.srcElement.id!="pZone") {
                $("pBox").style.left = $("pBox").offsetLeft -1;
            }    
            else { 
                $("pBox").style.left = window.event.x;
            }    
        }
    } 
    else if (isPorV == 1) {
        vFlag = true;
        //alert($("vBox").offsetLeft);
        if(window.event.srcElement.id!="vZone") { 
            $("vBox").style.left = $("vBox").offsetLeft;
        }    
        else {
            $("vBox").style.left = window.event.x;
        }    
    }
}

function mouseMove() {
//alert(window.event.clientX);
    if(isPorV == 0) {
        if($("phx").currentMedia.duration > 0) {
            if (pFlag) 
                $("pBox").style.left = window.event.clientX - getOLeft($("pZone")) - 12 +"px";
            if (parseInt($("pBox").style.left.replace("px","")) > pZoneWidth) 
                $("pBox").style.left=pZoneWidth +"px";
            if (parseInt($("pBox").style.left.replace("px","")) < -5) 
                $("pBox").style.left=-5 +"px";
        }
    } else if (isPorV == 1) {
        if(vFlag) $("vBox").style.left = window.event.clientX - getOLeft($("vZone")) - 4 +"px";
        if (parseInt($("vBox").style.left.replace("px","")) > 46) $("vBox").style.left = 44 +"px";
        if (parseInt($("vBox").style.left.replace("px","")) < 1) $("vBox").style.left = 1 +"px";

        if(isPorV==1) {
            if (vFlag){
                tempVol = (parseInt($("vBox").style.left) - 4)*5.9;
                $("phx").settings.volume=Math.round(tempVol);
				        $("phx").settings.mute = false;
				        $('Mute').src='mediaplayer/lightblue/p_mute.gif';
            }
        }
    }
}

function mouseUp() {
    if (isPorV == 0) {
        if($("phx").currentMedia.duration > 0) {
            if (pFlag) {
                var duration = $("phx").currentMedia.duration;
                $("phx").controls.CurrentPosition=duration * (parseInt($("pBox").style.left)/pZoneWidth);
            }
            pFlag = false;
        }
    } else if (isPorV == 1) {
        if (vFlag) {
            tempVol = (parseInt($("vBox").style.left) -9)*1.7;
            $("phx").settings.volume=Math.round(tempVol);
        }
        vFlag = false;
    }
}

function mouseEnd() {
    window.event.returnValue = false;
}

function OnloadFun() {
	  mediaInfo = $("mediaInfo");
    startdrag();
    setInterval("FixPos()", 1000);
}

function startdrag() {
    if($("phx").currentMedia.duration||(!isNaN($("phx").currentMedia.duration))) {
        window.document.onmousemove = mouseMove;
        window.document.ondragstart = mouseEnd;
        window.document.onmouseup = mouseUp;
    }
}

function FixPos() {
    if ($("phx").currentMedia.duration > 0) {
        var duration = $("phx").currentMedia.duration;
        var pos = $("phx").controls.CurrentPosition;
        if (pos == 0) {
            var pBoxPos = Math.round(pos/duration*pZoneWidth)+1;
        } else {
            var pBoxPos = Math.round(pos/duration*pZoneWidth)+1;
        }
        
        if (!isNaN(pBoxPos)) {
            $("pBox").style.left = pBoxPos;
            $("aaaa").style.width= pBoxPos;//parseInt(100*(document.getElementById('phx').controls.currentPosition/document.getElementById('phx').currentMedia.duration));
        }
        
        if($("phx").playState == 1) { 
            $("pBox").style.left = 1;
            //mediaInfo.innerHTML= ' '+ currentPositionString.toString();
            if($("Play"))
                $("Play").src="mediaplayer/lightblue/p_play.gif";
			toDisplay(0);
        }

        bufferingProgress = $("phx").network.bufferingProgress;
        downloadProgress = parseInt($("phx").network.downloadProgress);
        bitRate = $("phx").network.bitRate;
        currentPositionString = $("phx").Controls.currentPositionString;
        mediaTitle = $("phx").currentPlaylist.item(0).getItemInfo("Title");
        itemTitle = $("phx").currentPlaylist.getItemInfo("Title");
        var curTime=currentPositionString.toString();
        if(curTime!='')
            curTime=' '+ currentPositionString.toString();            
        $("mediaTime").innerText = document.getElementById('phx').currentMedia.durationString;
        mediaInfo.innerText=curTime;
        
        switch($("phx").playState) {
            case 7: {
                mediaInfo.innerText="就绪";		
            }
            break;

        case 6: { 					 
            if ( parseInt(bufferingProgress) > 0 && parseInt(bufferingProgress) < 100 ) {
                mediaInfo.innerText="缓冲:完成 "+bufferingProgress.toString()+"%";
            } else {
                mediaInfo.innerText="缓冲";
            }
           }
           break;
           
        case 3: {
            if ( downloadProgress == 0 ) {
                mediaInfo.innerText="正在播放";	}
                showPlayInfo();
            }
            break;
        case 1:
                document.getElementById('phx').controls.pause();
                mediaInfo.innerText = '停止'
                document.getElementById('soundPausebtn').style.display = 'none';
                document.getElementById('soundPlaybtn').style.display = '';
            break;
        }
    }
}

function showPlayInfo() {
    if ( infoChange ==1 ) {
        if ( downloadProgress < 100 ) {
            mediaInfo.innerText="正在播放: "+downloadProgress.toString()+"% 已下载";
        } 
//        else {
//            mediaInfo.innerText="正在播放: "+Math.round(bitRate/1000)+" 千比特/秒";			
//        }
        
        if ( downloadProgress == 0 ) {
            mediaInfo.innerText="正在播放";	
        }
    }
    
//    if ( infoChange ==4 ) {		
//        mediaInfo.innerText="播放:"+itemTitle.toString();
//    }
//    
//    if ( infoChange ==8 ) {
//        mediaInfo.innerText="剪辑: "+trunStr(mediaTitle).toString();		
//    }
    
    if ( infoChange < 11 ) {
        infoChange += 1;
    } 
    else {
        infoChange = 1;
    }
}
try
{
    //setOnloadEvent(OnloadFun);
}
catch(e)
{}

//-->