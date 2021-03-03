require('../../services/event-service');
require('../../services/event-utils.js');
require('../../services/calendar-service');

'use strict';

angular.module('esn.calendar.libs')
  .controller('CalPartstatButtonsController', CalPartstatButtonsController);

function CalPartstatButtonsController($scope, $attrs, session, calEventService, calEventUtils, calendarService) {
  var self = this;

  self.isCurrentPartstat = isCurrentPartstat;
  self.changeParticipation = changeParticipation;

  $scope.$watch(function() { return self.event; }, function() {
    self.canSuggestChanges = calEventUtils.canSuggestChanges(self.event, session.user);

    var attendee = calEventUtils.getUserAttendee(self.event);

    if (attendee) {
      self.currentPartstat = attendee.partstat;

      return;
    }

    calendarService.getCalendar(self.event.calendarHomeId, self.event.calendarId).then(function(calendar) {
      return calendar.getOwner();
    }).then(function(owner) {
      attendee = calEventUtils.getUserAttendee(self.event, owner);
      self.currentPartstat = attendee.partstat;
    });
  });

  function changeParticipation(partstat) {
    self.currentPartstat = partstat;

    if ($attrs.changePartstat) {
      self.changePartstat({ partstat: partstat });
    } else {
      _changeParticipation(partstat);
    }
  }

  function _changeParticipation(partstat) {
    var attendee = calEventUtils.getUserAttendee(self.event);

    if (!attendee || attendee.partstat === partstat) {
      return;
    }

    calEventService.changeParticipation(self.event.path, self.event, [attendee.email], partstat, self.event.etag)
      .then(onSuccess, onError);

    function onSuccess(result) {
      self.onParticipationChangeSuccess && self.onParticipationChangeSuccess({ event: result });
    }

    function onError(err) {
      self.onParticipationChangeFailure && self.onParticipationChangeFailure({ err: err });
    }
  }

  function isCurrentPartstat(partstat) {
    return self.currentPartstat === partstat;
  }
}
