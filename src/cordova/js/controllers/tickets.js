(function () {
    'use strict';
    angular.module(
        'tickets.controllers.tickets', [])
        .controller('Tickets.Scan', ['$scope', '$rootScope', '$q', '$routeParams', 'App.Settings', '$http',
                function ($scope, $rootScope, $q, $routeParams, appSettings, $http) {

            $scope.settings = appSettings;
            $scope.heartbeat = $rootScope.heartbeat;

            $scope.scan = function () {
                if (typeof appSettings.remote.ip !== 'string') {
                    $scope.$applyAsync(function () {
                        $scope.alerts = [{
                            type: 'danger',
                            msg: 'Set target in settings first.'
                        }];
                    });
                }
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
                                if (response.data.success) {
                                    $scope.$applyAsync(function () {
                                        $scope.alerts = [{
                                            type: 'success',
                                            msg: 'Ticket is valid',
                                            ticket: response.data.ticket
                                        }];
                                    });
                                } else {
                                    $scope.$applyAsync(function () {
                                        $scope.alerts = [{
                                            type: 'danger',
                                            msg: response.data.error,
                                            ticket: response.data.ticket
                                        }];
                                    });
                                }
                            }, function error(response) {
                                var msg;
                                switch (response.status) {
                                    case 401:
                                        msg = 'Ticket was already claimed at ' + ticket.void_at;
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
                                        if (!msg) {
                                            msg = 'Request failed with status ' + response.status;
                                        }
                                        break;
                                }
                                if (msg) {
                                    $scope.$applyAsync(function () {
                                        $scope.alerts = [{
                                            type: 'danger',
                                            msg: msg
                                        }];
                                    });
                                }
                            });
                        }
                    },
                    function (err) {
                        $scope.$applyAsync(function () {
                            $scope.alerts = [{
                                type: 'danger',
                                msg: 'Scan failed: ' + err.message
                            }];
                        });
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
                $rootScope.$applyAsync(function () {
                    $rootScope.remote = {
                        ip: $scope.remote.ip
                    };
                });
                $scope.alerts = [{
                    type: 'success',
                    msg: 'Settings saved'
                }];
            };
        }]);
})();