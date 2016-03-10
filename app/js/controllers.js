'use strict';

/* Controllers */

var qlessuiControllers = angular.module('qlessuiControllers', ['angularBootstrapNavTree']);

qlessuiControllers.controller('QueuesListCtrl', ['$scope', 'Groups', 'Group', 'Queues',
  function($scope, Groups, Group, Queues) {
    $scope.groups = Groups.nav();
    $scope.queues = Queues.counts();
    $scope.groups_tree = {};

    $scope.on_select_group = function(branch) {
        $scope.queues = branch.data ? Group.get({regex_str: branch.data}) : null;
    }
  }
]);

qlessuiControllers.controller('QueuesGetCtrl', ['$scope', '$routeParams', 'Queue',
  function($scope, $routeParams, Queue) {
    $scope.queue = Queue.get({queueName: $routeParams.queueName});
  }
]);