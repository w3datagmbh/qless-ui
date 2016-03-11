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
    return $resource(qlessPyUi + '/queues/:queueName', { queueName: null }, {
        query: { method:'GET', isArray:true },
        get: { method:'GET', params: { queueName: '' } }
    });
  }]);