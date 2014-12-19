'use strict';

////////////////////////////////
// GHETTO hardcoded JS

// hide toolbar
window.scrollTo(0, 1);

// This'll stop you being able to scroll your page at all, so you won't be able to see the 'grey area' at the top.
document.ontouchmove = function(event){
  event.preventDefault();
};

////////////////////////////////

angular.module('isihlononoApp', [
  'ngAnimate',
  'ngCookies',
  'ngResource',
  'ngRoute',
  'ngSanitize',
  'ngTouch',
  'ui.router'
])

.config(['$stateProvider', '$urlRouterProvider',
function ($stateProvider, $urlRouterProvider) {

  // basic routing
  $urlRouterProvider
  .when('', '/')
  .otherwise('/404')
  .rule(function($injector, $location) {
    // FIX for trailing slashes. Gracefully "borrowed" from https://github.com/angular-ui/ui-router/issues/50
    var path = $location.path();
    if (path !== '/' && path.slice(-1) === '/') {
      $location.replace().path(path.slice(0, -1));
    }
  });

  // Now set up the states
  $stateProvider
  .state('app', {
    abstrct: true,
    templateUrl: 'views/app.html'
  })
  .state('app.404', {
    url: '/404',
    templateUrl: 'views/404.html'
  })
  .state('app.home', {
    url: '/',
    templateUrl: 'views/home.html',
    controller: 'HomeCtrl'
  })
  .state('app.noise', {
    url: '/noise',
    templateUrl: 'views/noise.html',
    controller: 'NoiseCtrl'
  });

}])

.run(['$rootScope', '$state', '$stateParams',
function($rootScope, $state, $stateParams) {

  /**
  * Add references to $state and $stateParams to the $rootScope
  * Example: <li ng-class="{ active: $state.includes('contacts.list') }">
  *   will set the <li> to active whenever 'contacts.list' or one of its decendents is active.
  */
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;

}])

.controller('BodyController', ['$rootScope',
function ($rootScope) {
  $rootScope.online = false;
}])

;
