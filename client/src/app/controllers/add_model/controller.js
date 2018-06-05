'use strict';

angular.module('3dviewer.add_model', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/model/add', {
            templateUrl: 'add_model.html', // templateUrl
            controller: 'AddModelCtrl',
            activeTab: 'add_model'
        });
    }])

    .controller('AddModelCtrl', ["$scope", "$http", function($scope, $http) {
        $scope.addForm = { name: "", obj: null, mtl: null };
        $scope.uploading = false;

        /**
         * Upload the models to the server
         * @param formData
         */
        $scope.upload = function(formData) {
            $scope.uploading = true;

            let requestPromise = $http.post("/model", formData);

            requestPromise.then(function(response){
                $scope.addForm = { name: "", obj: "", mtl: "" };
                $scope.uploading = false;
                document.location.href = "#!/model/list";
            });

            requestPromise.catch(function(error) {
                $scope.uploading = false;
                console.error(error);
            });
        }
    }]);