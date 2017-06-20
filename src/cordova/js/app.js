(function () {
    'use strict';
    angular.module('ticket-scanner', [
        'ui.bootstrap',
        'ngRoute',
        'cgBusy',
        'tickets.controllers.tickets',
        'tickets.services.settings',
        'tickets.services.socket'
    ])
        .config(['$routeProvider', '$locationProvider', '$logProvider', function ($routeProvider, $locationProvider, $logProvider) {

            $logProvider.debugEnabled(true);

            var partialsPath = 'partials/';

            $routeProvider.when('/', {templateUrl: partialsPath + 'scan.html', controller: 'Tickets.Scan'});
            $routeProvider.when('/settings', {templateUrl: partialsPath + 'settings.html', controller: 'Tickets.Settings'});

        }]).run(['$rootScope', '$q', 'App.Settings', function ($rootScope, $q, appSettings) {

            $rootScope.remote = {
                ip: appSettings.remote.ip
            };

            $rootScope.$apply();

            $rootScope.$on('$routeChangeStart', function (e, curr, prev) {
                $rootScope.pageDefer = $q.defer();
                $rootScope.pagePromise = $rootScope.pageDefer.promise;
            });
            $rootScope.$on('$routeChangeSuccess', function (e, curr, prev) {
                $rootScope.pageDefer.resolve();
            });
            $rootScope.$on('$routeChangeError', function (e, curr, prev) {
                $rootScope.pageDefer.reject();
            });
        }]);
}());