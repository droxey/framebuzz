
// Accordion Toggle
	var iconOpen = 'icon-minus',
        iconClose = 'icon-plus';

    $(document).on('show.bs.collapse hide.bs.collapse', '.accordion', function (e) {
        var $target = $(e.target)
          $target.siblings('.accordion-heading')
          .find('em').toggleClass(iconOpen + ' ' + iconClose);
          if(e.type == 'show')
              $target.prev('.accordion-heading').find('.accordion-toggle').addClass('active');
          if(e.type == 'hide')
              $(this).find('.accordion-toggle').not($target).removeClass('active');
    });
	  
// DM Top
(function($) {
 "use strict";
	jQuery(window).scroll(function(){
		if (jQuery(this).scrollTop() > 1) {
			jQuery('.dmtop').css({bottom:"25px"});
		} else {
			jQuery('.dmtop').css({bottom:"-100px"});
		}
	});
	jQuery('.dmtop').click(function(){
		jQuery('html, body').animate({scrollTop: '0px'}, 800);
		return false;
	});

// DM Menu
	jQuery('#nav').affix({
		offset: { top: $('#nav').offset().top }
	});

// Menu
	$(".panel a").click(function(e){
		e.preventDefault();
			var style = $(this).attr("class");
			$(".jetmenu").removeAttr("class").addClass("jetmenu").addClass(style);
		});
	$().jetmenu();

// Facts
	function count($this){
			var current = parseInt($this.html(), 10);
			current = current + 1; /* Where 50 is increment */
		
			$this.html(++current);
			if(current > $this.data('count')){
				$this.html($this.data('count'));
			} else {    
				setTimeout(function(){count($this)}, 50);
			}
		}        
		
		$(".stat-count").each(function() {
		  $(this).data('count', parseInt($(this).html(), 10));
		  $(this).html('0');
		  count($(this));
	});
		
// Tooltip
	$('.social_buttons, .client').tooltip({
		selector: "a[data-toggle=tooltip]"
	})
	
	$('.social_buttons, .client').tooltip()
	
// prettyPhoto
	jQuery(document).ready(function(){
		jQuery('a[data-gal]').each(function() {
			jQuery(this).attr('rel', jQuery(this).data('gal'));
		});  	
		jQuery("a[data-rel^='prettyPhoto']").prettyPhoto({animationSpeed:'slow',theme:'light_square',slideshow:false,overlay_gallery: false,social_tools:false,deeplinking:false});
	}); 

// Hover and Carousel
	$('.owl-carousel > .item ').each( function() { $(this).hoverdir(); } );
		$("#owl-demo").owlCarousel({
		items : 5,
		autoPlay: 3000, //Set AutoPlay to 3 seconds
		stopOnHover : true,
		lazyLoad : true,
		transitionStyle:"fade",
		navigation : true,
		pagination : false,
	});

// tooltip demo
	$("[data-toggle=tooltip]").tooltip();

// popover demo
	$("[data-toggle=popover]")
	.popover()


		
})(jQuery);