!function(e) {
    e.fn.FeedEk=function(t) {
    var i= {
    FeedUrl: "http://rss.cnn.com/rss/edition.rss", MaxCount:5, ShowDesc:!0, ShowPubDate:!0, CharacterLimit:0, TitleLinkTarget:"_blank"}
;
    t&&e.extend(i, t);
    var n, a=e(this).attr("id");
    e("#"+a).empty().append('<img class="loader" src="img/loader.gif" alt=""/>'), e.ajax( {
    url: "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num="+i.MaxCount+"&output=json&q="+encodeURIComponent(i.FeedUrl)+"&hl=en&callback=?", dataType:"json", success:function(t) {
    e("#"+a).empty();
    var s="";
    e.each(t.responseData.feed.entries, function(e, t) {
    s+='<li><span class="itemTitle"><a href="'+t.link+'" target="'+i.TitleLinkTarget+'" >'+t.title+"</a></span>", i.ShowPubDate&&(n=new Date(t.publishedDate), s+='<small class="itemDate">'+n.toLocaleDateString()+"</small>"), i.ShowDesc&&(s+=i.DescCharacterLimit>0&&t.content.length>i.DescCharacterLimit?'<div class="itemContent">'+t.content.substr(0, i.DescCharacterLimit)+"...</div>": '<div class="itemContent">'+t.content+"</div>");
}
), e("#"+a).append('<ul class="feedEkList">'+s+"</ul>");
}});
}}(jQuery);
    