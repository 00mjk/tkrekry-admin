// 'use strict';

angular.module('tkrekryApp')
    .controller('AdvertisementPublishCtrl', function($log, $rootScope, $scope, $routeParams, $location, $modal, Advertisement, modalSettings) {
        if ($routeParams.id) {
            Advertisement.publish({
                id: $routeParams.id
            }, function(loadedAdvertisement) {
                $modal.open({
                    templateUrl: 'advertisement/modals/published.html',
                    controller: function($scope, $modalInstance, $timeout) {
                        var promise = $timeout(function() {
                            $modalInstance.close('close');
                        }, modalSettings.timeout);

                        $scope.ok = function() {
                            $timeout.cancel(promise);
                            $modalInstance.close('close');
                        }
                    }
                });
                $location.path('/advertisements');
            });
        }
    });
