var swig = require('swig')
  , frameworks = require("./frameworks.json")
  , frameworksObj = {}

frameworks.forEach(function(x){
  if (x.id)
  frameworksObj[x.id] = x;
})

module.exports = function(ctx, cb){

  ctx.route.get("/frameworks.json", function(req, res, next){
    var f = frameworks.filter(function(x){return !!x.id})  
    res.send(f)
  })

  ctx.route.get("/framework/results/:id", function(req, res, next){

    var framework = frameworksObj[req.params.id]

    if(!framework) return next();
    
    var jobs = res.locals.models.Job
                 .find({repo_url: framework.repo_url})
                 .limit(10)
                 .exec(function(){

      console.log("!!!", arguments);
      // TODO : Filter jobs for browsers
      // TODO : Marshall into usable json
      res.send(swig.compileFile(__dirname + "/framework.html").render({
          "id" : framework.id
        , "name" : framework.name
      }))
    })
  })

  ctx.registerBlock("Nav", function(context, cb){
    cb(null, "&nbsp;");
  })

  ctx.registerBlock("LoggedOutFillContent", function(context, fn){
    fn(null, swig.compileFile(__dirname + '/dashboard.html').render({}));
 })


  

  console.log("bendigo webapp extension loaded");
  cb(null);
}
