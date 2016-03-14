'use strict';

/* Controllers */

var qlessuiControllers = angular.module('qlessuiControllers', ['angularBootstrapNavTree']);

qlessuiControllers.controller('NavBarCtrl', ['$scope', '$location',
  function($scope, $location) {
        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
            //return $location.path().indexOf(viewLocation) == 0;
        };
  }
]);

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
        Queues.unpause({queueName: queueName});
        $scope.on_refresh();
    }
    $scope.on_queue_pause = function(queueName) {
        Queues.pause({queueName: queueName});
        $scope.on_refresh();
    }
  }
]);

qlessuiControllers.controller('QueuesGetCtrl', ['$scope', '$routeParams', 'Queues',
  function($scope, $routeParams, Queues) {
        $scope.queue = Queues.get({queueName: $routeParams.queueName});
        $scope.stats = Queues.stats({queueName: $routeParams.queueName});
  }
]);


qlessuiControllers.controller('JobsGetCtrl', ['$scope', '$routeParams', 'Jobs',
  function($scope, $routeParams, Jobs) {
        $scope.job = Jobs.get({jid: $routeParams.jid});
        $scope.moment = moment;
  }
]);

qlessuiControllers.controller('JobsFailedCtrl', ['$scope', 'Jobs',
  function($scope, Jobs) {
        $scope.failed = Jobs.failed({group: null});
  }
]);

qlessuiControllers.controller('JobsFailedListCtrl', ['$scope', '$routeParams', 'Jobs',
  function($scope, $routeParams, Jobs) {
        $scope.failed = Jobs.failed({group: $routeParams.group});
        $scope.group = $routeParams.group;
        $scope.moment = moment;
  }
]);