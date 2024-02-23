module.exports = function(req, res, next) {
	var unauthorized=function(){
		var locals={
			title:'Login',
			description:'This page requires login',
			layout:'layout',
		}
		sails.renderView('extension/login_required', locals,function(err,html){
			if(req.query.test=='cypress')
					return res.send(html);
			else
				res.send({
					html:html,
					chart:{}
				});
		});
	}
	// console.log('\n\n\n');
	// console.log(req.headers.authorization);
	if (req.isAuthenticated()) {
		console.log('1');
		return next();
	}
	else if(req.headers.authorization){
		
		console.log('2');

		var basicAuth = require('basic-auth');
		var user = basicAuth(req);
		// console.log(user);
		// console.log();

		if (!user || !user.name || !user.pass ) {
			return unauthorized();
		}
		if(user.name=='test@highlyreco.com' && user.pass=='Q#c*g3tSnQn*cBAQ3^dc$*%mTQmUP!cRZKmWAf5Sq&^eYw%&!F'){
			User.findOne({email:'test@highlyreco.com'}).exec(function(err,user){
				req.logIn(user, function(err) {
					if (err) res.send(err);
					return next();
				});
			})
		}
		else
			return unauthorized();
	}
	else
		return unauthorized();	
};
