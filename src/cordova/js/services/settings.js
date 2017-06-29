angular.module('tickets.services.settings', [])
    .factory('App.Settings', ['$rootScope', function ($rootScope) {
        return {
            remote: {
                ip: localStorage["remote.ip"]
            },
            storeRemote: function (ipAddress) {
                this.remote.ip = ipAddress;
                localStorage["remote.ip"] = this.remote.ip;
                $rootScope.remote.ip = ipAddress;
                $rootScope.heartbeat.setup('http://' + ipAddress + ':9999/api/heartbeat.json');
                $rootScope.heartbeat.start();
            }
        }
    }]);