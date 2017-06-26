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
                    setTimeout(wrapUpdates, 2000);
                });
            }

            wrapUpdates();

            //PubSub.subscribe('sync-update', updateList);
            //PubSub.subscribe('void-update', updateList);
        }])
        .controller('Tickets.Sync', ['$scope', '$q', 'App.Settings', function ($scope, $q, settings) {
            $scope.remote = {
                url: settings.remote.url,
                login: settings.remote.login,
                password: settings.remote.password
            };

            $scope.local = {
                url: settings.push.url
            };

            $scope.submitSync = function () {
                var deferred = $q.defer();
                $scope.promiseString = 'Saving...';
                $scope.promise = deferred.promise;
                settings.storeRemote($scope.remote.url, $scope.remote.login, $scope.remote.password);
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
        }]);
})();
