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
                    var contents = [ticket.firstname.toLowerCase, ticket.lastname.toLowerCase(), ticket.email.toLowerCase(), ticket.token].join(' ');
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
                    console.log(ticket);
                    ticket.isVoid = true;
                    db.update(ticket, ticket.token, function (err) {
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
        .controller('Tickets.Sync', ['$scope', '$q', '$http', function ($scope, $q, $http) {
            $scope.remote = {
                url: '',
                login: '',
                password: ''
            };

            $scope.submit = function () {
                var deferred = $q.defer();
                var db = require('lib-local/db.js');
                var request = require('request');

                $scope.promiseString = 'Syncing...';
                $scope.promise = deferred.promise;
                $scope.token = undefined;

                async.waterfall([
                    function (cb) {
                        $http({
                            url: $scope.remote.url + '/api/access_tokens.json',
                            method: 'POST',
                            data: {
                                email: $scope.remote.login,
                                password: $scope.remote.password
                            }
                        }).then(function successCallback(response) {
                            cb(null, response);
                        }, function errorCallback(response) {
                            cb(null, response);
                        });
                    },
                    function (res, cb) {
                        if (res.status === 200) {
                            cb(null, res.data.token);
                        } else if (res.status === 403) {
                            cb(new Error('Access Denied'), null);
                        } else {
                            cb(new Error('Unknown error: HTTP status ' + res.status), null);
                        }
                    },
                    function (token, cb) {
                        $http({
                            url: $scope.remote.url + '/api/data/dump/tickets.json',
                            method: 'GET',
                            headers: {
                                'X-Authentication': token
                            }
                        }).then(function successCallback(response) {
                            cb(null, response);
                        }, function errorCallback(response) {
                            cb(null, response);
                        });
                    },
                    function (res, cb) {
                        if (res.status === 200) {
                            cb(null, res.data);
                        } else if (res.status === 403) {
                            cb(new Error('Access Denied'), null);
                        } else {
                            cb(new Error('Unknown error: HTTP status ' + res.status), null);
                        }
                    },
                    function (tickets, cb) {
                        async.each(tickets, function (ticket, next) {
                            async.waterfall([
                                function (cb) {
                                    db.findOne({ token: ticket.token }, cb);
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
                });
            };
        }]);
})();
