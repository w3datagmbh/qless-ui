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

qlessuiControllers.controller('AlertCtrl', ['$scope', '$rootScope',
    function($scope, $rootScope) {
        $scope.alerts = [];

        $rootScope.$on('success' , function(event, args) {
            $scope.alerts.push({type: 'success', msg: args});
        });
        $rootScope.$on('info' , function(event, args) {
            $scope.alerts.push({type: 'info', msg: args});
        });
        $rootScope.$on('warning' , function(event, args) {
            $scope.alerts.push({type: 'warning', msg: args});
        });
        $rootScope.$on('error' , function(event, args) {
            $scope.alerts.push({type: 'danger', msg: args});
        });
        $rootScope.$on('api_error' , function(event, args) {
            $scope.alerts.push({type: 'danger', msg: 'API request failed: ' + args.status + ' ' + args.statusText});
        });

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
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
        $scope.tags = [];
        $scope.tracked = false;
        $scope.moment = moment;

        $scope.job = Jobs.get({jid: $routeParams.jid}, function(data){
            $scope.tags = data.tags;
            $scope.tracked = data.tracked;
        });

        $scope.on_retry = function() {
            Jobs.retry({jid: $routeParams.jid});
        };
        $scope.on_cancel = function() {
            Jobs.cancel({jid: $routeParams.jid});
            $location.path('/');
        };

        function update_tags(data) {
            $scope.tags = data;
        }
        $scope.on_add_tag = function() {
            var tag = prompt('Enter new tag:');
            if(tag && $scope.tags.indexOf(tag) == -1) {
                $scope.tags.push(tag);
                Jobs.tag({jid: $routeParams.jid}, tag, update_tags);
            }
        }
        $scope.on_remove_tag = function(tag) {
            var tagIndex = $scope.tags.indexOf(tag);
            if(tagIndex >= 0){
                $scope.job.tags.splice(tagIndex, 1);
                Jobs.untag({jid: $routeParams.jid}, tag, update_tags);
            }
        }

        function toggle_track(){
            $scope.tracked = !$scope.tracked;
        }
        $scope.on_toggle_track = function() {
            if($scope.tracked) {
                Jobs.untrack({jid: $routeParams.jid}, toggle_track);
            }
            else {
                Jobs.track({jid: $routeParams.jid}, toggle_track);
            }
        }
  }
]);

qlessuiControllers.controller('JobsFailedCtrl', ['$scope', 'Jobs',
  function($scope, Jobs) {
        $scope.on_refresh = function() {
            Jobs.failed({group: null}, function(data){
                $scope.failed = Object.keys(data).length > 2 ? data : null;
            }, function(err) {
                $scope.failed = null;
            });
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
            $scope.failed = Jobs.failed({group: $routeParams.group, start: $scope.start, limit: $scope.limit},
                function(data){
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

        $scope.on_toggle_track = function(job) {
            if(job.tracked) {
                Jobs.untrack({jid: job.jid});
            }
            else {
                Jobs.track({jid: job.jid});
            }

            job.tracked = !job.tracked;
        };
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