var strider = require('strider')

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

/// Ugly hack
app.stack.unshift({ route: '', handle: require('./cors') });


/// New Routes

var session = require('./session');

app.get ('/api/session', session.get);
app.post('/api/session', session.create);