-- MySQL dump 10.13  Distrib 5.5.27, for osx10.6 (i386)
--
-- Host: localhost    Database: olympus2
-- ------------------------------------------------------
-- Server version	5.5.27-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Account`
--

DROP TABLE IF EXISTS `Account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Account` (
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `isAdmin` tinyint(4) DEFAULT '0',
  `verificationCode` varchar(255) DEFAULT NULL,
  `verified` tinyint(3) unsigned DEFAULT '0',
  `avatar_fname` varchar(255) DEFAULT NULL,
  `avatar_mimetype` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Account`
--

LOCK TABLES `Account` WRITE;
/*!40000 ALTER TABLE `Account` DISABLE KEYS */;
INSERT INTO `Account` VALUES ('a','Fhs9gwGvZBvyeD5cpqwhkyJ6LNo536Uwx0wtSAlxz26K:In25FFPtV2xJMcVfowpstTDDKAPqFBtrSvJaD3cpmJk=',1,'2012-11-04 13:55:28','2012-12-11 17:33:08','info@balderdash.com','scottmgress@gmail.com',1,'abcde',1,'5a5ab850-3dc6-11e2-94c1-21bbefaf94e9','image/png',NULL),('b','EiIOPIuH5iNqT95i3ANRb2gCyNzOiRx9hm1dVUcaZrhx:lb2jzHo1Aw6ipzQv0S63LStZ989n9V7FVL0K/76ha8Y=',37,'2012-11-05 00:40:10','2012-11-05 01:04:08','Mike McNeil','scottmgress+123@gmail.com',NULL,'a5260390-2713-11e2-bb59-f5140855211f',1,NULL,NULL,NULL),('michael.r.mcneil@gmail.com','miker',39,'2012-11-05 19:38:01','2012-11-05 19:38:56','Mike Ike','scottmgress+456@gmail.com',NULL,'9a2ba630-27b2-11e2-8aa8-cb800e69a066',1,NULL,NULL,NULL),('scott@pigandcow.com','0309a340-28ae-11e2-b011-2b82cb27e43e',40,'2012-11-07 01:37:41','2012-11-07 01:37:41','scott@pigandcow.com','scott@pigandcow.com',NULL,'03097c30-28ae-11e2-b011-2b82cb27e43e',0,NULL,NULL,NULL),('geoff','RVvsrHaWwJ4tcRO6E6Lczgf31BRoHhKTT41iUwOiMDKK:qCNQaRxNmckl8FOYcdCtv44CjB/CB/mDUNp6T8O5Hqg=',41,'2012-12-05 13:06:05','2012-12-05 13:07:13','Geoff Tudor','geoff@olympus.io',1,'d1934d80-3f0e-11e2-ac57-79b4d143589b',1,'41-ead4e8d0-3f0e-11e2-ac57-79b4d143589b','image/png',NULL);
/*!40000 ALTER TABLE `Account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AccountDeveloper`
--

DROP TABLE IF EXISTS `AccountDeveloper`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AccountDeveloper` (
  `api_key` varchar(255) DEFAULT NULL,
  `account_id` int(11) DEFAULT NULL,
  `auth_token` varchar(255) DEFAULT NULL,
  `ticket` varchar(255) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AccountDeveloper`
--

LOCK TABLES `AccountDeveloper` WRITE;
/*!40000 ALTER TABLE `AccountDeveloper` DISABLE KEYS */;
/*!40000 ALTER TABLE `AccountDeveloper` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AccountRole`
--

DROP TABLE IF EXISTS `AccountRole`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AccountRole` (
  `RoleId` int(11) NOT NULL DEFAULT '0',
  `AccountId` int(11) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`RoleId`,`AccountId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AccountRole`
--

LOCK TABLES `AccountRole` WRITE;
/*!40000 ALTER TABLE `AccountRole` DISABLE KEYS */;
/*!40000 ALTER TABLE `AccountRole` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Comment`
--

DROP TABLE IF EXISTS `Comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Comment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `AccountId` int(11) DEFAULT NULL,
  `DirectoryId` int(11) DEFAULT NULL,
  `FileId` int(11) DEFAULT NULL,
  `payload` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Comment`
--

LOCK TABLES `Comment` WRITE;
/*!40000 ALTER TABLE `Comment` DISABLE KEYS */;
INSERT INTO `Comment` VALUES (19,1,NULL,72,'Nice\n','2012-11-05 02:22:29','2012-11-05 02:22:29'),(20,1,10002,NULL,'hello\n','2012-11-18 21:59:19','2012-11-18 21:59:19'),(21,37,10002,NULL,'tet\n','2012-11-18 21:59:41','2012-11-18 21:59:41'),(22,1,10001,NULL,'hello','2012-12-03 22:35:45','2012-12-03 22:35:45'),(23,1,10001,NULL,'I love you guys','2012-12-05 22:36:59','2012-12-05 22:36:59');
/*!40000 ALTER TABLE `Comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Directory`
--

DROP TABLE IF EXISTS `Directory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Directory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `DirectoryId` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `public_link_enabled` tinyint(4) NOT NULL DEFAULT '0',
  `public_sublinks_enabled` tinyint(4) NOT NULL DEFAULT '1',
  `quota` bigint(20) DEFAULT NULL,
  `size` bigint(20) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10142 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Directory`
--

LOCK TABLES `Directory` WRITE;
/*!40000 ALTER TABLE `Directory` DISABLE KEYS */;
INSERT INTO `Directory` VALUES (10001,NULL,'Finance',NULL,'2012-08-23 19:50:58','2012-12-11 16:20:52',0,1,1000000000,383106),(10002,NULL,'Marketing',NULL,'2012-08-23 19:50:58','2012-12-06 04:18:53',0,0,1000000000,0),(10003,NULL,'Sales',NULL,'2012-08-23 19:50:59','2012-06-23 19:50:59',0,1,1000000000,0),(10004,NULL,'Operations',NULL,'2012-08-23 19:50:59','2012-12-06 00:52:31',0,1,1000000000,0),(10110,NULL,'Outbound Materials',1,'2012-11-05 01:54:47','2012-11-08 19:24:26',0,1,1000000000,0),(10111,NULL,'New Folder',1,'2012-11-05 02:04:13','2012-11-05 02:04:20',0,1,1000000000,0),(10112,NULL,'teset',1,'2012-11-05 02:19:34','2012-11-05 02:20:11',0,1,1000000000,0),(10113,NULL,'a',1,'2012-11-05 02:20:20','2012-11-05 02:21:12',0,1,1000000000,0),(10114,10003,'North America',NULL,'2012-11-05 02:22:55','2012-11-05 02:23:00',0,1,NULL,0),(10115,10003,'Europe',NULL,'2012-11-05 02:23:09','2012-11-06 12:51:51',0,1,NULL,0),(10116,10003,'Asia',NULL,'2012-11-05 02:23:17','2012-11-06 12:51:59',0,1,NULL,0),(10117,10001,'US Midwest',NULL,'2012-11-05 02:23:30','2012-11-09 18:10:15',0,1,NULL,0),(10118,NULL,'UKs',1,'2012-11-05 02:23:35','2012-11-15 14:01:10',0,1,1000000000,0),(10119,10004,'US West',NULL,'2012-11-05 02:23:41','2012-11-05 02:23:43',0,1,NULL,0),(10120,NULL,'asgd',1,'2012-11-06 12:52:51','2012-11-06 12:52:55',0,1,1000000000,0),(10121,10001,'New Folder',NULL,'2012-11-07 12:50:20','2012-12-11 16:20:48',0,1,NULL,0),(10122,10002,'ello',NULL,'2012-11-08 19:24:36','2012-12-06 03:12:00',0,1,NULL,0),(10123,NULL,'New Folder',1,'2012-11-13 12:58:43','2012-11-13 12:59:04',0,1,1000000000,0),(10124,NULL,'New Folder',1,'2012-11-13 12:59:18','2012-11-13 12:59:22',0,1,1000000000,0),(10125,NULL,'New Folder',1,'2012-11-13 12:59:34','2012-11-13 12:59:40',0,1,1000000000,0),(10126,NULL,'New Folder',1,'2012-11-13 13:01:26','2012-11-13 13:01:29',0,1,1000000000,0),(10127,NULL,'New Folder',1,'2012-11-13 13:01:58','2012-11-13 13:02:01',0,1,1000000000,0),(10128,NULL,'New Folder',1,'2012-11-13 13:02:42','2012-11-13 13:02:46',0,1,1000000000,0),(10129,NULL,'Wales',1,'2012-11-13 13:03:37','2012-11-15 14:01:10',0,1,1000000000,0),(10130,NULL,'\\',1,'2012-11-18 22:06:21','2012-11-18 22:06:42',0,1,1000000000,0),(10131,10002,'sdfads',NULL,'2012-11-18 22:30:07','2012-12-06 03:12:00',0,1,NULL,0),(10132,10121,'test',NULL,'2012-12-06 00:03:38','2012-12-11 16:20:48',0,1,NULL,0),(10133,10001,'test',NULL,'2012-12-06 00:27:55','2012-12-11 16:20:52',0,1,NULL,383106),(10134,10133,'yrry3',NULL,'2012-12-06 00:28:24','2012-12-11 16:20:52',0,1,NULL,383106),(10135,NULL,'New Workgroup',NULL,'2012-12-06 00:52:12','2012-12-06 00:52:31',0,1,1000000000,0),(10136,10004,'New Folder',NULL,'2012-12-06 00:52:20','2012-12-06 00:52:31',0,1,NULL,0),(10137,10135,'New Folder (copy)',NULL,'2012-12-06 00:52:26','2012-12-06 00:52:26',0,1,NULL,0),(10138,10121,'test2',NULL,'2012-12-06 03:11:21','2012-12-06 03:11:25',0,1,NULL,0),(10139,10002,'Advertising',NULL,'2012-12-06 04:16:53','2012-12-06 04:18:53',0,1,NULL,0),(10140,NULL,'a',1,'2012-12-06 04:18:31','2012-12-06 04:18:43',0,1,1000000000,0),(10141,NULL,'adgs',1,'2012-12-06 04:18:49','2012-12-06 04:18:53',0,1,1000000000,0);
/*!40000 ALTER TABLE `Directory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DirectoryPermission`
--

DROP TABLE IF EXISTS `DirectoryPermission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DirectoryPermission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `AccountId` int(11) DEFAULT NULL,
  `DirectoryId` int(11) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `orphan` tinyint(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10594 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DirectoryPermission`
--

LOCK TABLES `DirectoryPermission` WRITE;
/*!40000 ALTER TABLE `DirectoryPermission` DISABLE KEYS */;
INSERT INTO `DirectoryPermission` VALUES (10393,1,10001,'admin','2012-11-04 13:55:34','2012-11-07 13:51:48',0),(10394,1,10002,'admin','2012-11-04 13:55:36','2012-11-04 13:55:36',0),(10395,1,10003,'admin','2012-11-04 13:55:39','2012-11-04 13:55:39',0),(10396,1,10004,'admin','2012-11-04 13:55:42','2012-11-04 13:55:42',0),(10408,1,10114,'admin','2012-11-05 02:22:55','2012-11-05 02:22:55',NULL),(10413,1,10119,'admin','2012-11-05 02:23:41','2012-11-05 02:23:41',NULL),(10414,38,10001,'comment','2012-11-05 02:52:40','2012-11-05 02:52:40',NULL),(10417,1,10115,'admin','2012-11-06 12:51:51','2012-11-06 12:51:51',NULL),(10419,1,10116,'admin','2012-11-06 12:51:59','2012-11-06 12:51:59',NULL),(10428,41,10002,'admin','2012-11-07 01:38:11','2012-11-07 01:38:11',NULL),(10430,39,10003,'comment','2012-11-07 01:40:55','2012-11-07 01:40:55',NULL),(10431,39,10114,'comment','2012-11-07 01:40:55','2012-11-07 01:40:55',NULL),(10432,39,10115,'comment','2012-11-07 01:40:55','2012-11-07 01:40:55',NULL),(10433,39,10116,'comment','2012-11-07 01:40:55','2012-11-07 01:40:55',NULL),(10434,39,10004,'comment','2012-11-07 01:42:54','2012-11-07 01:42:54',NULL),(10437,39,10119,'comment','2012-11-07 01:42:54','2012-11-07 01:42:54',NULL),(10511,1,10117,'admin','2012-11-09 18:10:15','2012-11-09 18:10:15',NULL),(10512,38,10117,'comment','2012-11-09 18:10:15','2012-11-09 18:10:15',NULL),(10525,1,10121,'admin','2012-11-25 16:45:19','2012-11-25 16:45:19',NULL),(10526,38,10121,'comment','2012-11-25 16:45:19','2012-11-25 16:45:19',NULL),(10536,1,10132,'admin','2012-12-06 00:04:04','2012-12-06 00:04:04',NULL),(10537,38,10132,'comment','2012-12-06 00:04:04','2012-12-06 00:04:04',NULL),(10538,1,10133,'admin','2012-12-06 00:27:55','2012-12-06 00:27:55',NULL),(10539,38,10133,'comment','2012-12-06 00:27:55','2012-12-06 00:27:55',NULL),(10542,1,10135,'admin','2012-12-06 00:52:12','2012-12-06 00:52:12',NULL),(10544,1,10137,'admin','2012-12-06 00:52:26','2012-12-06 00:52:26',NULL),(10545,1,10136,'admin','2012-12-06 00:52:31','2012-12-06 00:52:31',NULL),(10546,39,10136,'comment','2012-12-06 00:52:31','2012-12-06 00:52:31',NULL),(10547,1,10138,'admin','2012-12-06 03:11:21','2012-12-06 03:11:21',NULL),(10548,38,10138,'comment','2012-12-06 03:11:21','2012-12-06 03:11:21',NULL),(10551,1,10122,'admin','2012-12-06 03:11:42','2012-12-06 03:11:42',NULL),(10552,40,10122,'comment','2012-12-06 03:11:42','2012-12-06 03:11:42',NULL),(10555,1,10131,'admin','2012-12-06 03:12:00','2012-12-06 03:12:00',NULL),(10556,40,10131,'comment','2012-12-06 03:12:00','2012-12-06 03:12:00',NULL),(10557,1,10139,'admin','2012-12-06 04:16:53','2012-12-06 04:16:53',NULL),(10558,41,10139,'admin','2012-12-06 04:16:53','2012-12-06 04:16:53',NULL),(10588,37,10001,'comment','2012-12-07 14:29:36','2012-12-07 14:29:36',NULL),(10589,37,10117,'comment','2012-12-07 14:29:36','2012-12-07 14:29:36',NULL),(10590,37,10121,'comment','2012-12-07 14:29:36','2012-12-07 14:29:36',NULL),(10591,37,10133,'comment','2012-12-07 14:29:36','2012-12-07 14:29:36',NULL),(10592,37,10132,'comment','2012-12-07 14:29:36','2012-12-07 14:29:36',NULL),(10593,37,10138,'comment','2012-12-07 14:29:36','2012-12-07 14:29:36',NULL);
/*!40000 ALTER TABLE `DirectoryPermission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Experiment`
--

DROP TABLE IF EXISTS `Experiment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Experiment` (
  `title` varchar(255) DEFAULT NULL,
  `value` int(11) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Experiment`
--

LOCK TABLES `Experiment` WRITE;
/*!40000 ALTER TABLE `Experiment` DISABLE KEYS */;
/*!40000 ALTER TABLE `Experiment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `File`
--

DROP TABLE IF EXISTS `File`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `File` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `DirectoryId` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `mimetype` varchar(255) DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `size` int(11) NOT NULL DEFAULT '0',
  `fsName` varchar(255) NOT NULL DEFAULT '',
  `public_link_enabled` tinyint(4) NOT NULL DEFAULT '1',
  `deleteDate` datetime DEFAULT NULL,
  `replaceFileId` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `File`
--

LOCK TABLES `File` WRITE;
/*!40000 ALTER TABLE `File` DISABLE KEYS */;
INSERT INTO `File` VALUES (92,10134,'she-decided-r.png','image/png',NULL,'2012-12-07 12:02:36','2012-12-11 16:20:52',383106,'486dfab0-4098-11e2-b9d1-19f2f82629d1.png',1,NULL,NULL);
/*!40000 ALTER TABLE `File` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `FilePermission`
--

DROP TABLE IF EXISTS `FilePermission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `FilePermission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `AccountId` int(11) DEFAULT NULL,
  `FileId` int(11) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `orphan` tinyint(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=400 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FilePermission`
--

LOCK TABLES `FilePermission` WRITE;
/*!40000 ALTER TABLE `FilePermission` DISABLE KEYS */;
INSERT INTO `FilePermission` VALUES (244,1,72,'admin','2012-11-04 23:56:17','2012-11-04 23:56:17',NULL),(250,38,72,'comment','2012-11-05 02:52:40','2012-11-05 02:52:40',NULL),(259,1,75,'admin','2012-11-07 01:37:25','2012-11-25 17:17:49',NULL),(260,38,75,'comment','2012-11-07 01:37:25','2012-11-25 17:17:49',NULL),(263,1,76,'admin','2012-11-08 18:49:39','2012-11-25 16:44:48',NULL),(264,38,76,'comment','2012-11-08 18:49:39','2012-11-25 16:44:48',NULL),(290,1,79,'admin','2012-11-08 20:05:20','2012-11-19 15:18:33',NULL),(291,40,79,'comment','2012-11-08 20:05:20','2012-11-08 20:05:20',NULL),(299,1,80,'admin','2012-11-08 20:39:05','2012-12-06 03:11:56',NULL),(300,40,80,'comment','2012-11-08 20:39:05','2012-12-06 03:11:56',NULL),(354,1,82,'admin','2012-11-14 22:37:58','2012-11-14 22:39:04',NULL),(370,1,86,'admin','2012-11-21 09:53:07','2012-11-21 09:53:07',NULL),(372,1,87,'admin','2012-11-21 09:55:09','2012-11-21 09:55:09',NULL),(373,39,87,'comment','2012-11-21 09:55:09','2012-11-21 09:55:09',NULL),(374,1,88,'admin','2012-11-21 09:56:03','2012-11-21 09:56:03',NULL),(375,39,88,'comment','2012-11-21 09:56:03','2012-11-21 09:56:03',NULL),(376,1,89,'admin','2012-11-25 15:57:26','2012-11-25 15:57:26',NULL),(377,39,89,'comment','2012-11-25 15:57:26','2012-11-25 15:57:26',NULL),(380,37,86,'comment','2012-11-25 17:07:51','2012-11-25 17:07:51',1),(381,37,87,'comment','2012-11-25 17:08:58','2012-11-25 17:08:58',1),(383,1,90,'admin','2012-12-03 15:17:40','2012-12-03 15:17:40',NULL),(384,38,90,'comment','2012-12-03 15:17:40','2012-12-03 15:17:40',NULL),(394,1,91,'admin','2012-12-06 01:02:01','2012-12-06 01:02:01',NULL),(395,38,91,'comment','2012-12-06 01:02:01','2012-12-06 01:02:01',NULL),(398,1,84,'admin','2012-12-06 03:11:42','2012-12-06 03:11:59',NULL),(399,40,84,'comment','2012-12-06 03:11:42','2012-12-06 03:11:59',NULL);
/*!40000 ALTER TABLE `FilePermission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Organization`
--

DROP TABLE IF EXISTS `Organization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Organization` (
  `avatar_fname` varchar(255) DEFAULT NULL,
  `avatar_mime_type` varchar(255) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Organization`
--

LOCK TABLES `Organization` WRITE;
/*!40000 ALTER TABLE `Organization` DISABLE KEYS */;
/*!40000 ALTER TABLE `Organization` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Role`
--

DROP TABLE IF EXISTS `Role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Role` (
  `name` varchar(255) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Role`
--

LOCK TABLES `Role` WRITE;
/*!40000 ALTER TABLE `Role` DISABLE KEYS */;
/*!40000 ALTER TABLE `Role` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2012-12-18 13:29:52
