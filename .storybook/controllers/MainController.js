var ejs=require('ejs');
var GeneralService=require('../services/GeneralService.js');
module.exports={
	viewPage:function(req,res){
		console.log('view page');
		var props={};
		var component,story;
		app.config.components.forEach(function(c){
			if(c.slug==req.query.component){
				component=c;
				c.stories.forEach(function(s){
					if(s.slug==req.query.story){
						story=s;
						props=s.args;
					}
				})
			}
		})
		// console.log(component.slug);
		var markdownit = require('markdown-it');
		const md = markdownit();
		var locals={
			component:req.query.component,
			story:req.query.story,
			props:props, // props for the component
			docs:{
				component:md.render(GeneralService.cleanMD(component?.docs||'Component documentation missing')),
				story:md.render(GeneralService.cleanMD(story?.docs||'Story documentation missing')),
			}
		}
		
		ejs.renderFile('.storybook/views/landing_page.ejs', locals, function(err, str) {
			var html ='';
		    if (!err)
	    		html = str;
		    else 
		        console.log(err);
		    res.send(html);
		});
	},
	embedComponent:function(req,res){
		console.log('view component');
		// var component = 'partials/test.ejs'


		// console.log(app.config);
		var component = null;
		var story = null;
		// console.log(req.query);
		app.config.components.forEach(function(c){
			if(c.slug==req.query.component){
				component=c;
				c.stories.forEach(function(s){
					if(s.slug==req.query.story)
						story=s;
				})
			}
		})

		// console.log(component);
		var locals={
			component:component,
			story:story,
		}
		// console.log(locals);
		
		ejs.renderFile('.storybook/views/load_component.ejs', locals, function(err, str) {
			var html ='';
		    if (!err)
	    		html = str;
		    else 
		        console.log(err);
		    res.send(html);
		});
	}
}