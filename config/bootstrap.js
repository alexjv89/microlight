/**
 * Seed Function
 * (sails.config.bootstrap)
 *
 * A function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also create a hook.
 *
 * For more information on seeding your app with fake data, check out:
 * https://sailsjs.com/config/bootstrap
 */

module.exports.bootstrap = function(cb) {

  async.eachSeries(_.values(require('include-all')({
    dirname: __dirname + '/../bootstraps',
    filter : /(.+Bootstrap)\.js$/,
    excludeDirs : /^\.(git|svn)$/,
    optional: true
  })), function (bootmodule, callback) {
    _.isFunction(bootmodule) && 
      (bootmodule(callback), true) || callback();
  }, 
  cb); // bootstrap callback

  // By convention, this is a good place to set up fake data during development.
  //
  // For example:
  // ```
  // // Set up fake development data (or if we already have some, avast)
  // if (await User.count() > 0) {
  //   return;
  // }
  //
  // await User.createEach([
  //   { emailAddress: 'ry@example.com', fullName: 'Ryan Dahl', },
  //   { emailAddress: 'rachael@example.com', fullName: 'Rachael Shaw', },
  //   // etc.
  // ]);
  // ```

};
