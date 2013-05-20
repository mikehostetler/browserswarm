var swig = require('swig')

module.exports = function(ctx, cb){

  ctx.registerBlock("Nav", function(context, cb){
    cb(null, "&nbsp;");
  })

  ctx.registerBlock("FillPage", function(context, fn){
    fn(null, swig.compileFile(__dirname + '/dashboard.html').render({}));
 })


  

  console.log("bendigo webapp extension loaded");
  cb(null);
}
