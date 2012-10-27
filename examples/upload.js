
var args = process.argv.slice(2);
if (args.length < 2) {
    console.log("Usage: node upload.js file-path target-path");
    return;
}

console.log("Uploading %s to %s ...", args[0], args[1]);

var Connection = require("../index.js");

var options = {
    host: "localhost",
    port: 8080,
    rest: "/exist/rest",
    auth: "admin:"
};
var connection = new Connection(options);
connection.store(args[0], args[1], function(err) {
    if (err) {
        console.log("Error: " + err);
        return;
    }
    console.log("Upload completed!");
});