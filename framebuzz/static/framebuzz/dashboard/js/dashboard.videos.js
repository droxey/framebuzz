$(function() {
    var selectedComment = null;

    var selectComment = function(element) {
        var containerElement = element.parent().parent();

        element.addClass('active');
        selectedComment = element;

        $('table.table-striped tbody tr').removeClass('active', 'open');
        $('table.table-striped tbody tr.form-row').hide();

        element.next('tr.form-row').show().addClass('open');

        var form = containerElement.find('form');
        form.find('input[name="comment"]').focus();
    };

    var clearCommentForm = function(form) {
        $('tr.open').hide();

        selectedComment = null;
        $('tr.open').removeClass('open');
        $('tr.active').removeClass('active');

        form.find('input[name="comment"]').val('');
    };

    // Lazy load images.
    $('.lazy-load').lazyLoadXT();

    // Delete video button.
    $(document).on('click', 'a.delete-video', function(e) {
        e.preventDefault();

        var url = $(this).attr('href');

        bootbox.confirm("Are you sure you want to remove this video?", function(result) {
            if (result) {
                $.get(url, function(response) {
                    if (response === 'ok') {
                        window.location.reload();
                    }
                });
            }
        });

        return false;
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

        var button = $(this);
        var parentElement = button.parent().parent();
        var url = button.attr('data-url');

        bootbox.confirm("Are you sure you want to remove this comment?", function(result) {
            if (result) {
                parentElement.hide("blind", { direction: "up" }, "fast", function() {
                    $.get(url, function(html) {
                        parentElement.remove();
                    });
                });
            }
        });

        return false;
    });

    // Click comment action.
    $(document).on('click', 'table.table-comments tbody tr:not(".form-row")', function(e) {
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

        var form = $(this).parent().parent();
        clearCommentForm(form);

        return false;
    });
});
