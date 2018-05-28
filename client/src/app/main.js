'use strict';

import 'bootstrap';
import 'angular';
import 'angular-route';

import './home/controller.js';
import './list_model/controller.js';
import './view_model/controller.js';
import './add_model/controller.js';

// Declare app level module which depends on views, and components
angular.module('3dviewer', [
    'ngRoute',
    '3dviewer.home',
    '3dviewer.list_model',
    '3dviewer.add_model',
    '3dviewer.view_model',
])
    .config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
        $locationProvider.hashPrefix('!');

        $routeProvider.otherwise({redirectTo: '/'});
    }])

    .controller('MenuCtrl', ["$scope", "$route", function($scope, $route) {
        $scope.$route = $route;
    }])

    .filter('elapsed', function(){
        return function(date){
            if (!date) return;
            let time = Date.parse(date),
                timeNow = new Date().getTime(),
                difference = timeNow - time,
                seconds = Math.floor(difference / 1000),
                minutes = Math.floor(seconds / 60),
                hours = Math.floor(minutes / 60),
                days = Math.floor(hours / 24),
                years = Math.floor(days / 365);
            if (years > 1) return "Hace " + years + " años";
            else if (years === 1) return "Hace un año";
            else if (days > 1) {
                return "Hace " + days + " días";
            } else if (days === 1) {
                return "Ayer"
            } else if (hours > 1) {
                return "Hace " + hours + " horas";
            } else if (hours === 1) {
                return "Hace una hora";
            } else if (minutes > 1) {
                return "Hace " + minutes + " minutos";
            } else if (minutes === 1){
                return "Hace un minuto";
            } else {
                return "Hace unos segundos";
            }
        }
    });