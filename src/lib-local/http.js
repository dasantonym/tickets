module.exports = function () {
    var http = require('http'),
        db = require('./db'),
        dbOrders = require('./db-orders'),
        connect = require('connect'),
        cors = require('cors'),
        async = require('async'),
        bodyParser = require('body-parser'),
        app = connect();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(function (req, res) {
        var querySplit = req.url.split('?');
        var baseurl = querySplit[0];
        var token = null;
        if (querySplit.length > 1) {
            token = querySplit[1];
        }
        switch (baseurl) {
            case '/api/tickets.json':
                db.find({}, function (err, tickets) {
                    res.contentType = 'application/json';
                    if (err) {
                        res.statusCode = 500;
                        res.end(JSON.stringify(err));
                    } else {
                        res.end(JSON.stringify(tickets));
                    }
                });
                break;
            case '/api/tickets/void.json':
                async.waterfall([
                    function (cb) {
                        db.findOne({ token: token }, cb);
                    },
                    function (ticket, cb) {
                        if (ticket) {
                            if (!ticket.valid) {
                                dbOrders.findOne({ uuid: ticket.order_uuid }, function (err, order) {
                                    if (err) {
                                        return cb(err);
                                    }
                                    if (order.amount_paid < order.amount_due && order.amount_due !== 0) {
                                        ticket.order_amount_due = order.amount_due;
                                        ticket.order_amount_paid = order.amount_paid;
                                        res.statusCode = 402;
                                        cb(new Error('Ticket Order not fully paid'), ticket);
                                    } else {
                                        res.statusCode = 403;
                                        cb(new Error('Ticket is invalid'), ticket);
                                    }
                                });
                            } else if (ticket.void) {
                                res.statusCode = 401;
                                cb(new Error('Ticket already claimed at ' + ticket.void_at), null);
                            } else {
                                ticket.void = true;
                                ticket.void_at = new Date();
                                ticket.updated_at = new Date();
                                db.update(ticket, token, function (err) {
                                    if (err) {
                                        res.statusCode = 500;
                                        return cb(err);
                                    }
                                    if (settings.push.url) {
                                        sync.addPendingUpdate(ticket.uuid, ticket, function (err) {
                                            cb(err, ticket);
                                        });
                                    } else {
                                        cb(err, ticket);
                                    }
                                });
                            }
                        } else {
                            res.statusCode = 404;
                            cb(new Error('Ticket not found'), null);
                        }
                    }
                ], function (err, ticket) {
                    if (err) {
                        if (!res.statusCode || res.statusCode === 200) {
                            res.statusCode = 500;
                        }
                        res.end(JSON.stringify({ error: err.message, ticket: ticket }));
                    } else {
                        res.statusCode = 200;
                        res.end(JSON.stringify({ success: true, ticket: ticket }));
                    }
                });
                break;
            case '/api/tickets/push.json':
                async.waterfall([
                    function (cb) {
                        db.findOne({uuid: req.body.ticket_uuid}, cb);
                    },
                    function (ticket, cb) {
                        if (ticket) {
                            if (ticket.updated_at < req.body.update.updated_at) {
                                db.update(req.body, token, function (err) {
                                    res.statusCode = 200;
                                    cb(err);
                                });
                            } else {
                                res.statusCode = 400;
                                cb(new Error('outdated'));
                            }
                        } else {
                            res.statusCode = 201;
                            db.create(req.body.update, cb);
                        }
                    }
                ], function (err, ticket) {
                    if (err) {
                        if (!res.statusCode || res.statusCode === 200) {
                            res.statusCode = 500;
                        }
                        res.end(JSON.stringify({error: err.message}));
                    } else {
                        res.statusCode = 200;
                        res.end(JSON.stringify({}));
                    }
                });
                break;
            default:
                res.statusCode = 404;
                res.end();
                break;
        }
    });
    http.createServer(app).listen(9999);
};