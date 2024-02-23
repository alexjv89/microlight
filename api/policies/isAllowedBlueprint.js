
// policy for allowing member to blueprint APIs
module.exports = function (req, res, next) {
	delete req._sails.hooks.pubsub;
	if (req.isAuthenticated()) {
		var org =req.query.org||_.get(req.body,'org')
		async.auto({
			getAllMembership:function(callback){
				Member.find({user:req.user.id})
					.populate('org')
					.sort('createdAt DESC')
					.exec(callback);
			}
		},function(err,results){
			var orgs=[];
			results.getAllMembership.forEach(function(member){
				orgs.push({
					id:member.org.id,
					name:member.org.name,
				})
			})
			if(!org)
				res.json(400,{
					message:'org must be specified in query params or body params. The following are the orgs that you are member of.',
					orgs:orgs,
				})
			var grant_access=false;
			orgs.forEach(function(member_org){
				if(member_org.id==org){
					grant_access=true;
				}
			})
			if(grant_access)
				return next();
			else
				res.json(400,{
					message:'You are not part of this org. The following are the orgs that you are a member of.',
					orgs:orgs,
				})
		})
		
	}
	else if(req.headers['api-key'] && req.headers['api-secret']){
		async.auto({
			getAPIKey:async function(){
				return await API_key.findOne({key:req.headers['api-key']});
			},
		},(err,results)=>{
			if(err)
				return res.handleError(err);
			if(!results.getAPIKey)
				return res.status(401).send('Unauthorized');
			var bcrypt = require('bcryptjs');
			if(!bcrypt.compareSync(req.headers['api-secret'], results.getAPIKey.secret))
				return res.status(401).send('Unauthorized');
			req.query.org = _.get(results,'getAPIKey.org');
			if(req.query.where){
				req.query.where = JSON.parse(req.query.where);
				req.query.where.org = _.get(results,'getAPIKey.org');
			}
			return next();
		})
	}
	else{
		return res.json(400, {
			status: 'Failure',
			message: 'You dont have permission to access this'
		});
	} 

};
