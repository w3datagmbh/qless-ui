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
            $scope.alerts.push({
                type: 'danger',
                msg: 'API request failed: ' + args.status + ' ' + args.statusText,
                description: args.data
            });
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
        $scope.states = ['running', 'waiting', 'scheduled', 'stalled', 'depends', 'recurring'];
        $scope.selected_state = 'running';

        $scope.on_select_state = function(state){
            $scope.selected_state = state;
        }
  }
]);

qlessuiControllers.controller('QueuesJobsCtrl', ['$scope', '$routeParams', 'Queues', 'Jobs',
    function($scope, $routeParams, Queues, Jobs) {
        var step = 25;
        $scope.failed = null;
        $scope.start = 0;
        $scope.limit = step;
        $scope.total = 0;
        $scope.moment = moment;

        function load() {
            Queues.jobs({queueName: $routeParams.queueName, state: $scope.state, start: $scope.start, limit: $scope.limit},
                function(data){
                    $scope.jobs = data.jobs;
                    $scope.total = data.total;
                    $scope.limit = Math.min(data.total, $scope.limit);

                    $scope.pages = [];
                    for(var i = 0; i < data.total; i += step) {
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
            if($scope.limit >= $scope.total)
                return;

            $scope.start = Math.max(0, Math.min($scope.total - 1, $scope.start + step));
            $scope.limit = Math.max(0, Math.min($scope.total, $scope.start + step));
            load();
        }
        $scope.on_select_page = function(page) {
            console.log(page);
            $scope.start = page;
            $scope.limit = Math.max(0, Math.min($scope.total, $scope.start + step));
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
    }
]);


qlessuiControllers.controller('WorkersListCtrl', ['$scope', 'Workers',
    function($scope, Workers) {
        $scope.workers = Workers.query();
    }
]);

qlessuiControllers.controller('WorkersGetCtrl', ['$scope', '$routeParams', 'Workers', 'Jobs',
    function($scope, $routeParams, Workers, Jobs) {
        $scope.workerName = $routeParams.workerName;
        $scope.worker = Workers.get({workerName: $routeParams.workerName});

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
    }
]);


qlessuiControllers.controller('JobsGetCtrl', ['$scope', '$location', '$routeParams', '$sce', 'Jobs', 'Queues',
  function($scope, $location, $routeParams, $sce, Jobs, Queues) {
        $scope.tags = [];
        $scope.trees = [];
        $scope.cancel_subtree = [];
        $scope.priority = '-';
        $scope.tracked = false;
        $scope.queues = Queues.query();
        $scope.moment = moment;
        $scope.JSON = JSON;
        var regexMD5 = new RegExp('([0-9a-f]{32})', 'g');

        function update_tree() {
            var regexJobMD5 = new RegExp('(' + $scope.job.jid + ')', 'g');
            for(var i = 0; i < $scope.trees.length; i++) {
                var tree = $scope.trees[i];
                for(var j = 0; j < $scope.cancel_subtree.length; j++) {
                    var jid = $scope.cancel_subtree[j];
                    tree = tree.replace(new RegExp('(' + jid + ')', 'g'), '<span class="bg-danger">$1</span>');
                }
                tree = tree.replace(regexJobMD5, '<strong>$1</strong>');
                tree = tree.replace(regexMD5, '<a href="#/jobs/$1">$1</a>');
                $scope.trees[i] = tree;
            }
        }
        function load_job() {
            $scope.job = Jobs.get({jid: $routeParams.jid}, function(data){
                $scope.tags = data.tags;
                $scope.priority = data.priority;
                $scope.tracked = data.tracked;

                Jobs.trees({jid: $routeParams.jid}, function(data){
                    $scope.trees = data;

                    Jobs.cancel_subtree({jid: $routeParams.jid}, function(data){
                        $scope.cancel_subtree = data;
                        update_tree();
                    });
                });
            });
        }
        load_job();

        $scope.on_change_priority = function(new_priority) {
            Jobs.priority({jid: $routeParams.jid}, new_priority, function(data){
                $scope.priority = new_priority;
                $scope.job.priority = new_priority;
            }, function(err){
                $scope.priority = $scope.job.priority;
            });
        }
        $scope.on_move_queue = function(new_queue) {
            Jobs.move({jid: $routeParams.jid}, new_queue, function(data){
                load_job();
            });
        }

        $scope.on_retry = function() {
            Jobs.retry({jid: $routeParams.jid});
            load_job();
        };
        $scope.on_cancel = function() {
            if($scope.job.dependents.length > 0){
                return alert('This job has dependents, unable to cancel.');
            }

            Jobs.cancel({jid: $routeParams.jid}, function(data){
                $location.path('/');
            });
        };
        $scope.on_cancel_subtree = function() {
            if($scope.job.dependents.length > 0){
                return alert('This job has dependents, unable to cancel.');
            }

            if (confirm('Cancel all jobs who are leading only to his leave?\n\nJobs:\n* ' + $scope.cancel_subtree.join('\n* '))) {
                Jobs.cancel_list({}, $scope.cancel_subtree, function(data){
                    $location.path('/');
                });
            }
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

        $scope.on_add_dependency = function() {
            if($scope.job.state != 'depends'){
                return alert('This job is not in \'depends\' state, unable to add dependencies.');
            }

            var jid = prompt("Please enter JID to depend on:");
            if(jid) {
                Jobs.depend({jid: $routeParams.jid}, [jid]);
                load_job();
            }
        }

        $scope.on_undepend = function(job) {
            // is dependency
            if(job.dependents.indexOf($routeParams.jid) != -1) {
                Jobs.undepend({jid: $routeParams.jid}, [job.jid]);
            }
            // is dependent
            else {
                Jobs.undepend({jid: job.jid}, [$routeParams.jid]);
            }
            load_job();
        }
        $scope.on_undepend_all = function(job) {
            if (confirm("Remove all dependencies?")) {
                Jobs.undepend({jid: $routeParams.jid}, []);
                load_job();
            }
        }
  }
]);

qlessuiControllers.controller('JobsTrackedListCtrl', ['$scope', '$routeParams', 'Jobs',
  function($scope, $routeParams, Jobs) {
        $scope.tracked = Jobs.tracked();
        $scope.moment = moment;

        $scope.on_toggle_track = function(job) {
            if(job.tracked) {
                Jobs.untrack({jid: job.jid});
            }
            else {
                Jobs.track({jid: job.jid});
            }

            job.tracked = !job.tracked;
        };
        $scope.on_retry = function(job) {
            Jobs.retry({jid: job.jid});
            load();
        };
        $scope.on_cancel = function(job) {
            if(job.dependents.length > 0){
                return alert('This job has dependents, unable to cancel.');
            }

            Jobs.cancel({jid: job.jid});
            load();
        };
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
        var step = 25;
        $scope.failed = null;
        $scope.start = 0;
        $scope.limit = step;
        $scope.total = 0;
        $scope.group = $routeParams.group;
        $scope.moment = moment;

        function load() {
            $scope.failed = Jobs.failed({group: $routeParams.group, start: $scope.start, limit: $scope.limit},
                function(data){
                    $scope.total = data.total;
                    $scope.limit = Math.min(data.total, $scope.limit);

                    $scope.pages = [];
                    for(var i = 0; i < data.total; i += step) {
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
            if($scope.limit >= $scope.total)
                return;

            $scope.start = Math.max(0, Math.min($scope.total - 1, $scope.start + step));
            $scope.limit = Math.max(0, Math.min($scope.total, $scope.start + step));
            load();
        }
        $scope.on_select_page = function(page) {
            console.log(page);
            $scope.start = page;
            $scope.limit = Math.max(0, Math.min($scope.total, $scope.start + step));
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
        $scope.on_retry = function(job) {
            Jobs.retry({jid: job.jid});
            load();
        };
        $scope.on_cancel = function(job) {
            if(job.dependents.length > 0){
                return alert('This job has dependents, unable to cancel.');
            }

            Jobs.cancel({jid: job.jid});
            load();
        };

        $scope.on_retry_all = function() {
            Jobs.retry_all({group: $routeParams.group}, function(data){
                $location.path('/jobs/failed');
            });
        };
        $scope.on_cancel_all = function() {
            if (confirm("Cancel all jobs in '" + $routeParams.group + "'?")) {
                Jobs.cancel_all({group: $routeParams.group}, function(data){
                    $location.path('/jobs/failed');
                });
            }
        };
  }
]);

qlessuiControllers.controller('JobsCompletedListCtrl', ['$scope', '$routeParams', 'Jobs',
  function($scope, $routeParams, Jobs) {
        var step = 25;
        $scope.completed = null;
        $scope.start = 0;
        $scope.limit = step;
        $scope.total = 0;
        $scope.moment = moment;

        function load() {
            $scope.completed = Jobs.completed({start: $scope.start, limit: $scope.limit},
                function(data){
                    $scope.total = data.total;
                    $scope.limit = Math.min(data.total, $scope.limit);

                    $scope.pages = [];
                    for(var i = 0; i < data.total; i += step) {
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
            if($scope.limit >= $scope.total)
                return;

            $scope.start = Math.max(0, Math.min($scope.total - 1, $scope.start + step));
            $scope.limit = Math.max(0, Math.min($scope.total, $scope.start + step));
            load();
        }
        $scope.on_select_page = function(page) {
            console.log(page);
            $scope.start = page;
            $scope.limit = Math.max(0, Math.min($scope.total, $scope.start + step));
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
        $scope.on_retry = function(job) {
            Jobs.retry({jid: job.jid});
            load();
        };
        $scope.on_cancel = function(job) {
            if(job.dependents.length > 0){
                return alert('This job has dependents, unable to cancel.');
            }

            Jobs.cancel({jid: job.jid});
            load();
        };
  }
]);