/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * Only applies to HTTP requests (not WebSockets)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.http.html
 */

var sentry = require('@sentry/node');
if(process.env.SENTRY_DNS){
  sentry.init({
    dsn: process.env.SENTRY_DNS,
    environment: process.env.NODE_ENV
  });
}
var Bull = require( 'bull' );
var eventQueue = new Bull('event',{
  redis:{
    host: process.env.REDIS_BULL_HOST,
    username: process.env.REDIS_BULL_USERNAME,
    password: process.env.REDIS_BULL_PASSWORD,
    port: process.env.REDIS_BULL_PORT,
    db: process.env.REDIS_BULL_DB,
    tls:{},
    connectTimeout:30000,
  }
});

module.exports.http = {

  /****************************************************************************
  *                                                                           *
  * Express middleware to use for every Sails request. To add custom          *
  * middleware to the mix, add a function to the middleware config object and *
  * add its key to the "order" array. The $custom key is reserved for         *
  * backwards-compatibility with Sails v0.9.x apps that use the               *
  * `customMiddleware` config option.                                         *
  *                                                                           *
  ****************************************************************************/
  trustProxy: true, 
  middleware: {

    /***************************************************************************
    *                                                                          *
    * The order in which middleware should be run for HTTP request. (the Sails *
    * router is invoked by the "router" middleware below.)                     *
    *                                                                          *
    ***************************************************************************/
    startRequestTimer: require('sails-helper').startRequestTimer,
    passportInit: require('passport').initialize(),
    passportSession: require('passport').session(),

    sentryRequestHandler: sentry.Handlers.requestHandler(),
    sentryerrorHandler: sentry.Handlers.errorHandler(),
    myRequestLogger: require('@switchless-io/middleware-logger').getRequestLogger({pg_connection_string:process.env.DB_SERVERLOG}),
    // myRequestLogger: getRequestLogger(),
    // lastVisitedPage: require('../api/middleware/lastVisitedPage'),
    order: [
      'startRequestTimer',
      'sentryRequestHandler', 
      'cookieParser',
      'session',
      // 'lastVisitedPage',
      'passportInit',
      'passportSession',
      'authenticateBlueprint',
      'bodyParser',
      'myRequestLogger',
      'compress',
      'poweredBy',
      '$custom',
      'router',
      'www',
      'favicon',
      'blueprintUnauthorized',
      'sentryerrorHandler'
    ],

    /****************************************************************************
    *                                                                           *
    * Example custom middleware; logs each request to the console.              *
    *                                                                           *
    ****************************************************************************/
    
    authenticateBlueprint: function (req, res, next) {
      // authenticate apis with bearer token
      if (req.url.startsWith('/api/'))
        require('passport').authenticate('bearer', { session: false })(req, res, next)
      else
        next()
    },

    blueprintUnauthorized: function (err, req, res, next) {
      if(err.message && err.message.startsWith('BLUEPRINT_')){
        res.status(401).json({ error: 'invalid token' });
      }
      switch (err.name) {
        case 'UnauthorizedError':
        case 'JsonWebTokenError':
          res.status(401).json({ error: 'invalid token' });
          break;
        default:
          next(err);
      }
    }


    /***************************************************************************
    *                                                                          *
    * The body parser that will handle incoming multipart HTTP requests. By    *
    * default,Sails uses [skipper](http://github.com/balderdashy/skipper). See *
    * https://github.com/expressjs/body-parser for other options. Note that    *
    * Sails uses an internal instance of Skipper by default; to override it    *
    * and specify more options, make sure to "npm install                      *
    * skipper@for-sails-0.12 --save" in your app first. You can also specify a *
    * different body parser or a custom function with req, res and next        *
    * parameters (just like any other middleware function).                    *
    *                                                                          *
    ***************************************************************************/


    // bodyParser: require('skipper')({strict: true})

  },


  /***************************************************************************
  *                                                                          *
  * The number of milliseconds to cache static assets in production.         *
  * These are any flat files like images, scripts, styleshseets, etc.        *
  * that are served by the static middleware.  By default, these files       *
  * are served from `.tmp/public`, a hidden folder compiled by Grunt.        *
  *                                                                          *
  ***************************************************************************/

  // cache: 31557600000
};
