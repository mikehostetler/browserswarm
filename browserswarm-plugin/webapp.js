var BASE_PATH = "../node_modules/strider/lib/"

var swig = require('swig')
	, pluginTemplates = require(BASE_PATH + 'pluginTemplates')
	, swigTags = require(BASE_PATH + 'swigTags')
	, _ = require('underscore')
  , mongoose = require('mongoose')
  , crypto = require('crypto')
  , Step = require('step')
  , frameworks = require("./data/frameworks.json")
  , browsers = require("./data/browsers.json")
  , frameworksObj = {}
  , repoFrameworks = {}
  , filter = require(BASE_PATH + 'ansi')
  , humane = require(BASE_PATH + 'humane')
  , Job = require(BASE_PATH + 'models').Job
  , User = require(BASE_PATH + 'models').User
	;

var routes = require('./routes');

frameworks.forEach(function(x){
  if (x.id)
    frameworksObj[x.id] = x;

  if (x.repo_url)
    repoFrameworks[x.repo_url] = x;
})

/** 
 * Initialize SWIG, the template engine, with the same settings as Strider core
 */
swig.init({
	root: ['.',__dirname + '/views',__dirname+'/partials',BASE_PATH+"../views"]
	, allowErrors: true // allows errors to be thrown and caught by express instead of suppressed by Swig
	, cache: false
	, tags: swigTags.tags
	, simpleTags: swigTags.simpleTags
	, extensions: { plugin: pluginTemplates }
});

module.exports = function(ctx, cb){

	/**
	 * Override template blocks
	 */
  ctx.registerBlock("Nav", function(context, fn){
    fn(null, "&nbsp;");
  });

  ctx.registerBlock("TopNav", function(context, fn){
    var tmpl = swig.compileFile(__dirname  + "/partials/nav.html");
    fn(null, tmpl.render({ currentUser: (context.currentUser || null) }));
  });

  ctx.registerBlock("JobPagePreTitle", function(context, fn){
    var r = repoFrameworks[context.repo_url] || {};
    fn(null, "<p class='job-pre-title'>Framework / " + r.name + "</p>");
  });

  ctx.registerBlock("JobPagePostTitle", function(context, fn){
    var r = repoFrameworks[context.repo_url] || {}
    fn(null,"<p class='job-post-title'>" + r.name + " / " + r.name + "</p>")
  });

	ctx.registerBlock("LoggedOutFillContent", function(context, fn){
    var tmpl = swig.compileFile(__dirname  + "/partials/home.html")
    fn(null, tmpl.render({currentUser: context.currentUser}));
	});

  ctx.registerBlock("JobMain", function(context, fn){
    var tmpl = swig.compileFile(__dirname  + "/partials/jobmain.html")
		var show_error_console = false;

		context.results_detail.error_output = context.results_detail.output.match(/^.*\[ERROR\](.*)$/mg, "");
		if(context.results_detail.error_output != null) {
			context.results_detail.error_output = context.results_detail.error_output.join("\n");
			context.results_detail.error_output = context.results_detail.error_output;
			show_error_console = true;
		}	
		context.results_detail.output = context.results_detail.output;
		if(context.results_detail.github_commit_info != undefined) {
			context.results_detail.github_commit_info.short_id 
				= (context.results_detail.github_commit_info.id + "").slice(0,9);
		}

    var framework = frameworksObj[context.repo]

    var job = null;

		// Find our job
		for (var i = 0; i< context.jobs.length; i++){
			if (context.jobs[i].id.indexOf(context.job_id) == 0){
				job = context.jobs[i];
				break;
			}
		}
		if (!job){
			job = {tasks:[]}
		}

		var passtotal = 0
			, testtotal = 0

		if (! job.tasks) job.tasks = [];

		for (var i = 0; i< job.tasks.length; i++){
			if (!job.tasks[i].id == 'browserstack') 
				continue;
			passtotal += job.tasks[i].data.passed
			testtotal += job.tasks[i].data.passed + job.tasks[i].data.failed
		}

		for (var i in browsers){
			// TODO - Set Default
			browsers[i].supported = "unknown"

			if (browsers[i].sl){
				for (var z=0; z < job.tasks.length; z++){
					var task_id = job.tasks[z].id;
					var brows = job.tasks[z].data.id;
					if (! (task_id == 'browserstack' || task_id == 'sauce'))
						continue;

					if (brows.indexOf(browsers[i].sl) > -1) {
						// Sauce Labs fuzzy matching of browsers
						browsers[i].supported = (job.tasks[z].data.failed == 0) ? "supported" : "not";
						browsers[i].passed = job.tasks[z].data.passed;
						browsers[i].total = job.tasks[z].data.passed + job.tasks[z].data.failed;
					} else if (browsers[i].bs == brows){
						// BrowserStack not fuzzy
						browsers[i].supported = (job.tasks[z].data.failed == 0) ? "supported" : "not";
						browsers[i].passed = job.tasks[z].data.passed;
						browsers[i].total = job.tasks[z].data.passed + job.tasks[z].data.failed;
					}
				}
			}
		}

		var out = _.extend(context,{
			show_error_console: show_error_console
      , passrate : parseInt((passtotal / testtotal) * 100)
      , passed : passtotal
      , total : testtotal
      , duration: job.duration
      , "name" : framework.name || ""
      , "src" : framework.src || ""
      , "browsers" : browsers
		});
    fn(null, tmpl.render(out));
	});

	/**
	 * Define custom routes
	 */
  ctx.route.get("/frameworks.json", function(req, res, next){
    var f = frameworks.filter(function(x){return !!x.id})  
    res.send(f)
  })

  ctx.route.get("/:org/:repo/job/:job_id", function(req, res, next){
		res.statusCode = 200;
		var org = req.params.org;
		var repo = req.params.repo;
		var job_id = req.params.job_id;
		var repo_url = "https://github.com/" + org + "/" + repo;

		// Ignore if can't parse as ObjectID
		try {
			job_id = mongoose.Types.ObjectId(job_id);
		} catch(e) {
			res.statusCode = 400;
			return res.end("job_id must be a valid ObjectId");
		}

		Step(
			function getRepoConfig() {
				lookup(repo_url, this);
			},
			function runQueries(err, repo_config){
				if (err || !repo_config) {
					res.statusCode = 500;
					res.end("you must configure " + repo_url + " before you can use it");
					return;
				}
				this.repo_config = repo_config;
				console.log("Querying for job id: " + job_id);
				Job.findById(job_id).populate("_owner").lean(true).exec(this.parallel());

				console.log("Querying for last 20 jobs for " + repo_url);
				Job.find()
					.sort({'finished_timestamp': -1})
					.where('finished_timestamp').ne(null)
					.where('repo_url',this.repo_config.url)
					.where('archived_timestamp', null)
					.where('type').in(['TEST_ONLY','TEST_AND_DEPLOY'])
					.limit(20)
					.populate("_owner")
					.lean(true)
					.exec(this.parallel());
			},
			function processAndRender(err, results_detail, results) {
				if (err) throw err;

				_.each(results, function(job) {
					job.id = job._id.toString();
					job.duration = Math.round((job.finished_timestamp - job.created_timestamp)/1000);
					// Some jobs never finish, to due a crash or other error condition
					if (!results_detail.finished_timestamp) {
						results_detail.finished_at = "Did not finish"
					} else {
						results_detail.finished_at = humane.humaneDate(results_detail.finished_timestamp);
					}
					if (job.github_commit_info !== undefined && job.github_commit_info.id !== undefined) {
						job.triggered_by_commit = true;
						job.gravatar_url = 'https://secure.gravatar.com/avatar/'
							+ crypto.createHash('md5').update(job.github_commit_info.author.email).digest("hex")
							+ '.jpg?' + 'd=' + encodeURIComponent('identicon');
						if (job.github_commit_info.author.username != undefined) {
							job.committer = job.github_commit_info.author.username;
							job.committer_is_username = true;
						} else {
							job.committer = job.github_commit_info.author.name;
							job.committer_is_username = false;
						}
					}
					job.url = "/" + org + "/" + repo + "/job/" + job.id;
				});

				// if results_detail did not return, that means this is not a valid job id
				if (!results_detail) {
					res.render(404, 'invalid job id');
				} else {

					results_detail.duration = Math.round((results_detail.finished_timestamp - results_detail.created_timestamp)/1000);
					results_detail.finished_at = humane.humaneDate(results_detail.finished_timestamp);
					results_detail.id = results_detail._id.toString();

					var triggered_by_commit = false;
					if (results_detail.github_commit_info !== undefined && results_detail.github_commit_info.id !== undefined) {
						triggered_by_commit = true;
						results_detail.gravatar_url = 'https://secure.gravatar.com/avatar/' + crypto.createHash('md5').update(results_detail.github_commit_info.author.email).digest("hex") + '.jpg?' + 'd=' + encodeURIComponent('identicon');
						if (results_detail.github_commit_info.author.username != undefined) {
							results_detail.committer = results_detail.github_commit_info.author.username;
							results_detail.committer_is_username = true;
						} else {
							results_detail.committer = results_detail.github_commit_info.author.name;
							results_detail.committer_is_username = false;
						}
					}

					// Jobs which have not finished have no output
					if (!results_detail.stdmerged) {
						results_detail.output = "[STRIDER] This job has no output."
					} else {
						results_detail.output = filter(results_detail.stdmerged);
					}

					res.render(__dirname + '/views/job.html',
						{
							admin_view: false,
							jobs: results,
							results_detail: results_detail,
							job_id: req.params.job_id,
							triggered_by_commit: triggered_by_commit,
							org:org,
							repo:repo,
							repo_url:this.repo_config.url,
							has_prod_deploy_target:this.repo_config.has_prod_deploy_target
						});

				}
			}
		);
	});

  ctx.route.get("/framework/results/:id", function(req, res, next){
    var framework = frameworksObj[req.params.id]
    if(!framework) 
			return next();

    var jobs = res.locals.models.Job
                 .find()
                 .sort({'finished_timestamp': -1})	// Reverse chronological order
                 .where('repo_url', framework.repo_url)		// Only jobs for this repo
                 .where('finished_timestamp').ne(null)	// Only finished jobs
                 .where('archived_timestamp', null)	// Only jobs which have not been archived
                 .where('tasks').ne(null)		// Only jobs with results stored
                 .limit(10)
                 .populate('_owner')
                 .lean(true)
                 .exec(function(err, jobs){

      var jobData = [];
      for (x in jobs) {
        var job = jobs[x]
					job.stderr = "";
					job.stdout = "";
					job.stdmerged = "";

        if (!job.tasks.length)
          continue;

				var finishedDate = new Date(job.finished_timestamp);

        var j = {
					id : job._id,
					github_commit_info: job.github_commit_info,
					repo_url: job.repo_url,
					short_time: (finishedDate.getMonth()+1) + "/" + finishedDate.getDate() + "/" + finishedDate.getFullYear()
				};

        j.id_short  = (job._id + "").slice(0,9)

        for (var i in browsers){

          j[browsers[i].id] = "unknown"

          if (browsers[i].sl){
            for (var z=0; z< job.tasks.length; z++){
              var task_id = job.tasks[z].id;
              var brows = job.tasks[z].data.id;
              if (! (task_id == 'browserstack' || task_id == 'sauce'))
                continue;

              // Sauce Labs fuzzy matching of browsers
              if (brows.indexOf(browsers[i].sl) > -1) {
                j[browsers[i].id] = (job.tasks[z].data.failed == 0) ? "supported" : "not";
              } else if (browsers[i].bs == brows){
                // BrowserStack not fuzzy
                j[browsers[i].id] = (job.tasks[z].data.failed == 0) ? "supported" : "not";
              }
            }
          }

        }

        jobData.push(j)
      }

			res.render(__dirname + '/views/framework.html', {
          "id" : framework.id
        , "name" : framework.name
        , "src" : framework.src
        , "results" : jobData
        , "repo" : framework.repo
        , "browsers" : browsers
      });
    })
  })

  //TODO: define all routes in individual modules under ./routes
  routes.use(ctx);

  cb(null);
}

function lookup(case_insensitive_url, cb) {
  User.findOne({
      "github_config.url":case_insensitive_url.toLowerCase(),
    }, function(err, user_obj) {
    if (err || !user_obj) {
      console.debug("lookup() - did not find a repo matching %s for any user",
        case_insensitive_url);
      return cb("no repo found", null);
    }
    var repo = _.find(user_obj.github_config, function(repo_config) {
      return case_insensitive_url.toLowerCase() == repo_config.url;
    });
    if (!repo) {
      console.error(
        "lookup() - Error finding matching github_config despite DB query success!");
      return cb("no repo found", null);
    }
    return cb(null, repo);
  });
};
