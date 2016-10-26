var redis = require('redis'),
	path = require('path'),
	config = require(path.join(__dirname, './../../config/config'));

var cacheSingleton = module.exports = (function() {  
  var instance;

  function createInstance() {
		var redisClient = redis.createClient(config.redis.url);
		redisClient.on("error", function (err) {
			console.log("Error " + err);
		});
		return {
			redis: redisClient,
			putCache: function(shield) {
				var id = JSON.stringify(shield.coder)+" "+shield.repo;
				var changesString = shield.changes.toString();
				redisClient.hset(id, "changes", changesString, redis.print);
				redisClient.hset(id, "badge", JSON.stringify(shield.badge), redis.print);
				redisClient.hset(id, "provider", JSON.stringify(shield.provider), redis.print);
			},
			getCache: function(shield, callback) {
				redisClient.hgetall(shield.id, function(err, reply) {
					if (err) console.log(err);
					if (reply) {
						var coder = JSON.stringify(id.split(" ")[0]);
						var repo = id.split(" ")[1];
						var changes = reply.changes;
						var badge = JSON.stringify(reply.badge);
						var provider = JSON.stringify(reply.provider);
						shield.update(coder, repo, badge, provider, changes);
						callback(null, shield);
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
