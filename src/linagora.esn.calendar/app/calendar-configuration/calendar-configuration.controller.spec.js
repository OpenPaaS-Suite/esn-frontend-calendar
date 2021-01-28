'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The calendar configuration controller', function() {
  var $controller,
    $rootScope,
    $scope,
    $state,
    CalDelegationEditionHelperMock,
    calendarAPI,
    CalendarCollectionShell,
    calendarConfigurationController,
    calendarHomeServiceMock,
    calendarRight,
    CalendarRightShellMock,
    calendarService,
    matchmedia,
    notificationFactoryMock,
    stateMock,
    stateParamsMock,
    userUtilsMock,
    Cache,
    uuid4,
    ESN_MEDIA_QUERY_SM_XS,
    CAL_CALENDAR_PUBLIC_RIGHT,
    CAL_CALENDAR_SHARED_RIGHT,
    calCalendarDeleteConfirmationModalService,
    calUIAuthorizationService;

  var addUserGroup,
    addUserGroupResult,
    calendar,
    calendarHomeId,
    getAllRemovedUsersIdResult,
    getAllRemovedUsersId,
    removeUserGroup;

  let esnI18nService;

  function initController() {
    return $controller('calendarConfigurationController', { $scope: $scope });
  }

  beforeEach(function() {
    uuid4 = {
      // This is a valid uuid4. Change this if you need other uuids generated.
      _uuid: '00000000-0000-4000-a000-000000000000',
      generate: function() {
        return this._uuid;
      }
    };

    getAllRemovedUsersIdResult = [];

    addUserGroupResult = {};

    addUserGroup = sinon.spy(function() {
      return addUserGroupResult;
    });

    removeUserGroup = sinon.spy();

    getAllRemovedUsersId = sinon.spy(function() {
      return getAllRemovedUsersIdResult;
    });

    userUtilsMock = {
      displayNameOf: sinon.spy()
    };

    Cache = function() {};
    Cache.prototype.get = sinon.spy();

    CalDelegationEditionHelperMock = sinon.spy(function() {
      this.addUserGroup = addUserGroup;
      this.removeUserGroup = removeUserGroup;
      this.getAllRemovedUsersId = getAllRemovedUsersId;
    });

    notificationFactoryMock = {
      weakInfo: sinon.spy()
    };

    stateMock = {
      go: sinon.spy()
    };

    matchmedia = {};

    calendarRight = {
      getPublicRight: sinon.spy(),
      updatePublic: sinon.spy(),
      getShareeRight: sinon.spy(),
      getAllUserRight: sinon.stub().returns([]),
      getAllShareeRights: sinon.stub().returns([]),
      getOwnerId: sinon.spy(),
      clone: sinon.spy(),
      removeShareeRight: sinon.spy(),
      update: sinon.spy(),
      updateSharee: sinon.spy(),
      equals: sinon.stub().returns(true)
    };

    calendarAPI = {
      modifyPublicRights: sinon.spy()
    };

    calendar = {
      getOwner: sinon.spy(function() {
        return $q.when();
      })
    };

    calendarService = {
      getRight: sinon.spy(function() {
        return $q.when(calendarRight);
      }),

      modifyRights: sinon.spy(function() {
        return $q.when();
      }),

      listCalendars: sinon.stub().returns(
        []
      ),

      createCalendar: sinon.spy(function() {
        return $q.when();
      }),

      modifyCalendar: sinon.spy(function() {
        return $q.when();
      }),

      removeCalendar: sinon.spy(function() {
        return $q.when();
      }),

      getCalendar: sinon.spy(function() {
        return $q.when(calendar);
      })
    };

    calendarHomeServiceMock = {
      getUserCalendarHomeId: sinon.spy(function() {
        return $q.when(calendarHomeId);
      })
    };

    stateParamsMock = {
      calendarUniqueId: '/calendars/calendarHomeId/123.json'
    };

    calendarHomeId = '12345';

    CalendarRightShellMock = sinon.spy(function() {
      return {
        getOwnerId: angular.noop,
        getPublicRight: angular.noop,
        getAllShareeRights: angular.noop
      };
    });

    calCalendarDeleteConfirmationModalService = sinon.spy();
  });

  beforeEach(function() {
    angular.mock.module('esn.resource.libs');
    angular.mock.module('esn.calendar.libs');
    angular.mock.module('esn.calendar', function($provide) {
      $provide.value('$state', stateMock);
      $provide.value('$stateParams', stateParamsMock);
      $provide.value('uuid4', uuid4);
      $provide.value('calendarAPI', calendarAPI);
      $provide.value('calendarService', calendarService);
      $provide.value('calendarHomeService', calendarHomeServiceMock);
      $provide.value('matchmedia', matchmedia);
      $provide.value('CalDelegationEditionHelper', CalDelegationEditionHelperMock);
      $provide.value('notificationFactory', notificationFactoryMock);
      $provide.value('Cache', Cache);
      $provide.value('userUtils', userUtilsMock);
      $provide.value('CalendarRightShell', CalendarRightShellMock);
      $provide.value('calCalendarDeleteConfirmationModalService', calCalendarDeleteConfirmationModalService);
    });
  });

  beforeEach(function() {
    angular.mock.inject(function(_$rootScope_, _$controller_, _$state_, _CalendarCollectionShell_, _CAL_CALENDAR_PUBLIC_RIGHT_, _CAL_CALENDAR_SHARED_RIGHT_, _ESN_MEDIA_QUERY_SM_XS_, _calUIAuthorizationService_, _esnI18nService_) {
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      $controller = _$controller_;
      $state = _$state_;
      CalendarCollectionShell = _CalendarCollectionShell_;
      CAL_CALENDAR_PUBLIC_RIGHT = _CAL_CALENDAR_PUBLIC_RIGHT_;
      CAL_CALENDAR_SHARED_RIGHT = _CAL_CALENDAR_SHARED_RIGHT_;
      ESN_MEDIA_QUERY_SM_XS = _ESN_MEDIA_QUERY_SM_XS_;
      calUIAuthorizationService = _calUIAuthorizationService_;
      esnI18nService = _esnI18nService_;
    });
  });

  beforeEach(function() {
    calendarConfigurationController = initController();

    calendarConfigurationController.calendarHomeId = calendarHomeId;
  });

  describe('the $onInit function', function() {

    beforeEach(function() {
      calendarConfigurationController.activate = sinon.spy();
    });

    it('should call calendarHomeService.getUserCalendarHomeId() to get the calendarHomeId', function() {
      calendarConfigurationController.$onInit();

      expect(calendarHomeServiceMock.getUserCalendarHomeId).to.be.called;
    });

    it('should initialize calendarHomeId', function() {
      delete calendarConfigurationController.calendarHomeId;

      calendarConfigurationController.$onInit();

      $rootScope.$digest();

      expect(calendarConfigurationController.calendarHomeId).to.be.equal(calendarHomeId);
    });

    it('should calendarService.getCalendar to get the calendar if calendarUniqueId is not null', function() {
      sinon.spy(CalendarCollectionShell, 'splitUniqueId');

      calendarConfigurationController.$onInit();

      $rootScope.$digest();

      expect(CalendarCollectionShell.splitUniqueId).to.have.been.calledWith(stateParamsMock.calendarUniqueId);
      expect(calendarService.getCalendar).to.be.calledWith(calendarHomeId, '123');
    });

    it('should not call calendarService.getCalendar if calendarUniqueId is null', function() {
      delete stateParamsMock.calendarUniqueId;

      calendarConfigurationController.$onInit();

      $rootScope.$digest();

      expect(calendarService.getCalendar).to.not.be.called;
    });

    it('should calendar.getOwner to get the calendar owner if calendar is not null', function() {
      calendarConfigurationController.$onInit();

      $rootScope.$digest();

      expect(calendarService.getCalendar).to.be.calledWith(calendarHomeId, '123');
      expect(calendar.getOwner).to.have.been.calledWith();
    });

    it('should initialize calendar with the right calendar when we want configure a calendar', function() {
      calendarConfigurationController.$onInit();

      $rootScope.$digest();

      expect(calendarConfigurationController.calendar).to.be.equal(calendar);
    });

    it('should call the activate function', function() {
      calendarConfigurationController.activate = sinon.spy();

      calendarConfigurationController.$onInit();

      $rootScope.$digest();

      expect(calendarConfigurationController.activate).to.be.called;
    });

    describe('if $stateParams.addUsersFromDelegationState not null', function() {

      beforeEach(function() {
        stateParamsMock.addUsersFromDelegationState = {
          newUsersGroups: ['user'],
          selectedShareeRight: CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ
        };
      });

      it('should initialize newUsersGroups', function() {
        calendarConfigurationController.addUserGroup = sinon.spy();

        calendarConfigurationController.$onInit();

        $rootScope.$digest();

        expect(calendarConfigurationController.newUsersGroups).to.deep.equal(stateParamsMock.addUsersFromDelegationState.newUsersGroups);
      });

      it('should initialize selectedShareeRight', function() {
        calendarConfigurationController.$onInit();

        $rootScope.$digest();

        expect(calendarConfigurationController.selectedShareeRight).to.deep.equal(stateParamsMock.addUsersFromDelegationState.selectedShareeRight);
      });

      it('should call addUserGroup', function() {
        calendarConfigurationController.addUserGroup = sinon.spy();

        calendarConfigurationController.$onInit();

        $rootScope.$digest();

        expect(calendarConfigurationController.addUserGroup).to.be.called;
      });

      it('should call set selectedTab to "delegation"', function() {
        calendarConfigurationController.getDelegationView = sinon.spy();

        calendarConfigurationController.$onInit();

        $rootScope.$digest();

        expect(calendarConfigurationController.selectedTab).to.equal('delegation');
      });
    });
  });

  describe('the activate function', function() {

    it('should initialize newCalendar with true it is a new calendar', function() {
      calendarConfigurationController.activate();

      expect(calendarConfigurationController.newCalendar).to.be.true;
      expect(CalendarRightShellMock).to.have.been.calledWith;
    });

    it('should initialize newCalendar with false it is not a new calendar', function() {
      calendarConfigurationController.calendar = {
        id: '123456789',
        rights: calendarRight,
        isSubscription: angular.noop,
        isOwner: angular.noop,
        isShared: angular.noop
      };

      calendarConfigurationController.activate();

      expect(calendarConfigurationController.newCalendar).to.be.false;
    });

    it('should initialize self.calendar with self.calendar if it is not a new calendar', function() {
      calendarConfigurationController.calendar = {
        id: '123456789',
        rights: calendarRight,
        isSubscription: angular.noop,
        isOwner: angular.noop,
        isShared: angular.noop
      };

      calendarConfigurationController.activate();

      expect(calendarConfigurationController.calendar).to.have.been.deep.equal(calendarConfigurationController.calendar);
    });

    it('should initialize newUsersGroups with an empty array', function() {
      calendarConfigurationController.activate();

      expect(calendarConfigurationController.newUsersGroups).to.deep.equal;
    });

    it('should select main tab when initializing', function() {
      calendarConfigurationController.activate();

      expect(calendarConfigurationController.selectedTab).to.equal('main');
    });

    it('should initialize calendarRight with a new CalendarRightShell if newCalendar is true', function() {
      calendarConfigurationController.activate();

      expect(CalendarRightShellMock).to.be.calledWithNew;
    });

    it('should copy self.calendar in self.oldCalendar', function() {
      calendarConfigurationController.calendar = {
        id: '123456789',
        rights: calendarRight,
        isSubscription: angular.noop,
        isOwner: angular.noop,
        isShared: angular.noop
      };

      calendarConfigurationController.activate();

      expect(calendarConfigurationController.oldCalendar).to.deep.equal(calendarConfigurationController.calendar);
    });

    it('should initialize self.selectedShareeRight with CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ', function() {
      calendarConfigurationController.activate();

      expect(calendarConfigurationController.selectedShareeRight).to.equal(CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ);
    });

    it('should correctly initialize delegation', function() {
      calendarRight.getPublicRight = sinon.stub().returns('publicSelection');
      calendarRight.getAllShareeRights = sinon.stub().returns([
        { userId: 'userId', right: 'right' }
      ]);

      userUtilsMock.displayNameOf = sinon.stub().returns('displayNameOfResult');

      var user = { firstname: 'firstname', lastname: 'lastname' };

      Cache.prototype.get = sinon.stub().returns($q.when({ data: user }));

      calendarConfigurationController.calendar = {
        href: 'data/data.json',
        rights: calendarRight,
        isSubscription: angular.noop,
        isOwner: angular.noop,
        isShared: angular.noop
      };

      calendarConfigurationController.activate();
      $rootScope.$digest();

      expect(Cache.prototype.get).to.have.always.been.calledWith('userId');
      expect(calendarConfigurationController.publicSelection).to.equal('publicSelection');
      expect(addUserGroup).to.have.been.calledWith([{
        firstname: user.firstname,
        lastname: user.lastname,
        displayName: 'displayNameOfResult'
      }], 'right');
      expect(userUtilsMock.displayNameOf).to.have.been.calledWith(user);
      expect(calendarConfigurationController.delegations).to.equals(addUserGroupResult);
    });

    it('should correctly initialize self.calendar if newCalendar is true', function() {
      calendarConfigurationController.activate();

      expect(calendarConfigurationController.calendar.href).to.equal('/calendars/12345/00000000-0000-4000-a000-000000000000.json');
      expect(calendarConfigurationController.calendar.color).to.exist;
    });

    it('should correctly initialize self.calendar if newCalendar is false', function() {
      calendarConfigurationController.calendar = {
        id: '123456789',
        rights: calendarRight,
        isSubscription: angular.noop,
        isOwner: angular.noop,
        isShared: angular.noop
      };

      calendarConfigurationController.activate();

      expect(calendarConfigurationController.calendar.href).to.not.equal('/calendars/12345/00000000-0000-4000-a000-000000000000.json');
      expect(calendarConfigurationController.calendar.color).to.not.exist;
    });

    it('should set public right from calendar right if calendar is not a subscription', function() {
      calendarConfigurationController.calendar = {
        id: '123456789',
        rights: calendarRight,
        source: {
          id: '123456789',
          rights: { getPublicRight: sinon.spy() }
        },
        isSubscription: angular.noop,
        isOwner: angular.noop,
        isShared: angular.noop
      };

      calendarConfigurationController.activate();

      expect(calendarConfigurationController.calendar.source.rights.getPublicRight).to.not.have.been.called;
      expect(calendarConfigurationController.calendar.rights.getPublicRight).to.have.been.calledOnce;
    });

    it('should set public right from source right if calendar is a subscription', function() {
      calendarConfigurationController.calendar = {
        id: '123456789',
        rights: calendarRight,
        source: {
          id: '123456789',
          rights: { getPublicRight: sinon.spy() }
        },
        isSubscription: sinon.stub().returns(true),
        isOwner: angular.noop,
        isShared: angular.noop
      };

      calendarConfigurationController.activate();

      expect(calendarConfigurationController.calendar.source.rights.getPublicRight).to.have.been.calledOnce;
      expect(calendarConfigurationController.calendar.rights.getPublicRight).to.not.have.been.called;
    });
  });

  describe('the submit function', function() {
    it('should do nothing if the calendar name is empty', function() {
      calendarConfigurationController.activate();
      calendarConfigurationController.submit();

      expect(stateMock.go).to.not.have.been.called;
      expect(calendarService.modifyCalendar).to.not.have.been.called;
      expect(calendarService.createCalendar).to.not.have.been.calledWith();
    });

    describe('when newCalendar is true (with name having only one char)', function() {
      beforeEach(function() {
        calendarConfigurationController.newCalendar = true;
        calendarConfigurationController.calendar = {
          color: 'aColor',
          name: 'N',
          rights: {
            updatePublic: sinon.spy()
          }
        };

        notificationFactoryMock.weakInfo = sinon.spy();

        stateMock.go = sinon.spy(function(path) {
          expect(path).to.equal('calendar.main');

          return $q.when();
        });

        calendarService.createCalendar = function(calendarHomeId, shell) {
          expect(calendarHomeId).to.equal('12345');
          expect(shell).to.shallowDeepEqual({
            name: 'N',
            color: 'aColor'
          });

          return $q.when();
        };
      });

      it('should call createCalendar', function() {
        calendarConfigurationController.publicSelection = undefined;
        esnI18nService.translate = sinon.spy();

        calendarConfigurationController.submit();

        $rootScope.$digest();

        expect(notificationFactoryMock.weakInfo).to.have.been.called;
        expect(stateMock.go).to.have.been.called;
        expect(calendarAPI.modifyPublicRights).to.not.have.been.called;
        expect(esnI18nService.translate).to.have.been.calledWith(sinon.match.any, sinon.match.any, true); /* ignore the sanitize strategy */
      });

      it('should call createCalendar and calendarAPI.modifyPublicRights when publicSelection is set to read', function() {
        createCalendarWithPublicRightSetTo(CAL_CALENDAR_PUBLIC_RIGHT.READ);
      });

      it('should call createCalendar and calendarAPI.modifyPublicRights when publicSelection is set to read_write', function() {
        createCalendarWithPublicRightSetTo(CAL_CALENDAR_PUBLIC_RIGHT.READ_WRITE);
      });

      it('should call createCalendar and calendarAPI.modifyPublicRights when publicSelection is set to private', function() {
        createCalendarWithPublicRightSetTo(CAL_CALENDAR_PUBLIC_RIGHT.PRIVATE);
      });

      function createCalendarWithPublicRightSetTo(publicRight) {
        calendarConfigurationController.publicSelection = publicRight;

        calendarConfigurationController.submit();

        $rootScope.$digest();

        sinon.assert.callOrder(stateMock.go, calendarAPI.modifyPublicRights, notificationFactoryMock.weakInfo);
        expect(notificationFactoryMock.weakInfo).to.have.been.called;
        expect(stateMock.go).to.have.been.calledWith('calendar.main');
        expect(calendarAPI.modifyPublicRights).to.have.been.calledWith(
          calendarConfigurationController.calendarHomeId,
          calendarConfigurationController.calendar.id,
          { public_right: publicRight }
        );
      }
    });

    describe('when newCalendar is false', function() {
      it('should return to calendar.settings if the calendar, his right and his public rights have not been modified and if screensize is xs or sm', function() {
        matchmedia.is = sinon.stub().returns(true);
        stateMock.go = sinon.spy(function(path) {
          expect(path).to.equal('calendar.settings');
        });
        calendarService.modifyCalendar = sinon.spy();

        calendarConfigurationController.calendar = {
          id: '123456789',
          href: '/calendars/12345/00000000-0000-4000-a000-000000000000.json',
          rights: calendarRight,
          isSubscription: angular.noop,
          isOwner: angular.noop,
          isShared: angular.noop
        };

        calendarConfigurationController.activate();

        calendarConfigurationController.calendar.color = 'aColor';
        calendarConfigurationController.calendar.name = 'aName';
        calendarConfigurationController.oldCalendar.name = 'aName';
        calendarConfigurationController.oldCalendar.color = 'aColor';
        calendarConfigurationController.newCalendar = false;

        calendarConfigurationController.submit();
        $rootScope.$digest();

        expect(matchmedia.is).to.have.been.calledWith(ESN_MEDIA_QUERY_SM_XS);
        expect(stateMock.go).to.have.been.called;
        expect(calendarService.modifyCalendar).to.have.not.been.called;
      });

      it('should return to calendar.main if the calendar, his right and his public rights have not been modified and if screensize is md', function() {
        calendarRight.getPublicRight = sinon.stub().returns('publicSelection');
        matchmedia.is = sinon.stub().returns(false);
        stateMock.go = sinon.spy(function(path) {
          expect(path).to.equal('calendar.main');
        });
        calendarService.modifyCalendar = sinon.spy();
        calendarConfigurationController.calendar = {
          href: 'blabla/id.json',
          rights: calendarRight,
          isSubscription: angular.noop
        };
        calendarConfigurationController.calendar.color = 'aColor';
        calendarConfigurationController.calendar.name = 'aName';

        calendarConfigurationController.activate();
        $rootScope.$digest();

        calendarConfigurationController.publicSelection = 'publicSelection';
        calendarConfigurationController.oldCalendar.name = 'aName';
        calendarConfigurationController.oldCalendar.color = 'aColor';
        calendarConfigurationController.newCalendar = false;

        calendarConfigurationController.submit();
        $rootScope.$digest();

        expect(matchmedia.is).to.have.been.calledWith(ESN_MEDIA_QUERY_SM_XS);
        expect(stateMock.go).to.have.been.called;
        expect(calendarService.modifyCalendar).to.have.not.been.called;
        expect(calendarAPI.modifyPublicRights).to.have.not.been.called;
      });

      it('should call modifyCalendar if the calendar has been modified (with name having only one char) and directly return to the list if his right and public right have not been changed', function() {
        var modifiedName = 'A';

        calendarRight.getPublicRight = sinon.stub().returns('publicSelection');
        notificationFactoryMock.weakInfo = sinon.spy();
        stateMock.go = sinon.spy(function(path) {
          expect(path).to.equal('calendar.main');
        });
        esnI18nService.translate = sinon.spy();

        calendarConfigurationController.calendar = {
          href: '/calendars/12345/00000000-0000-4000-a000-000000000000.json',
          color: 'aColor',
          name: 'aName',
          rights: calendarRight,
          isSubscription: angular.noop
        };

        calendarService.modifyCalendar = sinon.spy(function(calendarHomeId, shell) {
          expect(calendarHomeId).to.equal('12345');
          expect(shell).to.shallowDeepEqual({
            href: '/calendars/12345/00000000-0000-4000-a000-000000000000.json',
            name: modifiedName
          });

          return {
            then: function(callback) {
              callback();
            }
          };
        });
        calendarConfigurationController.calendar.name = 'aName';

        calendarConfigurationController.activate();
        $rootScope.$digest();

        calendarConfigurationController.publicSelection = 'publicSelection';
        calendarConfigurationController.calendar.name = modifiedName;
        calendarConfigurationController.newCalendar = false;

        calendarConfigurationController.submit();
        $rootScope.$digest();

        expect(notificationFactoryMock.weakInfo).to.have.been.called;
        expect(stateMock.go).to.have.been.called;
        expect(calendarService.modifyRights).to.not.have.been.called;
        expect(calendarAPI.modifyPublicRights).to.have.not.been.called;
        expect(calendarService.modifyCalendar).to.have.been.calledWith('12345', sinon.match({
          href: '/calendars/12345/00000000-0000-4000-a000-000000000000.json',
          name: modifiedName
        }));
        expect(esnI18nService.translate).to.have.been.calledWith(sinon.match.any, sinon.match.any, true); /* ignore the sanitize strategy */
      });

      it('should call modifyRight and not modifyCalendar nor modifyPublicRights if only right has been changed', function() {
        getAllRemovedUsersIdResult = ['1'];
        calendarRight.getPublicRight = sinon.stub().returns('publicSelection');
        calendarRight.equals = sinon.stub().returns(false);
        notificationFactoryMock.weakInfo = sinon.spy();
        stateMock.go = sinon.spy(function(path) {
          expect(path).to.equal('calendar.main');
        });
        calendarConfigurationController.calendar = {
          href: '/calendars/12345/00000000-0000-4000-a000-000000000000.json',
          color: 'aColor',
          name: 'aName',
          rights: calendarRight,
          isSubscription: angular.noop
        };
        calendarConfigurationController.calendar.name = 'aName';

        calendarConfigurationController.activate();
        $rootScope.$digest();

        calendarConfigurationController.publicSelection = 'publicSelection';
        calendarConfigurationController.newCalendar = false;
        calendarConfigurationController.delegations = [{
          user: { _id: 'id', preferredEmail: 'preferredEmail' },
          selection: 'selectedShareeRight'
        }];

        calendarConfigurationController.submit();
        $rootScope.$digest();

        expect(notificationFactoryMock.weakInfo).to.have.been.called;
        expect(calendarRight.removeShareeRight).to.have.been.calledWith('1');
        expect(calendarRight.updateSharee).to.have.been.calledWith('id', 'preferredEmail', 'selectedShareeRight');
        expect(stateMock.go).to.have.been.called;
        expect(calendarService.modifyRights).to.have.been.calledWith(
          calendarConfigurationController.calendarHomeId,
          sinon.match({ href: '/calendars/12345/00000000-0000-4000-a000-000000000000.json' }),
          sinon.match.same(calendarRight),
          sinon.match(calendarRight)
        );
        expect(calendarService.modifyCalendar).to.not.have.been.calledWith;
        expect(calendarAPI.modifyPublicRights).to.have.not.been.called;
      });

      describe('when only public right have been changed', function() {
        beforeEach(function() {
          calendarRight.getPublicRight = sinon.stub().returns('publicSelection');
          calendarConfigurationController.calendar = {
            id: '123',
            href: 'blabla/id.json',
            rights: calendarRight,
            isSubscription: angular.noop,
            isOwner: angular.noop,
            isShared: angular.noop
          };
          calendarConfigurationController.calendar.color = 'aColor';
          calendarConfigurationController.calendar.name = 'aName';

          calendarConfigurationController.activate();
          $rootScope.$digest();
        });

        it('should call modifyPublicRights with read argument when public right is changed to read', function() {
          calendarConfigurationController.publicSelection = CAL_CALENDAR_PUBLIC_RIGHT.READ;

          calendarConfigurationController.submit();
          $rootScope.$digest();

          expect(notificationFactoryMock.weakInfo).to.have.been.called;
          expect(stateMock.go).to.have.been.called;
          expect(calendarAPI.modifyPublicRights).to.have.been.calledWith(
            calendarConfigurationController.calendarHomeId,
            calendarConfigurationController.calendar.id,
            { public_right: CAL_CALENDAR_PUBLIC_RIGHT.READ }
          );
          expect(calendarService.modifyCalendar).to.not.have.been.calledWith;
          expect(calendarService.modifyRights).to.not.have.been.calledWith;
        });

        it('should call modifyPublicRights with private argument when public right is changed to private', function() {
          calendarConfigurationController.publicSelection = CAL_CALENDAR_PUBLIC_RIGHT.PRIVATE;

          calendarConfigurationController.submit();
          $rootScope.$digest();

          expect(notificationFactoryMock.weakInfo).to.have.been.called;
          expect(stateMock.go).to.have.been.called;
          expect(calendarAPI.modifyPublicRights).to.have.been.calledWith(
            calendarConfigurationController.calendarHomeId,
            calendarConfigurationController.calendar.id,
            { public_right: CAL_CALENDAR_PUBLIC_RIGHT.PRIVATE }
          );
          expect(calendarService.modifyCalendar).to.not.have.been.calledWith;
          expect(calendarService.modifyRights).to.not.have.been.calledWith;
        });

        it('should call modifyPublicRights with free-busy argument when public right is changed to something other than private or read', function() {
          calendarConfigurationController.publicSelection = CAL_CALENDAR_PUBLIC_RIGHT.FREE_BUSY;

          calendarConfigurationController.submit();
          $rootScope.$digest();

          expect(notificationFactoryMock.weakInfo).to.have.been.called;
          expect(stateMock.go).to.have.been.called;
          expect(calendarAPI.modifyPublicRights).to.have.been.calledWith(
            calendarConfigurationController.calendarHomeId,
            calendarConfigurationController.calendar.id,
            { public_right: CAL_CALENDAR_PUBLIC_RIGHT.FREE_BUSY }
          );
          expect(calendarService.modifyCalendar).to.not.have.been.calledWith;
          expect(calendarService.modifyRights).to.not.have.been.calledWith;
        });
      });

      it('should call modifyRight, modifyCalendar and modifyPublicRights if all right has been changed', function() {
        var modifiedName = 'A';

        calendarRight.getPublicRight = sinon.stub().returns('publicSelection');
        calendarRight.equals = sinon.stub().returns(false);
        notificationFactoryMock.weakInfo = sinon.spy();
        stateMock.go = sinon.spy(function(path) {
          expect(path).to.equal('calendar.main');
        });
        calendarConfigurationController.calendar = {
          id: '123',
          href: '/calendars/12345/00000000-0000-4000-a000-000000000000.json',
          color: 'aColor',
          name: 'aName',
          rights: calendarRight,
          isSubscription: angular.noop,
          isOwner: angular.noop,
          isShared: angular.noop
        };
        calendarConfigurationController.calendar.name = 'aName';

        calendarConfigurationController.activate();
        $rootScope.$digest();

        calendarConfigurationController.publicSelection = CAL_CALENDAR_PUBLIC_RIGHT.FREE_BUSY;
        calendarConfigurationController.calendar.name = modifiedName;
        calendarConfigurationController.newCalendar = false;

        calendarConfigurationController.submit();
        $rootScope.$digest();

        expect(notificationFactoryMock.weakInfo).to.have.been.called;
        expect(stateMock.go).to.have.been.called;
        expect(calendarService.modifyRights).to.have.been.calledWith(
          calendarConfigurationController.calendarHomeId,
          sinon.match({ href: '/calendars/12345/00000000-0000-4000-a000-000000000000.json' }),
          sinon.match.same(calendarRight),
          sinon.match(calendarRight)
        );
        expect(calendarService.modifyCalendar).to.have.been.calledWith('12345', sinon.match({
          href: '/calendars/12345/00000000-0000-4000-a000-000000000000.json',
          name: modifiedName
        }));
        expect(calendarAPI.modifyPublicRights).to.have.been.calledWith(
          calendarConfigurationController.calendarHomeId,
          calendarConfigurationController.calendar.id,
          { public_right: CAL_CALENDAR_PUBLIC_RIGHT.FREE_BUSY }
        );
      });
    });
  });

  describe('the addUserGroup function', function() {
    it('should add multiple users to the delegation if newUsersGroups.length > 0 and the calendar is not a new calendar', function() {
      calendarConfigurationController.calendar = {
        href: '/calendars/12345/00000000-0000-4000-a000-000000000000.json',
        color: 'aColor',
        name: 'aName',
        rights: calendarRight,
        isSubscription: angular.noop
      };

      calendarConfigurationController.activate();

      calendarConfigurationController.addUserGroup();

      expect(addUserGroup).to.have.been.calledOnce;
    });

    it('should throw an exception if the calendar is a new calendar', function() {
      var error;

      calendarConfigurationController.activate();

      try {
        calendarConfigurationController.addUserGroup();
      } catch (err) {
        error = err;
      }

      expect(error.message).to.equal('edition of right on new calendar are not implemented yet');
    });
  });

  describe('the removeUserGroup function', function() {
    it('should call the removeUserGroup from CalDelegationEditionHelper', function() {
      calendarConfigurationController.activate();
      calendarConfigurationController.removeUserGroup();

      expect(removeUserGroup).to.have.been.calledOnce;
    });
  });

  describe('the reset function', function() {
    it('should reset the values of newUsersGroups and selectedShareeRight', function() {
      calendarConfigurationController.calendar = {
        id: '123456789',
        rights: calendarRight,
        isSubscription: angular.noop,
        isOwner: angular.noop,
        isShared: angular.noop
      };

      calendarConfigurationController.activate();

      calendarConfigurationController.addUserGroup();

      expect(calendarConfigurationController.newUsersGroups).to.deep.equal;
      expect(calendarConfigurationController.selectedShareeRight).to.deep.equal(CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ);
    });
  });

  describe('the openDeleteConfirmationDialog function', function() {
    it('should call the modal confirmation service', function() {
      calendarConfigurationController.openDeleteConfirmationDialog();

      expect(calCalendarDeleteConfirmationModalService).to.have.been.calledWith(calendarConfigurationController.calendar, calendarConfigurationController.removeCalendar);
    });
  });

  describe('the removeCalendar function', function() {
    it('should call calendarService.removeCalendar before $state to go back on the main view when deleting', function() {
      calendarConfigurationController.calendar = {
        id: '123456789'
      };
      calendarConfigurationController.calendarHomeId = '12345';

      calendarConfigurationController.removeCalendar();

      expect($state.go).to.have.not.been.called;

      $rootScope.$digest();

      expect(calendarService.removeCalendar).to.have.been.calledWith(
        calendarConfigurationController.calendarHomeId,
        calendarConfigurationController.calendar
      );

      expect($state.go).to.have.been.calledWith('calendar.main');
    });
  });

  describe('the canDeleteCalendar function', function() {
    var canDeleteCalendarResult;

    beforeEach(function() {
      calendarConfigurationController.calendar = calendar;

      sinon.stub(calUIAuthorizationService, 'canDeleteCalendar', function() {
        return canDeleteCalendarResult;
      });

      calendarConfigurationController.calendar = {
        id: '123456789',
        rights: calendarRight,
        isSubscription: angular.noop
      };
    });

    it('should return true if newCalendar=false and calUIAuthorizationService.canDeleteCalendar= true', function() {
      calendarConfigurationController.newCalendar = false;
      canDeleteCalendarResult = true;

      calendarConfigurationController.$onInit();
      calendarConfigurationController.activate();

      expect(calendarConfigurationController.canDeleteCalendar).to.be.true;
    });

    it('should return false if newCalendar=false and calUIAuthorizationService.canDeleteCalendar= false', function() {
      calendarConfigurationController.newCalendar = false;
      canDeleteCalendarResult = false;

      calendarConfigurationController.$onInit();
      calendarConfigurationController.activate();

      expect(calendarConfigurationController.canDeleteCalendar).to.be.false;
    });

    it('should return false if newCalendar=true', function() {
      calendarConfigurationController.newCalendar = true;

      calendarConfigurationController.$onInit();
      calendarConfigurationController.activate();

      expect(calendarConfigurationController.canDeleteCalendar).to.be.false;
    });
  });
});
