$(document).ready(function() {
    $('#twitter').sharrre({
          share: {
            twitter: true
          },
          template: '<a class="box clearfix" href="#"><div class="count" href="#">{total}</div><div class="share"><img src="/static/framebuzz/dashboard/img/social_icons/twitter.png" height="16" width="16" alt="Tweet This"></div></a>',
          enableHover: false,
          enableTracking: true,
          buttons: { twitter: {via: 'framebuzz'}},
          click: function(api, options){
            api.simulateClick();
            api.openPopup('twitter');
          }
    });

    $('#facebook').sharrre({
          share: {
            facebook: true
          },
          template: '<a class="box clearfix" href="#"><div class="count" href="#">{total}</div><div class="share"><img src="/static/framebuzz/dashboard/img/social_icons/facebook.png" height="16" width="16" alt="Share on Facebook"></div></a>',
          enableHover: false,
          enableTracking: true,
          click: function(api, options){
            api.simulateClick();
            api.openPopup('facebook');
          }
    });

    $('#googleplus').sharrre({
          share: {
            googlePlus: true
          },
          template: '<a class="box clearfix" href="#"><div class="count" href="#">{total}</div><div class="share"><img src="/static/framebuzz/dashboard/img/social_icons/google.png" height="16" width="16" alt="+1 on Google"></div></a>',
          enableHover: false,
          enableTracking: true,
          urlCurl: "/ajax/google-plus-count/",
          click: function(api, options){
            api.simulateClick();
            api.openPopup('googlePlus');
          }
    });
});