/**
 * Test environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

// var sentry = require('@sentry/node');
// sentry.init({
//   dsn: process.env.SENTRY_DNS,
//   environment: process.env.NODE_ENV
// });

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the production        *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/
  models: {
    datastore: 'default',
    migrate: 'safe'
  },

  datastores: {
    default: {
      adapter: 'sails-postgresql',
      host: process.env.ML_DB_HOST,
      user: process.env.ML_DB_USER, // optional
      password: process.env.ML_DB_PASSWORD, // optional
      database: process.env.ML_DB_DATABASE, //optional
      ssl: true
    }
  },
  bull: {
    redis: {
      host: process.env.REDIS_BULL_HOST,
      port: 6379,
      db: 1,
    }
  },
  session: {
    adapter: 'connect-redis',
    host: process.env.REDIS_SESSION_HOST,
    port: 6379,
    db: process.env.REDIS_SESSION_DB,
  },
  // slack_webhook: process.env.SLACK_WEBHOOK,
  mailgun: {
    api_key: process.env.MAILGUN_APIKEY,
    domain: process.env.MAILGUN_DOMAIN,
  },
  // background_secret: process.env.BACKGROUND_SECRET,
  // metabase: {
  //   site_url: process.env.METABASE_SITE_URL,
  //   secret_key: process.env.METABASE_SECRET_KEY
  // },

  password_reset_secret: process.env.PASSWORD_RESET_SECRET,

  app_url: process.env.APP_URL,

  aws: {
    key: process.env.AWS_ACCESS_KEY,
    secret: process.env.AWS_ACCESS_SECRET,
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET,
    // category_model_id: process.env.AWS_CATEGORY_MODEL_ID,
    // prediction_endpoint: process.env.AWS_PREDICTION_ENDPOINT,
    // kms_key_id: process.env.AWS_KMS_KEY_ID
  },

  sockets: {
    onlyAllowOrigins: ["https://app.mralbert.in"]
  },

  // api_token_secret: process.env.API_TOKEN_SECRET,

  // firebase: {
  //       serviceAccount: {
  //           type: "service_account",
  //           project_id: process.env.FIREBASE_PROJECT_ID,
  //           private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  //           private_key: process.env.FIREBASE_PRIVATE_KEY.split('\\n').concat().join("\n"),
  //           client_email: process.env.FIREBASE_CLIENT_EMAIL,
  //           client_id: process.env.FIREBASE_CLIENT_ID,
  //           auth_uri: "https://accounts.google.com/o/oauth2/auth",
  //           token_uri: "https://accounts.google.com/o/oauth2/token",
  //           auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  //           client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
  //       },
  //       databaseUrl: process.env.FIREBASE_DATABASE_URL
  // },

  // uploads: {
  //   adapter: require('skipper-s3'),
  //   key: process.env.AWS_ACCESS_KEY,
  //   secret: process.env.AWS_ACCESS_SECRET,
  //   bucket: process.env.AWS_BUCKET,
  //   region: process.env.AWS_REGION
  // },

  // admins: process.env.ADMINS.split(',').map(function(s){return parseInt(s)}),

  // sentry: sentry
  razorpay: {
    webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  }
};
