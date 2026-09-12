CREATE TABLE `operationalResources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`resourceKey` varchar(32) NOT NULL,
	`resourceType` enum('ROUTE','SHELTER') NOT NULL,
	`status` varchar(32) NOT NULL,
	`owner` varchar(120) NOT NULL,
	`note` text,
	`updatedBy` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `operationalResources_id` PRIMARY KEY(`id`),
	CONSTRAINT `operationalResources_resourceKey_unique` UNIQUE(`resourceKey`)
);
