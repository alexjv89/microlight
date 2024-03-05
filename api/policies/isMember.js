var async= require('async');
module.exports = function (req, res, next) {
	async.auto({
		checkMembership:function(callback){
			Member.find({org:req.params.o_id,user:req.user.id}).exec(callback);
		},
	},function(err,results){
		// console.log('\n\n\n\n\n ------ results ------');
		// console.log(results);
		if (results.checkMembership && results.checkMembership.length){ // there is a membership for that user in that org
			// if (results.checkMembership){ // there is a membership for that user in that org
			req.user.membership = results.checkMembership[0];
			next(err);
		}else{
			if(req.url.startsWith('/api/'))
				return res.status(403).json({error: 'you are not part of this org'});
			res.view('no_access');
		}
	})
    
};
