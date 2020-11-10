'use strict';

require('../../services/fc-moment.js');
require('../../services/moment-date.service.js');

angular.module('esn.calendar.libs')
  .controller('calEventDateSuggestionController', calEventDateSuggestionController);

function calEventDateSuggestionController(esnI18nDateFormatService, calMoment, calMomentDateService, esnDatetimeService, esnI18nService, detectUtils) {
  var self = this;

  self.$onInit = $onInit;
  self.dateOnBlurFn = dateOnBlurFn;
  self.getMinDate = getMinDate;
  self.setEventDates = setEventDates;
  self.onStartDateChange = onStartDateChange;
  self.onEndDateChange = onEndDateChange;
  self.onStartDateTimeChange = onStartDateTimeChange;
  self.onEndDateTimeChange = onEndDateTimeChange;

  function $onInit() {
    self.dateFormat = esnI18nDateFormatService.getLongDateFormat();
    self.full24HoursDay = self.event.full24HoursDay;
    self.locale = esnI18nService.getLocale();
    self.timeFormat = esnDatetimeService.getTimeFormat();
    self.isMobile = detectUtils.isMobile();
    // on load, ensure that duration between start and end is stored inside editedEvent
    self.onEndDateChange();
    _initMobileTimeInputs();
  }

  function dateOnBlurFn() {
    //this is used to re-update views from the model in case the view is cleared
    self.event.start = self.event.start.clone();
    self.event.end = self.event.end.clone();
  }

  function getMinDate() {
    if (self.full24HoursDay) {
      return calMoment(self.event.start).subtract(1, 'days').format('YYYY-MM-DD');
    }

    return null;
  }

  function setEventDates() {
    var start, end;

    if (self.full24HoursDay) {
      self.previousStart = self.event.start.clone();
      self.previousEnd = self.event.end.clone();

      start = self.event.start.stripTime();
      end = self.event.end.stripTime().add(1, 'days');
    } else if (self.previousStart && self.previousEnd) {
      start = self.previousStart;
      end = self.previousEnd;
    } else {
      var nextHour = calMoment().startOf('hour').add(1, 'hour').hour();

      // We need to set back the utc flag to false here.
      // See Ambiguously-timed Moments http://fullcalendar.io/docs/utilities/Moment/
      start = self.event.start.local().startOf('day').hour(nextHour);
      end = self.event.end.local().startOf('day').subtract(1, 'day').hour(nextHour).add(1, 'hours');
    }
    self.event.start = start;
    self.event.end = end;
    self.diff = self.event.end.diff(self.event.start);
  }

  function onStartDateChange() {
    if (!self.event.start || !self.event.start.isValid()) {
      return;
    }
    self.event.end = calMoment(self.event.start).add(self.diff / 1000, 'seconds');
  }

  function onEndDateChange() {
    if (!self.event.end || !self.event.end.isValid()) {
      return;
    }
    if (self.event.end.isBefore(self.event.start)) {
      self.event.end = calMoment(self.event.start).add(1, 'hours');
    }
    self.diff = self.event.end.diff(self.event.start);
  }

  // Only fired when using the native mobile picker.
  function onStartDateTimeChange() {
    self.event.start.set(calMomentDateService.getDateComponents(self.startTime));

    self.onStartDateChange();
    // Update the input fields to display the new time ( in case of any internal change like offset ).
    _initMobileTimeInputs();
  }

  // Only fired when using the native mobile picker.
  function onEndDateTimeChange() {
    self.event.end.set(calMomentDateService.getDateComponents(self.endTime));

    self.onEndDateChange();
    // Update the input fields to display the new time ( in case of any internal change like offset ).
    _initMobileTimeInputs();
  }

  function _initMobileTimeInputs() {
    if (!self.event.start || !self.event.start.isValid() || !self.event.end || !self.event.end.isValid()) {
      return;
    }

    // Set the hours to avoid the timzone issues when converting a moment object to Date.
    self.startTime = calMomentDateService.momentToDate(self.event.start);
    self.endTime = calMomentDateService.momentToDate(self.event.end);
  }
}
