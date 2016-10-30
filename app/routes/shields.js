/*jslint node: true */
'use strict';

var path = require('path');

  var ArrayCompare = require('../utils/ArrayCompare.js'),
  shieldController = require(path.join(__dirname, '../controllers/shield.js')).getInstance();

var PATH = '/shields';
var VERSION = '1.0.0';

module.exports = function (server) {
  //server.get({path: PATH + '/', version: VERSION}, ping);
  //server.get({path: new RegExp(PATH+/([a-zA-Z0-9_\.~-]+)\/(.*)/), version: VERSION}, function(req, res, next) {
  server.get({path: PATH+"/:coder/:repo", version: VERSION}, function(req, res, next) {
    var coder = sanitize(req.params.coder, "coder"),
      repo = sanitize(req.params.repo, "repo");
    shieldController.getShield(coder, repo, null, null, [], function(err, shield) {
      if (err) { console.log(err.message); return next(); }
      if (shield)
        res.send(200, shield.markdown);
      return next();
    });
  });
  /**
  server.get({path: PATH+"/:coder/:repo/:badge", version: VERSION}, function(req, res, next) {
    var coder = sanitize(req.params.coder, "coder"),
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
  */
  function sanitize(variable, type) {
    variable = variable.toLowerCase();
    switch (type) {
      case ("coder"):
        variable = { "GitHub": variable, "npm": null }; break;
      case ("repo"):
        variable = variable.replace(".svg", ""); break;
    }

    return variable;
  }
};
