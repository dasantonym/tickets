var Datastore = require('nedb'),
    path = require('path'),
    db = new Datastore({ filename: path.resolve(global.require('nw.gui').App.dataPath, 'tickets.db'), autoload: true });

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

module.exports.update = function (doc, token, callback) {
    db.update({token: token }, doc, {}, function (err) {
        if (typeof callback === 'function') {
            callback(err);
        }
    });
};

module.exports.upsert = function (doc, token, callback) {
    db.update({token: token}, doc, {upsert: true}, function (err) {
        if (typeof callback === 'function') {
            callback(err);
        }
    });
};

module.exports.remove = function (doc, docId, callback) {
    db.remove({ _id: docId }, {}, function (err) {
        if (typeof callback === 'function') {
            callback(err);
        }
    });
};

module.exports.empty = function (callback) {
    db.remove({}, {multi: true}, function (err) {
        if (typeof callback === 'function') {
            callback(err);
        }
    });
};