angular.module('tickets.services.backup', [])
.factory('App.Backup', ['App.Settings', function (settings) {
    var require = global.require,
        fs = require('fs-extra'),
        path = require('path'),
        db = require('lib-local/db'),
        dbOrders = require('lib-local/db-orders'),
        sync = require('lib-local/sync');
    return {
        autoBackupTimeout: null,
        startBackgroundAutoBackup: function () {
            if (this.autoBackupTimeout) {
                clearTimeout(this.autoBackupTimeout);
            }
            if (!settings.backup.backupInterval || !settings.backup.autoBackupPath) {
                return;
            }

            var _this = this;
            function wrap() {
                var time = Date.now().toString();
                while (time.length < 16) {
                    time = '0' + time;
                }
                _this.save(path.join(settings.backup.autoBackupPath, 'tickets-' + time), function () {
                    _this.autoBackupTimeout = setTimeout(wrap, settings.backup.backupInterval * 60000);
                });
            }
            wrap();
        },
        save: function (destination, callback) {
            async.waterfall([
                function (cb) {
                    fs.ensureDir(destination, function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    db.find({}, function (err, tickets) {
                        if (err) {
                            return cb(err);
                        }
                        fs.writeFile(path.join(destination, 'tickets.json'), JSON.stringify(tickets), cb);
                    });
                },
                function (cb) {
                    dbOrders.find({}, function (err, orders) {
                        if (err) {
                            return cb(err);
                        }
                        fs.writeFile(path.join(destination, 'orders.json'), JSON.stringify(orders), cb);
                    });
                },
                function (cb) {
                    sync.pendingUpdates(function (err, updates) {
                        if (err) {
                            return cb(err);
                        }
                        fs.writeFile(path.join(destination, 'updates.json'), JSON.stringify(updates), cb);
                    });
                },
                function (cb) {
                    fs.writeFile(path.join(destination, 'settings.json'), JSON.stringify({
                        remote: settings.remote,
                        push: settings.push,
                        stats: settings.stats,
                        backup: settings.backup
                    }), cb);
                }
            ], function (err) {
                callback(err);
            });
        },
        restore: function (source, callback) {
            async.waterfall([
                function (cb) {
                    fs.stat(source, function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    db.empty(cb);
                },
                function (cb) {
                    fs.readFile(path.join(source, 'tickets.json'), cb);
                },
                function (data, cb) {
                    var tickets = JSON.parse(data);
                    async.eachSeries(tickets, function (ticket, next) {
                        db.create(ticket, function (err) {
                            next(err);
                        });
                    }, function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    dbOrders.empty(cb);
                },
                function (cb) {
                    fs.readFile(path.join(source, 'orders.json'), cb);
                },
                function (data, cb) {
                    var orders = JSON.parse(data);
                    async.eachSeries(orders, function (ticket, next) {
                        dbOrders.create(order, function (err) {
                            next(err);
                        });
                    }, function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    sync.empty(cb);
                },
                function (cb) {
                    fs.readFile(path.join(source, 'updates.json'), cb);
                },
                function (data, cb) {
                    var updates = JSON.parse(data);
                    async.eachSeries(updates, function (update, next) {
                        sync.addPendingUpdate(update.ticket_uuid, update.update, function (err) {
                            next(err);
                        });
                    }, function (err) {
                        cb(err);
                    });
                },
                function (cb) {
                    fs.readFile(path.join(source, 'settings.json'), cb);
                },
                function (data, cb) {
                    var config = JSON.parse(data);
                    settings.storeRemote(
                        config.remote.url, config.remote.login, config.remote.password, config.remote.interval);
                    settings.storePush(config.push.url, config.push.interval);
                    settings.storeStats(config.stats.last_sync, config.stats.last_push);
                    settings.storeBackup(config.backup.backupInterval, config.backup.autoBackupPath);
                    cb();
                }
            ], function (err) {
                callback(err);
            });
        }
    }
}]);