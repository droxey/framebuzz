!function(e) {
    "use strict";
    var t=function(i, n, a) {
    a&&(a.stopPropagation(), a.preventDefault()), this.$element=e(i), this.$newElement=null, this.$button=null, this.$menu=null, this.options=e.extend( {
}
, e.fn.selectpicker.defaults, this.$element.data(), "object"==typeof n&&n), null==this.options.title&&(this.options.title=this.$element.attr("title")), this.val=t.prototype.val, this.render=t.prototype.render, this.refresh=t.prototype.refresh, this.setStyle=t.prototype.setStyle, this.selectAll=t.prototype.selectAll, this.deselectAll=t.prototype.deselectAll, this.init();
}
;
    t.prototype= {
    constructor: t, init:function() {
    this.$element.hide(), this.multiple=this.$element.prop("multiple");
    var t=this.$element.attr("id");
    if(this.$newElement=this.createView(), this.$element.after(this.$newElement), this.$menu=this.$newElement.find("> .dropdown-menu"), this.$button=this.$newElement.find("> button"), void 0!==t) {
    var i=this;
    this.$button.attr("data-id", t), e('label[for="'+t+'"]').click(function() {
    i.$button.focus();
}
);
}this.checkDisabled(), this.checkTabIndex(), this.clickListener(), this.render(), this.liHeight(), this.setStyle(), this.setWidth(), this.options.container&&this.selectPosition(), this.$menu.data("this", this), this.$newElement.data("this", this);
}, createDropdown: function() {
    var t=this.multiple?" show-tick": "", i=this.options.header?'<h3 class="popover-title">'+this.options.header+'<button type="button" class="close" aria-hidden="true">&times;
    </button></h3>': "", n="<div class='btn-group bootstrap-select"+t+"'>"+"<button type='button' class='btn btn-sm dropdown-toggle' data-toggle='dropdown'>"+"<div class='filter-option pull-left'></div>&nbsp;
    "+"<div class='caret'></div>"+"</button>"+"<div class='dropdown-menu open'>"+i+"<ul class='dropdown-menu inner' role='menu'>"+"</ul>"+"</div>"+"</div>";
    return e('select.select[data-style="btn-info"]').next().find(".dropdown-menu").addClass("select-blue"), e('select.select[data-style="btn-success"]').next().find(".dropdown-menu").addClass("select-green"), e('select.select[data-style="btn-warning"]').next().find(".dropdown-menu").addClass("select-orange"), e('select.select[data-style="btn-danger"]').next().find(".dropdown-menu").addClass("select-red"), e('select.select[data-style="btn-gr-gray"]').next().find(".dropdown-menu").addClass("btn-gr-gray"), e("select.select: not([data-style])").next().find("button.dropdown-toggle").addClass("btn-gr-gray"), e(n);
}
, createView:function() {
    var e=this.createDropdown(), t=this.createLi();
    return e.find("ul").append(t), e;
}
, reloadLi: function() {
    this.destroyLi();
    var e=this.createLi();
    this.$menu.find("ul").append(e);
}
, destroyLi: function() {
    this.$menu.find("li").remove();
}
, createLi: function() {
    var t=this, i=[], n="";
    return this.$element.find("option").each(function() {
    var n=e(this), a=n.attr("class")||"", s=n.attr("style")||"", o=n.data("content")?n.data("content"): n.html(), r=void 0!==n.data("subtext")?'<small class="muted">'+n.data("subtext")+"</small>":"", l=void 0!==n.data("icon")?'<i class="glyphicon '+n.data("icon")+'"></i> ':"";
    if(""!==l&&(n.is(": disabled")||n.parent().is(":disabled"))&&(l="<span>"+l+"</span>"), n.data("content")||(o=l+'<span class="text">'+o+r+"</span>"), t.options.hideDisabled&&(n.is(":disabled")||n.parent().is(":disabled")))i.push('<a style="min-height: 0;
     padding:  0"></a>');
    else if(n.parent().is("optgroup")&&1!=n.data("divider"))if(0==n.index()) {
    var c=n.parent().attr("label"), u=void 0!==n.parent().data("subtext")?'<small class="muted">'+n.parent().data("subtext")+"</small>": "", d=n.parent().data("icon")?'<i class="'+n.parent().data("icon")+'"></i> ':"";
    c=d+'<span class="text">'+c+u+"</span>", 0!=n[0].index?i.push('<div class="div-contain"><div class="divider"></div></div><dt>'+c+"</dt>"+t.createA(o, "opt "+a, s)): i.push("<dt>"+c+"</dt>"+t.createA(o, "opt "+a, s));
}
else i.push(t.createA(o, "opt "+a, s));
    else 1==n.data("divider")?i.push('<div class="div-contain"><div class="divider"></div></div>'): 1==e(this).data("hidden")?i.push(""):i.push(t.createA(o, a, s));
}
), e.each(i, function(e, t) {
    n+="<li rel="+e+">"+t+"</li>"}
), this.multiple||0!=this.$element.find("option: selected").length||t.options.title||this.$element.find("option").eq(0).prop("selected", !0).attr("selected", "selected"), e(n);
}, createA:function(e, t, i) {
    return'<a tabindex="0" class="'+t+'" style="'+i+'">'+e+'<i class="icon-checkmark check-mark"></i>'+"</a>"}
, render: function() {
    var t=this;
    this.$element.find("option").each(function(i) {
    t.setDisabled(i, e(this).is(": disabled")||e(this).parent().is(":disabled")), t.setSelected(i, e(this).is(":selected"));
}
);
    var i=this.$element.find("option: selected").map(function() {
    var i, n=e(this), a=n.data("icon")&&t.options.showIcon?'<i class="glyphicon '+n.data("icon")+'"></i> ': "";
    return i=t.options.showSubtext&&n.attr("data-subtext")&&!t.multiple?' <small class="muted">'+n.data("subtext")+"</small>": "", n.data("content")&&t.options.showContent?n.data("content"):void 0!=n.attr("title")?n.attr("title"):a+n.html()+i;
}
).toArray(), n=this.multiple?i.join(",  "):i[0];
    if(t.multiple&&t.options.selectedTextFormat.indexOf("count")>-1) {
    var a=t.options.selectedTextFormat.split(">"), s=this.options.hideDisabled?": not([disabled])":"";
    (a.length>1&&i.length>a[1]||1==a.length&&i.length>=2)&&(n=t.options.countSelectedText.replace(" {
    0;
}
", i.length).replace(" {
    1;
}
", this.$element.find('option: not([data-divider="true"]):not([data-hidden="true"])'+s).length));
}n||(n=void 0!=t.options.title?t.options.title:t.options.noneSelectedText), t.$newElement.find(".filter-option").html(n);
}, setStyle:function(e, t) {
    this.$element.attr("class")&&this.$newElement.addClass(this.$element.attr("class").replace(/selectpicker|mobile-device/gi, ""));
    var i=e?e: this.options.style;
    "add"==t?this.$button.addClass(i): "remove"==t?this.$button.removeClass(i):(this.$button.removeClass(this.options.style), this.$button.addClass(i));
}
, liHeight:function() {
    var e=this.$newElement.clone();
    e.appendTo("body");
    var t=e.addClass("open").find("> .dropdown-menu"), i=t.find("li > a").outerHeight(), n=this.options.header?t.find(".popover-title").outerHeight(): 0;
    e.remove(), this.$newElement.data("liHeight", i).data("headerHeight", n);
}
, setSize: function() {
    var t, i, n, a=this, s=this.$menu, o=s.find(".inner"), r=(o.find("li > a"), this.$newElement.outerHeight()), l=this.$newElement.data("liHeight"), c=this.$newElement.data("headerHeight"), u=s.find("li .divider").outerHeight(!0), d=parseInt(s.css("padding-top"))+parseInt(s.css("padding-bottom"))+parseInt(s.css("border-top-width"))+parseInt(s.css("border-bottom-width")), h=this.options.hideDisabled?": not(.disabled)":"", p=e(window), f=d+parseInt(s.css("margin-top"))+parseInt(s.css("margin-bottom"))+2, m=function() {
    i=a.$newElement.offset().top-p.scrollTop(), n=p.height()-i-r;
}
;
    if(m(), this.options.header&&s.css("padding-top", 0), "auto"==this.options.size) {
    var g=function() {
    var e;
    m(), t=n-f, a.$newElement.toggleClass("dropup", i>n&&t-f<s.height()&&a.options.dropupAuto), a.$newElement.hasClass("dropup")&&(t=i-f), e=s.find("li").length+s.find("dt").length>3?3*l+f-2: 0, s.css( {
    "max-height": t+"px", overflow:"hidden", "min-height":e+"px"}
), o.css( {
    "max-height": t-c-d+"px", "overflow-y":"auto", "min-height":e-d+"px"}
);
};
    g(), e(window).resize(g), e(window).scroll(g);
}
else if(this.options.size&&"auto"!=this.options.size&&s.find("li"+h).length>this.options.size) {
    var v=s.find("li"+h+" > *").filter(": not(.div-contain)").slice(0, this.options.size).last().parent().index(), y=s.find("li").slice(0, v+1).find(".div-contain").length;
    t=l*this.options.size+y*u+d, this.$newElement.toggleClass("dropup", i>n&&t<s.height()&&this.options.dropupAuto), s.css( {
    "max-height": t+c+"px", overflow:"hidden"}
), o.css( {
    "max-height": t-d+"px", "overflow-y":"auto"}
);
}}, setWidth:function() {
    if("auto"==this.options.width) {
    this.$menu.css("min-width", "0");
    var e=this.$newElement.clone().appendTo("body"), t=e.find("> .dropdown-menu").css("width");
    e.remove(), this.$newElement.css("width", t);
}
else"fit"==this.options.width?(this.$menu.css("min-width", ""), this.$newElement.css("width", "").addClass("fit-width")): this.options.width?(this.$menu.css("min-width", ""), this.$newElement.css("width", this.options.width)):(this.$menu.css("min-width", ""), this.$newElement.css("width", ""));
    this.$newElement.hasClass("fit-width")&&"fit"!==this.options.width&&this.$newElement.removeClass("fit-width");
}
, selectPosition: function() {
    var t, i, n=this, a="<div />", s=e(a), o=function(e) {
    s.addClass(e.attr("class")).toggleClass("dropup", e.hasClass("dropup")), t=e.offset(), i=e.hasClass("dropup")?0: e[0].offsetHeight, s.css( {
    top: t.top+i, left:t.left, width:e[0].offsetWidth, position:"absolute"}
);
};
    this.$newElement.on("click", function() {
    o(e(this)), s.appendTo(n.options.container), s.toggleClass("open", !e(this).hasClass("open")), s.append(n.$menu);
}
), e(window).resize(function() {
    o(n.$newElement);
}
), e(window).on("scroll", function() {
    o(n.$newElement);
}
), e("html").on("click", function(t) {
    e(t.target).closest(n.$newElement).length<1&&s.removeClass("open");
}
);
}, mobile: function() {
    this.$element.addClass("mobile-device").appendTo(this.$newElement), this.options.container&&this.$menu.hide();
}
, refresh: function() {
    this.reloadLi(), this.render(), this.setWidth(), this.setStyle(), this.checkDisabled();
}
, setSelected: function(e, t) {
    this.$menu.find("li").eq(e).toggleClass("selected", t);
}
, setDisabled: function(e, t) {
    t?this.$menu.find("li").eq(e).addClass("disabled").find("a").attr("href", "#").attr("tabindex", -1): this.$menu.find("li").eq(e).removeClass("disabled").find("a").removeAttr("href").attr("tabindex", 0);
}
, isDisabled:function() {
    return this.$element.is(": disabled");
}
, checkDisabled:function() {
    var e=this;
    this.isDisabled()?(this.$button.addClass("disabled"), this.$button.attr("tabindex", "-1")): this.$button.hasClass("disabled")&&(this.$button.removeClass("disabled"), this.$button.removeAttr("tabindex")), this.$button.click(function() {
    return!e.isDisabled();
}
);
}, checkTabIndex: function() {
    if(this.$element.is("[tabindex]")) {
    var e=this.$element.attr("tabindex");
    this.$button.attr("tabindex", e);
}
}, clickListener: function() {
    var t=this;
    e("body").on("touchstart.dropdown", ".dropdown-menu", function(e) {
    e.stopPropagation();
}
), this.$newElement.on("click", function() {
    t.setSize();
}
), this.$menu.on("click", "li a", function(i) {
    var n=e(this).parent().index(), a=(e(this).parent(), t.$element.val());
    if(t.multiple&&i.stopPropagation(), i.preventDefault(), !t.isDisabled()&&!e(this).parent().hasClass("disabled")) {
    var s=t.$element.find("option"), o=s.eq(n);
    if(t.multiple) {
    var r=o.prop("selected");
    o.prop("selected", !r);
}
else s.prop("selected", !1), o.prop("selected", !0);
    t.$button.focus(), a!=t.$element.val()&&t.$element.change();
}
}), this.$menu.on("click", "li.disabled a,  li dt,  li .div-contain,  h3.popover-title", function(e) {
    e.target==this&&(e.preventDefault(), e.stopPropagation(), t.$button.focus());
}
), this.$element.change(function() {
    t.render();
}
);
}, val: function(e) {
    return void 0!=e?(this.$element.val(e), this.$element.change(), this.$element): this.$element.val();
}
, selectAll:function() {
    this.$element.find("option").prop("selected", !0).attr("selected", "selected"), this.render();
}
, deselectAll: function() {
    this.$element.find("option").prop("selected", !1).removeAttr("selected"), this.render();
}
, keydown: function(t) {
    var i, n, a, s, o, r, l, c, u, d;
    if(i=e(this), a=i.parent(), d=a.data("this"), d.options.container&&(a=d.$menu), n=e("[role=menu] li: not(.divider):visible a", a), n.length) {
    if(/(38|40)/.test(t.keyCode))s=n.index(n.filter(": focus")), r=n.parent(":not(.disabled)").first().index(), l=n.parent(":not(.disabled)").last().index(), o=n.eq(s).parent().nextAll(":not(.disabled)").eq(0).index(), c=n.eq(s).parent().prevAll(":not(.disabled)").eq(0).index(), u=n.eq(o).parent().prevAll(":not(.disabled)").eq(0).index(), 38==t.keyCode&&(s!=u&&s>c&&(s=c), r>s&&(s=r)), 40==t.keyCode&&(s!=u&&o>s&&(s=o), s>l&&(s=l), -1==s&&(s=0)), n.eq(s).focus();
    else {
    var h= {
    48: "0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7", 56:"8", 57:"9", 59:";
    ", 65: "a", 66:"b", 67:"c", 68:"d", 69:"e", 70:"f", 71:"g", 72:"h", 73:"i", 74:"j", 75:"k", 76:"l", 77:"m", 78:"n", 79:"o", 80:"p", 81:"q", 82:"r", 83:"s", 84:"t", 85:"u", 86:"v", 87:"w", 88:"x", 89:"y", 90:"z", 96:"0", 97:"1", 98:"2", 99:"3", 100:"4", 101:"5", 102:"6", 103:"7", 104:"8", 105:"9"}
, p=[];
    n.each(function() {
    e(this).parent().is(": not(.disabled)")&&e.trim(e(this).text().toLowerCase()).substring(0, 1)==h[t.keyCode]&&p.push(e(this).parent().index());
}
);
    var f=e(document).data("keycount");
    f++, e(document).data("keycount", f);
    var m=e.trim(e(": focus").text().toLowerCase()).substring(0, 1);
    m!=h[t.keyCode]?(f=1, e(document).data("keycount", f)): f>=p.length&&e(document).data("keycount", 0), n.eq(p[f-1]).focus();
}
/(13|32)/.test(t.keyCode)&&(t.preventDefault(), e(":focus").click(), e(document).data("keycount", 0));
}}, hide:function() {
    this.$newElement.hide();
}
, show: function() {
    this.$newElement.show();
}
, destroy: function() {
    this.$newElement.remove(), this.$element.remove();
}
}, e.fn.selectpicker=function(i, n) {
    var a, s=arguments, o=this.each(function() {
    if(e(this).is("select")) {
    var o=e(this), r=o.data("selectpicker"), l="object"==typeof i&&i;
    if(r) {
    if(l)for(var c in l)r.options[c]=l[c];
}
else o.data("selectpicker", r=new t(this, l, n));
    if("string"==typeof i) {
    var u=i;
    r[u]instanceof Function?([].shift.apply(s), a=r[u].apply(r, s)): a=r.options[u];
}
}});
    return void 0!=a?a: o;
}
, e.fn.selectpicker.defaults= {
    style: null, size:"auto", title:null, selectedTextFormat:"values", noneSelectedText:"Nothing selected", countSelectedText:" {
    0;
}
 of  {
    1;
}
 selected", width: !1, container:!1, hideDisabled:!1, showSubtext:!1, showIcon:!0, showContent:!0, dropupAuto:!0, header:!1;
}, e(document).data("keycount", 0).on("keydown", "[data-toggle=dropdown],  [role=menu]", t.prototype.keydown);
}(window.jQuery);
    