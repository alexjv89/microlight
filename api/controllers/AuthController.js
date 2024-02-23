/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var passport = require('passport');
var async = require('async');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');


module.exports = {
	
	login: function(req, res) {
		if(req.user)
			return res.redirect('/orgs');
		var locals={
			error:false,
			email:''
		}
		var redirect='/orgs';
		if(req.query.redirect && req.query.redirect!='undefined')
			redirect = decodeURIComponent(req.query.redirect);
		if(req.body){
			locals.email=req.body.email;
			passport.authenticate('local', function(err, user, info) {
				console.log('in passport.authenticate callback');
				if ((err) || (!user)) {
					locals.error='Your credentials does not match'
					return res.view('auth/login',locals);
				}
				req.logIn(user, function(err) {
					if (err) res.send(err);
					if(req.session.returnTo)
						return res.redirect(req.session.returnTo);
					
					return res.redirect(redirect);
					// return res.send({
					// 	message: info.message,
					// 	user: user
					// });
				});

			})(req, res);
		}
		else{
			req.session.returnTo = '/';
			if( req.query.origin ){
			  req.session.returnTo = req.query.origin
			}else{
			  req.session.returnTo = req.header('Referer')
			}	
			res.view('auth/login',locals);
		}
	},

	logout: function(req, res) {
		req.session.destroy(function(e){
			req.logout();
			res.redirect('/');
		});	
	},
	googleAuthUrlRedirect: (req,res)=>{
		if(req.user)
			return res.redirect('/orgs');
		passport.authenticate('google', { scope:[ 'email', 'profile' ] })(req, res);
	},
	googleCallback: (req,res)=>{
		passport.authenticate( 'google', {
			successRedirect: '/',
			failureRedirect: '/login'
		})(req,res);
	},
	signup:function(req,res){

		if(req.user)
			return res.redirect('/');
		var locals={
			error:false,
			user:{
				email:'',
				name:'',
				password:'',
			}
		}
		if(req.body){
			var user = {
				email:req.body.email,
				name:req.body.name,
				password:req.body.password
			}
			locals.user=user;
			// create user
			// authenticate the user
			// create org
			async.auto({
				createUser:async function(){
					
					return await User.create(user).fetch();
				},
				generateToken:['createUser',async function(results){
					var payload = {
						user:results.createUser.id,
						email: results.createUser.email,
						for:'verify_email'
					};
					var token = jwt.sign(payload, sails.config.password_reset_secret, {expiresIn: 60*10});
					return token;
				}],
				sendMail:['createUser','generateToken', function(results, cb){
					var url = sails.config.app_url + '/verify_email?token='+ results.generateToken;
					var opts={
						template:'verify_email',
						to:results.createUser.email,
						from:'Cashflowy <no-reply@cashflowy.io>',
						subject: 'Verify your email to start using Cashflowy',
						locals:{
							user: results.createUser,
							url: url,
						}
					}
					MailgunService.sendEmail(opts, function (err) {
						if (err) {
							return cb(err); 
						} else {
							return cb();
						}
					});
				}],
				createOrg:['createUser',async function(results){
					var org = {
						name:'My Organisation',
						owner:results.createUser.id,
					}
					return await Org.create(org).fetch();
				}],
				createMembership:['createOrg','createUser',async function(results){
					var member ={
						user:results.createUser.id,
						type:'admin',
						org:results.createOrg.id,
					}
					return await Member.create(member);
				}],
			},function(err,results){
				if(err){
					if(err.code=='E_UNIQUE' && err.attrNames && err.attrNames.indexOf('email') > -1	){
						locals.error='You have already registed with that email address. <a href="/login">Login in instead</a>'
						return res.view('auth/signup',locals);
					}else if(err.code == 'E_INVALID_NEW_RECORD' && err.message.includes('was not a valid email address')){
						locals.error='please enter a valid email address'
						return res.view('auth/signup',locals);
					}
					else
						res.send('unknown error');
				}else{
					passport.authenticate('local', function(err, user, info) {
						if ((err) || (!user)) {
							return res.send({
								message: info.message,
								user: user
							});
						}
						req.logIn(user, function(err) {
							if (err) 
								res.send(err);
							else
								return res.redirect('/');
						});
					})(req, res);
				}
			})
		}
		else{
			res.view('auth/signup',locals);
		}
	},
	view_forgot: function(req, res){
		var locals = {
			error: '',
			message:''
		}
		res.view('auth/forgot', locals);
	},

	/**
	 * Triggers an email to help reset the forgotten password
	 */
	forgot: function (req, res) {
		var email = req.body.email;
		
		if (!email) return res.view('auth/reset', {
			error: 'email is mandatory',
			message:''
		});

		async.auto({
			findUser: function(cb){
				User.findOne({email:email}).exec(function(err, user){
					if(err) return cb(err);
					if(!user) return cb(new Error('user not found'));
					return cb(null, user);
				})
			},
			generateToken: ['findUser', function(results, cb){
				jwt.sign({
					email: results.findUser.email,
					for:'forgot_password'
				}, 
				sails.config.password_reset_secret, 
				{expiresIn: 60*10},
				cb);
			}],
			sendMail:['generateToken', function(results, cb){
				var reset_url = sails.config.app_url + '/reset?token='+ results.generateToken;
				var opts={
					template:'reset',
					to:results.findUser.email,
					from:'Cashflowy<no-reply@cashflowy.io>',
					subject: 'Reset Password',
					locals:{
						name: results.findUser.name,
						url: reset_url
					}
				}
				MailgunService.sendEmail(opts,function(err){
					cb(err)
				})
			}]
		}, function(err, results){
			var locals = {
				error: err ? err.message : '',
				message: !err ? 'Password Reset Link sent successfully' : ''
			}
			res.view('auth/forgot', locals);
		})
	},

	view_reset: function(req, res){
		if(req.user)
			return res.redirect('/orgs');
		var token =  req.query.token;

		if (!token) return res.view('auth/reset', {
			error: 'reset token is missing',
			message:''
		});
		
		async.auto({
			verifyToken: function(cb){
				jwt.verify(token, 
					sails.config.password_reset_secret, 
				cb);	
			},
			findUser: ['verifyToken', function(results, cb){
				User.findOne({email:results.verifyToken.email}).exec(function(err, user){
					if(err) return cb(err);
					if(!user) return cb(new Error('user not found'));
					return cb(null, user);
				})
			}],
		}, function(err, results){
			var locals = {
				error: '',
				message:'',
				email:results.findUser.email,
				resend_link_error: '',
				resend_link_message:''
			}
			res.view('auth/reset', locals);
		})
	},

	reset: function (req, res) {
		var password = req.body.password;
		if (!password) return res.view('auth/reset', {
			error: 'password is missing',
			message:''
		});

		var token =  req.query.token;

		if (!token) return res.view('auth/reset', {
			error: 'reset token is missing',
			message:''
		});

		async.auto({
			verifyToken: function(cb){
				// jwt.verify(token, 
				// 	sails.config.password_reset_secret, 
				// 	cb);
				jwt.verify(token, sails.config.password_reset_secret, function(err, decoded) {
					if (err) {
						if (err.name === 'TokenExpiredError') {
							return cb(new Error('Password Reset Link expired. <a href="/forgot">Reset again</a>'));
						} else {
							return cb(err);
						}
					}
					cb(null,decoded);
				});
				
			},
			findUser: ['verifyToken', function(results, cb){
				User.findOne({email:results.verifyToken.email}).exec(function(err, user){
					if(err) return cb(err);
					if(!user) return cb(new Error('user not found'));
					return cb(null, user);
				})
			}],
			resetPassword:['findUser', function(results, cb){
				bcrypt.genSalt(10, function(err, salt) {
					bcrypt.hash(password, salt, function(err, hash) {
						if (err) {
							cb(err);
						}else{
							User.update({id: results.findUser.id},{password: hash}).exec(cb);
						}
					});
				});
			}]
		}, function(err, results){
			var locals = {
				error: err ? err.message : '',
				message: !err ? 'Password reseted successfully' : ''
			}
			res.view('auth/reset', locals);
		})
	},

	resendResetPassword:function(req,res){
		var email = req.body.email;
		
		if (!email) return res.send('auth/reset', {
			error: 'email is mandatory',
			message:''
		});

		async.auto({
			findUser: function(cb){
				User.findOne({email:email}).exec(function(err, user){
					if(err) return cb(err);
					if(!user) return cb(new Error('user not found'));
					return cb(null, user);
				})
			},
			generateToken: ['findUser', function(results, cb){
				jwt.sign({
					email: results.findUser.email,
					for:'forgot_password'
				}, 
				sails.config.password_reset_secret, 
				{expiresIn: 60*10},  //10 mins or 600 seconds
				cb);
			}],
			sendMail:['generateToken', function(results, cb){
				var reset_url = sails.config.app_url + '/reset?token='+ results.generateToken;
				var opts={
					template:'reset',
					to:results.findUser.email,
					from:'Cashflowy<no-reply@cashflowy.io>',
					subject: 'Reset Password',
					locals:{
						name: results.findUser.name,
						url: reset_url
					}
				}
				MailgunService.sendEmail(opts,function(err){
					cb(err)
				})
			}]
		}, function(err, results){
			var locals = {
				message:'',
				error:'',
				resend_link_error: err ? err.message : '',
				email:results.findUser.email,
				resend_link_message: !err ? 'Password Reset Link sent successfully' : ''
			}
			res.send(locals);
		})
	},

	setPassword: function (req, res) {
		if(req.user)
			return res.redirect('/orgs');
		var token =  req.query.token;

		if (!token) return res.view('auth/set_password', {
			error: 'reset token is missing',
			message:''
		});

		if(!req.body){ // get request
			res.view('auth/set_password', {
				error: '',
				message:''
			});
		}else{ // post request
			var password = req.body.password;
			if (!password) return res.view('auth/set_password', {
				error: 'password is missing',
				message:''
			});
			async.auto({
				verifyToken: function(cb){
					jwt.verify(token, 
						sails.config.password_reset_secret, 
						cb);
				},
				findUser: ['verifyToken', function(results, cb){
					User.findOne({email:results.verifyToken.email}).exec(function(err, user){
						if(err) return cb(err);
						if(!user) return cb(new Error('user not found'));
						return cb(null, user);
					})
				}],
				resetPassword:['findUser', function(results, cb){
					bcrypt.genSalt(10, function(err, salt) {
						bcrypt.hash(password, salt, function(err, hash) {
							if (err) {
								cb(err);
							}else{
								User.update({id: results.findUser.id},{password: hash}).exec(cb);
							}
						});
					});
				}]
			}, function(err, results){
				var locals = {
					error: err ? err.message : '',
					message: !err ? 'Password set successfully. Please proceed to login.' : ''
				}
				res.view('auth/set_password', locals);
			})
		}
		
	},
	verifyEmail:function(req,res){
		if(!req.body){// GET request
			if(_.get(req,'user.is_verified')) // incase the user accidently lands on the verify email page again.
				return res.redirect('/');
			if(!req.query.token){
				var locals={
					error:null,
					message:'',
				}
				res.view('auth/verify_email',locals);
			}else{
				// token present. verify and grand access.
				async.auto({
					verifyToken: async function(cb){
						var payload = jwt.verify(req.query.token,sails.config.password_reset_secret);
						return payload;
					},
					findUser: ['verifyToken', function(results, cb){
						var filter = {
							id:results.verifyToken.user,
							email:results.verifyToken.email
						};
						User.findOne(filter).exec(function(err, user){
							if(err) return cb(err);
							if(!user) return cb(new Error('user not found'));
							return cb(null, user);
						})
					}],
					updateUser:['findUser', async function(results){
						return await User.update({id: results.findUser.id},{is_verified:true})
					}]
				}, function(err, results){
					var locals = {
						error: err,
						message: !err ? 'Email verified' : ''
					}
					res.view('auth/verify_email', locals);
				})
			}
		}
		else{
			if(!req.user)
				return res.badRequest();
			async.auto({
				generateToken: async function(){
					var payload = {
						user:req.user.id,
						email: req.user.email,
						for:'verify_email'
					};
					var token = jwt.sign(payload, sails.config.password_reset_secret, {expiresIn: 60*10});
					return token;
				},
				sendMail:['generateToken', function(results, cb){
					var url = sails.config.app_url + '/verify_email?token='+ results.generateToken;
					var opts={
						template:'verify_email',
						to:req.user.email,
						from:'Cashflowy <no-reply@cashflowy.io>',
						subject: 'Verify your email to start using Cashflowy',
						locals:{
							user: req.user,
							url: url,
						}
					}
					MailgunService.sendEmail(opts,function(err){
						cb(err)
					})
				}]
			}, function(err, results){
				var locals = {
					error: err ? err.message : '',
					message: !err ? 'Verification email sent.' : ''
				}
				res.view('auth/verify_email',locals);
			})	
		}
	}
}



