'use strict';

// require all route modules
var dashboard = require('./dashboard'),
  signup = require('./signup');

module.exports = {
  use: function (ctx) {
    // invoke all route functions with specific context
    dashboard(ctx);
    signup(ctx);
  }
};