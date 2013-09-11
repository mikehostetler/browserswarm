var strider = require('strider')

var testWorker = false;
var includePath = [];
if(testWorker) {
	includePath = [".", "node_modules", "node_modules/strider/node_modules"];
}
else {
	includePath = ["node_modules", "node_modules/strider/node_modules"];
}

strider(includePath, {}, function(){
	console.log("BrowserSwarm is running");
});
