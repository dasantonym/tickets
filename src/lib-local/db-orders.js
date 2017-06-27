var Datastore = require('nedb'),
    path = require('path'),
    db = new Datastore({filename: path.resolve(global.require('nw.gui').App.dataPath, 'orders.db'), autoload: true});

module.exports.find = function (query, callback) {
    db.find(query, function (err, docs) {
        if (typeof callback === 'function') {
            callback(err, docs);
        }
    });
};

module.exports.findOne = function (query, callback) {
    db.findOne(query, function (err, doc) {
        if (typeof callback === 'function') {
            callback(err, doc);
        }
    });
};

module.exports.create = function (doc, callback) {
    db.insert(doc, function (err, doc) {
        if (typeof callback === 'function') {
            callback(err, doc);
        }
    });
};

module.exports.update = function (doc, uuid, callback) {
    db.update({uuid: uuid}, doc, {}, function (err, numReplaced) {
        if (typeof callback === 'function') {
            callback(err, numReplaced);
        }
    });
};

module.exports.upsert = function (doc, uuid, callback) {
    db.update({uuid: uuid}, doc, {upsert: true}, function (err, numReplaced) {
        if (typeof callback === 'function') {
            callback(err, numReplaced);
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