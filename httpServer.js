var http = require('http');

var iconv = require('iconv-lite');
var mongoose = require('mongoose');

var crawler = require('./libs/crawler');
var config  = require('./libs/config');
var EventModel = require('./libs/mongoose').EventModel;


var Event = mongoose.model('Event', EventModel);
var events = [];


var routing = {
  '/': 'Welcome to Event spider! Go to: /run to run crawler or /get/events to show existed events',
  '/show/events': function() { return JSON.stringify(events); },
  '/run': function() { crawler.crawlPage(config.get('url')); return "Crawler started! Go to: /get/events to show existed events!" },
  '/get/events': function() { 
    Event.find().exec( function(err, models) {
      models.forEach( function (post, i) {
        events.push({ ev : post });
      });
    });
    return "Go to: show/events to show the JSON!"
  },
};

//define types
var types = {
	object: function(obj) { return JSON.stringify(obj); },
	string: function(str) { return str; },
	undefined: function() { return 'not found'; },
	function: function(fn, req, res) { return fn(req, res) + ''; },
};

//creating server 
http.createServer( function (req, res) {
	var data = routing[req.url],
	result = types[typeof(data)](data, req, res);
	res.end(result);
}).listen(8081);