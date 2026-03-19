-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 11-03-2026 a las 03:20:52
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `medtrack`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `appointment`
--

CREATE TABLE `appointment` (
  `appointment_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `professional_id` int(11) NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `status` enum('pendiente','confirmada','cancelada') DEFAULT 'pendiente',
  `feedback` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `appointment`
--

INSERT INTO `appointment` (`appointment_id`, `patient_id`, `professional_id`, `appointment_date`, `appointment_time`, `status`, `feedback`) VALUES
(1, 1, 1, '2026-03-13', '10:00:00', 'confirmada', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `diagnosis`
--

CREATE TABLE `diagnosis` (
  `diagnosis_id` int(11) NOT NULL,
  `diagnosis_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `diagnosis`
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
-- Estructura de tabla para la tabla `emergency_contact`
--

CREATE TABLE `emergency_contact` (
  `emergency_contact_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `full_name` varchar(50) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `relationship` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `emergency_contact`
--

INSERT INTO `emergency_contact` (`emergency_contact_id`, `patient_id`, `full_name`, `phone`, `relationship`) VALUES
(1, 1, 'María Hernández', '5511223344', 'Madre');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medical_record`
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
-- Volcado de datos para la tabla `medical_record`
--

INSERT INTO `medical_record` (`medical_record_id`, `patient_id`, `professional_id`, `creation_date`, `consultation_reason`, `current_condition`, `childhood_adolescence`, `significant_events`, `abuse_history`, `therapeutic_goals`) VALUES
(1, 1, 1, '2026-03-10', 'Episodios de ansiedad recurrentes', NULL, NULL, NULL, NULL, 'Desarrollar técnicas de manejo de ansiedad');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medical_record_diagnosis`
--

CREATE TABLE `medical_record_diagnosis` (
  `id` int(11) NOT NULL,
  `medical_record_id` int(11) NOT NULL,
  `diagnosis_id` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `medical_record_diagnosis`
--

INSERT INTO `medical_record_diagnosis` (`id`, `medical_record_id`, `diagnosis_id`, `notes`, `created_at`) VALUES
(1, 1, 1, 'Ansiedad generalizada con episodios nocturnos, inicio hace 8 meses', '2026-03-10 19:41:41');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `patient`
--

CREATE TABLE `patient` (
  `patient_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `registration_date` date NOT NULL DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `patient`
--

INSERT INTO `patient` (`patient_id`, `user_id`, `registration_date`) VALUES
(1, 3, '2026-03-10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `professional`
--

CREATE TABLE `professional` (
  `professional_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `license_number` varchar(20) NOT NULL,
  `specialty_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `professional`
--

INSERT INTO `professional` (`professional_id`, `user_id`, `license_number`, `specialty_id`) VALUES
(1, 1, 'PSI-2024-001', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `role`
--

CREATE TABLE `role` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `role`
--

INSERT INTO `role` (`role_id`, `role_name`) VALUES
(3, 'paciente'),
(1, 'psicologa'),
(2, 'secretaria');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `specialty`
--

CREATE TABLE `specialty` (
  `specialty_id` int(11) NOT NULL,
  `specialty_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `specialty`
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
-- Estructura de tabla para la tabla `task`
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
-- Volcado de datos para la tabla `task`
--

INSERT INTO `task` (`task_id`, `patient_id`, `professional_id`, `title`, `content`, `due_date`, `status`, `image_path`, `therapist_comment`, `created_at`, `delivered_at`) VALUES
(1, 1, 1, 'Diario de emociones', 'Escribe cada noche cómo te sentiste durante el día y qué lo provocó.', '2026-03-17', 'pendiente', NULL, NULL, '2026-03-10 19:41:41', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
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
-- Volcado de datos para la tabla `user`
--

INSERT INTO `user` (`user_id`, `first_name`, `last_name`, `middle_name`, `birth_date`, `email`, `phone`) VALUES
(1, 'Ana', 'García López', NULL, '1985-03-15', 'psicologa@medtrack.com', '5512345678'),
(2, 'Laura', 'Martínez Ruiz', NULL, '1990-07-22', 'secretaria@medtrack.com', '5587654321'),
(3, 'Carlos', 'López Hernández', NULL, '2000-11-05', 'paciente@medtrack.com', '5599887766');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_access`
--

CREATE TABLE `user_access` (
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `user_access`
--

INSERT INTO `user_access` (`user_id`, `role_id`, `username`, `password`) VALUES
(1, 1, 'ana.garcia', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(2, 2, 'laura.martinez', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(3, 3, 'carlos.lopez', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `appointment`
--
ALTER TABLE `appointment`
  ADD PRIMARY KEY (`appointment_id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `professional_id` (`professional_id`);

--
-- Indices de la tabla `diagnosis`
--
ALTER TABLE `diagnosis`
  ADD PRIMARY KEY (`diagnosis_id`),
  ADD UNIQUE KEY `diagnosis_name` (`diagnosis_name`);

--
-- Indices de la tabla `emergency_contact`
--
ALTER TABLE `emergency_contact`
  ADD PRIMARY KEY (`emergency_contact_id`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indices de la tabla `medical_record`
--
ALTER TABLE `medical_record`
  ADD PRIMARY KEY (`medical_record_id`),
  ADD UNIQUE KEY `patient_id` (`patient_id`),
  ADD KEY `professional_id` (`professional_id`);

--
-- Indices de la tabla `medical_record_diagnosis`
--
ALTER TABLE `medical_record_diagnosis`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_record_diagnosis` (`medical_record_id`,`diagnosis_id`),
  ADD KEY `diagnosis_id` (`diagnosis_id`);

--
-- Indices de la tabla `patient`
--
ALTER TABLE `patient`
  ADD PRIMARY KEY (`patient_id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indices de la tabla `professional`
--
ALTER TABLE `professional`
  ADD PRIMARY KEY (`professional_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `specialty_id` (`specialty_id`);

--
-- Indices de la tabla `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indices de la tabla `specialty`
--
ALTER TABLE `specialty`
  ADD PRIMARY KEY (`specialty_id`),
  ADD UNIQUE KEY `specialty_name` (`specialty_name`);

--
-- Indices de la tabla `task`
--
ALTER TABLE `task`
  ADD PRIMARY KEY (`task_id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `professional_id` (`professional_id`);

--
-- Indices de la tabla `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `user_access`
--
ALTER TABLE `user_access`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `appointment`
--
ALTER TABLE `appointment`
  MODIFY `appointment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `diagnosis`
--
ALTER TABLE `diagnosis`
  MODIFY `diagnosis_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `emergency_contact`
--
ALTER TABLE `emergency_contact`
  MODIFY `emergency_contact_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `medical_record`
--
ALTER TABLE `medical_record`
  MODIFY `medical_record_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `medical_record_diagnosis`
--
ALTER TABLE `medical_record_diagnosis`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `patient`
--
ALTER TABLE `patient`
  MODIFY `patient_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `professional`
--
ALTER TABLE `professional`
  MODIFY `professional_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `role`
--
ALTER TABLE `role`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `specialty`
--
ALTER TABLE `specialty`
  MODIFY `specialty_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `task`
--
ALTER TABLE `task`
  MODIFY `task_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `appointment`
--
ALTER TABLE `appointment`
  ADD CONSTRAINT `appointment_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  ADD CONSTRAINT `appointment_ibfk_2` FOREIGN KEY (`professional_id`) REFERENCES `professional` (`professional_id`);

--
-- Filtros para la tabla `emergency_contact`
--
ALTER TABLE `emergency_contact`
  ADD CONSTRAINT `emergency_contact_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `medical_record`
--
ALTER TABLE `medical_record`
  ADD CONSTRAINT `medical_record_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `medical_record_ibfk_2` FOREIGN KEY (`professional_id`) REFERENCES `professional` (`professional_id`);

--
-- Filtros para la tabla `medical_record_diagnosis`
--
ALTER TABLE `medical_record_diagnosis`
  ADD CONSTRAINT `medical_record_diagnosis_ibfk_1` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_record` (`medical_record_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `medical_record_diagnosis_ibfk_2` FOREIGN KEY (`diagnosis_id`) REFERENCES `diagnosis` (`diagnosis_id`);

--
-- Filtros para la tabla `patient`
--
ALTER TABLE `patient`
  ADD CONSTRAINT `patient_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `professional`
--
ALTER TABLE `professional`
  ADD CONSTRAINT `professional_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `professional_ibfk_2` FOREIGN KEY (`specialty_id`) REFERENCES `specialty` (`specialty_id`);

--
-- Filtros para la tabla `task`
--
ALTER TABLE `task`
  ADD CONSTRAINT `task_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  ADD CONSTRAINT `task_ibfk_2` FOREIGN KEY (`professional_id`) REFERENCES `professional` (`professional_id`);

--
-- Filtros para la tabla `user_access`
--
ALTER TABLE `user_access`
  ADD CONSTRAINT `user_access_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_access_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
