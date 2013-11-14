module.exports = logout;

function logout(req, res) {
  req.logout();
  res.send({ok: true});
}