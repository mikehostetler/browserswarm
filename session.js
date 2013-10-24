exports.get =    getSession;
exports.create = createSession;

function getSession(req, res, next) {
  res.send({user: req.session.passport.user});
}

function createSession(req, res, next) {
  var User = res.locals.models.User;
  console.log(req.body);
  User.authenticate(req.body.email, req.body.password, function (err, user) {
    if (!user) {
      res.send(404, {message: 'No such username / password'});
    } else {
      req.session.passport.user = user.id;
      res.send(user);
    }
  });
}