## Overview

Bendigo is a heavily customized version of [StriderCD](http://stridercd.com).
The Strider core is BSD-licensed and is desigend to be highly customizable and
extensible. Strider is written in JavaScript / Node.JS and uses MongoDB as a
database backend.

The Bendigo web application server is implemented as a consumer of Strider as a
library.

All the customizations and special logic is contained in a number of Strider plugins:

- [strider-qunit](https://github.com/Strider-CD/strider-qunit): QUnit test support for Strider (jQuery, jQuery-UI, jQuery-Mobile lal use QUnit). 
- [strider-browserstack](https://github.com/Strider-CD/strider-browserstack): BrowserStack.com support for running front-end JavaScript tests in multiple Browser/OS combinations on the BrowserStack cloud. This plugin transparently works with strider-qunit. Note that [strider-sauce](https://github.com/Strider-CD/strider-sauce) may also be used if you wish to run the tests on Sauce Labs cloud instead of BrowserStack.
- [strider-jelly](https://github.com/Strider-CD/strider-jelly): Strider Jelly-Proxy plugin.
- [strider-custom](https://github.com/Strider-CD/strider-custom): Run custom shell commands for projects in each phase.
- [bendigo-plugin](https://github.com/appendto/strider/tree/master/bendigo-plugin): Front-end and mostly display customization for the Bendigo project resides here. This is a private, non-open source plugin.

## Dependencies

Bendigo consists of a single node.js web application process, which spawns test jobs in response to Github commits and manual test runs.

In order to run the jQuery tests, it requires:

- Node.JS
- Java (for the BrowserStack or Sauce Labs test connectors)
- PHP (for the jQuery test suite)
- A MongoDB database backend

## Running Locally

Bendigo is quite easy to run in a development setting on your local machine. You need:

- MongoDB running on local machine. Get MongoDB at http://www.mongodb.org/downloads
- Node.JS installed on local machine. Get Node.JS at http://nodejs.org

Optionally:

- Java installed if you want to run tests on BrowserStack or Sauce Labs.
- `php-cli` PHP binaries installed and available in your `$PATH` if you want jQuery tests to run successfully.

Clone the repo from github:

`git clone git@github.com:appendto/strider.git`

Install dependencies:

`cd strider && npm install`

Add an admin user to log in with:

`./node_modules/strider/bin/strider addUser`

Start Bendigo application server:

`npm start`

Assuming all went well, your Bendigo instance should now be accessible at [http://localhost:3000](http://localhost:3000)

## Production Environment

The [live Bendigo application](http://bendigolive-appendto.dotcloud.com) is hosted on [dotCloud](http://dotcloud.com). We use dotCloud because they are the only PaaS provider we're aware of who support:

- Up to 64G of memory per process (Bendigo needs about 768M to run the JVM process, PHP and the JavaScript tests)
- Support for Node.JS, Websockets, Java and PHP all in the same application environment

The dotCloud production application consists of two instances (for redundancy
more than performance per se) with 768M of reserved memory each.

The live Bendigo MongoDB database is a [MongoLab shared cluster
plan](https://mongolab.com/products/architecture/). The shared cluster plan
includes a replica in a different EC2 availability zone for redundancy.
MongoLab can also be used to monitor performance, query data, and offers scheduled
database backup services if required. At this time, it is unlikely Bendigo will
need higher performance, but if necessary it can be upgraded to a MongoLab
dedicated plan.

The MongoDB database is hosted in the Amazon EC2 us-east-1 location, which is
the same location as dotCloud. This means that there is minimal network latency
between the Bendigo applciation server and the Benidgo MongoDB server.

## Setting up dotCloud Tools & Account

[dotCloud](http://docs.dotcloud.com/firststeps/install/) has a web interface and a CLI tool. To deploy Bendigo to dotCloud, you must use the CLI tool. [See the dotCloud website for help on installing the CLI tool on multiple platforms](http://docs.dotcloud.com/firststeps/install/)

Once you have the `dotcloud` command available on the machine you wish to deploy from, ensure you are logged into the `appendto` dotCloud account (Mike has the credentials).

You can do this by `cd`'ing into the [Bendigo repo](https://github.com/appendto/strider) you cloned from Github earlier:

`cd /path/to/strider && dotcloud setup`

The name of the production dotCloud app for Bendigo is `bendigolive`. You should connect the Bendigo repo copy to this app with the following command:

`cd /path/to/strider && dotcloud connect --git bendigolive`

Now to confirm you are correctly connect, run `dotcloud info` and you should see something like the following output on your terminal:

```
$ dotcloud info
=== bendigolive
flavor:                     live
cost to date:               $41
expected month-end cost:    $207
+------+--------+------------+-----------------+
| name | type   | containers | reserved memory |
+------+--------+------------+-----------------+
| www  | custom | 2          | 768.0 M         |
+------+--------+------------+-----------------+
```

## Deploying to dotCloud

Deploying a new version of Bendigo to dotCloud is a straight-forward process. However, you should be aware that it does occasionally fail or error out. If you receive an error, simply retry.

To execute an incremental deploy to Bendigo, simply run the following command from the Bendigo repo clone. This is the same directly that contains a file named `dotcloud.yml`:

`dotcloud push`

Expect this to take up to 10 minutes to complete as NPM modules must be installed etc.

Sometimes you may wish to execute a full deploy from a clean state. A "clean" deploy will blow away any existing binaries or modules in the dotCloud build. This can be a helpful thing to do if you wish to be sure all the latest changes are reflected in the live instance:

`dotloud push --clean`

Again, this can take 10-15 minutes to complete. PHP, Java, Node.JS and all the NPM modules must be installed on dotCloud.

## Details of dotCloud config

Hopefully you won't need to change any of these details, but it may be helpful to be aware of how configuration works. 

The dotCloud application is implemented as a `custom` service. This is because we require multiple languages in a single application container: Java, PHP and Node. Refer to the [dotCloud custom service documentation](http://docs.dotcloud.com/services/custom/) for the gorey details.

The build script for the `custom` service is in [dotcloud-builder/builder](https://github.com/appendto/strider/blob/master/dotcloud-builder/builder). The most likely reason to edit this script is to change the version of Node.JS used to run Bendigo on production. 

The rest of the configuration is stored in the [dotcloud.yml](https://github.com/appendto/strider/blob/master/dotcloud.yml) file in the project root. This file specifies:

- PHP5-cli package should be installed in the dotCloud container.
- The MongoDB URL (`DB_URI` variable)
- The Internet-accessible hostname of Bendigo (`SERVER_NAME` variable)
- The Github OAuth Application ID and Secret (`GITHUB_APP_ID` and `GITHUB_APP_SECRET` variables)
- The SMTP server settings to send email (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` variables) (currently using a free [Mailgun](http://mailgun.org) account)
- The start command for the application server (`npm start`)
    




## Library setup

Most of the libraries require manual configuration of Strider plugins:

### jQuery

jquery uses the strider-qunit plugin with the strider-browserstack plugin.

qunit path : 'test'
qunit testfile : 'test/index.html'


Grunt builds are done with a *custom* prepare script:

```bash
NODE_ENV=dev; (grunt || (npm install -g grunt-cli && npm install && npm install gzip-js grunt-compare-size grunt-git-authors grunt-update-submodules grunt-contrib-watch grunt-contrib-uglify grunt-contrib-jshint@0.4 && grunt))
```

### jQuery UI
QUnit config:

path : "."
test file  : "./tests/unit/all.html"



Custom:
pre:
```bash
sed -i.bak 's/grunt/true/' package.json && cat package.json && echo "POLYFILLED GRUNT"
```

### Jquery mobile

QUnit config:

path : "."
test file : "tests/unit/kitchensink/index.html"

pre:

```bash
export NODE_ENV=dev npm install && npm install grunt && npm install -g grunt-cli && grunt --force js:release  && sed -i.bak 's/grunt/true/' package.json && cat package.json && echo "POLYFILLED GRUNT"
```

### Backbone

This one is a fun one - we want to polyfill phantom, so it skips to browserstack plugin - custom pre script:

```bash
sed -i.bak 's/phantomjs/true/' package.json && sed -i.bak 's/coffee/true/' package.json && cat package.json && echo "POLYFILLED PHANTOM"
```

### Knockout

This one uses strider-jelly:

url: http://localhost:9090/spec/runner.html
port: 8080

shim:
```js
<script type="text/javascript">
/*
 * This allows you to receive reporting from a series
 * of Jasmine tests in the form of a Jasmine Custom
 * Reporter that talks back to the strider server.
 */
(function(){
// Tiny Ajax Post
var post = function (url, json, cb){
  var req;

  if (window.ActiveXObject)
    req = new ActiveXObject('Microsoft.XMLHTTP');
  else if (window.XMLHttpRequest)
    req = new XMLHttpRequest();
  else
    throw "Strider: No ajax"

  req.onreadystatechange = function () {
      if (req.readyState==4)
        cb(req.responseText);
    };
  var data = "data=" + JSON.stringify(json)
  req.open("POST", url, true);
  req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  req.setRequestHeader('Content-length',  data.length);
  req.setRequestHeader('Connection', 'close');
  req.send(data);
}

function JellyReporter() {
  this.executed = 0;
  this.failed = 0;
  this.passed = 0;
  this.errors = [];
}

JellyReporter.prototype = new jasmine.Reporter();

JellyReporter.prototype.reportRunnerResults = function (runner) {
  // When all the spec are finished //
  var result = runner.results();
  var data = {
      total: this.executed
    , passed : this.passed
    , failed : this.failed
    , tracebacks: this.errors
    , url : window.location.pathname
  }
  post("/_jelly/results", data, function(){});
};

JellyReporter.prototype.reportSuiteResults = function (suite) {}

JellyReporter.prototype.reportSpecResults = function(spec) {
    // When a single spec has finished running //

    this.executed ++;

    var result = spec.results();
    if (!result.passed()){
      this.errors.push([spec.description, result]);
      this.failed ++;
    } else {
      this.passed ++;
    }

    if (this.executed % 50 == 0){
      var data = {
          total: this.executed
        , passed : this.passed
        , failed : this.failed
        , tracebacks: this.errors
        , url : window.location.pathname
      }
      this.errors = [];
      post('/_jelly/progress', data, function(){}); 
    }
}


var jasmineEnv = jasmine.getEnv();
jasmineEnv.updateInterval = 1000;

var reporter = new JellyReporter();
jasmineEnv.addReporter(reporter);

})();
</script>
```

enable staic server,
serve: .


## Auth

Github Account:

u: browserswarm-sync
p: QjNVifpcz7KQT3x`.

Strider master account:
u: hi@frozenridge.co
p: H+U8tM4JJ09+tA=

MongoLab:
https://mongolab.com/login/

Username: appendto
Password: oTM2Cy2eEhtUuNX


## Making repo's public:

In mongo:

```mongo
 db.users.update({"github_config.url" : "https://github.com/browserswarm/backbone"}, {"$set" : {"github_config.$.public" : true }})
```
