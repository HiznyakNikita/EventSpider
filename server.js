var http = require("http");
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var request = require('request');
var GoogleMapsAPI = require('googlemaps');

var depth = 50;
var knownPages = [];
var visitedPages = [];
var events = [];
var locatedEvents = [];
var publicConfig = {
  key: 'AIzaSyBRNsKkzpE1VT_UIOoVibkcAUmSjr4SIFI',
  stagger_time:       1000, // for elevationPath
  encode_polylines:   false,
  secure:             true, // use https
};

var gmAPI = new GoogleMapsAPI(publicConfig);

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
        name = data.children().first().children().first().children().first().children().first().text().trim();
		place = data.children().last().children().text().trim();
		date = data.children().last().text().trim();
		if(name != '' && date != '' && place != '')
			events.push({"name": name, "date" : date, "place" : place, location: null});
      });
   
    return destinations;
};

var crawlPage = function(url) {
	depth-=1;
	if(depth == 0)
	{
		depth = 50;
		console.log(locatedEvents);
	}
	//console.log("crawl url: " + url);
	downloadPage(url, function(data) {
        var links = parsePage(iconv.decode(data, 'win1251'));
        knownPages = pushNewItemsToArray(knownPages.concat(links));
        crawlPage(getNextPage());
    });
}

setInterval(function(){
  if(events)
  {
	  var currentEvent = events.pop();
var geocodeParams = { "address": "Киев " + currentEvent.place };
	//console.log(geocodeParams.address);
gmAPI.geocode(geocodeParams, function(err, result){
	//console.log(result);
  if(result)
	  currentEvent.location = result.results[0].geometry.location;
  locatedEvents.push(currentEvent);
});
  }
}, 1000); 

var url = "http://today.kiev.ua";



crawlPage(url);
