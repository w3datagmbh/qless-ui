'use strict';

/* App Module */

var qlessuiApp = angular.module('qlessUi', [
  'ngRoute',

  'qlessuiControllers',
  'qlessuiServices',
]);

qlessuiApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/queues', {
        templateUrl: 'partials/queues.html',
        controller: 'QueuesListCtrl'
      }).
      when('/queues/:queueName', {
        templateUrl: 'partials/queues_get.html',
        controller: 'QueuesGetCtrl'
      }).
      when('/workers', {
        templateUrl: 'partials/workers.html',
        controller: 'WorkersListCtrl'
      }).
      when('/workers/:workerName', {
        templateUrl: 'partials/workers_get.html',
        controller: 'WorkersGetCtrl'
      }).
      when('/jobs/tracked', {
        templateUrl: 'partials/jobs_tracked.html',
        controller: 'JobsTrackedListCtrl'
      }).
      when('/jobs/failed', {
        templateUrl: 'partials/jobs_failed.html',
        controller: 'JobsFailedCtrl'
      }).
      when('/jobs/failed/:group', {
        templateUrl: 'partials/jobs_failed_list.html',
        controller: 'JobsFailedListCtrl'
      }).
      when('/jobs/completed', {
        templateUrl: 'partials/jobs_completed.html',
        controller: 'JobsCompletedListCtrl'
      }).
      when('/jobs/:jid', {
        templateUrl: 'partials/jobs_get.html',
        controller: 'JobsGetCtrl'
      }).
      otherwise({
        redirectTo: '/queues'
      });
  }]);
