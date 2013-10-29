var strider = require('strider')
var striderMiddleware = require('strider/lib/middleware');

// var testWorker = false;
// var includePath = [];
// if(testWorker) {
//  includePath = ["node_modules", "node_modules/strider/node_modules"];
// }
// else {
var includePath = [".", "node_modules", "node_modules/strider/node_modules"];
// }

var app = strider(includePath, {}, function(){
  console.log("BrowserSwarm is running");
});

/// Ugly hack, monkey punching the cors middleware into the beginnig
/// of the middleware stack.
app.stack.unshift({ route: '', handle: require('./cors') });



/// --- New Routes


/// session

var session = require('./session');
app.get ('/api/session', session.get);
app.post('/api/session', session.create);


/// project

var project = require('./project');
app.get('/api/project/:org/:repo', striderMiddleware.project, project.get);