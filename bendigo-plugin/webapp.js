var swig = require('swig')
  , frameworks = require("./frameworks.json")
  , frameworksObj = {}

frameworks.forEach(function(x){
  if (x.id)
  frameworksObj[x.id] = x;
})

var browsers = [
  {id : "chrome24", name : "Chrome 24", ico : "chrome"}
, {id : "chrome25", name : "Chrome 25", ico : "chrome"}
, {id : "firefox18", name : "Firefox 18", ico : "firefox"}
, {id : "firefox19", name : "Firefox 19", ico : "firefox"}
, {id : "ie6", name : "IE 6", ico : "ie-6"}
, {id : "ie7", name : "IE 7", ico : "ie-8"}
, {id : "ie8", name : "IE 8", ico : "ie-8"}
, {id : "ie9", name : "IE 9", ico : "ie"}
, {id : "ie10", name : "IE 10", ico : "ie-10"}
, {id : "safari5", name : "Safari 5.1", ico : "safari"}
, {id : "safari6", name : "Safari 6.0", ico : "safari"}
, {id : "opera12", name : "Opera 12.0", ico : "opera"}
, {id : "opera13", name : "Opera 13.0", ico : "opera"}
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
                 .limit(10)
                 .populate('_owner')
                 .lean(true)
                 .exec(function(err, jobs){

      // TODO : Filter jobs for browsers
      // TODO : Marshall into usable json
     
      // TODO : Mock Data:
      var mockData = []
      for (x in jobs){ 
        var job = jobs[x]
        console.log("Job: " , job._id)
        var j = {id : job._id}
        j.id_short  = (job._id + "").slice(0,9)
        for (var i in browsers){
         j[browsers[i].id] = "unknown"
        }
        mockData.push(j)
      }

      res.send(swig.compileFile(__dirname + "/framework.html").render({
          "id" : framework.id
        , "name" : framework.name
        , "src" : framework.src
        , "results" : mockData
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

  ctx.registerBlock("JobPagePreCols", function(context, fn){
    var tmpl = swig.compileFile(__dirname  + "/JobPagePreCols.html")
      , job = context.models.Job
                 .find()
                // Reverse chronological order
                 .sort({'finished_timestamp': -1})
                // Only jobs for this repo
         //        .where('repo_url', framework.repo_url)
                // Only finished jobs
                 .where('finished_timestamp').ne(null)
                // Only jobs which have not been archived
                 .where('archived_timestamp', null)
                 .limit(1)
                 .populate('_owner')
                 .lean(true)
                 .exec(function(err, jobs){

      var out = tmpl.render({
        passrate : 0
      , passed : 1234
      , total : 9999
      , duration: 123
      })
      fn(null, out);
    })
  })
  

  console.log("bendigo webapp extension loaded");
  cb(null);
}
