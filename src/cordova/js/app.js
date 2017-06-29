(function () {
    'use strict';
    angular.module('ticket-scanner', [
        'ui.bootstrap',
        'ngRoute',
        'cgBusy',
        'tickets.controllers.tickets',
        'tickets.services.settings',
        'tickets.services.heartbeat'
    ])
    .config(['$routeProvider', '$locationProvider', '$logProvider',
        function ($routeProvider, $locationProvider, $logProvider) {

        $logProvider.debugEnabled(true);

        var partialsPath = './partials/';

        $routeProvider.when('/', {templateUrl: partialsPath + 'scan.html', controller: 'Tickets.Scan'});
        $routeProvider.when('/settings', {templateUrl: partialsPath + 'settings.html', controller: 'Tickets.Settings'});

        $routeProvider.otherwise({redirectTo: '/'});
    }]).run(['$rootScope', '$q', 'App.Settings', '$location', 'App.Heartbeat',
            function ($rootScope, $q, appSettings, $location, appHeartbeat) {

        $rootScope.$applyAsync(function () {
            $rootScope.remote = {
                ip: appSettings.remote.ip
            };
            $rootScope.goto = function (path) {
                $location.path(path);
            };
            $rootScope.heartbeat = appHeartbeat;
            if (typeof appSettings.remote.ip === 'string') {
                $rootScope.heartbeat.setup('http://' + appSettings.remote.ip + ':9999/api/heartbeat.json');
                $rootScope.heartbeat.start();
            }
        });

        $rootScope.$on('$routeChangeStart', function () {
            if ($rootScope.pageDefer) {
                $rootScope.pageDefer.resolve();
                $rootScope.pageDefer = null;
            }
            $rootScope.pageDefer = $q.defer();
            $rootScope.pagePromise = $rootScope.pageDefer.promise;
        });
        $rootScope.$on('$routeChangeSuccess', function () {
            if ($rootScope.pageDefer) {
                $rootScope.pageDefer.resolve();
                $rootScope.pageDefer = null;
            }
        });
        $rootScope.$on('$routeChangeError', function () {
            if ($rootScope.pageDefer) {
                $rootScope.pageDefer.reject();
                $rootScope.pageDefer = null;
            }
        });
    }]);
}());