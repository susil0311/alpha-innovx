CREATE TABLE `sensorReadings` (
  `id` int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `sensorKey` varchar(64) NOT NULL,
  `metric` varchar(64) NOT NULL,
  `value` double NOT NULL,
  `unit` varchar(24) NOT NULL,
  `observedAt` timestamp NOT NULL,
  `receivedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `quality` enum('GOOD','STALE','INVALID') NOT NULL DEFAULT 'GOOD',
  `metadata` text
);

CREATE INDEX `sensorReadings_sensor_observed_idx` ON `sensorReadings` (`sensorKey`, `observedAt`);

CREATE TABLE `floodPredictions` (
  `id` int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `locationKey` varchar(64) NOT NULL,
  `state` enum('GREEN','YELLOW','ORANGE','RED') NOT NULL,
  `probability` double NOT NULL,
  `confidence` double NOT NULL,
  `leadTimeMinutes` int NOT NULL,
  `modelVersion` varchar(32) NOT NULL,
  `evidence` text NOT NULL,
  `limitations` text NOT NULL,
  `generatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX `floodPredictions_location_generated_idx` ON `floodPredictions` (`locationKey`, `generatedAt`);
