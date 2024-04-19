module.exports = {
	attributes: {
		task: {
			type: 'string',
			required:true,
		},
		status: {
			type: 'string',
			defaultsTo:'running',
			isIn:['running','failed','succeeded']
		},
		duration:{
			type:'number'
		},
		user:{
			model:'user',
		},
		output:{
			type:'json',
			// defaultsTo:{}
		},
		logs:{
			type:'json',
			defaultsTo:[]
		},
		activities:{
			type:'json',
			defaultsTo:[]
		},
		inputs:{
			type:'json',
			defaultsTo:{}
		},
		by:{
			type: 'string',
			// required:true,
			isIn:['user','api','schedule'],
			defaultsTo:'user',
		}
	},
}