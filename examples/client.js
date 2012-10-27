var Connection = require("../index.js");

var options = {
    host: "localhost",
    port: 8080,
    rest: "/exist/rest"
};
var connection = new Connection(options);

var query = connection.query("//SPEECH[ft:query(., $term)]", { chunkSize: 20 });
query.bind("term", "love").each(function(item) {
    console.log(item);
});