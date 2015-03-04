-- phpMyAdmin SQL Dump
-- version 3.4.11.1deb2+deb7u1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Erstellungszeit: 04. Mrz 2015 um 14:57
-- Server Version: 5.5.40
-- PHP-Version: 5.4.35-0+deb7u2

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Datenbank: `browseagame_node`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `games`
--

CREATE TABLE IF NOT EXISTS `games` (
  `id_game` int(11) NOT NULL AUTO_INCREMENT,
  `gamename` varchar(20) DEFAULT NULL,
  `description` varchar(150) DEFAULT NULL,
  `user` int(11) DEFAULT NULL,
  `imageEnc` varchar(5) DEFAULT NULL,
  `javascript` varchar(30) DEFAULT NULL,
  `inactive` int(11) NOT NULL,
  PRIMARY KEY (`id_game`),
  KEY `user` (`user`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=28 ;

--
-- Daten für Tabelle `games`
--

INSERT INTO `games` (`id_game`, `gamename`, `description`, `user`, `imageEnc`, `javascript`, `inactive`) VALUES
(1, 'Fläppy Börd', 'Rangierer Karsten Kranich durch die Hindernisse und sammle so viele Punkte wie möglich!', 32, 'jpg', 'flappi_boerd.js', 0),
(2, 'Space Shooter', 'Stehe dem Raumschiff Entenbrei auf ihrer gefährlichen Mission an den Rand des Universums zur Seite!', 30, 'png', 'canvas.js', 0),
(22, 'Jump ''n'' Run', 'Springe über die Kästchen und erziele den Highscore!', 31, 'png', 'game.js', 0),
(23, 'Test', 'Hallo', 30, NULL, NULL, 1),
(24, 'test', 'test', 30, NULL, NULL, 1),
(25, 'test', 'test', 30, NULL, NULL, 1),
(26, 'serg', 'sdrg', 30, NULL, NULL, 1),
(27, 'sdfg', 'dfg', 30, NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `highscores`
--

CREATE TABLE IF NOT EXISTS `highscores` (
  `id_highscore` int(11) NOT NULL AUTO_INCREMENT,
  `user` int(11) DEFAULT NULL,
  `game` int(11) DEFAULT NULL,
  `score` int(11) DEFAULT NULL,
  `tStamp` datetime DEFAULT NULL,
  PRIMARY KEY (`id_highscore`),
  KEY `user` (`user`),
  KEY `game` (`game`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=79 ;

--
-- Daten für Tabelle `highscores`
--

INSERT INTO `highscores` (`id_highscore`, `user`, `game`, `score`, `tStamp`) VALUES
(1, 30, 2, 1239, '2014-11-21 15:06:15'),
(2, 30, 1, 2, '2014-11-21 15:07:23'),
(3, 30, 1, 0, '2014-11-21 15:07:28'),
(4, 30, 1, 2, '2014-11-21 15:07:36'),
(5, 30, 1, 2, '2014-11-21 15:07:47'),
(6, 30, 1, 3, '2014-11-24 09:57:24'),
(7, 30, 1, 10, '2014-11-24 09:58:03'),
(16, 30, 2, 11610, '2014-11-24 10:26:36'),
(21, 30, 1, 2, '2014-11-24 11:07:33'),
(22, 30, 1, 7, '2014-11-24 11:07:58'),
(27, 30, 1, 1, '2014-11-24 12:41:21'),
(28, 30, 1, 1, '2014-11-24 12:41:29'),
(29, 30, 1, 11, '2014-11-24 12:42:10'),
(30, 30, 1, 2, '2014-11-24 12:42:23'),
(31, 30, 1, 0, '2014-11-24 12:42:24'),
(40, 31, 22, 111, '2014-11-24 14:02:26'),
(41, 30, 22, 0, '2014-11-24 14:02:51'),
(42, 30, 22, 39, '2014-11-24 14:03:22'),
(43, 30, 22, 26, '2014-11-24 14:03:50'),
(44, 30, 22, 0, '2014-11-24 14:03:52'),
(45, 30, 22, 20, '2014-11-24 14:04:10'),
(46, 30, 22, 17, '2014-11-24 14:04:25'),
(47, 30, 22, 8, '2014-11-24 14:04:33'),
(48, 30, 22, 9, '2014-11-24 14:04:41'),
(49, 30, 22, 23, '2014-11-24 14:05:09'),
(50, 30, 22, 0, '2014-11-24 14:05:12'),
(51, 30, 22, 61, '2014-11-24 14:05:59'),
(52, 31, 2, 10800, '2014-11-24 14:12:41'),
(53, 30, 22, 59, '2014-11-24 14:23:21'),
(54, 31, 2, 7350, '2014-11-24 15:03:00'),
(55, 30, 1, 0, '2014-11-24 15:03:49'),
(56, 30, 1, 3, '2014-11-24 15:05:34'),
(57, 30, 1, 4, '2014-11-25 13:05:52'),
(58, 30, 1, 3, '2014-11-25 13:06:05'),
(59, 30, 1, 2, '2014-11-25 13:06:17'),
(60, 31, 22, 88, '2014-11-25 14:04:16'),
(61, 30, 2, 1134, '2014-12-09 12:56:35'),
(62, 30, 1, 1, '2014-12-09 14:35:48'),
(63, 30, 1, 5, '2014-12-09 14:36:07'),
(64, 32, 1, 0, '2014-12-09 15:28:26'),
(65, 32, 1, 0, '2014-12-09 15:28:31'),
(66, 32, 1, 3, '2014-12-09 15:28:45'),
(67, 31, 22, 11, '2014-12-10 10:22:23'),
(68, 32, 2, 2667, '2014-12-10 13:05:55'),
(69, 32, 2, 1074, '2014-12-10 13:14:33'),
(70, 30, 2, 1405, '2014-12-10 15:28:14'),
(71, 30, 1, 2, '2014-12-18 10:13:56'),
(72, 30, 1, 2, '2014-12-18 10:14:05'),
(73, 30, 1, 2, '2014-12-18 10:14:15'),
(74, 30, 1, 8, '2014-12-18 10:14:43'),
(75, 30, 1, 0, '2014-12-19 15:49:25'),
(76, 30, 1, 20, '2014-12-19 15:50:35'),
(77, 30, 1, 0, '2014-12-19 15:50:41'),
(78, 30, 1, 0, '2014-12-19 15:50:43');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id_user` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(200) NOT NULL,
  `inactive` int(1) NOT NULL DEFAULT '0',
  `isAdmin` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=50 ;

--
-- Daten für Tabelle `users`
--

INSERT INTO `users` (`id_user`, `username`, `email`, `password`, `inactive`, `isAdmin`) VALUES
(30, 'sebastian', 'ses@i2dm.de', '$2a$10$Lh4XtzJW2UuTy/dacCQCR.kbXVpETvscQ8VGDufF5gICchOHpt0nW', 0, 1),
(31, 'dennis', 'dk@i2dm.de', '$2a$10$28JvG/pwyk6eCQWYwij9COF/DO8sZW4N7x8q1Py/N6M0ZJ6aeXL4C', 0, 1),
(32, 'lukas', 'lt@i2dm.de', '$2a$10$k.bBy5QPZjjzmfM6UP6HSe3Pba7gNyprgSv.MkJ0US8X/Jj/vVeRi', 0, 0),
(33, 'anja', 'ah@i2dm.de', '$2a$10$DA4rVFT0wlaC1UPS/QnPfeyQCWp4WgJ.1ummmdQ/DvCYpcYRQEFee', 0, 0),
(46, 'test', 'test@i2dm.de', '$2a$10$6U7frmqDuts26D.dzBwT7uF8AqbX1E6A9kCoFUM8PB8y6nLAanKsi', 1, 0);

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `games`
--
ALTER TABLE `games`
  ADD CONSTRAINT `games_ibfk_1` FOREIGN KEY (`user`) REFERENCES `users` (`id_user`);

--
-- Constraints der Tabelle `highscores`
--
ALTER TABLE `highscores`
  ADD CONSTRAINT `highscores_ibfk_1` FOREIGN KEY (`user`) REFERENCES `users` (`id_user`),
  ADD CONSTRAINT `highscores_ibfk_2` FOREIGN KEY (`game`) REFERENCES `games` (`id_game`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
