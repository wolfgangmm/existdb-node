/**
 * Created with IntelliJ IDEA.
 * User: wolf
 * Date: 27.10.12
 * Time: 14:26
 * To change this template use File | Settings | File Templates.
 */

var http = require("http");

function Query(xquery, config, options) {
    var self = this;
    this.xquery = xquery;
    this.variables = {};
    this.config = config;
    this.options = {
        chunkSize: 10
    };
    if (options) {
        for (var name in options) {
            self.options[name] = options[name];
        }
    }
    this.postOptions = {
        host: config.host,
        port: config.port,
        method: "POST",
        path: config.rest + "/db/"
    };
}

module.exports = Query;

Query.prototype.bind = function(name, value) {
    this.variables[name] = value;
    return this;
};

Query.prototype.each = function(callback) {
    var self = this;

    var offset = 1;
    var hits = 0;
    var sessionId = null;

    function nextChunk() {
        var options = {
            start: offset,
            chunkSize: self.options.chunkSize,
            method: "json"
        };
        if (sessionId) {
            options.session = sessionId;
        } else {
            options.cache = "yes";
        }
        var postBody = createPostBody(options, self.xquery, self.variables);
        var req = http.request(self.postOptions, function(res) {
            var received = "";
            res.setEncoding("UTF-8");
            res.on("data", function(data) {
                received += data;
            });
            res.on("error", function(e) {
                console.log("Request failed: " + e);
            });
            res.on("end", function() {
                var data = JSON.parse(received);
                offset = data.start + data.count;
                hits = data.hits;
                sessionId = data.session;
                if (Array.isArray(data.data)) {
                    for (var i = 0; i < data.data.length; i++) {
                        callback(data.data[i]);
                    }
                } else {
                    callback(data.data);
                }
                if (offset < hits) {
                    nextChunk();
                }
            });
        });

        req.write(postBody);
        req.end();
    }

    nextChunk();
};

function createPostBody(options, query, variables) {
    var body = "<query xmlns=\"http://exist.sourceforge.net/NS/exist\" ";
    for (var key in options) {
        body += key + "=\"" + options[key] + "\" ";
    }
    body += ">\n";
    if (variables) {
        body += "<variables>";
        for (var variable in variables) {
            body += "<variable xmlns:sx=\"http://exist-db.org/xquery/types/serialized\">" +
                "<qname><localname>" + variable + "</localname></qname>" +
                serialize(variables[variable]) +
                "</variable>";
        }
        body += "</variables>";
    }
    body += "   <text><![CDATA[" + query + "]]></text>\n";
    body += "</query>";
    return body;
}

function serialize(data) {
    var sequence = "<sx:sequence>";
    if (Array.isArray(data)) {
        for (var i = 0; i < data.length; i++) {
            sequence += serializeValue(data[i]);
        }
    } else {
        sequence += serializeValue(data);
    }
    sequence += "</sx:sequence>";
    return sequence;
}

function serializeValue(value) {
    var type = "xs:string";
    if (typeof value === "number") {
        if (value % 1 != 0) {
            type = "xs:double";
        } else {
            type = "xs:integer";
        }
    }
    return "<sx:value type=\"" + type + "\">" + value + "</sx:value>";
}