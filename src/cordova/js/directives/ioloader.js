angular.module("tickets.directives.ioloader", []).directive("ioLoader", ['App.Socket', function (appSocket) {
    function load(file) {
        var filetag = document.createElement('script');
        filetag.setAttribute("type", "text/javascript");
        filetag.setAttribute("src", file);
        if (typeof filetag !== "undefined") {
            document.getElementsByTagName("head")[0].appendChild(filetag);
        }
    }
    function pollSocket(ipAdress) {
        window.setTimeout(function () {
            if (typeof io === 'function') {
                var socket = io("http://" + ipAdress + ":7777");
                appSocket.setSocket(socket);
                appSocket.setSocketCallback(function (token) {
                    console.log('void', token);
                });
                console.log('connected socket');
            } else {
                console.log('io not defined, retrying', io);
                window.setTimeout(function () {
                    pollSocket(ipAdress);
                }, 0);
            }
        },500);
    }
    return {
        restrict: "E",
        scope: {ipAddress: "@"},
        link: function (scope, iElem, iAttrs) {
            console.log(iAttrs.ipAddress);
            if (iAttrs.ipAddress) {
                load("http://" + iAttrs.ipAddress + ":7777/socket.io/socket.io.js");
                pollSocket(iAttrs.ipAddress);
            }
            iAttrs.$observe("ipAddress", function () {
                if (iAttrs.ipAddress) {
                    load("http://" + iAttrs.ipAddress + ":7777/socket.io/socket.io.js");
                    pollSocket(iAttrs.ipAddress);
                }
            });
        }
    }
}]);