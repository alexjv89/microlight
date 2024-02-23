var async= require('async');
module.exports = function (req, res, next) {
	// console.log(req.params);
	if(req.params.o_id){
		async.auto({
			getOrg:function(callback){
				Org.findOne({id:req.params.o_id}).exec(callback);
			},
			checkMembership:function(callback){
				Member.find({org:req.params.o_id,user:req.user.id}).exec(callback);
			},
			// get all orgs that the user is part of
			getAllMembership:function(callback){
				Member.find({user:req.user.id}).populate('org').exec(callback);
			}
		},function(err,results){
			// console.log('\n\n\n\n\n ------ results ------');
			// console.log(results);
			if (results.checkMembership && results.checkMembership.length){ // there is a membership for that user in that org
				// if (results.checkMembership){ // there is a membership for that user in that org
				req.org=results.getOrg;
				req.user.membership = results.checkMembership[0];
				req.user.memberships = results.getAllMembership;
				next(err);
			}else{
				if(req.url.startsWith('/api/'))
					return res.status(403).json({error: 'you are not part of this org'});
				res.send('you are not part of this org');
			}
		})
        
	}else{
		if(req.url.startsWith('/api/'))
			return res.status(403).json({error: 'you are not part of this org'});
		res.send('you are not part of this org');
	}
};
