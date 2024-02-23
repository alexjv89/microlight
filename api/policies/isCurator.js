const { setUser } = require("@sentry/minimal");

module.exports = function (req, res, next) {
	if (req.user.is_curator == true) {
		return next();
	}
	else {
		res.send('You are not a curator, You do not have access to this.')
	}
};