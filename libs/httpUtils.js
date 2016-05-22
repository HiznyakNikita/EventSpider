var http = require("http");
var utils = require('./utils');

var downloadPage = function(url, callback) {
	http.get(url, function(res) {
		var data = "";
		res.setEncoding('binary');
		res.on('data', function (chunk) {
			data += chunk;
		});
		res.on("end", function() {
			callback(data);
		});
	}).on("error", function() {
				callback(null);
		});
};

module.exports.downloadPage = downloadPage;

