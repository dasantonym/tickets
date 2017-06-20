(function () {
    'use strict';
    angular.module('ticket-server', [
        'ui.bootstrap',
        'ngRoute',
        'cgBusy',
        'tickets.controllers.tickets'
    ])
    .config(['$routeProvider', '$locationProvider', '$logProvider', '$compileProvider', function ($routeProvider, $locationProvider, $logProvider, $compileProvider) {
        $logProvider.debugEnabled(true);

        var partialsPath = './partials/';

        $routeProvider.eagerInstantiationEnabled(true);
        $routeProvider.when('/list', {templateUrl: partialsPath + 'tickets_list.html', controller: 'Tickets.List'});
        $routeProvider.when('/sync', {templateUrl: partialsPath + 'sync.html', controller: 'Tickets.Sync'});

        $routeProvider.otherwise({redirectTo: '/list'});

    }]).run(['$rootScope', '$q', '$location', function ($rootScope, $q, $location) {
        $rootScope.goto = function (path) {
            $location.path(path);
        };

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