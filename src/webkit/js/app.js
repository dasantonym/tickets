(function () {
    'use strict';
    angular.module('ticket-server', [
        'ui.bootstrap',
        'ngRoute',
        'cgBusy',
        'tickets.controllers.tickets'
    ])
    .config(['$routeProvider', '$locationProvider', '$logProvider', function ($routeProvider, $locationProvider, $logProvider) {

        $logProvider.debugEnabled(true);

        //$locationProvider.html5Mode(false).hashPrefix('!');

        var partialsPath = 'partials/';

        $routeProvider.when('/', {templateUrl: partialsPath + 'tickets_list.html', controller: 'Tickets.List'});
        $routeProvider.when('/sync', {templateUrl: partialsPath + 'sync.html', controller: 'Tickets.Sync'});

        $routeProvider.otherwise({redirectTo: '/'});

    }]).run(['$rootScope', '$q', function ($rootScope, $q) {
        /*
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
        */
    }]);
}());