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
				return await Run.find({task:req.params.slug}).sort('createdAt DESC');
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
		async.auto({
			startRun:async function(){
				return await Run.create({
					task:req.params.slug,
					status:'running',
					user:req?.user?.id,
					logs:[],
					activities:[],
				}).fetch();		
			},
			// upload files if any
			uploadFiles:function(cb){
				var file_inputs = [];
				// figure out inputs that are files
				Object.keys(task.config.inputs).forEach(function(input){
					if(task.config.inputs[input].type=='file')
						file_inputs.push(input);
				})
				// upload all the files
				async.eachLimit(file_inputs,1,function(input,next){
					req.file(input).upload(function (err, uploadedFiles) {
						if (err) return cb(err);
						if(uploadedFiles.length)
							req.body[input]=uploadedFiles[0];
						cb(null)
					});
				},cb)
				// const fileStream = fs.createWriteStream(`./tmp/test.xlsx`);
				// await new Promise((resolve, reject) => {
				//   res.body.pipe(fileStream);
				//   res.body.on("error", reject);
				//   fileStream.on("finish", resolve);
				// });
				
			},
			runTask:['startRun','uploadFiles',async function(results){
				// var logs=[]
				var microlight={
					log:function(text){
						results.startRun.logs.push({
							timestamp:new Date(),
							text:text
						})
					},
					req:req,
				}
				var start_time=new Date();
				var inputs = _.cloneDeep(req.body);
				inputs.uploadFiles=results.uploadFiles;
				var status = 'succeeded';
				try{
					var output = await task.config.fn(microlight,inputs);
				}catch(e){
					status = 'failed';
					microlight.log(e.toString());
				}
				var end_time=new Date();
				var update = {
					status:status,
					logs:_.cloneDeep(results.startRun.logs),
					activities:[],
					duration:(end_time-start_time)/1000,
					output:output
				}
				// update the task
				await Run.updateOne({id:results.startRun.id},update);
			}],
		},function(err,results){
			console.log(results);
			res.redirect(`/task/${req.params.slug}/run/${results.startRun.id}`);
		})
	}
}