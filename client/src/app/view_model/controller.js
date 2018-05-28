'use strict';

angular.module('3dviewer.view_model', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/model/view', {
            templateUrl: 'view_model.html', // templateUrl
            controller: 'ViewModelCtrl',
            activeTab: 'view_model'
        });
    }])

    .controller('ViewModelCtrl', ["$scope", function($scope) {
        $scope.models = [];
        console.log("view_model")
    }]);