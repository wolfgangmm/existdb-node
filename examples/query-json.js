var args = process.argv.slice(2);
if (args.length < 1) {
    console.log("Usage: node query-json.js collection-path");
    return;
}

var Connection = require("../index.js");
var fs = require("fs");

var options = {
    host: "localhost",
    port: 8080,
    rest: "/exist/rest",
    auth: "admin:"
};
var connection = new Connection(options);

var xquery = fs.readFileSync("examples/list-collection.xql", "UTF-8");

var query = connection.query(xquery, { chunkSize: 100 });
query.bind("collection", args[0]);
query.on("error", function(err) {
    console.log("An error occurred: " + err);
});
query.each(function(rows) {
    rows.forEach(function(row) {
        console.log("%s\t%s\t%s", row.name, row.permissions, row.modified);
    });
});
