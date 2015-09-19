angular.module('tkrekryApp')
    .controller('AdvertisementUnpublishController', function($log, $rootScope, $scope, $routeParams, $location, $modal, Advertisement, modalSettings) {
        'use strict';

        if ($routeParams.id) {
            Advertisement.unpublish({
                id: $routeParams.id
            }, function(loadedAdvertisement) {
                $modal.open({
                    templateUrl: 'advertisement/modals/unpublished.html',
                    controller: function($scope, $modalInstance, $timeout) {
                        var promise = $timeout(function() {
                            $modalInstance.close('close');
                        }, modalSettings.timeout);

                        $scope.ok = function() {
                            $timeout.cancel(promise);
                            $modalInstance.close('close');
                        };
                    }
                });
                $location.path('/advertisements');
            });
        }
    });
