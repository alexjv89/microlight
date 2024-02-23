/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var async = require('async');
const moment = require('moment-timezone');

const fs = require('fs');
const AWS = require('aws-sdk');

var Bull = require( 'bull' );
var queue = new Bull('queue',{redis:sails.config.bull.redis});


module.exports = {
	landingPage:function(req,res){		
		if(req.user){
			var lastVisitedPage = res.locals.lastVisitedPage;

			if (lastVisitedPage && req.url !== lastVisitedPage) {
				return res.redirect(`${lastVisitedPage}`);
			}
			else{
				return res.redirect('/orgs');
			}
		}
		res.redirect('/login');
	},
	selectOrg:function(req,res){
		async.auto({
			getAllMemberships:function(callback){
				Member.find({user:req.user.id}).populate('org').exec(callback);
			},
		},function(err,results){
			if(err)
				return res.handleError(err);

			var locals={
				title:'Select Org',
				memberships:results.getAllMemberships,
			}
			res.view('select_org',locals);	
		});
	},
	createOrg:function(req,res){
		var locals={
			org:{},
			message:'',
		};
		if(req.body){
			console.log(req.body);
			// create firm
			// add this user as the client
			async.auto({
				createOrg:function(callback){
					Org.create(req.body).fetch().exec(callback);
				},
				createMembershipForUser:['createOrg',function(results,callback){
					var member={
						type:'albert_agent',
						user:req.user.id,
						org:results.createOrg.id,
					}
					Member.create(member).exec(callback);
				}]
			},function(err,results){
				if (err)
					throw err;
				res.redirect(`/org/${results.createOrg.id}`);
			})
		}else{
			res.view('org/create_org',locals);
		}	
	},
}