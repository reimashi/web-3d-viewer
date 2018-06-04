'use strict';

import Downloader from '../../libs/downloader/downloader';

angular.module('3dviewer.list_model', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/model/list', {
            templateUrl: 'list_model.html', // templateUrl
            controller: 'ListModelCtrl',
            activeTab: 'list_model'
        });
    }])

    .controller('ListModelCtrl', ["$scope", "$http", function($scope, $http) {
        $scope.updating = false;
        $scope.models = [];

        /**
         * Download all files associated to one model
         * @param id Id of the model
         */
        $scope.download = function(id) {
            let model = $scope.models.filter(model => model.id === id).pop();

            if (model !== null) {
                if (model.obj) { Downloader.download("/" + model.obj, model.name + ".obj"); }
                if (model.mtl) { Downloader.download("/" + model.mtl, model.name + ".mtl"); }
            }
        };

        /**
         * Delete a model
         * @param id Id of the model
         */
        $scope.delete = function(id) {
            let reqPromise = $http.delete("/model/" + id);

            reqPromise.then(function(request) {
                $scope.models = $scope.models.filter(elem => elem.id !== id);
            });

            reqPromise.catch(function(error) {
                console.error(error);
            });
        };

        /**
         * Reload the model list
         */
        let loadList = function() {
            $scope.updating = true;
            let reqPromise = $http.get("/model");

            reqPromise.then(function(request) {
                $scope.models = request.data.models;
                $scope.updating = false;
            });

            reqPromise.catch(function(error) {
                console.error(error);
                $scope.updating = false;
            });
        };

        loadList();
    }]);