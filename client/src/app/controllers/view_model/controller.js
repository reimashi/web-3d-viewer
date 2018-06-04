'use strict';

import Player3D from "../../libs/player/Player3D";

angular.module('3dviewer.view_model', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/model/:id', {
            templateUrl: 'view_model.html', // templateUrl
            controller: 'ViewModelCtrl',
            activeTab: 'view_model'
        });
    }])

    .controller('ViewModelCtrl', ["$scope", "$routeParams", "$http", "$timeout", function($scope, $routeParams, $http, $timeout) {
        $scope.loadingPlayer = true;

        /**
         * Load a model to the 3D player
         * @param model - Model information
         */
        let loadModelPlayer = function(model) {
            console.log("Loading model:", model);

            // Load the player in a DOM element
            let playerElem = document.getElementById("player");
            let player = new Player3D(playerElem);
            player.hide();

            // Listen event loaded to start the display
            player.events.listen("model-loaded", () => {
                $timeout (function () {
                    $scope.loadingPlayer = false;
                });
                player.show();
                player.start();
            });

            // Load the model
            player.loadObj("/" + model.obj);
        };

        /**
         * Retrieve the information of the model from server
         * @param {Number} id - Model id
         */
        let getModel = function (id) {
            let resPromise = $http.get("/model/" + id);

            resPromise.then(function(response) {
                loadModelPlayer(response.data);
            });

            resPromise.catch(function(error) {
                console.error(error);
            });
        };

        getModel($routeParams.id);
    }]);