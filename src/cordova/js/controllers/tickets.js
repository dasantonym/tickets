(function () {
    'use strict';
    angular.module(
        'tickets.controllers.tickets', [])
        .controller('Tickets.Scan', ['$scope', '$q', '$routeParams', 'App.Socket', 'App.Settings', 'App.Heartbeat', '$http',
                function ($scope, $q, $routeParams, appSocket, appSettings, appHeartbeat, $http) {

            $scope.settings = appSettings;

            $scope.heartbeat = appHeartbeat;
            $scope.heartbeat.setup('http://' + appSettings.remote.ip + ':9999/api/heartbeat.json');
            $scope.heartbeat.start();

            $scope.scan = function () {
                cordova.plugins.barcodeScanner.scan(
                    function (res) {
                        if (!res.cancelled) {
                            $http({
                                method: 'POST',
                                url: 'http://' + appSettings.remote.ip + ':9999/api/tickets/void.json',
                                data: { token: res.text },
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }).then(function success(response) {
                                var msg;
                                switch (response.status) {
                                    case 200:
                                        if (response.data.success) {
                                            $scope.$applyAsync(function () {
                                                $scope.alerts = [{
                                                    type: 'success',
                                                    msg: 'Ticket is valid',
                                                    ticket: response.data.ticket
                                                }];
                                            });
                                            if (response.data.ticket) {
                                                appSocket.sendTicketVoid(response.data.ticket.token);
                                            }
                                        } else {
                                            $scope.$applyAsync(function () {
                                                $scope.alerts = [{
                                                    type: 'danger',
                                                    msg: response.data.error,
                                                    ticket: response.data.ticket
                                                }];
                                            });
                                        }
                                        break;
                                    case 401:
                                        msg = response.data.error;
                                        break;
                                    case 402:
                                        if (response.data.ticket) {
                                            msg = 'Ticket not fully paid: €' + response.data.ticket.order_amount_paid +
                                                ' of €' + response.data.ticket.order_amount_due;
                                        } else {
                                            msg = 'Ticket payment incomplete';
                                        }
                                        break;
                                    case 403:
                                        msg = 'Ticket invalid';
                                        break;
                                    case 404:
                                        msg = 'Ticket unknown';
                                        break;
                                    case 500:
                                        msg = 'Internal Error';
                                        break;
                                    default:
                                        msg = 'Request failed with status ' + response.status;
                                        break;
                                }
                                $scope.$applyAsync(function () {
                                    $scope.alerts = [{
                                        type: 'danger',
                                        msg: msg
                                    }];
                                });
                            }, function error(response) {
                                $scope.$applyAsync(function () {
                                    $scope.alerts = [{
                                        type: 'danger',
                                        msg: 'Request failed with status ' + response.status
                                    }];
                                });
                            });
                        }
                    },
                    function (err) {
                        $scope.alerts = [
                            {
                                type: 'danger',
                                msg: 'Scan failed: ' + err.message
                            }
                        ];
                    }
                );
            };
        }])
        .controller('Tickets.Settings', ['$scope', '$q', '$routeParams', 'App.Settings', '$rootScope', function ($scope, $q, $routeParams, appSettings, $rootScope) {
            $scope.remote = {
                ip: appSettings.remote.ip
            };
            $scope.submit = function () {
                appSettings.storeRemote($scope.remote.ip);
                $rootScope.remote = {
                    ip: $scope.remote.ip
                };
                $scope.alerts = [
                    {
                        type: 'success',
                        msg: 'Settings saved'
                    }
                ];
            };
        }])
        .controller('Tickets.List', ['$scope', '$q', '$routeParams', 'App.Settings', function ($scope, $q, $routeParams, appSettings) {
            $scope.tickets = [];
            $scope.filter = {
                query: null
            };

            $scope.$watch('filter.query', function (query) {
                async.each($scope.tickets, function (ticket, next) {
                    var contents = [ticket.firstname, ticket.lastname, ticket.token].join(' ');
                    if (contents.indexOf(query) < 0) {
                        $scope.tickets[$scope.tickets.indexOf(ticket)].hideEntry = true;
                    } else {
                        $scope.tickets[$scope.tickets.indexOf(ticket)].hideEntry = false;
                    }
                    next();
                });
            });

            var req = new XMLHttpRequest();
            req.open('GET', 'http://' + appSettings.remote.ip + ':9999/api/tickets/all.json', true);
            req.setRequestHeader('Content-Type', 'application/json');
            req.onreadystatechange = function () {
                if (req.readyState === 4) {
                    if (req.status === 200) {
                        $scope.tickets = JSON.parse(req.responseText);
                        $scope.$apply();
                    } else {
                        console.log({
                            code: req.status,
                            message: null
                        }, req.responseText);
                    }
                }
            };
            req.send();
        }]);
})();