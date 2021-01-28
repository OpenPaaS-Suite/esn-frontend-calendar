'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The calEventDateEditionController', function() {
  var $controller, calMoment, calEventUtils, esnI18nDateFormatService, esnDatetimeService;
  var startTestMoment, endTestMoment;
  var longDateFormatMock = 'YYYY-MM-DD';

  beforeEach(function() {
    esnI18nDateFormatService = {
      getLongDateFormat: sinon.stub().returns(longDateFormatMock)
    };

    esnDatetimeService = {
      setAmbigTime: function(src, ambigTime) {
        src._ambigTime = !!ambigTime;

        return src;
      },
      getTimeFormat: () => 'H:mm'
    };

    angular.mock.module('esn.calendar.libs', function($provide) {
      $provide.value('esnI18nDateFormatService', esnI18nDateFormatService);
      $provide.value('esnDatetimeService', esnDatetimeService);
    });

    inject(function(_$controller_, _calMoment_, _calEventUtils_) {
      $controller = _$controller_;
      calMoment = _calMoment_;
      calEventUtils = _calEventUtils_;
    });

    startTestMoment = calMoment('2013-02-08 09:30:00Z').utc();
    endTestMoment = calMoment('2013-02-08 10:00:00Z').utc();
  });

  function initController(bindings) {
    var controller = $controller('calEventDateEditionController', null, bindings);

    controller.$onInit();

    return controller;
  }

  function checkEventDateTimeSync(ctrl) {
    if (ctrl.full24HoursDay) {
      expect(ctrl.start.isSame(ctrl.event.start, 'day')).to.be.true;
      expect(ctrl.end.clone().add(1, 'days').isSame(ctrl.event.end, 'day')).to.be.true;

      return;
    }

    expect(ctrl.start.isSame(ctrl.event.start)).to.be.true;
    expect(ctrl.end.isSame(ctrl.event.end)).to.be.true;
  }

  describe('The $onInit function', function() {
    it('should get long date format from esnI18nDateFormatService', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        }
      };
      var ctrl = initController(bindings);

      expect(esnI18nDateFormatService.getLongDateFormat).to.have.been.calledOnce;
      expect(ctrl.dateFormat).to.equal(longDateFormatMock);
    });

    it('should set correct default values for optional bindings', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        }
      };
      var ctrl = initController(bindings);

      expect(ctrl.disabled).to.be.false;
    });

    it('should set full24HoursDay value of controller to that of the passed-in event', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone(),
          full24HoursDay: true
        }
      };
      var ctrl = initController(bindings);

      expect(ctrl.full24HoursDay).to.equal(bindings.event.full24HoursDay);
    });

    it('should not modify start and end input values for non-all-day events', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        }
      };
      var ctrl = initController(bindings);

      expect(ctrl.start.isSame(bindings.event.start)).to.be.true;
      expect(ctrl.end.isSame(bindings.event.end)).to.be.true;
    });

    it('should subtract end input value by one day for all-day events', function() {
      var bindings = {
        event: {
          start: calEventUtils.stripTimeWithTz(startTestMoment),
          end: calEventUtils.stripTimeWithTz(endTestMoment),
          full24HoursDay: true
        }
      };
      var ctrl = initController(bindings);

      expect(ctrl.start.isSame(bindings.event.start, 'day')).to.be.true;
      expect(calEventUtils.stripTimeWithTz(ctrl.end.clone().add(1, 'days')).isSame(bindings.event.end, 'day')).to.be.true;
    });

    it('should set the startTime and EndTime correctly for the native mobile picker', function() {
      const bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        }
      };
      const ctrl = initController(bindings);

      expect(ctrl.startTime instanceof Date).to.be.true;
      expect(ctrl.endTime instanceof Date).to.be.true;
      expect(ctrl.start.hours()).to.equal(ctrl.startTime.getHours());
      expect(ctrl.end.hours()).to.equal(ctrl.endTime.getHours());
    });
  });

  describe('The dateOnBlurFn function', function() {
    it('should clone event start and end on input blur', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        }
      };
      var ctrl = initController(bindings);
      var startBeforeBlur = ctrl.start;
      var endBeforeBlur = ctrl.end;

      ctrl.dateOnBlurFn();
      expect(ctrl.start).to.not.equal(startBeforeBlur);
      expect(ctrl.end).to.not.equal(endBeforeBlur);
      expect(ctrl.start.isSame(startBeforeBlur)).to.be.true;
      expect(ctrl.end.isSame(endBeforeBlur)).to.be.true;
    });
  });

  describe('The allDayOnChange function', function() {
    it('should strip time from start and end date when "All day" option is selected', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone(),
          full24HoursDay: false
        }
      };
      var ctrl = initController(bindings);

      ctrl.full24HoursDay = true;
      ctrl.allDayOnChange();
      checkEventDateTimeSync(ctrl);

      expect(ctrl.start.isSame(esnDatetimeService.setAmbigTime(startTestMoment, true))).to.be.true;
      expect(ctrl.end.isSame(esnDatetimeService.setAmbigTime(endTestMoment, true))).to.be.true;
    });

    it('should set the time of start and end to next hour when unchecking the "All day" option after just opening an all-day event', function() {
      var bindings = {
        event: {
          start: calEventUtils.stripTimeWithTz(startTestMoment),
          end: calEventUtils.stripTimeWithTz(endTestMoment),
          full24HoursDay: true
        }
      };
      var ctrl = initController(bindings);

      ctrl.full24HoursDay = false;

      ctrl.allDayOnChange();
      checkEventDateTimeSync(ctrl);

      expect(ctrl.start.hasTime()).to.be.true;
      expect(ctrl.end.hasTime()).to.be.true;

      var nextHour = calMoment().startOf('hour').add(1, 'hour');
      var nextHourEnd = nextHour.clone().add(30, 'minute');
      var fmt = 'HH:mm:ss.SSS';

      expect(ctrl.start.format(fmt)).to.equal(nextHour.format(fmt));
      expect(ctrl.end.format(fmt)).to.equal(nextHourEnd.format(fmt));
    });

    it('should remember the time when "All day" option is toggled checked/unchecked', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone(),
          full24HoursDay: false
        }
      };
      var ctrl = initController(bindings);

      expect(ctrl.start.isSame(startTestMoment)).to.be.true;
      expect(ctrl.end.isSame(endTestMoment)).to.be.true;

      ctrl.full24HoursDay = true;
      ctrl.allDayOnChange();
      checkEventDateTimeSync(ctrl);

      expect(ctrl.start.isSame(esnDatetimeService.setAmbigTime(startTestMoment, true))).to.be.true;
      expect(ctrl.end.isSame(esnDatetimeService.setAmbigTime(endTestMoment, true))).to.be.true;

      ctrl.full24HoursDay = false;
      ctrl.allDayOnChange();
      checkEventDateTimeSync(ctrl);

      expect(ctrl.start.isSame(startTestMoment)).to.be.true;
      expect(ctrl.end.isSame(endTestMoment)).to.be.true;
    });
  });

  describe('The getMinEndDate function', function() {
    it('should return start date minus 1 day', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone(),
          full24HoursDay: false
        }
      };
      var ctrl = initController(bindings);

      expect(ctrl.getMinEndDate()).to.equal(ctrl.start.clone().subtract(1, 'days').format('YYYY-MM-DD'));
    });
  });

  describe('The onStartDateChange function', function() {
    it('should set end to start plus the previously stored diff', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        }
      };
      var ctrl = initController(bindings);

      ctrl.onStartDateChange();
      checkEventDateTimeSync(ctrl);

      expect(ctrl.start.clone().add(ctrl.end.diff(ctrl.start)).isSame(ctrl.end)).to.be.true;
    });

    it('should call onDateChange', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        },
        onDateChange: sinon.spy()
      };
      var ctrl = initController(bindings);

      ctrl.onStartDateChange();
      checkEventDateTimeSync(ctrl);

      expect(bindings.onDateChange).to.have.been.calledOnce;
    });

    it('should ignore null date and invalid date', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        }
      };
      var ctrl = initController(bindings);

      [null, calMoment('invalid date')].forEach(function(date) {
        ctrl.start = date;
        ctrl.onStartDateChange();

        expect(bindings.event.end.isSame(ctrl.end)).to.be.true;
      }, this);
    });

    it('should refresh the time inputs to the newly selected time', function() {
      const bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        },
        onDateChange: sinon.spy()
      };
      const ctrl = initController(bindings);

      // Those are random fake dates that are not taken into consideration.
      // just wanted to simulate they are going to change.
      ctrl.startTime = new Date('2013-02-08 11:33');
      ctrl.endTime = new Date('2013-02-08 11:40');
      ctrl.onStartDateChange();

      expect(ctrl.startTime.getHours()).to.not.equal(11);
      expect(ctrl.endTime.getHours()).to.not.equal(11);
      expect(ctrl.startTime.getMinutes()).to.not.equal(33);
      expect(ctrl.endTime.getMinutes()).to.not.equal(40);
      expect(ctrl.startTime.getHours()).to.equal(startTestMoment.hours());
      expect(ctrl.endTime.getHours()).to.equal(endTestMoment.hours());
    });
  });

  describe('The onEndDateChange function', function() {
    it('should compute diff between start and end', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        }
      };
      var ctrl = initController(bindings);

      ctrl.onEndDateChange();
      checkEventDateTimeSync(ctrl);
      var diff = ctrl.end.diff(ctrl.start);

      ctrl.start = startTestMoment.clone().add(2, 'days');
      ctrl.onStartDateChange();

      expect(ctrl.end.isSame(ctrl.start.clone().add(diff))).to.be.true;
    });

    it('should set end to start plus 30 min if end is before start', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        }
      };
      var ctrl = initController(bindings);

      ctrl.end = ctrl.start.clone().subtract(1, 'days');
      ctrl.onEndDateChange();
      checkEventDateTimeSync(ctrl);

      expect(ctrl.end.isSame(ctrl.start.clone().add(30, 'minutes'))).to.be.true;
    });

    it('should ignore null date and invalid date', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        }
      };
      var ctrl = initController(bindings);

      [null, calMoment('invalid date')].forEach(function(date) {
        ctrl.end = date;
        ctrl.onStartDateChange();

        expect(bindings.event.start.isSame(ctrl.start)).to.be.true;
      }, this);
    });

    it('should call onDateChange', function() {
      var bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        },
        onDateChange: sinon.spy()
      };
      var ctrl = initController(bindings);

      ctrl.onStartDateChange();
      checkEventDateTimeSync(ctrl);

      expect(bindings.onDateChange).to.have.been.calledOnce;
    });

    it('should refresh the time inputs to the newly selected time', function() {
      const bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        },
        onDateChange: sinon.spy()
      };
      const ctrl = initController(bindings);

      // Those are random fake dates that are not taken into consideration.
      // just wanted to simulate they are going to change.
      ctrl.startTime = new Date('2020-07-01 11:33');
      ctrl.endTime = new Date('2020-08-02 11:40');
      ctrl.onEndDateChange();

      // check if the start date input model is changed
      expect(ctrl.startTime.getMinutes()).to.not.equal(33);
      expect(ctrl.startTime.getHours()).to.not.equal(11);
      expect(ctrl.startTime.getDate()).to.not.equal(1);
      expect(ctrl.startTime.getMonth()).to.not.equal(6);
      expect(ctrl.startTime.getFullYear()).to.not.equal(2020);

      // check if the end date input model is changed
      expect(ctrl.endTime.getMinutes()).to.not.equal(40);
      expect(ctrl.endTime.getHours()).to.not.equal(11);
      expect(ctrl.endTime.getDate()).to.not.equal(2);
      expect(ctrl.endTime.getMonth()).to.not.equal(7);
      expect(ctrl.endTime.getFullYear()).to.not.equal(2020);

      // check if the start date input model is correctly set using the event.start
      expect(ctrl.startTime.getMinutes()).to.equal(startTestMoment.minutes());
      expect(ctrl.startTime.getHours()).to.equal(startTestMoment.hours());
      expect(ctrl.startTime.getDate()).to.equal(startTestMoment.date());
      expect(ctrl.startTime.getMonth()).to.equal(startTestMoment.month());
      expect(ctrl.startTime.getFullYear()).to.equal(startTestMoment.year());

      // check if the start date input model is correctly set using the event.end
      expect(ctrl.endTime.getMinutes()).to.equal(endTestMoment.minutes());
      expect(ctrl.endTime.getHours()).to.equal(endTestMoment.hours());
      expect(ctrl.endTime.getDate()).to.equal(endTestMoment.date());
      expect(ctrl.endTime.getMonth()).to.equal(endTestMoment.month());
      expect(ctrl.endTime.getFullYear()).to.equal(endTestMoment.year());
    });
  });

  describe('the onStartDateTimeChange handler', function() {
    it('should set the selected time and date from the native mobile picker into the event start date', function() {
      const bindings = {
        event: {
          start: calMoment('2020-07-08 10:00:00Z').utc(),
          end: endTestMoment.clone()
        }
      };

      const ctrl = initController(bindings);

      ctrl.startTime = new Date('2020-05-04 11:33');
      ctrl.isMobile = true;
      ctrl.onStartDateTimeChange();
      expect(ctrl.start.hours()).to.equal(11);
      expect(ctrl.start.minutes()).to.equal(33);
      expect(ctrl.start.date()).to.equal(4);
      // Month value is zero based
      expect(ctrl.start.month()).to.equal(4);
      expect(ctrl.start.year()).to.equal(2020);
    });
  });

  describe('the onEndDateTimeChange handler', function() {
    it('should set the selected time and date from the native mobile picker into the event end date', function() {
      const bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        }
      };

      const ctrl = initController(bindings);

      ctrl.endTime = new Date('2020-06-03 11:27');
      ctrl.isMobile = true;
      ctrl.onEndDateTimeChange();
      expect(ctrl.end.hours()).to.equal(11);
      expect(ctrl.end.minutes()).to.equal(27);
      expect(ctrl.end.date()).to.equal(3);
      // Month value is zero based
      expect(ctrl.end.month()).to.equal(5);
      expect(ctrl.end.year()).to.equal(2020);
    });

    it('should ignore the native mobile input if not on mobile', function() {
      const bindings = {
        event: {
          start: startTestMoment.clone(),
          end: endTestMoment.clone()
        }
      };

      const ctrl = initController(bindings);

      ctrl.endTime = new Date('2020-06-03 09:27');
      ctrl.isMobile = false;
      ctrl.onEndDateTimeChange();
      expect(ctrl.end.hours()).to.not.equal(9);
      expect(ctrl.end.minutes()).to.not.equal(27);
      expect(ctrl.end.date()).to.not.equal(3);
      expect(ctrl.end.month()).to.not.equal(5);
      expect(ctrl.end.year()).to.not.equal(2020);
    });
  });
});
