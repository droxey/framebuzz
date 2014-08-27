angular.module('fbExceptions', []).factory('$exceptionHandler',
          ['$window', '$log',
  function ($window,   $log) {
    if ($window.Raven && SOCK.raven_dsn.length > 0) {
        Raven.config(SOCK.raven_dsn, {}).install();
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
