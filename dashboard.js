var jobs   = require('strider/lib/jobs');
var common = require('strider/lib/common');

module.exports = dashboard;

function dashboard(req, res, next) {
  jobs.latestJobs(req.user, true, function (err, jobs) {

    if (err) return next(err);

    var availableProviders = Object.keys(common.userConfigs.provider).map(function(k){
      return common.userConfigs.provider[k]
    })

    res.send({
      jobs: jobs,
      availableProviders: availableProviders
    });
  });
}

