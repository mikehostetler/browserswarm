var async = require('async')
var fs = require('fs')
var gitane = require('gitane')
var path = require('path')
var rimraf = require('rimraf')

var BASE_SSH = "git@github.com:BrowserSwarm/"

var SSH_PRIV_KEY = fs.readFileSync(path.join(__dirname, 'browserswarm-sync_id_dsa'), 'utf8')

var libs = {
  'jquery': 'https://github.com/jquery/jquery.git',
  'jquery-ui': 'https://github.com/jquery/jquery-ui.git',
  'jquery-mobile': 'https://github.com/jquery/jquery-mobile.git',
  'Modernizr': 'https://github.com/Modernizr/Modernizr.git'
}

var f = []

Object.keys(libs).forEach(function(lib) {

  f.push(function(cb) {

    function start() {
      console.log("deleting %s...", lib)
      rimraf(path.join(process.cwd(), lib), clone)
    }

    function clone(err) {
      if (err) {
        console.log("error deleting %s: %s", lib, err)
        process.exit(1)
      }
      console.log("cloning %s...", lib)
      gitane.run(process.cwd(), SSH_PRIV_KEY,
        "git clone " + BASE_SSH + lib + " " + lib, update)
    }

    function update(err, stdout, stderr) {
      if (err) {
        console.log("error cloning %s: %s", lib, err)
        process.exit(1)
      }
      console.log("clone of %s complete", lib)
      var cmd = "git remote add upstream " + libs[lib]
      gitane.run(path.join(process.cwd(), lib), SSH_PRIV_KEY, cmd, function() {
        if (err) {
          console.log("error adding upstream remote %s: %s", lib, err)
          process.exit(1)
        }
        cmd = "git pull upstream master"
        console.log("pulling from %s", libs[lib])
        gitane.run(path.join(process.cwd(), lib), SSH_PRIV_KEY, cmd, push)
      })
    }

    function push(err, stdout, stderr) {
      if (err) {
        console.log("error updating %s: %s", lib, err)
        process.exit(1)
      }
      console.log("pull of %s complete", lib)
      var cmd = "git push"
      console.log("pushing latest changes for %s", libs[lib])
      gitane.run(path.join(process.cwd(), lib), SSH_PRIV_KEY, cmd, done)
    }

    function done(err, stdout, stderr) {
      if (err) {
        console.log("error pushing %s: %s", lib, err)
        process.exit(1)
      }
      console.log(stdout + stderr)
      console.log("%s: sync complete", lib)
      cb(null, null)
    }

    start()

  })

})

console.log("starting sync for libraries: %s at %s",
  Object.keys(libs).join(" "), new Date())

// simply change to async.parallel to run these in parallel...
async.series(f, function(err, res) {
  if (err) {
    console.log("sync error: %s", err)
    process.exit(1)
  }

  console.log("sync complete for libraries: %s at %s",
    Object.keys(libs).join(" "), new Date())

})
