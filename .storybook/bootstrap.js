console.log('this from bootstrap');
const storiesFolder = 'views';
const fs = require('fs');

// Recursive function to get files
function getFiles(dir, files = []) {
  // Get an array of all files and directories in the passed directory using fs.readdirSync
  const fileList = fs.readdirSync(dir)
  // Create the full path of the file/directory by concatenating the passed directory and file/directory name
  for (const file of fileList) {
    const name = `${dir}/${file}`
    // Check if the current file/directory is a directory using fs.statSync
    if (fs.statSync(name).isDirectory()) {
      // If it is a directory, recursively call the getFiles function with the directory path and the files array
      getFiles(name, files)
    } else {
      // If it is a file, push the full path to the files array
      files.push(name)
    }
  }
  return files
}

const files = getFiles(storiesFolder);

app.config={
  components:[]
};
files.forEach(function(file){
	if(file.indexOf('.stories.')>-1){
    var component = require('../'+file);
    component.template=file.split(storiesFolder+'/')[1].split('.stories.')[0]+'.ejs';
    component.slug=file.split('.stories.')[0].split(storiesFolder+'/')[1];
		app.config.components.push(component);
  }
})


console.log(app.config);