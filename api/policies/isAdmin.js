module.exports = function (req, res, next) {
	if (_.includes(sails.config.admins, req.user.email)) {
		return next();
	}
	else {
		res.send('you need admin permissions to access this')
	}
};