'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The calFriendlifyEndDate directive', function() {

  beforeEach(function() {
    angular.mock.module('esn.calMoment');
    angular.mock.module('esn.calendar');
  });

  beforeEach(inject(['$compile', '$rootScope', 'calMoment', function($c, $r, calMoment) {
    this.$compile = $c;
    this.$rootScope = $r;
    this.$scope = this.$rootScope.$new();
    this.calMoment = calMoment;

    this.initDirective = function(scope) {
      var html = '<input ng-model="event.end" data-is-all-day="event.allDay" cal-friendlify-end-date/>';
      var element = this.$compile(html)(scope);

      scope.$digest();

      return element;
    };
  }]));

  it('should have a first formatters that output the date -1 day if event is a allday', function() {
    this.$scope.event = {
      allDay: true,
      end: this.calMoment([2015, 6, 3])
    };

    var element = this.initDirective(this.$scope);
    var controller = element.controller('ngModel');

    expect(this.calMoment(controller.$viewValue).toISOString()).to.equal(this.calMoment('2015/07/02').toISOString());
  });

  it('should have a first formatters that do nothing if event is not allday', function() {
    this.$scope.event = {
      allDay: false
    };

    var element = this.initDirective(this.$scope);
    var formatter = element.controller('ngModel').$formatters[0];

    expect(formatter('2015/07/03')).to.equal('2015/07/03');
  });

  it('should have a last parsers that add 1 day if event is allday', function() {
    this.$scope.event = {
      allDay: true,
      end: this.calMoment('2015-07-03')
    };

    var element = this.initDirective(this.$scope);
    var parser = element.controller('ngModel').$parsers[0];

    expect(parser(this.calMoment([2015, 6, 3])).format('YYYY/MM/DD')).to.deep.equal(this.calMoment([2015, 6, 4]).format('YYYY/MM/DD'));
  });

  it('should have a last parsers that do nothing if event is not allday', function() {
    this.$scope.event = {
      allDay: false
    };
    var element = this.initDirective(this.$scope);
    var parser = element.controller('ngModel').$parsers[0];

    expect(parser(this.calMoment([2015, 6, 3])).format('YYYY/MM/DD')).to.deep.equal(this.calMoment([2015, 6, 3]).format('YYYY/MM/DD'));
  });

  it('when the view value change we should keep hour and minute of previous date', function() {
    var element = this.initDirective(this.$scope);
    var controller = element.controller('ngModel');

    controller.$dateValue = new Date(2019, 1, 20, 12, 30);
    controller.$viewValue = this.calMoment('2019-01-20T20:00');

    controller.$render();

    expect(this.calMoment(controller.$dateValue).format('YYYY-MM-DD HH:mm')).to.equals('2019-01-20 12:30');
  });
});
