var http = require("http");
var iconv = require('iconv-lite');

var knownPages = [];
var visitedPages = [];

//helper methods

var isExistsInArray = function(arr,val){
	for(var i=0;i<arr.length;i++) 
		if(arr[i]==val) 
			return true;
    return false;
}

var pushNewItemsToArray = function(arr) {
    var a = [];
    var l = arr.length;
    for(var i=0; i<l; i++) {
      for(var j=i+1; j<l; j++) {
        if (arr[i] === arr[j])
          j = ++i;
      }
      a.push(arr[i]);
    }
    return a;
};

//server methods

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
}

var url = "http://today.kiev.ua"

downloadPage(url, function(data) {
  if (data) {
	  data = iconv.decode(data, 'win1251');
       
  }
  else console.log("error");  
});