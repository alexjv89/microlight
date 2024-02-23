// /**
//  * BullBootstrap.js
//  * Bootstrap module that setups the queue and worker
//  */
// const async = require('async');

// var Bull = require('bull');
// // create our job queue
// var queue = new Bull('cashflowy', {
// 	redis: sails.config.bull.redis,
// 	settings:{
// 		backoffStrategies:{
// 			rundeckJob:function(attemptsMade, err,options){
// 				if (!options) {
// 					options = {}
// 				}
// 				if(options.backoff) { // if backoff is specified
// 					return backoff;
// 				}else{
// 					const avg_run_time = options.avg_run_time || 1*60*1000;
// 					return avg_run_time * 1.5;
// 				}
// 			}
// 		}
// 	}
// });
// sails.config.queue = queue;

// var loadRepeatTasks = function(){
// 	_.forEach(sails.config.bull.repeats, function (task) {
// 		if (task.active) {
// 			queue.add(task.name, task.data, {
// 				repeat: task.repeat
// 			});
// 			sails.log.info(`bull repeatable job registered: ${task.name}`);
// 		}
// 	});
// }



// module.exports = function (callback) {
// 	// Registering repeat jobs specified in config/bull.js
// 	// this gets all executions from rundeck
// 	queue.process('rundeck_fetch_executions', 1, async function (job) {
// 		return await RundeckService.fetchExecutions(job.data.options);
// 	});
// 	queue.process('rundeck_fetch_one_execution', 1, async function (job) {
// 		return await RundeckService.fetchOneExecution(job.data.options);
// 	});

// 	// this gets all execution from our database that are incomplete and tries to get the data from rundeck
// 	queue.process('rundeck_fetch_executions2', 1, async function (job) {
// 		return await RundeckService.fetchExecutions2(job.data.options);
// 	});
// 	queue.process('rundeck_fetch_one_execution2', 1, async function (job) {
// 		return await RundeckService.fetchOneExecution2(job.data.options);
// 	});



// 	/**
// 	 * Marketing related queues
// 	 */
// 	queue.process('marketing_update_connectors', 1, async function (job) {
// 		return await MarketingService.updateMarketingConnectors(job.data.options);
// 	});

// 	queue.process('marketing_update_jobs', 1, async function (job) {
// 		return await MarketingService.updateMarketingJobs(job.data.options);
// 	});

// 	// queue.process('start_queued_jobs', 1, async function (job) {
// 	// 	// console.log('this is running every 10 secs');
// 	// 	return await RundeckService.startQueuedJobs(job.data.options);
// 	// });

// 	queue.process('run_job', 1, async function (job) {
// 		return await RundeckService.runJob(job.data.options);
// 	});

// 	// queue.add('rundeck_fetch_executions',{max:100,recent_filter:'3h'},{repeat: { cron: "0 1 * * *" }});
	
// 	// loadRepeatTasks();
// 	// setInterval(function () {
// 	// 	console.log('yo');
// 	// 	loadRepeatTasks();
// 	// }, 1000*60*5);



// 	callback(null);
// };