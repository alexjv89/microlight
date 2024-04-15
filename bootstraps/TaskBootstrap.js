var temp = process.cwd().split('/');
temp.pop();
project_folder = temp.join('/'); // makes this global variable
const fs = require('fs');
// var project_folder=process.cwd().replace('/node_modules/@alexjv89/microlight','');
// Recursive function to get files


function getFiles(dir, tree=[]) {
	var tree=[];
	// console.log('\n\n\n\n======');
	// console.log(project_folder+'/'+dir);
	const fileList = fs.readdirSync(project_folder+'/'+dir); // Get an array of all files and directories in the passed directory using fs.readdirSync
	// console.log(fileList);
	for (const file of fileList) { // Create the full path of the file/directory by concatenating the passed directory and file/directory name
		const name = project_folder+'/'+`${dir}/${file}`
		var leaf={
			file:file,
			path:`${dir}/${file}`,
			type:fs.statSync(name).isDirectory()?'folder':'task',
			tree:[]
		}
		if (fs.statSync(name).isDirectory()) { // Check if the current file/directory is a directory using fs.statSync
			if (fs.existsSync(project_folder+'/'+leaf.path+'/microlight.folder.js')){
				// console.log('folder exists');
				leaf.config=require(project_folder+'/'+leaf.path+'/microlight.folder.js'); 
				tree.push(leaf);
				leaf.tree=getFiles(`${dir}/${file}`, leaf.tree) // If it is a directory, recursively call the getFiles function with the directory path and the files array
			} 
			// tree.push(leaf);
		} else {
			if(file.indexOf('.task.js')>-1){
				delete leaf.tree;
				leaf.config=require(project_folder+'/'+leaf.path);
				tree.push(leaf);
				sails.config.tasks.push(leaf);
			}
			// files.push(name)
		}
	}
	tree = _.sortBy(tree,function(l){ // sort the files in alphabetical order
		return l.config.name||l.file;
	})
	return tree
}
var scheduleTasks = function(){
	console.log('\n\n\n\n\n\n\n');
	console.log('Scheduling tasks');
	var CronJob = require('cron').CronJob;
	sails.config.tasks.forEach(function(task){
		// console.log(task);
		if(task.config.schedule){
			console.log(task.config.name,'scheduled for',task.config.schedule);
			var cronjob = CronJob.from({
				cronTime:task.config?.schedule?.crontime,
				onTick:async function(){
					// console.log('came here');
					
					try{
						var results = await async.auto({
							startRun:async function(){
								return await Run.create({
									task:task.config.slug,
									status:'running',
									by:'schedule',
									logs:[],
									activities:[],
								}).fetch();		
							},
							runTask:['startRun',async function(results){
								// var logs=[]
								var microlight={
									log:function(text){
										results.startRun.logs.push({
											timestamp:new Date(),
											text:text
										})
									},
									markdown:function(content){
										var dedent = require('dedent');
										var markdownit = require('markdown-it');
										const md = markdownit();
										results.startRun.logs.push({
											timestamp:new Date(),
											text:dedent(content),
											markdown:md.render(dedent(content)),
										})
									},
									json:function(obj){
										results.startRun.logs.push({
											timestamp:new Date(),
											text:JSON.stringify(obj,2,2),
											json:obj,
										})
									},
									error:function(e){
										results.startRun.logs.push({
											timestamp:new Date(),
											text:e.toString(),
											error:e,
										})
									},
								}
								var start_time=new Date();
								var inputs = _.keys(task.config?.inputs).reduce((prev,curr)=>{
									var input = task.config.inputs[curr]
									if(_.has(input,'default'))
										prev[curr] = input.default
									return prev
								},{});
								var status = 'succeeded';
								try{
									var output = await task.config.fn(microlight,inputs);
								}catch(e){
									status = 'failed';
									microlight.error(e);
								}
								var end_time=new Date();
								var update = {
									status:status,
									logs:_.cloneDeep(results.startRun.logs),
									activities:[],
									duration:(end_time-start_time)/1000,
									output:output,
									parameters:inputs
								}
								// update the task
								await Run.updateOne({id:results.startRun.id},update);
							}],
						})
						// console.log(results);
					}catch(e){
						console.log(e);
					}
					// console.log('came here 2');
				},
				start:true,
				timeZone:task.config?.schedule?.timezone,
			})
			task.cronjob=cronjob;
		}
	})
}

module.exports=function(callback){
	sails.config.tasks=[];
	// console.log('\n\n\n\n');
	// console.log(process.cwd());
	
	// console.log('project_folder',project_folder);
	sails.config.microlight=require(project_folder+'/microlight.config.js');
	sails.config.microlight.project_folder=project_folder;
	// console.log(sails.config.microlight);
	if(!sails.config.microlight.task_folder)
		sails.config.microlight.task_folder='tasks' // default
	// console.log(project_folder+'/'+sails.config.microlight.task_folder);
	sails.config.library=getFiles(sails.config.microlight.task_folder);
	scheduleTasks();
	// sails.config.library=getFiles('api/tasks');
	// console.log(sails.config.library);
	callback(null);
}


