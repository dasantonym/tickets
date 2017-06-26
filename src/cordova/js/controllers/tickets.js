(function () {
    'use strict';
    angular.module(
        'tickets.controllers.tickets', [])
        .controller('Tickets.Scan', ['$scope', '$q', '$routeParams', 'App.Socket', 'App.Settings', function ($scope, $q, $routeParams, appSocket, appSettings) {
            $scope.scan = function () {
                cordova.plugins.barcodeScanner.scan(
                    function (res) {
                        if (!res.cancelled) {
                            console.log(res.text, 'http://' + appSettings.remote.ip + ':9999/api/tickets/void.json?' + res.text);
                            var req = new XMLHttpRequest();
                            req.open('GET', 'http://' + appSettings.remote.ip + ':9999/api/tickets/void.json?' + res.text, true);
                            req.setRequestHeader('Content-Type', 'application/json');
                            req.onreadystatechange = function () {
                                if (req.readyState === 4) {
                                    if (req.status === 200) {
                                        var response = JSON.parse(req.responseText);
                                        if (response.success) {
                                            $scope.alerts = [
                                                {
                                                    type: 'success',
                                                    msg: 'Ticket is valid',
                                                    ticket: response.ticket
                                                }
                                            ];
                                        } else {
                                            $scope.alerts = [
                                                {
                                                    type: 'danger',
                                                    msg: response.error
                                                }
                                            ];
                                        }
                                    } else {
                                        $scope.alerts = [
                                            {
                                                type: 'danger',
                                                msg: 'Server connection failed with status: ' + req.status
                                            }
                                        ];
                                        console.log({
                                            code: req.status,
                                            message: null
                                        }, req.responseText);
                                    }
                                    $scope.$apply();
                                }
                            };
                            req.send();
                        }
                    },
                    function (err) {
                        $scope.alerts = [
                            {
                                type: 'danger',
                                msg: 'Scan failed: ' + err
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
                    var contents = [ticket.firstname, ticket.lastname, ticket.ticket_key].join(' ');
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