var http = require("http");
var cheerio = require('cheerio');
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

var getNextPage = function(){
	for (page in knownPages) {
        if (knownPages[page] && !isExistsInArray(visitedPages, knownPages[page])) {
            visitedPages.push(knownPages[page]);
            return knownPages[page];
		}
	}
}

var parsePage = function(html) {

	var $ = cheerio.load(html);
		
    var links = $('a');
    var destinations = [];
	$(links).each(function(i, link){
		var attr = $(link).attr('href');
        if (attr && attr.value) {
            var urlParts = url.parse(attr.value());

            destinations.push(urlParts.pathname);
        }
		console.log($(link).text());
  });
  $('.event_cell').filter(function(){
        var data = $(this);
        var eventName = data.children().first().children().first().children().first().children().first().text().trim();
		var eventDate = data.children().last().text().trim();
		console.log(eventName + "*******************" + eventDate);
      })
   
    return destinations;
};

var crawlPage = function(url) {
	downloadPage(url, function(data) {
        var links = parsePage(iconv.decode(data, 'win1251'));
        knownPages = pushNewItemsToArray(knownPages.concat(links));
        crawlPage(getNextPage());
    });
}

var url = "http://today.kiev.ua";
crawlPage(url);