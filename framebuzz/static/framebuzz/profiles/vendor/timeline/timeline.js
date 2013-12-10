(function($) {
	function Timeline(){
		this.leftLimit = 0;
		this.rightLimit = 0;
	}

	Timeline.prototype.reload = function(){
		$('.circle').remove();
		var timeline = this ;

		if($(window).width() > 767){
			timeline.leftLimit = 0;
			timeline.rightLimit = 0;
				
			timeline.$container.find('.item').each(function(){
				var $item = $(this);

				if(timeline.leftLimit > timeline.rightLimit){
					var newBottom = timeline.rightLimit + $item.outerHeight(true);
					if (newBottom < timeline.leftLimit + 20){
						newBottom = timeline.leftLimit + 20;
					}
					$item.removeClass('left').addClass('right');
					$item.stop(false, true).css({
						"top"		: (newBottom-$item.outerHeight(true)) + "px",
						"left"		: "52%"
					});
					timeline.rightLimit = newBottom;
				}
				else{
					var newBottom = timeline.leftLimit + $item.outerHeight(true);
					if (newBottom < timeline.rightLimit + 20){
						newBottom = timeline.rightLimit + 20;
					}
					$item.removeClass('right').addClass('left');
					$item.stop(false, true).css({
						"top"		: (newBottom-$item.outerHeight(true)) + "px",
						"left"		: "0"
					});
					timeline.leftLimit = newBottom;
				}
			});
			timeline.$innerContainer.height(Math.max(timeline.leftLimit, timeline.rightLimit) + 20);
		}
		else{
			timeline.$container.find('.item').stop(true, true).css({
				"top"		: "auto",
				"left"		: "auto"
			});
			var height = 0;
			timeline.$container.find('.item').each(function(){
				var $item = $(this);
				height+= $item.outerHeight(true);
			});
			timeline.$innerContainer.height(height);
		}
		timeline.$container.find('.item.init').removeClass('init');
	};

	Timeline.prototype.init = function(params) {
		var timeline = this;
		timeline.reload();
		timeline.reload();

		$('a.filter').click(function() {
			timeline.loading = false;
			timeline.$container.find('.loadMore').removeClass('loading').find('p').html('Loading...');
			timeline.iteration = 0;
		});

		timeline.initEvents();
		if(params.infiniteScroll)
		{
			timeline.loading = false;
			timeline.iteration =  0;
			timeline.$container.find('.loadMore').click(function(){
				if(timeline.loading){
					return false;
				}
				timeline.loading = true;
				timeline.$container.find('.loadMore').toggleClass('loading');
				var data = params.data(timeline.iteration);
				$.ajax({
					url: params.url,
					data: data,
					success: function(res){
						if(res == ""){
							timeline.$container.find('.loadMore').removeClass('loading').find('p').html(params.doneText);
							timeline.loading = true;
							return;
						}
						timeline.$innerContainer.append(res);
						timeline.$container.find('.loadMore').toggleClass('loading');
						timeline.reload();
						timeline.reload();
						timeline.initEvents();
						timeline.loading = false;
						timeline.iteration += 1;

						$('img.lazy').not('.loaded').lazyload({ 
				            event: 'scroll trigger-lazy-load'
				        }).addClass('loaded');
					},
					dataType: "html"

				});
			});
		}

		if(params.scrollForMore)
		{
			$(window).scroll(function(){
				var offset = timeline.$container.find('.loadMore').position();

				if((offset.top-$(window).height() <= $(window).scrollTop()) && !timeline.loading)
				{
					timeline.$container.find('.loadMore').click();
				}
			});
		}
	};

	Timeline.prototype.initEvents = function(){
		
	};

	$.fn.rTimeline = function(params) {
		var defaults = {
			theme : 'light',
			infiniteScroll : true,
			scrollForMore : true,
			url : '',
			doneText : "No more posts!",
			data : function(iteration){
				return "";
			}
		}
	    params = $.extend( defaults, params);
	    this.each(function() {
			var $t = $(this);
			var timeline;
			timeline = new Timeline();

			$(document).ready(function () {
				timeline.$container = $t;
				$t.addClass(params.theme);
				timeline.$innerContainer = $t.find('.container');
			});

			$(window).load(function () {
				timeline.init(params);
			});

			$(window).smartresize(function(){
				timeline.reload();
			});

			timeline.init(params);
	            
	    });
		return this;
	};
})(jQuery);