angular.module('tickets.services.backup', [])
.factory('App.Backup', ['App.Settings', '$http', 'PubSub', function (settings) {
    var require = global.require,
        fs = require('fs'),
        path = require('path'),
        nwGui = require('nw.gui');
    return {
        save: function () {

        },
        restore: function () {

        }
    }
}]);