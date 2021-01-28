const _ = require('lodash');

require('./path-parser.service.js');

(function(angular) {
  'use strict';

  angular.module('esn.calendar.libs').factory('calCalDAVURLService', calCalDAVURLService);

  function calCalDAVURLService($log, $window, esnUserConfigurationService, calPathParser) {
    var DAVSERVER_CONFIGURATION = 'davserver';

    return {
      getCalendarURL: getCalendarURL,
      getFrontendURL: getFrontendURL
    };

    function getCalendarURL(calendar) {
      return getFrontendURL().then(function(url) {
        return [url, sanitizeCalendarHref(calendar)]
          .map(function(fragment) {
            return fragment.replace(/^\/|\/$/g, '');
          })
          .join('/');
      });
    }

    function sanitizeCalendarHref(calendar) {
      var parsedPath = calPathParser.parseCalendarPath(calendar.href);

      return ['calendars', parsedPath.calendarHomeId, parsedPath.calendarId].join('/');
    }

    function getFrontendURL() {
      return esnUserConfigurationService.get([DAVSERVER_CONFIGURATION], 'core')
        .then(function(configurations) {
          if (!configurations || !configurations.length) {
            $log.debug('No valid configurations found for davserver');

            return getDefaultURL();
          }

          var davserver = _.find(configurations, { name: DAVSERVER_CONFIGURATION });

          if (!davserver) {
            $log.debug('davserver configuration is not set');

            return getDefaultURL();
          }

          return davserver.value && davserver.value.frontend && davserver.value.frontend.url ?
            removeTrailingSlash(davserver.value.frontend.url) :
            getDefaultURL();
        }, function(err) {
          $log.debug('Can not get davserver from configuration', err);

          return getDefaultURL();
        });
    }

    function getDefaultURL() {
      return $window.location.origin;
    }

    function removeTrailingSlash(url) {
      return url.replace(/\/$/, '');
    }

  }
})(angular);
