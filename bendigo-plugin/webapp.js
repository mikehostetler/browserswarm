var swig = require('swig')

module.exports = function(ctx, cb){

  ctx.registerBlock("Nav", function(context, cb){
    cb(null, "&nbsp;");
  })

  ctx.registerBlock("LoggedOutFillContent", function(context, fn){
/*
    var Job = res.locals.models.Job;

    Job.find()
      .sort({'finished_timestamp': -1})
      .where('finished_timestamp').ne(null)
      .where('archived_timestamp', null)
      .where('type').in(['TEST_ONLY','TEST_AND_DEPLOY'])
      .limit(20)
      .lean(true)
      .populate("_owner")
      .exec(function(err,results){
        var out = "<h1>Recent Jobs</h1>"
        results.forEach(function(r){
          out += "<div><h2 style='background-color:"
          out += "" +  ((r.test_exitcode == 0) ? '#0f0' : '#f00') + ";'>" 
          out += r.repo_url + "</h2></div>"
        })
*/
        // Proof of concept hackery
        var libs = [
          {name: "jQuery"}
        , {name: "jQuery UI"}
        , {name: "jQuery Mobile"}
        , {name: "Dojo Toolkit"}
        , {name: "Dojo Toolkit"}
        , {name: "Mootools"}
        , {name: "Prototype.js"}
          // --
        ]


          , browsers = ["IE 8", "IE 7", "Firefox 19", "Firefox 20 beta", "Chrome 25", "Chrome 26 beta", "Safari 5.1", "Opera 12.4"]
       for(var i=0; i<libs.length; i++){
         libs[i].results = [];
          for (var j=0; j<browsers.length; j++){
           libs[i].results[j] = (Math.random() > 0.2) ? 'pass' : 'fail';
          }
       }
    fn(null, swig.compileFile(__dirname + '/dashboard.html').render({libraries: libs, browsers: browsers}));
  })


  

  cb(null);
}
