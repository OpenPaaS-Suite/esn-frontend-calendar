'use strict';

/* global chai: false */
/* global sinon: false */
var expect = chai.expect;

describe('The calendar module directives', function() {

  beforeEach(function() {
    angular.mock.module('linagora.esn.graceperiod', 'esn.calendar');
  });

  describe('calAutoSizeAndUpdate directive', function() {
    var autosizeSpy;

    beforeEach(function() {
      autosizeSpy = sinon.spy();
      angular.mock.module('esn.form.helper', function($provide) {
        $provide.value('autosize', autosizeSpy);
      });

      angular.mock.inject(function(_$compile_, _$rootScope_) {
        this.$compile = _$compile_;
        this.$rootScope = _$rootScope_;
        this.$scope = this.$rootScope.$new();
      });

      this.initDirective = function(scope) {
        var element = this.$compile('<div cal-auto-size-and-update/>')(scope);

        scope.$digest();

        return element;
      };
    });

    it('should call the autosize service provided by esn.form.helper model', function() {
      this.initDirective(this.$scope);
      expect(autosizeSpy).to.be.called;
    });
  });
});
