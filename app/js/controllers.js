'use strict';

/* Controllers */

var qlessuiControllers = angular.module('qlessuiControllers', []);

qlessuiControllers.controller('QueuesListCtrl', ['$scope', 'Queues',
  function($scope, Queues) {
    $scope.queues = Queues.counts();
  }
]);