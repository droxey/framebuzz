$(function() {
    var selectedComment = null;

    var selectComment = function(element) {
        var parent = element.attr('data-parent'),
            timeDisplay = element.attr('data-time-display'),
            time = element.attr('data-time'),
            commenter = element.attr('data-commenter'),
            replyUrl = element.attr('data-reply-url'),
            replyClass = element.attr('data-class'),
            objectPk = element.attr('data-object-pk'),
            contentType = element.attr('data-content-type'),
            containerElement = element.parent().parent();

        selectedComment = element;
        $('li.list-item').removeClass('active');
        element.addClass('active');

        var form = containerElement.find('form');
        form.attr('action', replyUrl);
        form.addClass(replyClass);

        form.find('input.form-control').removeAttr('disabled');
        form.find('span.input-group-addon').html('<i class="fa fa-fw fa-comments"></i> <strong>[@' + timeDisplay + ']</strong>');
        form.find('input[name="parent"]').val(parent);
        form.find('input[name="time"]').val(time);
        form.find('input[name="comment"]').attr('placeholder', 'Begin typing a reply to ' + commenter + '...');
        form.find('input[name="object_pk"]').val(objectPk);
        form.find('input[name="content_type"]').val(contentType);
    };

    var clearCommentForm = function(form) {
        selectedComment = null;
        $('li.list-item').removeClass('active');

        form.attr('class', 'form-inline comment-reply-form');
        form.attr('action', '');
        form.find('input.form-control').attr('disabled', '');
        form.find('span.input-group-addon').html('<i class="fa fa-fw fa-comments"></i> <strong>[@00:00]</strong>');
        form.find('input[name="parent"]').val('');
        form.find('input[name="time"]').val('');
        form.find('input[name="comment"]').val('');
        form.find('input[name="comment"]').attr('placeholder', 'Select a comment to reply...');
        form.find('input[name="object_pk"]').val('');
        form.find('input[name="content_type"]').val('');
    };

    // Lazy load images.
    $('.lazy-load').lazyLoadXT();

    // Open video panel.
    $(document).on('click', 'div.video-panel', function(e) {
        var inline = $(this).parent().next('div.inline-modal');
        var url = $(this).attr('data-remote');
        var title = $(this).attr('data-title');
        var slug = $(this).attr('data-slug');

        $('.inline-modal.active').hide().removeClass('active');
        $('div.video-panel .title').removeClass('selected');
        $(this).find('.title').addClass('selected');

        inline.find('.video-title').html(title);

        inline.slideDown('fast', function() {
            $(document).scrollTo('#' + slug, 300, {
                onAfter: function() {
                    $.get(url, function(html) {
                        inline.addClass('active');
                        inline.find('.inner-content').html(html);

                        // Activate tabs.
                        $('#modal-tabs', inline).tab();
                        $('#modal-tabs a[href="#video-details"]', inline).tab('show');

                        $('.tooltips', inline).tooltip();

                        inline.find('.iframe-wrapper > iframe').removeClass('hidden');
                        inline.find('.iframe-wrapper > iframe').lazyLoadXT();
                    });
                }
            });
        });
    });

    // Close video panel.
    $(document).on('click', 'a.inline-close', function(e) {
        e.preventDefault();
        $(this).parent().parent().parent().parent().parent().hide('fast');
        return false;
    });

    // Mark as read button.
    $(document).on('click', 'button.btn-mark-read', function(e) {
        e.preventDefault();
        
        var parentElement = $(this).parent().parent().parent();
        var url = $(this).attr('data-url');

        $.get(url, function(html) {
            parentElement.html(html);
        });

        return false;
    });

    // Post reply button.
    $(document).on('click', 'button.btn-reply', function(e) {
        e.preventDefault();

        var parentElement = $(this).parent().parent().parent();
        selectComment(parentElement);

        return false;
    });

    // Remove comment button.
    $(document).on('click', 'button.btn-delete', function(e) {
        e.preventDefault();

        var parentElement = $(this).parent().parent().parent();
        var url = $(this).attr('data-url');

        $.get(url, function(html) {
            parentElement.remove();
        });

        return false;
    });

    // Click comment action.
    $(document).on('click', 'li.list-item', function(e) {
        selectComment($(this));
    });

    $(document).on('submit', 'form.comment-reply-form', function(e) {
        e.preventDefault();

        var form = $(this),
            formData = $(this).serialize(),
            url = $(this).attr('action');

        $.post(url, formData, function(html) {
            selectedComment.html(html);
            clearCommentForm(form);
        });

        return false;
    });

    // Clear form button.
    $(document).on('click', 'button.btn-clear-form', function(e) {
        e.preventDefault();
        
        var form = $(this).parent().parent().parent();
        clearCommentForm(form);

        return false;
    });
});