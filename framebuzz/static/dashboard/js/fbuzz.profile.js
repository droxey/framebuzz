function FramebuzzProfile(args) {
    //code
}

FramebuzzProfile.prototype.useGeolocation = function(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    
    var timeStamp = Math.round(new Date().getTime() / 1000);
    var timeZoneQueryUrl = 'https://maps.googleapis.com/maps/api/timezone/json?sensor=false&location='                             + latitude + ',' + longitude + '&timestamp=' + timeStamp;
    
    var defaultOption = $("#id_time_zone option").filter(function() {
        return $(this).text() == 'America/Chicago';
    });
    
    // Fetch timezone from Google TimeZone API.
    $.getJSON(timeZoneQueryUrl, function(timeZoneData) {
        var optionToSelect = $("#id_time_zone option").filter(function() {
            return $(this).text() == timeZoneData.timeZoneId;
    });

        if (optionToSelect === null) {
            optionToSelect = defaultOption;
        }
        
        //$('#id_time_zone option:selected').removeAttr('selected');
        optionToSelect.attr('selected', 'selected');
        optionToSelect.parent().focus();
    });
}

FramebuzzProfile.prototype.onGeolocationError = function(error) {
     defaultOption.attr('selected', 'selected');
     defaultOption.parent().focus();
    $('#id_bio').focus();
}