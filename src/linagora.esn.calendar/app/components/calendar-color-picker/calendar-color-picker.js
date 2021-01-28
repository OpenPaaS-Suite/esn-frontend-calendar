(function(angular) {
  'use strict';

  angular.module('esn.calendar')
    .directive('calendarColorPickerToggler', calendarColorPickerToggler);

  function calendarColorPickerToggler() {
    var directive = {
      restrict: 'A',
      scope: {
        color: '='
      },
      link: link,
      controller: CalendarColorPickerTogglerController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    ////////////

    function link(scope, element, attrs, vm) { // eslint-disable-line
      element.bind('click', function(event) {
        event.stopImmediatePropagation();
        event.preventDefault();
        vm.openModal();
      });
    }
  }

  function CalendarColorPickerTogglerController($modal, CAL_LIST_OF_COLORS) {
    var self = this;

    self.CAL_LIST_OF_COLORS = CAL_LIST_OF_COLORS;
    self.colorKeys = Object.keys(CAL_LIST_OF_COLORS);
    self.set = set;
    self.select = select;
    self.isSelected = isSelected;
    self.openModal = openModal;

    ////////////

    function set() {
      if (self.selected) {
        self.color = self.selected in self.CAL_LIST_OF_COLORS ? self.CAL_LIST_OF_COLORS[self.selected] : self.selected;
      }
    }

    function select(color) {
      self.selected = color;
    }

    function isSelected(color) {
      return self.selected === color;
    }

    function openModal() {
      var colorHex = self.color.toUpperCase();

      angular.forEach(CAL_LIST_OF_COLORS, function(value, key) {
        if (colorHex === value) {
          self.selected = key;
        }
      });

      $modal({
        template: require('./calendar-color-picker.pug'),
        controller: /* @ngInject */ function($scope) {
          angular.extend($scope, self);
        },
        placement: 'center'
      });
    }
  }
})(angular);
