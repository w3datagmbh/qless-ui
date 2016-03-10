'use strict';

/* Services */

var qlessuiServices = angular.module('qlessuiServices', ['ngResource']);
var qlessPyUi = '/api';

qlessuiServices.factory('Config', ['$resource',
  function($resource){
    return $resource(qlessPyUi + '/config', {}, {
      get: {method:'GET'}
    });
  }]);

qlessuiServices.factory('Queues', ['$resource',
  function($resource){
    return $resource(qlessPyUi + '/queues', {}, {
      counts: {method:'GET', isArray:true}
    });
  }]);

qlessuiServices.factory('Queue', ['$resource',
  function($resource){
    return $resource(qlessPyUi + '/queues/:queueName', {}, {
      get: {method:'GET'}
    });
  }]);