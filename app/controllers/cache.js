var redis = require('redis'),
	path = require('path'),
	Shield = require(path.join(__dirname, './shield')),
	config = require(path.join(__dirname, './../../config/config'));

var Cache = function() {
  var self = this;
  self.redisCache = redis.createClient(config.redis.url);
  self.redisCache.on("error", function (err) {
    console.log("Error " + err);
  });
  /**
  setInterval(function() {
      self.redisCache.set("key"+Date.now(), "value"+Date.now(), redis.print);
  }, 1000)
  */
}
Cache.prototype.putCache = function(shield) {
	var self = this;
	var id = JSON.stringify(shield.coder)+" "+shield.repo;
	self.redisCache.hset(id, "changes", shield.changes.toString(), redis.print);
	self.redisCache.hset(id, "badge", shield.badge.toString(), redis.print);
	self.redisCache.hset(id, "provider", JSON.stringify(shield.provider), redis.print);
}
Cache.prototype.getCache = function(coder, repo, badge, provider, callback) {
	var self = this;
	var id = JSON.parse(coder)+" "+repo;
	self.redisCache.get(id, function(err, reply) {
		if (err) console.log(err);
		if (reply) {
			var coder = JSON.stringify(id.split("")[0]);
			var repo = id.split("")[1];
			var changes = redisCache.hget(id, "changes");
			var badge = redisCache.hget(id, "badge");
			var provider = redisCache.hget(id, "provider");
			var shield = new Shield(coder, repo, badge, provider, changes);
			callback(null, shield);
		}
		else callback(null, null);
	});
}
module.exports = new Cache();
