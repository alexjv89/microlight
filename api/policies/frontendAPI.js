
// policy for allowing member to blueprint APIs
module.exports = function (req, res, next) {
	delete req._sails.hooks.pubsub;
	if (req.isAuthenticated()) {
		async.auto({
			getOrg:async function(){
				return await Org.findOne({id:req.params.o_id});
			},
			getMembership:async function(){
				return await Member.findOne({user:req.user.id,org:req.params.o_id});
			},
			// this is needed for the UI
			getAllMembership:function(callback){
				Member.find({user:req.user.id}).populate('org').exec(callback);
			}
		},function(err,results){
			if(err)
				return res.handleError(err);
			if(!results.getMembership)
				return res.status(401).send('Unauthorized');
			req.org=results.getOrg;
			req.user.membership = results.getMembership;
			req.user.memberships = results.getAllMembership;
			req.doer='user';
			return next();
		})
		
	}
	else if(req.headers['api-key'] && req.headers['api-secret']){
		if(req.headers['api-key']==process.env.CF_API_KEY_RUNDECK){
			if(req.headers['api-secret']!=process.env.CF_API_SECRET_RUNDECK)
				return res.status(401).send('Unauthorized: API key and secret does not match');
			else{
				req.org = null;
				req.doer='cf_api';
				return next();
			}
		}else{
			async.auto({
				getAPIKey:async function(){
					return await API_key.findOne({key:req.headers['api-key']}).populate('org');
				},
			},(err,results)=>{
				if(err)
					return res.handleError(err);
				if(!results.getAPIKey)
					return res.status(401).send('Unauthorized: API key not found');
				var bcrypt = require('bcryptjs');
				if(!bcrypt.compareSync(req.headers['api-secret'], results.getAPIKey.secret))
					return res.status(401).send('Unauthorized: API key and secret does not match');
				var org_id =req.params.o_id || req.query.org_id;
				if(_.get(results,'getAPIKey.org.id')!=org_id)
					return res.status(401).send(`Unauthorized: You cannot access this org(${req.params.o_id || req.query.o_id}) with the given API key/secret.`);
				req.org = _.get(results,'getAPIKey.org');
				req.doer='api';
				req.api_key=results.getAPIKey;
				return next();
			})
		}
	}
	else{
		res.set('hr_status','access_denied')
		res.redirect('/login?redirect='+encodeURIComponent(req.url));
	} 

};