var viewModel = null;

(function($) {
$.fn.serializeFormJSON = function() {

   var o = {};
   var a = this.serializeArray();
   $.each(a, function() {
       if (o[this.name]) {
           if (!o[this.name].push) {
               o[this.name] = [o[this.name]];
           }
           o[this.name].push(this.value || '');
       } else {
           o[this.name] = this.value || '';
       }
   });
   return o;
};
})(jQuery);

var HeatmapViewModel = function() {
  var self = this;

  self.className = ko.observable('');
  self.block = ko.observable(0);
};

var VideoViewModel = function() {
  var self = this;

  self.uploaded = ko.observable('');
  self.title = ko.observable('');
  self.video_id = ko.observable('');
  self.swf_url = ko.observable('');
  self.duration = ko.observable(0);
  self.youtube_url = ko.observable('');
  self.id = ko.observable(0);
  self.channel = ko.observable('');
};

var ActionsViewModel = function () {
  var self = this;

  self.is_favorite = ko.observable(false);
  self.is_following = ko.observable(false);
  self.is_flagged = ko.observable(false);
}

var UserViewModel = function() {
  var self = this;

  self.username = ko.observable('');
  self.first_name = ko.observable('');
  self.last_name = ko.observable('');
  self.id = ko.observable(0);
  self.email = ko.observable('');
  self.avatar_url = ko.observable('');
  self.sidebar_url = ko.observable('');
  self.channel = ko.observable('');
};

var ReplyViewModel = function() {
  var self = this;

  self.comment = ko.observable('');
  self.submit_date = ko.observable('');
  self.id = ko.observable(0);
  self.user = ko.observableDictionary(new UserViewModel());
  self.parent_id = ko.observable(0);
  self.object_pk = ko.observable(0);
  self.video_url = ko.observable('');
  self.video_title = ko.observable('');
  self.reply_actions = ko.observableDictionary(new ActionsViewModel());
};

var ThreadViewModel = function() {
  var self = this;

  self.comment = ko.observable('');
  self.parent = ko.observable(0);
  self.submit_date = ko.observable('');
  self.has_replies = ko.observable(false);
  self.content_object = ko.observableDictionary(new VideoViewModel());
  self.content_type = ko.observableDictionary();
  self.user = ko.observableDictionary(new UserViewModel());
  self.time_hms = ko.observable('0:00');
  self.time = ko.observable(0.000);
  self.id = ko.observable(0);
  self.thread_actions = ko.observableDictionary(new ActionsViewModel());
};

var CommentViewModel = function() {
  var self = this;

  self.thread = ko.observableDictionary(new ThreadViewModel());
  self.children = ko.observableDictionary(new ReplyViewModel());
};

var CommentHeatmapViewModel = function() {
  var self = this;

  self.heatmap = ko.observableArray([]);
  self.video = ko.observableDictionary(new VideoViewModel());
  self.comments =  ko.observableArray([]);
  self.recent_replies = ko.observableArray([]);
  self.profile = ko.observableDictionary(new UserViewModel());
  self.user_authenticated = ko.observable(true);
  self.selected_thread = ko.observable(0);
  self.video_time = ko.observable(0);

  self.filtered_comments = ko.computed(function() {
    var filtered = ko.utils.arrayFilter(self.comments(), function(comment) {
        return comment.thread.time() < self.video_time();
      });
    return filtered;
  }, self);
};

var mapping = {
    'comments': {
        create: function(options) {
           var threadModel = ko.mapping.fromJS(options.data, new ThreadViewModel());
           viewModel.comments.push(threadModel);
           return threadModel;
        }
    },
    'heatmap': {
        create: function(options) {
           var heatmapModel = ko.mapping.fromJS(options.data, new HeatmapViewModel());
           viewModel.heatmap.push(heatmapModel);
           return heatmapModel;
        }
    }
};

var PopcornMovie = new function() {

  /***********************************
   * Private Variables               *
   ***********************************/
  var socket,
      videoId,
      videoPk,
      videoUrl,
      username,
      commentsUrl,
      videoPlayer,
      siteName,
      lastUserSelectedSeekTime = 0,
      recentCommentsTicker,
      selectedThreadId = 0,
      isResettingVideo = false,
      animationQueue = $({});

  /***********************************
   * DOM Objects                     *
   ***********************************/
   var domPostCommentForm,
       domScrollbarWrapperDiv,
       domCommentsList,
       domSidebarDiv,
       domBrandingDiv,
       domCommentInputField,
       domTimeInputField,
       domParentIdInputField,
       domShareButtonsDiv,
       domRecentRepliesDiv,
       domVideoWrapperDiv;

  /***********************************
   * Setters                         *
   ***********************************/

  this.setSiteName = function(name) {
    siteName = name;
  },

  this.setThreadId = function(threadId) {
    selectedThreadId = threadId;
  },

  this.setDomElementObjects = function() {
   domPostCommentForm = $('#post-comment-form');
   domScrollbarWrapperDiv = $('#scrollbar-wrapper');
   domCommentsList = $('#comments');
   domSidebarDiv = $('#sidebar');
   domBrandingDiv = $('#branding');
   domCommentInputField = $('#id_comment');
   domTimeInputField = $('#id_time');
   domParentIdInputField = $('#id_parent');
   domRecentRepliesDiv = $('#recent-replies');
   domShareButtonsDiv = $('#share-buttons');
   domVideoWrapperDiv = $('#video-wrapper');
  },

  /***********************************
   * Initialization                  *
   ***********************************/

  this.applyKnockoutBindings = function(jsonData, isNew) {
    if (isNew) {
      viewModel = ko.mapping.fromJS(jsonData, null, new CommentHeatmapViewModel());
      if (viewModel == null) {
        ko.applyBindings(viewModel);
      }

      ko.renderTemplate(
        "videoTemplate",
        viewModel,
        {
            afterRender: function(renderedElement) {
              // Cache commonly used jQuery objects once they are rendered.
              PopcornMovie.setDomElementObjects();

              // Build the MediaElement.js player.
              var player = new MediaElementPlayer('#ytVideo', {
                features: ['youtube','progress'],
                flashName: '/media/swf/flashmediaelement.swf',
                silverlightName: '/media/swf/silverlightmediaelement.xap',
                alwaysShowControls: true,
                // There's a bug here where commenting and hitting the spacebar will
                // cause the space to not be entered, and the video to pause.
                enableKeyboard: false,
                timerRate: 900,
                  success: function (media) {
                    videoPlayer = media;

                    media.addEventListener('timeupdate', function(e) {
                      viewModel.video_time(media.currentTime);
                      domTimeInputField.attr('value', media.currentTime);

                      PopcornMovie.updateCommentOpacities();

                      if (!domPostCommentForm.hasClass('replying')) {
                        PopcornMovie.updateReplyIndicatorText(media.currentTime);

                        var currentTimeHMS = PopcornMovie.convertSecondsToHMS(videoPlayer.currentTime);
                        PopcornMovie.updateReplyIndicatorText(currentTimeHMS);
                      }
                    }, false);

                    media.addEventListener('playing', function(e) {
                      $('.mejs-overlay-play').hide().removeClass('mejs-overlay-pause');

                      $('.mejs-video').hover(function() {
                          if (!videoPlayer.paused) {
                            $('.mejs-overlay-play').hide().addClass('mejs-overlay-pause').fadeIn('fast').show();
                          }
                      }, function() {
                        if (!videoPlayer.paused) {
                          $('.mejs-overlay-play').hide().removeClass('mejs-overlay-pause');
                        }
                      });

                      // Determine if the user performed a 'seek' and update comments accordingly.
                      var seekDifference = lastUserSelectedSeekTime - media.currentTime;
                      var didSeek = Math.abs(seekDifference) > 1;

                      if (didSeek) {
                        if (seekDifference > 0) { // Backward seek.
                          $('li.parent', domCommentsList).removeClass('expired');
                        }

                        viewModel.video_time(media.currentTime);
                        PopcornMovie.updateCommentOpacities();
                      }

                      lastUserSelectedSeekTime = media.currentTime;

                      // If the video has loaded, and the user didn't select a thread,
                      // slide the sidebar back in and show the comments.
                      if (viewModel.selected_thread() > 0 ||
                          (domSidebarDiv.hasClass('video-loaded') &&
                           domScrollbarWrapperDiv.not(':visible'))) {
                        PopcornMovie.dismissSidebarAndShowComments();
                      }

                      // Post a message via Socket.IO that the user started playing the video.
                      var playingVideoMessage = { 'video_id': videoPk, 'state': 1, 'time': media.currentTime };
                      PopcornMovie.sendMessageToServer('update_video_state', JSON.stringify(playingVideoMessage));
                    }, false);

                    media.addEventListener('pause', function(e) {
                      $('.mejs-video').unbind('hover');
                      $('.mejs-overlay-play').hide().addClass('mejs-overlay-pause').fadeIn(500).show();

                      var pausedVideoMessage = { 'video_id': videoPk, 'state': 2, 'time': media.currentTime };
                      PopcornMovie.sendMessageToServer('update_video_state', JSON.stringify(pausedVideoMessage));
                    }, false);
                  }
              });

              // Bind events.
              $('ul li.signup a', domBrandingDiv).on('click', PopcornMovie.registrationLinkClicked);
              $('ul li.dropdown a.logout', domBrandingDiv).on('click', PopcornMovie.logoutUser);

              domCommentInputField.on("focus", function() {
                if (!domPostCommentForm.hasClass('replying')) {
                  videoPlayer.pause();
                }
              });

              domCommentInputField.on("focusout", function() {
                if (!domPostCommentForm.hasClass('posting') && !domPostCommentForm.hasClass('replying')) {
                  window.setTimeout(function() { PopcornMovie.clearThreadCommentForm(); }, 250);
                }
              });

              // Set up the sharing capability.
              domShareButtonsDiv.share({
                  networks: ['facebook','googleplus','twitter','email'],
                  theme: 'square',
                  useIn1: false
              });

              var embedButton = '<a href="#embed-modal-dialog" data-toggle="modal" title="Add this FrameBuzz Video to your Website" class="pop share-square share-square-embed"></a>';
              domShareButtonsDiv.append(embedButton);

              var emailButton = $('a.share-square-email', domShareButtonsDiv);
              var mailtoLink = emailButton.attr('href');

              var shareLink = 'mailto:?subject=Buzz! Check out this video!&body=';
              if (viewModel.user_authenticated()) {
                shareLink += viewModel.profile.username();
              }
              else {
                shareLink += 'Someone';
              }

              shareLink +=  ' shared the following FrameBuzz with you: "' + viewModel.video.title() + '" - http://' + siteName + commentsUrl;
              emailButton.attr('href', shareLink);


              // Set up the recent replies notification area.
              domRecentRepliesDiv.show();
              recentCommentsTicker = $('ul.bxslider', domRecentRepliesDiv).bxSlider({
                mode: 'vertical',
                slideMargin: 0,
                controls: false,
                pager: false,
                speed: 1000
              });

              // If the user isn't logged in, show the Login screen.
              if (!viewModel.user_authenticated()) {
                var loginLink = $('ul li.signup a', domBrandingDiv);
                loginLink.trigger('click');
              }

              PopcornMovie.bindEvents();
            }
        }, $('#video-content'), "replaceNode" );
    }
    else {
      // Update the viewModel.
      ko.mapping.fromJS(jsonData, mapping, viewModel);
    }
  },

  this.selectMovie = function(video_url) {
    commentsUrl = video_url;

    $.ajax({
        url: commentsUrl,
        data: {thread: selectedThreadId},
        dataType: 'json',
        success: function(json, status, xhr) {
          videoUrl = json.video.swf_url + '&rel=0';
          videoId = json.video.video_id;
          videoPk = json.video.id;
          username = json.username;

          PopcornMovie.applyKnockoutBindings(json, true);
          PopcornMovie.initSocketIo();
        }
    });
  },

  this.initSocketIo = function() {
      var port = siteName == 'dev.framebuzz.com:3002' ? 4000 : 80;
      var name = siteName == 'dev.framebuzz.com:3002' ? 'http://dev.framebuzz.com:3002' : siteName;

      socket = io.connect(name, {port: port});

      socket.on('connect', function() {
        PopcornMovie.sendMessageToServer('subscribe_channel', viewModel.video.channel());

        if (viewModel.user_authenticated()) {
          PopcornMovie.sendMessageToServer('subscribe_channel', viewModel.profile.channel());
        }

        // Add a 'view':
        var viewedVideoMessage = {
          'video_id': videoPk,
          'state': 0,
          'time': 0
        };
        PopcornMovie.sendMessageToServer('update_video_state', JSON.stringify(viewedVideoMessage));
      });

      socket.on('message', function(message) {
        var formattedData = JSON.parse(message);

        if (formattedData.channel != viewModel.video.channel() &&
            formattedData.channel != viewModel.profile.channel()) {
          return;
        }

        switch (formattedData.response_type) {
          case 'reload_video_content':
            PopcornMovie.applyKnockoutBindings(formattedData.data, false);
            viewModel.video_time(videoPlayer.currentTime);

            PopcornMovie.updateCommentOpacities();
            PopcornMovie.rebuildScrollbar();
            break;
          case 'added_favorite':
            var threadId = parseInt(formattedData.data.comment_id);
            ko.utils.arrayFilter(viewModel.comments(), function (comment) {
              if (parseInt(comment.thread.id()) == threadId) {
                comment.thread.thread_actions.is_favorite(true);
                return true;
              }

              ko.utils.arrayFilter(comment.children(), function(reply) {
                if (parseInt(reply.id()) == threadId) {
                  reply.reply_actions.is_favorite(true);
                  return true;
                }
              });
            });
            break;
          case 'removed_favorite':
            var threadId = parseInt(formattedData.data.comment_id);
            ko.utils.arrayFilter(viewModel.comments(), function (comment) {
              if (parseInt(comment.thread.id()) == threadId) {
                comment.thread.thread_actions.is_favorite(false);
                return true;
              }

              ko.utils.arrayFilter(comment.children(), function(reply) {
                if (parseInt(reply.id()) == threadId) {
                  reply.reply_actions.is_favorite(false);
                  return true;
                }
              });
            });
            break;
          case 'flagged_comment':
            var threadId = parseInt(formattedData.data.comment_id);
            ko.utils.arrayFilter(viewModel.comments(), function (comment) {
              if (parseInt(comment.thread.id()) == threadId) {
                comment.thread.thread_actions.is_flagged(true);
                return true;
              }

              ko.utils.arrayFilter(comment.children(), function(reply) {
                if (parseInt(reply.id()) == threadId) {
                  reply.reply_actions.is_flagged(true);
                  return true;
                }
              });
            });
            break;
          case 'unflagged_comment':
            var threadId = parseInt(formattedData.data.comment_id);
            ko.utils.arrayFilter(viewModel.comments(), function (comment) {
              if (parseInt(comment.thread.id()) == threadId) {
                comment.thread.thread_actions.is_flagged(false);
                return true;
              }

              ko.utils.arrayFilter(comment.children(), function(reply) {
                if (parseInt(reply.id()) == threadId) {
                  reply.reply_actions.is_flagged(false);
                  return true;
                }
              });
            });
            break;
          case 'followed_user':
            var username = formattedData.data.username;

            ko.utils.arrayFilter(viewModel.comments(), function (comment) {
              if (comment.thread.user.username() == username) {
                comment.thread.thread_actions.is_following(true);
              }

              ko.utils.arrayFilter(comment.children(), function(reply) {
                if (reply.user.username() == username) {
                  reply.reply_actions.is_following(true);
                }
              });
            });
            break;
          case 'unfollowed_user':
            var username = formattedData.data.username;
            ko.utils.arrayFilter(viewModel.comments(), function (comment) {
              if (comment.thread.user.username() == username) {
                comment.thread.thread_actions.is_following(false);
              }

              ko.utils.arrayFilter(comment.children(), function(reply) {
                if (reply.user.username() == username) {
                  reply.reply_actions.is_following(false);
                }
              });
            });
            break;
          case 'new_comment_reply':
            var newReply = ko.mapping.fromJS(formattedData.data, new ReplyViewModel());
            viewModel.recent_replies.push(newReply);
            recentCommentsTicker.reloadSlider();
            break;
          default:
            break;
        }
      });
  },

  this.disconnectPlayer = function() {
    socket.disconnect();

    var message = { 'video_id': videoPk, 'state': -1, 'time': videoPlayer.currentTime };
    PopcornMovie.sendMessageToServer('update_video_state', JSON.stringify(message));
  },

  /***********************************
   * Socket.IO Helpers               *
   ***********************************/

  this.sendMessageToServer = function(message_type, message) {
    if (viewModel.user_authenticated()) {
      // We only track messages if you're logged in!
      socket.emit(message_type, message);
    }
  },

  /***********************************
   * UI Helpers                      *
   ***********************************/

  this.removeThreadView = function() {
    domScrollbarWrapperDiv.removeClass('viewing-thread');
    $('#back-to-comments').unbind('click');

    // Reset selected comments and make sure we have the correct
    // set of comments for the given time.
    viewModel.selected_thread(0);
    viewModel.video_time(videoPlayer.currentTime);

    PopcornMovie.updateCommentOpacities();
    PopcornMovie.rebuildScrollbar();
    return false;
  },

  this.showThreadView = function() {
    if ($(this).hasClass('in-reply-to')) {
      var selectedThread = $(this).attr('data-threadid');
      viewModel.selected_thread(parseInt(selectedThread));
    }

    domScrollbarWrapperDiv.addClass('viewing-thread');
    $('#thread-view-notification').show();

    var selectedComment = $('#comments li[data-threadid="' + viewModel.selected_thread() + '"]');
    selectedComment.addClass('new').show();
    $('ul.replies', selectedComment).show();
    $('ul.replies li.reply', selectedComment).show();
    $('li.parent', domCommentsList).not(selectedComment).hide();

    $('#back-to-comments').on('click', PopcornMovie.removeThreadView);

    PopcornMovie.rebuildScrollbar();
    return false;
  },

  this.rebuildScrollbar = function() {
    domScrollbarWrapperDiv.mCustomScrollbar('destroy');
    domScrollbarWrapperDiv.mCustomScrollbar({
      theme: 'dark-2',
      mouseWheel: true,
      set_width: 168,
      set_height: 324,
      mouseWheelPixels: 500,
      scrollInertia: 150,
      advanced: {
        updateOnContentResize: true
      }
    });
  }

  this.convertSecondsToHMS = function(totalSec) {
    var hours = parseInt( totalSec / 3600 ) % 24;
    var minutes = parseInt( totalSec / 60 ) % 60;
    var seconds = parseInt(totalSec % 60, 10);

    if (hours == 0) {
      return (minutes < 10 ? "0" + minutes : minutes) + ":"
        + (seconds  < 10 ? "0" + seconds : seconds);
    }
    else {
      return (hours < 10 ? "0" + hours : hours) + ":"
        + (minutes < 10 ? "0" + minutes : minutes) + ":"
        + (seconds  < 10 ? "0" + seconds : seconds);
    }
  },

  this.updateReplyIndicatorText = function(text) {
    var replyIndicator = $('span.add-on');
    replyIndicator.text(text);

    var newWidth = 395 - replyIndicator.width() + 37;

    if (domPostCommentForm.hasClass('replying')) {
      domCommentInputField.animate({
        'width': newWidth + 'px'
      }, 500);
    }
    else {
      domCommentInputField.animate({
        'width': '395px'
      }, 500);
    }
  },

  this.bindEvents = function() {
    domVideoWrapperDiv.on("click", 'div.actions a.post-a-reply', PopcornMovie.showThreadCommentForm);
    domVideoWrapperDiv.on("click", 'div.actions a.favorite-post', PopcornMovie.favoritePost);
    domVideoWrapperDiv.on("click", 'div.actions a.flag-post', PopcornMovie.flagPost);
    domVideoWrapperDiv.on("click", 'div.actions a.follow-post', PopcornMovie.toggleUserFollow);
    domVideoWrapperDiv.on("click", 'a.in-reply-to', PopcornMovie.showThreadView);
    domVideoWrapperDiv.on('click', 'a.show-user-sidebar', PopcornMovie.showUserSidebar);

    domVideoWrapperDiv.on('submit', '#post-comment-form', function(e) {
      domPostCommentForm.addClass('posting');
      window.setTimeout(function() { PopcornMovie.submitCommentThread(); }, 100);
      e.preventDefault();
    });
  },

  this.clearThreadCommentForm = function() {
    domParentIdInputField.val('');
    domCommentInputField.val('');
    domCommentInputField.attr('placeholder', 'Post a comment...');

    var currentTimeHMS = PopcornMovie.convertSecondsToHMS(videoPlayer.currentTime);
    PopcornMovie.updateReplyIndicatorText(currentTimeHMS);
  },

  this.updateCommentOpacities = function() {
    $.each($('li.parent', domCommentsList), function(key, value) {
      var commentTime = parseFloat($(value).attr("data-time"));
      var timeDiff = Math.abs(videoPlayer.currentTime - commentTime);

      if (timeDiff > 7) {
        $(value).addClass("expired", 800, function() {
          $(value).removeClass('new');
          $(value).removeClass('expiring');
          $('ul.replies', $(value)).show();
          $(value).show();
        });
      }
      else if (timeDiff < 7 && timeDiff >= 4) {
        $(value).addClass("expiring", 800, function() {
          $(value).removeClass('new');
          $('ul.replies', $(value)).show();
          $(value).show();
        });
      }
      else {
        $(value).slideDown(function() {
          $('ul.replies', $(value)).show();
          $(value).addClass("new", 800);
        }).show();
      }
    });
  },

  /***********************************
   * UI Events                       *
   ***********************************/

  this.showThreadCommentForm = function() {
    domPostCommentForm.addClass('replying');

    var parentId = parseInt($(this).attr('data-threadid'));
    var username = $(this).attr('data-username');

    var replyIndicator = $('span.add-on');

    domCommentInputField.trigger('focus');

    PopcornMovie.updateReplyIndicatorText('@' + username);
    domCommentInputField.attr('placeholder', 'Post a reply...');
    domParentIdInputField.val(parentId);
  },

  this.favoritePost = function() {
    var parentId = parseInt($(this).attr('data-threadid'));
    PopcornMovie.sendMessageToServer('favorite_comment', parentId);

    return false;
  },

  this.flagPost = function() {
    var parentId = parseInt($(this).attr('data-threadid'));
    PopcornMovie.sendMessageToServer('flag_comment', parentId);

    return false;
  },

  this.toggleUserFollow = function() {
    var username = $(this).attr('data-username');
    PopcornMovie.sendMessageToServer('toggle_user_follow', username);

    return false;
  },

  this.submitCommentThread = function() {
    if (domCommentInputField.val().length > 0) {
      var formData = domPostCommentForm.serializeFormJSON();
      if (formData) {
        PopcornMovie.sendMessageToServer('post_comment', formData);
        videoPlayer.play();

        domPostCommentForm.removeClass('posting');
        domPostCommentForm.removeClass('replying');

        if (domSidebarDiv.hasClass('no-comments') && domCommentsList.not(':visible')) {
          PopcornMovie.dismissSidebarAndShowComments();
        }

        domCommentInputField.trigger('focusout');
      }
    }

    return false;
  },

  this.showUserSidebar = function() {
    var threadId = $(this).attr('data-threadid');
    var sidebarUrl = $(this).attr('href') + threadId + '/';

    $.ajax({
      url: sidebarUrl,
      type: 'GET',
      success: function(sidebarHtml) {
        domSidebarDiv.html(sidebarHtml).addClass('user-sidebar');

        domScrollbarWrapperDiv.hide('slide', { 'direction': 'left' }, 250, function() {
          domSidebarDiv.addClass('active').delay(100).show('slide', { direction: 'left' }, 250);
          $('#sidebar-content div.return button', domSidebarDiv).on('click', PopcornMovie.returnButtonClicked);
        });
      }
    });

    return false;
  },

  this.dismissSidebarAndShowComments = function() {
    domSidebarDiv.hide('slide', { direction: 'left' }, 250, function() {
      domScrollbarWrapperDiv.delay(100).show('slide', { direction: 'left' }, 250, function() {
        PopcornMovie.rebuildScrollbar();

        if (viewModel.selected_thread() > 0) {
          PopcornMovie.showThreadView();
        }
      });

      domSidebarDiv.removeClass('video-loaded');
      domSidebarDiv.removeClass('no-comments');
      domSidebarDiv.removeClass('user-sidebar');
      domSidebarDiv.html('');
    });
  },

  this.registrationLinkClicked = function() {
    var url = $(this).attr('href');
    var parent = $(this).parent().parent().parent();
    parent.removeClass('open');

    $.ajax({
      url: url,
      type: 'GET',
      data: { 'nextUrl': window.location.href + '&close=true' },
      dataType: 'html',
      success: function(returnHtml) {
        // Create a fake context for our returned HTML page.
        var fakeRoot = $('<html />');
        fakeRoot.append(returnHtml);

        // Get the relevant children from the returned page.
        var isLogin = $('#login', fakeRoot).length > 0;
        var returnWrapperSelector = isLogin ? 'login' : 'signup';

        var content = $('#' + returnWrapperSelector, fakeRoot);
        var newDiv = $('<div />').attr('id', returnWrapperSelector);
        var submitButton = $('button.primaryAction', content);
        var returnButton = $('<button class="return btn btn-small" type="button"><i class="icon-chevron-left"></i> Return</button>');
        var signupLink = $('a.signup-link', content);
        var loginLink = $('a.login-link', content);
        var forgotPasswordLink = $('a.forgot-password', content);
        var socialMediaButtons = $('a.socialaccount_provider', content);

        submitButton.addClass('btn-small');
        $(returnButton).insertBefore(submitButton);

        forgotPasswordLink.attr('target', '_blank');

        var returnContent = $('div.well', content).children();
        newDiv.html(returnContent);

        domScrollbarWrapperDiv.fadeOut('fast', function() {
          domSidebarDiv.html(newDiv);
          domSidebarDiv.addClass('active').show('slide', { direction: 'left' }, 500);

          returnButton.on('click', PopcornMovie.returnButtonClicked);
          submitButton.on('click', PopcornMovie.submitSidebarForm);
          if (isLogin) {
            signupLink.on('click', PopcornMovie.registrationLinkClicked);
            socialMediaButtons.on('click', function() {
                window.open($(this).attr('href'),'frameBuzzSSOLoginWindow','toolbar=0,resizable=1,status=0,width=640,height=528');
                return false;
            });
          }
          else {
            loginLink.on('click', PopcornMovie.registrationLinkClicked);
          }
        });
      }
    });

    return false;
  },

  this.submitSidebarForm = function() {
    var form = $(this).parent().parent();
    var submitUrl = form.attr('action');

    $.ajax({
        url: submitUrl,
        type: 'POST',
        data: form.serialize(),
        success: function(returnHtml) {
          PopcornMovie.resetVideo();
        }
    });

    return false;
  },

  this.returnButtonClicked = function() {
    if ($(this).hasClass('return-to-comments')) {
      PopcornMovie.dismissSidebarAndShowComments();
    }
    else {
      domSidebarDiv.hide('slide', { direction: 'left' }, 500, function() {
        domSidebarDiv.html('');
      });
    }

    return false;
  },

  this.resetVideo = function() {
    isResettingVideo = true;

    // Hide the video and comments divs, display the loading bar and select the same movie.
    $('#video-wrapper').fadeOut(500, function() {
      if ($('#video-content').length == 0) {
        $('#video').remove();
        $('#video-comments').remove();

        var newVideoContentDiv = $('<div id="video-content" class="clearfix" />');
        $('#video-wrapper').append(newVideoContentDiv).fadeIn(500).show();
      }

      socket.disconnect();
      PopcornMovie.selectMovie(commentsUrl);
    });
  },

  this.logoutUser = function() {
    var url = $(this).attr('href');
    var token = $(this).next('input:hidden').val();

    $.ajax({
      url: url,
      type: 'POST',
      data: { 'csrfmiddlewaretoken': token },
      success: function(returnHtml) {
        PopcornMovie.resetVideo();
      }
    });

    return false;
  }
};