angular.module('fbExceptions', []).factory('$exceptionHandler',
          ['$window', '$log',
  function ($window,   $log) {
    if ($window.Raven) {
        Raven.config('http://dcacaf02c69f45dda45b12a8c2287178@sentry.framebuzzlab.com/2', {
            whitelistUrls: [/framebuzz\.com/]
        }).install();
      return function (exception, cause) {
        $log.error.apply($log, arguments);
        Raven.captureException(exception);
      };
    } else {
      return function (exception, cause) {
        $log.error.apply($log, arguments);
      };
    }
  }
]);
