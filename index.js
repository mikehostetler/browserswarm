var strider           = require('strider')
var striderMiddleware = require('strider/lib/middleware');
var routes            = require('strider/routes');
var jobs              = require('strider/routes/jobs');
var auth              = require('strider/lib/auth');

// var testWorker = false;
// var includePath = [];
// if(testWorker) {
//  includePath = ["node_modules", "node_modules/strider/node_modules"];
// }
// else {
var includePath = [".", "node_modules", "node_modules/strider/node_modules"];
// }

var config = {
  cors: require('./cors')
};

var app = strider(includePath, config, function(){
  console.log("BrowserSwarm is running");
});


// Patch routes

app.get('/api/:org/:repo', forceJSON, striderMiddleware.project, jobs.html);
app.get('/api/:org/:repo/job/:job_id', forceJSON, striderMiddleware.project, jobs.multijob);
app.get('/api/:org/:repo/config', forceJSON, auth.requireUser, striderMiddleware.project, auth.requireProjectAdmin, routes.config);
app.get('/statusblocks', require('./status_blocks'));
app.get('/dashboard', require('./dashboard'));

function forceJSON(req, res, next) {
  req.headers['accept'] = 'application/json';
  next();
}