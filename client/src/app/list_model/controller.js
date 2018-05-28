'use strict';

angular.module('3dviewer.list_model', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/model/list', {
            templateUrl: 'list_model.html', // templateUrl
            controller: 'ListModelCtrl',
            activeTab: 'list_model'
        });
    }])

    .controller('ListModelCtrl', ["$scope", function($scope) {
        $scope.models = [];
        console.log("list_model")
    }]);