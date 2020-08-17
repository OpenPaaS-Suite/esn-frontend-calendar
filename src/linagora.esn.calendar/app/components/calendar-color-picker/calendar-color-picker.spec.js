'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The calendar color picker component', function() {
  var self;

  beforeEach(function() {
    self = this;
    angular.mock.module('esn.calendar');
    this.$modalMock = sinon.spy();
  });

  beforeEach(angular.mock.module(function($provide) {
    $provide.value('$modal', self.$modalMock);
  }));

  beforeEach(angular.mock.inject(function($rootScope, $compile, CAL_LIST_OF_COLORS) {
    this.$compile = $compile;
    this.$rootScope = $rootScope;
    this.$scope = this.$rootScope.$new();
    this.$scope.calendar = {};
    this.CAL_LIST_OF_COLORS = CAL_LIST_OF_COLORS;

    this.initDirective = function(scope) {
      var html = '<div color="calendar.color" calendar-color-picker-toggler></div>';

      this.element = this.$compile(html)(scope);
      scope.$digest();
      this.eleScope = this.element.isolateScope();
    };
  }));

  it('should pre-select a color', function() {
    this.$scope.calendar.color = this.CAL_LIST_OF_COLORS.indigo;
    this.initDirective(this.$scope);
    this.element.click();
    expect(this.eleScope.vm.selected).to.equal('indigo');
  });

  it('should not be pre-selected if it is a random color not in the color list', function() {
    this.$scope.calendar.color = '#FFC101';
    this.initDirective(this.$scope);
    this.element.click();
    expect(this.eleScope.vm.selected).to.be.undefined;
  });

});

