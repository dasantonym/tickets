# Nondescript Ticket Software #

JavaScript software package consisting of:

* Local Ticket Server (Node-Webkit) 
* Mobile Ticket Reader (Apache Cordova)

Uses AngularJS and Bootstrap

## Build ##

You need Grunt-CLI, Bower and NPM

First install dependencies:

```shell
npm install
bower install
```

### Ticket Server ###

```shell
# update the dist files with
grunt

# build the server
grunt nodewebkit:server
```

You can find the build in ``releases/node-webkit``.


### Ticket Scanner ###

```shell
# update the dist files with
grunt

# build the scanner
grunt phonegap:build

# run in simulator
grunt phonegap:run

# build release (or debug)
grunt phonegap:release
```

You can find the build in ``releases/``.
