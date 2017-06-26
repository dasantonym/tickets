angular.module("tickets.directives.ioloader", []).directive("ioLoader", ['App.Socket', 'PubSub', function (appSocket, PubSub) {
    function load(file) {
        var filetag = document.createElement('script');
        filetag.setAttribute("type", "text/javascript");
        filetag.setAttribute("src", file);
        if (typeof filetag !== "undefined") {
            document.getElementsByTagName("head")[0].appendChild(filetag);
        }
    }

    function pollSocket(ipAddress) {
        window.setTimeout(function () {
            if (typeof io === 'function' && typeof ipAddress === 'string') {
                var socket = io("http://" + ipAddress + ":7777");
                appSocket.setSocket(socket);
                appSocket.setSocketCallback(function (token) {
                    console.log('void', token);
                    PubSub.publish('void-update', token);
                });
                console.log('connected socket');
            } else {
                console.log('io not defined or empty ip, retrying');
                window.setTimeout(function () {
                    pollSocket(ipAddress);
                }, 0);
            }
        }, 500);
    }

    return {
        restrict: "E",
        scope: {
            ipAddress: "@"
        },
        link: function (scope, iElem, iAttrs) {
            function setup() {
                if (iAttrs.ipAddress) {
                    load("http://" + iAttrs.ipAddress + ":7777/socket.io/socket.io.js");
                    pollSocket(iAttrs.ipAddress);
                }
            }
            iAttrs.$observe("ipAddress", function () {
                setup();
            });
        }
    }
}]);