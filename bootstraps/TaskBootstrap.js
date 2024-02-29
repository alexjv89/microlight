const fs = require('fs');
// var project_folder=process.cwd().replace('/node_modules/@alexjv89/microlight','');
var project_folder=process.cwd().replace('/.microlight','');
// Recursive function to get files
function getFiles(dir, tree=[]) {
	var tree=[];
	console.log('\n\n\n\n======');
	console.log(project_folder+'/'+dir);
	const fileList = fs.readdirSync(project_folder+'/'+dir); // Get an array of all files and directories in the passed directory using fs.readdirSync
	console.log(fileList);
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
				console.log('folder exists');
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
	return tree
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
	// sails.config.library=getFiles('api/tasks');
	console.log(sails.config.library);
	callback(null);
}


