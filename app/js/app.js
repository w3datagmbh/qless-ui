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
      when('/phones/:phoneId', {
        templateUrl: 'partials/queues.html',
        controller: 'PhoneDetailCtrl'
      }).
      otherwise({
        redirectTo: '/queues'
      });
  }]);
