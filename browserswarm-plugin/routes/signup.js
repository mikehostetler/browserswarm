'use strict';
var path = require('path');

var STRIDER_PATH = path.resolve(__dirname, '../../node_modules/strider/lib/'),
  MODELS_PATH = path.join(STRIDER_PATH, 'models');
var VIEWS_DIR = path.resolve(__dirname, '../views');

var Job = require(MODELS_PATH).Job,
  User = require(MODELS_PATH).User

function view(name) {
  return path.join(VIEWS_DIR, name);
}

module.exports = function (ctx) {

  ctx.route.post('/pre-register', function(req, res, next) {
    console.log('Pre-register submit: ' + req.body.email);
    // TODO: capture the email address for sending updates before actual registration
    res.redirect('/signup?email=' + req.body.email);
  });

  ctx.route.get('/signup', function(req, res, next) {
    if (req.user) {
      return res.redirect('/dashboard');
    }
    var email = (req.query.email || '');
    console.log('hitting sign up page with email: ' + email, req.query);
    return res.render(view('signup.html'), { email: email });
  });

  ctx.route.post('/signup', function (req, res, next) {
    var EMAIL_REGEX = /^[^@]+@[^@]+\.[a-z]+$/i;

    var email = (req.body.email || '').trim();
    var password = (req.body.password || '').trim();

    var errors = [];
    if (!email) errors.push("Missing email");
    if (!EMAIL_REGEX.test(email)) errors.push('Invalid email');
    if (!password) errors.push("Missing password");
    if (errors.length) {
      return res.render(view('signup.html'), {errors: errors});
    }

    function respond(err, user) {
      if (err) {
        return res.render(view('signup.html'), {
          errors: [err],
          email: email,
          password: password
        });
      }

      // Registered success:
      req.login(user, function(err/*, u*/) {
        if (err) {
          return res.render(view('signup.html'), {errors: [err]});
        }
        res.redirect('/');
      });
    }

    User.registerWithoutInvite(email, password, respond);
  });

};