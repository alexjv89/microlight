/**
 * BullController
 * this controller shows things that are in the queue
 * @description :: Server-side logic for managing queues
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var async = require('async');

var Bull = require( 'bull' );
// create our job queue

module.exports = {
	index:function(req,res){
		var queue = new Bull(req.params.queue,{redis:sails.config.bull.redis});
		var job_stats=[];
		queue.getJobCounts().then(function(counts){
			queue.getRepeatableJobs().then(function(repeats){
				var locals={
					job_stats:[],
					overall_stats:counts,
					repeats: repeats,
					moment: require('moment-timezone'),
					layout: 'bull/layout'
				}
				res.view('bull/index',locals);
			})
		});
	},
	listItems:function(req,res){
		var queue = new Bull(req.params.queue,{redis:sails.config.bull.redis});
		// var JSON = require('flatted');
		console.log('\n\n\n\n\n\n======================');
		console.log('inside listItemsInBull');
		var n = req.query.n?req.query.n:100;
		var page = req.query.page?req.query.page:1;
		var state = req.params.state?req.params.state:'active'
		var order_by=req.query.order_by?req.query.order_by:'asc';
		var start = (page-1)*n;
		var end = page*n-1;
		if(state!='active'&&state!='failed'&&state!='inactive'&&state!='complete'&&state!='delayed')
			return res.send('invalid state');
		var getJobs;
		switch(state){
		case 'active':
			getJobs=queue.getActive(start,end);
			break;
		case 'failed':
			getJobs=queue.getFailed(start,end);
			break;
		case 'inactive':
			getJobs=queue.getWaiting(start,end);
			break;
		case 'complete':
			getJobs=queue.getCompleted(start,end);
			break;
		case 'delayed':
			getJobs=queue.getDelayed(start,end);
			break; 
		}
		console.log('came until here');
			
		getJobs.then(function(jobs){
			
			var new_jobs=[];
			jobs.forEach(function(job){
				if(job){	
					var nj=JSON.parse(JSON.stringify(job));
					nj.timestamp=BullService.timeAgo(parseInt(job.timestamp));
					nj.processedOn=BullService.timeAgo(parseInt(job.processedOn));
					nj.finishedOn=BullService.timeAgo(parseInt(job.finishedOn));
					new_jobs.push(nj);
				}
			});
			var locals={
				state:req.params.state,
				jobs:new_jobs,
				o_jobs:jobs,
				layout: 'bull/layout'
			}
			// res.send(locals);
			res.view('bull/list_items',locals);
		});
	},
	retryJob:function(req,res){
		var queue = new Bull(req.params.queue,{redis:sails.config.bull.redis});
		var job_id=req.body.job_id?req.body.job_id:'';
		console.log(job_id);
		if(job_id=='')
			return res.send(400,'bad request');
		queue.getJob(job_id).then(function(job){
			job.retry().then(function(){
				console.log('Making job inactive now #%d', job.id);
				res.send(200,'ok')
			})
		});
	},
	deleteJob:function(req,res){
		var queue = new Bull(req.params.queue,{redis:sails.config.bull.redis});
		var job_id=req.body.job_id?req.body.job_id:'';
		console.log(job_id);
		if(job_id=='')
			return res.send(400,'bad request');
		queue.getJob(job_id).then(function(job){
			job.remove().then(function(){
				console.log('removed completed job #%d', job.id);
				res.send(200,'ok')
			})
		});
	},
	restartQueueConnection:function(req,res){
		var queue = new Bull(req.params.queue,{redis:sails.config.bull.redis});
		sails.config.queue.close().then(function(){
			sails.config.queue=new Bull('queue',{redis:sails.config.bull.redis});
		}).catch(function(err){
			console.log(err);
		})
	},
	deleteRepeatJob: function(req, res){
		var queue = new Bull(req.params.queue,{redis:sails.config.bull.redis});
		var name = req.body.name?req.body.name:'';
		if(!name)
			return res.send(400,'bad request');
		queue.removeRepeatableByKey(name).then(function(r){
			console.log('removed completed job #%d', r);
			res.send(200,'ok')
		});
	},
	addJob:async function(req,res){
		var queue = new Bull(req.params.queue,{redis:sails.config.bull.redis});
		if(typeof req.body.data =='string')
			req.body.data=JSON.parse(req.body.data)
		await queue.add(req.body.name,req.body.data);
		res.send('ok');
		// res.redirect('/bull/'+req.params.queue);
	},
	recreateJob:async function(req,res){
		var queue = new Bull(req.params.queue,{redis:sails.config.bull.redis});
		var locals={
			moment: require('moment-timezone'),
			layout: 'bull/layout'
		}
		locals.job = await queue.getJob(req.params.job_id);
		res.view('bull/recreate_job',locals);
	}
};
