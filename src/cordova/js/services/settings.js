angular.module('tickets.services.settings', [])
    .factory('App.Settings', ['$rootScope', 'App.Heartbeat', function ($rootScope, appHeartbeat) {
        return {
            remote: {
                ip: localStorage["remote.ip"]
            },
            storeRemote: function (ipAddress) {
                this.remote.ip = ipAddress;
                localStorage["remote.ip"] = this.remote.ip;
                appHeartbeat.setup(this.remote.ip);
                $rootScope.remote.ip = ipAddress;
            }
        }
    }]);