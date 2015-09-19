angular.module('tkrekryApp')
    .controller('AdvertisementPreviewController', function($log, $rootScope, $scope, $routeParams, $location, $modal, Advertisement) {
        'use strict';

        if ($routeParams.id) {
            Advertisement.publish({
                id: $routeParams.id
            }, function(loadedAdvertisement) {
                $scope.advertisement = loadedAdvertisement;

                var modalInstance = $modal.open({
                    templateUrl: 'advertisement/modals/preview.html',
                    controller: function($scope, $modalInstance, advertisement) {
                        $scope.advertisement = advertisement;

                        $scope.ok = function() {
                            $modalInstance.close($scope.advertisement);
                        };

                        $scope.cancel = function() {
                            $modalInstance.dismiss('cancel');
                        };
                    },
                    resolve: {
                        advertisement: function() {
                            return $scope.advertisement;
                        }
                    }
                });
                $location.path('/advertisements');
            });
        }
    });
