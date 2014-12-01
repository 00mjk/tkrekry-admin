// 'use strict';

angular.module('tkrekryApp')
    .directive('multiSelect', function($q) {
        return {
            restrict: 'AE',
            require: 'ngModel',
            scope: {
                disabled: "@",
                selectedLabel: "@",
                availableLabel: "@",
                displayAttr: "@",
                available: "=",
                model: "=ngModel"
            },
            template: ['<div class="multiSelect row">',
              '<div class="select col-md-5">',
              '<label class="control-label" for="multiSelectSelected">{{ selectedLabel }}',
              '({{ model.length }})</label>',
              '<select id="currentRoles" ng-model="selected.current" multiple ',
              'class="" ng-options="e as e[displayAttr] for e in model" ng-disabled="{{disabled}}">',
              '</select>',
              '</div>',
              '<div class="select buttons col-md-2">',
              '<button class="btn btn-default btn-sm btn-block mover left" ng-click="add()" title="Lisää valittu" ',
              'ng-disabled="selected.available.length == 0" >',
              '<span class="glyphicon glyphicon-arrow-left"></span>',
              'Lisää',
              '</button>',
              '<button class="btn btn-default btn-sm btn-block mover right" ng-click="remove()" title="Poista valittu" ',
              'ng-disabled="selected.current.length == 0">',
              'Poista',
              '<span class="glyphicon glyphicon-arrow-right"></span>',
              '</button>',
              '</div>',
              '<div class="select col-md-5">',
              '<label class="control-label" for="multiSelectAvailable">{{ availableLabel }} ',
              '({{ available.length }})</label>',
              '<select id="multiSelectAvailable" ng-model="selected.available" multiple ',
              'ng-options="e as e[displayAttr] for e in available" ng-disabled="{{disabled}}"></select>',
              '</div>',
              '</div>'].join(''),
            link: function(scope, elm, attrs) {
                scope.selected = {
                    available: [],
                    current: []
                };

                /* Handles cases where scope data hasn't been initialized yet */
                var dataLoading = function(scopeAttr) {
                    var loading = $q.defer();

                    if (scope[scopeAttr]) {
                        loading.resolve(scope[scopeAttr]);
                    } else {
                        scope.$watch(scopeAttr, function(newValue, oldValue) {
                            if (newValue !== undefined) {
                                loading.resolve(newValue);
                            }
                        });
                    }
                    return loading.promise;
                };

                /* Filters out items in original that are also in toFilter. Compares by reference. */
                var filterOut = function(original, toFilter) {
                    var filtered = [];
                    angular.forEach(original, function(entity) {
                        var match = false;

                        for (var i = 0; i < toFilter.length; i++) {
                            if (toFilter[i][attrs.displayAttr] == entity[attrs.displayAttr]) {
                                match = true;
                                break;
                            }
                        }
                        if (!match) {
                            filtered.push(entity);
                        }
                    });
                    return filtered;
                };

                scope.refreshAvailable = function() {
                    scope.available = filterOut(scope.available, scope.model);
                    scope.selected.available = [];
                    scope.selected.current = [];
                };

                scope.add = function() {
                    scope.model = scope.model.concat(scope.selected.available);
                    scope.refreshAvailable();
                };
                scope.remove = function() {
                    scope.available = scope.available.concat(scope.selected.current);
                    scope.model = filterOut(scope.model, scope.selected.current);
                    scope.refreshAvailable();
                };

                $q.all([dataLoading("model"), dataLoading("available")]).then(function(results) {
                    scope.refreshAvailable();
                });
            }
        };
    });
