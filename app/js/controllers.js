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


qlessuiControllers.controller('JobsGetCtrl', ['$scope', '$location', '$routeParams', 'Jobs',
  function($scope, $location, $routeParams, Jobs) {
        $scope.job = Jobs.get({jid: $routeParams.jid});
        $scope.moment = moment;

        $scope.on_retry = function() {
            Jobs.retry({jid: $routeParams.jid});
        };
        $scope.on_cancel = function() {
            Jobs.cancel({jid: $routeParams.jid});
            $location.path('/');
        };
  }
]);

qlessuiControllers.controller('JobsFailedCtrl', ['$scope', 'Jobs',
  function($scope, Jobs) {
        $scope.on_refresh = function() {
            $scope.failed = Jobs.failed({group: null});
        };

        $scope.on_retry_all = function(group) {
            Jobs.retry_all({group: group});
            $scope.on_refresh();
        };
        $scope.on_cancel_all = function(group) {
            if (confirm("Cancel all jobs in '" + group + "'?")) {
                Jobs.cancel_all({group: group});
                $scope.on_refresh();
            }
        };

        $scope.on_refresh();
  }
]);

qlessuiControllers.controller('JobsFailedListCtrl', ['$scope', '$location', '$routeParams', 'Jobs',
  function($scope, $location, $routeParams, Jobs) {
        var step = 25, total = 0;
        $scope.failed = null;
        $scope.start = 0;
        $scope.limit = step;
        $scope.group = $routeParams.group;
        $scope.moment = moment;

        function load() {
            $scope.failed = Jobs.failed({group: $routeParams.group, start: $scope.start, limit: $scope.limit});
            $scope.failed.$promise.then(function(data){
                total = data.total;
                $scope.limit = Math.min(total, $scope.limit);

                $scope.pages = [];
                for(var i = 0; i < total; i += step) {
                    $scope.pages.push(i);
                }
            });
        }
        load();

        $scope.on_previous = function() {
            if($scope.start == 0)
                return;

            $scope.start = Math.max(0, $scope.start - step);
            $scope.limit = Math.max(step, $scope.start + step);
            load();
        }
        $scope.on_next = function() {
            if($scope.limit >= total)
                return;

            $scope.start = Math.max(0, Math.min(total - 1, $scope.start + step));
            $scope.limit = Math.max(0, Math.min(total, $scope.start + step));
            load();
        }
        $scope.on_select_page = function(page) {
            console.log(page);
            $scope.start = page;
            $scope.limit = Math.max(0, Math.min(total, $scope.start + step));
            load();
        }

        $scope.on_retry = function(jid) {
            Jobs.retry({jid: jid});
            load();
        };
        $scope.on_cancel = function(jid) {
            Jobs.cancel({jid: jid});
            load();
        };

        $scope.on_retry_all = function() {
            Jobs.retry_all({group: $routeParams.group});
            $location.path('/jobs/failed');
        };
        $scope.on_cancel_all = function() {
            if (confirm("Cancel all jobs in '" + $routeParams.group + "'?")) {
                Jobs.cancel_all({group: $routeParams.group});
                $location.path('/jobs/failed');
            }
        };
  }
]);