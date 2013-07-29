/*
 * MixpanelCli
 * https://github.com/jongd/MixpanelCli
 *
 * Copyright (c) 2013 Jon Gold
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('underscore')
  , md5 = require('MD5')
  , http = require('http');


function Client (options){
  this.apiKey = options.apiKey;
  this.apiSecret = options.apiSecret;
  this.BASE = 'http://mixpanel.com/api/2.0/';
  this.eventTopArgs = {
    'api_key': this.apiKey,
    'expire': Math.round(new Date('2013/12/12').getTime()/1000.0),
    'type': 'unique'
  };
}

Client.prototype.query = function(resource, args, callback) {
  var qw = _.map(args, function(val, key) {
    return key + '=' + val;
  });

  // console.log(qw);

  var hash = md5(qw.sort().join('') + this.apiSecret);

  var url = this.BASE + resource + '?' + qw.join('&') + '&sig=' + hash;

  http.get(url, function(res) {
    console.log('Got response: ' + res.statusCode);
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      callback(body);
    });
  }).on('error', function(e) {
    console.log('Got error: ' + e.message);
  });
};

Client.prototype.fetchEvents = function(callback) {
  var that = this;
  this.query('events/top', this.eventTopArgs, function(data) {
    var parsedData = JSON.parse(data);

    that.data = parsedData;
    callback();
  });
};

Client.prototype.eventNames = function() {
  return _.map(this.data.events, function(event) {
    return event.event;
  });
};

module.exports = Client;