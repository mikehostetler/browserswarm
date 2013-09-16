'use strict';

// require all route modules
var signup = require('./signup');

module.exports = {
  use: function (ctx) {
    // invoke all route functions with specific context
    signup(ctx);
  }
};