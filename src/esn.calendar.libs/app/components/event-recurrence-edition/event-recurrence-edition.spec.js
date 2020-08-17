'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The event-recurrence-edition component', function() {

  var esnI18nService, calMoment;
  var calNow, self;

  beforeEach(function() {

    esnI18nService = {
      getLocale: sinon.stub().returns('en'),
      translate: sinon.stub().returns({toString: function() {return '';}})
    };

    angular.mock.module('esn.calendar.libs', function($provide) {
      $provide.value('esnI18nService', esnI18nService);
    });

    angular.mock.module('esn.datetime', function($provide) {
      $provide.factory('esnDatePickerDirective', function() {
        return [];
      });
    })

    angular.mock.inject(function(_calMoment_) {
      calMoment = _calMoment_;
    });

    calNow = calMoment();
  });

  beforeEach(inject(['$compile', '$rootScope', function($c, $r) {
    self = this;
    this.$compile = $c;
    this.$scope = $r.$new();

    this.$scope.event = {
      getModifiedMaster: function() {
        return $q.when(this);
      },
      isInstance: function() {
        return false;
      }
    };

    this.$scope.canModifyEventRecurrence = false;

    this.initDirective = function(scope) {
      var html = '<event-recurrence-edition event="event" can-modify-event-recurrence="canModifyEventRecurrence"/>';
      var element = self.$compile(html)(scope);

      return new Promise(function(resolve) {
        setTimeout(function() {
          scope.$digest();
          self.eleScope = element.isolateScope();
          return resolve(element);
        }, 0);
      });
    };
  }]));

  describe('activate function', function() {
    it('should set days correctly from input event', function(done) {
      this.$scope.event.rrule = {
        freq: undefined,
        interval: null,
        byday: ['SA', 'SU']
      };
      this.initDirective(this.$scope).then(function(){
        expect(self.eleScope.vm.days).to.shallowDeepEqual([
          {value: 'MO', selected: false},
          {value: 'TU', selected: false},
          {value: 'WE', selected: false},
          {value: 'TH', selected: false},
          {value: 'FR', selected: false},
          {value: 'SA', selected: true},
          {value: 'SU', selected: true}
        ]);
      }).then(done).catch(err => done(err || new Error('should resolve')));
    });
  });

  describe('scope.toggleWeekdays', function() {
    it('should splice the weekday and sort the array', function(done) {
      this.$scope.event.rrule = {
        freq: undefined,
        interval: null
      };
      this.initDirective(this.$scope).then(function() {
        self.eleScope.vm.event.rrule.byday = ['SU', 'WE', 'TU', 'MO'];
        self.eleScope.vm.toggleWeekdays('WE');
        expect(self.eleScope.vm.event.rrule.byday).to.deep.equal(['MO', 'TU', 'SU']);
      }).then(done).catch(err => done(err || new Error('should resolve')));
    });

    it('should push the weekday and sort the array', function(done) {
      this.$scope.event.rrule = {
        freq: undefined,
        interval: null
      };
      this.initDirective(this.$scope).then(function() {
        self.eleScope.vm.event.rrule.byday = ['SU', 'WE', 'TU', 'MO'];
        self.eleScope.vm.toggleWeekdays('FR');
        expect(self.eleScope.vm.event.rrule.byday).to.deep.equal(['MO', 'TU', 'WE', 'FR', 'SU']);
      }).then(done).catch(err => done(err || new Error('should resolve')));
    });
  });

  describe('at end date min value', function() {
    it('should be today', function(done) {
      this.$scope.event.start = calMoment('2017-09-11 09:30');
      this.$scope.event.rrule = {
        freq: 'WEEKLY'
      };
      this.initDirective(this.$scope).then(function() {
        var calMinDateAsString = self.eleScope.vm.getMinDate();

        expect(calMinDateAsString).to.be.equal(calNow.format('YYYY-MM-DD'));
      }).then(done).catch(err => done(err || new Error('should resolve')));
    });

    it('should be the event start date', function(done) {
      this.$scope.event.start = calMoment().add(7, 'days');
      this.$scope.event.rrule = {
        freq: 'WEEKLY'
      };
      this.initDirective(this.$scope).then(function() {
        var calMinDateAsString = self.eleScope.vm.getMinDate();

        expect(calMinDateAsString).to.be.equal(self.$scope.event.start.format('YYYY-MM-DD'));
      }).then(done).catch(err => done(err || new Error('should resolve')));
    });
  });

  describe('scope.selectEndRadioButton', function() {
    it('should set the correct radio button to checked', function(done) {
      this.$scope.event.rrule = {
        freq: 'WEEKLY'
      };
      this.initDirective(this.$scope).then(function(element) {
        self.eleScope.selectEndRadioButton(2);
        var radio = angular.element(element).find('input[name="inlineRadioEndOptions"]')[2];
  
        expect(radio.checked).to.be.true;
      }).then(done)
      .catch(done);
    });

    it('should set until to undefined if index is 1', function(done) {
      this.$scope.event.rrule = {
        freq: 'WEEKLY',
        until: 'UNTIL'
      };
      this.initDirective(this.$scope).then(function(){
        self.eleScope.selectEndRadioButton(1);
        expect(self.eleScope.vm.event.rrule.until).to.be.undefined;
      }).then(done).catch(done);
    });

    it('should set count to undefined if index is 2', function(done) {
      this.$scope.event.rrule = {
        freq: 'WEEKLY',
        count: 10
      };
      this.initDirective(this.$scope).then(function() {
        self.eleScope.selectEndRadioButton(2);
        expect(self.eleScope.vm.event.rrule.count).to.be.undefined;
      }).then(done).catch(err => done(err || new Error('should resolve')));
    });
  });

  describe('scope.setRRULE', function() {
    beforeEach(function() {
      this.initDirective(this.$scope);
    });

    it('should set rrule to undefined if scope.freq equal undefined', function() {
      this.eleScope.vm.freq = undefined;
      this.eleScope.vm.setRRULE();
      expect(this.eleScope.vm.event.rrule).to.be.undefined;
    });

    it('should set rrule if scope is not undefined', function() {
      this.eleScope.vm.freq = 'WEEKLY';
      this.eleScope.vm.setRRULE();
      expect(this.eleScope.vm.event.rrule.freq).to.be.equal('WEEKLY');
    });

    it('should set the interval to one if it was not previously defined', function() {
      this.eleScope.vm.freq = 'WEEKLY';
      this.eleScope.vm.setRRULE();
      expect(this.eleScope.vm.event.rrule.interval).to.be.equal(1);
      this.eleScope.vm.event.rrule.interval = undefined;
      this.eleScope.vm.setRRULE();
      expect(this.eleScope.vm.event.rrule.interval).to.be.equal(1);
    });

    it('should keep previous interval if it was defined and more than 0', function() {
      this.eleScope.vm.event.rrule = {freq: 'WEEKLY', interval: 42};
      this.eleScope.vm.freq = 'YEARLY';
      this.eleScope.vm.setRRULE();
      expect(this.eleScope.vm.event.rrule).to.be.deep.equals({freq: 'YEARLY', interval: 42});
      this.eleScope.vm.event.rrule.interval = 0;
      this.eleScope.vm.freq = 'WEEKLY';
      this.eleScope.vm.setRRULE();
      expect(this.eleScope.vm.event.rrule).to.be.deep.equals({freq: 'WEEKLY', interval: 1});
    });
  });

  describe('The setDefaultUntilDate function', function() {
    var dateCheck;
    var dateCurrent;

    beforeEach(function() {
      this.initDirective(this.$scope);
      dateCurrent = new Date();
      dateCheck = new Date();

      this.eleScope.vm.event = {
        rrule: {}
      };
    });

    it('should set until is next day if the frequency is "DAILY"', function() {
      dateCheck.setDate(dateCurrent.getDate() + 1);
      this.eleScope.vm.setDefaultUntilDate('DAILY');
      expect(this.eleScope.vm.event.rrule.count).to.be.undefined;
      expect(this.eleScope.vm.event.rrule.until.getDate()).to.be.equals(dateCheck.getDate());
    });

    it('should set until is next week if the frequency is "WEEKLY"', function() {
      dateCheck.setDate(dateCurrent.getDate() + 7);
      this.eleScope.vm.setDefaultUntilDate('WEEKLY');
      expect(this.eleScope.vm.event.rrule.count).to.be.undefined;
      expect(this.eleScope.vm.event.rrule.until.getDate()).to.be.equals(dateCheck.getDate());
    });

    it('should set until is next month if the frequency is "MONTHLY"', function() {
      dateCheck.setMonth(dateCurrent.getMonth() + 1);
      this.eleScope.vm.setDefaultUntilDate('MONTHLY');
      expect(this.eleScope.vm.event.rrule.count).to.be.undefined;
      expect(this.eleScope.vm.event.rrule.until.getDate()).to.be.equals(dateCheck.getDate());
    });

    it('should set until is next year if the frequency is "YEARLY"', function() {
      dateCheck.setFullYear(dateCurrent.getFullYear() + 1);
      this.eleScope.vm.setDefaultUntilDate('YEARLY');
      expect(this.eleScope.vm.event.rrule.count).to.be.undefined;
      expect(this.eleScope.vm.event.rrule.until.getDate()).to.be.equals(dateCheck.getDate());
    });
  });
});
