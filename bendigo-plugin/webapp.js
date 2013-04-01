module.exports = function(ctx, cb){


  //ctx.routes.get('/bendigo-dash.json', function(req, res, next){});
  

  ctx.registerBlock("LoggedOutFillContent", function(ctx){
    return "<h1>Hello, world</h1>"
  
  })

  cb(null);
}
