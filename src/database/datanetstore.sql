-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 07, 2023 at 09:38 PM
-- Server version: 5.7.24
-- PHP Version: 8.0.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `datanetstore`
--

-- --------------------------------------------------------

--
-- Table structure for table `tbl_categorias`
--

CREATE TABLE `tbl_categorias` (
  `id` int(11) DEFAULT NULL,
  `Nombre` varchar(200) DEFAULT NULL,
  `Parent` int(11) DEFAULT NULL,
  `utilidad_Categoria` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_fichas`
--

CREATE TABLE `tbl_fichas` (
  `id` int(11) DEFAULT NULL,
  `sku` varchar(250) DEFAULT NULL,
  `url` varchar(300) DEFAULT NULL,
  `descripcion` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_imagenes`
--

CREATE TABLE `tbl_imagenes` (
  `id` int(11) DEFAULT NULL,
  `sku` varchar(250) DEFAULT NULL,
  `img_Principal` varchar(800) DEFAULT NULL,
  `img_Secundaria` varchar(800) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_marcas`
--

CREATE TABLE `tbl_marcas` (
  `id` int(11) DEFAULT NULL,
  `Nombre` varchar(250) DEFAULT NULL,
  `utilidad_Marca` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_productos`
--

CREATE TABLE `tbl_productos` (
  `id` int(11) DEFAULT NULL,
  `sku` varchar(250) DEFAULT NULL,
  `nombre` varchar(800) DEFAULT NULL,
  `price` double DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `catalog_visibility` varchar(100) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `quantityUptate` int(11) DEFAULT NULL,
  `id_marca` int(11) DEFAULT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `id_imagen` int(11) DEFAULT NULL,
  `id_ficha` int(11) DEFAULT NULL,
  `utilidad_Product` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_tokens`
--

CREATE TABLE `tbl_tokens` (
  `id` int(11) NOT NULL,
  `Token_Ingram` varchar(250) DEFAULT NULL,
  `Token_CONSUMER_KEY` varchar(250) DEFAULT NULL,
  `Token_CONSUMER_SECRECT` varchar(250) DEFAULT NULL,
  `Token_CLIENT_ID` varchar(250) DEFAULT NULL,
  `Token_CLIENT_SECRET` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tbl_tokens`
--

INSERT INTO `tbl_tokens` (`id`, `Token_Ingram`, `Token_CONSUMER_KEY`, `Token_CONSUMER_SECRECT`, `Token_CLIENT_ID`, `Token_CLIENT_SECRET`) VALUES
(1, 're4YbiVfSqWS547LGLHTkaFPmj4r', 'ck_95d2f26ba3ea809fbf1c53de9d4d2459c4fffae2', 'cs_59452fc5c132b3075ac78366b178f8a6ca09ad2d', 'aN6OfmrWG5lDgRzNgjmkVIYuI3nlLDr2', 'wZ7eunyhFjk5k3h1');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_tokens`
--
ALTER TABLE `tbl_tokens`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_tokens`
--
ALTER TABLE `tbl_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
