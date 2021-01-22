(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalendarConfigurationTabDelegationController', CalendarConfigurationTabDelegationController);

  function CalendarConfigurationTabDelegationController(
    CAL_CALENDAR_SHARED_RIGHT
  ) {
    var self = this;

    self.$onInit = $onInit;
    self.onAddingUser = onAddingUser;
    self.changeBackdropZIndex = changeBackdropZIndex;

    ///////////

    function $onInit() {
      self.delegations = self.delegations || [];

      self.delegationTypes = [
        {
          value: CAL_CALENDAR_SHARED_RIGHT.SHAREE_ADMIN,
          name: CAL_CALENDAR_SHARED_RIGHT.SHAREE_ADMIN_LABEL_LONG
        }, {
          value: CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ_WRITE,
          name: CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ_WRITE_LABEL_LONG
        }, {
          value: CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ,
          name: CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ_LABEL_LONG
        }];

      self.ignoredUsers = [self.calendarOwner];
    }

    function onAddingUser($tags) {
      var canBeAdded = !!$tags._id && !self.delegations.some(function(delegation) {
        return $tags._id === delegation.user._id;
      });

      return canBeAdded;
    }

    function changeBackdropZIndex() {
      const mutationObserver = new MutationObserver((mutations, observer) => {
        mutations.forEach(mutation => {
          if (!mutation.addedNodes.length || mutation.addedNodes[0].nodeName.toLowerCase() !== 'md-backdrop') return;

          mutation.addedNodes[0].style = 'z-index: 1999;';

          observer.disconnect();
        });
      });

      mutationObserver.observe(document.body, { childList: true });
    }
  }
})(angular);
