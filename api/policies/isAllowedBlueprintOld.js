
// policy for allowing access to blueprint APIs
module.exports = function (req, res, next) {
	delete req._sails.hooks.pubsub;
	if (req.isAuthenticated()) {
		var gstin =req.query.gstin||_.get(req.body,'gstin')
		async.auto({
			getAllAccess:function(callback){
				Access.find({user:req.user.id}).populate('gstin').sort('createdAt DESC').exec(callback);
			}
		},function(err,results){
			var gstins=[];
			results.getAllAccess.forEach(function(access){
				gstins.push({
					id:access.gstin.id,
					gst_no:access.gstin.value
				})
			})
			if(!gstin)
				res.json(400,{
					message:'gstin must be specified in query params or body params. The following are the gstin numbers that you have access to.',
					gstins:gstins,
				})
			var grant_access=false;
			gstins.forEach(function(acc_gst){
				if(acc_gst.id==gstin || acc_gst.gst_no==gstin){
					grant_access=true;
					// incase regular gstnumber is used, then set the gst
					if(req.query.gstin==acc_gst.gst_no)
						req.query.gstin=acc_gst.id;
					if(req.body && req.body.gstin==acc_gst.gst_no)
						req.body.gstin=acc_gst.id;
				}
			})
			if(grant_access)
				return next();
			else
				res.json(400,{
					message:'You dont have access to the requested GST number. The following are the gstin numbers that you have access to.',
					gstins:gstins,
				})
		})
		
	}
	else if (req.query.secret && req.query.secret== 'asdfasfljalksdfnaisnfiansdflkjansvlkjcnsdlifnsdlakjfnlasndfll'){
		delete req.query.secret;
		return next();
	}else{
		return res.json(400, {
			status: 'Failure',
			message: 'You dont have permission to access this'
		});
	} 

};
