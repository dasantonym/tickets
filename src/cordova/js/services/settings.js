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
            }
        }
    }]);