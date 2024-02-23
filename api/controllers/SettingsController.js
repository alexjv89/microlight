module.exports={
	general:function(req,res){
		return res.redirect(`/org/${req.org.id}/settings/members`);
	},
	apiKeys:function(req,res){
		var locals={};
		if(!req.body){
			async.auto({
				getAPIKeys:async function(){
					return await API_key.find({org:req.org.id});
				}
			},function(err,results){
				if(err)
					return res.handleError(err);
				locals.api_keys=results.getAPIKeys;
				res.view('mainsettings/integrations',locals);
			})
		}else{
			async.auto({
				getOrg:async function(){
					var filter={
						id:req.org.id,
					}
					return await Org.findOne(filter).select(['details']);
				},
				updateSettings:['getOrg',async function(results){
					var details = results.getOrg.details;
					var config = _.cloneDeep(req.body);
					delete config.type;
					_.set(details,'settings.integrations.'+req.body.type,config);
					return await Org.updateOne({id:req.org.id},{details:details});
				}]
			},function(err,results){
				if(err)
					return res.handleError(err);
				res.redirect(`/org/${req.org.id}/settings/apikeys`);
			});
		}
	},
	createAPIKey:function(req,res){
		if(!req.body){
			var locals={
				form:{},
			};
			res.view('mainsettings/create_api_key',locals);
		}else{
			const rnd = (len, chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => [...Array(len)].map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
			async.auto({
				createAPIKey:async function(){
					var api_key ={
						name:req.body.name,
						expires_at:(req.body.expires_at!='')?req.body.expires_at:null,
						key:'cf_app_'+rnd(18),
						secret:rnd(24),
						org:req.org.id
					}
					await API_key.create(_.cloneDeep(api_key));
					return api_key;
				}

			},function(err,results){
				if(err)
					return res.handleError(err);
				var locals={
					form:{
						state:'success',
					},
					api_key:results.createAPIKey,
				};
				res.view('mainsettings/create_api_key',locals);
			})
		}
	},
	deleteAPIKey:function(req,res){
		var filter={id:req.params.k_id,org:req.org.id};
		API_key.findOne(filter).exec(function(err,api_key){
			if(err)
				throw err;
			if(!api_key)
				return res.send('This api_key does not exist');
			var locals={
				api_key:api_key
			};
			if(req.body){
				async.auto({
					deleteAPIKey:async function(){
						var filter={id:req.params.k_id,org:req.org.id};
						return await API_key.destroyOne(filter);
					},
				},function(err,results){
					if(err)
						return res.handleError(err);
					res.redirect(`/org/${req.org.id}/settings/apikeys`);
				})
			}else{
				res.view('mainsettings/delete_api_key',locals);
			}
		});
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
	members:function(req,res){
		async.auto({
			getAllMembers:function(callback){
				Member.find({org:req.org.id}).sort('createdAt DESC').populate('user').exec(callback);
			},
		},function(err,results){
			if(err)
				throw err;
			var locals={};
			locals.members=results.getAllMembers;
			res.view('mainsettings/members',locals);
		});
	},
	createMembership:function(req,res){
		async.auto({
			createMembership:async function(){
				var member={
					type:req.body.type,
					user:req.body.user_id,
					org:req.org.id,
				}
				return await Member.create(member).fetch();
				
			},
			// sendEmail:async function(){
			// 	var data={
			// 		title:'Send Email - Add user to org',
			// 		options:{
			// 			template:'add_user_to_org',
			// 			org:req.org.id,
			// 			user:req.body.user_id,
			// 		},
			// 	};
			// 	await queue.add('send_transactional_email',data);
			// }
			findUser:['createMembership',async function(results){
				var user = await User.findOne({ where: {id: results.createMembership.user }, })
				return user
			}],
			findOrg:['createMembership',async function(results){
				var org = await Org.findOne({ where: {id: results.createMembership.org }, })
				return org
			}],	
			sendMail:['createMembership','findUser','findOrg', function(results, cb){
				var url = sails.config.app_url + '/org/'+ req.org.id;
				var opts={
					template:'add_user_to_org',
					to:results.findUser.email,
					from:'Cashflowy<no-reply@cashflowy.io>',
					subject: 'Add user to org',
					locals:{
						user: results.findUser,
						org:results.findOrg,
						url:url
					}
				}
				MailgunService.sendEmail(opts,function(err){
					cb(err)
				})
			}]
			
		},function(err,results){
			if(err)
				return res.handleError(err);
			res.send({success:'success'})
		});
	},
	revokeMembership:function(req,res){
		async.auto({
			revokeMembership:async function(){
				return await Member.destroyOne({id:req.params.m_id,org:req.org.id});
			}
		},function(err,results){
			if(err)
				return res.handleError(err);
			res.send({success:'success'})
		})
		
	},
	usage:function(req,res){
		async.auto({
			getMetabaseUrl:async function(){
				var options={
					dashboard:13,
					params:{
						org:req.org.id+'',
						// month:new Date().toISOString().substring(0,7),
					}
				}
				var metabase_url = MetabaseService.getDashboard(options);
				var temp = metabase_url.split('#');
				temp[0]+='?month='+new Date().toISOString().substring(0,7);
				metabase_url = temp.join('#');
				return metabase_url;
			}
		},function(err,results){
			if(err)
				return res.handleError(err);
			var locals={
				mb_url:results.getMetabaseUrl,
			}
			res.view('mainsettings/usage',locals)
		})
	},
	getOrg:function(req,res){
		async.auto({
			getOrg:async function(){
				return await Org.findOne({ where: {id: req.params.o_id }})
			},
		},function(err,results){
			if(err)
				res.send(err)
			var moment = require('moment')
			var locals={
				org:results.getOrg,
				moment:moment
			}
			res.view('mainsettings/get_org', locals)
		})
	},
	editOrg:function(req,res){
		async.auto({
			getOrg:async function(){
				var org_id = req.params.o_id
				return await Org.updateOne({ where: {id: org_id }},{name:req.body.name})
			},
		},function(err,results){
			if(err)
				return res.handleError(err);
			return res.redirect(`/org/${req.org.id}/settings/general`);
		})
	},
	deleteOrg:function(req,res){
		async.auto({
			getOrg:async function(){
				var org_id = req.params.o_id
				// return await Org.destroyOneOne({ where: {id: org_id }})
			},
		},function(err,results){
			if(err)
				return res.handleError(err);
			return res.redirect('/orgs');
		})
	},
}