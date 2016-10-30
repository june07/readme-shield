var redis = require('redis'),
	path = require('path'),
	config = require(path.join(__dirname, './../../config/config'));

var cacheSingleton = module.exports = (function() {  
  var instance;
  // Not sure what to replace redis.print() with as I don't want the logging output and yet the method seems to need a function passed in, so...
  var printReplacement = function() {};

  function createInstance() {
		var redisClient = redis.createClient(config.redis.url);
		redisClient.on("error", function (err) {
			console.log("Error " + err);
		});
		return {
			redis: redisClient,
			putCache: function(shield) {
				var id = JSON.stringify(shield.coder)+" "+shield.repo;
				redisClient.hset(id, "branches", shield.branches.toString(), printReplacement);
				redisClient.hset(id, "badge", JSON.stringify(shield.badge), printReplacement);
				redisClient.hset(id, "provider", JSON.stringify(shield.provider), printReplacement);
				redisClient.hset(id, "markdown", shield.markdown, printReplacement);
				redisClient.hset(id, "different", shield.different, printReplacement);
			},
			getCache: function(shield, callback) {
				redisClient.hgetall(shield.id, function(err, reply) {
					if (err) console.log(err);
					if (reply) {
						var coder = JSON.parse(shield.id.split(" ")[0]);
						var repo = shield.id.split(" ")[1];
						var branches = reply.branches.split(",");
						var badge = JSON.parse(reply.badge);
						var provider = JSON.parse(reply.provider);
						var markdown = reply.markdown;
						var different = reply.different;
						callback(null, shield.update(coder, repo, badge, provider, markdown, different));
					}
					else callback(null, null);
				});
			},
			deleteCache: function(shield, callback) {
				callback(null, "Not deleted.  Write this code.");
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
