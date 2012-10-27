/**
 * Created with IntelliJ IDEA.
 * User: wolf
 * Date: 27.10.12
 * Time: 12:12
 * To change this template use File | Settings | File Templates.
 */
var Query = require("./lib/query");

function Connection(options) {
    this.config = options;
}

Connection.prototype.query = function(xquery, options) {
    return new Query(xquery, this.config, options);
};

module.exports = Connection;