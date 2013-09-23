(function ($, _, undefined) {
  'use strict';

  var runningTasks = {};
  var $icons = $('link[rel*="icon"]');

  function setFavicon(status) {
    $icons.attr('href', '/images/icons/favicon-' + status + '.png');
  }

  function startJob(url, task) {
    var data = {url:url, type:task};
    $.ajax('/api/jobs/start', {
      type: 'POST',
      data: data,
      dataType: "json",
      error: function(xhr, ts, e) {
        delete runningTasks[url];
        alert('Unable to submit job. Please try again later.');
      }
      //success intentionally empty, handled by
      //socket.io
    });
  }

  $('#retest-button.tool, #retest-deploy-button.tool').on('click', function (e) {
    e.preventDefault();
    var $a = $(this);
    var url = $a.attr('data-url'),
      task = $a.attr('data-task');
    if (_.has(runningTasks, url)) {
      //already running
      return;
    }
    runningTasks[url] = task;
    setFavicon('running');
    $a.addClass('pending');
    startJob(url, task);
  });

}(jQuery, _));