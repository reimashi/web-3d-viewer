'use strict';

angular.module('3dviewer.home', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'home.html', // templateUrl
            controller: 'HomeCtrl',
            activeTab: 'home'
        });
    }])

    .controller('HomeCtrl', ["$scope", function($scope) {
    }]);