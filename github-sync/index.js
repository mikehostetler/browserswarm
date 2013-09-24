var async  = require('async')
var fs     = require('fs')
var gitane = require('gitane')
var path   = require('path')
var rimraf = require('rimraf')

var BASE_SSH = "git@github.com:BrowserSwarm/"

var SSH_PRIV_KEY = fs.readFileSync(path.join(__dirname, 'browserswarm-sync_id_dsa'), 'utf8')

// Map each Git repo under BrowserSwarm Github organization to its upstream remote.
// This upstream remote is where we pull the latest changes from during sync.
var libs = {
  'jquery': 'https://github.com/jquery/jquery.git',
  'jquery-ui': 'https://github.com/jquery/jquery-ui.git',
  'jquery-mobile': 'https://github.com/jquery/jquery-mobile.git',
  'Modernizr': 'https://github.com/Modernizr/Modernizr.git',
  'backbone': 'https://github.com/documentcloud/backbone.git',
  'underscore': 'https://github.com/documentcloud/underscore.git',
  'dojo': 'https://github.com/dojo/dojo-oldmirror.git',
  'prototype': 'https://github.com/sstephenson/prototype.git',
  'mootools-core': 'https://github.com/mootools/mootools-core.git',
  'knockout': 'https://github.com/knockout/knockout.git',
	'ember.js': 'https://github.com/emberjs/ember.js.git',
	'angular.js': 'https://github.com/angular/angular.js.git',
	'selectize.js': 'https://github.com/brianreavis/selectize.js.git',
	'bootstrap': 'https://github.com/twbs/bootstrap.git',
	'zepto': 'https://github.com/madrobby/zepto.git',
	'fine-uploader': 'https://github.com/Widen/fine-uploader.git',
	'form': 'https://github.com/malsup/form.git',
	'cycle2': 'https://github.com/malsup/cycle2.git',
	'jquery.maskedinput': 'https://github.com/digitalBush/jquery.maskedinput.git',
	'jquery-validation': 'https://github.com/jzaefferer/jquery-validation.git',
	'knockout-postbox': 'https://github.com/rniemeyer/knockout-postbox.git',
	'knockout-kendo': 'https://github.com/kendo-labs/knockout-kendo.git',
	'moment': 'https://github.com/moment/moment.git'
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
