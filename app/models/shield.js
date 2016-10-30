var jsonSchemaValidator = require('jsonschema'),
	path = require('path'),
	restify = require('restify'),

	config = require(path.join(__dirname, './../../config/config')),
	cache = require("./../controllers/cache.js").getInstance();

var Shield = function(coder, repo, badge, provider, callback) {
	var self = this;
	self.readme = [];
	self.schema = { "type": "string", "type": "string" };
	self.coder = coder ? coder : { "GitHub": "June07", "npm": "667" };
	self.repo = repo ? repo : "ansible-dynamic-inventory";
	self.branches = self.repo.split(" ")[1] ? self.repo.split()[1].split(",") : [ "master", "devel" ];
	self.badge = badge ? badge : config.badge.type.readme;
	self.provider = provider ? provider : config.shield.providers.shieldsio.name;
	self.id = JSON.stringify(coder)+" "+repo;
	self.different = false;

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
Shield.prototype.update = function(coder, repo, badge, provider, markdown, different) {
	this.coder = coder ? coder: this.coder;
	this.repo = repo ? repo: this.repo;
	this.badge = badge ? badge: this.badge;
	this.provider = provider ? provider: this.provider;
	this.markdown = markdown ? markdown: this.markdown;
	this.different = different ? different: this.different;
	return this;
}
Shield.prototype.delete = function(shield) {
	cache.deleteCache(shield);
	delete shield;
	return null;
}

module.exports = Shield;