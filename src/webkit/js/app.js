(function () {
    'use strict';
    angular.module('ticket-server', [
        'ui.bootstrap',
        'ngRoute',
        'cgBusy',
        'PubSub',
        'ngFileUpload',
        'tickets.controllers.tickets',
        'tickets.controllers.modalclaim',
        'tickets.services.settings',
        'tickets.services.stats',
        'tickets.services.sync',
        'tickets.services.socket',
        'tickets.services.backup',
        'tickets.directives.stats',
        'tickets.directives.ioloader',
        'tickets.directives.utils'
    ])
    .config(['$routeProvider', '$locationProvider', '$logProvider', function ($routeProvider, $locationProvider, $logProvider) {
        $logProvider.debugEnabled(true);

        var partialsPath = './partials/';

        $routeProvider.eagerInstantiationEnabled(true);
        $routeProvider.when('/list', {templateUrl: partialsPath + 'tickets_list.html', controller: 'Tickets.List'});
        $routeProvider.when('/sync', {templateUrl: partialsPath + 'sync.html', controller: 'Tickets.Sync'});
        $routeProvider.when('/backup', {templateUrl: partialsPath + 'backup.html', controller: 'Tickets.Backup'});

        $routeProvider.otherwise({redirectTo: '/list'});

    }]).run(['$rootScope', '$q', '$location', 'App.Sync', 'App.Backup', 'App.Settings', function ($rootScope, $q, $location, appSync, appBackup, appSettings) {
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

        $rootScope.httpServer = global.require('lib-local/http');
        $rootScope.httpServer.settings = appSettings;
        $rootScope.httpServer.server();

        var socket = global.require('lib-local/socket.io');
        socket.setup();

        appSync.startBackgroundSync();
        appBackup.startBackgroundAutoBackup();
    }]);
}());