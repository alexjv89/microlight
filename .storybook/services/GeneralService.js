module.exports={
	// removes leading spaces in lines in markdown
	// makes it possible to write multi like markdown in a json object which is intended at any level
	cleanMD:function(md){
		if(!md)
			md='<empty>';
		var lines = md.split('\n');
		var trimmed_lines=[];
		lines.forEach(function(line){
			trimmed_lines.push(line.trim())
		})
		return trimmed_lines.join('\n');
	}
}