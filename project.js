var extend = require('util')._extend;

exports.get = getProject;

function getProject(req, res, next) {
  var project = req.project;
  if (project) {
    project = extend({}, project._doc);
    if (!project.access_level)
      project.access_level = req.accessLevel;
  }

  res.send(project);
}