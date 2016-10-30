var npm = require("npm"),
	https = require('https'),
	path = require('path'),
	Promise = require('bluebird'),

	config = require(path.join(__dirname, './../../config/config.js')),
	cache = require(path.join(__dirname, './cache.js')).getInstance(),
	Shield = require(path.join(__dirname, './../models/shield.js')),
	provider = config.shield.providers.shieldsio;

// NOTE: event name is camelCase as per node convention
process.on("unhandledRejection", function(reason, promise) {
    // See Promise.onPossiblyUnhandledRejection for parameter documentation
    console.log(reason);
    console.dir(promise);
});

// NOTE: event name is camelCase as per node convention
process.on("rejectionHandled", function(promise) {
    // See Promise.onUnhandledRejectionHandled for parameter documentation
});
/** bluebird v3.x.x
Promise.config({
    // Enable warnings
    warnings: true,
    // Enable long stack traces
    longStackTraces: true,
    // Enable cancellation
    cancellation: true,
    // Enable monitoring
    monitoring: true
}); */

var ShieldController = (function() {
	var instance;
	function createInstance() {
		return {
			cache: cache,
			getShield: function(coder, repo, badge, provider, changes, callback) {
			  // Check cache first and if not found create a new shield and add it to the cache.
				var shield = new Shield(coder, repo, badge, provider, changes, callback);
			  var self = this;
			  new Promise(function(resolve, reject) {
			  	cache.getCache(shield, function(err, reply) {
				  	if (err) reject(err);
				  	if (reply) {
				  		shield = reply;
				  		shield.sentcache = true;
				  		resolve(shield);
					  	return callback(null, shield);
						}
						resolve(shield);
				  });
			  })
			  //.all([self.getGitHubReadme(shield), self.getNpmReadme(shield)])
			  .then(function(shield) {
			  	return self.getGitHubReadme(shield);
			  })
				.then(function(shield) {
			  	return self.getNpmReadme(shield);
			  })
			  .then(function(shield) {
			  	return new Promise(function(resolve, reject) {
			  		self.isDifferent(shield, resolve, reject);
			  	});
			  })
			  .then(function(shield) {
			  	/* Generate the badge and return the proper markdown **/
			  	self.generateBadge(shield, function(shield) {
						cache.putCache(shield);			
						callback(null, shield);
			  	});
			  });
			},
			// Diff the NPMJS version readme (which is tied to a specific release) and the GitHub readme which is the most current.
			isDifferent: function(shield, resolve, reject) {
				var github = shield.readme["github"];
				var npm = shield.readme["npm"];
				var different = (! (github.includes(npm) && npm.includes(github)));
				if (different) {
					cache.putCache(shield.update(null, null, null, null, null, different));	
				}
				resolve(shield);
			},
			getGitHubReadme: function(shield) {
				var self = this;
				return new Promise(function(resolve, reject) {
					// Is this safe to use "https://raw.githubusercontent.com/<user>/<repo>/<branch>/README.md"?
					// https://raw.githubusercontent.com/june07/Ansible-LXDynamic-Inventory/master/README.md
					// diff();
					var coder = shield.coder,
						repo = shield.repo,
						branches = shield.branches;
					branches.every(function(branch) {
						self.httpGet('https://raw.githubusercontent.com/'+coder.GitHub+'/'+repo+'/'+branch+'/README.md', function(status, response) {
							if (status !== 404) {
								var readme = response.replace(/\r\n|\r|\n/g, require("os").EOL);
							  require('fs').writeFileSync('github.tmp', readme);
								shield.readme["github"] = readme;
								resolve(shield);
								//resolve(null, { branch: branch, response: response.toString(); });
								return false;
							}
						});
						return true;
					})
				});
			},
			/** Returns void, npmReadmeString if found, otherwise returns an error function */
			getNpmReadme: function(shield) {
				return new Promise(function(resolve, reject) {
					var repo = shield.repo;
					var badge = shield.badge;

					npm.load({"loglevel": "silent"}, function (er) {
					  if (er) return handlError(er);
					  npm.commands.view([repo, badge.name], true,  function (er, data) {
					    if (er) return function() { console.log(er); };
					    // command succeeded, and data might have some info
					    Object.keys(data).forEach(function(key) {
					    	var readme = data[key].readme;
					    	if (readme) {
							    readme = readme.replace(/\r\n|\r|\n/g, require("os").EOL);
							    require('fs').writeFileSync('npmjs.tmp', readme);
							    shield.readme["npm"] = readme;
					    		resolve(shield);
					    	}
					    });
						});
						npm.registry.log.on("log", function (message) { });
					});
				});
			},
			generateBadge: function(shield, callback) {
				var subject = 'npm README',
					status = 'unknown',
					color = 'lightgrey';
				if (shield.different) {
					status = 'Behind GitHub',
					color = 'yellow';
				} else {
					status = 'Current!',
					color = 'green';
				}
				this.httpGet(provider.url+subject+"-"+status+"-"+color+".svg", function(status, response) {
					shield.markdown = response;
					cache.putCache(shield);
					if (shield.sentcache)
						shield.sentcache = false;
					else
						return callback(shield);
				});
			},
			httpGet: function(url, cb) {
				var url;
				var headers = { 'Cache-Control':'no-cache, no-store, must-revalidate' }; 
				Object.assign(url, headers);
				https.get(url + '?nocache=' + Date.now(), (res) => {
				  //console.log(`Got response: ${res.statusCode}`);
				  //console.dir(res.headers);
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
		}
	}
	return {
		getInstance: function() {
			if (!instance)
				instance = createInstance();
			return instance;
		}
	}
})();
module.exports = ShieldController;