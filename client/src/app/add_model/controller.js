'use strict';

angular.module('3dviewer.add_model', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/model/add', {
            templateUrl: 'add_model.html', // templateUrl
            controller: 'AddModelCtrl',
            activeTab: 'add_model'
        });
    }])

    .controller('AddModelCtrl', ["$scope", function($scope) {
        $scope.models = [];
        console.log("add_model")
    }]);