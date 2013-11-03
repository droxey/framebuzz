$(document).ready(function() {
    $.get('/accounts/login/', function(html) {
        $('#login-container').html(html);
    });
});