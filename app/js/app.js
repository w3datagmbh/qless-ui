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
      otherwise({
        redirectTo: '/queues'
      });
  }]);
