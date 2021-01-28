const _ = require('lodash');

(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalEventViewExternalUserController', CalEventViewExternalUserController);

  function CalEventViewExternalUserController($http, $rootScope, notificationFactory, esnI18nService, CAL_EVENTS) {
    var self = this;

    self.$onInit = $onInit;
    self.changeParticipation = changeParticipation;
    self.isExternal = true;
    function $onInit() {
      self.userAsAttendee = Object.create(self.externalAttendee);
      self.selectedTab = 'attendees';
      self.linksMapping = {
        ACCEPTED: self.links.yes,
        TENTATIVE: self.links.maybe,
        DECLINED: self.links.no
      };
      self.organizerAttendee = _.find(self.attendees.users, { email: self.event.organizer.email });
      self.usersAttendeesList = _.reject(self.attendees.users, { email: self.event.organizer.email });
    }

    function changeParticipation(partstat) {
      $rootScope.$emit(CAL_EVENTS.UPDATE_ACTION_EXCAL, self.linksMapping[partstat]);
      self.userAsAttendee.partstat = partstat;
      self.usersAttendeesList = self.usersAttendeesList.map(function(user) {
        if (user.email === self.externalAttendee.email) {
          user.partstat = partstat;
        }

        return user;
      });

      $http({ method: 'GET', url: self.linksMapping[partstat] }).then(function() {
        const participation = partstat.charAt(0).toUpperCase() + partstat.slice(1).toLowerCase();
        const translatedParticipation = esnI18nService.translate(participation);

        notificationFactory.weakInfo('Participation', esnI18nService.translate('Participation updated to:').toString().concat(translatedParticipation));
      });
    }
  }
})(angular);
