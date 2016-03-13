var http = require("http");

var iconv = require('iconv-lite');

function download(url, callback) {
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
}

var url = "http://today.kiev.ua"

download(url, function(data) {
  if (data) {
	  data = iconv.decode(data, 'win1251');
       console.log(data);
  }
  else console.log("error");  
});