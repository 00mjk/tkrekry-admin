// 'use strict';

angular.module('tkrekryApp')
    .controller('AdvertisementCopyCtrl', function($log, $rootScope, $scope, $routeParams, $location, $modal, Advertisement, modalSettings) {
        if ($routeParams.id) {
            Advertisement.show({
                id: $routeParams.id
            }, function(loadedAdvertisement) {

                delete loadedAdvertisement._id;
                delete loadedAdvertisement.__v;

                loadedAdvertisement.published_at = null;
                loadedAdvertisement.publication_day = null;
                loadedAdvertisement.published = false;

                var advertisement = new Advertisement(loadedAdvertisement);

                advertisement.$save(function(savedAdvertisement) {
                    $modal.open({
                        templateUrl: 'advertisement/modals/copied.html',
                        controller: function($scope, $modalInstance, $timeout) {
                            var promise = $timeout(function() {
                                $modalInstance.close();
                            }, modalSettings.timeout);

                            $scope.ok = function() {
                                $timeout.cancel(promise);
                                $modalInstance.close('close');
                            };
                        }
                    });
                    $location.path('/' + ['advertisements', 'edit', savedAdvertisement._id].join('/'));
                });
            });
        }
    });
