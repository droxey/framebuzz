$.fn.extend({
    animateCss: function(animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
        });
    }
});

$(function() {
    var videoUrl = null,
        fbzPlayer = $('iframe.fbzplayer'),
        browserSupportsAutoCopy = document.queryCommandSupported('copy'),
        submitButton = $('#btn-upload-video'),
        titleField = $('#id_title');

    // Basic line clamping.
    var clampLines = function(selector) {
        selector.dotdotdot({
            watch: true,
            height: '50px',
            callback: function(isTruncated, original) {
                $(selector).addClass('complete');
            }
        });
    };

    clampLines($('div.video-description p'));
    $(document).on('click', 'div.video-description', function() {
        var container = $(this),
            p = container.find('p'),
            item = container.parent().find('div.item'),
            isClamped = !container.parent().hasClass('expanded'),
            text = isClamped ? p.attr('data-fulltext') : p.attr('data-clamptext');

        container.css({
            'opacity': 0
        });
        p.trigger("destroy");

        if (isClamped) {
            // Store the original value if we haven't already.
            if (p.attr('data-clamptext') === undefined) {
                p.attr('data-clamptext', p.text());
                p.attr('data-height', (p.height() + 24) + 'px');
            }

            item.css({
                'margin-bottom': p.attr('data-height')
            });
        } else {
            clampLines(p);
            item.css({
                'margin-bottom': 0
            });
        }

        container.css({
            'opacity': 1
        });
        container.parent().toggleClass('expanded');
        p.text(text);


    });

    // For browsers that don't support auto-copy, just
    // show the textbox.
    if (!browserSupportsAutoCopy) {
        $('textarea.embed-code').show();
        $('a.copy-embed').hide();
        $(document).on('focus', 'textarea.embed-code', function() {
            $this = $(this);
            $this.select();
            window.setTimeout(function() {
                $this.select();
                $.growl.notice({
                    message: "Embed tag selected. Hit ⌘+C to copy."
                });
            }, 1);
            // Work around WebKit's little problem
            $this.mouseup(function() {
                // Prevent further mouseup intervention
                $this.unbind("mouseup");
                return false;
            });
        });
    }

    // Set up auto-copy for video embed codes.
    var clipboard = new Clipboard('a.copy-embed', {
        text: function(trigger) {
            var element = $(trigger);
            var textarea = element.next('textarea');
            return textarea.val();
        }
    });

    clipboard.on('success', function(e) {
        $.growl.notice({
            message: "Embed tag copied to clipboard."
        });
    });

    // Handle video pagination.
    $('div.pagination-page').on('click', 'a.page-link', function() {
        var pageContainer = $('div.pagination-page');
        var pageUrl = $(this).attr('href');
        var descContainer = $('div.video-description');

        // Hide the video description container and destroy it so we can rebuild.
        descContainer.addClass('hide');
        $('p', descContainer).trigger("destroy");

        $.get(pageUrl, function(pageHtml) {
            pageContainer.fadeOut('fast', function() {
                pageContainer.html(pageHtml);
                // Re-clamp new page lines.
                clampLines($('div.video-description p'));
                pageContainer.fadeIn('fast');
            });
        });

        return false;
    });

    // Launches the Tumblr OAuth popup.
    $(document).on('click', 'a.tumblr-login-link', function(e) {
        var url = $(this).attr('href');
        var newWindow = window.open(url, 'frameBuzzSSOLoginWindow', 'toolbar=0,resizable=0,status=0,width=640,height=528');
        if (window.focus) {
            newWindow.focus();
        }
        return false;
    });

    // Disable upload form submit button after first submit event.
    $(document).on('submit', '#upload-video-form', function(e) {
        submitButton.val('Uploading...');
        submitButton.attr('disabled', '');
        $.growl.notice({
            message: "Video sent to processing!<br>It will be available below shortly."
        });
    });

    // Async submit selected video to Tumblr.
    $(document).on('click', 'a.post-on-tumblr', function(e) {
        e.preventDefault();

        var url = $(this).attr('href');
        $.get(url, function(responseCode) {
            if (responseCode == '200') {
                $.growl.notice({
                    message: "Video posted to Tumblr!"
                });
            }
        });
        return false;
    });

    // When the user chooses to play a video, save the url and then
    // pop up the player in a modal dialog.
    $(document).on('click', 'a.play-video', function() {
        videoUrl = $(this).attr('data-video-url');
    });

    // When the user chooses to edit a video description.
    $(document).on('click', 'a.edit-video', function() {
        // Hide any existing edit containers.
        $('a.btn-cancel-edit').trigger('click');

        var link = $(this),
            url = link.attr('href'),
            slug = link.attr('data-slug'),
            editContainer = $('#' + slug),
            itemPosition = link.closest('div.video').position();

        $.get(url, function(htmlResponse) {
            editContainer.html(htmlResponse);
            editContainer.css({ left: itemPosition.left, top: itemPosition.top });
            editContainer.addClass('loaded');
        });

        return false;
    });

    // Grabs a csrfmiddlewaretoken and throws it in the headers.
    var getCookie = function(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };

    var csrftoken = getCookie('csrftoken');
    var csrfSafeMethod = function(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    };

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    // Handle edit form submission data.
    $('body').on('submit', '.video-edit-form', function(e) {
        var form = $(this),
            url = form.attr('action'),
            data = form.serialize(),
            slug = form.attr('data-slug'),
            videoContainer = $('#' + slug).next('div.video');

        $.post(url, data, function(htmlResponse) {
            videoContainer.html(htmlResponse);
            clampLines($('div.video-description p', videoContainer));

            $.growl.notice({
                message: "Video updated!"
            });

            // Trigger the Cancel button's click event to dismiss
            // the edit dialog.
            $('a.btn-cancel-edit', form).trigger('click');
        });

        return false;
    });

    // Cancel a video edit.
    $(document).on('click', 'a.btn-cancel-edit', function() {
        var slug = $(this).attr('data-slug'),
            obj = $('#' + slug);
        obj.html('');
        obj.removeClass('loaded');
        return false;
    });

    // Deletes a video you uploaded.
    $(document).on('click', 'a.btn-delete-video', function() {
        var link = $(this),
            url = link.attr('href'),
            slug = link.attr('data-slug'),
            obj = $('#' + slug),
            nextObj = obj.next('div.video');

        $.get(url, function(httpResponse) {
            obj.remove();
            nextObj.remove();
            $.growl.notice({
                message: "Video deleted."
            });
        });

        return false;
    });

    // Request our player template when the modal dialog opens.
    $(document).on('opened', '.remodal', function() {
        fbzPlayer.attr('src', videoUrl);
    });

    // Tear down the player template when the modal dialog closes.
    $(document).on('closing', '.remodal', function() {
        fbzPlayer.removeAttr('src');
        videoUrl = null;
    });
});


// Callback that gets fired when a video is fully uploaded.
// Wired up in tumblr/forms.py
var fileUploadComplete = function(event) {
    // Enable the submit button once a video is uploaded.
    submitButton.removeAttr('disabled');

    // If video title is still empty after upload, give it a default.
    if (titleField.val().length == 0 && event.fpfile !== undefined) {
        titleField.val(event.fpfile.filename);
    }
};

// Callback that gets fired when a video removed from the uploader.
var deleteButtonClicked = function() {
    titleField.val('');
    submitButton.val('Create framebuzz video');
    submitButton.attr('disabled', '');
};
