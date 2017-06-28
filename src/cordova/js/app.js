(function () {
    'use strict';
    angular.module('ticket-scanner', [
        'ui.bootstrap',
        'ngRoute',
        'cgBusy',
        'PubSub',
        'tickets.directives.ioloader',
        'tickets.controllers.tickets',
        'tickets.services.settings',
        'tickets.services.socket',
        'tickets.services.heartbeat'
    ])
    .config(['$routeProvider', '$locationProvider', '$logProvider', function ($routeProvider, $locationProvider, $logProvider) {

        $logProvider.debugEnabled(true);

        var partialsPath = './partials/';

        $routeProvider.when('/', {templateUrl: partialsPath + 'scan.html', controller: 'Tickets.Scan'});
        $routeProvider.when('/settings', {templateUrl: partialsPath + 'settings.html', controller: 'Tickets.Settings'});

        $routeProvider.otherwise({redirectTo: '/'});
    }]).run(['$rootScope', '$q', 'App.Settings', '$location', function ($rootScope, $q, appSettings, $location) {
        $rootScope.goto = function (path) {
            $location.path(path);
        };

        $rootScope.remote = {
            ip: appSettings.remote.ip
        };
        $rootScope.$apply();

        $rootScope.$on('$routeChangeStart', function (e, curr, prev) {
            if ($rootScope.pageDefer) {
                $rootScope.pageDefer.resolve();
                $rootScope.pageDefer = null;
            }
            $rootScope.pageDefer = $q.defer();
            $rootScope.pagePromise = $rootScope.pageDefer.promise;
        });
        $rootScope.$on('$routeChangeSuccess', function (e, curr, prev) {
            if ($rootScope.pageDefer) {
                $rootScope.pageDefer.resolve();
                $rootScope.pageDefer = null;
            }
        });
        $rootScope.$on('$routeChangeError', function (e, curr, prev) {
            if ($rootScope.pageDefer) {
                $rootScope.pageDefer.reject();
                $rootScope.pageDefer = null;
            }
        });
    }]);
}());