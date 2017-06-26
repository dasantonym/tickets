module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            cordova: {
                files: {
                    'dist/cordova/css/main.css': [
                        'src/shared/less/main.less',
                        'src/cordova/less/main.less'
                    ]
                },
                options: {
                    compress: true,
                    sourceMap: false
                }
            },
            webkit: {
                files: {
                    'dist/webkit/approot/css/main.css': [
                        'src/shared/less/main.less',
                        'src/webkit/less/main.less'
                    ]
                },
                options: {
                    compress: true,
                    sourceMap: false
                }
            }
        },
        jade: {
            cordova_shared: {
                expand: true,
                cwd: 'src/shared/jade/',
                src: ['**/*.jade'],
                dest: 'dist/cordova/',
                ext: '.html'
            },
            cordova_main: {
                expand: true,
                cwd: 'src/cordova/jade/',
                src: ['**/*.jade'],
                dest: 'dist/cordova/',
                ext: '.html'
            },
            webkit_shared: {
                expand: true,
                cwd: 'src/shared/jade/',
                src: ['**/*.jade'],
                dest: 'dist/webkit/approot/',
                ext: '.html'
            },
            webkit_main: {
                expand: true,
                cwd: 'src/webkit/jade/',
                src: ['**/*.jade'],
                dest: 'dist/webkit/approot/',
                ext: '.html'
            }
        },
        uglify: {
            cordova: {
                options: {
                    compress: {
                        drop_console: false
                    },
                    banner: '/*! <%= pkg.name %> cordova - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n\n'
                },
                files: {
                    'dist/cordova/js/tickets.min.js': [
                        'src/shared/js/**/*.js',
                        'src/cordova/js/**/*.js'
                    ]
                }
            },
            webkit: {
                options: {
                    compress: {
                        drop_console: false
                    },
                    banner: '/*! <%= pkg.name %> webkit - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n\n'
                },
                files: {
                    'dist/webkit/approot/js/tickets.min.js': [
                        'src/shared/js/**/*.js',
                        'src/webkit/js/**/*.js'
                    ]
                }
            }
        },
        concat: {
            options: {
                separator: '\n\n',
                stripBanners: { block: true },
                nonull: true,
                banner: '/*! <%= pkg.name %> dependencies - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n\n'
            },
            cordova: {
                src: [
                    'bower_components/angular/angular.min.js',
                    'bower_components/angular-bootstrap/ui-bootstrap.min.js',
                    'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
                    'bower_components/angular-route/angular-route.min.js',
                    'bower_components/angular-animate/angular-animate.min.js',
                    'bower_components/angular-busy/dist/angular-busy.min.js',
                    'bower_components/angular-PubSub/dist/angular-pubsub.min.js',
                    'bower_components/async/dist/async.min.js'
                ],
                dest: 'dist/cordova/js/tickets-deps.min.js'
            },
            webkit: {
                src: [
                    'bower_components/angular/angular.min.js',
                    'bower_components/angular-bootstrap/ui-bootstrap.min.js',
                    'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
                    'bower_components/angular-route/angular-route.min.js',
                    'bower_components/angular-animate/angular-animate.min.js',
                    'bower_components/angular-PubSub/dist/angular-pubsub.min.js'
                ],
                dest: 'dist/webkit/approot/js/tickets-deps.min.js'
            }
        },
        phonegap: {
            config: {
                root: 'dist/cordova',
                cli: 'cordova',
                cleanBeforeBuild: true,
                plugins: ['phonegap-plugin-barcodescanner'],
                platforms: ['ios'],
                permissions: ['CAMERA','FLASHLIGHT','INTERNET'],
                verbose: true,
                debuggable: true,
                minSdkVersion: function () {
                    return(10)
                },
                targetSdkVersion: function () {
                    return(19)
                },
                config: {
                    template: '_config.xml',
                    data: {
                        id: 'de.htmhell.ticketscanner',
                        version: '<%= pkg.version %>',
                        name: '<%= pkg.name %>',
                        description: '<%= pkg.description %>',
                        author: {
                            email: 'antonymousfeedback@gmail.com',
                            href: '',
                            text: 'Anton'
                        }
                    }
                },
                key: {
                    store: 'tickets.keystore',
                    alias: 'tickets-release',
                    aliasPassword: function () {
                        // Prompt, read an environment variable, or just embed as a string literal
                        return('asdf1234');
                    },
                    storePassword: function () {
                        // Prompt, read an environment variable, or just embed as a string literal
                        return('asdf1234');
                    }
                },
                versionCode: 3
            }
        },
        nwjs: {
            server: {
                options: {
                    platforms: ['osx64','win64'],
                    buildDir: './releases/webkit',
                    version: '0.21.6',
                    macPlist: {
                        'NSHumanReadableCopyright': '2015 Asdf Ghjkl',
                        'NSCameraUsageDescription': 'To scan barcodes.'
                    }
                },
                src: ['./dist/webkit/**/*']
            }
        },
        connect: {
            options: {
                hostname: 'localhost',
                livereload: 35729,
                port: 4444
            },
            cordova: {
                options: {
                    base: 'dist/cordova',
                    open: true
                }
            }
        },
        exec: {
            webkit: '/Applications/nwjs.app/Contents/MacOS/nwjs ./dist/webkit &'
        },
        watch: {
            options: {
                livereload: '<%= connect.options.livereload %>'
            },
            all: {
                files: 'src/**/*',
                tasks: ['default']
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-phonegap');
    grunt.loadNpmTasks('grunt-nw-builder');

    grunt.registerTask('default', ['less', 'jade', 'uglify', 'concat']);
    grunt.registerTask('dev-cordova', ['connect:cordova', 'watch:all']);
    grunt.registerTask('dev-webkit', ['exec:webkit', 'watch:all']);
};
