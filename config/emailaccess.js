module.exports = function(nodemailer, port, bcrypt) {
	return {
		sendEmail : function(user) {
		//do sth
		if (user != undefined) {
			var stringToSend = "<b>Hallo " + user.username + "!</b><br/><p>Bitte klicke auf den folgenden Link, um deine Registrierung abzuschließen:<br/>";
			stringToSend += "<a href='http://localhost:" + port + "/sendEmail?email=" + bcrypt.hashSync(user.email, null, null) + "'>Hier klicken!</a><br/><br/>";
			stringToSend += "Viel Spaß wünscht Dein WeLoveGames Team ;)</p>";
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
				//text: stringToSend
				html: stringToSend // plaintext body
			};
			transporter.sendMail(mailOptions, function(error, info){
				if(error){
					console.log(error);
				}else{
					//console.log('Message sent: ' + info.response);
				}
			});
		}
		}
	}
}