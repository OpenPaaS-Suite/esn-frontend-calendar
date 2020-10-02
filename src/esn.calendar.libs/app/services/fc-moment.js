const moment = require('moment');

require('moment/locale/fr');
require('moment/locale/en-gb');
require('moment/locale/vi');
require('moment/locale/ru');
require('moment/locale/zh-cn');

require('../app.constants');
require('./event-utils.js');

(function(angular) {
  'use strict';

  /**
   * It is worth knowing that fullcalendar leverages MomentJS for most date-related operations.
   * Indeed, it wraps every moment object into a fc-moment one.
   * Using the terminology of fullcalendar, an allday event is represented as an ambiguously-timed
   * moment object. That is, it is represented as a moment object that has no time.
   * However, an ambiguously-timed moment has a time zone which is set by default to UTC.
   * Even if we set the fullcalendar's timezone option to local, allday events are always
   * returned as UTC. See {https://github.com/fullcalendar/fullcalendar/issues/2477}
   */
  angular.module('esn.calMoment', ['angularMoment'])
    .factory('calMoment', calMoment);

  function calMoment($window, ICAL, calEventUtils, esnDatetimeService) {
    function _calMoment(time) {
      if (time && (time instanceof ICAL.Time)) {
        var m = $window.$.fullCalendar.moment(time.toJSDate());

        if (time.isDate) {
          m = esnDatetimeService.updateObjectToUserTimeZone(m.local(), {
            _ambigTime: true
          });
        }

        return m;
      }

      return $window.$.fullCalendar.moment.apply(this, arguments);
    }

    angular.extend(_calMoment, moment);

    return _calMoment;
  }

})(angular);
