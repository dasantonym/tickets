angular.module('tickets.services.heartbeat', [])
.factory('App.Heartbeat', ['$http', function ($http) {
    return {
        target: null,
        interval: 2000,
        timeout: null,
        status: null,
        setup: function (target, interval) {
            this.target = target;
            this.interval = interval || 2000;
        },
        start: function () {
            if (typeof this.target !== 'string') {
                return;
            }
            this.stop();
            var _this = this;
            function wrap() {
                $http.get(_this.target)
                .then(function (res) {
                    _this.status = res.status === 200;
                    _this.timeout = setTimeout(wrap, _this.interval);
                }, function () {
                    _this.status = false;
                    _this.timeout = setTimeout(wrap, _this.interval);
                });
            }
            wrap();
        },
        stop: function () {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
        }
    }
}]);