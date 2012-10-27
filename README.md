node.js Client Module for the eXist-db Native XML Database
==========================================================

This is a client module to access an eXist-db XML database (http://exist-db.org) instance from node.js.

API
---

All functionality is provided through a Connection object:

	var Connection = require("../index.js");

	var options = {
	    host: "localhost",
	    port: 8080,
	    rest: "/exist/rest",
	    auth: "guest:guest"
	};
	var connection = new Connection(options);

The options object defines the parameters to be used for requests to the database. The API uses eXist-db's REST API. The parameters given in the example above should work for a default installation of eXist-db.

	connection.get(path, callback)

The get method retrieves a resource from the server. The first argument, path, defines the database path of the resource
to retrieve. The second argument is a callback function, which will receive a Readable Stream as single argument. For 
large resources, data is sent in chunks and passed to the stream object via the "data" event. The following example collects all data and prints it out upon "end":

	connection.get(path, function(res) {
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

Since resources might be huge, collecting data in memory might not be a good idea though.

	connection.store(filePath, targetPath, [targetName, callback])

Uploads data read from filePath to the database collection given in targetPath. If targetName is specified, it will be used
as the name of the resource to write to. If it is undefined, the resource name will be the same as the file name. If the
target resource does already exist, it will be overwritten.

The optional callback function will be called after the uploading completed or when an error occurred. In case of an error,
the error message will be passed as parameter.

	connection.query(xquery, options)

Prepare an XQuery to be executed on the database. The method returns a Query object, which can then be used to set 
variables and run the query. To limit memory consumption, not all items of the query result are returned at once. They are
retrieved in chunks instead.

The optional options argument may currently define one additional property:

* chunkSize: the number of result items to return in one request

The Query object returned by connection.query has the following methods:

	query.bind(name, value)

Binds the external XQuery variable given by name to the specified value. If the value is an array, it will be converted to an XQuery sequence. Numbers are cast to the appropriate XQuery type.

	query.each(callback)

Execute the query on the server. Results are passed to the provided callback function, which receives 3 parameters:

* item: the current item from the query result sequence
* hits: the total number of items in the result sequence
* offset: the current offset into the result sequence (starting at 1)

item will be a string if the query result item is an XML node or an atomic type. If the XQuery returned results using 
the JSON serialization, item will be a Javascript object or array (depending on the JSON returned).

If an error occurs while executing the query, an "error" event will be emitted. You can subscribe to this event on the
query object.

	query.on("error", function(err) {
	    console.log("An error occurred: " + err);
	});

