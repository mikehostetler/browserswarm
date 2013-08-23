var swig = require('swig')
	, _ = require('underscore')
  , frameworks = require("./frameworks.json")
  , frameworksObj = {}
  , repoFrameworks = {}

frameworks.forEach(function(x){
  if (x.id)
    frameworksObj[x.id] = x;

  if (x.repo_url)
    repoFrameworks[x.repo_url] = x;
})

var browsers = [
  {id : "chrome27", name : "Chrome 27", ico : "chrome", bs : "win-chrome-27.0", sl: "chrome"}
, {id : "firefox18", name : "Firefox 18", ico : "firefox", bs : "win-firefox-18.0", sl: "firefox-18"}
, {id : "firefox19", name : "Firefox 19", ico : "firefox", bs : "win-firefox-19.0", sl: "firefox-19"}
, {id : "firefox20", name : "Firefox 20", ico : "firefox", bs : "win-firefox-20.0", sl: "firefox-20"}
, {id : "ie6", name : "IE 6", ico : "ie-6", bs : "win-ie-6.0", sl: "internet_explorer-6"}
, {id : "ie7", name : "IE 7", ico : "ie-8", bs : "win-ie-7.0", sl: "internet_explorer-7"}
, {id : "ie8", name : "IE 8", ico : "ie-8", bs : "win-ie-8.0", sl: "internet_explorer-8"}
, {id : "ie9", name : "IE 9", ico : "ie", bs : "win-ie-9.0", sl: "internet_explorer-9"}
, {id : "ie10", name : "IE 10", ico : "ie-10", bs : "win-ie-10.0", sl: "internet_explorer-10"}
, {id : "safari5", name : "Safari 5.1", ico : "safari", bs: "mac-safari-5.1", sl: "safari-5"}
, {id : "safari6", name : "Safari 6.0", ico : "safari", bs :"mac-safari-6.0", sl: "safari-6"}
, {id : "opera11_64", name : "Opera 11.64", ico : "opera", bs: "win-opera-12.10", sl: "opera-11"}
, {id : "opera12_12", name : "Opera 12.12", ico : "opera", bs: "win-opera-12.14", sl:"opera-12"}
]


module.exports = function(ctx, cb){

  ctx.route.get("/frameworks.json", function(req, res, next){
    var f = frameworks.filter(function(x){return !!x.id})  
    res.send(f)
  })

  ctx.route.get("/framework/results/:id", function(req, res, next){

    var framework = frameworksObj[req.params.id]

    if(!framework) return next();
    
    var jobs = res.locals.models.Job
                 .find()
                // Reverse chronological order
                 .sort({'finished_timestamp': -1})
                // Only jobs for this repo
                 .where('repo_url', framework.repo_url)
                // Only finished jobs
                 .where('finished_timestamp').ne(null)
                // Only jobs which have not been archived
                 .where('archived_timestamp', null)
                // Only jobs with results stored
                 .where('tasks').ne(null)
                 .limit(10)
                 .populate('_owner')
                 .lean(true)
                 .exec(function(err, jobs){

			var showJob = true;
			var showTask = true;


      var jobData = []
      for (x in jobs){
        var job = jobs[x]
					job.stderr = "";
					job.stdout = "";
					job.stdmerged = "";

				if(showJob) {
					job.stderr = "";
					job.stdout = "";
					job.stdmerged = "";
					//console.log(job);
					showJob = false;
				}

        if (!job.tasks.length)
          continue;

				//console.log(job.github_commit_info);

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
            for (var z =0; z< job.tasks.length; z++){
							/*
							if(showTask) {
								console.log(job.tasks[z]);
								showTask = false;
							}
							*/
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

      res.send(swig.compileFile(__dirname + "/framework.html").render({
          "id" : framework.id
        , "name" : framework.name
        , "src" : framework.src
        , "results" : jobData
        , "repo" : framework.repo
        , "browsers" : browsers
      }))
    })
  })

  ctx.registerBlock("Nav", function(context, fn){
    fn(null, "&nbsp;");
  })

  ctx.registerBlock("LoggedOutFillContent", function(context, fn){
    fn(null, swig.compileFile(__dirname + '/dashboard.html').render({}));
	})

  ctx.registerBlock("JobPagePreTitle", function(context, fn){
    var r = repoFrameworks[context.repo_url] || {}
    fn(null, "<p class='job-pre-title'>Framework / " + r.name + "</p>")
  })

  ctx.registerBlock("JobPagePostTitle", function(context, fn){
    var r = repoFrameworks[context.repo_url] || {}
    fn(null,"<p class='job-post-title'>" + r.name + " / " + r.name + "</p>")
  })

	function JobPagePreCols(context, fn) {
    var framework = frameworksObj[context.repo]

      var job = null

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

      return {
        passrate : parseInt((passtotal / testtotal) * 100)
      , passed : passtotal
      , total : testtotal
      , duration: job.duration
      , "name" : framework.name
      , "src" : framework.src
      , "browsers" : browsers
      };
  }

  ctx.registerBlock("JobMain", function(context, fn){
    var tmpl = swig.compileFile(__dirname  + "/JobMain.html")
		var show_error_console = false;

		context.results_detail.error_output = context.results_detail.output.match(/^.*\[ERROR\](.*)$/mg, "");
		if(context.results_detail.error_output != null) {
			context.results_detail.error_output = context.results_detail.error_output.join("\n");
			show_error_console = true;
		}	
		context.results_detail.error_output = escapeHtml(context.results_detail.error_output);
		context.results_detail.output = escapeHtml(context.results_detail.output);
		if(context.results_detail.github_commit_info != undefined) {
			context.results_detail.github_commit_info.short_id 
				= (context.results_detail.github_commit_info.id + "").slice(0,9);
		}

		var out = _.extend(context,JobPagePreCols(context,fn),{
			show_error_console: show_error_console
		});
    fn(null, tmpl.render(out));
	});
  
  cb(null);
}

function escapeHtml(text) {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
