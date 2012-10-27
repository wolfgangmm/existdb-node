/**
 * A client library for the eXist-db Native XML Database.
 *
 * @author Wolfgang Meier
 */
var Query = require("./lib/query");
var fs = require("fs");
var http = require("http");
var path = require("path");
var events = require("events");
var Stream = require("stream");
var util = require("util");

function Connection(options) {
    this.config = options;
}

Connection.prototype.query = function(xquery, options) {
    return new Query(xquery, this.config, options);
};

Connection.prototype.get = function(path, callback) {
    var params = "?_xsl=no&_indent=yes";
    var options = {
        host: this.config.host,
        port: this.config.port,
        method: "GET",
        path: this.config.rest + path + params,
        auth: this.config.auth || "guest:guest"
    };
    var stream = new DownloadStream();
    callback(stream);
    var req = http.request(options, function(res) {
        res.setEncoding("UTF-8");
        res.on("error", function(err) {
            stream.emit("error", err);
        });
        res.on("data", function(data) {
            stream.emit("data", data);
        });
        res.on("end", function() {
            if (res.statusCode != 200) {
                stream.emit("error", new Error(res.statusCode));
                return;
            }
            stream.emit("end");
        });
    });
    req.end();
};

Connection.prototype.store = function(file, collection /* , targetName, callback */) {
    var targetName, callback;
    if (typeof arguments[arguments.length - 1] === 'function') {
        callback = arguments[arguments.length - 1];
    }
    if (arguments.length > 2 && typeof arguments[2] === 'string') {
        targetName = arguments[2];
    } else {
        targetName = path.basename(file);
    }

    var self = this;

    fs.exists(file, function(exists) {
        if (exists) {
            var options = {
                host: self.config.host,
                port: self.config.port,
                method: "PUT",
                path: self.config.rest + collection + "/" + targetName,
                auth: self.config.auth || "guest:guest"
            };
            var is = fs.createReadStream(file, { bufferSize: 512 * 1024 });
            var req = http.request(options, function(res) {
                res.on("end", function() {
                    if (callback) {
                        callback(null, res.statusCode);
                    }
                });
                res.on("error", function(e) {
                    callback(e);
                });
            });
            is.on("data", function(data) {
                req.write(data);
            });
            is.on("close", function() {
                req.end();
            });
        }
    });
};

/**
 * Implements a readable stream. Passed to Connection.get callback function.
 *
 * @constructor
 */
function DownloadStream() {
    Stream.call(this);

    this.readable = true;
}

util.inherits(DownloadStream, Stream);

module.exports = Connection;