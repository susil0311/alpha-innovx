CREATE TABLE `alertDecisions` (
  `id` int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `locationKey` varchar(64) NOT NULL,
  `level` enum('GREEN','YELLOW','ORANGE','RED') NOT NULL,
  `probability` double NOT NULL,
  `confidence` double NOT NULL,
  `leadTimeMinutes` int NOT NULL,
  `reason` text NOT NULL,
  `limitations` text NOT NULL,
  `recommendedActions` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX `alertDecisions_location_created_idx` ON `alertDecisions` (`locationKey`, `createdAt`);
