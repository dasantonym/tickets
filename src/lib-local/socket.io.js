var connect = require('connect');
var app = connect();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./db');
var socket = null;

// io.set('origins', '*');

module.exports.setup = function () {
    io.on('connection', function (iosocket) {
        socket = iosocket;
        console.log('connected');
        socket.on('ticket.void', function (token) {
            console.log('npm socket void', token);
        });
    });
    http.listen(7777, function () {
        console.log('Socket.IO listening on *:7777');
    });
};
module.exports.sendTicketResponse = function (valid) {
    if (typeof socket === 'object') {
        socket.emit('ticket.void.response', valid);
    } else {
        console.log('socket not connected!');
    }
};