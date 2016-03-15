var http = require("http");
var cheerio = require('cheerio');
var iconv = require('iconv-lite');

var knownPages = [];
var visitedPages = [];
var events = [];


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
	var event = { name : "", place : "", date : ""};
	var urlHome = "http://today.kiev.ua";

    var links = $('a');
    var destinations = [];
	$(links).each(function(i, link){
		var attr = $(link).attr('href');
        if (attr) {
			if(attr.toString().indexOf("http:") === -1){
				attr = urlHome + attr;
				}
			if(attr.toString().indexOf(urlHome) > -1 
			&& attr.toString().indexOf("ua/") > -1){
				destinations.push(attr);
			}
        }
  });
  
  $('.event_cell').filter(function(){
        var data = $(this);
        event.name = data.children().first().children().first().children().first().children().first().text().trim();
		event.place = data.children().last().children().text().trim();
		event.date = data.children().last().text().trim();
		events.push(event);
      })
   
    return destinations;
};

var crawlPage = function(url) {
	console.log("crawl url: " + url);
	downloadPage(url, function(data) {
        var links = parsePage(iconv.decode(data, 'win1251'));
        knownPages = pushNewItemsToArray(knownPages.concat(links));
        crawlPage(getNextPage());
    });
}

var url = "http://today.kiev.ua";
crawlPage(url);