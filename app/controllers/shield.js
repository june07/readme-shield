var diff = require("diff");
	npm = require("npm"),
	http = require('https'),
	jsonSchemaValidator = require('jsonschema'),
	restify = require('restify'),
	path = require('path'),
	cache = require(path.join(__dirname, './cache.js'));

const PROVIDERS = [ { name: "shields.io", url: "https://img.shields.io/badge/" } ],
	BADGES = [ "readme" ];

var Shield = function(coder, repo, badge, provider, callback) {
	var self = this;
	self.changes = [];
	if (callback instanceof Array) self.changes = callback;
		providerSchema = { "type": "string", "type": "string" };
		self.coder = coder ? coder : { "GitHub": "June07", "NPM": "667" };
		self.repo = repo ? repo : 'ansible-dynamic-inventory';
		self.badge = badge ? badge : BADGES[0];
		self.provider = provider ? provider : PROVIDERS[0];
  if (! self.repo) { callback(new restify.InvalidArgumentError("You need to provide a repo object { GitHub: \"<github-repo-name>\", NPM: \"<npm-repo-name>\" }")); return false; }
  if (self.badge != BADGES[0]) { callback(new restify.InvalidArgumentError("Only the readme type is supported.")); return false; }
  if (! jsonSchemaValidator.validate(self.provider, providerSchema)) { callback(new restify.InvalidArgumentError("Wrong schema used for provider parameter.")); return false; }
  if (self.provider.name != PROVIDERS[0].name) { callback(new restify.InvalidArgumentError("Only shields.io is currently supported as a provider.")); return false; }
};
exports.Shield = Shield;
// Diff the NPMJS version readme (which is tied to a specific release) and the GitHub readme which is the most current.
Shield.prototype.compare = function(github, generateShield, self, callback) {
	var change = false;
	npm.load({"loglevel": "silent"}, function (er) {
	  if (er) return handlError(er);
	  npm.commands.view([self.repo, self.badge], true,  function (er, data) {
	    if (er) return console.log(er);
	    // command succeeded, and data might have some info
	    var npmjs;
	    Object.keys(data).forEach(function(key) {
	    	npmjs = data[key].readme;
	    	return;
	    });
	    var newline = /\r\n|\r|\n/g;
	    github = github.replace(newline, require("os").EOL);
	    npmjs = npmjs.replace(newline, require("os").EOL);
	    require('fs').writeFileSync('github.tmp', github);
	    require('fs').writeFileSync('npmjs.tmp', npmjs);
	  	var difference = diff.diffLines(github, npmjs);
	  	var changeset = [];
	  	difference.forEach(function(changeObject, i) {
	  		// For every line difference
	  		var line = {};
	  		if (changeObject.added || changeObject.removed)
	  			line.num = i;
	  		if (changeObject.added)
	  			line.added = "+"+changeObject.value;
	  		if (changeObject.removed)
	  			line.removed = "-"+changeObject.value;
	  		if (changeObject.added || changeObject.removed)
	  			changeset.push(JSON.stringify(line));
	  	});
			if (! self.changes.includes(changeset.toString()) && changeset.length > 0) {
				self.changes.push(changeset.toString());
				var lastChange = changeset.toString();
				console.log("New change detected.");
				change = true;
			} else if (self.changes.includes(changeset.toString()) && (changeset.toString() != lastChange) && self.changes.length > 0) {
				console.log("Same change detected.");
				change = true;
			}
	    	return generateShield(change, callback);
		 });
	  npm.registry.log.on("log", function (message) { });
	});
}
// Is this safe to use "https://raw.githubusercontent.com/<user>/<repo>/<branch>/README.md"?
// https://raw.githubusercontent.com/june07/Ansible-LXDynamic-Inventory/master/README.md
// diff();
Shield.prototype.getShield = function(coder, repo, badge, provider, callback) {
  var coderObject = JSON.stringify({ Github: coder });
  // Check cache
  var shield = cache.getCache(coderObject, repo, badge, provider, function(err, reply) {
  	if (err) console.log(err);
  	else if (reply instanceof Shield)
  	  shield.getProviderShield(callback);
  	else if (! reply) {
  		var shield = new Shield(coder, repo, badge, provider, callback);
  		cache.putCache(shield);
  		shield.getProviderShield(callback);
  	}
  });
}
Shield.prototype.getProviderShield = function(callback) {
	var self = this;
	var branches = [ "master", "devel" ];
	branches.every(function(branch) {
		self.get('https://raw.githubusercontent.com/'+self.coder+'/'+self.repo+'/'+branch+'/README.md', function(status, response) {
			if (status !== 404) {
				self.compare(response.toString(), generateShield, self, callback);
				return false;
			}
		});
		return true;
	})
	// Generate the badge with shields.io
	function generateShield(changed, callback) {
			subject = 'npm README',
			status = 'unknown',
			color = 'lightgrey';
		if (changed) {
			status = (self.changes.length > 1) ? 'Behind '+self.changes.length+' changes.': 'Behind '+self.changes.length+' change.';
			color = 'yellow';
		} else {
			status = 'Current!',
			color = 'green';
		}
		self.get(PROVIDERS[0].url+subject+"-"+status+"-"+color+".svg", function(status, response) {
			callback(null, response);
		});
	}
}

Shield.prototype.get = function(url, cb) {
	http.get(url, (res) => {
	  console.log(`Got response: ${res.statusCode}`);
	  // Return false and try the next GitHub branch
	  // consume response body
	  var body = '';
	  res.on('data', function(data) {
	  	body += data;
	  });
	  res.on('end', function() {
	    cb(res.statusCode, body);
	  });
	  res.resume();
	}).on('error', (e) => {
	  console.log(`Got error: ${e.message}`);
	});
}
module.exports = Shield;