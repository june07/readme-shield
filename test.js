var npm = require("npm"),
	shield = require("./app/controllers/shield.js");

function test() {
	npm.load({"loglevel": "silent"}, function (er) {
	  if (er) return handlError(er);
	  npm.commands.view(["ansible-dynamic-inventory", "readme"], true,  function (er, data) {
	  	console.log("OUTPUT: ");
	  	console.dir(data);
		 });
	  npm.registry.log.on("log", function (message) { });
	});
}

//console.log(JSON.stringify(shield, null, 2));
// Shield.prototype.getShield = function(coder, repo, badge, provider, callback) {
shield.getShield("june07", "ansible-dynamic-inventory", "readme", "", function(object) {
	process.stdout.write(object);
});
