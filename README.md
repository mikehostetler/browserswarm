## Overview

BrowserSwarm is a heavily customized version of [StriderCD](http://stridercd.com).
The Strider core is BSD-licensed and is desigend to be highly customizable and
extensible. Strider is written in JavaScript / Node.JS and uses MongoDB as a
database backend.

The BrowserSwarm web application server is implemented as a consumer of Strider as a
library.

All the customizations and special logic is contained in a number of Strider plugins:

- [strider-qunit](https://github.com/Strider-CD/strider-qunit): QUnit test support for Strider (jQuery, jQuery-UI, jQuery-Mobile lal use QUnit). 
- [strider-browserstack](https://github.com/Strider-CD/strider-browserstack): BrowserStack.com support for running front-end JavaScript tests in multiple Browser/OS combinations on the BrowserStack cloud. This plugin transparently works with strider-qunit. Note that [strider-sauce](https://github.com/Strider-CD/strider-sauce) may also be used if you wish to run the tests on Sauce Labs cloud instead of BrowserStack.
- [strider-jelly](https://github.com/Strider-CD/strider-jelly): Strider Jelly-Proxy plugin.
- [strider-custom](https://github.com/Strider-CD/strider-custom): Run custom shell commands for projects in each phase.
- [browserswarm-plugin](https://github.com/appendto/browserswarm/tree/master/browserswarm-plugin): Front-end and mostly display customization for the BrowserSwarm project resides here. This is a private, non-open source plugin.

## Dependencies

BrowserSwarm consists of a single node.js web application process, which spawns test jobs in response to Github commits and manual test runs.

In order to run the jQuery tests, it requires:

- Node.JS
- Java (for the BrowserStack or Sauce Labs test connectors)
- PHP (for the jQuery test suite)
- A MongoDB database backend

## Running Locally

BrowserSwarm is quite easy to run in a development setting on your local machine. You need:

- MongoDB running on local machine. Get MongoDB at http://www.mongodb.org/downloads
- Node.JS installed on local machine. Get Node.JS at http://nodejs.org

Optionally:

- Java installed if you want to run tests on BrowserStack or Sauce Labs.
- `php-cli` PHP binaries installed and available in your `$PATH` if you want jQuery tests to run successfully.

Clone the repo from github:

`git clone git@github.com:appendto/browserswarm.git`

Install dependencies:

`cd strider && npm install`

Add an admin user to log in with:

`./node_modules/strider/bin/strider addUser`

Start BrowserSwarm application server:

`npm start`

Assuming all went well, your BrowserSwarm instance should now be accessible at [http://localhost:3000](http://localhost:3000)

## Production Environment

The [live BrowserSwarm application](http://browserswarmlive-appendto.dotcloud.com) is hosted on [dotCloud](http://dotcloud.com). We use dotCloud because they are the only PaaS provider we're aware of who support:

- Up to 64G of memory per process (BrowserSwarm needs about 768M to run the JVM process, PHP and the JavaScript tests)
- Support for Node.JS, Websockets, Java and PHP all in the same application environment

The dotCloud production application consists of two instances (for redundancy
more than performance per se) with 768M of reserved memory each.

The live BrowserSwarm MongoDB database is a [MongoLab shared cluster
plan](https://mongolab.com/products/architecture/). The shared cluster plan
includes a replica in a different EC2 availability zone for redundancy.
MongoLab can also be used to monitor performance, query data, and offers scheduled
database backup services if required. At this time, it is unlikely BrowserSwarm will
need higher performance, but if necessary it can be upgraded to a MongoLab
dedicated plan.

The MongoDB database is hosted in the Amazon EC2 us-east-1 location, which is
the same location as dotCloud. This means that there is minimal network latency
between the BrowserSwarm applciation server and the Benidgo MongoDB server.

## Setting up dotCloud Tools & Account

[dotCloud](http://docs.dotcloud.com/firststeps/install/) has a web interface and a CLI tool. To deploy BrowserSwarm to dotCloud, you must use the CLI tool. [See the dotCloud website for help on installing the CLI tool on multiple platforms](http://docs.dotcloud.com/firststeps/install/)

Once you have the `dotcloud` command available on the machine you wish to deploy from, ensure you are logged into the `appendto` dotCloud account (Mike has the credentials).

You can do this by `cd`'ing into the [BrowserSwarm repo](https://github.com/appendto/browserswarm) you cloned from Github earlier:

`cd /path/to/strider && dotcloud setup`

The name of the production dotCloud app for BrowserSwarm is `browserswarmlive`. You should connect the BrowserSwarm repo copy to this app with the following command:

`cd /path/to/strider && dotcloud connect --git browserswarmlive`

Now to confirm you are correctly connect, run `dotcloud info` and you should see something like the following output on your terminal:

```
$ dotcloud info
=== browserswarmlive
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

Deploying a new version of BrowserSwarm to dotCloud is a straight-forward process. However, you should be aware that it does occasionally fail or error out. If you receive an error, simply retry.

To execute an incremental deploy to BrowserSwarm, simply run the following command from the BrowserSwarm repo clone. This is the same directly that contains a file named `dotcloud.yml`:

`dotcloud push`

Expect this to take up to 10 minutes to complete as NPM modules must be installed etc.

Sometimes you may wish to execute a full deploy from a clean state. A "clean" deploy will blow away any existing binaries or modules in the dotCloud build. This can be a helpful thing to do if you wish to be sure all the latest changes are reflected in the live instance:

`dotloud push --clean`

Again, this can take 10-15 minutes to complete. PHP, Java, Node.JS and all the NPM modules must be installed on dotCloud.

## Details of dotCloud config

Hopefully you won't need to change any of these details, but it may be helpful to be aware of how configuration works. 

The dotCloud application is implemented as a `custom` service. This is because we require multiple languages in a single application container: Java, PHP and Node. Refer to the [dotCloud custom service documentation](http://docs.dotcloud.com/services/custom/) for the gorey details.

The build script for the `custom` service is in [dotcloud-builder/builder](https://github.com/appendto/browserswarm/blob/master/dotcloud-builder/builder). The most likely reason to edit this script is to change the version of Node.JS used to run BrowserSwarm on production. 

The rest of the configuration is stored in the [dotcloud.yml](https://github.com/appendto/browserswarm/blob/master/dotcloud.yml) file in the project root. This file specifies:

- PHP5-cli package should be installed in the dotCloud container.
- The MongoDB URL (`DB_URI` variable)
- The Internet-accessible hostname of BrowserSwarm (`SERVER_NAME` variable)
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

## Mootools

Similar to Knockout, this one also uses strider-jelly.

URL of test content: `http://localhost:9090/Specs/Runner/runner.html`

Port on which Jelly-Proxy listens: `8080`

JS Shim: Same as Knockout (copy & paste from above)

Static file server: enable

Server from path: `.`


## Prototype

This one sucks. Prototype have made the dubious choice to use a rake taks and
some ruby testing stuff. They also don't concatenate their tests which is a
pain.

Custom Pre Script: `rake test:build`

Jelly URL: http://localhost:8080/tmp/class_test.html
Jelly Port: 9090

Jelly Proxy Shim:
```javascript
<script>

if(typeof JSON!=="object"){JSON={}}(function(){function f(n){return n<10?"0"+n:n}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+string+'"'}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==="object"&&typeof value.toJSON==="function"){value=value.toJSON(key)}if(typeof rep==="function"){value=rep.call(holder,key,value)}switch(typeof value){case"string":return quote(value);case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);case"object":if(!value){return"null"}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==="[object Array]"){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||"null"}v=partial.length===0?"[]":gap?"[\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"]":"["+partial.join(",")+"]";gap=mind;return v}if(rep&&typeof rep==="object"){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==="string"){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}v=partial.length===0?"{}":gap?"{\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"}":"{"+partial.join(",")+"}";gap=mind;return v}}if(typeof JSON.stringify!=="function"){JSON.stringify=function(value,replacer,space){var i;gap="";indent="";if(typeof space==="number"){for(i=0;i<space;i+=1){indent+=" "}}else{if(typeof space==="string"){indent=space}}rep=replacer;if(replacer&&typeof replacer!=="function"&&(typeof replacer!=="object"||typeof replacer.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":value})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==="object"){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v}else{delete value[k]}}}}return reviver.call(holder,key,value)}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}}());

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


var _run = 0;

var checkTests = function(){
  var res = document.getElementById("testlog").firstChild.innerHTML
  var dat = res.match(/(\d*) tests, (\d*) assertions, (\d*) failures, (\d*) errors/);
  if (dat && dat.length == 5){ // str, tests, assertions, fails, errors
    var tests = dat[1]
      , fails = dat[3]

    var data = {
        total: tests
      , passed : tests - fails
      , failed : fails
      , tracebacks: []
      , url : window.location.pathname
    }
    if (tests == _run){
      // complete (this is a dubious assumption - they could have just timed out :/ )
      post("/_jelly/results", data, function(){});
    } else {
      _run = tests;
      post('/_jelly/progress', data, function(){});
      setTimeout(checkTests, 500);
    }
  } else {
    // Aaah, couldnt find the elem. Bail.
    post("/_jelly/results", {"error" : "Couldn't find the results elem"}, function(){});
  }
}

setTimeout(checkTests, 500)



})();
</script>
```

Jelly Serve:
Yes
Path: "/test/unit"


## DOJO

Custom Pre:
```bash
if [ ! -d "../util" ]; then git clone --depth=1 git://github.com/dojo/util.git ../util; fi
```

Jelly Url: "http://localhost:8080/util/doh/runner.html?boot=../../dojo/dojo.js
Port:9090

Shim: 
```javascript
<script>
// JSON For IE6
if(typeof JSON!=="object"){JSON={}}(function(){function f(n){return n<10?"0"+n:n}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+string+'"'}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==="object"&&typeof value.toJSON==="function"){value=value.toJSON(key)}if(typeof rep==="function"){value=rep.call(holder,key,value)}switch(typeof value){case"string":return quote(value);case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);case"object":if(!value){return"null"}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==="[object Array]"){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||"null"}v=partial.length===0?"[]":gap?"[\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"]":"["+partial.join(",")+"]";gap=mind;return v}if(rep&&typeof rep==="object"){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==="string"){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}v=partial.length===0?"{}":gap?"{\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"}":"{"+partial.join(",")+"}";gap=mind;return v}}if(typeof JSON.stringify!=="function"){JSON.stringify=function(value,replacer,space){var i;gap="";indent="";if(typeof space==="number"){for(i=0;i<space;i+=1){indent+=" "}}else{if(typeof space==="string"){indent=space}}rep=replacer;if(replacer&&typeof replacer!=="function"&&(typeof replacer!=="object"||typeof replacer.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":value})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==="object"){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v}else{delete value[k]}}}}return reviver.call(holder,key,value)}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}}());

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


var _run = 0;

var checkTests = function(){
  if (!window.doh){
    return setTimeout(checkTests, 10000)
  }
  var tests = doh._testCount
    , fails = doh._failureCount
    , tme = doh._totalTime

  var data = {
      total: tests
    , passed : tests - fails
    , failed : fails
    , tracebacks: []
    , url : window.location.pathname
  }
  if (tme > 0 && tme == _run){
    post("/_jelly/results", data, function(){});
  } else {
    _run = tme;
    post('/_jelly/progress', data, function(){});
    setTimeout(checkTests, 30000);
  }
}

setTimeout(checkTests, 5000)



})();
</script>
```

Jelly Serve: yes
Path: "."



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
