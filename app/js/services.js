'use strict';

/* Services */

var qlessuiServices = angular.module('qlessuiServices', ['ngResource']);
var qlessPyUi = '/api';

qlessuiServices.factory('Queues', ['$resource',
  function($resource){
    return $resource(qlessPyUi + '/queues', {}, {
      counts: {method:'GET', isArray:true}
    });
  }]);