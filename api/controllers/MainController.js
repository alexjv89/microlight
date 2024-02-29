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
	
	viewTask:function(req,res){
		async.auto({
			getRuns:async function(){
				return await Run.find({id:req.params.r_id}).sort('createdAt DESC');
			}
		},function(err,results){
			if(err)
				throw err;
			var locals={
				runs:results.getRuns
			}
			res.view('view_task',locals);
		})
	},
	viewRun:function(req,res){
		async.auto({
			getRun:async function(){
				return await Run.findOne({id:req.params.r_id});
			}
		},function(err,results){
			if(err)
				throw err;
			var locals={
				run:results.getRun
			}
			res.view('view_run',locals);
		})
	},
	viewFolder:function(req,res){
		
		var tree = sails.config.library;

		var locals={
			title:'Library',
			tree,
		}
		res.view('view_folder',locals);	
	},
	executeTask:async function(req,res){
		console.log(req.body);
		console.log(req.params.slug);
		var task = {};

		sails.config.tasks.forEach(function(t){
			if(t.config.slug==req.params.slug)
				task = t;
		})
		console.log(task);
		var run = await Run.create({
			task:req.params.slug,
			status:'running',
			user:req?.user?.id,
			logs:[],
			activities:[],
		}).fetch();
		var microlight={
			log:function(text){
				run.logs.push({
					timestamp:new Date(),
					text:text
				})
			}
		}
		var results = await task.config.fn(microlight,req.body);
		var update = {
			status:'succeeded',
			logs:run.logs,
			activities:[]
		}
		await Run.updateOne({id:run.id},update);
		console.log(results);
		res.redirect(`/task/${req.params.slug}/run/${run.id}`);
	}
}