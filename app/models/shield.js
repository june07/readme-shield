var jsonSchemaValidator = require('jsonschema'),
	path = require('path'),
	restify = require('restify'),

	config = require(path.join(__dirname, './../../config/config')),
	cache = require("./../controllers/cache.js").getInstance();

var Shield = function(coder, repo, badge, provider, changes, callback) {
	var self = this;
	self.readme = [];
	self.schema = { "type": "string", "type": "string" };
	self.changes = changes ? changes: [];
	self.coder = coder ? coder : { "GitHub": "June07", "npm": "667" };
	self.repo = repo ? repo : 'ansible-dynamic-inventory';
	self.badge = badge ? badge : config.badge.type.readme;
	self.provider = provider ? provider : config.shield.providers.shieldio;
	self.id = JSON.stringify(coder)+" "+repo;

	if (! coder && callback) { callback(new restify.InvalidArgumentError(config.messages.params.coder[0])); return false; }
  //if (! jsonSchemaValidator.validate(self.coder, schema)) { callback(new restify.InvalidArgumentError(config.messages.params.coder[1])); return false; }
  if (! repo && callback) { callback(new restify.InvalidArgumentError(config.messages.params.repo[0])); return false; }
  //if (! jsonSchemaValidator.validate(self.repo, schema)) { callback(new restify.InvalidArgumentError(config.messages.params.repo[1])); return false; }
  /**
  if () { callback(new restify.InvalidArgumentError("Only the readme type is supported.")); return false; }
  if (! jsonSchemaValidator.validate(self.provider, providerSchema)) { callback(new restify.InvalidArgumentError("Wrong schema used for provider parameter.")); return false; }
  if () { callback(new restify.InvalidArgumentError("Only shields.io is currently supported as a provider.")); return false; } */
  return self;
}
Shield.prototype.retrieve = function(coder, repo, badge, provider, callback) {
	return this;
}
Shield.prototype.update = function() {}
Shield.prototype.updateDiffs = function(diffs) {
	this.changes.push(diffs.toString());
	this.changed = true;
	return this;
}
Shield.prototype.delete = function(shield) {
	cache.deleteCache(shield);
	delete shield;
	return null;
}

module.exports = Shield;