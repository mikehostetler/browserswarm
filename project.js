exports.get = getProject;

function getProject(req, res, next) {
  res.send(req.project);
}