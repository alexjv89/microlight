/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

var _ = require("lodash");
var routes = {
	auth:{
		"GET /login": "AuthController.login",
		"POST /login": "AuthController.login",
		"GET /signup": "AuthController.signup",
		"POST /signup": "AuthController.signup",
		"GET /logout": "AuthController.logout",
		"GET /forgot": "AuthController.view_forgot",
		"POST /forgot": "AuthController.forgot",
		"GET /reset": "AuthController.view_reset",
		"POST /reset": "AuthController.reset",
		"POST /resend/reset_password": "AuthController.resendResetPassword",
		"GET /forgot": "AuthController.view_forgot",
		"POST /forgot": "AuthController.forgot",
		"GET /set_password": "AuthController.setPassword",
		"POST /set_password": "AuthController.setPassword",
		"GET /auth/google": "AuthController.googleAuthUrlRedirect",
		"GET /oauth2/callback/google": "AuthController.googleCallback",
		"GET /verify_email": "AuthController.verifyEmail", // view verify email page and link from email
		"POST /verify_email": "AuthController.verifyEmail", // Send email 
	},
	main:{
		"GET /": "MainController.landingPage",
		"GET /library*": "MainController.viewFolder",
		"GET /task/:slug": "MainController.viewTask",
		"POST /task/:slug/execute": "MainController.executeTask",
		"GET /task/:slug/run/:r_id": "MainController.viewRun",
	},
	admin:{
		// Admin functionalities
		"GET /admin": "AdminController.adminLanding",
		"GET /admin/users": "AdminController.listUsers",
		"GET /admin/user/create": "AdminController.createUser",
		"POST /admin/user/create": "AdminController.createUser",
		"GET /admin/update_jobs": "AdminController.updateJobs",
		"POST /admin/update_jobs": "AdminController.updateJobs",
		"GET /admin/report_defs": "AdminController.listReportDefs",
		"GET /admin/report_def/:rd_id/edit": "AdminController.editReportDef",
		"POST /admin/report_def/:rd_id/edit": "AdminController.editReportDef",
		"GET /admin/report_def/create": "AdminController.createReportDef",
		"GET /admin/jobs/restart": "AdminController.restartRepeatJobs",
		"POST /admin/jobs/restart": "AdminController.restartRepeatJobs",

		"GET /admin/health_check/database": "AdminController.dbCheck",
		
		// "POST /admin/system_checks/update": "AdminController.updateSystemChecks",
	},
	org_settings:{
		"GET /org/:o_id/usage":"SettingsController.usage",

		
		
		"GET /settings":"SettingsController.general",
		"POST /settings":"SettingsController.general",
		"GET /settings":"SettingsController.general",
		"GET /settings/apikeys":"SettingsController.apiKeys",
		"POST /settings/apikeys":"SettingsController.apiKeys",
		"GET /settings/api_key/create":"SettingsController.createAPIKey",
		"POST /settings/api_key/create":"SettingsController.createAPIKey",
		"GET /settings/api_key/:k_id/delete":"SettingsController.deleteAPIKey",
		"POST /settings/api_key/:k_id/delete":"SettingsController.deleteAPIKey",
		"GET /settings/feature_flags":"SettingsController.featureFlags",
		"POST /settings/feature_flags":"SettingsController.featureFlags",
		"GET /settings/members":"SettingsController.members",
		"POST /settings/membership/create":"SettingsController.createMembership",
		"DELETE /settings/membership/:m_id/revoke":"SettingsController.revokeMembership",
	},
	
	
	
	webhook:{
	
	},
	
	bull:{
		// Bull related tasks
		"GET /bull/:queue": "BullController.index",
		"GET /bull/:queue/:state": "BullController.listItems",
		"POST /bull/:queue/retry": "BullController.retryJob",
		"POST /bull/:queue/delete": "BullController.deleteJob",
		"POST /bull/:queue/repeat/delete": "BullController.deleteRepeatJob",
		"POST /bull/:queue/job/add": "BullController.addJob",
		"GET /bull/:queue/job/:job_id/recreate": "BullController.recreateJob",
	},
	
};

module.exports.routes = _.merge(
	routes.auth,
	routes.admin,
	routes.main,
	routes.org_settings,
	routes.webhook,
	routes.bull,
);
