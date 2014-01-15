
var config   = require('./config.json').raygun;
var Raygun   = require('raygun');
var raygun   = new Raygun.Client().init({ apiKey: config.api_key });

module.exports = handleErrors;

function handleErrors(server) {

  // only use raygun in production
  if (process.env.NODE_ENV != 'production') return;

  console.log('in production mode, going to log errors to raygun');

  var insertAt = server.stack.length;
  var defaultErrorHandler = server.stack[insertAt - 1].handle;
  if (defaultErrorHandler.name == 'errorHandler') {
    console.log('*** Patching the error handler ***');
    server.stack[insertAt - 1].handle = serverErrorHandler;
  } else {
    defaultErrorHandler = null;
    server.use(serverErrorHandler);
  }

  function serverErrorHandler(err, req, res, next) {
    raygun.setUser(req.user && (req.user.email || req.user.id));
    raygun.send(err, { uuid: req._uuid}, raygunSent, req);
    raygun.setUser();

    if (defaultErrorHandler) defaultErrorHandler(err, req, res, next);
    else next(err);
  }

  process.on('uncaughtException', onGlobalUncaughtException);

  function onGlobalUncaughtException(err) {
    console.error('GLOBAL uncaught exception: %s', err.stack);
    raygun.send(err);
    server.close(serverClosed);
    var timeout = setTimeout(shutdown, 5000);

    function serverClosed() {
      clearTimeout(timeout);
      shutdown();
    }

    function shutdown() {
      process.exit();
    }
  }
}



function raygunSent(res) {
  if (res.statusCode >= 300)
    console.error('Raygun replied with status code %s', res.statusCode);
  else console.log('successfully sent error to raygun');
}