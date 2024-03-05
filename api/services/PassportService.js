var passport = require('passport');
LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

passport.serializeUser(function(user, done) {
	console.log('inside PassportService.passport.serializeUser');
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	console.log('inside PassportService.passport.deserializeUser');
	User.findOne({ id: id } , function (err, user) {
		done(err, user);
	});
});

passport.use(new GoogleStrategy({
		clientID:     process.env.ML_GOOGLE_CLIENT_ID,
		clientSecret: process.env.ML_GOOGLE_CLIENT_SECRET,
		callbackURL:  process.env.ML_GOOGLE_CALLBACK_URL,
		passReqToCallback   : true
	},
	function(request, accessToken, refreshToken, profile, done) {
		// console.log(profile);
		
		try{
			async.auto({
				findUser:async function(){
					return await User.findOne({ email: profile.email });
				},
				updateUser:['findUser',async function(results){
					if(results.findUser){
						google_profile = profile._json;
						var update = {
							is_verified:google_profile.email_verified,
							google_profile
						}
						return await User.updateOne({email:profile.email},update);
					}
				}],
				createUser:['findUser',async function(results){
					var rnd = (len, chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => [...Array(len)].map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
					const salt = bcrypt.genSaltSync(10);
					var hashed_password = bcrypt.hashSync(rnd(12), salt); // randomly generated password.
					if(!results.findUser){
						var user = {
							name:profile?._json?.name,
							email:profile?._json?.email,
							is_verified:profile?._json?.email_verified,
							password:hashed_password,
							google_profile:profile?._json,
						}
						return await User.create(user).fetch();
					}
				}],
				createMembership:['createUser',async function(results){
					var users = await User.count();
					if(users==1){ // if you are the first user to be created on the microlight
						var member ={
							user:results.createUser.id,
							type:'admin',
							// org:results.createOrg.id,
						}
						return await Member.create(member);
					}
				}],
			},function(err,results){
				var user = results.updateUser||results.createUser;
				return done(err,user);
			})
		}catch(e){
			throw(e);
		}
		
		// if user does not exist
		// 	- create user
		// 	- create new org
		// if user exists
		// 	- just find the user
		// User.findOrCreate(, {email:profile.email,name:profile.displayName,password:hashed_password,},function (err, user) {
		// 	return done(err,user);
    	// });
  	}
));




/*
	email and password login strategy
*/
passport.use(new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password'
},
function(email, password, callback) {
	console.log('inside passport LocalStrategy callback')
	User.findOne({ email: email }, function (err, user) {
		if (err) { return callback(err); }
		if (!user) {
			return callback(null, false, { message: 'Incorrect email.' });
		}

		bcrypt.compare(password, user.password, function (err, res) {
			if (!res)
				return callback(null, false, {
					message: 'Invalid Password'
				});
			var returnUser = {
				email: user.email,
				createdAt: user.createdAt,
				id: user.id
			};
			return callback(null, returnUser, {
				message: 'Logged In Successfully'
			});
		});
	});
}
));
