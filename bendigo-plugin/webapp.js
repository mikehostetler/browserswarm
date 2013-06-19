var swig = require('swig')
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
  {id : "chrome24", name : "Chrome 26", ico : "chrome", bs : "win-chrome-26.0"}
, {id : "chrome27", name : "Chrome 27", ico : "chrome", bs : "win-chrome-27.0", sl: "chrome-27-windows-8"}
, {id : "firefox18", name : "Firefox 18", ico : "firefox", bs : "win-firefox-18.0", sl: "firefox-18-windows-8"}
, {id : "firefox19", name : "Firefox 19", ico : "firefox", bs : "win-firefox-19.0", sl: "firefox-19-windows-8"}
, {id : "ie6", name : "IE 6", ico : "ie-6", bs : "win-ie-6.0", sl: "ie-6-windows-xp"}
, {id : "ie7", name : "IE 7", ico : "ie-8", bs : "win-ie-7.0", sl: "ie-7-windows-xp"}
, {id : "ie8", name : "IE 8", ico : "ie-8", bs : "win-ie-8.0", sl: "ie-8-windows-xp"}
, {id : "ie9", name : "IE 9", ico : "ie", bs : "win-ie-9.0", sl: "ie-9-windows-7"}
, {id : "ie10", name : "IE 10", ico : "ie-10", bs : "win-ie-10.0", sl: "ie-10-windows-8"}
, {id : "safari5", name : "Safari 5.1", ico : "safari", bs: "mac-safari-5.1", sl: "safari-5-os-x-10.6"}
, {id : "safari6", name : "Safari 6.0", ico : "safari", bs :"mac-safari-6.0", sl: "safari-6-os-x-10.8"}
, {id : "opera12", name : "Opera 12.10", ico : "opera", bs: "win-opera-12.10"}
, {id : "opera12_14", name : "Opera 12.14", ico : "opera", bs: "win-opera-12.14"}
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

      var jobData = []
      for (x in jobs){
        var job = jobs[x]

        if (!job.tasks.length)
          continue;

        var j = {id : job._id}
        j.id_short  = (job._id + "").slice(0,9)

        for (var i in browsers){

          j[browsers[i].id] = "unknown"

          if (browsers[i].sl){
            for (var z =0; z< job.tasks.length; z++){
              if (! job.tasks[z].id == 'browserstack')
                continue;

              var brows = job.tasks[z].data.id;

              if (browsers[i].sl == brows){
                // Browser in job results:
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

  ctx.registerBlock("Nav", function(context, cb){
    cb(null, "&nbsp;");
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
  ctx.registerBlock("JobPagePreConsole", function(context, fn){
    fn(null, "<h4 class='job-page-pre-console'>Job Output</h4>")
  })

  ctx.registerBlock("JobPagePreCols", function(context, fn){
    var tmpl = swig.compileFile(__dirname  + "/JobPagePreCols.html")

      var job = null

      for (var i = 0; i< context.jobs.length; i++){
        if (context.jobs[i].id.indexOf(context.job_id) == 0){
          job = context.jobs[i]
          break
        }
      }
      if (!job){
        // something went wrong...
        console.error("NO JOB FOUND!")
        job = {tasks:[]}
      }

      var passtotal = 0
        , testtotal = 0

      if (! job.tasks) job.tasks = [];

      for (var i = 0; i< job.tasks.length; i++){
        if (!job.tasks[i].id == 'browserstack') continue;

        passtotal += job.tasks[i].data.passed
        testtotal += job.tasks[i].data.passed + job.tasks[i].data.failed

      }

      var out = tmpl.render({
        passrate : parseInt((passtotal / testtotal) * 100)
      , passed : passtotal
      , total : testtotal
      , duration: job.duration
      })
      fn(null, out);
  //  })
  })
  

  console.log("bendigo webapp extension loaded");
  cb(null);
}
