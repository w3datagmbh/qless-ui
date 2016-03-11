'use strict';

/* Controllers */

var qlessuiControllers = angular.module('qlessuiControllers', ['angularBootstrapNavTree']);

qlessuiControllers.controller('QueuesListCtrl', ['$scope', 'Groups', 'Queues',
  function($scope, Groups, Queues) {
    $scope.groups = Groups.nav();
    $scope.queues = Queues.query();
    $scope.groups_tree = {};
    var regexStr = '.*';

    $scope.on_select_group = function(branch) {
        regexStr = branch.data ? branch.data : null;
        $scope.on_refresh();
    }
    $scope.on_refresh = function() {
        $scope.queues = regexStr ? Groups.get({regexStr: regexStr}) : null;
    }
    $scope.on_queue_play = function(queueName) {
        console.log(queueName);
        // TODO API CALL
        $scope.on_refresh();
    }
    $scope.on_queue_pause = function(queueName) {
        console.log(queueName);
        // TODO API CALL
        $scope.on_refresh();
    }
  }
]);

qlessuiControllers.controller('QueuesGetCtrl', ['$scope', '$routeParams', 'Queues',
  function($scope, $routeParams, Queues) {
        $scope.queue = Queues.get({queueName: $routeParams.queueName});
  }
]);