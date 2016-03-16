'use strict';

/* Services */

var qlessuiServices = angular.module('qlessuiServices', ['ngResource']);
var qlessPyUi = '/api';

qlessuiServices.factory("ErrorHandler", function($rootScope){
    return {
        error: function(error) {
            console.error(error);
            $rootScope.$emit('api_error', error);
        }
    };
});

qlessuiServices.factory('Config', ['$resource', 'ErrorHandler',
  function($resource, ErrorHandler){
    return $resource(qlessPyUi + '/config', {}, {
      get: { method:'GET', interceptor : {responseError : ErrorHandler.error} }
    });
  }]);

qlessuiServices.factory('Groups', ['$resource', 'ErrorHandler',
  function($resource, ErrorHandler){
    return $resource(qlessPyUi + '/groups/:regexStr', { regexStr: null }, {
        nav: { method:'GET', isArray:true, interceptor : {responseError : ErrorHandler.error} },
        get: { method:'GET', isArray:true, params: { regexStr: '.*' }, interceptor : {responseError : ErrorHandler.error} }
    });
  }]);

qlessuiServices.factory('Queues', ['$resource', 'ErrorHandler',
  function($resource, ErrorHandler){
    return $resource(qlessPyUi + '/queues/:queueName/:action', { queueName: null, action: null }, {
        query: { method:'GET', isArray:true, interceptor : {responseError : ErrorHandler.error} },
        get: { method:'GET', params: { queueName: null }, interceptor : {responseError : ErrorHandler.error} },
        stats: { method:'GET', params: { queueName: null, action: 'stats' }, interceptor : {responseError : ErrorHandler.error} },
        pause: { method:'GET', params: { queueName: null, action: 'pause' }, interceptor : {responseError : ErrorHandler.error} },
        unpause: { method:'GET', params: { queueName: null, action: 'unpause' }, interceptor : {responseError : ErrorHandler.error} }
    });
  }]);

qlessuiServices.factory('Jobs', ['$resource', 'ErrorHandler',
  function($resource, ErrorHandler){
    return $resource(qlessPyUi + '/jobs/:type/:group/:start/:limit/:jid/:action', { jid: null, type: null, group: null, start: null, limit: null, action: null }, {
        tracked: { method:'GET', params: { type: 'tracked' }, interceptor : {responseError : ErrorHandler.error} },
        failed: { method:'GET', params: { type: 'failed' }, interceptor : {responseError : ErrorHandler.error} },
        completed: { method:'GET', params: { type: 'completed' }, interceptor : {responseError : ErrorHandler.error} },
        retry: { method:'GET', params: { action: 'retry' }, interceptor : {responseError : ErrorHandler.error} },
        retry_all: { method:'GET', isArray:true, params: { type: 'failed', action: 'retry' }, interceptor : {responseError : ErrorHandler.error} },
        cancel: { method:'GET', isArray:true, params: { action: 'cancel' }, interceptor : {responseError : ErrorHandler.error} },
        cancel_all: { method:'GET', isArray:true, params: { type: 'failed', action: 'cancel' }, interceptor : {responseError : ErrorHandler.error} },
        get: { method:'GET', interceptor : {responseError : ErrorHandler.error} },
        priority: { method:'POST', params: { action: 'priority' }, interceptor : {responseError : ErrorHandler.error} },
        tag: { method:'POST', isArray:true, params: { action: 'tag' }, interceptor : {responseError : ErrorHandler.error} },
        untag: { method:'POST', isArray:true, params: { action: 'untag' }, interceptor : {responseError : ErrorHandler.error} },
        track: { method:'GET', params: { action: 'track' }, interceptor : {responseError : ErrorHandler.error} },
        untrack: { method:'GET', params: { action: 'untrack' }, interceptor : {responseError : ErrorHandler.error} }
    });
  }]);