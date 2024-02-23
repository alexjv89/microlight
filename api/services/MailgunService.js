var mailgun = require('mailgun-js')({apiKey: sails.config.mailgun.api_key, domain: sails.config.mailgun.domain});
const axios = require('axios');
var ejs=require('ejs');
var generateBasicAuthToken = function (user, password) {
	var token = user + ":" + password;
	// Base64 Encoding -> btoa
	var hash = Buffer.from(token).toString('base64');
	return "Basic " + hash;
}
var generateHTML= function(email,cb){
	if(email.template && email.locals){
		// fs.readFile('emails/'+email.template+'.ejs','utf8', function(err,str){
		// 	email.content = ejs.render(str, email.locals, {});
		// 	cb(err,email);
		// });
		ejs.renderFile('views/emails/'+email.template+'.ejs', email.locals, function(err, str) {
			var html ='';
		    if (!err)
	    		html = str;
		    else 
		        console.log(err);
		    cb(err,html);	
		});
	}
	else
		cb('email object is malformed');
}
function findParsermail(array){
	array.forEach(mail=>{
		if(mail.split('@')[1] == 'parser.mralbert.in')
			return mail
	})
}
function transferEventMailToWebhook(mail){
	var mail_config = {
		To: mail['Delivered-To'],
		Date: mail.Date,
		From: mail.From,
		from: mail.From,
		sender: mail['X-Original-Sender'],
		Subject: mail.subject,
		subject: mail.subject,
		Received: mail.Received,
		'body-html': mail['body-html'],
		recipient: Array.isArray(mail.recipients) ? findParsermail(mail.recipients): mail.recipients,
		"Message-Id": mail["Message-Id"],
		"X-Received": mail["X-Received"],
		"body-plain": mail["body-plain"],
		"Content-Type": mail["Content-Type"],
		"stripped-html": mail["stripped-html"],
		"stripped-text": mail["stripped-text"],
		"X-Envelope-From": mail["X-Envelope-From"],
		"message-headers": mail["message-headers"],
		"attachment_count": mail["attachments"].length

	}
	return mail_config;
}

module.exports={
	sendEmail:function(options,callback){
		var data = {
			from: options.from,
			to: options.to,
			subject: options.subject,
			"h:Reply-To":"support@mralbertgst.freshdesk.com",
			// html:'<b>test</b>. this is a sample email'
		};
		if(options.cc)
			data.cc=options.cc;
		generateHTML({template:options.template,locals:options.locals},function(err,result){
			var inlineCss = require('inline-css');
			inlineCss(result, {url:' '}).then(function(html) {
				// console.log('\n\n\n\n -------- ');
				// console.log(html); 
				data.html=html;
				// callback(null);
				mailgun.messages().send(data, function (err, body) {
					console.log(body);
					callback(err,data);
				});	
			});
		})
		
	},
	findForwardedTo :function (inbound_data) {
		//check for manual forward or auto forward
		if (inbound_data.recipient.includes("@parser.mralbert.in"))
			return inbound_data.recipient.toLowerCase()
		else
			return '';
	},
	findForwardedBy: function (inbound_data) {
		//check for manual forward or auto forward
		var email = inbound_data.To.includes("@" + sails.config.mailgun.domain) ? inbound_data.sender.toLowerCase() :
			inbound_data.To.toLowerCase()
		return email;
	},
	findFilenames:function (inbound_data) {
		var count = inbound_data['attachment-count'] ? parseInt(inbound_data['attachment-count']) : 0
		var filenames = [];
		for (var i = 1; i <= count; i++) {
			filenames.push('attachment-' + i)
		};
		return filenames;
	},
	getEvents: async()=>{
		var mailguntoken = generateBasicAuthToken('api',process.env.MAILGUN_APIKEY);
		var config = {
			method: 'get',
			url: `https://api.mailgun.net/v3/${process.env.MAILGUN_INCOMING_DOMAIN}/events?limit=300&event=failed`,
			headers:{
				"Authorization": mailguntoken,
			}
		}
		return await axios(config);		
	},
	getEventMail: async(options)=>{
		var mailguntoken = generateBasicAuthToken('api',process.env.MAILGUN_APIKEY);
		var config = {
			method: 'get',
			url: options.url,
			headers:{
				"Authorization": mailguntoken
			}
		}
		var mail = await axios(config);
		return mail.data;
	},
	saveEventMail: async(data)=>{
		async.auto({
			findOrg: async()=>{
				var org_email = data.recipients;
				return await Org.findOne({ email: org_email.split('@')[0]})
			},
			createParsedEmail: ['findOrg', async(results)=>{
				var parsed_email = {
					org: results.findOrg.id,
					forwarded_by: data['From'],
					forwarded_to: data['Delivered-To'],
					message_id: data['Message-Id'],
					raw: transferEventMailToWebhook(data),
					status: 'created',
					stage:'parse',
				};
				return await Parsed_email.findOrCreate({message_id: data['Message-Id']},parsed_email)
				// Parsed_email.findOne({ message_id: data['Message-Id'] }).exec(function (err, pe) {
				// 	if (err)
				// 		callback(err);
				// 	if (pe)
				// 		callback(null, pe);
				// 	else
				// 		Parsed_email.create(parsed_email).fetch().exec(callback);
				// });
			}],
			addToEmailParseQueue: ['createParsedEmail', function (results, callback) {
				sails.config.queue.add('parse_email', results.createParsedEmail).then(function (result) {
					callback(null);
				}).catch(callback)
			}],
			//find already uploaded documents.
			findDocuments: ['createParsedEmail', function (results, callback) {
				Document.find({ parsed_email: results.createParsedEmail.id }).exec(callback);
			}],
			downloadAttachments:['findDocuments','createParsedEmail',async(results)=>{
				var filename_map = {};
				data.attachments.forEach(attachment=>{
					filename_map[attachment.name] = {
						url: attachment.url,
						"content-type": attachment["content-type"],
						"file_size": attachment['size']
					}
				})
				var filenames = _.difference(Object.keys(filename_map), _.map(results.findDocuments, 'filename'));
				var mailguntoken = generateBasicAuthToken('api',process.env.MAILGUN_APIKEY);
				await async.eachLimit(filenames,2,async(filename)=>{
					var config = {
						method: 'get',
						url: filename_map[filename].url,
						headers:{
							Authorization: mailguntoken
						},
						responseType: 'arraybuffer'
					};
					await axios(config).then(response=>{
						filename_map[filename]['downloaded_file'] = response.data;
					});	
				});
				return {filename_map:filename_map,filenames:filenames};
			}],
			uploadAttachments: ['downloadAttachments', function (results, callback) {
				var filenames = results.downloadAttachments.filenames;
				var filenames_map = results.downloadAttachments.filename_map;
				//don't upload again if already uploaded and documents created.
				var files_uploaded = []
				const AWS = require('aws-sdk');
				const fs = require('fs');
				var s3 = new AWS.S3({
					accessKeyId: sails.config.aws.key,
					secretAccessKey: sails.config.aws.secret,
					region: sails.config.aws.region
				});
				async.each(filenames, function (filename, cb) {
					const rnd = (len, chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => [...Array(len)].map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
					var params = {Bucket: sails.config.aws.bucket, 
						Key: 'mailgun'+rnd(20), 
						Body:  _.get(filenames_map[filename], `downloaded_file`),
						ContentType: _.get(filenames_map[filename], 'content-type'),
						// ContentType:u_file.type,
					};
					s3.upload(params, function(err, data) {
						data['file_name'] = filename;
						data['file_type'] = _.get(filenames_map[filename], 'content-type');
						data['file_size'] = _.get(filenames_map[filename], 'file_size');
						files_uploaded.push(data);
						cb(err, data);
					});
				}, function (err) {
					callback(err, files_uploaded);
				})
			}],
			createDocuments: ['uploadAttachments', function (results, callback) {
				var documents = [];
				async.each(results.uploadAttachments, function (uploaded, cb) {
					// var doc={
					//     // filename:u_file.filename,
					//     // filetype:results.getFileType.mime,
					//     // type:'invoice',
					//     // size:u_file.size,
					//     location:s3doc.Location,
					//     gstin:req.gstin.id
					// }
					Document.create({
						org: results.findOrg.id,
						status: 'CREATED',
						location:uploaded.Location,
						// fd: uploaded[0].fd,
						filetype: uploaded.file_type,
						filename: uploaded.file_name,
						size:uploaded.file_size,
						parsed_email: results.createParsedEmail.id,
						details: {
							source: 'email_attachment',
							// s3_bucket: sails.config.aws.bucket,
							// s3_key: uploaded[0].fd,
							// s3_size: uploaded[0].size
						}
					}).fetch().exec(function (err, document) {
						if (document)
							documents.push(document);
						cb(err);
					});
				}, function (err) {
					callback(err, documents);
				})
			}],
			addToDocumentParseQueue: ['createDocuments', async function (results) {
				var jobs =[];
				results.createDocuments.forEach(function(document){
					var job = {
						name:'parse_document',
						data:document,
					}
					jobs.push(job);
				})
				await sails.config.queue.addBulk(jobs);
			}]
		}, function (err, results) {
			if(err)
				console.log(err);
		});
	},
}