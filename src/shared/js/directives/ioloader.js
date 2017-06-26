angular.module("tickets.directives.ioloader", []).directive("ioLoader", ['App.Socket', 'PubSub', function (appSocket, PubSub) {
    function load(file) {
        var existing = document.getElementById("socketScript"),
            filetag = document.createElement('script');

        filetag.setAttribute("id", "socketScript");
        filetag.setAttribute("type", "text/javascript");
        filetag.setAttribute("src", file);

        if (existing && filetag.src !== existing.src) {
            document.getElementsByTagName("head")[0].removeChild(existing);
            document.getElementsByTagName("head")[0].appendChild(filetag);
        } else if (filetag && !existing) {
            document.getElementsByTagName("head")[0].appendChild(filetag);
        }
    }

    function pollSocket(ipAddress) {
        window.setTimeout(function () {
            if (typeof io === 'function' && typeof ipAddress === 'string') {
                var socket = io("http://" + ipAddress + ":7777");
                appSocket.setSocket(socket);
                appSocket.setSocketCallback(function (token) {
                    console.log('Socket.io void callback with token:', token);
                    PubSub.publish('void-update', token);
                });
                console.log('Socket.io connected');
            } else {
                console.log('Socket.io not defined or empty IP, retrying');
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