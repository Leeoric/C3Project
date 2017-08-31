var Validator =
{
    required: function(str) {
        var reg = new RegExp(/[\S*$]/);
        return reg.test(str);
    },
    date: function(str) {
        var reg = /^((((1[6-9]|[2-9]\d)\d{2})-(0?[13578]|1[02])-(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})-(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29-))$/
        return reg.test(str);
    },
    alpha: function(str) {
        var reg = new RegExp(/^[a-z ._-]+$/i);
        return reg.test(str);
    },
    alphanum: function(str) {
        var reg = new RegExp(/^[a-z0-9 ._-]+$/i);
        return reg.test(str);
    },
    integer: function(str) {
        var reg = new RegExp(/^[-+]?\d+$/);
        return reg.test(str);
    },
    numeric: function(str) {
        var reg = new RegExp(/^[-\+]?\d+(\.\d+)?$/);
        return reg.test(str);
    },
    money: function(str) {
        var reg = /^[\-\+]?([0-9]\d*|0|[1-9]\d{0,2}(,\d{3})*)(\.\d+)?$/;
        return reg.test(str);
    },
    phone: function(str) {
        var reg = new RegExp(/^[0-9 .-]+$/i);
        return reg.test(str);
    },
    mobile: function(str) {
        var reg = new RegExp(/^[1][0-9]{10}$/);
        //var reg = new Regexp(/^(13[0-9]|15[0|3|6|7|8|9]|18[8|9])\d{8}$/);
        //var reg = new RegExp(/^\d+$/);
        return reg.test(str);
    },
    email: function(str) {
        var reg = new RegExp(/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/);
        return reg.test(str);
    },
    cn: function(str) {
        var reg = new RegExp(/[^\u4e00-\u9fa5]/g);
        return !reg.test(str);
    },
    code: function(str) {
        var reg = new RegExp(/[^a-zA-Z0-9_]/);
        return !reg.test(str);
    },
    custom: function(str, re) {
        var reg = new RegExp(re, "g");
        return !reg.test(str);
    },
    CName: function(str) {
        var reg = new RegExp(/^[a-zA-Z0-9\u4e00-\u9fa5]+$/);
        return !reg.test(str);
    },
    TitleName: function(str) {
        var reg = new RegExp(/^[a-zA-Z0-9\u4e00-\u9fa5.,()\s]+$/);
        return !reg.test(str);
    },
    Limited: function(str, intLength) {
        var i, sum;
        sum = 0;
        for (i = 0; i < str.length; i++) {
            if ((str.charCodeAt(i) >= 0) && (str.charCodeAt(i) <= 255)) {
                sum = sum + 1;
            }
            else {
                sum = sum + 2;
            }
        }
        if (sum > intLength)
            return false;       //超长
        else
            return true;
    }
}