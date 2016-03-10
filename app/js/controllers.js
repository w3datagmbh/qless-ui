'use strict';

/* Controllers */

var qlessuiControllers = angular.module('qlessuiControllers', []);

qlessuiControllers.controller('QueuesListCtrl', ['$scope', 'Config', 'Queues',
  function($scope, Config, Queues) {
    $scope.config = Config.get();
    $scope.queues = Queues.counts();
  }
]);

qlessuiControllers.controller('QueuesGetCtrl', ['$scope', '$routeParams', 'Queue',
  function($scope, $routeParams, Queue) {
    $scope.queue = Queue.get({queueName: $routeParams.queueName});
  }
]);