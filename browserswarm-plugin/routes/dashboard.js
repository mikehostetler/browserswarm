'use strict';
var path = require('path');

var STRIDER_PATH = path.resolve(__dirname, '../../node_modules/strider');

function view(name) {
  return path.join(STRIDER_PATH, 'views', name);
}

module.exports = function (ctx) {

  ctx.route.get('/dashboard', function(req, res, next) {
    if (!req.user) {
      return res.redirect('/');
    }

    req.user.get_repo_config_list(function(err, repo_list) {
      if (err) throw err;
      res.render(view('index.html'), {
	currentUser: req.user,
        total_configured_projects: repo_list.length,
        showHome: false
      });
    });

  });
};
