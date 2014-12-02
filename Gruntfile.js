// Generated on 2014-03-18 using generator-angular-fullstack 1.3.2
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function ( grunt ) {

  // Load grunt tasks automatically
  require( 'load-grunt-tasks' )( grunt );

  grunt.renameTask('cdnify', 'cdnifyGoogle');
  grunt.loadNpmTasks('grunt-google-cdn');
  grunt.renameTask('cdnify', 'cdnifyCdnjs');
  grunt.loadNpmTasks('grunt-google-cdn');
  grunt.renameTask('cdnify', 'cdnifyJsdelivr');

  // Time how long tasks take. Can help when optimizing build times
  require( 'time-grunt' )( grunt );

  // Define the configuration for all the tasks
  grunt.initConfig( {
    // Project settings
    yeoman: {
      // configurable paths
      app: require( './bower.json' ).appPath || 'app',
      dist: 'dist'
    },
    bower: {
      install: {
        options:{
          targetDir: '<%= yeoman.app %>/bower_components',
          install: true,
          verbose: true,
          cleanTargetDir: false,
          cleanBowerDir: false,
          copy: true,
          bowerOptions: {}
        }
      }
    },
    shell: {
      options: {
        stdout: true
      },
      selenium: {
        command: './selenium/start',
        options: {
          stdout: false,
          async: true
        }
      },
      protractor_install: {
        command: 'node ./node_modules/protractor/bin/webdriver-manager update'
      },
      npm_install: {
        command: 'npm install'
      }
    },
    express: {
      options: {
        port: process.env.PORT || 9000,
        env: process.env.ENV || 'test'
      },
      test: {
        options: {
          script: 'server.js',
          debug: true,
          env: 'test',
          port: 9999
        }
      },
      dev: {
        options: {
          script: 'server.js',
          debug: true
        }
      },
      prod: {
        options: {
          script: 'dist/server.js',
          node_env: 'production'
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:<%= express.options.port %>'
      }
    },
    watch: {
      js: {
        files: [ '<%= yeoman.app %>/scripts/{,*/}*.js' ],
        tasks: [ 'jshint:all' ],
        options: {
          livereload: false
        }
      },
      mochaTest: {
        files: [ 'test/server/{,*/}*.js' ],
        tasks: [ 'mochaTest' ]
      },
      jsTest: {
        files: [ 'test/client/spec/{,*/}*.js' ],
        tasks: [ 'jshint:test' ]
      },
      styles: {
        files: [ '<%= yeoman.app %>/styles/{,*/}*.css' ],
        tasks: [ 'copy:styles', 'autoprefixer' ]
      },
      gruntfile: {
        files: [ 'Gruntfile.js' ]
      },
      livereload: {
        files: [
          '<%= yeoman.app %>/views/{,*//*}*.{html,jade}',
          '{.tmp,<%= yeoman.app %>}/styles/{,*//*}*.css',
          '{.tmp,<%= yeoman.app %>}/scripts/{,*//*}*.js',
          '<%= yeoman.app %>/images/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}',
        ],

        options: {
          livereload: false
        }
      },
      express: {
        files: [
          'server.js',
          'lib/**/*.{js,json}'
        ],
        tasks: [ 'jshint:server', 'express:dev', 'wait' ],
        options: {
          livereload: false,
          nospawn: true //Without this option specified express won't be reloaded
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require( 'jshint-stylish' )
      },
      server: {
        options: {
          jshintrc: 'lib/.jshintrc'
        },
        src: [ 'lib/{,*/}*.js' ]
      },
      all: [
        '<%= yeoman.app %>/scripts/{,*/}*.js',
        '!<%= yeoman.app %>/scripts/modules/*.js',
      ],
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: [ 'test/{,*/}*.js' ]
      }
    },

    ngtemplates:  {
      app:        {
        src:      '<%= yeoman.app %>/views/{advertisement,employer,organisation,partials,settings,template,user}/**/*.html',
        dest:     '<%= yeoman.app %>/scripts/templates/all.js',
        options:    {
          module:   'tkrekryApp',
          url: function(url) {
            return url.replace(/app\/views\//g, '');
          },
          htmlmin:  {
            collapseWhitespace: true,
            collapseBooleanAttributes: true
          }
        }
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [ {
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*',
            '!<%= yeoman.dist %>/Procfile'
          ]
        } ]
      },
      heroku: {
        files: [ {
          dot: true,
          src: [
            'heroku/*',
            '!heroku/.git*',
            '!heroku/Procfile'
          ]
        } ]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: [ 'last 1 version' ]
      },
      dist: {
        files: [ {
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        } ]
      }
    },

    // Debugging with node inspector
    'node-inspector': {
      custom: {
        options: {
          'web-host': 'localhost'
        }
      }
    },

    // Use nodemon to run server in debug mode with an initial breakpoint
    nodemon: {
      debug: {
        script: 'server.js',
        options: {
          nodeArgs: [ '--debug-brk' ],
          env: {
            PORT: process.env.PORT || 9000
          },
          callback: function ( nodemon ) {
            nodemon.on( 'log', function ( event ) {
              console.log( event.colour );
            } );

            // opens browser on initial server start
            nodemon.on( 'config:update', function () {
              setTimeout( function () {
                require( 'open' )( 'http://localhost:8080/debug?port=5858' );
              }, 500 );
            } );
          }
        }
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/public/scripts/*.js',
            '<%= yeoman.dist %>/public/styles/{,*/}*.css',
            '<%= yeoman.dist %>/public/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/public/styles/fonts/*'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: [ '<%= yeoman.app %>/views/{,*/}*.html'
      ],
      options: {
        dest: '<%= yeoman.dist %>/public'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: [ '<%= yeoman.dist %>/views/{,*/}*.html'
      ],
      css: [ '<%= yeoman.dist %>/public/styles/{,*/}*.css' ],
      options: {
        assetsDirs: [ '<%= yeoman.dist %>/public' ]
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [ {
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/public/images'
        } ]
      }
    },

    svgmin: {
      dist: {
        files: [ {
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/public/images'
        } ]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: false,
          collapseBooleanAttributes: false,
          removeCommentsFromCDATA: false,
          removeOptionalTags: false
        },
        files: [ {
          expand: true,
          cwd: '<%= yeoman.app %>/views',
          src: [ '*.html', '**/*.html' ],
          dest: '<%= yeoman.dist %>/views'
        } ]
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngmin: {
      dist: {
        files: [ {
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        } ]
      }
    },

    // Replace Google CDN references
    cdnifyJsdelivr: {
      options: {
        cdn: require('jsdelivr-cdn-data')
      },
      dist: {
        html: [ '<%= yeoman.dist %>/views/index.html' ]
      }
    },

    cdnifyGoogle: {
      options: {
        cdn: require('google-cdn-data')
      },
      dist: {
        html: [ '<%= yeoman.dist %>/views/index.html' ]
      }
    },

    cdnifyCdnjs: {
      options: {
        cdn: require('cdnjs-cdn-data')
      },
      dist: {
        html: [ '<%= yeoman.dist %>/views/index.html' ]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [ {
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>/public',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'bower_components/**/*',
            'images/{,*/}*.{webp}',
            'fonts/**/*',
            'scripts/modules/respond.proxy.js'
          ]
        }, {
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>/views',
          dest: '<%= yeoman.dist %>/views',
          src: [ '**/*.jade' ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/public/images',
          src: [ 'generated/*' ]
        }, {
          expand: true,
          dest: '<%= yeoman.dist %>',
          src: [
            'package.json',
            'server.js',
            'newrelic.js',
            'test/support/**/*',
            'lib/**/*'
          ]
        } ]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'copy:styles'
      ],
      test: [
        'copy:styles'
      ],
      debug: {
        tasks: [
          'nodemon',
          'node-inspector'
        ],
        options: {
          logConcurrentOutput: true
        }
      },
      dist: [
        'copy:styles',
        'imagemin',
        'svgmin',
        'htmlmin'
      ]
    },
    uglify: {
      options: {
        mangle: false,
        beautify: true
      }
    },
    mochaTest: {
      options: {
        reporter: 'spec'
      },
      src: [ 'test/server/**/*.js' ]
    },
    protractor: {
      options: {
        keepAlive: true,
        configFile: "./test/e2e/protractor.conf.js"
      },
      singlerun: {},
      auto: {
        keepAlive: true,
        options: {
          args: {
            seleniumPort: 4444
          }
        }
      }
    },
    env: {
      test: {
        NODE_ENV: 'test'
      }
    }
  } );

  // Used for delaying livereload until after server has restarted
  grunt.registerTask( 'wait', function () {
    grunt.log.ok( 'Waiting for server reload...' );

    var done = this.async();

    setTimeout( function () {
      grunt.log.writeln( 'Done waiting!' );
      done();
    }, 500 );
  } );

  grunt.registerTask( 'express-keepalive', 'Keep grunt running', function () {
    this.async();
  } );

  grunt.registerTask( 'serve', function ( target ) {
    if ( target === 'dist' ) {
      return grunt.task.run( [ 'build', 'express:prod', 'express-keepalive' ] );
    }

    if ( target === 'debug' ) {
      return grunt.task.run( [
        'clean:server',

        'concurrent:server',
        'autoprefixer',
        'concurrent:debug'
      ] );
    }

    grunt.task.run( [
      'clean:server',
      'ngtemplates',
      'bower:install',
      'concurrent:server',
      'autoprefixer',
      'express:dev',
      'watch'
    ] );
  } );

  grunt.registerTask( 'server', function () {
    grunt.log.warn( 'The `server` task has been deprecated. Use `grunt serve` to start a server.' );
    grunt.task.run( [ 'serve' ] );
  } );

  grunt.registerTask( 'test', function ( target ) {
    if ( target === 'server' ) {
      return grunt.task.run( [
        'env:test',
        'jshint:server',
        'mochaTest'
      ] );
    }

    if ( target === 'client' ) {
      return grunt.task.run( [
        'env:test',
        'jshint',
        'clean:server',
        'ngtemplates',
        'concurrent:test',
        'autoprefixer',
        'express:test',
        'protractor:singlerun'
      ] );
    }

    grunt.task.run( [
      'env:test',
      'jshint',
      'mochaTest',
      'clean:server',
      'concurrent:test',
      'autoprefixer',
    ] );
  } );

  grunt.registerTask( 'build', [
    'clean:dist',
    'bower:install',
    'ngtemplates',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'ngmin',
    'copy:dist',
    'cssmin',
    'uglify',
    'rev',
    'cdnifyGoogle',
    'cdnifyJsdelivr',
    'cdnifyCdnjs',
    'usemin'
  ] );

  grunt.registerTask( 'default', [
    'jshint',
    'ngtemplates',
    'test',
    'build'
  ] );

  grunt.registerTask('heroku:development', 'build');
  grunt.registerTask('heroku:production', 'build');
};
