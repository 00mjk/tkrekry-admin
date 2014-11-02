// 'use strict';

angular.module( 'tkrekryApp' )
  .directive( 'pickAdate', function ( $parse, $window ) {
    return {
      restrict: 'A',
      link: function ( scope, element, attrs ) {
        var ngModel = $parse( attrs.ngModel );
        element.pickadate( {
          format: 'dd.mm.yyyy',
          onSet: function ( e ) {
            ngModel.assign( scope, this.get() );
          }
        } );
      }
    };

  } )
  .directive( 'pickAtime', function ( $parse ) {
      return {
        restrict: 'A',
        link: function ( scope, element, attrs ) {
          var ngModel = $parse( attrs.ngModel ),
              isBadIE = (document.all && document.querySelector && !document.addEventListener);

            if ( !isBadIE ) {
              element.pickatime( {
                clear: 'tyhjennä',
                format: 'H:i',
                onSet: function ( e ) {
                  ngModel.assign( scope, this.get() );
                }
              } );
            }
          }
        };

      } );
