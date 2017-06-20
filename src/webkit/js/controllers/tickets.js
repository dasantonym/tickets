(function () {
    'use strict';
    var require = global.require;
    angular.module(
        'tickets.controllers.tickets', [])
        .controller('Tickets.List', ['$scope', '$q', '$routeParams', function ($scope, $q, $routeParams) {
            var db = require('lib-local/db.js');
            var deferred = $q.defer();

            $scope.promiseString = 'Loading tickets...';
            $scope.promise = deferred.promise;

            $scope.tickets = [];
            $scope.filter = {
                query: null
            };

            $scope.$watch('filter.query', function (query) {
                async.each($scope.tickets, function (ticket, next) {
                    var contents = [ticket.firstname.toLowerCase, ticket.lastname.toLowerCase(), ticket.email.toLowerCase(), ticket.ticket_key].join(' ');
                    if (contents.indexOf(query.toLowerCase()) < 0) {
                        $scope.tickets[$scope.tickets.indexOf(ticket)].hideEntry = true;
                    } else {
                        $scope.tickets[$scope.tickets.indexOf(ticket)].hideEntry = false;
                    }
                    next();
                });
            });

            $scope.claimTicket = function (ticket) {
                if (window.confirm('Are you sure you are claiming the right ticket #' + ticket.ticket_key + ' (' + [ticket.firstname, ticket.lastname].join(' ') + ')?')) {
                    delete ticket['$$hashKey'];
                    console.log(ticket);
                    ticket.isVoid = true;
                    db.update(ticket, ticket.ticket_key, function (err) {
                        if (err) {
                            console.log(err);
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

            var updateList = function () {
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
                                if (!$scope.tickets[i].isVoid && tickets[i].isVoid) {
                                    $scope.tickets[i].isVoid = tickets[i].isVoid;
                                }
                            }
                        }
                    }
                    deferred.resolve();
                    $scope.$apply();
                    window.setTimeout(function () {
                        updateList();
                    }, 2000);
                });
            };

            updateList();
        }])
        .controller('Tickets.Sync', ['$scope', '$q', '$routeParams', function ($scope, $q, $routeParams) {
            $scope.remote = {
                url: '',
                login: '',
                password: ''
            };

            $scope.submit = function () {
                var deferred = $q.defer();
                var db = require('lib-local/db.js');
                var request = require('request');
                var urlparts = $scope.remote.url.split('://');

                $scope.promiseString = 'Syncing...';
                $scope.promise = deferred.promise;

                if ($scope.remote.login && $scope.remote.password && urlparts.length === 2) {
                    urlparts[1] = $scope.remote.login + ':' + $scope.remote.password + '@' + urlparts[1];
                }

                async.waterfall([
                    function (cb) {
                        request(urlparts.join('://'), cb);
                    },
                    function (res, body, cb) {
                        if (res.statusCode == 200) {
                            try {
                                var tickets = JSON.parse(body);
                                cb(null, tickets);
                            } catch (e) {
                                cb(new Error('Corrupted response data'), null);
                            }
                        } else if (res.statusCode == 403) {
                            cb(new Error('Access Denied'), null);
                        } else {
                            cb(new Error('Unknown error: HTTP status ' + res.statusCode), null);
                        }
                    },
                    function (tickets, cb) {
                        async.each(tickets, function (ticket, next) {
                            async.waterfall([
                                function (cb) {
                                    db.findOne({ ticket_key: ticket.ticket_key }, cb);
                                },
                                function (existing_ticket, cb) {
                                    if (existing_ticket) {
                                        cb(null, existing_ticket);
                                    } else {
                                        db.create(ticket, cb);
                                    }
                                }
                            ], function (err) {
                                next(err);
                            });
                        }, function (err) {
                            cb(err);
                        });
                    }
                ], function (err) {
                    if (err) {
                        console.log(err);
                        $scope.alerts = [
                            {
                                type: 'danger',
                                msg: err.message
                            }
                        ];
                        deferred.reject();
                        return;
                    }
                    $scope.alerts = [
                        {
                            type: 'success',
                            msg: 'Sync completed'
                        }
                    ];
                    deferred.resolve();
                    $scope.$apply();
                });
            };
        }]);
})();
