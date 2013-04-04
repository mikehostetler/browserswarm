module.exports = function(ctx, cb){

  ctx.route.get('/bendigo-dash-frame.html', function(req, res, next){ 
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

        // Proof of concept hackery
        res.send(out); 
      })
  });
  

  ctx.registerBlock("LoggedOutFillContent", function(context, fn){
    fn(null, "<iframe src='/bendigo-dash-frame.html' style='width:100%; border:none;'>Loading...</iframe>");
  })

  cb(null);
}
