$(document).ready(function(){
    /* --------------------------------------------------------
        Bootstrap Components + Form Elements
    -----------------------------------------------------------*/
    (function(){
    	//Popover
    	$('.pover').popover();
    	
    	/* Tab */
        $('.tab a').click(function(e) {
            e.preventDefault();
            $(this).tab('show');
        });
    	
    	/* Collapse */
    	$('.collapse').collapse();
    	
    	/* Accordion */
    	$('.accordion .panel-heading .panel-title a').click(function(){
    	    $(this).toggleClass('active');
    	});
    	
    	/* Textarea */
        $('.auto-size').autosize();
    	
        /* Select */
        $('.select').selectpicker();
    	
    	/* Modal */
    	$('[data-dismiss="modal"]').on('click', function(){
    	    $(this).closest('.modal').modal('hide');
    	});
    })();
    
    /* --------------------------------------------------------
        Side Menu
    -----------------------------------------------------------*/
    (function(){
        $('.side-menu > li.submenu > a').click(function(e){
            e.preventDefault();
	    if (!$(this).next('ul').is(":visible")) {
		$('.side-menu > li ul').slideUp(150);
		$(this).next('ul').slideDown(150);
	    }
	    else {
		$(this).next('ul').slideToggle(150);
	    }
	    
	    
        });
    })();
    
    /* --------------------------------------------------------
        Sidebar Toggle
    -----------------------------------------------------------*/
    (function(){
	function handler1() {
	
	    $(this).closest('aside').addClass('toggled').find('.sidebar-container').animate({
		width: '230px'
	    }, 100, function(){
		$(this).closest('aside').find('.shadowed').fadeIn(150);	
	    });
	    $(this).closest('aside').find('.sidebar-toggle').one("click", handler2);
	}
	function handler2() {
	    $(this).closest('aside').find('.shadowed').fadeOut(150, function(){
		$(this).closest('aside').removeClass('toggled').find('.sidebar-container').animate({
		    width: '15px'
		}, 100);
		$(this).closest('aside').find('.shadowed').hide();
	    });
	    
	   $(this).closest('aside').find('.sidebar-toggle').one("click", handler1);
	}
	
	//Sidebar toggle based on above 2 functions in mobile devices
	$('.sidebar-toggle').one("click", handler1);
	
	//Sidebar sizing based on #content height
	var contentHeight = $('#content').height(true);
	$('#rightbar .sidebar-toggle').click(function(){
	    $('#rightbar').height(contentHeight); 
	});
    })();
    
    /* --------------------------------------------------------
        List View
    -----------------------------------------------------------*/
    (function(){
	checkBox = $('.listview .media .check-all');
	parentCheck = $('.listview .listview-header .check-all');
	deleteAll = $('.listview .listview-header .list-delete-all');
	
	parentCheck.change(function () {
	    if ($(this).is(':checked')) {
		checkBox.prop('checked', true);
		deleteAll.css('display', 'inline-block');
	    }
	    else {
		checkBox.prop('checked', false);
		deleteAll.hide();
	    }
	});
          
	checkBox.change(function(){
	     if(checkBox.length == $('.listview .media .check-all:checked').length) {
		parentCheck.prop('checked', true);
		  
	     } else {
		parentCheck.prop('checked', false);  
	     }
       });
     
	$('.listview .listview-header .check-all, .listview .media .check-all').change(function(){
	    deleteAll.css('display','inline-block');
	    if(!$('.listview .media .check-all:checked').length > 0){
		deleteAll.hide();
	    }
	});
   
     })();
    
    /* --------------------------------------------------------
        Date Time Widget
    -----------------------------------------------------------*/
    (function(){
        var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]; 
        var dayNames= ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
	
        // Create a newDate() object
        var newDate = new Date();
	
        // Extract the current date from Date object
        newDate.setDate(newDate.getDate());
	
        // Output the day, date, month and year   
        $('#date').html(dayNames[newDate.getDay()] + " " + newDate.getDate() + ' ' + monthNames[newDate.getMonth()] + ' ' + newDate.getFullYear());
        
        setInterval( function() {
	    
            // Create a newDate() object and extract the seconds of the current time on the visitor's
            var seconds = new Date().getSeconds();
	    
            // Add a leading zero to seconds value
            $("#sec").html(( seconds < 10 ? "0" : "" ) + seconds);
        },1000);
                
        setInterval( function() {
	    
            // Create a newDate() object and extract the minutes of the current time on the visitor's
            var minutes = new Date().getMinutes();
	    
             // Add a leading zero to the minutes value
            $("#min").html(( minutes < 10 ? "0" : "" ) + minutes);
        },1000);
                
        setInterval( function() {
	    
            // Create a newDate() object and extract the hours of the current time on the visitor's
            var hours = new Date().getHours();
	    
            // Add a leading zero to the hours value
            $("#hours").html(( hours < 10 ? "0" : "" ) + hours);
        }, 1000);
    })();
    
    /* --------------------------------------------------------
        Comment Textarea
    -----------------------------------------------------------*/
    (function(){
        $('.post-comment').click(function(){
            $(this).closest('.media').find('.add-comment').show(); 
        });
	
        $('.cancel-comment').click(function(){
            $(this).parent().hide();
        });
    })();
    
    /* --------------------------------------------------------
        Post Menu
    -----------------------------------------------------------*/
    (function(){
        $('.post-menu li a').click(function(){
            $('.post-menu li a').removeClass('active');
            $(this).addClass('active');
        });
    })();
    
    /* --------------------------------------------------------
        Image Popup 
    -----------------------------------------------------------*/
    (function(){
        Shadowbox.init();
        $('.img-popup').prepend('<i class="icon-expand"></i>');
    })();
   
    /* --------------------------------------------------------
        RSS Feed widget
    -----------------------------------------------------------*/
    (function(){
        $('#news-feed').FeedEk({
            FeedUrl: 'http://rss.cnn.com/rss/edition.rss',
            MaxCount: 5,
            ShowDesc: true,
            ShowPubDate: true,
            DescCharacterLimit: 50
        });
    })();
    
    /* --------------------------------------------------------
        Tag Select
    -----------------------------------------------------------*/
    (function(){
	$(".tag-select").chosen();
    })();
    
    /* --------------------------------------------------------
        Date Time Picker
    -----------------------------------------------------------*/
    (function(){
	//Date Only
	$('.date-only').datetimepicker({
	    pickTime: false
	});
	
	//Time only
	$('.time-only').datetimepicker({
	    pickDate: false
	});
	
	//12 Hour Time
	$('.time-only-12').datetimepicker({
	    pickDate: false,
	    pick12HourFormat: true
	});
	
	$('.datetime-pick input:text').on('click', function(){
	    $(this).closest('.datetime-pick').find('.add-on i').click();
	});
    })();
    
    /* --------------------------------------------------------
        Color Picker
    -----------------------------------------------------------*/
    (function(){
	//Default - hex
	$('.color-picker').colorpicker();
	
	//RGB
	$('.color-picker-rgb').colorpicker({
	    format: 'rgb'
	});
	
	//RGBA
	$('.color-picker-rgba').colorpicker({
	    format: 'rgba'
	});
	
	$('[class*="color-picker"]').colorpicker().on('changeColor', function(e){
	    var colorThis = $(this).val();
	    $(this).closest('.color-pick').find('.color-preview').css('background',e.color.toHex());
	});
    })();
    
    /* --------------------------------------------------------
        Input Slider
    -----------------------------------------------------------*/
    (function(){
	$('.input-slider').slider().on('slide', function(ev){
	    $(this).closest('.slider-container').find('.slider-value').val(ev.value);
	}); 
    })();
    
    /* --------------------------------------------------------
        Tiny Graphs(Sidebar)
    -----------------------------------------------------------*/
    (function(){
        //Site Visits
        $("#site-visits").sparkline([6,4,5,8,7,6,5,6,7,8,3,4,5,7,4,2,9,3,4,5,7,6,5,4,7], {
            type: 'bar',
            height: '60px',
            barWidth: 6,
            barColor: '#DF8D03',       
        });
         
        //Site Impressions
        $("#site-impressions").sparkline([4,7,6,2,5,3,8,6,7,8,3,4,5,7,4,6,3,3,4,5,7,6,5,4,3], {
            type: 'bar',
            height: '60px',
            barWidth: 6,
            barColor: '#007fff',       
        });
         
         //Site Bandwith
         $("#site-bandwith").sparkline([5,4,3,2,1,7,6,7,4,2,6,8,7,6,5,6,4,3,4,5,7,6,8,7,6], {
            type: 'bar',
            height: '60px',
            barWidth: 6,
            barColor: '#02C502',       
        });
         
        //Custom Pie chart 1
        $("#side-pie").sparkline([3,3,2], {
            type: 'pie',
            width: '135',
            height: '135',
            sliceColors: ['#FFA206','#007fff','#02C502'],
            offset: 90,
            borderColor: ''
        });
        
        //Custom Pie chart 2
        $("#side-pie2").sparkline([3,3,6], {
            type: 'pie',
            width: '65',
            height: '65',
            sliceColors: ['#E93C3C','#2f720b','#0b4594'],
            offset: 90,
            borderColor: ''
        });
        
        //Custom Pie chart 3
        $("#side-pie3").sparkline([4,4,4,4], {
            type: 'pie',
            width: '65',
            height: '65',
            sliceColors: ['#b2b2b2','#888989','#eee','#333'],
            offset: 90,
            borderColor: ''
        });
	
	//Line chart1
	$("#side-line").sparkline([5,6,7,9,9,5,3,2,3,4,6,7], {
	    type: 'line',
	    width: '100%',
	    height: '60',
	    lineColor: '#000',
	    fillColor: '#FFA206',
	    lineWidth: 2,
	    spotColor: false,
	    minSpotColor: false,
	    maxSpotColor: false 
	});
	
	//Line chart2
	$("#side-line2").sparkline([7,6,4,3,2,3,4,5,6,7,8,9,8,7,6,5,4], {
	    type: 'line',
	    width: '100%',
	    height: '60',
	    lineColor: '#000',
	    fillColor: '#007fff',
	    lineWidth: 2,
	    spotColor: false,
	    minSpotColor: false,
	    maxSpotColor: false 
	});
	
        //Line chart3
        $("#side-line3").sparkline([7,6,4,3,2,3,5,9,9,7,6,5], {
            type: 'line',
            width: '100%',
            height: '60',
            lineColor: '#000',
            fillColor: '#02C502',
            lineWidth: 2,
            spotColor: false,
            minSpotColor: false,
            maxSpotColor: false 
       });
    
        //Tristate chart1
        $("#side-tristate").sparkline([2,2,0,2,-2,-2,2,-2,0,0,2,2,2,-2,-2,-2,0,2,0,-2,2,-2,-2,-2,2], {
            type: 'tristate',
            width: '100%',
            height: '60',
            barWidth: 6,
            zeroAxis: false,
            posBarColor: '#0087f4',
            negBarColor: '#f04040',
            zeroBarColor: '#ffa206'
        });
        
        //Tristate chart2
        $("#side-tristate2").sparkline([2,-2,-2,-2,0,2,0,-2,2,2,2,-2,-2,0,0,0,2,-2,2,-2,2,-2,2,0,2], {
            type: 'tristate',
            width: '100%',
            height: '60',
            barWidth: 6,
            zeroAxis: false,
            posBarColor: '#ffa206',
            negBarColor: '#09AD30',
            zeroBarColor: '#f04040'
        });
     
    })();
    
    /* --------------------------------------------------------
        Calendar 
    -----------------------------------------------------------*/
    (function(){
        //Sidebar
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();
        $('#sidebar-calendar').fullCalendar({
            editable: false,
            events: [],
	    header: {
		left: 'title'
	    }
        });
	
	//Content widget
	$('#calendar-widget').fullCalendar({
	    header: {
		left: 'title',
		right: 'prev, next',
		//right: 'month,basicWeek,basicDay'
	    },
            editable: true,
            events: [
		{
			title: 'All Day Event',
			start: new Date(y, m, 1)
		},
		{
			title: 'Long Event',
			start: new Date(y, m, d-5),
			end: new Date(y, m, d-2)
		},
		{
			title: 'Repeat Event',
			start: new Date(y, m, 3),
			allDay: false
		},
		{
			title: 'Repeat Event',
			start: new Date(y, m, 4),
			allDay: false
		}
	    ]
        });

    })();
    
    /* --------------------------------------------------------
        CSS Hack 
    -----------------------------------------------------------*/
    (function(){
	//Mac only
        if(navigator.userAgent.indexOf('Mac') > 0) {
            $('body').addClass('mac-os');
        }

    })();
    
    /* --------------------------------------------------------
        Form Validation
    -----------------------------------------------------------*/
    (function(){
        $("[class*='form-validation']").validationEngine();
        
        //Clear Prompt
        $('body').on('click', '.validation-clear', function(e){
            e.preventDefault();
            $(this).closest('form').validationEngine('hide');
        });
    })();
    
    /* --------------------------------------------------------
        Form Wizard
    -----------------------------------------------------------*/
    (function(){
	//Prevent tab click in wizard
	$('body').on('click', '.wizard-nav li', function(e){
            e.preventDefault();
        });
                
	$('body').on('click', '.wizard-next', function(){
	    var active = $(this).closest('.form-wizard').find('.wizard-nav li.active');
	    var href = $(this).closest('.form-wizard').find('.wizard-nav li.active a').attr('href');
	    
	    //Validate
	    if ($(href +' .form-validation')[0]) {
		$(href).find('.form-validation').validationEngine('validate');
	    }
	    
	    //Look for any invalid/missing inputs within the form, if not move to next tab 
	    if (!$(href +' .formErrorContent')[0]) {
		var current = $(this).closest('.form-wizard').find('.wizard-nav li.active'); 
		current.next().find('a').tab('show');
	    }
	});
	
	//Button Control
	$('.form-wizard').each(function(){
	    var buttonSet1 = $(this).find('.wizard-prev, .wizard-finish');
	    var buttonNext = $(this).find('.wizard-next');
	    var buttonPrev = $(this).find('.wizard-prev');
	    var buttonFinish = $(this).find('.wizard-finish');
	    var navFirst = $(this).find('.wizard-nav li:first');
	    var navLast = $(this).find('.wizard-nav li:last');
	    
	    //Onload
	    if (navFirst.hasClass('active')) {
		buttonSet1.hide();
	    }

	    //On next 
	    buttonNext.on('click', function(){
		setTimeout(function(){
		    if (!navFirst.hasClass('active')) {
			buttonPrev.show();
		    }
		    if (navLast.hasClass('active')) {
			buttonNext.hide();
			buttonSet1.show();
		    }    
		})
	    });
	    
	    //On Prev
	    buttonPrev.on('click', function(){
		setTimeout(function(){
		    buttonFinish.hide();
		    buttonNext.show();
		
		    if (navFirst.hasClass('active')) {
			buttonNext.show();
			buttonSet1.hide();
		    }    
		})
	    });
	    
	});
	
	//Prev
	$('body').on('click', '.wizard-prev', function(){
	    var current = $(this).closest('.form-wizard').find('.wizard-nav li.active'); 
	    current.prev().find('a').tab('show');
	});
	
    })();
    
    /* --------------------------------------------------------
        Media Player
    -----------------------------------------------------------*/
    (function(){
	$('audio,video').mediaelementplayer({
	    success: function(player, node) {
		$('#' + node.id + '-mode').html('mode: ' + player.pluginType);
	    }
	});
    })();
    
    /* --------------------------------------------------------
        Sortable Gallery
    -----------------------------------------------------------*/
    $('body').on('click', '.gallery-sort ul li a', function(e){
	e.preventDefault();
	
	//Active Class for sort menu
	$(this).closest('ul').find('a').removeClass('active');
	$(this).addClass('active');
	
	//Sort
	var category = $(this).attr('href').replace(/#/g, '');
	var container = $(this).closest('.gallery-container');
	
	if (category == "all") {
	     container.find('.gallery-thumb').fadeOut(200, function(){
		  container.find('.gallery-thumb').fadeIn(250);
	     });
	}
	else {
	     container.find('.gallery-thumb').fadeOut(200, function(){
		  container.find('[data-category='+category+']').fadeIn(240);
	     });    
	}
	setTimeout(function(){ $('.thumbs-container').masonry() }, 250);
    });
    
    /* --------------------------------------------------------
        Todo List
    -----------------------------------------------------------*/
    (function(){
	//Add line-through for alreadt checked items
	$('.todo-list .media .check-all:checked').each(function(){
	    $(this).closest('.media').find('.media-body').css('text-decoration', 'line-through')
	});
	
	//Add line-through when checking
	$('.todo-list .media .check-all').change(function(){
	    if($(this).is(':checked')) {
		$(this).closest('.media').find('.media-body').css('text-decoration', 'line-through')
	    }
	    else {
		$(this).closest('.media').find('.media-body').removeAttr('style');
	    }
	});

    })();
    
    /* --------------------------------------------------------
        Message Menu
    -----------------------------------------------------------*/
    (function(){
	/* Toggle */
	$('.message-menu-toggle').click(function(){
	    $(this).closest('.message-menu').toggleClass('toggled');
	});
	
	/* Remove toggled class above 768 */
	$(window).resize(function(){
	    if($(this).width() > 768){
		var bodyHeight = $('.message-body').height();
		$('.message-menu').height(bodyHeight);
		$('.message-menu').removeClass('toggled');
	    }
	    else {
		$('.message-menu').removeAttr('style');
	    }
	})
	.resize();
	
	/* Hide when click outside */
	$(document).mouseup(function (e) {
	    var container = $(".message-menu");
	    if (container.has(e.target).length === 0) {
		container.removeClass('toggled');
	    }
	});
    })();
    
    /* --------------------------------------------------------
        Prevent click in dropdown
    -----------------------------------------------------------*/
    (function(){
	$('.dropdown-form').click(function(e){
	    e.stopPropagation();
	});
    })();
	
});

$(window).load(function(){
    /* --------------------------------------------------------
        Custom Scrollbar
    -----------------------------------------------------------*/
    (function() {
	var nice = false;
	nice = $('.table-responsive, .overflow, .chzn-container .chzn-results').niceScroll();
    })();
    
    /* --------------------------------------------------------
        Bootstrap Tooltips
    -----------------------------------------------------------*/
    (function(){
	$('.ttips').tooltip();
    })();
});
