'use strict';

/* Services */

var qlessuiServices = angular.module('qlessuiServices', ['ngResource']);
var qlessPyUi = '/api';

qlessuiServices.factory('Config', ['$resource',
  function($resource){
    return $resource(qlessPyUi + '/config', {}, {
      get: { method:'GET' }
    });
  }]);

qlessuiServices.factory('Groups', ['$resource',
  function($resource){
    return $resource(qlessPyUi + '/groups/:regexStr', { regexStr: null }, {
        nav: { method:'GET', isArray:true },
        get: { method:'GET', isArray:true, params: { regexStr: '.*' } }
    });
  }]);

qlessuiServices.factory('Queues', ['$resource',
  function($resource){
    return $resource(qlessPyUi + '/queues/:queueName/:action', { queueName: null, action: null }, {
        query: { method:'GET', isArray:true },
        get: { method:'GET', params: { queueName: null } },
        stats: { method:'GET', params: { queueName: null, action: 'stats' } },
        pause: { method:'GET', params: { queueName: null, action: 'pause' } },
        unpause: { method:'GET', params: { queueName: null, action: 'unpause' } }
    });
  }]);

qlessuiServices.factory('Jobs', ['$resource',
  function($resource){
    return $resource(qlessPyUi + '/jobs/:jid/:type/:group/:start/:limit/:action', { jid: null, type: null, group: null, start: null, limit: null, action: null }, {
        failed: { method:'GET', params: { type: 'failed' } },
        completed: { method:'GET', params: { type: 'completed' } },
        retry: { method:'GET', params: { action: 'retry' } },
        retry_all: { method:'GET', isArray:true, params: { type: 'failed', action: 'retry' } },
        cancel: { method:'GET', isArray:true, params: { action: 'cancel' } },
        cancel_all: { method:'GET', isArray:true, params: { type: 'failed', action: 'cancel' } },
        get: { method:'GET' }
    });
  }]);