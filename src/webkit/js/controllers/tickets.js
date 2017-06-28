(function () {
    'use strict';
    var require = global.require;
    angular.module('tickets.controllers.tickets', [])
        .controller('Tickets.List', ['$scope', '$q', 'PubSub', 'App.Stats', function ($scope, $q, PubSub, stats) {
            var db = require('lib-local/db');

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
                if (window.confirm('Are you sure you are claiming the right ticket ' + ticket.token +
                        ' (' + [ticket.firstname, ticket.lastname].join(' ') + ')?')) {

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
                var tickets_valid = 0, tickets_void = 0;
                db.find({}, function (err, tickets) {
                    tickets.sort(function compare(a, b) {
                        if (a.updated > b.updated) {
                            return -1;
                        } else if (a.updated < b.updated) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
                    if (err) {
                        $scope.alerts = [{
                            type: 'danger',
                            msg: err.message
                        }];
                    } else {
                        if ($scope.tickets.length === 0) {
                            $scope.tickets = tickets;
                        } else {
                            var deleteTickets = [];
                            $scope.tickets.map(function (ticket) {
                                var i = 0;
                                while (i < tickets.length && ticket.uuid !== tickets[i].uuid) {
                                    i += 1;
                                }
                                if (!tickets[i]) {
                                    deleteTickets.push(ticket.uuid);
                                    return;
                                } else {
                                    if (tickets[i] && !ticket.void && tickets[i].void) {
                                        ticket.void = tickets[i].void;
                                        ticket.void_at = tickets[i].void_at;
                                    }

                                    if (tickets[i] && !ticket.valid && tickets[i].valid) {
                                        ticket.valid = tickets[i].valid;
                                    }

                                    tickets_void += ticket.void ? 1 : 0;
                                    tickets_valid += ticket.valid ? 1 : 0;

                                    return ticket;
                                }
                            });
                            for (var i = $scope.tickets.length - 1; i >= 0; i -= 1) {
                                if ($scope.tickets[i] === null) {
                                    $scope.tickets.splice(i, 1);
                                }
                            }
                            tickets.map(function (ticket) {
                                var i = 0;
                                while (i < $scope.tickets.length && $scope.tickets[i].uuid !== ticket.uuid) {
                                    i += 1;
                                }
                                if (i === $scope.tickets.length) {
                                    $scope.tickets.unshift(ticket);
                                }
                            });
                        }
                    }
                    stats.storeStats(null, null, null, $scope.tickets.length, null, tickets_valid, tickets_void);
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
                    setTimeout(wrapUpdates, 10000);
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

            $scope.push = {
                url: settings.push.url,
                backoff: settings.push.backoff || 0
            };

            $scope.submitSync = function () {
                var deferred = $q.defer();
                $scope.promiseString = 'Saving...';
                $scope.promise = deferred.promise;
                settings.storeRemote(
                    $scope.remote.url, $scope.remote.login, $scope.remote.password, $scope.remote.interval);
                sync.startBackgroundSync();
                $scope.alerts = [{
                    type: 'success',
                    msg: 'Sync settings saved'
                }];
                deferred.resolve();
            };

            $scope.submitPush = function () {
                var deferred = $q.defer();
                $scope.promiseString = 'Saving...';
                $scope.promise = deferred.promise;
                settings.storePush($scope.push.url, $scope.push.backoff);
                $scope.alerts = [{
                    type: 'success',
                    msg: 'Push settings saved'
                }];
                deferred.resolve();
            };
        }])
        .controller('Tickets.Backup', ['$scope', '$q', 'App.Settings', 'App.Backup',
                function ($scope, $q, settings, backup) {

            $scope.backup = {
                backupInterval: settings.backup.backupInterval || 0,
                autoBackupPath: settings.backup.autoBackupPath,
                backupPath: undefined,
                restorePath: undefined
            };

            $scope.onFileSelect = function (files, prop) {
                if (!Array.isArray(files) || files.length === 0) {
                    return;
                }
                console.log(files);
                $scope.backup[prop] = files[0].path;
            };

            $scope.submitSettings = function () {
                var deferred = $q.defer();
                $scope.promiseString = 'Saving...';
                $scope.promise = deferred.promise;
                settings.storeBackup($scope.backup.backupInterval, $scope.backup.autoBackupPath);
                backup.startBackgroundAutoBackup();
                $scope.alerts = [{
                    type: 'success',
                    msg: 'Backup settings saved'
                }];
                deferred.resolve();
            };

            $scope.submitCreate = function () {
                var deferred = $q.defer();
                $scope.promiseString = 'Backing up...';
                $scope.promise = deferred.promise;
                backup.save($scope.backup.backupPath, function (err) {
                    if (err) {
                        $scope.alerts = [{
                            type: 'success',
                            msg: 'Backup failed: ' + err.message
                        }];
                        return deferred.reject(err);
                    }

                    $scope.alerts = [{
                        type: 'success',
                        msg: 'Backup successfully saved'
                    }];
                    deferred.resolve();
                });
            };

            $scope.submitRestore = function () {
                var deferred = $q.defer();
                $scope.promiseString = 'Restoring backup...';
                $scope.promise = deferred.promise;
                backup.restore($scope.backup.restorePath, function (err) {
                    if (err) {
                        $scope.alerts = [{
                            type: 'error',
                            msg: 'Backup restore failed: ' + err.message
                        }];
                        return deferred.reject(err);
                    }
                    $scope.alerts = [{
                        type: 'success',
                        msg: 'Backup successfully restored'
                    }];
                    deferred.resolve();
                });
            };
        }]);
})();
