#!/bin/bash

BASE="git@github.com:BrowserSwarm"
JQUERY_BROWSERSWARM="$BASE/jquery"
JQUERY_UPSTREAM="https://github.com/jquery/jquery.git"

JQUERY_UI_BROWSERSWARM="$BASE/jquery-ui"
JQUERY_UI_UPSTREAM="https://github.com/jquery/jquery-ui.git"

JQUERY_MOBILE_BROWSERSWARM="$BASE/jquery-ui"
JQUERY_MOBILE_UPSTREAM="https://github.com/jquery/jquery-ui.git"

# jQuery
git clone $JQUERY_BROWSERSWARM jquery
cd jquery
git remote add upstream $JQUERY_UPSTREAM 
git pull upstream master
git push

# jQuery-UI
git clone $JQUERY_UI_BROWSERSWARM jquery-ui
cd jquery-ui
git remote add upstream $JQUERY_UI_UPSTREAM 
git pull upstream master
git push

# jQuery-Mobile
git clone $JQUERY_MOBILE_BROWSERSWARM jquery-mobile
cd jquery-mobile
git remote add upstream $JQUERY_MOBILE_UPSTREAM 
git pull upstream master
git push
