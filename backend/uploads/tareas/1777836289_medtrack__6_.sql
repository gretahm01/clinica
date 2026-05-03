-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 03, 2026 at 03:58 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `medtrack`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointment`
--

CREATE TABLE `appointment` (
  `appointment_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `professional_id` int(11) NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `status` enum('pendiente','confirmada','cancelada','completada','reagendada') NOT NULL,
  `feedback` varchar(200) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `duration` int(11) DEFAULT 60
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointment`
--

INSERT INTO `appointment` (`appointment_id`, `patient_id`, `professional_id`, `appointment_date`, `appointment_time`, `status`, `feedback`, `notes`, `motivo`, `duration`) VALUES
(1, 1, 1, '2026-03-13', '10:00:00', 'completada', 'Bien', 'Se enojo malamente', NULL, 60),
(2, 2, 1, '2026-04-20', '10:20:00', 'completada', 'Si', NULL, NULL, 60),
(3, 4, 1, '2026-04-20', '22:20:00', 'cancelada', NULL, NULL, NULL, 60),
(4, 4, 1, '2026-04-12', '21:00:00', 'cancelada', NULL, NULL, NULL, 60),
(5, 4, 1, '2026-04-12', '10:00:00', 'cancelada', NULL, NULL, NULL, 60),
(6, 2, 1, '2026-04-13', '11:30:00', 'cancelada', 'bla', 'bla', NULL, 60),
(7, 4, 1, '2026-04-08', '22:20:00', 'cancelada', NULL, NULL, NULL, 60),
(8, 5, 1, '2026-04-15', '18:00:00', 'completada', NULL, NULL, NULL, 60),
(9, 1, 1, '2026-04-16', '14:00:00', 'completada', '', 'Hizo cosas Malas y Asi', NULL, 60),
(10, 3, 1, '2026-04-14', '12:01:00', 'completada', NULL, NULL, NULL, 60),
(11, 3, 1, '2026-04-18', '16:00:00', 'completada', NULL, NULL, NULL, 60),
(12, 2, 1, '2026-04-20', '17:00:00', 'cancelada', NULL, NULL, NULL, 60),
(13, 2, 1, '2026-04-20', '17:00:00', 'cancelada', NULL, NULL, NULL, 60),
(14, 5, 1, '2026-04-20', '17:30:00', 'cancelada', NULL, NULL, NULL, 60),
(15, 5, 1, '2026-04-20', '12:00:00', 'cancelada', NULL, NULL, NULL, 60),
(16, 1, 1, '2026-04-21', '12:00:00', 'cancelada', NULL, NULL, NULL, 60),
(17, 4, 1, '2026-04-21', '11:00:00', 'cancelada', NULL, NULL, NULL, 60),
(18, 1, 1, '2026-04-20', '12:00:00', 'cancelada', NULL, NULL, NULL, 60),
(19, 4, 1, '2026-04-20', '13:00:00', 'cancelada', NULL, NULL, NULL, 60),
(20, 4, 1, '2026-04-20', '12:00:00', 'cancelada', NULL, NULL, NULL, 90),
(21, 4, 1, '2026-04-30', '11:00:00', 'cancelada', 'Se porto bien', NULL, NULL, 60),
(22, 1, 1, '2026-05-01', '13:30:00', 'cancelada', NULL, NULL, NULL, 60),
(23, 1, 1, '2026-04-30', '14:00:00', 'cancelada', '', NULL, NULL, 60),
(24, 1, 1, '2026-05-05', '10:00:00', 'cancelada', NULL, NULL, NULL, 60),
(25, 1, 1, '2026-05-08', '10:30:00', 'cancelada', NULL, NULL, NULL, 60),
(26, 1, 1, '2026-06-02', '10:40:00', 'cancelada', NULL, NULL, '', 60),
(27, 1, 1, '2026-05-20', '18:30:00', 'cancelada', NULL, NULL, 'Tengo Concierto', 60),
(28, 1, 1, '2026-05-01', '11:00:00', 'cancelada', NULL, NULL, NULL, 60),
(29, 1, 1, '2026-04-28', '10:00:00', 'completada', 'hIZO bIEN', 'Prueba', NULL, 60),
(30, 1, 1, '2026-04-29', '13:00:00', 'cancelada', NULL, NULL, NULL, 60),
(31, 1, 1, '2026-04-24', '10:30:00', 'completada', 'mjkfjk', 'njkefnj', NULL, 60),
(32, 1, 1, '2026-04-29', '16:20:00', 'cancelada', NULL, NULL, 'queria hechar la hueva', 60),
(33, 1, 1, '2026-04-29', '13:00:00', 'cancelada', NULL, NULL, NULL, 60),
(34, 1, 1, '2026-04-29', '10:00:00', 'cancelada', NULL, NULL, 'Solicitada por paciente', 60),
(35, 1, 1, '2026-04-29', '10:40:00', 'cancelada', NULL, NULL, 'Solicitada por el paciente', 60),
(36, 1, 1, '2026-04-29', '10:40:00', 'cancelada', NULL, NULL, 'Triste', 60),
(37, 1, 1, '2026-04-29', '08:30:00', 'cancelada', NULL, NULL, 'a', 60),
(38, 1, 1, '2026-04-29', '11:00:00', 'cancelada', NULL, NULL, 'Solicitada por paciente', 60),
(39, 1, 1, '2026-04-30', '11:30:00', 'cancelada', NULL, NULL, 'Solicitada por paciente', 60),
(40, 1, 1, '2026-04-29', '10:30:00', 'completada', '', '', 'Solicitada por paciente', 60),
(41, 1, 1, '2026-04-29', '10:00:00', 'cancelada', NULL, NULL, 'Platicas de Comadres Termina Mal', 60),
(42, 1, 1, '2026-04-29', '11:00:00', 'cancelada', NULL, NULL, 'Platicar de Mis Comadres que me Cayeron Mal\n', 60),
(43, 1, 1, '2026-04-29', '11:00:00', 'cancelada', NULL, NULL, 'Propuesto por tu psicólogo: ', 60),
(44, 1, 1, '2026-04-29', '14:00:00', 'cancelada', NULL, NULL, 'Propuesto por tu psicólogo: ', 60),
(45, 1, 1, '2026-04-29', '13:00:00', 'cancelada', NULL, NULL, 'Propuesto por tu psicólogo: ', 60),
(46, 1, 1, '2026-04-29', '12:00:00', 'cancelada', NULL, NULL, 'Solicitada por el paciente', 60),
(47, 1, 1, '2026-04-08', '12:30:00', 'confirmada', NULL, NULL, 'Solicitada por paciente', 90),
(48, 6, 1, '2026-04-29', '12:00:00', 'cancelada', NULL, NULL, 'Solicitada por paciente', 60),
(49, 6, 1, '2026-04-29', '14:00:00', 'cancelada', NULL, NULL, 'Solicitada por paciente', 60),
(50, 6, 1, '2026-04-29', '16:00:00', 'cancelada', NULL, NULL, 'Solicitada por paciente', 60),
(51, 6, 1, '2026-04-29', '16:00:00', 'cancelada', NULL, NULL, 'Nueva cita propuesta por tu psicólogo', 60),
(52, 6, 1, '2026-04-29', '19:00:00', 'cancelada', NULL, NULL, 'Tenia Hueva', 60),
(53, 6, 1, '2026-04-29', '15:00:00', 'completada', 'Procura ser mas Limpia\n', 'Se hizo caca sobre eL Sillon', 'Queria Hechar la Hueva\n', 60),
(54, 6, 1, '2026-04-29', '15:00:00', 'cancelada', NULL, NULL, 'Solicitada por paciente', 60),
(55, 6, 1, '2026-04-30', '15:00:00', 'cancelada', 'Trabajaste Mucho', 'Fue de la Chingada', 'Propuesto por tu psicólogo: cOSAS DE MUJERS', 60),
(56, 6, 1, '2026-04-29', '15:00:00', 'completada', '', '', 'Queria hechar hueva', 60),
(57, 6, 1, '2026-04-30', '15:00:00', 'cancelada', NULL, NULL, 'Propuesto por tu psicólogo: ', 60),
(58, 4, 1, '2026-04-30', '12:30:00', 'cancelada', NULL, '', 'Solicitada por paciente', 60),
(59, 8, 1, '2026-05-02', '15:00:00', 'completada', 'Hizo muy buenos tiktoks', 'Es una pinche Naca', 'Propuesto por tu psicólogo: ', 60),
(60, 8, 1, '2026-05-03', '13:30:00', 'cancelada', NULL, NULL, 'Cita agendada', 60),
(61, 8, 1, '2026-05-04', '09:00:00', 'cancelada', NULL, NULL, 'Solicitada por el paciente', 60),
(62, 8, 1, '2026-05-02', '15:00:00', 'cancelada', '', '', 'Solicitada por sistema', 60),
(63, 8, 1, '2026-05-01', '14:00:00', 'completada', '', '', '[Psicólogo] Agendada desde el consultorio', 60),
(64, 6, 1, '2026-05-05', '08:30:00', 'pendiente', NULL, NULL, '[Paciente] Solicito espacio', 60),
(65, 1, 1, '2026-05-12', '20:00:00', 'pendiente', NULL, NULL, '[Psicólogo] Agendada desde perfil', 60),
(66, 1, 1, '2026-05-12', '19:00:00', 'pendiente', NULL, NULL, '[Psicólogo] Agendada desde perfil', 60),
(67, 1, 1, '2026-05-12', '17:00:00', 'pendiente', NULL, NULL, '[Psicólogo] Agendada desde perfil', 60),
(68, 1, 1, '2026-05-12', '11:00:00', 'confirmada', NULL, NULL, 'Solicitada por sistema', 60),
(69, 1, 1, '2026-05-12', '09:00:00', 'pendiente', NULL, NULL, '[Paciente] Solicito espacio', 60),
(70, 6, 1, '2026-06-02', '10:00:00', 'confirmada', NULL, NULL, '[Psicólogo] ', 60),
(71, 9, 1, '2026-05-03', '10:00:00', 'confirmada', NULL, NULL, '[Paciente] Cita Inicial', 60),
(72, 9, 1, '2026-05-04', '12:00:00', 'confirmada', NULL, NULL, '[Paciente] Seguimiento de Primera Cita\n', 60),
(73, 6, 1, '2026-05-03', '13:00:00', 'cancelada', NULL, NULL, '[Psicólogo] Agendada desde el consultorio', 60),
(74, 11, 1, '2026-05-05', '08:00:00', 'pendiente', NULL, NULL, '[Paciente] Solicito espacio', 60),
(75, 1, 1, '2026-05-03', '10:00:00', 'confirmada', NULL, NULL, '[Paciente] Solicito espacio', 60),
(76, 1, 1, '2026-05-03', '12:00:00', 'pendiente', NULL, NULL, '[Paciente] Solicito espacio', 60);

-- --------------------------------------------------------

--
-- Table structure for table `diagnosis`
--

CREATE TABLE `diagnosis` (
  `diagnosis_id` int(11) NOT NULL,
  `diagnosis_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `diagnosis`
--

INSERT INTO `diagnosis` (`diagnosis_id`, `diagnosis_name`) VALUES
(1, 'Ansiedad generalizada'),
(7, 'Fobia específica'),
(12, 'Otro'),
(11, 'TDAH'),
(6, 'Trastorno bipolar'),
(9, 'Trastorno de ansiedad social'),
(3, 'Trastorno de conducta alimentaria (TCA)'),
(2, 'Trastorno de depresión mayor'),
(5, 'Trastorno de estrés postraumático (TEPT)'),
(8, 'Trastorno de pánico'),
(10, 'Trastorno límite de la personalidad (TLP)'),
(4, 'Trastorno obsesivo compulsivo (TOC)');

-- --------------------------------------------------------

--
-- Table structure for table `emergency_contact`
--

CREATE TABLE `emergency_contact` (
  `emergency_contact_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `full_name` varchar(50) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `relationship` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `emergency_contact`
--

INSERT INTO `emergency_contact` (`emergency_contact_id`, `patient_id`, `full_name`, `phone`, `relationship`) VALUES
(1, 1, 'María Meresita', '5511223344', 'AMANT'),
(2, 2, 'Teresita', '8331552775', 'Madre'),
(3, 6, 'Mariela Gonzalez', '8331234567', 'Adultera'),
(4, 7, 'nmj', 'nj', 'nj'),
(5, 8, 'Marisol Dominguez', '83312536', 'No Long Term RelationShip'),
(6, 9, 'Claudia Martinez', '8337654321', 'Madre');

-- --------------------------------------------------------

--
-- Table structure for table `medical_record`
--

CREATE TABLE `medical_record` (
  `medical_record_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `professional_id` int(11) NOT NULL,
  `creation_date` date NOT NULL DEFAULT curdate(),
  `consultation_reason` text DEFAULT NULL,
  `current_condition` text DEFAULT NULL,
  `childhood_adolescence` text DEFAULT NULL,
  `significant_events` text DEFAULT NULL,
  `abuse_history` text DEFAULT NULL,
  `therapeutic_goals` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medical_record`
--

INSERT INTO `medical_record` (`medical_record_id`, `patient_id`, `professional_id`, `creation_date`, `consultation_reason`, `current_condition`, `childhood_adolescence`, `significant_events`, `abuse_history`, `therapeutic_goals`) VALUES
(1, 1, 1, '2026-03-10', 'Episodios de ansiedad recurrentes', '', '', '', '', 'Desarrollar técnicas de manejo de ansiedad'),
(2, 2, 1, '2026-04-29', '', '', '', '', '', ''),
(3, 6, 1, '2026-04-29', '', '', '', '', '', ''),
(4, 7, 1, '2026-04-29', NULL, NULL, NULL, NULL, NULL, NULL),
(5, 4, 1, '2026-04-29', NULL, NULL, NULL, NULL, NULL, NULL),
(6, 8, 1, '2026-04-29', NULL, NULL, NULL, NULL, NULL, NULL),
(7, 9, 1, '2026-05-02', NULL, NULL, NULL, NULL, NULL, NULL),
(8, 11, 2, '2026-05-02', '', '', '', '', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `medical_record_diagnosis`
--

CREATE TABLE `medical_record_diagnosis` (
  `id` int(11) NOT NULL,
  `medical_record_id` int(11) NOT NULL,
  `diagnosis_id` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medical_record_diagnosis`
--

INSERT INTO `medical_record_diagnosis` (`id`, `medical_record_id`, `diagnosis_id`, `notes`, `created_at`) VALUES
(5, 3, 1, NULL, '2026-04-29 10:33:25'),
(6, 3, 2, NULL, '2026-04-29 10:33:25'),
(7, 3, 3, NULL, '2026-04-29 10:33:25'),
(69, 8, 1, '', '2026-05-02 23:20:08'),
(70, 8, 7, '', '2026-05-02 23:20:08'),
(71, 8, 12, '', '2026-05-02 23:20:08'),
(72, 8, 11, '', '2026-05-02 23:20:08'),
(73, 8, 6, '', '2026-05-02 23:20:08'),
(74, 8, 9, '', '2026-05-02 23:20:08'),
(75, 8, 3, '', '2026-05-02 23:20:08'),
(76, 8, 2, '', '2026-05-02 23:20:08'),
(77, 8, 5, '', '2026-05-02 23:20:08'),
(78, 1, 1, '', '2026-05-02 23:20:22'),
(79, 1, 12, '', '2026-05-02 23:20:22'),
(80, 1, 3, '', '2026-05-02 23:20:22'),
(81, 1, 4, '', '2026-05-02 23:20:22'),
(82, 1, 7, '', '2026-05-02 23:20:22'),
(83, 2, 1, '', '2026-05-03 07:26:39'),
(84, 2, 7, '', '2026-05-03 07:26:39');

-- --------------------------------------------------------

--
-- Table structure for table `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL,
  `profesional_id` int(11) NOT NULL DEFAULT 1,
  `tipo` varchar(50) NOT NULL,
  `mensaje` text NOT NULL,
  `leida` tinyint(1) DEFAULT 0,
  `fecha` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notificaciones`
--

INSERT INTO `notificaciones` (`id`, `profesional_id`, `tipo`, `mensaje`, `leida`, `fecha`) VALUES
(1, 1, 'cita_confirmada', 'Se ha confirmado una cita agendada o reagendada', 0, '2026-04-29 08:03:43'),
(2, 1, 'cita_cancelada', 'Una cita ha sido cancelada', 0, '2026-04-29 08:04:03'),
(3, 1, 'cita_solicitada', 'Un paciente solicitó una nueva cita para el 2026-04-29', 0, '2026-04-29 08:04:12'),
(4, 1, 'cita_confirmada', 'Se ha confirmado una cita agendada o reagendada', 0, '2026-04-29 08:07:28'),
(5, 1, 'cita_cancelada', 'Una cita ha sido cancelada', 0, '2026-04-29 08:17:59'),
(6, 1, 'cita_solicitada', 'Un paciente solicitó una nueva cita para el 2026-04-29', 0, '2026-04-29 08:18:23'),
(7, 1, 'cita_confirmada', 'Se ha confirmado una cita agendada o reagendada', 0, '2026-04-29 08:23:58'),
(8, 1, 'cita_cancelada', 'Una cita ha sido cancelada', 0, '2026-04-29 08:26:18'),
(9, 1, 'cita_solicitada', 'Un paciente solicitó una nueva cita para el 2026-04-29', 0, '2026-04-29 08:26:51'),
(10, 1, 'cita_confirmada', 'Se ha confirmado una cita agendada o reagendada', 0, '2026-04-29 08:27:14'),
(11, 1, 'cita_cancelada', 'Una cita ha sido cancelada', 0, '2026-04-29 08:28:03'),
(12, 1, 'cita_solicitada', 'Un paciente solicitó una nueva cita para el 2026-04-08', 0, '2026-04-29 08:40:35'),
(13, 1, 'cita_solicitada', 'Un paciente solicitó una nueva cita para el 2026-04-29', 0, '2026-04-29 10:43:34'),
(14, 1, 'cita_solicitada', 'Un paciente solicitó una nueva cita para el 2026-04-29', 0, '2026-04-29 10:46:02'),
(15, 1, 'cita_solicitada', 'Un paciente solicitó una nueva cita para el 2026-04-29', 0, '2026-04-29 10:50:54'),
(16, 1, 'cita_solicitada', 'Un paciente solicitó una nueva cita para el 2026-04-29', 0, '2026-04-29 10:59:20'),
(17, 1, 'cita_cancelada', 'Una cita ha sido cancelada', 0, '2026-04-29 10:59:25'),
(18, 1, 'cita_solicitada', 'Un paciente solicitó una nueva cita para el 2026-04-29', 0, '2026-04-29 10:59:37'),
(19, 1, 'cita_confirmada', 'Se ha confirmado una cita agendada o reagendada', 0, '2026-04-29 10:59:54'),
(20, 1, 'cita_cancelada', 'Una cita ha sido cancelada', 0, '2026-04-29 11:01:23'),
(21, 1, 'cita_cancelada', 'Una cita ha sido cancelada', 0, '2026-04-29 11:01:26'),
(22, 1, 'cita_confirmada', 'Se ha confirmado una cita agendada o reagendada', 0, '2026-04-29 11:05:11'),
(23, 1, 'cita_cancelada', 'Una cita ha sido cancelada', 0, '2026-04-29 11:05:17'),
(24, 1, 'cita_cancelada', 'Una cita ha sido cancelada', 0, '2026-04-29 11:05:20'),
(25, 1, 'cita_solicitada', 'Un paciente solicitó una nueva cita para el 2026-04-29', 0, '2026-04-29 11:05:34'),
(26, 1, 'cita_confirmada', 'Se ha confirmado una cita agendada o reagendada', 0, '2026-04-29 11:05:48'),
(27, 1, 'cita_reagendada', 'Se propuso un cambio de horario para la cita', 0, '2026-04-29 11:06:15'),
(28, 1, 'cita_reagendada', 'Se propuso un cambio de horario para la cita', 0, '2026-04-29 11:06:43'),
(29, 1, 'cita_confirmada', 'Se ha confirmado una cita agendada o reagendada', 0, '2026-04-29 11:11:30'),
(30, 1, 'cita_solicitada', 'Un paciente solicitó una nueva cita para el 2026-04-29', 0, '2026-04-29 11:11:41'),
(31, 1, 'cita_cancelada', 'Una cita ha sido cancelada', 0, '2026-04-29 11:12:15'),
(32, 1, 'cita_reagendada', 'Se propuso un cambio de horario para la cita', 0, '2026-04-29 11:12:49'),
(33, 1, 'cita_confirmada', 'Se ha confirmado una cita agendada o reagendada', 0, '2026-04-29 11:13:13'),
(34, 1, 'cita_solicitada', 'Un paciente solicitó una nueva cita para el 2026-04-29', 0, '2026-04-29 13:06:00'),
(35, 1, 'cita_confirmada', 'Se ha confirmado una cita agendada o reagendada', 0, '2026-04-29 13:06:44'),
(36, 1, 'cita_solicitada', 'Un paciente solicitó una nueva cita para el 2026-04-29', 0, '2026-04-29 13:09:00'),
(37, 1, 'cita_reagendada', 'Se propuso un cambio de horario para la cita', 0, '2026-04-29 13:09:55'),
(38, 1, 'cita_confirmada', 'Se ha confirmado una cita agendada o reagendada', 0, '2026-04-29 13:10:58'),
(39, 1, 'cita_reagendada', 'Se propuso un cambio de horario para la cita', 0, '2026-04-29 13:30:23'),
(40, 1, 'cita_cancelada', 'Una cita ha sido cancelada', 0, '2026-04-29 15:42:13'),
(41, 1, 'cita_reagendada', 'Un paciente solicitó cambiar el horario de su cita', 0, '2026-04-29 15:43:41'),
(42, 1, 'cita_confirmada', 'Se ha confirmado una cita agendada o reagendada', 0, '2026-04-29 15:54:02'),
(43, 1, 'cita_reagendada', 'Se propuso un cambio de horario para la cita', 0, '2026-04-29 15:54:11'),
(44, 1, 'cita_cancelada', 'Una cita ha sido cancelada', 0, '2026-04-29 16:22:15'),
(45, 1, 'cita_reagendada', 'Un paciente solicitó cambiar el horario de su cita', 0, '2026-04-29 18:14:20'),
(46, 1, 'cita_confirmada', 'Cita confirmada exitosamente', 0, '2026-04-29 18:36:26'),
(47, 1, 'cita_confirmada', 'Cita confirmada exitosamente', 0, '2026-04-29 18:37:32'),
(48, 1, 'cita_solicitada', 'Nueva cita pendiente para el 2026-05-03', 0, '2026-04-29 18:40:18'),
(49, 1, 'cita_solicitada', 'Un paciente solicitó una nueva cita para el 2026-05-04', 0, '2026-04-29 18:55:11'),
(50, 1, 'cita_solicitada', 'Nueva cita pendiente en agenda', 0, '2026-04-29 19:08:26'),
(51, 1, 'cita_solicitada', 'Nueva cita pendiente en agenda', 0, '2026-04-29 19:17:03'),
(52, 1, 'cita_confirmada', 'Cita confirmada exitosamente', 0, '2026-04-29 19:17:14'),
(53, 1, 'cita_solicitada', 'Nueva cita pendiente en agenda', 0, '2026-04-30 12:38:31'),
(54, 1, 'cita_confirmada', 'Cita confirmada exitosamente', 0, '2026-04-30 13:59:38'),
(55, 1, 'cita_solicitada', 'Nueva cita pendiente en agenda', 0, '2026-04-30 14:32:09'),
(56, 1, 'cita_solicitada', 'Nueva cita pendiente en agenda', 0, '2026-04-30 14:32:23'),
(57, 1, 'cita_solicitada', 'Nueva cita pendiente en agenda', 0, '2026-04-30 14:32:48'),
(58, 1, 'cita_solicitada', 'Nueva cita pendiente en agenda', 0, '2026-04-30 14:33:19'),
(59, 1, 'cita_solicitada', 'Nueva cita pendiente en agenda', 0, '2026-04-30 14:34:07'),
(60, 1, 'cita_confirmada', 'Cita confirmada exitosamente', 0, '2026-04-30 14:35:10'),
(61, 1, 'cita_solicitada', 'Nueva cita pendiente en agenda', 0, '2026-04-30 14:44:35'),
(62, 1, 'cita_confirmada', 'Cita confirmada exitosamente', 0, '2026-04-30 14:45:41'),
(63, 1, 'cita_solicitada', 'Nueva cita pendiente en agenda', 0, '2026-05-02 15:14:15'),
(64, 1, 'cita_confirmada', 'Cita confirmada exitosamente', 0, '2026-05-02 15:14:39'),
(65, 1, 'cita_solicitada', 'Nueva cita pendiente en agenda', 0, '2026-05-02 15:15:47'),
(66, 1, 'cita_confirmada', 'Cita confirmada exitosamente', 0, '2026-05-02 15:16:01'),
(67, 1, 'cita_solicitada', 'Nueva cita pendiente en agenda', 0, '2026-05-02 15:33:32'),
(68, 1, 'cita_solicitada', 'Nueva cita pendiente en agenda', 0, '2026-05-02 22:31:06'),
(69, 1, 'cita_solicitada', 'Nueva cita pendiente en agenda', 0, '2026-05-03 07:51:11'),
(70, 1, 'cita_confirmada', 'Cita confirmada exitosamente', 0, '2026-05-03 07:51:29'),
(71, 1, 'cita_solicitada', 'Nueva cita pendiente en agenda', 0, '2026-05-03 07:52:01');

-- --------------------------------------------------------

--
-- Table structure for table `patient`
--

CREATE TABLE `patient` (
  `patient_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `registration_date` date NOT NULL DEFAULT curdate(),
  `professional_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `patient`
--

INSERT INTO `patient` (`patient_id`, `user_id`, `registration_date`, `professional_id`) VALUES
(1, 3, '2026-03-10', 1),
(2, 4, '2026-03-26', 1),
(3, 5, '2026-03-26', 1),
(4, 6, '2026-03-26', 1),
(5, 7, '2026-04-15', 1),
(6, 9, '2026-04-29', 1),
(7, 10, '2026-04-29', 1),
(8, 11, '2026-04-29', 1),
(9, 13, '2026-05-02', 1),
(10, 14, '2026-05-02', 1),
(11, 16, '2026-05-02', 2);

-- --------------------------------------------------------

--
-- Table structure for table `professional`
--

CREATE TABLE `professional` (
  `professional_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `license_number` varchar(20) NOT NULL,
  `specialty_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `professional`
--

INSERT INTO `professional` (`professional_id`, `user_id`, `license_number`, `specialty_id`) VALUES
(1, 1, 'PSI-2024-001', 1),
(2, 15, '345', 1);

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`role_id`, `role_name`) VALUES
(4, 'admin'),
(3, 'paciente'),
(1, 'psicologo'),
(2, 'secretaria');

-- --------------------------------------------------------

--
-- Table structure for table `specialty`
--

CREATE TABLE `specialty` (
  `specialty_id` int(11) NOT NULL,
  `specialty_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `specialty`
--

INSERT INTO `specialty` (`specialty_id`, `specialty_name`) VALUES
(6, 'Ansiedad y depresión'),
(1, 'Psicología clínica'),
(3, 'Psicología infantil'),
(2, 'Terapia cognitivo-conductual'),
(4, 'Terapia familiar'),
(5, 'Trastornos alimentarios');

-- --------------------------------------------------------

--
-- Table structure for table `task`
--

CREATE TABLE `task` (
  `task_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `professional_id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `content` text DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` enum('pendiente','entregada','revisada') DEFAULT 'pendiente',
  `image_path` varchar(255) DEFAULT NULL,
  `therapist_comment` varchar(200) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `delivered_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `task`
--

INSERT INTO `task` (`task_id`, `patient_id`, `professional_id`, `title`, `content`, `due_date`, `status`, `image_path`, `therapist_comment`, `created_at`, `delivered_at`) VALUES
(1, 1, 1, 'Diario de emociones', 'Escribe cada noche cómo te sentiste durante el día y qué lo provocó.', '2026-03-17', 'pendiente', NULL, NULL, '2026-03-10 19:41:41', NULL),
(2, 1, 1, 'Prueba de Tarea', 'Hacer Plana', '2026-05-01', 'pendiente', NULL, NULL, '2026-04-30 13:54:38', NULL),
(3, 1, 1, 'Prueba 2', 'Plarticar con Padres', '2026-05-30', 'pendiente', NULL, NULL, '2026-04-30 14:01:18', NULL),
(4, 8, 1, 'Diario de Emociones', 'Escribe Tus Emociones', '2026-05-12', 'revisada', NULL, 'Hiciste Muy Bien tu Tarea', '2026-04-30 15:00:27', NULL),
(5, 8, 1, 'Diario de Situaciones', 'Hacer Tu Tarea', '2026-05-02', 'revisada', NULL, 'Bien', '2026-04-30 15:37:46', NULL),
(6, 8, 1, 'Diario de Lloriqueos', 'Pues como te sentias cuando estabas asi', '2026-05-02', 'entregada', NULL, NULL, '2026-04-30 15:50:21', NULL),
(7, 8, 1, 'Diario de Felicidades', 'Cuando has estado feliz y asi', '2026-05-02', 'entregada', NULL, NULL, '2026-04-30 15:58:27', NULL),
(8, 9, 1, 'Diaro De Emociones', 'Escribe como te has sentido en los ultimos dias', '2026-05-03', 'entregada', NULL, NULL, '2026-05-02 15:55:11', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `first_name` varchar(30) NOT NULL,
  `last_name` varchar(30) NOT NULL,
  `middle_name` varchar(30) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `first_name`, `last_name`, `middle_name`, `birth_date`, `email`, `phone`) VALUES
(1, 'Ana Marisol', 'García', 'López', '1985-03-15', 'psicologa@medtrack.com', '5512345678'),
(2, 'Laura', 'Martínez Ruiz', NULL, '1990-07-22', 'secretaria@medtrack.com', '5587654321'),
(3, 'Carlos', 'López Hernández', NULL, '2000-11-05', 'paciente@medtrack.com', '5599887766'),
(4, 'Camila', 'Martinez', 'Jimenez', '2004-06-07', 'camila.martinez@iest.edu.mx', '8311552775'),
(5, 'oliverio', 'Fernandez', 'Pedroza', '1979-06-21', 'chidoliro@gmail.com', '8311552775'),
(6, 'coque', 'martinez', 'velez', '5720-03-12', 'coque@gmail.com', '833176123'),
(7, 'Juan', 'Perez', 'Garcia', '2016-06-14', 'juanperez@gmail.com', '83312314567'),
(9, 'Paola', 'Molar', 'Jasso', '2004-10-10', 'paola@gmail.com', '83345678902'),
(10, 'fmj', 'njqnj', 'jmn', '9990-02-19', 'jnm', 'jnm'),
(11, 'Lupita', 'Tik', 'Tok', '2002-09-10', 'lupita@gmail.com', '5566778899'),
(12, 'Administrador', 'Global', NULL, NULL, 'admin@medtrack.com', '8330000000'),
(13, 'Greta', 'Hernandez', 'Martinez', '2004-04-03', 'greta@medtrack.com', '8331234567'),
(14, 'Mari', 'P3', NULL, '2003-12-09', 'aimep3@medtrack.com', '5566778899'),
(15, 'Viviana', 'Jimenez', NULL, '2000-01-01', 'viviana@medtrack.com', '8331555555'),
(16, 'Camila', 'Martinez', NULL, '2004-01-01', 'camila@medtrack.com', '83389898');

-- --------------------------------------------------------

--
-- Table structure for table `user_access`
--

CREATE TABLE `user_access` (
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_access`
--

INSERT INTO `user_access` (`user_id`, `role_id`, `username`, `password`) VALUES
(1, 1, 'ana.garcia', '$2y$10$5XFIIWix5rnfSAHuvL64hOq.DBTqXGDfWQAkYEJfw5ZVV4FKVLW5W'),
(2, 2, 'laura.martinez', '$2y$10$MZj5dLRuiduopipSrXcrYOdQ8zD6CKVxhLHtUpwXTPjkFZVWuuJdC'),
(3, 3, 'carlos.lopez', '$2y$10$MZj5dLRuiduopipSrXcrYOdQ8zD6CKVxhLHtUpwXTPjkFZVWuuJdC'),
(4, 3, 'cmartinez609', '$2y$10$n2.jg7QyHFih5JoGcUlo9uqTnmOXd5UFG84ZThX8dg/FQISGtVKKS'),
(5, 3, 'ofernandez483', '$2y$10$P2wiZKkqmRDLwTIlk6z3heynACroS70nngiL1MPWbbZir9yKe7LiO'),
(6, 3, 'cmartinez962', '$2y$10$Rd8k/vZBKo.sT/shkUlezOiMozEFUljrAHSfgif2zZtFvM/f4t7L6'),
(7, 3, 'jperez696', '$2y$10$xRbBSoIfVhk2qp73bNulbe0v9PF4w8sH2R7tpgf2FytXJ4P4ZNA.W'),
(9, 3, 'paola527', '$2y$10$dT0pUBTJPbJPZs3yLcdtb.OGpU9wvLG77bhpwqmeYykHSDKeOEHem'),
(10, 3, 'jnm342', '$2y$10$qUsr5fz08nELADTA15lkXe74q6tMdxQ3JBHmCdGwtr9nDM3yF7hZa'),
(11, 3, 'lupita809', '$2y$10$.b2EiVW2KXj6eElD6TTfBeRGDJfJYx1ftvbcQ6uv.SmLHMqDYDFIe'),
(12, 4, 'admin', '$2y$10$MZj5dLRuiduopipSrXcrYOdQ8zD6CKVxhLHtUpwXTPjkFZVWuuJdC'),
(13, 3, 'greta522', '$2y$10$fGswqbeaxrzeiGBTX1dJYOpiKb0kuwF6lLXIXYyXwkvH.yicDtixC'),
(14, 3, 'mp3756', '$2y$10$2exJrBIqMzCVX2UN1e8N/uR96nRILBaarV8UfS9cdQCR662vkbOdy'),
(15, 1, 'vjimenez951', '$2y$10$3rXvKPuU5aJBWweJRwh.FusmAutNBPoeRl6Q74Pfu/NGXisk8Bfd2'),
(16, 3, 'cmartinez247', '$2y$10$wd9mdke.FFLvqNrZNEjdJ.X71zlv5C4hszOZyy7iHKAgxRsezqvcG');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointment`
--
ALTER TABLE `appointment`
  ADD PRIMARY KEY (`appointment_id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `professional_id` (`professional_id`);

--
-- Indexes for table `diagnosis`
--
ALTER TABLE `diagnosis`
  ADD PRIMARY KEY (`diagnosis_id`),
  ADD UNIQUE KEY `diagnosis_name` (`diagnosis_name`);

--
-- Indexes for table `emergency_contact`
--
ALTER TABLE `emergency_contact`
  ADD PRIMARY KEY (`emergency_contact_id`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indexes for table `medical_record`
--
ALTER TABLE `medical_record`
  ADD PRIMARY KEY (`medical_record_id`),
  ADD UNIQUE KEY `patient_id` (`patient_id`),
  ADD KEY `professional_id` (`professional_id`);

--
-- Indexes for table `medical_record_diagnosis`
--
ALTER TABLE `medical_record_diagnosis`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_record_diagnosis` (`medical_record_id`,`diagnosis_id`),
  ADD KEY `diagnosis_id` (`diagnosis_id`);

--
-- Indexes for table `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `patient`
--
ALTER TABLE `patient`
  ADD PRIMARY KEY (`patient_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `professional_id` (`professional_id`);

--
-- Indexes for table `professional`
--
ALTER TABLE `professional`
  ADD PRIMARY KEY (`professional_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `specialty_id` (`specialty_id`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `specialty`
--
ALTER TABLE `specialty`
  ADD PRIMARY KEY (`specialty_id`),
  ADD UNIQUE KEY `specialty_name` (`specialty_name`);

--
-- Indexes for table `task`
--
ALTER TABLE `task`
  ADD PRIMARY KEY (`task_id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `professional_id` (`professional_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_access`
--
ALTER TABLE `user_access`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointment`
--
ALTER TABLE `appointment`
  MODIFY `appointment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT for table `diagnosis`
--
ALTER TABLE `diagnosis`
  MODIFY `diagnosis_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `emergency_contact`
--
ALTER TABLE `emergency_contact`
  MODIFY `emergency_contact_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `medical_record`
--
ALTER TABLE `medical_record`
  MODIFY `medical_record_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `medical_record_diagnosis`
--
ALTER TABLE `medical_record_diagnosis`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT for table `patient`
--
ALTER TABLE `patient`
  MODIFY `patient_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `professional`
--
ALTER TABLE `professional`
  MODIFY `professional_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `specialty`
--
ALTER TABLE `specialty`
  MODIFY `specialty_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `task`
--
ALTER TABLE `task`
  MODIFY `task_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointment`
--
ALTER TABLE `appointment`
  ADD CONSTRAINT `appointment_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  ADD CONSTRAINT `appointment_ibfk_2` FOREIGN KEY (`professional_id`) REFERENCES `professional` (`professional_id`);

--
-- Constraints for table `emergency_contact`
--
ALTER TABLE `emergency_contact`
  ADD CONSTRAINT `emergency_contact_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON DELETE CASCADE;

--
-- Constraints for table `medical_record`
--
ALTER TABLE `medical_record`
  ADD CONSTRAINT `medical_record_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `medical_record_ibfk_2` FOREIGN KEY (`professional_id`) REFERENCES `professional` (`professional_id`);

--
-- Constraints for table `medical_record_diagnosis`
--
ALTER TABLE `medical_record_diagnosis`
  ADD CONSTRAINT `medical_record_diagnosis_ibfk_1` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_record` (`medical_record_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `medical_record_diagnosis_ibfk_2` FOREIGN KEY (`diagnosis_id`) REFERENCES `diagnosis` (`diagnosis_id`);

--
-- Constraints for table `patient`
--
ALTER TABLE `patient`
  ADD CONSTRAINT `patient_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `patient_ibfk_2` FOREIGN KEY (`professional_id`) REFERENCES `professional` (`professional_id`);

--
-- Constraints for table `professional`
--
ALTER TABLE `professional`
  ADD CONSTRAINT `professional_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `professional_ibfk_2` FOREIGN KEY (`specialty_id`) REFERENCES `specialty` (`specialty_id`);

--
-- Constraints for table `task`
--
ALTER TABLE `task`
  ADD CONSTRAINT `task_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  ADD CONSTRAINT `task_ibfk_2` FOREIGN KEY (`professional_id`) REFERENCES `professional` (`professional_id`);

--
-- Constraints for table `user_access`
--
ALTER TABLE `user_access`
  ADD CONSTRAINT `user_access_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_access_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
