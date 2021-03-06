/* Erforderliche Module */
var flash = require('connect-flash'),
	session = require('express-session'),
	express = require("express"),
	app = express(),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	passport = require("passport"),
    multiparty = require('multiparty'),
    fs = require('fs'),
    bcrypt = require('bcrypt-nodejs'),
    nodemailer = require('nodemailer'),
	mysql = require('mysql'),
	zip = require('node-zip')();

/*Authentifizierung*/
app.use(flash());
app.use(cookieParser());
app.use(session({
	secret: 'Alle Kinder springen über die Schlucht, nur nicht Peter - dem fehlt ein Meter',
	resave: true,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

/* Allgemeine Einstellungen */
var port = 8081;
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
var accessEmail = require('./config/emailaccess.js')(nodemailer, port, bcrypt);
var accessDb = require('./database/sqlaccess.js')(fs, bcrypt, mysql, accessEmail);
require('./config/passport')(passport, accessDb);
require('./app/routes.js')(app, passport, multiparty, nodemailer, accessDb, zip, fs);

/* Statische Auslieferung */
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use("/bootstrap-3.2.0", express.static(__dirname + "/bootstrap-3.2.0"));
app.use("/css", express.static(__dirname + "/css"));
app.use("/img", express.static(__dirname + "/img"));
app.use("/js", express.static(__dirname + "/js"));
app.use("/uploads", express.static(__dirname + "/uploads"));

//500 Handler
app.use(function(err, request, response, next) {
	response.status(500);
	response.render('500.jade', {
		err: err
	});
});

//404 Handler
app.use(function(request, response) {
    response.render('404.jade', 404);
});

app.listen(port, function() {
	console.log('node.js  ---- WE LOVE GAMES  ----  Webserver');
	console.log('* Server läuft auf localhost: ' + port + ' * \n');
});