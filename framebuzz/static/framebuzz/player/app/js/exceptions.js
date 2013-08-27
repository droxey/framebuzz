angular.module('fbExceptions', []).factory('$exceptionHandler',
          ['$window', '$log',
  function ($window,   $log) {
    if ($window.Raven) {
      Raven.config('https://b14b841441f348b2bd29aa34c79948fb@app.getsentry.com/11190').install();
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