(function () {
    'use strict';
    var require = global.require;
    angular.module(
        'tickets.controllers.tickets', [])
        .controller('Tickets.List', ['$scope', '$q', 'PubSub', function ($scope, $q, PubSub) {
            var db = require('lib-local/db.js');

            $scope.tickets = [];
            $scope.filter = {
                query: undefined
            };

            $scope.$watch('filter.query', function (query) {
                async.each($scope.tickets, function (ticket, next) {
                    var contents = [
                        ticket.firstname ? ticket.firstname.toLowerCase() : '',
                        ticket.lastname ? ticket.lastname.toLowerCase() : '',
                        ticket.order_number ? ticket.order_number.toLowerCase() : '',
                        ticket.email ? ticket.email.toLowerCase() : '',
                        ticket.type ? ticket.type.toLowerCase() : '',
                        ticket.category ? ticket.category.toLowerCase() : '',
                        ticket.token
                    ].join(' ');

                    if (contents.indexOf(query.toLowerCase()) < 0) {
                        $scope.tickets[$scope.tickets.indexOf(ticket)].hideEntry = true;
                    } else {
                        $scope.tickets[$scope.tickets.indexOf(ticket)].hideEntry = false;
                    }

                    next();
                });
            });

            $scope.claimTicket = function (ticket) {
                if (window.confirm('Are you sure you are claiming the right ticket ' + ticket.token + ' (' + [ticket.firstname, ticket.lastname].join(' ') + ')?')) {
                    delete ticket['$$hashKey'];
                    ticket.void = true;
                    ticket.void_at = new Date();
                    db.update(ticket, ticket.token, function (err) {
                        if (err) {
                            $scope.alerts = [
                                {
                                    type: 'danger',
                                    msg: err.message
                                }
                            ];
                        }
                        $scope.$apply();
                    });
                }
            };

            var updateList = function (callback) {
                db.find({}, function (err, tickets) {
                    tickets.sort(function compare(a, b) {
                        if (a.lastname < b.lastname)
                            return -1;
                        if (a.lastname > b.lastname)
                            return 1;
                        return 0;
                    });
                    if (err) {
                        $scope.alerts = [
                            {
                                type: 'danger',
                                msg: err.message
                            }
                        ];
                    } else {
                        if ($scope.tickets.length === 0) {
                            $scope.tickets = tickets;
                        } else {
                            for (var i in tickets) {
                                if (!$scope.tickets[i].void && tickets[i].void) {
                                    $scope.tickets[i].void = tickets[i].void;
                                    $scope.tickets[i].void_at = tickets[i].void_at;
                                }
                            }
                        }
                    }
                    deferred.resolve();
                    $scope.$apply();
                    if (typeof callback === 'function') {
                        callback();
                    }
                });
            };

            var deferred = $q.defer();
            $scope.promiseString = 'Loading tickets...';
            $scope.promise = deferred.promise;

            function wrapUpdates() {
                updateList(function () {
                    setTimeout(wrapUpdates, 5000);
                });
            }

            wrapUpdates();

            PubSub.subscribe('sync-update', updateList);
            //PubSub.subscribe('void-update', updateList);
        }])
        .controller('Tickets.Sync', ['$scope', '$q', 'App.Settings', 'App.Sync', function ($scope, $q, settings, sync) {
            $scope.remote = {
                url: settings.remote.url,
                login: settings.remote.login,
                password: settings.remote.password,
                interval: settings.remote.interval || 0
            };

            $scope.local = {
                url: settings.push.url
            };

            $scope.submitSync = function () {
                var deferred = $q.defer();
                $scope.promiseString = 'Saving...';
                $scope.promise = deferred.promise;
                settings.storeRemote(
                    $scope.remote.url, $scope.remote.login, $scope.remote.password, $scope.remote.interval);
                sync.startBackgroundSync();
                $scope.alerts = [
                    {
                        type: 'success',
                        msg: 'Sync settings saved'
                    }
                ];
                deferred.resolve();
            };

            $scope.submitPush = function () {
                var deferred = $q.defer();
                $scope.promiseString = 'Saving...';
                $scope.promise = deferred.promise;
                settings.storePush($scope.local.url);
                $scope.alerts = [
                    {
                        type: 'success',
                        msg: 'Push settings saved'
                    }
                ];
                deferred.resolve();
            };
        }])
        .controller('Tickets.Backup', ['$scope', '$q', 'App.Settings', 'App.Backup', 'Upload',
                function ($scope, $q, settings, backup, Upload) {

            $scope.backup = {
                backupInterval: settings.backup.backupInterval || 0,
                autoBackupPath: settings.backup.autoBackupPath,
                backupPath: undefined,
                restorePath: undefined
            };

            $scope.submitSettings = function () {
                var deferred = $q.defer();
                $scope.promiseString = 'Saving...';
                $scope.promise = deferred.promise;
                settings.storeBackup($scope.backup.backupInterval, $scope.backup.autoBackupPath);
                $scope.alerts = [
                    {
                        type: 'success',
                        msg: 'Backup settings saved'
                    }
                ];
                deferred.resolve();
            };

            $scope.submitCreate = function () {
                var deferred = $q.defer();
                $scope.promiseString = 'Backing up...';
                $scope.promise = deferred.promise;

                $scope.alerts = [
                    {
                        type: 'success',
                        msg: 'Backup successfully saved'
                    }
                ];
                deferred.resolve();
            };

            $scope.submitRestore = function () {
                var deferred = $q.defer();
                $scope.promiseString = 'Restoring backup...';
                $scope.promise = deferred.promise;

                var fs = require('fs-extra');

                return fs.readdir($scope.backup.restorePath)
                    .then(function (entries) {

                    })
                    .then(function () {
                        $scope.alerts = [
                            {
                                type: 'success',
                                msg: 'Backup successfully restored'
                            }
                        ];
                        deferred.resolve();
                    })
                    .catch(function (err) {
                        $scope.alerts = [
                            {
                                type: 'error',
                                msg: 'Backup restore failed: ' + err.message
                            }
                        ];
                        deferred.reject(err);
                    });
            };
        }]);
})();
