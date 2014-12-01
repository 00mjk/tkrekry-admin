// 'use strict';

angular.module('tkrekryApp')
    .controller('AdvertisementDestroyCtrl', function($log, $rootScope, $scope, $routeParams, $location, $modal, Advertisement, modalSettings) {
        if ($routeParams.id) {

            var confirmDestroyModalInstance = $modal.open({
                templateUrl: 'advertisement/modals/confirm-destroy.html',
                controller: function($scope, $modalInstance, $timeout) {
                    $scope.confirmRemove = function() {
                        $modalInstance.close('yes');
                    };

                    $scope.unConfirmRemove = function() {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });

            confirmDestroyModalInstance.result.then(function(selectedItem) {
                Advertisement.remove({
                    id: $routeParams.id
                }, function() {
                    var destroyedModalInstance = $modal.open({
                        templateUrl: 'advertisement/modals/destroy.html',
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

                    destroyedModalInstance.result.then(function() {
                        $location.path('/advertisements');
                    });
                });
            }, function() {
                $location.path('/advertisements');
            });
        }
    });
