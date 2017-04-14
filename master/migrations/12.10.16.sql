-- MySQL dump 10.13  Distrib 5.5.20, for osx10.6 (i386)
--
-- Host: localhost    Database: olympus
-- ------------------------------------------------------
-- Server version	5.5.20-log

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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Account`
--

LOCK TABLES `Account` WRITE;
/*!40000 ALTER TABLE `Account` DISABLE KEYS */;
INSERT INTO `Account` VALUES ('testAccountA','1',1,'2012-08-23 19:50:58','2012-08-23 19:50:58','Gabe Hernandez','gabe@balderdash.co'),('a','a',2,'2012-08-23 19:50:58','2012-08-23 19:50:58','Heather White','heather@balderdash.co'),('testAccountC','mike',3,'2012-08-23 19:50:58','2012-08-23 19:50:58','Mike McNeil','mike@balderdash.co'),(NULL,'geoff',4,'0000-00-00 00:00:00','0000-00-00 00:00:00','Geoff Tudor','geoff@olympus.io'),(NULL,'patrick',5,'0000-00-00 00:00:00','0000-00-00 00:00:00','Patrick Harr','patrick@olympus.io'),(NULL,'lani',6,'0000-00-00 00:00:00','0000-00-00 00:00:00','Lani Harr','lani@olympus.io');
/*!40000 ALTER TABLE `Account` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Comment`
--

LOCK TABLES `Comment` WRITE;
/*!40000 ALTER TABLE `Comment` DISABLE KEYS */;
INSERT INTO `Comment` VALUES (1,3,10001,NULL,'http://localhost:5008/#overview','2012-10-15 10:08:09','2012-10-15 10:08:09'),(2,3,10002,NULL,'v\n','2012-10-15 10:13:27','2012-10-15 10:13:27'),(3,3,10002,NULL,'d\n','2012-10-15 10:29:37','2012-10-15 10:29:37'),(4,3,10001,NULL,'d\n','2012-10-15 12:37:15','2012-10-15 12:37:15'),(5,3,NULL,10,'a\n','2012-10-15 12:46:34','2012-10-15 12:46:34'),(6,3,10001,NULL,'d\n','2012-10-15 12:48:12','2012-10-15 12:48:12'),(7,3,10002,NULL,'x\n','2012-10-15 12:49:06','2012-10-15 12:49:06'),(8,3,10001,NULL,'hi\n','2012-10-15 12:51:31','2012-10-15 12:51:31'),(9,3,10001,NULL,'ey\n','2012-10-15 12:51:34','2012-10-15 12:51:34'),(10,3,10001,NULL,'ok\n','2012-10-15 12:51:36','2012-10-15 12:51:36'),(11,3,10001,NULL,'x\n','2012-10-15 12:51:47','2012-10-15 12:51:47'),(12,3,10001,NULL,'x\n','2012-10-15 12:51:47','2012-10-15 12:51:47'),(13,3,10001,NULL,'x\nx','2012-10-15 12:51:47','2012-10-15 12:51:47'),(14,3,10001,NULL,'\nx','2012-10-15 12:51:47','2012-10-15 12:51:47'),(15,3,10001,NULL,'\n','2012-10-15 12:51:48','2012-10-15 12:51:48'),(16,3,10001,NULL,'x\nx','2012-10-15 12:51:48','2012-10-15 12:51:48'),(17,3,10001,NULL,'\nx','2012-10-15 12:51:48','2012-10-15 12:51:48'),(18,3,10001,NULL,'\n','2012-10-15 12:51:48','2012-10-15 12:51:48');
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10014 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Directory`
--

LOCK TABLES `Directory` WRITE;
/*!40000 ALTER TABLE `Directory` DISABLE KEYS */;
INSERT INTO `Directory` VALUES (10001,NULL,'Finance',NULL,'2012-08-23 19:50:58','2012-08-23 14:50:58'),(10002,NULL,'Marketing',NULL,'2012-08-23 19:50:58','2012-08-03 19:50:58'),(10003,NULL,'Sales',NULL,'2012-08-23 19:50:59','2012-06-23 19:50:59'),(10004,NULL,'Operations',NULL,'2012-08-23 19:50:59','2012-07-23 19:50:59'),(10005,10004,'IT',1,'2012-08-23 19:50:59','2012-08-23 19:50:59'),(10006,10003,'Clients',1,'2012-08-23 19:50:59','2012-08-23 19:50:59'),(10007,10008,'Advertising',NULL,'2012-08-23 19:50:59','2012-09-27 18:28:50'),(10008,10001,'Budget',NULL,'2012-08-23 19:50:59','2012-08-23 19:50:59'),(10009,10001,'Payrollllll',NULL,'0000-00-00 00:00:00','2012-10-15 12:39:49'),(10010,10001,'New Folder',NULL,'2012-10-14 21:12:40','2012-10-14 21:12:40'),(10011,10003,'New Folder',NULL,'2012-10-15 12:45:16','2012-10-15 12:45:16'),(10012,10001,'hi',NULL,'2012-10-15 20:43:08','2012-10-15 20:43:10'),(10013,NULL,'xxsgadga',1,'2012-10-15 20:43:12','2012-10-15 20:43:17');
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10060 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DirectoryPermission`
--

LOCK TABLES `DirectoryPermission` WRITE;
/*!40000 ALTER TABLE `DirectoryPermission` DISABLE KEYS */;
INSERT INTO `DirectoryPermission` VALUES (41,4,10007,'admin','2012-09-27 18:09:04','2012-09-27 18:09:04'),(42,3,10007,'admin','2012-09-27 18:25:39','2012-09-27 18:25:39'),(10001,3,10001,'admin','2012-08-23 19:50:59','2012-09-13 11:59:32'),(10002,3,10002,'admin','2012-08-23 19:50:59','2012-08-23 19:50:59'),(10005,3,10003,'admin','2012-08-23 19:50:59','2012-08-23 19:50:59'),(10006,3,10004,'admin','0000-00-00 00:00:00','2012-09-12 15:08:47'),(10007,4,10001,'admin','0000-00-00 00:00:00','0000-00-00 00:00:00'),(10010,4,10002,'admin','2012-09-10 04:41:38','2012-09-12 15:08:53'),(10013,4,10003,'admin','0000-00-00 00:00:00','0000-00-00 00:00:00'),(10014,4,10004,'admin','0000-00-00 00:00:00','0000-00-00 00:00:00'),(10015,2,10001,'admin','0000-00-00 00:00:00','2012-09-14 04:09:27'),(10016,2,10002,'admin','2012-09-14 04:06:44','2012-09-14 04:06:44'),(10017,2,10003,'admin','2012-09-14 04:06:44','2012-09-14 04:06:44'),(10018,2,10004,'admin','2012-09-14 04:06:44','2012-09-14 04:06:44'),(10028,2,10005,'admin','0000-00-00 00:00:00','0000-00-00 00:00:00'),(10029,2,10006,'admin','0000-00-00 00:00:00','0000-00-00 00:00:00'),(10030,2,10007,'admin','0000-00-00 00:00:00','0000-00-00 00:00:00'),(10031,2,10008,'admin','0000-00-00 00:00:00','0000-00-00 00:00:00'),(10032,2,10009,'admin','0000-00-00 00:00:00','0000-00-00 00:00:00'),(10033,3,10005,'admin','0000-00-00 00:00:00','0000-00-00 00:00:00'),(10034,3,10006,'admin','0000-00-00 00:00:00','0000-00-00 00:00:00'),(10035,3,10007,'admin','0000-00-00 00:00:00','0000-00-00 00:00:00'),(10036,3,10008,'admin','0000-00-00 00:00:00','0000-00-00 00:00:00'),(10037,3,10009,'admin','0000-00-00 00:00:00','0000-00-00 00:00:00'),(10038,4,10005,'admin','0000-00-00 00:00:00','0000-00-00 00:00:00'),(10040,4,10009,'admin','0000-00-00 00:00:00','0000-00-00 00:00:00'),(10041,5,10001,'read','2012-10-01 11:08:45','2012-10-01 11:08:45'),(10042,3,10010,'admin','2012-10-14 21:12:40','2012-10-14 21:12:40'),(10043,4,10010,'admin','2012-10-14 21:12:40','2012-10-14 21:12:40'),(10044,2,10010,'admin','2012-10-14 21:12:40','2012-10-14 21:12:40'),(10045,5,10010,'read','2012-10-14 21:12:40','2012-10-14 21:12:40'),(10046,3,10011,'admin','2012-10-15 12:45:16','2012-10-15 12:45:16'),(10047,4,10011,'admin','2012-10-15 12:45:16','2012-10-15 12:45:16'),(10048,2,10011,'admin','2012-10-15 12:45:16','2012-10-15 12:45:16'),(10049,1,10001,'read','2012-10-15 13:01:45','2012-10-15 13:01:45'),(10050,3,10012,'admin','2012-10-15 20:43:08','2012-10-15 20:43:08'),(10051,4,10012,'admin','2012-10-15 20:43:08','2012-10-15 20:43:08'),(10052,2,10012,'admin','2012-10-15 20:43:08','2012-10-15 20:43:08'),(10053,5,10012,'read','2012-10-15 20:43:08','2012-10-15 20:43:08'),(10054,1,10012,'read','2012-10-15 20:43:08','2012-10-15 20:43:08');
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
  `deleted` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `size` int(11) NOT NULL DEFAULT '0',
  `fsName` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `File`
--

LOCK TABLES `File` WRITE;
/*!40000 ALTER TABLE `File` DISABLE KEYS */;
INSERT INTO `File` VALUES (9,NULL,'icon-search-black.png',1,'2012-10-01 11:08:25','2012-10-01 11:09:50',1245,'3b00d180-0be2-11e2-98eb-5b7293251fda.png'),(10,10001,'test',NULL,'2012-10-04 11:53:46','2012-10-15 12:46:22',321949,'103797e0-0e44-11e2-8060-09acf1591dd7.png'),(11,10001,'103797e0-0e44-11e2-8060-09acf1591dd7 (1).png',NULL,'2012-10-16 15:31:49','2012-10-16 15:31:49',321949,'82f24c90-17d0-11e2-a3be-edd7ac3d955f.png'),(12,10001,'screenShot04.png',NULL,'2012-10-16 15:31:59','2012-10-16 15:31:59',115695,'89305a20-17d0-11e2-a3be-edd7ac3d955f.png'),(13,10001,'103797e0-0e44-11e2-8060-09acf1591dd7 (1).png',NULL,'2012-10-16 16:51:07','2012-10-16 16:51:07',321949,'97460000-17db-11e2-98cc-c59d8735e8ac.png'),(14,10001,'103797e0-0e44-11e2-8060-09acf1591dd7 (1).png',NULL,'2012-10-16 16:54:20','2012-10-16 16:54:20',321949,'0a369750-17dc-11e2-95bd-df9c12928c2c.png'),(15,10001,'US6779118.pdf',NULL,'2012-10-16 16:54:30','2012-10-16 16:54:30',127181,'106143f0-17dc-11e2-95bd-df9c12928c2c.pdf'),(16,10001,'mongodb-osx-x86_64-2.2.0.tgz',NULL,'2012-10-16 16:56:30','2012-10-16 16:56:30',59903366,'57805b90-17dc-11e2-a071-bd98db2138d3.tgz'),(17,10001,'new_one_528am.js',NULL,'2012-10-16 17:02:20','2012-10-16 17:02:20',9612,'28034390-17dd-11e2-8ffc-b570830c49cf.js'),(18,10001,'driver_wifi_realtek_os2010171a.exe',NULL,'2012-10-16 17:03:43','2012-10-16 17:03:43',19182536,'59e16090-17dd-11e2-8ffc-b570830c49cf.exe');
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FilePermission`
--

LOCK TABLES `FilePermission` WRITE;
/*!40000 ALTER TABLE `FilePermission` DISABLE KEYS */;
INSERT INTO `FilePermission` VALUES (26,3,10,'admin','2012-10-04 11:53:46','2012-10-04 11:53:46'),(27,4,10,'admin','2012-10-04 11:53:46','2012-10-04 11:53:46'),(28,2,10,'admin','2012-10-04 11:53:46','2012-10-04 11:53:46'),(29,5,10,'read','2012-10-04 11:53:46','2012-10-04 11:53:46'),(30,3,11,'admin','2012-10-16 15:31:49','2012-10-16 15:31:49'),(31,4,11,'admin','2012-10-16 15:31:49','2012-10-16 15:31:49'),(32,2,11,'admin','2012-10-16 15:31:49','2012-10-16 15:31:49'),(33,5,11,'read','2012-10-16 15:31:49','2012-10-16 15:31:49'),(34,1,11,'read','2012-10-16 15:31:49','2012-10-16 15:31:49'),(35,3,12,'admin','2012-10-16 15:31:59','2012-10-16 15:31:59'),(36,4,12,'admin','2012-10-16 15:31:59','2012-10-16 15:31:59'),(37,2,12,'admin','2012-10-16 15:31:59','2012-10-16 15:31:59'),(38,5,12,'read','2012-10-16 15:31:59','2012-10-16 15:31:59'),(39,1,12,'read','2012-10-16 15:31:59','2012-10-16 15:31:59'),(40,3,13,'admin','2012-10-16 16:51:07','2012-10-16 16:51:07'),(41,4,13,'admin','2012-10-16 16:51:07','2012-10-16 16:51:07'),(42,2,13,'admin','2012-10-16 16:51:07','2012-10-16 16:51:07'),(43,5,13,'read','2012-10-16 16:51:07','2012-10-16 16:51:07'),(44,1,13,'read','2012-10-16 16:51:07','2012-10-16 16:51:07'),(45,3,14,'admin','2012-10-16 16:54:20','2012-10-16 16:54:20'),(46,4,14,'admin','2012-10-16 16:54:20','2012-10-16 16:54:20'),(47,2,14,'admin','2012-10-16 16:54:20','2012-10-16 16:54:20'),(48,5,14,'read','2012-10-16 16:54:20','2012-10-16 16:54:20'),(49,1,14,'read','2012-10-16 16:54:20','2012-10-16 16:54:20'),(50,3,15,'admin','2012-10-16 16:54:30','2012-10-16 16:54:30'),(51,4,15,'admin','2012-10-16 16:54:30','2012-10-16 16:54:30'),(52,2,15,'admin','2012-10-16 16:54:30','2012-10-16 16:54:30'),(53,5,15,'read','2012-10-16 16:54:30','2012-10-16 16:54:30'),(54,1,15,'read','2012-10-16 16:54:30','2012-10-16 16:54:30'),(55,3,16,'admin','2012-10-16 16:56:30','2012-10-16 16:56:30'),(56,4,16,'admin','2012-10-16 16:56:30','2012-10-16 16:56:30'),(57,2,16,'admin','2012-10-16 16:56:30','2012-10-16 16:56:30'),(58,5,16,'read','2012-10-16 16:56:30','2012-10-16 16:56:30'),(59,1,16,'read','2012-10-16 16:56:30','2012-10-16 16:56:30'),(60,3,17,'admin','2012-10-16 17:02:20','2012-10-16 17:02:20'),(61,4,17,'admin','2012-10-16 17:02:20','2012-10-16 17:02:20'),(62,2,17,'admin','2012-10-16 17:02:20','2012-10-16 17:02:20'),(63,5,17,'read','2012-10-16 17:02:20','2012-10-16 17:02:20'),(64,1,17,'read','2012-10-16 17:02:20','2012-10-16 17:02:20'),(65,3,18,'admin','2012-10-16 17:03:43','2012-10-16 17:03:43'),(66,4,18,'admin','2012-10-16 17:03:43','2012-10-16 17:03:43'),(67,2,18,'admin','2012-10-16 17:03:43','2012-10-16 17:03:43'),(68,5,18,'read','2012-10-16 17:03:43','2012-10-16 17:03:43'),(69,1,18,'read','2012-10-16 17:03:43','2012-10-16 17:03:43');
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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2012-10-16 17:09:32
