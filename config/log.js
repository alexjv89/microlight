/**
 * Built-in Log Configuration
 * (sails.config.log)
 *
 * Configure the log level for your app, as well as the transport
 * (Underneath the covers, Sails uses Winston for logging, which
 * allows for some pretty neat custom transports/adapters for log messages)
 *
 * For more information on the Sails logger, check out:
 * http://sailsjs.org/#!/documentation/concepts/Logging
 */

var winston = require('winston');
// require('winston-loggly');
module.exports.log = {

	/***************************************************************************
	*                                                                          *
	* Valid `level` configs: i.e. the minimum log level to capture with        *
	* sails.log.*()                                                            *
	*                                                                          *
	* The order of precedence for log levels from lowest to highest is:        *
	* silly, verbose, info, debug, warn, error                                 *
	*                                                                          *
	* You may also set the level to "silent" to suppress all logs.             *
	*                                                                          *
	***************************************************************************/

	// level: 'info'
	level: 'info',
	inspect: false,
	custom: function (level) {

		var sentLogLevel = level ? level : 'info';

		var logger = new winston.Logger({
			//sails log levels
			levels: {
				silent: 0,
				error: 1,
				warn: 2,
				info: 3,
				verbose: 4,
				debug: 5,
				silly: 6
			},
			exitOnError: false,
			transports: [
				new (winston.transports.Console)({
					name: sentLogLevel,
					level: sentLogLevel,
					colorize: false,
					handleExceptions: true,
					humanReadableUnhandledException: true,
					timestamp: true
				}),
				// new (winston.transports.Loggly)({
				// 	level: 'info',
				// 	subdomain: "mralbert",
				// 	token: "596aa76b-58b5-4e23-a231-96a42d6d1c8a",
				// 	json:true
				// }),
			]
		});
		return logger;
	}()

};
