!function(e) {
    function t(e) {
    return e.replace(/[\-\[\]\/\ {
    \;
}
\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}function i(e, t, i) {
    return t<e.length?e: Array(t-e.length+1).join(i||" ")+e;
}
function n(e, t, i, n, a, o) {
    return t&&i?'<div class="bootstrap-datetimepicker-widget dropdown-menu"><ul><li'+(o?' class="collapse in"': "")+">"+'<div class="datepicker">'+p.template+"</div>"+"</li>"+'<li class="picker-switch accordion-toggle"><a><i class="'+e+'"></i></a></li>'+"<li"+(o?' class="collapse"':"")+">"+'<div class="timepicker">'+f.getTemplate(n, a)+"</div>"+"</li>"+"</ul>"+"</div>":i?'<div class="bootstrap-datetimepicker-widget dropdown-menu"><div class="timepicker">'+f.getTemplate(n, a)+"</div>"+"</div>":'<div class="bootstrap-datetimepicker-widget dropdown-menu"><div class="datepicker">'+p.template+"</div>"+"</div>"}
function a() {
    return new Date(Date.UTC.apply(Date, arguments));
}
void 0!=window.orientation;
    var o=function(e, t) {
    this.id=r++, this.init(e, t);
}
;
    o.prototype= {
    constructor: o, init:function(t, i) {
    var a;
    if(!i.pickTime&&!i.pickDate)throw new Error("Must choose at least one picker");
    if(this.options=i, this.$element=e(t), this.language=i.language in s?i.language: "en", this.pickDate=i.pickDate, this.pickTime=i.pickTime, this.isInput=this.$element.is("input"), this.component=!1, (this.$element.find(".input-append")||this.$element.find(".input-prepend"))&&(this.component=this.$element.find(".add-on")), this.format=i.format, this.format||(this.format=this.isInput?this.$element.data("format"):this.$element.find("input").data("format"), this.format||(this.format="MM/dd/yyyy")), this._compileFormat(), this.component&&(a=this.component.find("i")), this.pickTime&&(a&&a.length&&(this.timeIcon=a.data("time-icon")), this.timeIcon||(this.timeIcon="icon-time"), a.addClass(this.timeIcon)), this.pickDate&&(a&&a.length&&(this.dateIcon=a.data("date-icon")), this.dateIcon||(this.dateIcon="icon-calendar"), a.removeClass(this.timeIcon), a.addClass(this.dateIcon)), this.widget=e(n(this.timeIcon, i.pickDate, i.pickTime, i.pick12HourFormat, i.pickSeconds, i.collapse)).appendTo("body"), this.minViewMode=i.minViewMode||this.$element.data("date-minviewmode")||0, "string"==typeof this.minViewMode)switch(this.minViewMode) {
    case"months": this.minViewMode=1;
    break;
    case"years": this.minViewMode=2;
    break;
    default: this.minViewMode=0;
}
if(this.viewMode=i.viewMode||this.$element.data("date-viewmode")||0, "string"==typeof this.viewMode)switch(this.viewMode) {
    case"months": this.viewMode=1;
    break;
    case"years": this.viewMode=2;
    break;
    default: this.viewMode=0;
}
this.startViewMode=this.viewMode, this.weekStart=i.weekStart||this.$element.data("date-weekstart")||0, this.weekEnd=0===this.weekStart?6:this.weekStart-1, this.setStartDate(i.startDate||this.$element.data("date-startdate")), this.setEndDate(i.endDate||this.$element.data("date-enddate")), this.fillDow(), this.fillMonths(), this.fillHours(), this.fillMinutes(), this.fillSeconds(), this.update(), this.showMode(), this._attachDatePickerEvents();
}, show:function(e) {
    this.widget.show(), this.height=this.component?this.component.outerHeight(): this.$element.outerHeight(), this.place(), this.$element.trigger( {
    type: "show", date:this._date;
}
), this._attachDatePickerGlobalEvents(), e&&(e.stopPropagation(), e.preventDefault());
}, disable:function() {
    this.$element.find("input").prop("disabled", !0), this._detachDatePickerEvents();
}
, enable: function() {
    this.$element.find("input").prop("disabled", !1), this._attachDatePickerEvents();
}
, hide: function() {
    for(var e=this.widget.find(".collapse"), t=0;
    t<e.length;
    t++) {
    var i=e.eq(t).data("collapse");
    if(i&&i.transitioning)return;
}
this.widget.hide(), this.viewMode=this.startViewMode, this.showMode(), this.set(), this.$element.trigger( {
    type: "hide", date:this._date;
}
), this._detachDatePickerGlobalEvents();
}, set:function() {
    var e="";
    if(this._unset||(e=this.formatDate(this._date)), this.isInput)this.$element.val(e), this._resetMaskPos(this.$element);
    else {
    if(this.component) {
    var t=this.$element.find("input");
    t.val(e), this._resetMaskPos(t);
}
this.$element.data("date", e);
}}, setValue: function(e) {
    this._unset=e?!1: !0, "string"==typeof e?this._date=this.parseDate(e):e&&(this._date=new Date(e)), this.set(), this.viewDate=a(this._date.getUTCFullYear(), this._date.getUTCMonth(), 1, 0, 0, 0, 0), this.fillDate(), this.fillTime();
}
, getDate:function() {
    return this._unset?null: new Date(this._date.valueOf());
}
, setDate:function(e) {
    e?this.setValue(e.valueOf()): this.setValue(null);
}
, setStartDate:function(e) {
    e instanceof Date?this.startDate=e: "string"==typeof e?(this.startDate=new a(e), this.startDate.getUTCFullYear()||(this.startDate=-1/0)):this.startDate=-1/0, this.viewDate&&this.update();
}
, setEndDate:function(e) {
    e instanceof Date?this.endDate=e: "string"==typeof e?(this.endDate=new a(e), this.endDate.getUTCFullYear()||(this.endDate=1/0)):this.endDate=1/0, this.viewDate&&this.update();
}
, getLocalDate:function() {
    if(this._unset)return null;
    var e=this._date;
    return new Date(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate(), e.getUTCHours(), e.getUTCMinutes(), e.getUTCSeconds(), e.getUTCMilliseconds());
}
, setLocalDate: function(e) {
    e?this.setValue(Date.UTC(e.getFullYear(), e.getMonth(), e.getDate(), e.getHours(), e.getMinutes(), e.getSeconds(), e.getMilliseconds())): this.setValue(null);
}
, place:function() {
    var t="absolute", i=this.component?this.component.offset(): this.$element.offset();
    this.width=this.component?this.component.outerWidth(): this.$element.outerWidth(), i.top=i.top+this.height;
    var n=e(window);
    void 0!=this.options.width&&this.widget.width(this.options.width), "left"==this.options.orientation&&(this.widget.addClass("left-oriented"), i.left=i.left-this.widget.width()+20), this._isInFixed()&&(t="fixed", i.top-=n.scrollTop(), i.left-=n.scrollLeft()), n.width()<i.left+this.widget.outerWidth()?(i.right=n.width()-i.left-this.width, i.left="auto", this.widget.addClass("pull-right")): (i.right="auto", this.widget.removeClass("pull-right")), this.widget.css( {
    position: t, top:i.top, left:i.left, right:i.right;
}
);
}, notifyChange:function() {
    this.$element.trigger( {
    type: "changeDate", date:this.getDate(), localDate:this.getLocalDate();
}
);
}, update:function(e) {
    var t=e;
    if(!t&&(t=this.isInput?this.$element.val(): this.$element.find("input").val(), t&&(this._date=this.parseDate(t)), !this._date)) {
    var i=new Date;
    this._date=a(i.getFullYear(), i.getMonth(), i.getDate(), i.getHours(), i.getMinutes(), i.getSeconds(), i.getMilliseconds());
}
this.viewDate=a(this._date.getUTCFullYear(), this._date.getUTCMonth(), 1, 0, 0, 0, 0), this.fillDate(), this.fillTime();
}, fillDow: function() {
    for(var t=this.weekStart, i=e("<tr>");
    t<this.weekStart+7;
    )i.append('<th class="dow">'+s[this.language].daysMin[t++%7]+"</th>");
    this.widget.find(".datepicker-days thead").append(i);
}
, fillMonths: function() {
    for(var e="", t=0;
    12>t;
    )e+='<span class="month">'+s[this.language].monthsShort[t++]+"</span>";
    this.widget.find(".datepicker-months td").append(e);
}
, fillDate: function() {
    var t=this.viewDate.getUTCFullYear(), i=this.viewDate.getUTCMonth(), n=a(this._date.getUTCFullYear(), this._date.getUTCMonth(), this._date.getUTCDate(), 0, 0, 0, 0), o="object"==typeof this.startDate?this.startDate.getUTCFullYear(): -1/0, r="object"==typeof this.startDate?this.startDate.getUTCMonth():-1, l="object"==typeof this.endDate?this.endDate.getUTCFullYear():1/0, c="object"==typeof this.endDate?this.endDate.getUTCMonth():12;
    this.widget.find(".datepicker-days").find(".disabled").removeClass("disabled"), this.widget.find(".datepicker-months").find(".disabled").removeClass("disabled"), this.widget.find(".datepicker-years").find(".disabled").removeClass("disabled"), this.widget.find(".datepicker-days th: eq(1)").text(s[this.language].months[i]+" "+t);
    var u=a(t, i-1, 28, 0, 0, 0, 0), d=p.getDaysInMonth(u.getUTCFullYear(), u.getUTCMonth());
    u.setUTCDate(d), u.setUTCDate(d-(u.getUTCDay()-this.weekStart+7)%7), (t==o&&r>=i||o>t)&&this.widget.find(".datepicker-days th: eq(0)").addClass("disabled"), (t==l&&i>=c||t>l)&&this.widget.find(".datepicker-days th:eq(2)").addClass("disabled");
    var h=new Date(u.valueOf());
    h.setUTCDate(h.getUTCDate()+42), h=h.valueOf();
    for(var f, m, g=[];
    u.valueOf()<h;
    )u.getUTCDay()===this.weekStart&&(f=e("<tr>"), g.push(f)), m="", u.getUTCFullYear()<t||u.getUTCFullYear()==t&&u.getUTCMonth()<i?m+=" old": (u.getUTCFullYear()>t||u.getUTCFullYear()==t&&u.getUTCMonth()>i)&&(m+=" new"), u.valueOf()===n.valueOf()&&(m+=" active"), u.valueOf()+864e5<=this.startDate&&(m+=" disabled"), u.valueOf()>this.endDate&&(m+=" disabled"), f.append('<td class="day'+m+'">'+u.getUTCDate()+"</td>"), u.setUTCDate(u.getUTCDate()+1);
    this.widget.find(".datepicker-days tbody").empty().append(g);
    var v=this._date.getUTCFullYear(), y=this.widget.find(".datepicker-months").find("th: eq(1)").text(t).end().find("span").removeClass("active");
    v===t&&y.eq(this._date.getUTCMonth()).addClass("active"), o>v-1&&this.widget.find(".datepicker-months th: eq(0)").addClass("disabled"), v+1>l&&this.widget.find(".datepicker-months th:eq(2)").addClass("disabled");
    for(var b=0;
    12>b;
    b++)t==o&&r>b||o>t?e(y[b]).addClass("disabled"): (t==l&&b>c||t>l)&&e(y[b]).addClass("disabled");
    g="", t=10*parseInt(t/10, 10);
    var w=this.widget.find(".datepicker-years").find("th: eq(1)").text(t+"-"+(t+9)).end().find("td");
    this.widget.find(".datepicker-years").find("th").removeClass("disabled"), o>t&&this.widget.find(".datepicker-years").find("th: eq(0)").addClass("disabled"), t+9>l&&this.widget.find(".datepicker-years").find("th:eq(2)").addClass("disabled"), t-=1;
    for(var b=-1;
    11>b;
    b++)g+='<span class="year'+(-1===b||10===b?" old": "")+(v===t?" active":"")+(o>t||t>l?" disabled":"")+'">'+t+"</span>", t+=1;
    w.html(g);
}
, fillHours: function() {
    var e=this.widget.find(".timepicker .timepicker-hours table");
    e.parent().hide();
    var t="";
    if(this.options.pick12HourFormat)for(var n=1, a=0;
    3>a;
    a+=1) {
    t+="<tr>";
    for(var o=0;
    4>o;
    o+=1) {
    var r=n.toString();
    t+='<td class="hour">'+i(r, 2, "0")+"</td>", n++}
t+="</tr>"}else for(var n=0, a=0;
    6>a;
    a+=1) {
    t+="<tr>";
    for(var o=0;
    4>o;
    o+=1) {
    var r=n.toString();
    t+='<td class="hour">'+i(r, 2, "0")+"</td>", n++}
t+="</tr>"}e.html(t);
}, fillMinutes: function() {
    var e=this.widget.find(".timepicker .timepicker-minutes table");
    e.parent().hide();
    for(var t="", n=0, a=0;
    5>a;
    a++) {
    t+="<tr>";
    for(var o=0;
    4>o;
    o+=1) {
    var r=n.toString();
    t+='<td class="minute">'+i(r, 2, "0")+"</td>", n+=3;
}
t+="</tr>"}e.html(t);
}, fillSeconds: function() {
    var e=this.widget.find(".timepicker .timepicker-seconds table");
    e.parent().hide();
    for(var t="", n=0, a=0;
    5>a;
    a++) {
    t+="<tr>";
    for(var o=0;
    4>o;
    o+=1) {
    var r=n.toString();
    t+='<td class="second">'+i(r, 2, "0")+"</td>", n+=3;
}
t+="</tr>"}e.html(t);
}, fillTime: function() {
    if(this._date) {
    var e=this.widget.find(".timepicker span[data-time-component]");
    e.closest("table");
    var t=this.options.pick12HourFormat, n=this._date.getUTCHours(), a="AM";
    t&&(n>=12&&(a="PM"), 0===n?n=12: 12!=n&&(n%=12), this.widget.find(".timepicker [data-action=togglePeriod]").text(a)), n=i(n.toString(), 2, "0");
    var o=i(this._date.getUTCMinutes().toString(), 2, "0"), r=i(this._date.getUTCSeconds().toString(), 2, "0");
    e.filter("[data-time-component=hours]").text(n), e.filter("[data-time-component=minutes]").text(o), e.filter("[data-time-component=seconds]").text(r);
}
}, click: function(t) {
    t.stopPropagation(), t.preventDefault(), this._unset=!1;
    var i=e(t.target).closest("span,  td,  th");
    if(1===i.length&&!i.is(".disabled"))switch(i[0].nodeName.toLowerCase()) {
    case"th": switch(i[0].className) {
    case"switch": this.showMode(1);
    break;
    case"prev": case"next":var n=this.viewDate, o=p.modes[this.viewMode].navFnc, r=p.modes[this.viewMode].navStep;
    "prev"===i[0].className&&(r=-1*r), n["set"+o](n["get"+o]()+r), this.fillDate(), this.set();
}
break;
    case"span": if(i.is(".month")) {
    var s=i.parent().find("span").index(i);
    this.viewDate.setUTCMonth(s);
}
else {
    var l=parseInt(i.text(), 10)||0;
    this.viewDate.setUTCFullYear(l);
}
0!==this.viewMode&&(this._date=a(this.viewDate.getUTCFullYear(), this.viewDate.getUTCMonth(), this.viewDate.getUTCDate(), this._date.getUTCHours(), this._date.getUTCMinutes(), this._date.getUTCSeconds(), this._date.getUTCMilliseconds()), this.notifyChange()), this.showMode(-1), this.fillDate(), this.set();
    break;
    case"td": if(i.is(".day")) {
    var c=parseInt(i.text(), 10)||1, s=this.viewDate.getUTCMonth(), l=this.viewDate.getUTCFullYear();
    i.is(".old")?0===s?(s=11, l-=1): s-=1:i.is(".new")&&(11==s?(s=0, l+=1):s+=1), this._date=a(l, s, c, this._date.getUTCHours(), this._date.getUTCMinutes(), this._date.getUTCSeconds(), this._date.getUTCMilliseconds()), this.viewDate=a(l, s, Math.min(28, c), 0, 0, 0, 0), this.fillDate(), this.set(), this.notifyChange();
}
}}, actions: {
    incrementHours: function() {
    this._date.setUTCHours(this._date.getUTCHours()+1);
}
, incrementMinutes: function() {
    this._date.setUTCMinutes(this._date.getUTCMinutes()+1);
}
, incrementSeconds: function() {
    this._date.setUTCSeconds(this._date.getUTCSeconds()+1);
}
, decrementHours: function() {
    this._date.setUTCHours(this._date.getUTCHours()-1);
}
, decrementMinutes: function() {
    this._date.setUTCMinutes(this._date.getUTCMinutes()-1);
}
, decrementSeconds: function() {
    this._date.setUTCSeconds(this._date.getUTCSeconds()-1);
}
, togglePeriod: function() {
    var e=this._date.getUTCHours();
    e>=12?e-=12: e+=12, this._date.setUTCHours(e);
}
, showPicker:function() {
    this.widget.find(".timepicker > div: not(.timepicker-picker)").hide(), this.widget.find(".timepicker .timepicker-picker").show();
}
, showHours:function() {
    this.widget.find(".timepicker .timepicker-picker").hide(), this.widget.find(".timepicker .timepicker-hours").show();
}
, showMinutes: function() {
    this.widget.find(".timepicker .timepicker-picker").hide(), this.widget.find(".timepicker .timepicker-minutes").show();
}
, showSeconds: function() {
    this.widget.find(".timepicker .timepicker-picker").hide(), this.widget.find(".timepicker .timepicker-seconds").show();
}
, selectHour: function(t) {
    var i=e(t.target), n=parseInt(i.text(), 10);
    if(this.options.pick12HourFormat) {
    var a=this._date.getUTCHours();
    a>=12?12!=n&&(n=(n+12)%24): 12===n?n=0:n%=12;
}
this._date.setUTCHours(n), this.actions.showPicker.call(this);
}, selectMinute:function(t) {
    var i=e(t.target), n=parseInt(i.text(), 10);
    this._date.setUTCMinutes(n), this.actions.showPicker.call(this);
}
, selectSecond: function(t) {
    var i=e(t.target), n=parseInt(i.text(), 10);
    this._date.setUTCSeconds(n), this.actions.showPicker.call(this);
}
}, doAction: function(t) {
    t.stopPropagation(), t.preventDefault(), this._date||(this._date=a(1970, 0, 0, 0, 0, 0, 0));
    var i=e(t.currentTarget).data("action"), n=this.actions[i].apply(this, arguments);
    return this.set(), this.fillTime(), this.notifyChange(), n;
}
, stopEvent: function(e) {
    e.stopPropagation(), e.preventDefault();
}
, keydown: function(t) {
    var i=this, n=t.which, a=e(t.target);
    (8==n||46==n)&&setTimeout(function() {
    i._resetMaskPos(a);
}
);
}, keypress: function(t) {
    var i=t.which;
    if(8!=i&&46!=i) {
    var n=e(t.target), a=String.fromCharCode(i), o=n.val()||"";
    o+=a;
    var r=this._mask[this._maskPos];
    if(!r)return!1;
    if(r.end==o.length) {
    if(!r.pattern.test(o.slice(r.start))) {
    for(o=o.slice(0, o.length-1);
    (r=this._mask[this._maskPos])&&r.character;
    )o+=r.character, this._maskPos++;
    return o+=a, r.end!=o.length?(n.val(o), !1): r.pattern.test(o.slice(r.start))?(n.val(o), this._maskPos++, !1):(n.val(o.slice(0, r.start)), !1);
}
this._maskPos++}}}, change:function(t) {
    var i=e(t.target), n=i.val();
    this._formatPattern.test(n)?(this.update(), this.setValue(this._date.getTime()), this.notifyChange(), this.set()): n&&n.trim()?(this.setValue(this._date.getTime()), this._date?this.set():i.val("")):this._date&&(this.setValue(null), this.notifyChange(), this._unset=!0), this._resetMaskPos(i);
}
, showMode:function(e) {
    e&&(this.viewMode=Math.max(this.minViewMode, Math.min(2, this.viewMode+e))), this.widget.find(".datepicker > div").hide().filter(".datepicker-"+p.modes[this.viewMode].clsName).show();
}
, destroy: function() {
    this._detachDatePickerEvents(), this._detachDatePickerGlobalEvents(), this.widget.remove(), this.$element.removeData("datetimepicker"), this.component.removeData("datetimepicker");
}
, formatDate: function(e) {
    return this.format.replace(h, function(t) {
    var n, a, o, r=t.length;
    if("ms"===t&&(r=1), a=l[t].property, "Hours12"===a)o=e.getUTCHours(), 0===o?o=12: 12!==o&&(o%=12);
    else {
    if("Period12"===a)return e.getUTCHours()>=12?"PM": "AM";
    n="get"+a, o=e[n]();
}
return"getUTCMonth"===n&&(o+=1), "getUTCYear"===n&&(o=o+1900-2e3), i(o.toString(), r, "0");
});
}, parseDate: function(e) {
    var t, i, n, a, o= {
}
;
    if(!(t=this._formatPattern.exec(e)))return null;
    for(i=1;
    i<t.length;
    i++)n=this._propertiesByIndex[i], n&&(a=t[i], /^\d+$/.test(a)&&(a=parseInt(a, 10)), o[n]=a);
    return this._finishParsingDate(o);
}
, _resetMaskPos: function(e) {
    for(var t=e.val(), i=0;
    i<this._mask.length;
    i++) {
    if(this._mask[i].end>t.length) {
    this._maskPos=i;
    break;
}
if(this._mask[i].end===t.length) {
    this._maskPos=i+1;
    break;
}
}}, _finishParsingDate: function(e) {
    var t, i, n, o, r, s, l;
    return t=e.UTCFullYear, e.UTCYear&&(t=2e3+e.UTCYear), t||(t=1970), i=e.UTCMonth?e.UTCMonth-1: 0, n=e.UTCDate||1, o=e.UTCHours||0, r=e.UTCMinutes||0, s=e.UTCSeconds||0, l=e.UTCMilliseconds||0, e.Hours12&&(o=e.Hours12), e.Period12&&(/pm/i.test(e.Period12)?12!=o&&(o=(o+12)%24):o%=12), a(t, i, n, o, r, s, l);
}
, _compileFormat:function() {
    for(var e, i, n=[], a=[], o=this.format, r= {
}
, s=0, c=0;
    e=d.exec(o);
    )i=e[0], i in l?(s++, r[s]=l[i].property, n.push("\\s*"+l[i].getPattern(this)+"\\s*"), a.push( {
    pattern: new RegExp(l[i].getPattern(this)), property:l[i].property, start:c, end:c+=i.length;
}
)):(n.push(t(i)), a.push( {
    pattern: new RegExp(t(i)), character:i, start:c, end:++c;
}
)), o=o.slice(i.length);
    this._mask=a, this._maskPos=0, this._formatPattern=new RegExp("^\\s*"+n.join("")+"\\s*$"), this._propertiesByIndex=r;
}
, _attachDatePickerEvents: function() {
    var t=this;
    this.widget.on("click", ".datepicker *", e.proxy(this.click, this)), this.widget.on("click", "[data-action]", e.proxy(this.doAction, this)), this.widget.on("mousedown", e.proxy(this.stopEvent, this)), this.pickDate&&this.pickTime&&this.widget.on("click.togglePicker", ".accordion-toggle", function(i) {
    i.stopPropagation();
    var n=e(this), a=n.closest("ul"), o=a.find(".collapse.in"), r=a.find(".collapse: not(.in)");
    if(o&&o.length) {
    var s=o.data("collapse");
    if(s&&s.transitioning)return;
    o.collapse("hide"), r.collapse("show"), n.find("i").toggleClass(t.timeIcon+" "+t.dateIcon), t.$element.find(".add-on i").toggleClass(t.timeIcon+" "+t.dateIcon);
}
}), this.isInput?(this.$element.on( {
    focus: e.proxy(this.show, this), change:e.proxy(this.change, this);
}
), this.options.maskInput&&this.$element.on( {
    keydown: e.proxy(this.keydown, this), keypress:e.proxy(this.keypress, this);
}
)):(this.$element.on( {
    change: e.proxy(this.change, this);
}
, "input"), this.options.maskInput&&this.$element.on( {
    keydown: e.proxy(this.keydown, this), keypress:e.proxy(this.keypress, this);
}
, "input"), this.component?this.component.on("click", e.proxy(this.show, this)):this.$element.on("click", e.proxy(this.show, this)));
}, _attachDatePickerGlobalEvents:function() {
    e(window).on("resize.datetimepicker"+this.id, e.proxy(this.place, this)), this.isInput||e(document).on("mousedown.datetimepicker"+this.id, e.proxy(this.hide, this));
}
, _detachDatePickerEvents: function() {
    this.widget.off("click", ".datepicker *", this.click), this.widget.off("click", "[data-action]"), this.widget.off("mousedown", this.stopEvent), this.pickDate&&this.pickTime&&this.widget.off("click.togglePicker"), this.isInput?(this.$element.off( {
    focus: this.show, change:this.change;
}
), this.options.maskInput&&this.$element.off( {
    keydown: this.keydown, keypress:this.keypress;
}
)):(this.$element.off( {
    change: this.change;
}
, "input"), this.options.maskInput&&this.$element.off( {
    keydown: this.keydown, keypress:this.keypress;
}
, "input"), this.component?this.component.off("click", this.show):this.$element.off("click", this.show));
}, _detachDatePickerGlobalEvents:function() {
    e(window).off("resize.datetimepicker"+this.id), this.isInput||e(document).off("mousedown.datetimepicker"+this.id);
}
, _isInFixed: function() {
    if(this.$element) {
    for(var t=this.$element.parents(), i=!1, n=0;
    n<t.length;
    n++)if("fixed"==e(t[n]).css("position")) {
    i=!0;
    break;
}
return i;
}return!1;
}}, e.fn.datetimepicker=function(t, i) {
    return this.each(function() {
    var n=e(this), a=n.data("datetimepicker"), r="object"==typeof t&&t;
    a||n.data("datetimepicker", a=new o(this, e.extend( {
}
, e.fn.datetimepicker.defaults, r))), "string"==typeof t&&a[t](i);
}
);
}, e.fn.datetimepicker.defaults= {
    maskInput: !1, pickDate:!0, pickTime:!0, pick12HourFormat:!1, pickSeconds:!0, startDate:-1/0, endDate:1/0, collapse:!0;
}
, e.fn.datetimepicker.Constructor=o;
    var r=0, s=e.fn.datetimepicker.dates= {
    en:  {
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], daysShort:["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], daysMin:["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"], months:["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], monthsShort:["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
}
}, l= {
    dd:  {
    property: "UTCDate", getPattern:function() {
    return"(0?[1-9]|[1-2][0-9]|3[0-1])\\b"}
}, MM:  {
    property: "UTCMonth", getPattern:function() {
    return"(0?[1-9]|1[0-2])\\b"}
}, yy:  {
    property: "UTCYear", getPattern:function() {
    return"(\\d {
    2;
}
)\\b"}}, yyyy:  {
    property: "UTCFullYear", getPattern:function() {
    return"(\\d {
    4;
}
)\\b"}}, hh:  {
    property: "UTCHours", getPattern:function() {
    return"(0?[0-9]|1[0-9]|2[0-3])\\b"}
}, mm:  {
    property: "UTCMinutes", getPattern:function() {
    return"(0?[0-9]|[1-5][0-9])\\b"}
}, ss:  {
    property: "UTCSeconds", getPattern:function() {
    return"(0?[0-9]|[1-5][0-9])\\b"}
}, ms:  {
    property: "UTCMilliseconds", getPattern:function() {
    return"([0-9] {
    1, 3;
}
)\\b"}}, HH:  {
    property: "Hours12", getPattern:function() {
    return"(0?[1-9]|1[0-2])\\b"}
}, PP:  {
    property: "Period12", getPattern:function() {
    return"(AM|PM|am|pm|Am|aM|Pm|pM)\\b"}
}}, c=[];
    for(var u in l)c.push(u);
    c[c.length-1]+="\\b", c.push(".");
    var d=new RegExp(c.join("\\b|"));
    c.pop();
    var h=new RegExp(c.join("\\b|"), "g"), p= {
    modes: [ {
    clsName: "days", navFnc:"UTCMonth", navStep:1;
}
,  {
    clsName: "months", navFnc:"UTCFullYear", navStep:1;
}
,  {
    clsName: "years", navFnc:"UTCFullYear", navStep:10;
}
], isLeapYear:function(e) {
    return 0===e%4&&0!==e%100||0===e%400;
}
, getDaysInMonth: function(e, t) {
    return[31, p.isLeapYear(e)?29: 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][t];
}
, headTemplate:'<thead><tr><th class="prev">&lsaquo;
    </th><th colspan="5" class="switch"></th><th class="next">&rsaquo;
    </th></tr></thead>', contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>'}
;
    p.template='<div class="datepicker-days"><table class="table-condensed table-bordered">'+p.headTemplate+"<tbody></tbody>"+"</table>"+"</div>"+'<div class="datepicker-months">'+'<table class="table-condensed table-bordered">'+p.headTemplate+p.contTemplate+"</table>"+"</div>"+'<div class="datepicker-years">'+'<table class="table-condensed table-bordered">'+p.headTemplate+p.contTemplate+"</table>"+"</div>";
    var f= {
    hourTemplate: '<span data-action="showHours" data-time-component="hours" class="timepicker-hour"></span>', minuteTemplate:'<span data-action="showMinutes" data-time-component="minutes" class="timepicker-minute"></span>', secondTemplate:'<span data-action="showSeconds" data-time-component="seconds" class="timepicker-second"></span>'}
;
    f.getTemplate=function(e, t) {
    return'<div class="timepicker-picker"><table class="table-condensed"'+(e?' data-hour-format="12"': "")+">"+"<tr>"+'<td><a href="#" class="btn btn-gr-gray" data-action="incrementHours"><i class="icon-angle-up"></i></a></td>'+'<td class="separator"></td>'+'<td><a href="#" class="btn btn-gr-gray" data-action="incrementMinutes"><i class="icon-angle-up"></i></a></td>'+(t?'<td class="separator"></td><td><a href="#" class="btn btn-gr-gray" data-action="incrementSeconds"><i class="icon-angle-up"></i></a></td>':"")+(e?'<td class="separator"></td>':"")+"</tr>"+"<tr>"+"<td>"+f.hourTemplate+"</td> "+'<td class="separator">:</td>'+"<td>"+f.minuteTemplate+"</td> "+(t?'<td class="separator">:</td><td>'+f.secondTemplate+"</td>":"")+(e?'<td class="separator"></td><td><button type="button" class="btn btn-primary" data-action="togglePeriod"></button></td>':"")+"</tr>"+"<tr>"+'<td><a href="#" class="btn btn-gr-gray" data-action="decrementHours"><i class="icon-angle-down"></i></a></td>'+'<td class="separator"></td>'+'<td><a href="#" class="btn btn-gr-gray" data-action="decrementMinutes"><i class="icon-angle-down"></i></a></td>'+(t?'<td class="separator"></td><td><a href="#" class="btn btn-gr-gray" data-action="decrementSeconds"><i class="icon-angle-down"></i></a></td>':"")+(e?'<td class="separator"></td>':"")+"</tr>"+"</table>"+"</div>"+'<div class="timepicker-hours" data-action="selectHour">'+'<table class="table-condensed">'+"</table>"+"</div>"+'<div class="timepicker-minutes" data-action="selectMinute">'+'<table class="table-condensed">'+"</table>"+"</div>"+(t?'<div class="timepicker-seconds" data-action="selectSecond"><table class="table-condensed"></table></div>':"");
}
}(window.jQuery);
    