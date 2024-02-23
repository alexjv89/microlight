/**
When this response is used, the same controller will render either json or html
 */
module.exports = function viewOrJSON(view_file,locals) {

	// Get access to `req` and `res`
	var req = this.req;
	var res = this.res;
	if(req.headers['api-key']||req.query.view=='json')
		res.json(locals);
	else
		res.view(view_file,locals);
};
