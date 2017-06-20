angular.module('tickets.services.socket', [])
    .factory('App.Socket', function () {
        return {
            socket: null,
            socketCallback: null,
            setSocket: function (socket) {
                this.socket = socket;
                this.socket.on('ticket.void', function (ticket_key) {
                    if (typeof this.socketCallback === 'function') {
                        this.socketCallback(ticket_key);
                    }
                });
            },
            setSocketCallback: function (callback) {
                if (typeof callback === 'function') {
                    this.socketCallback = callback;
                }
            },
            sendTicketVoid: function (ticket_key) {
                if (this.socket) {
                    this.socket.emit('ticket.void', ticket_key);
                }
            }
        }
    });