angular.module('tickets.services.socket', [])
    .factory('App.Socket', function () {
        return {
            socket: null,
            socketCallback: null,
            setSocket: function (socket) {
                this.socket = socket;
                this.socket.on('ticket.void', function (token) {
                    if (typeof this.socketCallback === 'function') {
                        this.socketCallback(token);
                    }
                });
            },
            setSocketCallback: function (callback) {
                if (typeof callback === 'function') {
                    this.socketCallback = callback;
                }
            },
            sendTicketVoid: function (token) {
                if (this.socket) {
                    this.socket.emit('ticket.void', token);
                }
            }
        }
    });