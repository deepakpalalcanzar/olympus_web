# ************************************************************
# Sequel Pro SQL dump
# Version 3408
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: 127.0.0.1 (MySQL 5.5.31-0ubuntu0.12.04.1)
# Database: olympus
# Generation Time: 2013-07-25 18:42:17 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table account
# ------------------------------------------------------------

DROP TABLE IF EXISTS `account`;

CREATE TABLE `account` (
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `verified` tinyint(1) DEFAULT NULL,
  `verificationCode` varchar(255) DEFAULT NULL,
  `avatar_fname` varchar(255) DEFAULT NULL,
  `avatar_mimetype` varchar(255) DEFAULT NULL,
  `isAdmin` tinyint(1) DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT NULL,
  `deleteDate` datetime DEFAULT NULL,
  `isLocked` tinyint(1) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  `shareId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=latin1;

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;

INSERT INTO `account` (`email`, `password`, `name`, `phone`, `title`, `verified`, `verificationCode`, `avatar_fname`, `avatar_mimetype`, `isAdmin`, `deleted`, `deleteDate`, `isLocked`, `id`, `createdAt`, `updatedAt`, `shareId`)
VALUES
	('admin@olympus.io','$2a$10$i53exTjfPkyxCZB/ypccn.w9QSkh3JKYcT7CJZbq5.kwlmGzcgf1i','Admin','5129131386','Sales Guy',1,NULL,'1-cd3fc320-f3be-11e2-a0f4-8d2818960730','image/png',1,0,NULL,0,1,'2013-05-07','2013-07-23',NULL);

/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table accountdeveloper
# ------------------------------------------------------------

DROP TABLE IF EXISTS `accountdeveloper`;

CREATE TABLE `accountdeveloper` (
  `api_key` varchar(255) DEFAULT NULL,
  `account_id` int(11) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `access_token` varchar(255) DEFAULT NULL,
  `refresh_token` varchar(255) DEFAULT NULL,
  `code_expires` datetime DEFAULT NULL,
  `access_expires` datetime DEFAULT NULL,
  `refresh_expires` datetime DEFAULT NULL,
  `scope` int(11) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=latin1;

LOCK TABLES `accountdeveloper` WRITE;
/*!40000 ALTER TABLE `accountdeveloper` DISABLE KEYS */;

INSERT INTO `accountdeveloper` (`api_key`, `account_id`, `code`, `access_token`, `refresh_token`, `code_expires`, `access_expires`, `refresh_expires`, `scope`, `id`, `createdAt`, `updatedAt`)
VALUES
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',1,'','baudzVitCraHCB1','abcdefg','2020-01-01 00:00:00','2020-01-01 00:00:00','2020-01-01 00:00:00',3,1,'2013-05-07','2013-05-07'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',1,'SNNqo8Wq7sm5TNd','7UaZaLtVzDQEluJ','RxHC2W8aKZC1nlx','2013-07-10 18:50:42','2013-07-10 19:50:12','2013-07-24 18:50:12',NULL,2,'2013-07-10','2013-07-10'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',1,'e0CaAFuAUVMDtZT','NAkGR14T3Lqni1E','rg80wV213Ehna5D','2013-07-10 19:10:08','2013-07-10 20:09:38','2013-07-24 19:09:38',NULL,3,'2013-07-10','2013-07-10'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',1,'P8rmsqeoFasn1AB','6Z7KVqQa6Ln8Jrg','rTrlfCgnl0y1WsS','2013-07-10 19:12:21','2013-07-10 20:11:51','2013-07-24 19:11:51',NULL,4,'2013-07-10','2013-07-10'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',1,'agD81K7pGXAGcTO','6epRwACRbm5eO57','AT794uod00q19Jv','2013-07-10 21:20:26','2013-07-10 22:19:56','2013-07-24 21:19:56',NULL,5,'2013-07-10','2013-07-10'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',10,'CswG73XvGH4UDnt','3iSlC0avLdspQm0','hbASCilSemrEOl9','2013-07-10 21:23:16','2013-07-10 22:22:46','2013-07-24 21:22:46',NULL,6,'2013-07-10','2013-07-10'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',9,'oZskDTbkKV4su2u','xS7NxcMHWpS32ss','4aBgWmFcTUHUTMJ','2013-07-10 21:24:55','2013-07-10 22:24:25','2013-07-24 21:24:25',NULL,7,'2013-07-10','2013-07-10'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',9,'pM914ZWEaeQzotq','DUcqtETApOSwqPT','B6JwHCW2mivQzfa','2013-07-10 21:44:26','2013-07-10 22:43:56','2013-07-24 21:43:56',NULL,8,'2013-07-10','2013-07-10'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',1,'9A1osipPToGSNiC','OhemyX1J8PMLLl5','CGO7w5sBUKJ2C4b','2013-07-16 21:40:56','2013-07-16 22:40:26','2013-07-30 21:40:26',NULL,9,'2013-07-16','2013-07-16'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',1,'ZaR99ln2p2RbKI7','OuosARUdWJE4Blr','9o1oJsTbcfGiiks','2013-07-16 21:41:11','2013-07-16 22:40:41','2013-07-30 21:40:41',NULL,10,'2013-07-16','2013-07-16'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',11,'DBrO1XST7eKIyV6','I3psk2G5X14h3H6','BiiKs7ZJQcWMkV0','2013-07-17 13:53:31','2013-07-17 14:53:01','2013-07-31 13:53:01',NULL,11,'2013-07-17','2013-07-17'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',11,'s7E2LlPhJqQ10Tu','AwHVTqzTVltMfDn','rNoTmqcUGd4b8rJ','2013-07-17 13:59:31','2013-07-17 14:59:01','2013-07-31 13:59:01',NULL,12,'2013-07-17','2013-07-17'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',11,'UMhuwgA9ncS4Kvd','wbAXPtbaO7yrA23','KOS31718ydMViJX','2013-07-17 21:28:40','2013-07-17 22:28:10','2013-07-31 21:28:10',NULL,13,'2013-07-17','2013-07-17'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',11,'oDUFPq4ZTmPAE3L','0ygdIwTvJTu4GSK','v2z9Vbs3ZHaLAHU','2013-07-18 15:21:09','2013-07-18 16:20:39','2013-08-01 15:20:39',NULL,14,'2013-07-18','2013-07-18'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',11,'zTJQZQOCCuoTDhi','Gq0xTesdAUQ7XVM','pxZtTliybtpZ5tr','2013-07-19 18:40:51','2013-07-19 19:40:21','2013-08-02 18:40:21',NULL,15,'2013-07-19','2013-07-19'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',11,'Ph0NVdWhKRRQPi4','t0B8RcEpp8ki3OS','wMbS96W1FvuoTMU','2013-07-19 19:42:17','2013-07-19 20:41:47','2013-08-02 19:41:47',NULL,16,'2013-07-19','2013-07-19'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',11,'WsuTSIZy99e327v','oquWooysoUlPJ2F','6PIQQCcPrByoUPD','2013-07-19 20:09:29','2013-07-19 21:08:59','2013-08-02 20:08:59',NULL,17,'2013-07-19','2013-07-19'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',11,'kJS4K21r5lJ6HdR','hmI7gZNsfuWIXDs','CsV4pFrD5zDvme1','2013-07-19 21:08:11','2013-07-19 22:07:41','2013-08-02 21:07:41',NULL,18,'2013-07-19','2013-07-19'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',11,'qxrUVfWZ9PNidxL','ogybcLroxqMQ1Lz','pvILIy0oSwPDQz7','2013-07-22 17:12:09','2013-07-22 18:11:39','2013-08-05 17:11:39',NULL,19,'2013-07-22','2013-07-22'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',11,'5Ihth9qTNLJePQ3','Vi3bp8TRkhFQC3n','u0A5wJNQ18i9PZo','2013-07-22 18:24:02','2013-07-22 19:23:32','2013-08-05 18:23:32',NULL,20,'2013-07-22','2013-07-22'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',1,'irTAQ2QFLG4yh04','AwwhAi7eTXH8JDE','MEsixQJxLeNizHA','2013-07-22 22:24:58','2013-07-22 23:24:28','2013-08-05 22:24:28',NULL,21,'2013-07-22','2013-07-22'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',1,'xfurkFLwKnTmvx4','RldBIGA80OLPsTZ','0sTupFfA8dWttkb','2013-07-22 22:26:40','2013-07-22 23:26:10','2013-08-05 22:26:10',NULL,22,'2013-07-22','2013-07-22'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',9,'bFHlCTm0LBctdAl','8dBhrflLM3Q5msq','m1HZcENZLZpyc46','2013-07-22 22:28:54','2013-07-22 23:28:24','2013-08-05 22:28:24',NULL,23,'2013-07-22','2013-07-22'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',57,'Iqwz0pzqhqHPlKR','qNbntwMok18bagB','Civs38xThC5o45o','2013-07-23 20:13:35','2013-07-23 21:13:05','2013-08-06 20:13:05',NULL,24,'2013-07-23','2013-07-23'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',57,'CD1VdqVFKvO92I9','wEXLvQ9rMm89hyT','Tv74clQLA3B2BR5','2013-07-23 20:16:08','2013-07-23 21:15:38','2013-08-06 20:15:38',NULL,25,'2013-07-23','2013-07-23'),
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2',57,'829KBnexKpbwPPH','vT1XReXuuhAsZRI','wH5wrAwE2yzFWg1','2013-07-23 20:19:33','2013-07-23 21:19:03','2013-08-06 20:19:03',NULL,26,'2013-07-23','2013-07-23');

/*!40000 ALTER TABLE `accountdeveloper` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table comment
# ------------------------------------------------------------

DROP TABLE IF EXISTS `comment`;

CREATE TABLE `comment` (
  `payload` varchar(255) DEFAULT NULL,
  `AccountId` int(11) DEFAULT NULL,
  `DirectoryId` int(11) DEFAULT NULL,
  `FileId` int(11) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=latin1;



# Dump of table developer
# ------------------------------------------------------------

DROP TABLE IF EXISTS `developer`;

CREATE TABLE `developer` (
  `api_key` varchar(255) DEFAULT NULL,
  `api_secret` varchar(255) DEFAULT NULL,
  `app_name` varchar(255) DEFAULT NULL,
  `redirect_url` varchar(255) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

LOCK TABLES `developer` WRITE;
/*!40000 ALTER TABLE `developer` DISABLE KEYS */;

INSERT INTO `developer` (`api_key`, `api_secret`, `app_name`, `redirect_url`, `id`, `createdAt`, `updatedAt`)
VALUES
	('3y6gp1hz9de7cgvkn7xqjb3285p8udf2','ctDv8bIUmdJtChHP357xJ1ZspKh32rwq','Test API App','http://www.pigandcow.com/olympus_test_api_app',1,'2013-05-07','2013-05-07');

/*!40000 ALTER TABLE `developer` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table directory
# ------------------------------------------------------------

DROP TABLE IF EXISTS `directory`;

CREATE TABLE `directory` (
  `name` varchar(255) DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `quota` bigint(50) DEFAULT NULL,
  `public_link_enabled` tinyint(1) DEFAULT NULL,
  `public_sublinks_enabled` tinyint(1) DEFAULT NULL,
  `isWorkgroup` tinyint(1) DEFAULT NULL,
  `isLocked` tinyint(1) DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT NULL,
  `deleteDate` datetime DEFAULT NULL,
  `DirectoryId` int(11) DEFAULT NULL,
  `OwnerId` int(11) DEFAULT NULL,
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=100185 DEFAULT CHARSET=latin1;

LOCK TABLES `directory` WRITE;
/*!40000 ALTER TABLE `directory` DISABLE KEYS */;

INSERT INTO `directory` (`name`, `size`, `quota`, `public_link_enabled`, `public_sublinks_enabled`, `isWorkgroup`, `isLocked`, `deleted`, `deleteDate`, `DirectoryId`, `OwnerId`, `id`, `createdAt`, `updatedAt`)
VALUES
	('New Workgroup',0,999147483647,0,0,1,NULL,NULL,NULL,NULL,1,10000155,'2013-07-23','2013-07-23');

/*!40000 ALTER TABLE `directory` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table directorypermission
# ------------------------------------------------------------

DROP TABLE IF EXISTS `directorypermission`;

CREATE TABLE `directorypermission` (
  `type` varchar(255) DEFAULT NULL,
  `orphan` tinyint(1) DEFAULT NULL,
  `AccountId` int(11) DEFAULT NULL,
  `DirectoryId` int(11) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=408 DEFAULT CHARSET=latin1;

LOCK TABLES `directorypermission` WRITE;
/*!40000 ALTER TABLE `directorypermission` DISABLE KEYS */;

INSERT INTO `directorypermission` (`type`, `orphan`, `AccountId`, `DirectoryId`, `id`, `createdAt`, `updatedAt`)
VALUES
	('admin',NULL,1,10000155,407,NULL,NULL);

/*!40000 ALTER TABLE `directorypermission` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table file
# ------------------------------------------------------------

DROP TABLE IF EXISTS `file`;

CREATE TABLE `file` (
  `name` varchar(255) DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `fsName` text,
  `deleted` tinyint(1) DEFAULT NULL,
  `deleteDate` datetime DEFAULT NULL,
  `isLocked` tinyint(1) DEFAULT NULL,
  `mimetype` varchar(255) DEFAULT NULL,
  `public_link_enabled` tinyint(1) DEFAULT NULL,
  `replaceFileId` int(11) DEFAULT NULL,
  `DirectoryId` int(11) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=latin1;



# Dump of table filedownloadlink
# ------------------------------------------------------------

DROP TABLE IF EXISTS `filedownloadlink`;

CREATE TABLE `filedownloadlink` (
  `file_id` int(11) DEFAULT NULL,
  `link_key` varchar(255) DEFAULT NULL,
  `key_expires` datetime DEFAULT NULL,
  `access_token` varchar(255) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;



# Dump of table filepermission
# ------------------------------------------------------------

DROP TABLE IF EXISTS `filepermission`;

CREATE TABLE `filepermission` (
  `type` varchar(255) DEFAULT NULL,
  `orphan` tinyint(1) DEFAULT NULL,
  `AccountId` int(11) DEFAULT NULL,
  `FileId` int(11) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=186 DEFAULT CHARSET=latin1;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
