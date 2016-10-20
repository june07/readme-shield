/*jslint node: true */
'use strict';

var path = require('path');

  var ArrayCompare = require('../utils/ArrayCompare.js'),
  shieldController = new (require(path.join(__dirname, '../controllers/shield.js')));

var PATH = '/shields';
var VERSION = '1.0.0';

module.exports = function (server) {
  //server.get({path: PATH + '/', version: VERSION}, ping);
  //server.get({path: new RegExp(PATH+/([a-zA-Z0-9_\.~-]+)\/(.*)/), version: VERSION}, function(req, res, next) {
  server.get({path: PATH+"/:coder/:repo", version: VERSION}, function(req, res, next) {
    var coder = req.params.coder.toLowerCase(),
      repo = req.params.repo.toLowerCase().replace(".svg", "");
    shieldController.getShield(coder, repo, '', '', function(err, shield) {
      if (err) { console.log(err.message); return next(); }
      res.send(200, shield);
      return next();
    });
  });
  server.get({path: PATH+"/:coder/:repo/:badge", version: VERSION}, function(req, res, next) {
    var coder = req.params.coder.toLowerCase(),
      repo = req.params.repo.toLowerCase().replace(".svg", ""),
      badge = req.params.badge.toLowerCase();
    shieldController.getShield(coder, repo, badge, null, function(err, shield) {
      if (err) { console.log(err.message); return next(); }
      res.send(200, shield);
      return next();
    });
  });
  server.get({path: PATH+"/:coder/:repo/:badge/:provider", version: VERSION}, function(req, res, next) {
    var coder = req.params.coder.toLowerCase(),
      repo = req.params.repo.toLowerCase().replace(".svg", ""),
      badge = req.params.badge.toLowerCase(),
      provider = req.params.provider.toLowerCase();
    shieldController.getShield(coder, repo, badge, provider, function(err, shield) {
      if (err) { console.log(err.message); return next(); }
      res.send(200, shield);
      return next();
    });
  });
};
