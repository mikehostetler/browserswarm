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
  cors: {
    origin: 'http://localhost:1337',
    credentials: true,
    headers: [
      'DNT',
      'X-Mx-ReqToken',
      'Keep-Alive',
      'User-Agent',
      'X-Requested-With',
      'If-Modified-Since',
      'Cache-Control',
      'Content-Type',
      'Accept',
      'Accept-Encoding',
      'Origin',
      'Referer',
      'Pragma',
      'Cookie'
    ],
    methods: [
      'GET',
      'PUT',
      'POST',
      'DELETE',
      'OPTIONS'
    ],
    maxAge: 1728000
  }
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