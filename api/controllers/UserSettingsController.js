module.exports={
	general:function(req,res){
		var filter ={
		}
		if(!req.body){
			
			const moment = require('moment-timezone');
			console.log(moment.tz.names());
			var timezones=[];
			moment.tz.names().forEach(function(tz){
				timezones.push({
					name:tz,
					offset:moment.tz(tz).utcOffset(),
				})
			})
			timezones.sort((a, b) => {
				return a.offset - b.offset
			})
			var locals = {
				timezones:timezones,
				moment:moment,
			}
			res.view('usersettings/general',locals);
		}
		else {

			async.auto({
				updateSettings:async function(){
					var details = req.user.details || {};
					_.set(details,'settings.timezone',req.body.timezone);
					return await User.updateOne({id:req.user.id},{details:details});
				},
			}, 
			function(err,results){
				if(err)
					res.handleError(err);
				res.redirect("/settings");
			})
		}
	},
	featureFlags:function(req,res){
		var locals={};
		if(!req.body){
			res.view('mainsettings/feature_flags',locals);
		}else{
			async.auto({
				getOrg:async function(){
					var filter={
						id:req.org.id,
					}
					return await Org.findOne(filter).select(['details']);
				},
				updateFeatureFlags:['getOrg',async function(results){
					var details = results.getOrg.details;
					details.feature_flags=req.body;
					// _.set(details,'settings.feature_flags',rx);
					return await Org.updateOne({id:req.org.id},{details:details});
				}]
			},function(err,results){
				if(err)
					res.handleError(err);
				res.redirect(`/org/${req.org.id}/settings/feature_flags`);
			});
		}

	},
}