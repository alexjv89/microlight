
module.exports = {
	attributes: {
		type: {
			type: 'string',
			isIn: ['admin', 'contributor','guest','albert_agent'], // guest has only read access. Contributor has write access and admin has permission to add new users
			// isIn: ['client', 'albert_agent', 'auditor', 'admin'],
		},
		user:{
			model:'user',
			required:true
		}
	},
}