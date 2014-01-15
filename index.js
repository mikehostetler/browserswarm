var strider           = require('strider')
var striderMiddleware = require('strider/lib/middleware');
var routes            = require('strider/routes');
var jobs              = require('strider/routes/jobs');
var auth              = require('strider/lib/auth');
var handle_errors     = require('./handle_errors');

var includePath = ["node_modules"];

var config = {
  cors: require('./cors')
};

var app = strider(includePath, config, function(){
  console.log("BrowserSwarm is running");

  require('./github_callback_patch')(app);
});

/// handle errors

handle_errors(app);


// Patch routes

app.get('/gimmerror', function(req, res, next) {
  next(new Error('testing raygun, 123'));
});

app.get('/api/:org/:repo', forceJSON, striderMiddleware.project, jobs.html);
app.get('/api/:org/:repo/job/:job_id', forceJSON, striderMiddleware.project, jobs.multijob);
app.get('/api/:org/:repo/config', forceJSON, auth.requireUser, striderMiddleware.project, auth.requireProjectAdmin, routes.config);
app.get('/statusblocks', require('./status_blocks'));
app.get('/dashboard', require('./dashboard'));
app.get('/api/projects', forceJSON, auth.requireUser, routes.get_projects);
app.get('/api/account', forceJSON, auth.requireUser, routes.account);
app.del('/api/session', require('./logout'));

// console.log('ROUTES:', app.routes.get.map(function(route) {
//   return route.path;
// }));

function forceJSON(req, res, next) {
  req.headers['accept'] = 'application/json';
  next();
}