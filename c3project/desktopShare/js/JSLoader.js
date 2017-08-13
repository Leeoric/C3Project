//JS Loader

//var JcorePath = 'http://nettestfs.wind.com.cn/jcore/jsapi/1.1.1';

var Wind = {};
Wind.UI = {};

Wind.JsLoader = function(path, file, callback) {

    this.count = 0;
    this.curr = 0;
    __self = this;

    this.onload = function(src) {

        var script = document.createElement("script");
        script.type = "text/javascript";
        script.language = "javascript";
        script.src = src.replace("@", path);
        document.getElementsByTagName("head")[0].appendChild(script);
        script.onload = script.onreadystatechange = function() {

            if (this.readyState && (this.readyState != 'complete' && this.readyState != "loaded")) {
                return;
            }
            else {
                __self.curr++;
                if (__self.curr >= __self.count)
                    __self.OnLoaded();
            }
        }
    };

    this.OnLoaded = function() {
        if (callback) {
            callback();
        }
    };

    (function() {
        var a = file.split(",")
        __self.count = a.length;
        for (var no = 0; no < a.length; no++) {
            __self.onload(a[no]);
        }
    })();

};
