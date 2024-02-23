/**
 * GSTIN.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
 module.exports = {
	attributes: {
		name: { // name of the firm
			type: 'string',
			required:true,
		}, 
		key:{
			type:'string',
		},
		secret:{
			type:'string',
		},
		expires_at: { // set optional expiry date
			type: 'ref',
			columnType: 'timestamptz'
		},
		org:{
			model:'org',
			required:true
		}
	},
	customToJSON: function() {
		// Return a shallow copy of this record with the password and ssn removed.
		return _.omit(this, ['secret']);
	},
	beforeCreate: function(api_key, cb) {
		var bcrypt = require('bcryptjs');
		bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash(api_key.secret, salt, function(err, hash) {
				if (err) {
					console.log(err);
					cb(err);
				}else{
					api_key.secret = hash;
					cb(null, api_key);
				}
			});
		});
	}
}