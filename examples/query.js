var Connection = require("../index.js");

var options = {
    host: "localhost",
    port: 8080,
    rest: "/exist/rest",
    auth: "admin:"
};
var connection = new Connection(options);

var query = connection.query("//SPEECH[ft:query(., $term)]", { chunkSize: 20 });
query.on("error", function(err) {
    console.log("An error occurred: " + err);
});
query.bind("term", "love").each(function(item, hits, offset) {
    console.log("Item %d out of %d:", offset, hits);
    console.log(item);
});