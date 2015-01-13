/* Erforderliche Module */
var morgan = require('morgan'),
	flash = require('connect-flash'),
	session = require('express-session');

var express = require("express"),
	app = express(),
	mysql = require('mysql'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	passport = require("passport"),
	jade = require('jade'),
	LocalStrategy = require("passport-local").Strategy,
    multiparty = require('multiparty'),
    fs = require('fs');
    //http = require('http'),
    //util = require('util');

app.use(morgan('dev'));
app.use(flash());
/*Authentifizierung*/
app.use(cookieParser());
app.use(session({ secret: 'Alle Kinder springen über die Schlucht, nur nicht Peter - dem fehlt ein Meter'}));
app.use(passport.initialize());
app.use(passport.session());

/* Allgemeine Einstellungen */
var port = 8081;

/* Statische Auslieferung */
app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: true }));

require('./config/createDatatables')();
require('./config/passport')(passport);
require('./app/routes.js')(app, passport, fs, multiparty);

/* Zugriffsrechte fuer express */
app.use("/bootstrap-3.2.0", express.static(__dirname + "/bootstrap-3.2.0"));
app.use("/css", express.static(__dirname + "/css"));
app.use("/img", express.static(__dirname + "/img"));
app.use("/js", express.static(__dirname + "/js"));


app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500).send('Es ist ein fehler aufgetreten');
});
console.log('node.js  ---- Mittelstufenprojekt  ----  Webserver');

app.listen(port);
console.log('* Server läuft auf localhost: ' + port + ' * \n');