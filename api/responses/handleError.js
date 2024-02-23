/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');



/**
 * Thsi is used inside control functions 
 * 
 */

module.exports = function handleError (err) {

	// Get access to `req` and `res`
	var req = this.req;
	var res = this.res;

	// Get access to `sails`
	var sails = req._sails;

	if(err.is_custom_error){
		if(err.status==404)
			return res.notFound();
		else
			return res.serverError(err);
	}else if(err.isAxiosError){
		res.status(err.response.status)
		var output = {
			cf_message:'============ Passthrough to 3rd party service failed ============',
			error_message:err.message,
			tp_response:{
				data:err.response.data,
				status:err.response.status,
				statusText:err.response.statusText
			},
		}
		return res.send(output);
		// if(err.response.status==404)
		// 	return res.notFound();
		// else
		// 	return res.serverError(err);		
	}else if(req.path.split('/')[3]=='integrations' && req.path.split('/')[5]=='passthrough'){
		// some errors can be not an axios error. 
		// This catches other errors from passthrough controller
		res.status(500);
		var output = {
			cf_message:'============ Passthrough to 3rd party service failed ============',
			error_message:err.message,
		}
		return res.send(output);

	}else{
		return res.serverError(err);
	}


};
