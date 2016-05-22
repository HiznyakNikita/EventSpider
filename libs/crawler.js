var http = require("http");

var mongoose = require('mongoose');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var request = require('request');
var GoogleMapsAPI = require('googlemaps');

var config = require('./config');
var EventModel = require('./mongoose').EventModel;
var utils = require('./utils');
var httpUtils = require('./httpUtils');

var knownPages = [];
var visitedPages = [];
var events = [];
var locatedEvents = [];

var googleMapsConfig = {
  key: 'AIzaSyBRNsKkzpE1VT_UIOoVibkcAUmSjr4SIFI',
  stagger_time:       1000, // for elevationPath
  encode_polylines:   false,
  secure:             true // use https
};

var gmAPI = new GoogleMapsAPI(googleMapsConfig);
var Event = mongoose.model('Event', EventModel);

var getNextPage = function(){
  for (page in knownPages) {
    if (knownPages[page] && !utils.isExistsInArray(visitedPages, knownPages[page])) {
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
	
	//filter wrong links
	$(links).each( function(i, link) {
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
	
	//get body of page
	body = $('body'),
	//get all event cells
	eventCells = body.find('.event_cell'),
	//for each event cell get name,place and date
	eventCells.each( function(i, item) {
		name = $(item).find('.h1_event_cell').text().trim();
		place = $(item).find('.a1').text().trim();
		date = $(item).find('.strike').text().trim();
		if(name && date && place){
			console.log("add new event : " + name);
			events.push({
				name: name, 
				date : date, 
				place : place, 
				location: null
			});
		}
	});
	return destinations;
};

var crawlPage = function(url) {
	console.log("crawl url: " + url);
	httpUtils.downloadPage(url, function(data) {
    var links = parsePage(iconv.decode(data, 'win1251'));
    knownPages = utils.pushNewItemsToArray(knownPages.concat(links));
    crawlPage(getNextPage());
  });
}

setInterval(function(){
	if (events) {
		var currentEvent = events.pop();
		if (currentEvent) {
			var geocodeParams = { "address": "Киев " + currentEvent.place };
			gmAPI.geocode(geocodeParams, function(err, result){
				if (result && result.results[0]) {
					currentEvent.location = result.results[0].geometry.location;
				}
				
				if (!utils.isExistsInArray(locatedEvents,currentEvent)) {
					var ev = new Event({
						name: currentEvent.name, 
						date : currentEvent.date, 
						place : currentEvent.place, 
						eventLocation: currentEvent.location
					});
					locatedEvents.push(ev);
					ev.save();
					console.log("Save event!");
				}
			});
		}
	}
}, 1000); 

module.exports.crawlPage = crawlPage;