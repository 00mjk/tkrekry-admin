// 'use strict';

angular.module('tkrekryApp')
    .directive('ngScrollAndFocus', function($timeout, $log) {
        return {
            restrict: 'A',
            link: function(scope, elem, attr) {

                scope.$on('focusOn', function(e, name) {
                    // The timeout lets the digest / DOM cycle run before attempting to set focus
                    $timeout(function() {
                        if (name === attr.ngFocusId) {
                            if (attr.ngFocusMethod === "click")  {
                                window.scrollTo(0, elem[0].offsetTop - 100);
                                angular.element(elem[0]).click();
                            } else {
                                window.scrollTo(0, elem[0].offsetTop - 100);
                                angular.element(elem[0]).focus();
                            }
                        }
                    });
                });
            }
        };
    });
