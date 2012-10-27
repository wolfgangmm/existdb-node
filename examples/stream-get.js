
var args = process.argv.slice(2);
if (args.length < 1) {
    console.log("Usage: node stream-get.js path-to-resource");
    return;
}

var Connection = require("../index.js");

var options = {
    host: "localhost",
    port: 8080,
    rest: "/exist/rest",
    auth: "admin:"
};
var connection = new Connection(options);
connection.get(args[0], function(res) {
    // pipe all input directly to stdout
    res.pipe(process.stdout);
});

