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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Comment`
--

LOCK TABLES `Comment` WRITE;
/*!40000 ALTER TABLE `Comment` DISABLE KEYS */;
INSERT INTO `Comment` VALUES (19,1,NULL,72,'Nice\n','2012-11-05 02:22:29','2012-11-05 02:22:29'),(20,1,10002,NULL,'hello\n','2012-11-18 21:59:19','2012-11-18 21:59:19'),(21,37,10002,NULL,'tet\n','2012-11-18 21:59:41','2012-11-18 21:59:41');
/*!40000 ALTER TABLE `Comment` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=10522 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DirectoryPermission`
--

LOCK TABLES `DirectoryPermission` WRITE;
/*!40000 ALTER TABLE `DirectoryPermission` DISABLE KEYS */;
INSERT INTO `DirectoryPermission` VALUES (10393,1,10001,'admin','2012-11-04 13:55:34','2012-11-07 13:51:48',0),(10394,1,10002,'admin','2012-11-04 13:55:36','2012-11-04 13:55:36',0),(10395,1,10003,'admin','2012-11-04 13:55:39','2012-11-04 13:55:39',0),(10396,1,10004,'admin','2012-11-04 13:55:42','2012-11-04 13:55:42',0),(10408,1,10114,'admin','2012-11-05 02:22:55','2012-11-05 02:22:55',NULL),(10413,1,10119,'admin','2012-11-05 02:23:41','2012-11-05 02:23:41',NULL),(10414,38,10001,'comment','2012-11-05 02:52:40','2012-11-05 02:52:40',NULL),(10417,1,10115,'admin','2012-11-06 12:51:51','2012-11-06 12:51:51',NULL),(10419,1,10116,'admin','2012-11-06 12:51:59','2012-11-06 12:51:59',NULL),(10427,37,10001,'write','2012-11-06 17:24:17','2012-11-07 13:52:13',NULL),(10428,40,10002,'comment','2012-11-07 01:38:11','2012-11-07 01:38:11',NULL),(10430,39,10003,'comment','2012-11-07 01:40:55','2012-11-07 01:40:55',NULL),(10431,39,10114,'comment','2012-11-07 01:40:55','2012-11-07 01:40:55',NULL),(10432,39,10115,'comment','2012-11-07 01:40:55','2012-11-07 01:40:55',NULL),(10433,39,10116,'comment','2012-11-07 01:40:55','2012-11-07 01:40:55',NULL),(10434,39,10004,'comment','2012-11-07 01:42:54','2012-11-07 01:42:54',NULL),(10437,39,10119,'comment','2012-11-07 01:42:54','2012-11-07 01:42:54',NULL),(10438,1,10121,'admin','2012-11-07 12:50:20','2012-11-07 12:50:20',NULL),(10439,38,10121,'comment','2012-11-07 12:50:20','2012-11-07 12:50:20',NULL),(10440,37,10121,'admin','2012-11-07 12:50:20','2012-11-07 13:32:28',NULL),(10445,1,10122,'admin','2012-11-08 19:24:36','2012-11-08 19:24:36',NULL),(10446,40,10122,'comment','2012-11-08 19:24:36','2012-11-08 19:24:36',NULL),(10511,1,10117,'admin','2012-11-09 18:10:15','2012-11-09 18:10:15',NULL),(10512,38,10117,'comment','2012-11-09 18:10:15','2012-11-09 18:10:15',NULL),(10513,37,10117,'write','2012-11-09 18:10:15','2012-11-09 18:10:15',NULL),(10517,37,10002,'admin','2012-11-18 22:13:41','2012-11-18 22:14:20',NULL),(10518,37,10122,'comment','2012-11-18 22:13:41','2012-11-18 22:13:41',NULL),(10519,1,10131,'admin','2012-11-18 22:30:07','2012-11-18 22:30:07',NULL),(10520,40,10131,'comment','2012-11-18 22:30:07','2012-11-18 22:30:07',NULL),(10521,37,10131,'admin','2012-11-18 22:30:07','2012-11-18 22:30:07',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=369 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FilePermission`
--

LOCK TABLES `FilePermission` WRITE;
/*!40000 ALTER TABLE `FilePermission` DISABLE KEYS */;
INSERT INTO `FilePermission` VALUES (244,1,72,'admin','2012-11-04 23:56:17','2012-11-04 23:56:17',NULL),(250,38,72,'comment','2012-11-05 02:52:40','2012-11-05 02:52:40',NULL),(259,1,75,'admin','2012-11-07 01:37:25','2012-11-07 01:37:25',NULL),(260,38,75,'comment','2012-11-07 01:37:25','2012-11-07 01:37:25',NULL),(263,1,76,'admin','2012-11-08 18:49:39','2012-11-08 18:49:39',NULL),(264,38,76,'comment','2012-11-08 18:49:39','2012-11-08 18:49:39',NULL),(290,1,79,'comment','2012-11-08 20:05:20','2012-11-18 21:50:54',NULL),(291,40,79,'comment','2012-11-08 20:05:20','2012-11-08 20:05:20',NULL),(299,1,80,'admin','2012-11-08 20:39:05','2012-11-08 20:39:05',NULL),(300,40,80,'comment','2012-11-08 20:39:05','2012-11-08 20:39:05',NULL),(354,1,82,'admin','2012-11-14 22:37:58','2012-11-14 22:39:04',NULL),(355,39,82,'comment','2012-11-14 22:37:58','2012-11-14 22:39:04',NULL),(359,1,84,'admin','2012-11-15 13:53:21','2012-11-18 22:05:10',NULL),(360,40,84,'comment','2012-11-15 13:53:21','2012-11-18 22:05:10',NULL),(366,37,79,'comment','2012-11-18 22:09:27','2012-11-18 22:13:41',NULL),(367,37,80,'comment','2012-11-18 22:13:41','2012-11-18 22:13:41',NULL),(368,37,84,'comment','2012-11-18 22:13:41','2012-11-18 22:13:41',NULL);
/*!40000 ALTER TABLE `FilePermission` ENABLE KEYS */;
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

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `account` (
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES ('a','a',1,'2012-11-04 13:55:28','2012-11-04 13:55:28','Admin Account','info@balderdash.com',1,'abcde',1),('b','b',37,'2012-11-05 00:40:10','2012-11-05 01:04:08','Mike McNeil','scottmgress+123@gmail.com',NULL,'a5260390-2713-11e2-bb59-f5140855211f',1),('michael.r.mcneil@gmail.com','miker',39,'2012-11-05 19:38:01','2012-11-05 19:38:56','Mike Ike','scottmgress+456@gmail.com',NULL,'9a2ba630-27b2-11e2-8aa8-cb800e69a066',1),('scott@pigandcow.com','0309a340-28ae-11e2-b011-2b82cb27e43e',40,'2012-11-07 01:37:41','2012-11-07 01:37:41','scott@pigandcow.com','scott@pigandcow.com',NULL,'03097c30-28ae-11e2-b011-2b82cb27e43e',0);
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directory`
--

DROP TABLE IF EXISTS `directory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `DirectoryId` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `public_links_enabled` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10132 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directory`
--

LOCK TABLES `directory` WRITE;
/*!40000 ALTER TABLE `directory` DISABLE KEYS */;
INSERT INTO `directory` VALUES (10001,NULL,'Finance',NULL,'2012-08-23 19:50:58','2012-08-23 14:50:58',1),(10002,NULL,'Marketing',NULL,'2012-08-23 19:50:58','2012-08-03 19:50:58',1),(10003,NULL,'Sales',NULL,'2012-08-23 19:50:59','2012-06-23 19:50:59',1),(10004,NULL,'Operations',NULL,'2012-08-23 19:50:59','2012-07-23 19:50:59',1),(10110,NULL,'Outbound Materials',1,'2012-11-05 01:54:47','2012-11-08 19:24:26',1),(10111,NULL,'New Folder',1,'2012-11-05 02:04:13','2012-11-05 02:04:20',1),(10112,NULL,'teset',1,'2012-11-05 02:19:34','2012-11-05 02:20:11',1),(10113,NULL,'a',1,'2012-11-05 02:20:20','2012-11-05 02:21:12',1),(10114,10003,'North America',NULL,'2012-11-05 02:22:55','2012-11-05 02:23:00',1),(10115,10003,'Europe',NULL,'2012-11-05 02:23:09','2012-11-06 12:51:51',1),(10116,10003,'Asia',NULL,'2012-11-05 02:23:17','2012-11-06 12:51:59',1),(10117,10001,'US Midwest',NULL,'2012-11-05 02:23:30','2012-11-09 18:10:15',1),(10118,NULL,'UKs',1,'2012-11-05 02:23:35','2012-11-15 14:01:10',1),(10119,10004,'US West',NULL,'2012-11-05 02:23:41','2012-11-05 02:23:43',1),(10120,NULL,'asgd',1,'2012-11-06 12:52:51','2012-11-06 12:52:55',1),(10121,10001,'New Folder',NULL,'2012-11-07 12:50:20','2012-11-07 12:50:20',1),(10122,10002,'ello',NULL,'2012-11-08 19:24:36','2012-11-08 19:24:38',1),(10123,NULL,'New Folder',1,'2012-11-13 12:58:43','2012-11-13 12:59:04',1),(10124,NULL,'New Folder',1,'2012-11-13 12:59:18','2012-11-13 12:59:22',1),(10125,NULL,'New Folder',1,'2012-11-13 12:59:34','2012-11-13 12:59:40',1),(10126,NULL,'New Folder',1,'2012-11-13 13:01:26','2012-11-13 13:01:29',1),(10127,NULL,'New Folder',1,'2012-11-13 13:01:58','2012-11-13 13:02:01',1),(10128,NULL,'New Folder',1,'2012-11-13 13:02:42','2012-11-13 13:02:46',1),(10129,NULL,'Wales',1,'2012-11-13 13:03:37','2012-11-15 14:01:10',1),(10130,NULL,'\\',1,'2012-11-18 22:06:21','2012-11-18 22:06:42',1),(10131,10002,'sdfads',NULL,'2012-11-18 22:30:07','2012-11-18 22:30:09',1);
/*!40000 ALTER TABLE `directory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `file`
--

DROP TABLE IF EXISTS `file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `file` (
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `file`
--

LOCK TABLES `file` WRITE;
/*!40000 ALTER TABLE `file` DISABLE KEYS */;
INSERT INTO `file` VALUES (72,10001,'screenshot.png','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',NULL,'2012-11-04 23:56:17','2012-11-04 23:56:32',19095,'83aa2440-270d-11e2-b8f9-170e674137e9.png',1),(73,NULL,'mike (1) (1).jpeg','image/jpeg',1,'2012-11-04 23:58:13','2012-11-05 01:17:16',51142,'c94952a0-270d-11e2-b8f9-170e674137e9.jpeg',1),(74,NULL,'mike (1) (1) (copy).jpeg','image/jpeg',1,'2012-11-04 23:58:34','2012-11-05 00:07:18',51142,'d5c39900-270d-11e2-b8f9-170e674137e9.jpeg',1),(75,10001,'jump.jpg','image/jpeg',NULL,'2012-11-07 01:37:25','2012-11-07 01:37:25',11500,'f9359db0-28ad-11e2-b011-2b82cb27e43e.jpg',1),(76,10001,'add-meta-tags-2.0.2.zip','application/zip',NULL,'2012-11-08 18:49:39','2012-11-08 18:49:39',89607,'572dc050-2a07-11e2-940c-81c03ad9639a.zip',1),(77,NULL,'asw_logo_chamber.png','image/png',1,'2012-11-08 19:26:57','2012-11-15 14:00:52',4931,'8d9a25c0-2a0c-11e2-a0f2-5f08c8c20268.png',1),(78,NULL,'from_scratch_logo.jpg','image/jpeg',1,'2012-11-08 20:01:09','2012-11-08 20:04:58',95010,'547328a0-2a11-11e2-b149-093a866b3912.jpg',1),(79,10002,'PDFDocument.pdf','application/pdf',NULL,'2012-11-08 20:05:20','2012-11-08 20:05:20',8284,'ea5759e0-2a11-11e2-b149-093a866b3912.pdf',1),(80,10002,'detectmobilebrowser.js.txt','text/plain',NULL,'2012-11-08 20:39:05','2012-11-08 20:39:05',2080,'a15cd940-2a16-11e2-9f65-01bf3bae25fa.txt',1),(81,NULL,'angela-3.jpg','image/jpeg',1,'2012-11-13 12:37:26','2012-11-13 12:58:23',104712,'2bbcd5b0-2dc1-11e2-8677-bfaac3553760.jpg',1),(82,10115,'PICT0026.JPG','image/jpeg',NULL,'2012-11-14 22:37:58','2012-11-14 22:39:04',66678,'3b2bcd80-2ede-11e2-9ac5-d17bc9aac883.JPG',1),(83,NULL,'PICT0327.JPG','image/jpeg',1,'2012-11-14 22:58:17','2012-11-14 22:58:27',64872,'120d0a60-2ee1-11e2-9e5a-af611972c1f5.JPG',1),(84,10122,'PICT0019.JPG','image/jpeg',NULL,'2012-11-15 13:53:21','2012-11-18 22:05:10',84302,'1bcb3630-2f5e-11e2-bfb6-95d30e1d31ac.JPG',1),(85,NULL,'PICT0354.JPG','image/jpeg',1,'2012-11-15 17:56:29','2012-11-18 21:59:58',66897,'132f6a10-2f80-11e2-b488-2d49f2bd9698.JPG',1);
/*!40000 ALTER TABLE `file` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2012-11-18 23:41:25
