angular.module('tickets.services.sync', [])
    .factory('App.Sync', ['App.Settings', '$http', 'PubSub', function (settings, $http, PubSub) {
        return {
            autoTimeout: null,
            pushTimeout: null,
            startBackgroundSync: function () {
                if (this.autoTimeout) {
                    clearTimeout(this.autoTimeout);
                }
                if (!settings.remote.interval) {
                    return;
                }

                var _this = this;
                function wrapSync() {
                    _this.syncRemote(function () {
                        _this.autoTimeout = setTimeout(wrapSync, settings.remote.interval * 60000);
                    });
                }
                wrapSync();
            },
            startBackgroundPush: function () {
                if (this.pushTimeout) {
                    clearTimeout(this.pushTimeout);
                }
                if (!settings.push.url) {
                    return;
                }

                var _this = this;
                function wrapPush() {
                    _this.pushPending(function () {
                        _this.pushTimeout = setTimeout(wrapPush, settings.push.backoff * 1000);
                    });
                }
                wrapPush();
            },
            syncRemote: function (callback) {
                var db = require('lib-local/db.js');
                if (!settings.remote.url || !settings.remote.login || !settings.remote.password) {
                    return callback();
                }
                var hasChanges = false;
                async.waterfall([
                    function (cb) {
                        $http({
                            url: settings.remote.url + '/api/access_tokens.json',
                            method: 'POST',
                            data: {
                                email: settings.remote.login,
                                password: settings.remote.password
                            }
                        }).then(function successCallback(response) {
                            cb(null, response);
                        }, function errorCallback(response) {
                            cb(null, response);
                        });
                    },
                    function (res, cb) {
                        if (res.status === 200) {
                            cb(null, res.data.token);
                        } else if (res.status === 403) {
                            cb(new Error('Access Denied'), null);
                        } else {
                            cb(new Error('Unknown error: HTTP status ' + res.status), null);
                        }
                    },
                    function (token, cb) {
                        $http({
                            url: settings.remote.url + '/api/data/dump/tickets.json',
                            method: 'GET',
                            headers: {
                                'X-Authentication': token
                            }
                        }).then(function successCallback(response) {
                            cb(null, response);
                        }, function errorCallback(response) {
                            cb(null, response);
                        });
                    },
                    function (res, cb) {
                        if (res.status === 200) {
                            cb(null, res.data);
                        } else if (res.status === 403) {
                            cb(new Error('Access Denied'), null);
                        } else {
                            cb(new Error('Unknown error: HTTP status ' + res.status), null);
                        }
                    },
                    function (tickets, cb) {
                        async.eachSeries(tickets, function (ticket, next) {
                            async.waterfall([
                                function (cb) {
                                    db.findOne({token: ticket.token}, cb);
                                },
                                function (existing_ticket, cb) {
                                    if (existing_ticket) {
                                        cb(null, existing_ticket);
                                    } else {
                                        hasChanges = true;
                                        db.create(ticket, cb);
                                    }
                                }
                            ], function (err) {
                                if (err) {
                                    return next(err);
                                }
                                if (settings.push.url) {
                                    sync.addPendingUpdate(ticket.uuid, ticket, next);
                                }
                            });
                        }, function (err) {
                            cb(err);
                        });
                    }
                ], function (err) {
                    if (err) {
                        console.log('Sync failed with error: ' + err.message);
                        return callback(err);
                    }
                    if (hasChanges) {
                        console.log('Sync completed - updating');
                        PubSub.publish('sync-update');
                    }
                    callback();
                });
            },
            pushLocal: function (ticket_uuid, update, callback) {
                var sync = require('lib-local/sync.js');
                sync.addPendingUpdate(ticket_uuid, update, callback);
            },
            pushPending: function (callback) {
                var sync = require('lib-local/sync.js');
                async.waterfall([
                    function (cb) {
                        sync.pendingUpdates(cb);
                    },
                    function (updates, cb) {
                        async.eachSeries(updates, function (update, next) {
                            async.waterfall([
                                function (cb) {
                                    $http({
                                        method: 'POST',
                                        url: settings.push.url + '/api/tickets/push.json',
                                        data: update
                                    }).then(function success(response) {
                                        if (response.status === 200) {
                                            sync.remove(update, update._id, cb);
                                        } else {
                                            if (response.status === 400) {
                                                console.log('Push update outdated');
                                                sync.remove(update, update._id, cb);
                                            }
                                        }
                                    }, function error(response) {
                                        if (response.status === 400) {
                                            console.log('Push update outdated');
                                            sync.remove(update, update._id, cb);
                                        } else {
                                            console.log('Push update failed for ticket UUID ' + update.ticket_uuid);
                                            cb();
                                        }
                                    });
                                }
                            ], next);
                        }, cb);
                    }
                ], function (err) {
                    if (err) {
                        console.log('Push failed with error: ' + err.message);
                        return callback(err);
                    }
                    callback();
                });
            }
        }
    }]);