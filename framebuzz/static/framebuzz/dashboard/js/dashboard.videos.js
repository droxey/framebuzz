$(function() {
    var selectedComment = null;

    var selectComment = function(element) {
        var containerElement = element.parent().parent();

        element.addClass('active');
        selectedComment = element;

        $('table.table-striped tbody tr').removeClass('active');
        $('table.table-striped tbody tr.form-row').hide('slide', { 'direction': 'up' });;

        element.next('tr.form-row').show('slide', { 'direction': 'down' }, function() {        
            var form = containerElement.find('form');
            form.find('input[name="comment"]').focus();
        });

        // Update table.
        //$('.table tfoot tr td.time').html('<i class="fa fa-fw fa-comments"></i> <strong>[' + timeDisplay + ']' + '</strong>');
        //$('.table tfoot tr td.user').html('<strong>@' + commenter + '</strong>');
    };

    var clearCommentForm = function(form) {
        $('tr.active"').hide('slide', { 'direction': 'down' }, function() { 
            selectedComment = null;
            $('tr.active').removeClass('active');

            form.find('input[name="comment"]').val('');
            form.find('input[name="comment"]').attr('placeholder', 'Select a comment to reply...');
        });
    };

    // Lazy load images.
    $('.lazy-load').lazyLoadXT();

    // Open video panel.
    $(document).on('click', 'div.video-panel', function(e) {
        var inline = $(this).parent().next('div.inline-modal');
        var url = $(this).attr('data-remote');
        var title = $(this).attr('data-title');
        var slug = $(this).attr('data-slug');

        $('.inline-modal.active').find('div.inner-content').html('');

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
                    });
                }
            });
        });
    });

    // Close video panel.
    $(document).on('click', 'a.inline-close', function(e) {
        e.preventDefault();
        
        $(this).parent().parent().parent().parent().parent().hide('fast');

        var wrapperElement = $(this).parent().parent().parent().parent();
        wrapperElement.find('div.inner-content').html('');
       
        return false;
    });

    // Mark as read button.
    $(document).on('click', 'button.btn-mark-read', function(e) {
        e.preventDefault();
        
        var parentElement = $(this).parent().parent();
        console.log(parentElement);

        var url = $(this).attr('data-url');

        $.get(url, function(html) {
            parentElement.html(html);
        });

        return false;
    });

    // Post reply button.
    $(document).on('click', 'button.btn-reply', function(e) {
        e.preventDefault();

        var parentElement = $(this).parent().parent();
        selectComment(parentElement);

        return false;
    });

    // Remove comment button.
    $(document).on('click', 'button.btn-delete', function(e) {
        e.preventDefault();

        var parentElement = $(this).parent().parent();
        var url = $(this).attr('data-url');

        $.get(url, function(html) {
            parentElement.remove();
        });

        return false;
    });

    // Click comment action.
    $(document).on('click', 'table.table-striped tbody tr', function(e) {
        selectComment($(this));
    });

    // Submit reply form.
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
        
        var form = $(this).parent();
        clearCommentForm(form);

        return false;
    });
});