'use strict';
var path = require('path');

var STRIDER_PATH = path.resolve(__dirname, '../../node_modules/strider'),
  STRIDER_VIEWS_PATH = path.join(STRIDER_PATH, 'views');

module.exports = function (ctx) {

  ctx.route.get('/dashboard', function(req, res, next) {
    return res.render(path.join(STRIDER_VIEWS_PATH, 'index.html')/*, viewData*/);

    if (!req.user) {
      return req.redirect('/');
    }
    req.user.get_repo_config_list(function(err, repo_list) {
      if (err) throw err;
      var viewData = {total_configured_projects:repo_list.length};
      res.render(path.join(STRIDER_VIEWS_PATH, 'index.html')/*, viewData*/);
    });
  });
};