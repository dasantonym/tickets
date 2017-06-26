angular.module('tickets.services.sync', [])
    .factory('App.Sync', ['App.Settings', '$http', 'PubSub', function (settings, $http, PubSub) {
        return {
            startBackgroundSync: function () {
                var _this = this;
                function wrapSync() {
                    _this.syncRemote(function () {
                        setTimeout(wrapSync, 60000);
                    });
                }
                wrapSync();
            },
            syncRemote: function (callback) {
                var db = require('lib-local/db.js');
                if (!settings.remote.url || !settings.remote.login || !settings.remote.password) {
                    return callback();
                }
                console.log('syncing...');
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
                        async.each(tickets, function (ticket, next) {
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
                                next(err);
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
                        console.log('sync completed - updating');
                        PubSub.publish('sync-update');
                    } else {
                        console.log('sync completed - no updates');
                    }
                    callback();
                });
            },
            pushLocal: function () {

            }
        }
    }]);