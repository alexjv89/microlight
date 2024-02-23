/**
 * hasValidSecret
 *
 * @memberof    policies
 * @description :: Simple policy to allow requests with valid secret key
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

module.exports = function (req, res, next) {

	if (!req.query.secret)
		return res.json(400, {
			status: 'Failure',
			message: "Invalid request, 'secret' key is required"
		});
	// api secret is a temporary setup.
	// replace api secret with something more permanent
	if (req.query.secret != 'asdfasfljalksdfnaisnfiansdflkjansvlkjcnsdlifnsdlakjfnlasndfll')
		return res.json(400, {
			status: 'Failure',
			message: 'Invalid Request, secret key is invalid'
		});

	delete req.query.secret;
	return next();
};
