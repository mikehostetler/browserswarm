var config = require('./config');

module.exports = CORS;

/// Allowed domains
var allowedDomains = config.allowedDomains;
if (Array.isArray(allowedDomains))
	allowedDomains = allowedDomains.join(', ');

function CORS(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', allowedDomains);
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  next();
}