/**
 * Invoice.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
module.exports = {
	attributes: {
		name: {
			type: 'string',
		},
		pan:{
			type:'string',
			allowNull:true,
			unique: true,
		},
		description: { // some description about the organization
			type: 'string',
			allowNull:true
		},
		type: {
			type: 'string',
			isIn:['personal','business']
		},
		email:{
			type: 'string',
			unique: true,
			allowNull: true
		},
		is_active:{
			type: 'boolean',
			defaultsTo: true
		},
		owner:{ // 
			model:'user',
			// required:true
		},
		members: { // 
			collection: 'member',
			via:'org',
		},
		details: {
			type: 'json',
			defaultsTo: {
				settings:{}, // org settings
				feature_flags:{} // feature flags enabled for the org
			}
		},
	},
	customToJSON: function() {
		return _.omit(this, ['details']);
	},
}