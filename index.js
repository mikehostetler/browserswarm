var strider = require('strider')
var striderMiddleware = require('strider/lib/middleware');
var jobs = require('strider/routes/jobs');

// var testWorker = false;
// var includePath = [];
// if(testWorker) {
//  includePath = ["node_modules", "node_modules/strider/node_modules"];
// }
// else {
var includePath = [".", "node_modules", "node_modules/strider/node_modules"];
// }

var config = {
  cors: 'http://localhost:1337'
};

var app = strider(includePath, config, function(){
  console.log("BrowserSwarm is running");
});


// Patch routes

app.get('/api/:org/:repo', forceJSON, striderMiddleware.project, jobs.html);

function forceJSON(req, res, next) {
  req.headers['accept'] = 'application/json';
  next();
}