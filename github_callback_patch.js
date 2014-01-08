module.exports = patch;

function patch(app) {
  app.routes.get.forEach(function(r) {
    if (r.path == '/auth/github/callback') {
      r.callbacks = r.callbacks.slice(0, 1);
      r.callbacks.push(afterGithubRedirect);
      console.log('***** BrowserSwarm: patched Github callback *****');
    }
  });
}


function afterGithubRedirect(req, res) {
  /// TODO: make this URL configurable
  var path = 'http://localhost:1337/';
  var flash = req.flash();
  if (flash && Object.keys(flash).length)
    path += '?flash=' + encodeURIComponent(JSON.stringify(flash));
  res.redirect(path);
}