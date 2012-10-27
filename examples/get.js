
var args = process.argv.slice(2);
if (args.length < 1) {
    console.log("Usage: node get.js path-to-resource");
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
    // collect input and print it out upon end
    var data = [];
    res.on("data", function(chunk) {
        data.push(chunk);
    });
    res.on("end", function() {
        console.log(data.join(""));
    });
    res.on("error", function(err) {
        console.log("error: " + err);
    });
});
