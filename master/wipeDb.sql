--
-- Wipe db
--

DROP DATABASE IF EXISTS `olympus`;
CREATE DATABASE olympus;
USE olympus;

--
-- Table structure for table `Directory`
--

DROP TABLE IF EXISTS `Directory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Directory` (
  `name` varchar(255) DEFAULT NULL,
  `size` int(11) DEFAULT '0',
  `quota` int(11) DEFAULT '1000000000',
  `deleted` tinyint(1) DEFAULT NULL,
  `public_link_enabled` tinyint(1) DEFAULT '0',
  `public_sublinks_enabled` tinyint(1) DEFAULT '0',
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `DirectoryId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=100013 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Hack to reconcile inode id collisions
--
ALTER TABLE Directory AUTO_INCREMENT=100000;



