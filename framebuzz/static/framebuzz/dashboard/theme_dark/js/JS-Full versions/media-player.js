function onYouTubePlayerAPIReady() {
    mejs.YouTubeApi.iFrameReady();
}
function onYouTubePlayerReady(e) {
    mejs.YouTubeApi.flashReady(e);
}
var mejs=mejs|| {
}
;
    mejs.version="2.13.0", mejs.meIndex=0, mejs.plugins= {
    silverlight: [ {
    version: [3, 0], types:["video/mp4", "video/m4v", "video/mov", "video/wmv", "audio/wma", "audio/m4a", "audio/mp3", "audio/wav", "audio/mpeg"];
}
], flash:[ {
    version: [9, 0, 124], types:["video/mp4", "video/m4v", "video/mov", "video/flv", "video/rtmp", "video/x-flv", "audio/flv", "audio/x-flv", "audio/mp3", "audio/m4a", "audio/mpeg", "video/youtube", "video/x-youtube"];
}
], youtube:[ {
    version: null, types:["video/youtube", "video/x-youtube", "audio/youtube", "audio/x-youtube"];
}
], vimeo:[ {
    version: null, types:["video/vimeo", "video/x-vimeo"];
}
];
}, mejs.Utility= {
    encodeUrl: function(e) {
    return encodeURIComponent(e);
}
, escapeHTML: function(e) {
    return e.toString().split("&").join("&amp;
    ").split("<").join("&lt;
    ").split('"').join("&quot;
    ");
}
, absolutizeUrl: function(e) {
    var t=document.createElement("div");
    return t.innerHTML='<a href="'+this.escapeHTML(e)+'">x</a>', t.firstChild.href;
}
, getScriptPath: function(e) {
    for(var t, i, n, a, o, r, s=0, l="", c="", u=document.getElementsByTagName("script"), d=u.length, h=e.length;
    d>s;
    s++) {
    for(a=u[s].src, i=a.lastIndexOf("/"), i>-1?(r=a.substring(i+1), o=a.substring(0, i+1)): (r=a, o=""), t=0;
    h>t;
    t++)if(c=e[t], n=r.indexOf(c), n>-1) {
    l=o;
    break;
}
if(""!==l)break;
}return l;
}, secondsToTimeCode: function(e, t, i, n) {
    "undefined"==typeof i?i=!1: "undefined"==typeof n&&(n=25);
    var a=Math.floor(e/3600)%24, o=Math.floor(e/60)%60, r=Math.floor(e%60), s=Math.floor((e%1*n).toFixed(3)), l=(t||a>0?(10>a?"0"+a: a)+":":"")+(10>o?"0"+o:o)+":"+(10>r?"0"+r:r)+(i?":"+(10>s?"0"+s:s):"");
    return l;
}
, timeCodeToSeconds: function(e, t, i, n) {
    "undefined"==typeof i?i=!1: "undefined"==typeof n&&(n=25);
    var a=e.split(": "), o=parseInt(a[0], 10), r=parseInt(a[1], 10), s=parseInt(a[2], 10), l=0, c=0;
    return i&&(l=parseInt(a[3])/n), c=3600*o+60*r+s+l;
}
, convertSMPTEtoSeconds: function(e) {
    if("string"!=typeof e)return!1;
    e=e.replace(", ", ".");
    var t=0, i=-1!=e.indexOf(".")?e.split(".")[1].length: 0, n=1;
    e=e.split(": ").reverse();
    for(var a=0;
    a<e.length;
    a++)n=1, a>0&&(n=Math.pow(60, a)), t+=Number(e[a])*n;
    return Number(t.toFixed(i));
}
, removeSwf: function(e) {
    var t=document.getElementById(e);
    t&&/object|embed/i.test(t.nodeName)&&(mejs.MediaFeatures.isIE?(t.style.display="none", function() {
    4==t.readyState?mejs.Utility.removeObjectInIE(e): setTimeout(arguments.callee, 10);
}
()):t.parentNode.removeChild(t));
}, removeObjectInIE:function(e) {
    var t=document.getElementById(e);
    if(t) {
    for(var i in t)"function"==typeof t[i]&&(t[i]=null);
    t.parentNode.removeChild(t);
}
}}, mejs.PluginDetector= {
    hasPluginVersion: function(e, t) {
    var i=this.plugins[e];
    return t[1]=t[1]||0, t[2]=t[2]||0, i[0]>t[0]||i[0]==t[0]&&i[1]>t[1]||i[0]==t[0]&&i[1]==t[1]&&i[2]>=t[2]?!0: !1;
}
, nav:window.navigator, ua:window.navigator.userAgent.toLowerCase(), plugins:[], addPlugin:function(e, t, i, n, a) {
    this.plugins[e]=this.detectPlugin(t, i, n, a);
}
, detectPlugin: function(e, t, i, n) {
    var a, o, r, s=[0, 0, 0];
    if("undefined"!=typeof this.nav.plugins&&"object"==typeof this.nav.plugins[e]) {
    if(a=this.nav.plugins[e].description, a&&("undefined"==typeof this.nav.mimeTypes||!this.nav.mimeTypes[t]||this.nav.mimeTypes[t].enabledPlugin))for(s=a.replace(e, "").replace(/^\s+/, "").replace(/\sr/gi, ".").split("."), o=0;
    o<s.length;
    o++)s[o]=parseInt(s[o].match(/\d+/), 10);
}
else if("undefined"!=typeof window.ActiveXObject)try {
    r=new ActiveXObject(i), r&&(s=n(r));
}
catch(l) {
}
return s;
}
}, mejs.PluginDetector.addPlugin("flash", "Shockwave Flash", "application/x-shockwave-flash", "ShockwaveFlash.ShockwaveFlash", function(e) {
    var t=[], i=e.GetVariable("$version");
    return i&&(i=i.split(" ")[1].split(", "), t=[parseInt(i[0], 10), parseInt(i[1], 10), parseInt(i[2], 10)]), t;
}
), mejs.PluginDetector.addPlugin("silverlight", "Silverlight Plug-In", "application/x-silverlight-2", "AgControl.AgControl", function(e) {
    var t=[0, 0, 0, 0], i=function(e, t, i, n) {
    for(;
    e.isVersionSupported(t[0]+"."+t[1]+"."+t[2]+"."+t[3]);
    )t[i]+=n;
    t[i]-=n;
}
;
    return i(e, t, 0, 1), i(e, t, 1, 1), i(e, t, 2, 1e4), i(e, t, 2, 1e3), i(e, t, 2, 100), i(e, t, 2, 10), i(e, t, 2, 1), i(e, t, 3, 1), t;
}
), mejs.MediaFeatures= {
    init: function() {
    var e, t, i=this, n=document, a=mejs.PluginDetector.nav, o=mejs.PluginDetector.ua.toLowerCase(), r=["source", "track", "audio", "video"];
    i.isiPad=null!==o.match(/ipad/i), i.isiPhone=null!==o.match(/iphone/i), i.isiOS=i.isiPhone||i.isiPad, i.isAndroid=null!==o.match(/android/i), i.isBustedAndroid=null!==o.match(/android 2\.[12]/), i.isBustedNativeHTTPS="https: "===location.protocol&&(null!==o.match(/android [12]\./)||null!==o.match(/macintosh.* version.* safari/)), i.isIE=-1!=a.appName.toLowerCase().indexOf("microsoft"), i.isChrome=null!==o.match(/chrome/gi), i.isFirefox=null!==o.match(/firefox/gi), i.isWebkit=null!==o.match(/webkit/gi), i.isGecko=null!==o.match(/gecko/gi)&&!i.isWebkit, i.isOpera=null!==o.match(/opera/gi), i.hasTouch="ontouchstart"in window&&null!=window.ontouchstart, i.svg=!!document.createElementNS&&!!document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect;
    for(e=0;
    e<r.length;
    e++)t=document.createElement(r[e]);
    i.supportsMediaTag="undefined"!=typeof t.canPlayType||i.isBustedAndroid;
    try {
    t.canPlayType("video/mp4");
}
catch(s) {
    i.supportsMediaTag=!1;
}
i.hasSemiNativeFullScreen="undefined"!=typeof t.webkitEnterFullscreen, i.hasWebkitNativeFullScreen="undefined"!=typeof t.webkitRequestFullScreen, i.hasMozNativeFullScreen="undefined"!=typeof t.mozRequestFullScreen, i.hasTrueNativeFullScreen=i.hasWebkitNativeFullScreen||i.hasMozNativeFullScreen, i.nativeFullScreenEnabled=i.hasTrueNativeFullScreen, i.hasMozNativeFullScreen&&(i.nativeFullScreenEnabled=t.mozFullScreenEnabled), this.isChrome&&(i.hasSemiNativeFullScreen=!1), i.hasTrueNativeFullScreen&&(i.fullScreenEventName=i.hasWebkitNativeFullScreen?"webkitfullscreenchange": "mozfullscreenchange", i.isFullScreen=function() {
    return t.mozRequestFullScreen?n.mozFullScreen: t.webkitRequestFullScreen?n.webkitIsFullScreen:void 0;
}
, i.requestFullScreen=function(e) {
    i.hasWebkitNativeFullScreen?e.webkitRequestFullScreen(): i.hasMozNativeFullScreen&&e.mozRequestFullScreen();
}
, i.cancelFullScreen=function() {
    i.hasWebkitNativeFullScreen?document.webkitCancelFullScreen(): i.hasMozNativeFullScreen&&document.mozCancelFullScreen();
}
), i.hasSemiNativeFullScreen&&o.match(/mac os x 10_5/i)&&(i.hasNativeFullScreen=!1, i.hasSemiNativeFullScreen=!1);
}}, mejs.MediaFeatures.init(), mejs.HtmlMediaElement= {
    pluginType: "native", isFullScreen:!1, setCurrentTime:function(e) {
    this.currentTime=e;
}
, setMuted: function(e) {
    this.muted=e;
}
, setVolume: function(e) {
    this.volume=e;
}
, stop: function() {
    this.pause();
}
, setSrc: function(e) {
    for(var t=this.getElementsByTagName("source");
    t.length>0;
    )this.removeChild(t[0]);
    if("string"==typeof e)this.src=e;
    else {
    var i, n;
    for(i=0;
    i<e.length;
    i++)if(n=e[i], this.canPlayType(n.type)) {
    this.src=n.src;
    break;
}
}}, setVideoSize: function(e, t) {
    this.width=e, this.height=t;
}
}, mejs.PluginMediaElement=function(e, t, i) {
    this.id=e, this.pluginType=t, this.src=i, this.events= {
}
, this.attributes= {
}
}
, mejs.PluginMediaElement.prototype= {
    pluginElement: null, pluginType:"", isFullScreen:!1, playbackRate:-1, defaultPlaybackRate:-1, seekable:[], played:[], paused:!0, ended:!1, seeking:!1, duration:0, error:null, tagName:"", muted:!1, volume:1, currentTime:0, play:function() {
    null!=this.pluginApi&&("youtube"==this.pluginType?this.pluginApi.playVideo(): this.pluginApi.playMedia(), this.paused=!1);
}
, load:function() {
    null!=this.pluginApi&&("youtube"==this.pluginType||this.pluginApi.loadMedia(), this.paused=!1);
}
, pause: function() {
    null!=this.pluginApi&&("youtube"==this.pluginType?this.pluginApi.pauseVideo(): this.pluginApi.pauseMedia(), this.paused=!0);
}
, stop:function() {
    null!=this.pluginApi&&("youtube"==this.pluginType?this.pluginApi.stopVideo(): this.pluginApi.stopMedia(), this.paused=!0);
}
, canPlayType:function(e) {
    var t, i, n, a=mejs.plugins[this.pluginType];
    for(t=0;
    t<a.length;
    t++)if(n=a[t], mejs.PluginDetector.hasPluginVersion(this.pluginType, n.version))for(i=0;
    i<n.types.length;
    i++)if(e==n.types[i])return"probably";
    return""}
, positionFullscreenButton: function(e, t, i) {
    null!=this.pluginApi&&this.pluginApi.positionFullscreenButton&&this.pluginApi.positionFullscreenButton(Math.floor(e), Math.floor(t), i);
}
, hideFullscreenButton: function() {
    null!=this.pluginApi&&this.pluginApi.hideFullscreenButton&&this.pluginApi.hideFullscreenButton();
}
, setSrc: function(e) {
    if("string"==typeof e)this.pluginApi.setSrc(mejs.Utility.absolutizeUrl(e)), this.src=mejs.Utility.absolutizeUrl(e);
    else {
    var t, i;
    for(t=0;
    t<e.length;
    t++)if(i=e[t], this.canPlayType(i.type)) {
    this.pluginApi.setSrc(mejs.Utility.absolutizeUrl(i.src)), this.src=mejs.Utility.absolutizeUrl(e);
    break;
}
}}, setCurrentTime: function(e) {
    null!=this.pluginApi&&("youtube"==this.pluginType?this.pluginApi.seekTo(e): this.pluginApi.setCurrentTime(e), this.currentTime=e);
}
, setVolume:function(e) {
    null!=this.pluginApi&&("youtube"==this.pluginType?this.pluginApi.setVolume(100*e): this.pluginApi.setVolume(e), this.volume=e);
}
, setMuted:function(e) {
    null!=this.pluginApi&&("youtube"==this.pluginType?(e?this.pluginApi.mute(): this.pluginApi.unMute(), this.muted=e, this.dispatchEvent("volumechange")):this.pluginApi.setMuted(e), this.muted=e);
}
, setVideoSize:function(e, t) {
    this.pluginElement.style&&(this.pluginElement.style.width=e+"px", this.pluginElement.style.height=t+"px"), null!=this.pluginApi&&this.pluginApi.setVideoSize&&this.pluginApi.setVideoSize(e, t);
}
, setFullscreen: function(e) {
    null!=this.pluginApi&&this.pluginApi.setFullscreen&&this.pluginApi.setFullscreen(e);
}
, enterFullScreen: function() {
    null!=this.pluginApi&&this.pluginApi.setFullscreen&&this.setFullscreen(!0);
}
, exitFullScreen: function() {
    null!=this.pluginApi&&this.pluginApi.setFullscreen&&this.setFullscreen(!1);
}
, addEventListener: function(e, t) {
    this.events[e]=this.events[e]||[], this.events[e].push(t);
}
, removeEventListener: function(e, t) {
    if(!e)return this.events= {
}
, !0;
    var n=this.events[e];
    if(!n)return!0;
    if(!t)return this.events[e]=[], !0;
    for(i=0;
    i<n.length;
    i++)if(n[i]===t)return this.events[e].splice(i, 1), !0;
    return!1;
}
, dispatchEvent: function(e) {
    var t, i, n=this.events[e];
    if(n)for(i=Array.prototype.slice.call(arguments, 1), t=0;
    t<n.length;
    t++)n[t].apply(null, i);
}
, hasAttribute: function(e) {
    return e in this.attributes;
}
, removeAttribute: function(e) {
    delete this.attributes[e];
}
, getAttribute: function(e) {
    return this.hasAttribute(e)?this.attributes[e]: ""}
, setAttribute:function(e, t) {
    this.attributes[e]=t;
}
, remove: function() {
    mejs.Utility.removeSwf(this.pluginElement.id), mejs.MediaPluginBridge.unregisterPluginElement(this.pluginElement.id);
}
}, mejs.MediaPluginBridge= {
    pluginMediaElements:  {
}
, htmlMediaElements: {
}
, registerPluginElement:function(e, t, i) {
    this.pluginMediaElements[e]=t, this.htmlMediaElements[e]=i;
}
, unregisterPluginElement: function(e) {
    delete this.pluginMediaElements[e], delete this.htmlMediaElements[e];
}
, initPlugin: function(e) {
    var t=this.pluginMediaElements[e], i=this.htmlMediaElements[e];
    if(t) {
    switch(t.pluginType) {
    case"flash": t.pluginElement=t.pluginApi=document.getElementById(e);
    break;
    case"silverlight": t.pluginElement=document.getElementById(t.id), t.pluginApi=t.pluginElement.Content.MediaElementJS;
}
null!=t.pluginApi&&t.success&&t.success(t, i);
}}, fireEvent:function(e, t, i) {
    var n, a, o, r=this.pluginMediaElements[e];
    if(r) {
    n= {
    type: t, target:r;
}
;
    for(a in i)r[a]=i[a], n[a]=i[a];
    o=i.bufferedTime||0, n.target.buffered=n.buffered= {
    start: function() {
    return 0;
}
, end: function() {
    return o;
}
, length: 1;
}, r.dispatchEvent(n.type, n);
}}}, mejs.MediaElementDefaults= {
    mode: "auto", plugins:["flash", "silverlight", "youtube", "vimeo"], enablePluginDebug:!1, httpsBasicAuthSite:!1, type:"", pluginPath:mejs.Utility.getScriptPath(["mediaelement.js", "mediaelement.min.js", "mediaelement-and-player.js", "mediaelement-and-player.min.js"]), flashName:"media/flashmediaelement.swf", flashStreamer:"", enablePluginSmoothing:!1, enablePseudoStreaming:!1, pseudoStreamingStartQueryParam:"start", silverlightName:"media/silverlightmediaelement.xap", defaultVideoWidth:480, defaultVideoHeight:270, pluginWidth:-1, pluginHeight:-1, pluginVars:[], timerRate:250, startVolume:.8, success:function() {
}
, error:function() {
}
}
, mejs.MediaElement=function(e, t) {
    return mejs.HtmlMediaElementShim.create(e, t);
}
, mejs.HtmlMediaElementShim= {
    create: function(e, t) {
    var i, n, a=mejs.MediaElementDefaults, o="string"==typeof e?document.getElementById(e): e, r=o.tagName.toLowerCase(), s="audio"===r||"video"===r, l=s?o.getAttribute("src"):o.getAttribute("href"), c=o.getAttribute("poster"), u=o.getAttribute("autoplay"), d=o.getAttribute("preload"), h=o.getAttribute("controls");
    for(n in t)a[n]=t[n];
    return l="undefined"==typeof l||null===l||""==l?null: l, c="undefined"==typeof c||null===c?"":c, d="undefined"==typeof d||null===d||"false"===d?"none":d, u=!("undefined"==typeof u||null===u||"false"===u), h=!("undefined"==typeof h||null===h||"false"===h), i=this.determinePlayback(o, a, mejs.MediaFeatures.supportsMediaTag, s, l), i.url=null!==i.url?mejs.Utility.absolutizeUrl(i.url):"", "native"==i.method?(mejs.MediaFeatures.isBustedAndroid&&(o.src=i.url, o.addEventListener("click", function() {
    o.play();
}
, !1)), this.updateNative(i, a, u, d)): ""!==i.method?this.createPlugin(i, a, c, u, d, h):(this.createErrorMessage(i, a, c), this);
}, determinePlayback:function(e, t, i, n, a) {
    var o, r, s, l, c, u, d, h, p, f, m, g=[], v= {
    method: "", url:"", htmlMediaElement:e, isVideo:"audio"!=e.tagName.toLowerCase();
}
;
    if("undefined"!=typeof t.type&&""!==t.type)if("string"==typeof t.type)g.push( {
    type: t.type, url:a;
}
);
    else for(o=0;
    o<t.type.length;
    o++)g.push( {
    type: t.type[o], url:a;
}
);
    else if(null!==a)u=this.formatType(a, e.getAttribute("type")), g.push( {
    type: u, url:a;
}
);
    else for(o=0;
    o<e.childNodes.length;
    o++)c=e.childNodes[o], 1==c.nodeType&&"source"==c.tagName.toLowerCase()&&(a=c.getAttribute("src"), u=this.formatType(a, c.getAttribute("type")), m=c.getAttribute("media"), (!m||!window.matchMedia||window.matchMedia&&window.matchMedia(m).matches)&&g.push( {
    type: u, url:a;
}
));
    if(!n&&g.length>0&&null!==g[0].url&&this.getTypeFromFile(g[0].url).indexOf("audio")>-1&&(v.isVideo=!1), mejs.MediaFeatures.isBustedAndroid&&(e.canPlayType=function(e) {
    return null!==e.match(/video\/(mp4|m4v)/gi)?"maybe": ""}
), !(!i||"auto"!==t.mode&&"auto_plugin"!==t.mode&&"native"!==t.mode||mejs.MediaFeatures.isBustedNativeHTTPS&&t.httpsBasicAuthSite===!0)) {
    for(n||(f=document.createElement(v.isVideo?"video": "audio"), e.parentNode.insertBefore(f, e), e.style.display="none", v.htmlMediaElement=e=f), o=0;
    o<g.length;
    o++)if(""!==e.canPlayType(g[o].type).replace(/no/, "")||""!==e.canPlayType(g[o].type.replace(/mp3/, "mpeg")).replace(/no/, "")) {
    v.method="native", v.url=g[o].url;
    break;
}
if("native"===v.method&&(null!==v.url&&(e.src=v.url), "auto_plugin"!==t.mode))return v;
}if("auto"===t.mode||"auto_plugin"===t.mode||"shim"===t.mode)for(o=0;
    o<g.length;
    o++)for(u=g[o].type, r=0;
    r<t.plugins.length;
    r++)for(d=t.plugins[r], h=mejs.plugins[d], s=0;
    s<h.length;
    s++)if(p=h[s], null==p.version||mejs.PluginDetector.hasPluginVersion(d, p.version))for(l=0;
    l<p.types.length;
    l++)if(u==p.types[l])return v.method=d, v.url=g[o].url, v;
    return"auto_plugin"===t.mode&&"native"===v.method?v: (""===v.method&&g.length>0&&(v.url=g[0].url), v);
}
, formatType:function(e, t) {
    return e&&!t?this.getTypeFromFile(e): t&&~t.indexOf(";
    ")?t.substr(0, t.indexOf(";
    ")): t;
}
, getTypeFromFile:function(e) {
    e=e.split("?")[0];
    var t=e.substring(e.lastIndexOf(".")+1).toLowerCase();
    return(/(mp4|m4v|ogg|ogv|webm|webmv|flv|wmv|mpeg|mov)/gi.test(t)?"video": "audio")+"/"+this.getTypeFromExtension(t);
}
, getTypeFromExtension:function(e) {
    switch(e) {
    case"mp4": case"m4v":return"mp4";
    case"webm": case"webma":case"webmv":return"webm";
    case"ogg": case"oga":case"ogv":return"ogg";
    default: return e;
}
}, createErrorMessage:function(e, t, i) {
    var n=e.htmlMediaElement, a=document.createElement("div");
    a.className="me-cannotplay";
    try {
    a.style.width=n.width+"px", a.style.height=n.height+"px"}
catch(o) {
}
a.innerHTML=t.customError?t.customError: ""!==i?'<a href="'+e.url+'"><img src="'+i+'" width="100%" height="100%" /></a>':'<a href="'+e.url+'"><span>'+mejs.i18n.t("Download File")+"</span></a>", n.parentNode.insertBefore(a, n), n.style.display="none", t.error(n);
}
, createPlugin:function(e, t, i, n, a, o) {
    var r, s, l, c=e.htmlMediaElement, u=1, d=1, h="me_"+e.method+"_"+mejs.meIndex++, p=new mejs.PluginMediaElement(h, e.method, e.url), f=document.createElement("div");
    p.tagName=c.tagName;
    for(var m=0;
    m<c.attributes.length;
    m++) {
    var g=c.attributes[m];
    1==g.specified&&p.setAttribute(g.name, g.value);
}
for(s=c.parentNode;
    null!==s&&"body"!=s.tagName.toLowerCase();
    ) {
    if("p"==s.parentNode.tagName.toLowerCase()) {
    s.parentNode.parentNode.insertBefore(s, s.parentNode);
    break;
}
s=s.parentNode;
}switch(e.isVideo?(u=t.pluginWidth>0?t.pluginWidth: t.videoWidth>0?t.videoWidth:null!==c.getAttribute("width")?c.getAttribute("width"):t.defaultVideoWidth, d=t.pluginHeight>0?t.pluginHeight:t.videoHeight>0?t.videoHeight:null!==c.getAttribute("height")?c.getAttribute("height"):t.defaultVideoHeight, u=mejs.Utility.encodeUrl(u), d=mejs.Utility.encodeUrl(d)):t.enablePluginDebug&&(u=320, d=240), p.success=t.success, mejs.MediaPluginBridge.registerPluginElement(h, p, c), f.className="me-plugin", f.id=h+"_container", e.isVideo?c.parentNode.insertBefore(f, c):document.body.insertBefore(f, document.body.childNodes[0]), l=["id="+h, "isvideo="+(e.isVideo?"true":"false"), "autoplay="+(n?"true":"false"), "preload="+a, "width="+u, "startvolume="+t.startVolume, "timerrate="+t.timerRate, "flashstreamer="+t.flashStreamer, "height="+d, "pseudostreamstart="+t.pseudoStreamingStartQueryParam], null!==e.url&&("flash"==e.method?l.push("file="+mejs.Utility.encodeUrl(e.url)):l.push("file="+e.url)), t.enablePluginDebug&&l.push("debug=true"), t.enablePluginSmoothing&&l.push("smoothing=true"), t.enablePseudoStreaming&&l.push("pseudostreaming=true"), o&&l.push("controls=true"), t.pluginVars&&(l=l.concat(t.pluginVars)), e.method) {
    case"silverlight": f.innerHTML='<object data="data:application/x-silverlight-2, " type="application/x-silverlight-2" id="'+h+'" name="'+h+'" width="'+u+'" height="'+d+'" class="mejs-shim">'+'<param name="initParams" value="'+l.join(", ")+'" />'+'<param name="windowless" value="true" />'+'<param name="background" value="black" />'+'<param name="minRuntimeVersion" value="3.0.0.0" />'+'<param name="autoUpgrade" value="true" />'+'<param name="source" value="'+t.pluginPath+t.silverlightName+'" />'+"</object>";
    break;
    case"flash": mejs.MediaFeatures.isIE?(r=document.createElement("div"), f.appendChild(r), r.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="//download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab" id="'+h+'" width="'+u+'" height="'+d+'" class="mejs-shim">'+'<param name="movie" value="'+t.pluginPath+t.flashName+"?x="+new Date+'" />'+'<param name="flashvars" value="'+l.join("&amp;
    ")+'" />'+'<param name="quality" value="high" />'+'<param name="bgcolor" value="#000000" />'+'<param name="wmode" value="transparent" />'+'<param name="allowScriptAccess" value="always" />'+'<param name="allowFullScreen" value="true" />'+"</object>"): f.innerHTML='<embed id="'+h+'" name="'+h+'" '+'play="true" '+'loop="false" '+'quality="high" '+'bgcolor="#000000" '+'wmode="transparent" '+'allowScriptAccess="always" '+'allowFullScreen="true" '+'type="application/x-shockwave-flash" pluginspage="//www.macromedia.com/go/getflashplayer" '+'src="'+t.pluginPath+t.flashName+'" '+'flashvars="'+l.join("&")+'" '+'width="'+u+'" '+'height="'+d+'" '+'class="mejs-shim"></embed>';
    break;
    case"youtube": var v=e.url.substr(e.url.lastIndexOf("=")+1);
    youtubeSettings= {
    container: f, containerId:f.id, pluginMediaElement:p, pluginId:h, videoId:v, height:d, width:u;
}
, mejs.PluginDetector.hasPluginVersion("flash", [10, 0, 0])?mejs.YouTubeApi.createFlash(youtubeSettings):mejs.YouTubeApi.enqueueIframe(youtubeSettings);
    break;
    case"vimeo": p.vimeoid=e.url.substr(e.url.lastIndexOf("/")+1), f.innerHTML='<iframe src="http://player.vimeo.com/video/'+p.vimeoid+'?portrait=0&byline=0&title=0" width="'+u+'" height="'+d+'" frameborder="0" class="mejs-shim"></iframe>'}
return c.style.display="none", c.removeAttribute("autoplay"), p;
}, updateNative:function(e, t) {
    var i, n=e.htmlMediaElement;
    for(i in mejs.HtmlMediaElement)n[i]=mejs.HtmlMediaElement[i];
    return t.success(n, n), n;
}
}, mejs.YouTubeApi= {
    isIframeStarted: !1, isIframeLoaded:!1, loadIframeApi:function() {
    if(!this.isIframeStarted) {
    var e=document.createElement("script");
    e.src="//www.youtube.com/player_api";
    var t=document.getElementsByTagName("script")[0];
    t.parentNode.insertBefore(e, t), this.isIframeStarted=!0;
}
}, iframeQueue: [], enqueueIframe:function(e) {
    this.isLoaded?this.createIframe(e): (this.loadIframeApi(), this.iframeQueue.push(e));
}
, createIframe:function(e) {
    var t=e.pluginMediaElement, i=new YT.Player(e.containerId,  {
    height: e.height, width:e.width, videoId:e.videoId, playerVars: {
    controls: 0;
}
, events: {
    onReady: function() {
    e.pluginMediaElement.pluginApi=i, mejs.MediaPluginBridge.initPlugin(e.pluginId), setInterval(function() {
    mejs.YouTubeApi.createEvent(i, t, "timeupdate");
}
, 250);
}, onStateChange: function(e) {
    mejs.YouTubeApi.handleStateChange(e.data, i, t);
}
}});
}, createEvent: function(e, t, i) {
    var n= {
    type: i, target:t;
}
;
    if(e&&e.getDuration) {
    t.currentTime=n.currentTime=e.getCurrentTime(), t.duration=n.duration=e.getDuration(), n.paused=t.paused, n.ended=t.ended, n.muted=e.isMuted(), n.volume=e.getVolume()/100, n.bytesTotal=e.getVideoBytesTotal(), n.bufferedBytes=e.getVideoBytesLoaded();
    var a=n.bufferedBytes/n.bytesTotal*n.duration;
    n.target.buffered=n.buffered= {
    start: function() {
    return 0;
}
, end: function() {
    return a;
}
, length: 1;
}}t.dispatchEvent(n.type, n);
}, iFrameReady:function() {
    for(this.isLoaded=!0, this.isIframeLoaded=!0;
    this.iframeQueue.length>0;
    ) {
    var e=this.iframeQueue.pop();
    this.createIframe(e);
}
}, flashPlayers:  {
}
, createFlash:function(e) {
    this.flashPlayers[e.pluginId]=e;
    var t, i="//www.youtube.com/apiplayer?enablejsapi=1&amp;
    playerapiid="+e.pluginId+"&amp;
    version=3&amp;
    autoplay=0&amp;
    controls=0&amp;
    modestbranding=1&loop=0";
    mejs.MediaFeatures.isIE?(t=document.createElement("div"), e.container.appendChild(t), t.outerHTML='<object classid="clsid: D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="//download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab" id="'+e.pluginId+'" width="'+e.width+'" height="'+e.height+'" class="mejs-shim">'+'<param name="movie" value="'+i+'" />'+'<param name="wmode" value="transparent" />'+'<param name="allowScriptAccess" value="always" />'+'<param name="allowFullScreen" value="true" />'+"</object>"):e.container.innerHTML='<object type="application/x-shockwave-flash" id="'+e.pluginId+'" data="'+i+'" '+'width="'+e.width+'" height="'+e.height+'" style="visibility: visible;
     " class="mejs-shim">'+'<param name="allowScriptAccess" value="always">'+'<param name="wmode" value="transparent">'+"</object>"}
, flashReady: function(e) {
    var t=this.flashPlayers[e], i=document.getElementById(e), n=t.pluginMediaElement;
    n.pluginApi=n.pluginElement=i, mejs.MediaPluginBridge.initPlugin(e), i.cueVideoById(t.videoId);
    var a=t.containerId+"_callback";
    window[a]=function(e) {
    mejs.YouTubeApi.handleStateChange(e, i, n);
}
, i.addEventListener("onStateChange", a), setInterval(function() {
    mejs.YouTubeApi.createEvent(i, n, "timeupdate");
}
, 250);
}, handleStateChange: function(e, t, i) {
    switch(e) {
    case-1: i.paused=!0, i.ended=!0, mejs.YouTubeApi.createEvent(t, i, "loadedmetadata");
    break;
    case 0: i.paused=!1, i.ended=!0, mejs.YouTubeApi.createEvent(t, i, "ended");
    break;
    case 1: i.paused=!1, i.ended=!1, mejs.YouTubeApi.createEvent(t, i, "play"), mejs.YouTubeApi.createEvent(t, i, "playing");
    break;
    case 2: i.paused=!0, i.ended=!1, mejs.YouTubeApi.createEvent(t, i, "pause");
    break;
    case 3: mejs.YouTubeApi.createEvent(t, i, "progress");
    break;
    case 5: }
}}, window.mejs=mejs, window.MediaElement=mejs.MediaElement, function(e, t) {
    "use strict";
    var i= {
    locale:  {
    language: "", strings: {
}
}
, methods: {
}
}
;
    i.locale.getLanguage=function() {
    return i.locale.language||navigator.language;
}
, "undefined"!=typeof mejsL10n&&(i.locale.language=mejsL10n.language), i.locale.INIT_LANGUAGE=i.locale.getLanguage(), i.methods.checkPlain=function(e) {
    var t, i, n= {
    "&": "&amp;
    ", '"': "&quot;
    ", "<": "&lt;
    ", ">": "&gt;
    "}
;
    e=String(e);
    for(t in n)n.hasOwnProperty(t)&&(i=new RegExp(t, "g"), e=e.replace(i, n[t]));
    return e;
}
, i.methods.formatString=function(e, t) {
    for(var n in t) {
    switch(n.charAt(0)) {
    case"@": t[n]=i.methods.checkPlain(t[n]);
    break;
    case"!": break;
    case"%": default:t[n]='<em class="placeholder">'+i.methods.checkPlain(t[n])+"</em>"}
e=e.replace(n, t[n]);
}return e;
}, i.methods.t=function(e, t, n) {
    return i.locale.strings&&i.locale.strings[n.context]&&i.locale.strings[n.context][e]&&(e=i.locale.strings[n.context][e]), t&&(e=i.methods.formatString(e, t)), e;
}
, i.t=function(e, t, n) {
    if("string"==typeof e&&e.length>0) {
    var a=i.locale.getLanguage();
    return n=n|| {
    context: a;
}
, i.methods.t(e, t, n);
}throw {
    name: "InvalidArgumentException", message:"First argument is either not a string or empty."}
}, t.i18n=i;
}(document, mejs), function(e) {
    "use strict";
    "undefined"!=typeof mejsL10n&&(e[mejsL10n.language]=mejsL10n.strings);
}
(mejs.i18n.locale.strings), function(e) {
    "use strict";
    e.de= {
    Fullscreen: "Vollbild", "Go Fullscreen":"Vollbild an", "Turn off Fullscreen":"Vollbild aus", Close:"Schließen"}
}(mejs.i18n.locale.strings), function(e) {
    "use strict";
    e.zh= {
    Fullscreen: "全螢幕", "Go Fullscreen":"全屏模式", "Turn off Fullscreen":"退出全屏模式", Close:"關閉"}
}(mejs.i18n.locale.strings), "undefined"!=typeof jQuery?mejs.$=jQuery:"undefined"!=typeof ender&&(mejs.$=ender), function(e) {
    mejs.MepDefaults= {
    poster: "", showPosterWhenEnded:!1, defaultVideoWidth:480, defaultVideoHeight:270, videoWidth:-1, videoHeight:-1, defaultAudioWidth:400, defaultAudioHeight:30, defaultSeekBackwardInterval:function(e) {
    return.05*e.duration;
}
, defaultSeekForwardInterval: function(e) {
    return.05*e.duration;
}
, audioWidth: -1, audioHeight:-1, startVolume:.8, loop:!1, autoRewind:!0, enableAutosize:!0, alwaysShowHours:!1, showTimecodeFrameCount:!1, framesPerSecond:25, autosizeProgress:!0, alwaysShowControls:!1, hideVideoControlsOnLoad:!1, clickToPlayPause:!0, iPadUseNativeControls:!1, iPhoneUseNativeControls:!1, AndroidUseNativeControls:!1, features:["playpause", "current", "progress", "duration", "tracks", "volume", "fullscreen"], isVideo:!0, enableKeyboard:!0, pauseOtherPlayers:!0, keyActions:[ {
    keys: [32, 179], action:function(e, t) {
    t.paused||t.ended?t.play(): t.pause();
}
},  {
    keys: [38], action:function(e, t) {
    var i=Math.min(t.volume+.1, 1);
    t.setVolume(i);
}
},  {
    keys: [40], action:function(e, t) {
    var i=Math.max(t.volume-.1, 0);
    t.setVolume(i);
}
},  {
    keys: [37, 227], action:function(e, t) {
    if(!isNaN(t.duration)&&t.duration>0) {
    e.isVideo&&(e.showControls(), e.startControlsTimer());
    var i=Math.max(t.currentTime-e.options.defaultSeekBackwardInterval(t), 0);
    t.setCurrentTime(i);
}
}},  {
    keys: [39, 228], action:function(e, t) {
    if(!isNaN(t.duration)&&t.duration>0) {
    e.isVideo&&(e.showControls(), e.startControlsTimer());
    var i=Math.min(t.currentTime+e.options.defaultSeekForwardInterval(t), t.duration);
    t.setCurrentTime(i);
}
}},  {
    keys: [70], action:function(e) {
    "undefined"!=typeof e.enterFullScreen&&(e.isFullScreen?e.exitFullScreen(): e.enterFullScreen());
}
}];
}, mejs.mepIndex=0, mejs.players= {
}
, mejs.MediaElementPlayer=function(t, i) {
    if(!(this instanceof mejs.MediaElementPlayer))return new mejs.MediaElementPlayer(t, i);
    var n=this;
    return n.$media=n.$node=e(t), n.node=n.media=n.$media[0], "undefined"!=typeof n.node.player?n.node.player: (n.node.player=n, "undefined"==typeof i&&(i=n.$node.data("mejsoptions")), n.options=e.extend( {
}
, mejs.MepDefaults, i), n.id="mep_"+mejs.mepIndex++, mejs.players[n.id]=n, n.init(), n);
}
, mejs.MediaElementPlayer.prototype= {
    hasFocus: !1, controlsAreVisible:!0, init:function() {
    var t=this, i=mejs.MediaFeatures, n=e.extend(!0,  {
}
, t.options,  {
    success: function(e, i) {
    t.meReady(e, i);
}
, error: function(e) {
    t.handleError(e);
}
}), a=t.media.tagName.toLowerCase();
    if(t.isDynamic="audio"!==a&&"video"!==a, t.isVideo=t.isDynamic?t.options.isVideo: "audio"!==a&&t.options.isVideo, i.isiPad&&t.options.iPadUseNativeControls||i.isiPhone&&t.options.iPhoneUseNativeControls)t.$media.attr("controls", "controls"), i.isiPad&&null!==t.media.getAttribute("autoplay")&&(t.media.load(), t.media.play());
    else if(i.isAndroid&&t.options.AndroidUseNativeControls);
    else {
    if(t.$media.removeAttr("controls"), t.container=e('<div id="'+t.id+'" class="mejs-container '+(mejs.MediaFeatures.svg?"svg": "no-svg")+'">'+'<div class="mejs-inner">'+'<div class="mejs-mediaelement"></div>'+'<div class="mejs-layers"></div>'+'<div class="mejs-controls"></div>'+'<div class="mejs-clear"></div>'+"</div>"+"</div>").addClass(t.$media[0].className).insertBefore(t.$media), t.container.addClass((i.isAndroid?"mejs-android ":"")+(i.isiOS?"mejs-ios ":"")+(i.isiPad?"mejs-ipad ":"")+(i.isiPhone?"mejs-iphone ":"")+(t.isVideo?"mejs-video ":"mejs-audio ")), i.isiOS) {
    var o=t.$media.clone();
    t.container.find(".mejs-mediaelement").append(o), t.$media.remove(), t.$node=t.$media=o, t.node=t.media=o[0];
}
else t.container.find(".mejs-mediaelement").append(t.$media);
    t.controls=t.container.find(".mejs-controls"), t.layers=t.container.find(".mejs-layers");
    var r=t.isVideo?"video": "audio", s=r.substring(0, 1).toUpperCase()+r.substring(1);
    t.width=t.options[r+"Width"]>0||t.options[r+"Width"].toString().indexOf("%")>-1?t.options[r+"Width"]: ""!==t.media.style.width&&null!==t.media.style.width?t.media.style.width:null!==t.media.getAttribute("width")?t.$media.attr("width"):t.options["default"+s+"Width"], t.height=t.options[r+"Height"]>0||t.options[r+"Height"].toString().indexOf("%")>-1?t.options[r+"Height"]:""!==t.media.style.height&&null!==t.media.style.height?t.media.style.height:null!==t.$media[0].getAttribute("height")?t.$media.attr("height"):t.options["default"+s+"Height"], t.setPlayerSize(t.width, t.height), n.pluginWidth=t.width, n.pluginHeight=t.height;
}
mejs.MediaElement(t.$media[0], n), "undefined"!=typeof t.container&&t.controlsAreVisible&&t.container.trigger("controlsshown");
}, showControls:function(e) {
    var t=this;
    e="undefined"==typeof e||e, t.controlsAreVisible||(e?(t.controls.css("visibility", "visible").stop(!0, !0).fadeIn(200, function() {
    t.controlsAreVisible=!0, t.container.trigger("controlsshown");
}
), t.container.find(".mejs-control").css("visibility", "visible").stop(!0, !0).fadeIn(200, function() {
    t.controlsAreVisible=!0;
}
)): (t.controls.css("visibility", "visible").css("display", "block"), t.container.find(".mejs-control").css("visibility", "visible").css("display", "block"), t.controlsAreVisible=!0, t.container.trigger("controlsshown")), t.setControlsSize());
}, hideControls:function(t) {
    var i=this;
    t="undefined"==typeof t||t, i.controlsAreVisible&&!i.options.alwaysShowControls&&(t?(i.controls.stop(!0, !0).fadeOut(200, function() {
    e(this).css("visibility", "hidden").css("display", "block"), i.controlsAreVisible=!1, i.container.trigger("controlshidden");
}
), i.container.find(".mejs-control").stop(!0, !0).fadeOut(200, function() {
    e(this).css("visibility", "hidden").css("display", "block");
}
)): (i.controls.css("visibility", "hidden").css("display", "block"), i.container.find(".mejs-control").css("visibility", "hidden").css("display", "block"), i.controlsAreVisible=!1, i.container.trigger("controlshidden")));
}, controlsTimer:null, startControlsTimer:function(e) {
    var t=this;
    e="undefined"!=typeof e?e: 1500, t.killControlsTimer("start"), t.controlsTimer=setTimeout(function() {
    t.hideControls(), t.killControlsTimer("hide");
}
, e);
}, killControlsTimer: function() {
    var e=this;
    null!==e.controlsTimer&&(clearTimeout(e.controlsTimer), delete e.controlsTimer, e.controlsTimer=null);
}
, controlsEnabled: !0, disableControls:function() {
    var e=this;
    e.killControlsTimer(), e.hideControls(!1), this.controlsEnabled=!1;
}
, enableControls: function() {
    var e=this;
    e.showControls(!1), e.controlsEnabled=!0;
}
, meReady: function(e, t) {
    var i, n, a=this, o=mejs.MediaFeatures, r=t.getAttribute("autoplay"), s=!("undefined"==typeof r||null===r||"false"===r);
    if(!a.created) {
    if(a.created=!0, a.media=e, a.domNode=t, !(o.isAndroid&&a.options.AndroidUseNativeControls||o.isiPad&&a.options.iPadUseNativeControls||o.isiPhone&&a.options.iPhoneUseNativeControls)) {
    a.buildposter(a, a.controls, a.layers, a.media), a.buildkeyboard(a, a.controls, a.layers, a.media), a.buildoverlays(a, a.controls, a.layers, a.media), a.findTracks();
    for(i in a.options.features)if(n=a.options.features[i], a["build"+n])try {
    a["build"+n](a, a.controls, a.layers, a.media);
}
catch(l) {
}
a.container.trigger("controlsready"), a.setPlayerSize(a.width, a.height), a.setControlsSize(), a.isVideo&&(mejs.MediaFeatures.hasTouch?a.$media.bind("touchstart", function() {
    a.controlsAreVisible?a.hideControls(!1): a.controlsEnabled&&a.showControls(!1);
}
):(mejs.MediaElementPlayer.prototype.clickToPlayPauseCallback=function() {
    a.options.clickToPlayPause&&(a.media.paused?a.media.play(): a.media.pause())
}
, a.media.addEventListener("click", a.clickToPlayPauseCallback, !1), a.container.bind("mouseenter mouseover", function() {
    a.controlsEnabled&&(a.options.alwaysShowControls||(a.killControlsTimer("enter"), a.showControls(), a.startControlsTimer(2500)));
}
).bind("mousemove", function() {
    a.controlsEnabled&&(a.controlsAreVisible||a.showControls(), a.options.alwaysShowControls||a.startControlsTimer(2500));
}
).bind("mouseleave", function() {
    a.controlsEnabled&&(a.media.paused||a.options.alwaysShowControls||a.startControlsTimer(1e3));
}
)), a.options.hideVideoControlsOnLoad&&a.hideControls(!1), s&&!a.options.alwaysShowControls&&a.hideControls(), a.options.enableAutosize&&a.media.addEventListener("loadedmetadata", function(e) {
    a.options.videoHeight<=0&&null===a.domNode.getAttribute("height")&&!isNaN(e.target.videoHeight)&&(a.setPlayerSize(e.target.videoWidth, e.target.videoHeight), a.setControlsSize(), a.media.setVideoSize(e.target.videoWidth, e.target.videoHeight));
}
, !1)), e.addEventListener("play", function() {
    var e;
    for(e in mejs.players) {
    var t=mejs.players[e];
    t.id==a.id||!a.options.pauseOtherPlayers||t.paused||t.ended||t.pause(), t.hasFocus=!1;
}
a.hasFocus=!0;
}, !1), a.media.addEventListener("ended", function() {
    if(a.options.autoRewind)try {
    a.media.setCurrentTime(0);
}
catch(e) {
}
a.media.pause(), a.setProgressRail&&a.setProgressRail(), a.setCurrentRail&&a.setCurrentRail(), a.options.loop?a.media.play(): !a.options.alwaysShowControls&&a.controlsEnabled&&a.showControls();
}
, !1), a.media.addEventListener("loadedmetadata", function() {
    a.updateDuration&&a.updateDuration(), a.updateCurrent&&a.updateCurrent(), a.isFullScreen||(a.setPlayerSize(a.width, a.height), a.setControlsSize());
}
, !1), setTimeout(function() {
    a.setPlayerSize(a.width, a.height), a.setControlsSize();
}
, 50), a.globalBind("resize", function() {
    a.isFullScreen||mejs.MediaFeatures.hasTrueNativeFullScreen&&document.webkitIsFullScreen||a.setPlayerSize(a.width, a.height), a.setControlsSize();
}
), "youtube"==a.media.pluginType&&a.container.find(".mejs-overlay-play").hide();
}s&&"native"==e.pluginType&&(e.load(), e.play()), a.options.success&&("string"==typeof a.options.success?window[a.options.success](a.media, a.domNode, a): a.options.success(a.media, a.domNode, a));
}}, handleError:function(e) {
    var t=this;
    t.controls.hide(), t.options.error&&t.options.error(e);
}
, setPlayerSize: function(t, i) {
    var n=this;
    if("undefined"!=typeof t&&(n.width=t), "undefined"!=typeof i&&(n.height=i), n.height.toString().indexOf("%")>0||"100%"===n.$node.css("max-width")||1===parseInt(n.$node.css("max-width").replace(/px/, ""), 10)/n.$node.offsetParent().width()||n.$node[0].currentStyle&&"100%"===n.$node[0].currentStyle.maxWidth) {
    var a=n.isVideo?n.media.videoWidth&&n.media.videoWidth>0?n.media.videoWidth: n.options.defaultVideoWidth:n.options.defaultAudioWidth, o=n.isVideo?n.media.videoHeight&&n.media.videoHeight>0?n.media.videoHeight:n.options.defaultVideoHeight:n.options.defaultAudioHeight, r=n.container.parent().closest(":visible").width(), s=n.isVideo||!n.options.autosizeProgress?parseInt(r*o/a, 10):o;
    "body"===n.container.parent()[0].tagName.toLowerCase()&&(r=e(window).width(), s=e(window).height()), 0!=s&&0!=r&&(n.container.width(r).height(s), n.$media.add(n.container.find(".mejs-shim")).width("100%").height("100%"), n.isVideo&&n.media.setVideoSize&&n.media.setVideoSize(r, s), n.layers.children(".mejs-layer").width("100%").height("100%"));
}
else n.container.width(n.width).height(n.height), n.layers.children(".mejs-layer").width(n.width).height(n.height);
    var l=n.layers.find(".mejs-overlay-play"), c=l.find(".mejs-overlay-button");
    l.height(n.container.height()-n.controls.height()), c.css("margin-top", "-"+(c.height()/2-n.controls.height()/2).toString()+"px");
}
, setControlsSize: function() {
    var t=this, i=0, n=0, a=t.controls.find(".mejs-time-rail"), o=t.controls.find(".mejs-time-total"), r=(t.controls.find(".mejs-time-current"), t.controls.find(".mejs-time-loaded"), a.siblings());
    t.options&&!t.options.autosizeProgress&&(n=parseInt(a.css("width"))), 0!==n&&n||(r.each(function() {
    var t=e(this);
    "absolute"!=t.css("position")&&t.is(": visible")&&(i+=e(this).outerWidth(!0));
}
), n=t.controls.width()-i-(a.outerWidth(!0)-a.width())), a.width(n), o.width(n-(o.outerWidth(!0)-o.width())), t.setProgressRail&&t.setProgressRail(), t.setCurrentRail&&t.setCurrentRail();
}, buildposter:function(t, i, n, a) {
    var o=this, r=e('<div class="mejs-poster mejs-layer"></div>').appendTo(n), s=t.$media.attr("poster");
    ""!==t.options.poster&&(s=t.options.poster), ""!==s&&null!=s?o.setPoster(s): r.hide(), a.addEventListener("play", function() {
    r.hide();
}
, !1), t.options.showPosterWhenEnded&&t.options.autoRewind&&a.addEventListener("ended", function() {
    r.show();
}
, !1);
}, setPoster: function(t) {
    var i=this, n=i.container.find(".mejs-poster"), a=n.find("img");
    0==a.length&&(a=e('<img width="100%" height="100%" />').appendTo(n)), a.attr("src", t), n.css( {
    "background-image": "url("+t+")"}
);
}, buildoverlays:function(t, i, n, a) {
    var o=this;
    if(t.isVideo) {
    var r=e('<div class="mejs-overlay mejs-layer"><div class="mejs-overlay-loading"><span></span></div></div>').hide().appendTo(n), s=e('<div class="mejs-overlay mejs-layer"><div class="mejs-overlay-error"></div></div>').hide().appendTo(n), l=e('<div class="mejs-overlay mejs-layer mejs-overlay-play"><div class="mejs-overlay-button"></div></div>').appendTo(n).click(function() {
    o.options.clickToPlayPause&&(a.paused?a.play(): a.pause());
}
);
    a.addEventListener("play", function() {
    l.hide(), r.hide(), i.find(".mejs-time-buffering").hide(), s.hide();
}
, !1), a.addEventListener("playing", function() {
    l.hide(), r.hide(), i.find(".mejs-time-buffering").hide(), s.hide();
}
, !1), a.addEventListener("seeking", function() {
    r.show(), i.find(".mejs-time-buffering").show();
}
, !1), a.addEventListener("seeked", function() {
    r.hide(), i.find(".mejs-time-buffering").hide();
}
, !1), a.addEventListener("pause", function() {
    mejs.MediaFeatures.isiPhone||l.show();
}
, !1), a.addEventListener("waiting", function() {
    r.show(), i.find(".mejs-time-buffering").show();
}
, !1), a.addEventListener("loadeddata", function() {
    r.show(), i.find(".mejs-time-buffering").show();
}
, !1), a.addEventListener("canplay", function() {
    r.hide(), i.find(".mejs-time-buffering").hide();
}
, !1), a.addEventListener("error", function() {
    r.hide(), i.find(".mejs-time-buffering").hide(), s.show(), s.find("mejs-overlay-error").html("Error loading this resource");
}
, !1);
}}, buildkeyboard: function(t, i, n, a) {
    var o=this;
    o.globalBind("keydown", function(e) {
    if(t.hasFocus&&t.options.enableKeyboard)for(var i=0, n=t.options.keyActions.length;
    n>i;
    i++)for(var o=t.options.keyActions[i], r=0, s=o.keys.length;
    s>r;
    r++)if(e.keyCode==o.keys[r])return e.preventDefault(), o.action(t, a, e.keyCode), !1;
    return!0;
}
), o.globalBind("click", function(i) {
    0==e(i.target).closest(".mejs-container").length&&(t.hasFocus=!1);
}
);
}, findTracks: function() {
    var t=this, i=t.$media.find("track");
    t.tracks=[], i.each(function(i, n) {
    n=e(n), t.tracks.push( {
    srclang: n.attr("srclang")?n.attr("srclang").toLowerCase():"", src:n.attr("src"), kind:n.attr("kind"), label:n.attr("label")||"", entries:[], isLoaded:!1;
}
);
});
}, changeSkin:function(e) {
    this.container[0].className="mejs-container "+e, this.setPlayerSize(this.width, this.height), this.setControlsSize();
}
, play: function() {
    this.media.play();
}
, pause: function() {
    try {
    this.media.pause();
}
catch(e) {
}
}
, load: function() {
    this.media.load();
}
, setMuted: function(e) {
    this.media.setMuted(e);
}
, setCurrentTime: function(e) {
    this.media.setCurrentTime(e);
}
, getCurrentTime: function() {
    return this.media.currentTime;
}
, setVolume: function(e) {
    this.media.setVolume(e);
}
, getVolume: function() {
    return this.media.volume;
}
, setSrc: function(e) {
    this.media.setSrc(e);
}
, remove: function() {
    var e, t, i=this;
    for(e in i.options.features)if(t=i.options.features[e], i["clean"+t])try {
    i["clean"+t](i);
}
catch(n) {
}
i.isDynamic?i.$node.insertBefore(i.container): (i.$media.prop("controls", !0), i.$node.clone().show().insertBefore(i.container), i.$node.remove()), "native"!==i.media.pluginType&&i.media.remove(), delete mejs.players[i.id], i.container.remove(), i.globalUnbind(), delete i.node.player;
}
}, function() {
    function t(t, n) {
    var a= {
    d: [], w:[];
}
;
    return e.each((t||"").split(" "), function(e, t) {
    var o=t+"."+n;
    0===o.indexOf(".")?(a.d.push(o), a.w.push(o)): a[i.test(t)?"w":"d"].push(o);
}
), a.d=a.d.join(" "), a.w=a.w.join(" "), a;
}var i=/^((after|before)print|(before)?unload|hashchange|message|o(ff|n)line|page(hide|show)|popstate|resize|storage)\b/;
    mejs.MediaElementPlayer.prototype.globalBind=function(i, n, a) {
    var o=this;
    i=t(i, o.id), i.d&&e(document).bind(i.d, n, a), i.w&&e(window).bind(i.w, n, a);
}
, mejs.MediaElementPlayer.prototype.globalUnbind=function(i, n) {
    var a=this;
    i=t(i, a.id), i.d&&e(document).unbind(i.d, n), i.w&&e(window).unbind(i.w, n);
}
}(), "undefined"!=typeof jQuery&&(jQuery.fn.mediaelementplayer=function(e) {
    return e===!1?this.each(function() {
    var e=jQuery(this).data("mediaelementplayer");
    e&&e.remove(), jQuery(this).removeData("mediaelementplayer");
}
): this.each(function() {
    jQuery(this).data("mediaelementplayer", new mejs.MediaElementPlayer(this, e));
}
), this;
}), e(document).ready(function() {
    e(".mejs-player").mediaelementplayer();
}
), window.MediaElementPlayer=mejs.MediaElementPlayer;
}(mejs.$), function(e) {
    e.extend(mejs.MepDefaults,  {
    playpauseText: mejs.i18n.t("Play/Pause");
}
), e.extend(MediaElementPlayer.prototype,  {
    buildplaypause: function(t, i, n, a) {
    var o=this, r=e('<div class="mejs-button mejs-playpause-button mejs-play" ><button type="button" aria-controls="'+o.id+'" title="'+o.options.playpauseText+'" aria-label="'+o.options.playpauseText+'"></button>'+"</div>").appendTo(i).click(function(e) {
    return e.preventDefault(), a.paused?a.play(): a.pause(), !1;
}
);
    a.addEventListener("play", function() {
    r.removeClass("mejs-play").addClass("mejs-pause");
}
, !1), a.addEventListener("playing", function() {
    r.removeClass("mejs-play").addClass("mejs-pause");
}
, !1), a.addEventListener("pause", function() {
    r.removeClass("mejs-pause").addClass("mejs-play");
}
, !1), a.addEventListener("paused", function() {
    r.removeClass("mejs-pause").addClass("mejs-play");
}
, !1);
}});
}(mejs.$), function(e) {
    e.extend(mejs.MepDefaults,  {
    stopText: "Stop"}
), e.extend(MediaElementPlayer.prototype,  {
    buildstop: function(t, i, n, a) {
    var o=this;
    e('<div class="mejs-button mejs-stop-button mejs-stop"><button type="button" aria-controls="'+o.id+'" title="'+o.options.stopText+'" aria-label="'+o.options.stopText+'"></button>'+"</div>").appendTo(i).click(function() {
    a.paused||a.pause(), a.currentTime>0&&(a.setCurrentTime(0), a.pause(), i.find(".mejs-time-current").width("0px"), i.find(".mejs-time-handle").css("left", "0px"), i.find(".mejs-time-float-current").html(mejs.Utility.secondsToTimeCode(0)), i.find(".mejs-currenttime").html(mejs.Utility.secondsToTimeCode(0)), n.find(".mejs-poster").show());
}
);
}});
}(mejs.$), function(e) {
    e.extend(MediaElementPlayer.prototype,  {
    buildprogress: function(t, i, n, a) {
    e('<div class="mejs-time-rail"><span class="mejs-time-total"><span class="mejs-time-buffering"></span><span class="mejs-time-loaded"></span><span class="mejs-time-current"></span><span class="mejs-time-handle"></span><span class="mejs-time-float"><span class="mejs-time-float-current">00: 00</span><span class="mejs-time-float-corner"></span></span></span></div>').appendTo(i), i.find(".mejs-time-buffering").hide();
    var o=this, r=i.find(".mejs-time-total"), s=i.find(".mejs-time-loaded"), l=i.find(".mejs-time-current"), c=i.find(".mejs-time-handle"), u=i.find(".mejs-time-float"), d=i.find(".mejs-time-float-current"), h=function(e) {
    var t=e.pageX, i=r.offset(), n=r.outerWidth(!0), o=0, s=0, l=0;
    a.duration&&(t<i.left?t=i.left: t>n+i.left&&(t=n+i.left), l=t-i.left, o=l/n, s=.02>=o?0:o*a.duration, p&&s!==a.currentTime&&a.setCurrentTime(s), mejs.MediaFeatures.hasTouch||(u.css("left", l), d.html(mejs.Utility.secondsToTimeCode(s)), u.show()));
}
, p=!1, f=!1;
    r.bind("mousedown", function(e) {
    return 1===e.which?(p=!0, h(e), o.globalBind("mousemove.dur", function(e) {
    h(e);
}
), o.globalBind("mouseup.dur", function() {
    p=!1, u.hide(), o.globalUnbind(".dur");
}
), !1): void 0;
}).bind("mouseenter", function() {
    f=!0, o.globalBind("mousemove.dur", function(e) {
    h(e);
}
), mejs.MediaFeatures.hasTouch||u.show();
}).bind("mouseleave", function() {
    f=!1, p||(o.globalUnbind(".dur"), u.hide());
}
), a.addEventListener("progress", function(e) {
    t.setProgressRail(e), t.setCurrentRail(e);
}
, !1), a.addEventListener("timeupdate", function(e) {
    t.setProgressRail(e), t.setCurrentRail(e);
}
, !1), o.loaded=s, o.total=r, o.current=l, o.handle=c;
}, setProgressRail: function(e) {
    var t=this, i=void 0!=e?e.target: t.media, n=null;
    i&&i.buffered&&i.buffered.length>0&&i.buffered.end&&i.duration?n=i.buffered.end(0)/i.duration: i&&void 0!=i.bytesTotal&&i.bytesTotal>0&&void 0!=i.bufferedBytes?n=i.bufferedBytes/i.bytesTotal:e&&e.lengthComputable&&0!=e.total&&(n=e.loaded/e.total), null!==n&&(n=Math.min(1, Math.max(0, n)), t.loaded&&t.total&&t.loaded.width(t.total.width()*n));
}
, setCurrentRail:function() {
    var e=this;
    if(void 0!=e.media.currentTime&&e.media.duration&&e.total&&e.handle) {
    var t=Math.round(e.total.width()*e.media.currentTime/e.media.duration), i=t-Math.round(e.handle.outerWidth(!0)/2);
    e.current.width(t), e.handle.css("left", i);
}
}});
}(mejs.$), function(e) {
    e.extend(mejs.MepDefaults,  {
    duration: -1, timeAndDurationSeparator:"<span> | </span>"}
), e.extend(MediaElementPlayer.prototype,  {
    buildcurrent: function(t, i, n, a) {
    var o=this;
    e('<div class="mejs-time"><span class="mejs-currenttime">'+(t.options.alwaysShowHours?"00: ":"")+(t.options.showTimecodeFrameCount?"00:00:00":"00:00")+"</span>"+"</div>").appendTo(i), o.currenttime=o.controls.find(".mejs-currenttime"), a.addEventListener("timeupdate", function() {
    t.updateCurrent();
}
, !1);
}, buildduration: function(t, i, n, a) {
    var o=this;
    i.children().last().find(".mejs-currenttime").length>0?e(o.options.timeAndDurationSeparator+'<span class="mejs-duration">'+(o.options.duration>0?mejs.Utility.secondsToTimeCode(o.options.duration, o.options.alwaysShowHours||o.media.duration>3600, o.options.showTimecodeFrameCount, o.options.framesPerSecond||25): (t.options.alwaysShowHours?"00:":"")+(t.options.showTimecodeFrameCount?"00:00:00":"00:00"))+"</span>").appendTo(i.find(".mejs-time")):(i.find(".mejs-currenttime").parent().addClass("mejs-currenttime-container"), e('<div class="mejs-time mejs-duration-container"><span class="mejs-duration">'+(o.options.duration>0?mejs.Utility.secondsToTimeCode(o.options.duration, o.options.alwaysShowHours||o.media.duration>3600, o.options.showTimecodeFrameCount, o.options.framesPerSecond||25):(t.options.alwaysShowHours?"00:":"")+(t.options.showTimecodeFrameCount?"00:00:00":"00:00"))+"</span>"+"</div>").appendTo(i)), o.durationD=o.controls.find(".mejs-duration"), a.addEventListener("timeupdate", function() {
    t.updateDuration();
}
, !1);
}, updateCurrent: function() {
    var e=this;
    e.currenttime&&e.currenttime.html(mejs.Utility.secondsToTimeCode(e.media.currentTime, e.options.alwaysShowHours||e.media.duration>3600, e.options.showTimecodeFrameCount, e.options.framesPerSecond||25));
}
, updateDuration: function() {
    var e=this;
    e.container.toggleClass("mejs-long-video", e.media.duration>3600), e.durationD&&(e.options.duration>0||e.media.duration)&&e.durationD.html(mejs.Utility.secondsToTimeCode(e.options.duration>0?e.options.duration: e.media.duration, e.options.alwaysShowHours, e.options.showTimecodeFrameCount, e.options.framesPerSecond||25));
}
});
}(mejs.$), function(e) {
    e.extend(mejs.MepDefaults,  {
    muteText: mejs.i18n.t("Mute Toggle"), hideVolumeOnTouchDevices:!0, audioVolume:"horizontal", videoVolume:"vertical"}
), e.extend(MediaElementPlayer.prototype,  {
    buildvolume: function(t, i, n, a) {
    if(!mejs.MediaFeatures.hasTouch||!this.options.hideVolumeOnTouchDevices) {
    var o=this, r=o.isVideo?o.options.videoVolume: o.options.audioVolume, s="horizontal"==r?e('<div class="mejs-button mejs-volume-button mejs-mute"><button type="button" aria-controls="'+o.id+'" title="'+o.options.muteText+'" aria-label="'+o.options.muteText+'"></button>'+"</div>"+'<div class="mejs-horizontal-volume-slider">'+'<div class="mejs-horizontal-volume-total"></div>'+'<div class="mejs-horizontal-volume-current"></div>'+'<div class="mejs-horizontal-volume-handle"></div>'+"</div>").appendTo(i):e('<div class="mejs-button mejs-volume-button mejs-mute"><button type="button" aria-controls="'+o.id+'" title="'+o.options.muteText+'" aria-label="'+o.options.muteText+'"></button>'+'<div class="mejs-volume-slider">'+'<div class="mejs-volume-total"></div>'+'<div class="mejs-volume-current"></div>'+'<div class="mejs-volume-handle"></div>'+"</div>"+"</div>").appendTo(i), l=o.container.find(".mejs-volume-slider,  .mejs-horizontal-volume-slider"), c=o.container.find(".mejs-volume-total,  .mejs-horizontal-volume-total"), u=o.container.find(".mejs-volume-current,  .mejs-horizontal-volume-current"), d=o.container.find(".mejs-volume-handle,  .mejs-horizontal-volume-handle"), h=function(e, t) {
    if(!l.is(": visible")&&"undefined"==typeof t)return l.show(), h(e, !0), l.hide(), void 0;
    if(e=Math.max(0, e), e=Math.min(e, 1), 0==e?s.removeClass("mejs-mute").addClass("mejs-unmute"): s.removeClass("mejs-unmute").addClass("mejs-mute"), "vertical"==r) {
    var i=c.height(), n=c.position(), a=i-i*e;
    d.css("top", Math.round(n.top+a-d.height()/2)), u.height(i-a), u.css("top", n.top+a);
}
else {
    var o=c.width(), n=c.position(), p=o*e;
    d.css("left", Math.round(n.left+p-d.width()/2)), u.width(Math.round(p));
}
}, p=function(e) {
    var t=null, i=c.offset();
    if("vertical"==r) {
    var n=c.height(), o=(parseInt(c.css("top").replace(/px/, ""), 10), e.pageY-i.top);
    if(t=(n-o)/n, 0==i.top||0==i.left)return;
}
else {
    var s=c.width(), l=e.pageX-i.left;
    t=l/s;
}
t=Math.max(0, t), t=Math.min(t, 1), h(t), 0==t?a.setMuted(!0): a.setMuted(!1), a.setVolume(t);
}, f=!1, m=!1;
    s.hover(function() {
    l.show(), m=!0;
}
, function() {
    m=!1, f||"vertical"!=r||l.hide();
}
), l.bind("mouseover", function() {
    m=!0;
}
).bind("mousedown", function(e) {
    return p(e), o.globalBind("mousemove.vol", function(e) {
    p(e);
}
), o.globalBind("mouseup.vol", function() {
    f=!1, o.globalUnbind(".vol"), m||"vertical"!=r||l.hide();
}
), f=!0, !1;
}), s.find("button").click(function() {
    a.setMuted(!a.muted);
}
), a.addEventListener("volumechange", function() {
    f||(a.muted?(h(0), s.removeClass("mejs-mute").addClass("mejs-unmute")): (h(a.volume), s.removeClass("mejs-unmute").addClass("mejs-mute")));
}
, !1), o.container.is(":visible")&&(h(t.options.startVolume), 0===t.options.startVolume&&a.setMuted(!0), "native"===a.pluginType&&a.setVolume(t.options.startVolume));
}}});
}(mejs.$), function(e) {
    e.extend(mejs.MepDefaults,  {
    usePluginFullScreen: !0, newWindowCallback:function() {
    return""}
, fullscreenText: mejs.i18n.t("Fullscreen");
}), e.extend(MediaElementPlayer.prototype,  {
    isFullScreen: !1, isNativeFullScreen:!1, isInIframe:!1, buildfullscreen:function(t, i, n, a) {
    if(t.isVideo) {
    if(t.isInIframe=window.location!=window.parent.location, mejs.MediaFeatures.hasTrueNativeFullScreen) {
    var o=function() {
    t.isFullScreen&&(mejs.MediaFeatures.isFullScreen()?(t.isNativeFullScreen=!0, t.setControlsSize()): (t.isNativeFullScreen=!1, t.exitFullScreen()));
}
;
    mejs.MediaFeatures.hasMozNativeFullScreen?t.globalBind(mejs.MediaFeatures.fullScreenEventName, o): t.container.bind(mejs.MediaFeatures.fullScreenEventName, o);
}
var r=this, s=(t.container, e('<div class="mejs-button mejs-fullscreen-button"><button type="button" aria-controls="'+r.id+'" title="'+r.options.fullscreenText+'" aria-label="'+r.options.fullscreenText+'"></button>'+"</div>").appendTo(i));
    if("native"===r.media.pluginType||!r.options.usePluginFullScreen&&!mejs.MediaFeatures.isFirefox)s.click(function() {
    var e=mejs.MediaFeatures.hasTrueNativeFullScreen&&mejs.MediaFeatures.isFullScreen()||t.isFullScreen;
    e?t.exitFullScreen(): t.enterFullScreen();
}
);
    else {
    var l=null, c=function() {
    var e, t=document.createElement("x"), i=document.documentElement, n=window.getComputedStyle;
    return"pointerEvents"in t.style?(t.style.pointerEvents="auto", t.style.pointerEvents="x", i.appendChild(t), e=n&&"auto"===n(t, "").pointerEvents, i.removeChild(t), !!e): !1;
}
();
    if(c&&!mejs.MediaFeatures.isOpera) {
    var u, d, h=!1, p=function() {
    if(h) {
    for(var e in f)f[e].hide();
    s.css("pointer-events", ""), r.controls.css("pointer-events", ""), r.media.removeEventListener("click", r.clickToPlayPauseCallback), h=!1;
}
}, f= {
}
, m=["top", "left", "right", "bottom"], g=function() {
    var e=s.offset().left-r.container.offset().left, t=s.offset().top-r.container.offset().top, i=s.outerWidth(!0), n=s.outerHeight(!0), a=r.container.width(), o=r.container.height();
    for(u in f)f[u].css( {
    position: "absolute", top:0, left:0;
}
);
    f.top.width(a).height(t), f.left.width(e).height(n).css( {
    top: t;
}
), f.right.width(a-e-i).height(n).css( {
    top: t, left:e+i;
}
), f.bottom.width(a).height(o-n-t).css( {
    top: t+n;
}
);
};
    for(r.globalBind("resize", function() {
    g();
}
), u=0, d=m.length;
    d>u;
    u++)f[m[u]]=e('<div class="mejs-fullscreen-hover" />').appendTo(r.container).mouseover(p).hide();
    s.on("mouseover", function() {
    if(!r.isFullScreen) {
    var e=s.offset(), i=t.container.offset();
    a.positionFullscreenButton(e.left-i.left, e.top-i.top, !1), s.css("pointer-events", "none"), r.controls.css("pointer-events", "none"), r.media.addEventListener("click", r.clickToPlayPauseCallback);
    for(u in f)f[u].show();
    g(), h=!0;
}
}), a.addEventListener("fullscreenchange", function() {
    r.isFullScreen=!r.isFullScreen, r.isFullScreen?r.media.removeEventListener("click", r.clickToPlayPauseCallback): r.media.addEventListener("click", r.clickToPlayPauseCallback), p();
}
), r.globalBind("mousemove", function(e) {
    if(h) {
    var t=s.offset();
    (e.pageY<t.top||e.pageY>t.top+s.outerHeight(!0)||e.pageX<t.left||e.pageX>t.left+s.outerWidth(!0))&&(s.css("pointer-events", ""), r.controls.css("pointer-events", ""), h=!1);
}
});
}else s.on("mouseover", function() {
    null!==l&&(clearTimeout(l), delete l);
    var e=s.offset(), i=t.container.offset();
    a.positionFullscreenButton(e.left-i.left, e.top-i.top, !0);
}
).on("mouseout", function() {
    null!==l&&(clearTimeout(l), delete l), l=setTimeout(function() {
    a.hideFullscreenButton();
}
, 1500);
});
}t.fullscreenBtn=s, r.globalBind("keydown", function(e) {
    (mejs.MediaFeatures.hasTrueNativeFullScreen&&mejs.MediaFeatures.isFullScreen()||r.isFullScreen)&&27==e.keyCode&&t.exitFullScreen();
}
);
}}, cleanfullscreen: function(e) {
    e.exitFullScreen();
}
, containerSizeTimeout: null, enterFullScreen:function() {
    var t=this;
    if("native"===t.media.pluginType||!mejs.MediaFeatures.isFirefox&&!t.options.usePluginFullScreen) {
    if(e(document.documentElement).addClass("mejs-fullscreen"), normalHeight=t.container.height(), normalWidth=t.container.width(), "native"===t.media.pluginType)if(mejs.MediaFeatures.hasTrueNativeFullScreen)mejs.MediaFeatures.requestFullScreen(t.container[0]), t.isInIframe&&setTimeout(function n() {
    t.isNativeFullScreen&&(e(window).width()!==screen.width?t.exitFullScreen(): setTimeout(n, 500));
}
, 500);
    else if(mejs.MediaFeatures.hasSemiNativeFullScreen)return t.media.webkitEnterFullscreen(), void 0;
    if(t.isInIframe) {
    var i=t.options.newWindowCallback(this);
    if(""!==i) {
    if(!mejs.MediaFeatures.hasTrueNativeFullScreen)return t.pause(), window.open(i, t.id, "top=0, left=0, width="+screen.availWidth+", height="+screen.availHeight+", resizable=yes, scrollbars=no, status=no, toolbar=no"), void 0;
    setTimeout(function() {
    t.isNativeFullScreen||(t.pause(), window.open(i, t.id, "top=0, left=0, width="+screen.availWidth+", height="+screen.availHeight+", resizable=yes, scrollbars=no, status=no, toolbar=no"));
}
, 250);
}}t.container.addClass("mejs-container-fullscreen").width("100%").height("100%"), t.containerSizeTimeout=setTimeout(function() {
    t.container.css( {
    width: "100%", height:"100%"}
), t.setControlsSize();
}, 500), "native"===t.media.pluginType?t.$media.width("100%").height("100%"):(t.container.find(".mejs-shim").width("100%").height("100%"), t.media.setVideoSize(e(window).width(), e(window).height())), t.layers.children("div").width("100%").height("100%"), t.fullscreenBtn&&t.fullscreenBtn.removeClass("mejs-fullscreen").addClass("mejs-unfullscreen"), t.setControlsSize(), t.isFullScreen=!0;
}}, exitFullScreen:function() {
    var t=this;
    return clearTimeout(t.containerSizeTimeout), "native"!==t.media.pluginType&&mejs.MediaFeatures.isFirefox?(t.media.setFullscreen(!1), void 0): (mejs.MediaFeatures.hasTrueNativeFullScreen&&(mejs.MediaFeatures.isFullScreen()||t.isFullScreen)&&mejs.MediaFeatures.cancelFullScreen(), e(document.documentElement).removeClass("mejs-fullscreen"), t.container.removeClass("mejs-container-fullscreen").width(normalWidth).height(normalHeight), "native"===t.media.pluginType?t.$media.width(normalWidth).height(normalHeight):(t.container.find(".mejs-shim").width(normalWidth).height(normalHeight), t.media.setVideoSize(normalWidth, normalHeight)), t.layers.children("div").width(normalWidth).height(normalHeight), t.fullscreenBtn.removeClass("mejs-unfullscreen").addClass("mejs-fullscreen"), t.setControlsSize(), t.isFullScreen=!1, void 0);
}
});
}(mejs.$), function(e) {
    e.extend(mejs.MepDefaults,  {
    startLanguage: "", tracksText:mejs.i18n.t("Captions/Subtitles"), hideCaptionsButtonWhenEmpty:!0, toggleCaptionsButtonWhenOnlyOne:!1, slidesSelector:""}
), e.extend(MediaElementPlayer.prototype,  {
    hasChapters: !1, buildtracks:function(t, i, n, a) {
    if(0!=t.tracks.length) {
    var o, r=this;
    if(r.domNode.textTracks)for(var o=r.domNode.textTracks.length-1;
    o>=0;
    o--)r.domNode.textTracks[o].mode="hidden";
    t.chapters=e('<div class="mejs-chapters mejs-layer"></div>').prependTo(n).hide(), t.captions=e('<div class="mejs-captions-layer mejs-layer"><div class="mejs-captions-position mejs-captions-position-hover"><span class="mejs-captions-text"></span></div></div>').prependTo(n).hide(), t.captionsText=t.captions.find(".mejs-captions-text"), t.captionsButton=e('<div class="mejs-button mejs-captions-button"><button type="button" aria-controls="'+r.id+'" title="'+r.options.tracksText+'" aria-label="'+r.options.tracksText+'"></button>'+'<div class="mejs-captions-selector">'+"<ul>"+"<li>"+'<input type="radio" name="'+t.id+'_captions" id="'+t.id+'_captions_none" value="none" checked="checked" />'+'<label for="'+t.id+'_captions_none">'+mejs.i18n.t("None")+"</label>"+"</li>"+"</ul>"+"</div>"+"</div>").appendTo(i);
    var s=0;
    for(o=0;
    o<t.tracks.length;
    o++)"subtitles"==t.tracks[o].kind&&s++;
    for(r.options.toggleCaptionsButtonWhenOnlyOne&&1==s?t.captionsButton.on("click", function() {
    if(null==t.selectedTrack)var e=t.tracks[0].srclang;
    else var e="none";
    t.setTrack(e);
}
): t.captionsButton.hover(function() {
    e(this).find(".mejs-captions-selector").css("visibility", "visible");
}
, function() {
    e(this).find(".mejs-captions-selector").css("visibility", "hidden");
}
).on("click", "input[type=radio]", function() {
    lang=this.value, t.setTrack(lang);
}
), t.options.alwaysShowControls?t.container.find(".mejs-captions-position").addClass("mejs-captions-position-hover"): t.container.bind("controlsshown", function() {
    t.container.find(".mejs-captions-position").addClass("mejs-captions-position-hover");
}
).bind("controlshidden", function() {
    a.paused||t.container.find(".mejs-captions-position").removeClass("mejs-captions-position-hover");
}
), t.trackToLoad=-1, t.selectedTrack=null, t.isLoadingTrack=!1, o=0;
    o<t.tracks.length;
    o++)"subtitles"==t.tracks[o].kind&&t.addTrackButton(t.tracks[o].srclang, t.tracks[o].label);
    t.loadNextTrack(), a.addEventListener("timeupdate", function() {
    t.displayCaptions();
}
, !1), ""!=t.options.slidesSelector&&(t.slidesContainer=e(t.options.slidesSelector), a.addEventListener("timeupdate", function() {
    t.displaySlides();
}
, !1)), a.addEventListener("loadedmetadata", function() {
    t.displayChapters();
}
, !1), t.container.hover(function() {
    t.hasChapters&&(t.chapters.css("visibility", "visible"), t.chapters.fadeIn(200).height(t.chapters.find(".mejs-chapter").outerHeight()));
}
, function() {
    t.hasChapters&&!a.paused&&t.chapters.fadeOut(200, function() {
    e(this).css("visibility", "hidden"), e(this).css("display", "block");
}
);
}), null!==t.node.getAttribute("autoplay")&&t.chapters.css("visibility", "hidden");
}}, setTrack: function(e) {
    var t, i=this;
    if("none"==e)i.selectedTrack=null, i.captionsButton.removeClass("mejs-captions-enabled");
    else for(t=0;
    t<i.tracks.length;
    t++)if(i.tracks[t].srclang==e) {
    null==i.selectedTrack&&i.captionsButton.addClass("mejs-captions-enabled"), i.selectedTrack=i.tracks[t], i.captions.attr("lang", i.selectedTrack.srclang), i.displayCaptions();
    break;
}
}, loadNextTrack: function() {
    var e=this;
    e.trackToLoad++, e.trackToLoad<e.tracks.length?(e.isLoadingTrack=!0, e.loadTrack(e.trackToLoad)): (e.isLoadingTrack=!1, e.checkForTracks());
}
, loadTrack:function(t) {
    var i=this, n=i.tracks[t], a=function() {
    n.isLoaded=!0, i.enableTrackButton(n.srclang, n.label), i.loadNextTrack();
}
;
    e.ajax( {
    url: n.src, dataType:"text", success:function(e) {
    n.entries="string"==typeof e&&/<tt\s+xml/gi.exec(e)?mejs.TrackFormatParser.dfxp.parse(e): mejs.TrackFormatParser.webvvt.parse(e), a(), "chapters"==n.kind&&i.media.addEventListener("play", function() {
    i.media.duration>0&&i.displayChapters(n);
}
, !1), "slides"==n.kind&&i.setupSlides(n);
}, error: function() {
    i.loadNextTrack();
}
});
}, enableTrackButton: function(t, i) {
    var n=this;
    ""===i&&(i=mejs.language.codes[t]||t), n.captionsButton.find("input[value="+t+"]").prop("disabled", !1).siblings("label").html(i), n.options.startLanguage==t&&e("#"+n.id+"_captions_"+t).click(), n.adjustLanguageBox();
}
, addTrackButton: function(t, i) {
    var n=this;
    ""===i&&(i=mejs.language.codes[t]||t), n.captionsButton.find("ul").append(e('<li><input type="radio" name="'+n.id+'_captions" id="'+n.id+"_captions_"+t+'" value="'+t+'" disabled="disabled" />'+'<label for="'+n.id+"_captions_"+t+'">'+i+" (loading)"+"</label>"+"</li>")), n.adjustLanguageBox(), n.container.find(".mejs-captions-translations option[value="+t+"]").remove();
}
, adjustLanguageBox: function() {
    var e=this;
    e.captionsButton.find(".mejs-captions-selector").height(e.captionsButton.find(".mejs-captions-selector ul").outerHeight(!0)+e.captionsButton.find(".mejs-captions-translations").outerHeight(!0));
}
, checkForTracks: function() {
    var e=this, t=!1;
    if(e.options.hideCaptionsButtonWhenEmpty) {
    for(i=0;
    i<e.tracks.length;
    i++)if("subtitles"==e.tracks[i].kind) {
    t=!0;
    break;
}
t||(e.captionsButton.hide(), e.setControlsSize());
}}, displayCaptions: function() {
    if("undefined"!=typeof this.tracks) {
    var e, t=this, i=t.selectedTrack;
    if(null!=i&&i.isLoaded) {
    for(e=0;
    e<i.entries.times.length;
    e++)if(t.media.currentTime>=i.entries.times[e].start&&t.media.currentTime<=i.entries.times[e].stop)return t.captionsText.html(i.entries.text[e]), t.captions.show().height(0), void 0;
    t.captions.hide();
}
else t.captions.hide();
}}, setupSlides: function(e) {
    var t=this;
    t.slides=e, t.slides.entries.imgs=[t.slides.entries.text.length], t.showSlide(0);
}
, showSlide: function(t) {
    if("undefined"!=typeof this.tracks&&"undefined"!=typeof this.slidesContainer) {
    var i=this, n=i.slides.entries.text[t], a=i.slides.entries.imgs[t];
    "undefined"==typeof a||"undefined"==typeof a.fadeIn?i.slides.entries.imgs[t]=a=e('<img src="'+n+'">').on("load", function() {
    a.appendTo(i.slidesContainer).hide().fadeIn().siblings(": visible").fadeOut();
}
):a.is(":visible")||a.is(":animated")||a.fadeIn().siblings(":visible").fadeOut();
}}, displaySlides:function() {
    if("undefined"!=typeof this.slides) {
    var e, t=this, i=t.slides;
    for(e=0;
    e<i.entries.times.length;
    e++)if(t.media.currentTime>=i.entries.times[e].start&&t.media.currentTime<=i.entries.times[e].stop)return t.showSlide(e), void 0;
}
}, displayChapters: function() {
    var e, t=this;
    for(e=0;
    e<t.tracks.length;
    e++)if("chapters"==t.tracks[e].kind&&t.tracks[e].isLoaded) {
    t.drawChapters(t.tracks[e]), t.hasChapters=!0;
    break;
}
}, drawChapters: function(t) {
    var i, n, a=this, o=0, r=0;
    for(a.chapters.empty(), i=0;
    i<t.entries.times.length;
    i++)n=t.entries.times[i].stop-t.entries.times[i].start, o=Math.floor(100*(n/a.media.duration)), (o+r>100||i==t.entries.times.length-1&&100>o+r)&&(o=100-r), a.chapters.append(e('<div class="mejs-chapter" rel="'+t.entries.times[i].start+'" style="left:  '+r.toString()+"%;
    width:  "+o.toString()+'%;
    ">'+'<div class="mejs-chapter-block'+(i==t.entries.times.length-1?" mejs-chapter-block-last": "")+'">'+'<span class="ch-title">'+t.entries.text[i]+"</span>"+'<span class="ch-time">'+mejs.Utility.secondsToTimeCode(t.entries.times[i].start)+"&ndash;
    "+mejs.Utility.secondsToTimeCode(t.entries.times[i].stop)+"</span>"+"</div>"+"</div>")), r+=o;
    a.chapters.find("div.mejs-chapter").click(function() {
    a.media.setCurrentTime(parseFloat(e(this).attr("rel"))), a.media.paused&&a.media.play();
}
), a.chapters.show();
}}), mejs.language= {
    codes:  {
    af: "Afrikaans", sq:"Albanian", ar:"Arabic", be:"Belarusian", bg:"Bulgarian", ca:"Catalan", zh:"Chinese", "zh-cn":"Chinese Simplified", "zh-tw":"Chinese Traditional", hr:"Croatian", cs:"Czech", da:"Danish", nl:"Dutch", en:"English", et:"Estonian", tl:"Filipino", fi:"Finnish", fr:"French", gl:"Galician", de:"German", el:"Greek", ht:"Haitian Creole", iw:"Hebrew", hi:"Hindi", hu:"Hungarian", is:"Icelandic", id:"Indonesian", ga:"Irish", it:"Italian", ja:"Japanese", ko:"Korean", lv:"Latvian", lt:"Lithuanian", mk:"Macedonian", ms:"Malay", mt:"Maltese", no:"Norwegian", fa:"Persian", pl:"Polish", pt:"Portuguese", ro:"Romanian", ru:"Russian", sr:"Serbian", sk:"Slovak", sl:"Slovenian", es:"Spanish", sw:"Swahili", sv:"Swedish", tl:"Tagalog", th:"Thai", tr:"Turkish", uk:"Ukrainian", vi:"Vietnamese", cy:"Welsh", yi:"Yiddish"}
}, mejs.TrackFormatParser= {
    webvvt:  {
    pattern_identifier: /^([a-zA-z]+-)?[0-9]+$/, pattern_timecode:/^([0-9] {
    2;
}
: [0-9] {
    2;
}
: [0-9] {
    2;
}
([, .][0-9] {
    1, 3;
}
)?) --\> ([0-9] {
    2;
}
: [0-9] {
    2;
}
: [0-9] {
    2;
}
([, .][0-9] {
    3;
}
)?)(.*)$/, parse: function(t) {
    for(var i, n, a=0, o=mejs.TrackFormatParser.split2(t, /\r?\n/), r= {
    text: [], times:[];
}
;
    a<o.length;
    a++)if(this.pattern_identifier.exec(o[a])&&(a++, i=this.pattern_timecode.exec(o[a]), i&&a<o.length)) {
    for(a++, n=o[a], a++;
    ""!==o[a]&&a<o.length;
    )n=n+"\n"+o[a], a++;
    
n=e.trim(n).replace(/(\b(https?|ftp|file): \/\/[-A-Z0-9+&@#\/%?=~_|!:, .;
    ]*[-A-Z0-9+&@#\/%=~_|])/gi, "<a href='$1' target='_blank'>$1</a>"), r.text.push(n), r.times.push( {
    start: 0==mejs.Utility.convertSMPTEtoSeconds(i[1])?.2:mejs.Utility.convertSMPTEtoSeconds(i[1]), stop:mejs.Utility.convertSMPTEtoSeconds(i[3]), settings:i[5];
}
);
}return r;
}}, dfxp: {
    parse: function(t) {
    t=e(t).filter("tt");
    var i, n, a=0, o=t.children("div").eq(0), r=o.find("p"), s=t.find("#"+o.attr("style")), l= {
    text: [], times:[];
}
;
    if(s.length) {
    var c=s.removeAttr("id").get(0).attributes;
    if(c.length)for(i= {
}
, a=0;
    a<c.length;
    a++)i[c[a].name.split(": ")[1]]=c[a].value;
}
for(a=0;
    a<r.length;
    a++) {
    var u, d= {
    start: null, stop:null, style:null;
}
;
    if(r.eq(a).attr("begin")&&(d.start=mejs.Utility.convertSMPTEtoSeconds(r.eq(a).attr("begin"))), !d.start&&r.eq(a-1).attr("end")&&(d.start=mejs.Utility.convertSMPTEtoSeconds(r.eq(a-1).attr("end"))), r.eq(a).attr("end")&&(d.stop=mejs.Utility.convertSMPTEtoSeconds(r.eq(a).attr("end"))), !d.stop&&r.eq(a+1).attr("begin")&&(d.stop=mejs.Utility.convertSMPTEtoSeconds(r.eq(a+1).attr("begin"))), i) {
    u="";
    for(var h in i)u+=h+": "+i[h]+";
    "}
u&&(d.style=u), 0==d.start&&(d.start=.2), l.times.push(d), n=e.trim(r.eq(a).html()).replace(/(\b(https?|ftp|file): \/\/[-A-Z0-9+&@#\/%?=~_|!:, .;
    ]*[-A-Z0-9+&@#\/%=~_|])/gi, "<a href='$1' target='_blank'>$1</a>"), l.text.push(n), 0==l.times.start&&(l.times.start=2);
}
return l;
}}, split2: function(e, t) {
    return e.split(t);
}
}, 3!="x\n\ny".split(/\n/gi).length&&(mejs.TrackFormatParser.split2=function(e, t) {
    var i, n=[], a="";
    for(i=0;
    i<e.length;
    i++)a+=e.substring(i, i+1), t.test(a)&&(n.push(a.replace(t, "")), a="");
    return n.push(a), n;
}
);
}(mejs.$), function(e) {
    e.extend(mejs.MepDefaults,  {
    contextMenuItems: [ {
    render: function(e) {
    return"undefined"==typeof e.enterFullScreen?null: e.isFullScreen?mejs.i18n.t("Turn off Fullscreen"):mejs.i18n.t("Go Fullscreen");
}
, click:function(e) {
    e.isFullScreen?e.exitFullScreen(): e.enterFullScreen();
}
},  {
    render: function(e) {
    return e.media.muted?mejs.i18n.t("Unmute"): mejs.i18n.t("Mute");
}
, click:function(e) {
    e.media.muted?e.setMuted(!1): e.setMuted(!0);
}
},  {
    isSeparator: !0;
}
,  {
    render: function() {
    return mejs.i18n.t("Download Video");
}
, click: function(e) {
    window.location.href=e.media.currentSrc;
}
}];
}), e.extend(MediaElementPlayer.prototype,  {
    buildcontextmenu: function(t) {
    t.contextMenu=e('<div class="mejs-contextmenu"></div>').appendTo(e("body")).hide(), t.container.bind("contextmenu", function(e) {
    return t.isContextMenuEnabled?(e.preventDefault(), t.renderContextMenu(e.clientX-1, e.clientY-1), !1): void 0;
}
), t.container.bind("click", function() {
    t.contextMenu.hide();
}
), t.contextMenu.bind("mouseleave", function() {
    t.startContextMenuTimer();
}
);
}, cleancontextmenu: function(e) {
    e.contextMenu.remove();
}
, isContextMenuEnabled: !0, enableContextMenu:function() {
    this.isContextMenuEnabled=!0;
}
, disableContextMenu: function() {
    this.isContextMenuEnabled=!1;
}
, contextMenuTimeout: null, startContextMenuTimer:function() {
    var e=this;
    e.killContextMenuTimer(), e.contextMenuTimer=setTimeout(function() {
    e.hideContextMenu(), e.killContextMenuTimer();
}
, 750);
}, killContextMenuTimer: function() {
    var e=this.contextMenuTimer;
    null!=e&&(clearTimeout(e), delete e, e=null);
}
, hideContextMenu: function() {
    this.contextMenu.hide();
}
, renderContextMenu: function(t, i) {
    for(var n=this, a="", o=n.options.contextMenuItems, r=0, s=o.length;
    s>r;
    r++)if(o[r].isSeparator)a+='<div class="mejs-contextmenu-separator"></div>';
    else {
    var l=o[r].render(n);
    null!=l&&(a+='<div class="mejs-contextmenu-item" data-itemindex="'+r+'" id="element-'+1e6*Math.random()+'">'+l+"</div>");
}
n.contextMenu.empty().append(e(a)).css( {
    top: i, left:t;
}
).show(), n.contextMenu.find(".mejs-contextmenu-item").each(function() {
    var t=e(this), i=parseInt(t.data("itemindex"), 10), a=n.options.contextMenuItems[i];
    "undefined"!=typeof a.show&&a.show(t, n), t.click(function() {
    "undefined"!=typeof a.click&&a.click(n), n.contextMenu.hide();
}
);
}), setTimeout(function() {
    n.killControlsTimer("rev3");
}
, 100);
}});
}(mejs.$), function(e) {
    e.extend(mejs.MepDefaults,  {
    postrollCloseText: mejs.i18n.t("Close");
}
), e.extend(MediaElementPlayer.prototype,  {
    buildpostroll: function(t, i, n) {
    var a=this, o=a.container.find('link[rel="postroll"]').attr("href");
    "undefined"!=typeof o&&(t.postroll=e('<div class="mejs-postroll-layer mejs-layer"><a class="mejs-postroll-close" onclick="$(this).parent().hide();
    return false;
    ">'+a.options.postrollCloseText+'</a><div class="mejs-postroll-layer-content"></div></div>').prependTo(n).hide(), a.media.addEventListener("ended", function() {
    e.ajax( {
    dataType: "html", url:o, success:function(e) {
    n.find(".mejs-postroll-layer-content").html(e);
}
}), t.postroll.show();
}, !1));
}});
}(mejs.$);
    