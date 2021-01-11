'use strict';

angular.module('esn.calendar')
  .controller('CalEventMessageEditionController', CalEventMessageEditionController);

function CalEventMessageEditionController(
  $scope,
  CalendarShell,
  calendarUtils,
  calEventService,
  calendarEventEmitter,
  esnI18nService,
  CAL_EVENT_FORM,
  calDefaultValue
) {

  var self = this;

  self.submit = submit;
  self.$onInit = $onInit;

  //////////

  function $onInit() {
    self.event = CalendarShell.fromIncompleteShell({
      start: calendarUtils.getNewStartDate(),
      end: calendarUtils.getNewEndDate()
    });
    self.restActive = false;
    self.CAL_EVENT_FORM = CAL_EVENT_FORM;
  }

  function emitPostedMessage(response) {
    if (response && self.activitystream) {
      calendarEventEmitter.activitystream.emitPostedMessage(
        response.headers('ESN-Message-Id'),
        self.activitystream.activity_stream.uuid
      );
    }
  }

  function resetEvent() {
    self.rows = 1;
    self.event = CalendarShell.fromIncompleteShell({
      start: calendarUtils.getNewStartDate(),
      end: calendarUtils.getNewEndDate(),
      diff: 1
    });
  }

  function submit() {
    if (!self.event.title || self.event.title.trim().length === 0) {
      self.event.title = CAL_EVENT_FORM.title.empty;
    }

    if (!self.activitystream.activity_stream || !self.activitystream.activity_stream.uuid) {
      $scope.displayError('You can not post to an unknown stream');

      return;
    }

    self.restActive = true;
    calEventService.createEvent({ calendarHomeId: self.calendarHomeId, id: calDefaultValue.get('calendarId') }, self.event, { graceperiod: false })
      .then(function(response) {
        emitPostedMessage(response);
        resetEvent();
        $scope.$parent.show('whatsup');
      })
      .catch(function(err) {
      // eslint-disable-next-line no-warning-comments
      // TODO: Write tests for this (https://github.com/OpenPaaS-Suite/esn-frontend-calendar/issues/46)
        calendarUtils.notifyErrorWithRefreshCalendarButton(
          err.statusText ? esnI18nService.translate('%s, Please refresh your calendar', { error: err.statusText }) :
            esnI18nService.translate('Event creation failed. Please refresh your calendar')
        );
      })
      .finally(function() {
        self.restActive = false;
      });
  }
}
