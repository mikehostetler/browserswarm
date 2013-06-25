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

if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, 'startsWith', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function (searchString, position) {
      position = position || 0;
      return this.indexOf(searchString, position) === position;
    }
  });
}

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
              var task_id = job.tasks[z].id;
              var brows = job.tasks[z].data.id;
              if (! (task_id == 'browserstack' || task_id == 'sauce'))
                continue;

              // Sauce Labs fuzzy matching of browsers
              if (brows.startsWith(browsers[i].sl)) {
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
