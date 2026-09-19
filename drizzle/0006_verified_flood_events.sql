CREATE TABLE `floodEvents` (
  `id` int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `eventKey` varchar(64) NOT NULL,
  `locationKey` varchar(64) NOT NULL,
  `startedAt` timestamp NOT NULL,
  `endedAt` timestamp NULL,
  `severity` enum('WATCH','WARNING','FLASH_FLOOD','DEBRIS_FLOW') NOT NULL,
  `verified` int NOT NULL DEFAULT 0,
  `verificationSource` varchar(255) NOT NULL,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `floodEvents_eventKey_unique` UNIQUE (`eventKey`)
);

CREATE INDEX `floodEvents_location_started_idx` ON `floodEvents` (`locationKey`, `startedAt`);
