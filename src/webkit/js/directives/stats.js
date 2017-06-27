angular.module('tickets.directives.stats', [])
    .directive('displayStats', ['App.Stats', 'PubSub', function (appStats, PubSub) {
        return {
            link: function (scope) {
                scope.stats = appStats.stats;
                PubSub.subscribe('stats-update', function () {
                    scope.stats = appStats.stats;
                });
            }
        };
    }]);