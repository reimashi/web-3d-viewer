'use strict';

import 'bootstrap';
import 'angular';
import 'angular-route';

import './controllers/home/controller.js';
import './controllers/list_model/controller.js';
import './controllers/view_model/controller.js';
import './controllers/add_model/controller.js';

import FileReadDirective from './directives/fileread';
import BytesFilter from './filters/bytes';

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

    .filter("bytes", BytesFilter)
    .directive("fileread", [FileReadDirective]);