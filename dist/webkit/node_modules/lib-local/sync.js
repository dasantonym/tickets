var Datastore = require('nedb'),
    path = require('path'),
    db = new Datastore({filename: path.resolve(global.require('nw.gui').App.dataPath, 'sync.db'), autoload: true});

module.exports.pendingUpdates = function (callback) {
    db.find({ type: 'pending' }, function (err, docs) {
        if (typeof callback === 'function') {
            callback(err, docs);
        }
    });
};

module.exports.addPendingUpdate = function (ticket_uuid, update, callback) {
    db.insert({ type: 'pending', ticket_uuid: ticket_uuid, update: update }, function (err, numReplaced) {
        if (typeof callback === 'function') {
            callback(err, numReplaced);
        }
    });
};

module.exports.remove = function (doc, docId, callback) {
    db.remove({_id: docId}, {}, function (err, numRemoved) {
        if (typeof callback === 'function') {
            callback(err, numRemoved);
        }
    });
};

module.exports.empty = function (callback) {
    db.remove({}, {multi: true}, function (err, numRemoved) {
        if (typeof callback === 'function') {
            callback(err);
        }
    });
};