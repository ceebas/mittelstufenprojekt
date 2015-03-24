module.exports = function(nodemailer, port, bcrypt) {
	return {
		sendEmail : function(user) {
	        //do sth
	        if (user != undefined) {
	        	var stringToSend = "Hallo " + user.username + "!\n\nBitte klicke auf den folgenden Link, um deine Registrierung abzuschließen:\n\n";
	        	stringToSend += "<a href='http://localhost:" + port + "/sendEmail?email=" + bcrypt.hashSync(user.email, null, null) + "'>Bitte hier klicken!</a>\n\n";
	        	stringToSend += "Viel Spaß wünscht Dein WeLoveGames Team ;)";
	        	var transporter = nodemailer.createTransport({
			    	service: 'Gmail',
			    	auth: {
			        	user: 'izwodm@gmail.com',
			        	pass: 'izwodmkal'
			    	}
				});
				var mailOptions = {
			    	from: 'WeLoveGames <izwodm@gmail.com>', // sender address
			    	to: user.email,// list of receivers
			    	//to: 'ses@i2dm.de',
			    	subject: 'Deine Registrierung bei WeLoveGames', // Subject line
			    	text: stringToSend
			    	//html: stringToSend // plaintext body
				};
				transporter.sendMail(mailOptions, function(error, info){
			    	if(error){
			        	console.log(error);
			    	}else{
			        	console.log('Message sent: ' + info.response);
			    	}
				});
	        }
		}
	}
}