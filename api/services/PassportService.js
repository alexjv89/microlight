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
		clientID:     process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		callbackURL:  process.env.GOOGLE_CALLBACK_URL,
		passReqToCallback   : true
	},
	function(request, accessToken, refreshToken, profile, done) {
		var rnd = (len, chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => [...Array(len)].map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
		const salt = bcrypt.genSaltSync(10);
		var hashed_password = bcrypt.hashSync(rnd(12), salt);
		User.findOrCreate({ email: profile.email }, {email:profile.email,name:profile.displayName,password:hashed_password},function (err, user) {
			return done(err,user);
    });
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
