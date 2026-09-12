CREATE TABLE `alertDrafts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`severity` enum('YELLOW','ORANGE','RED') NOT NULL,
	`affectedVillages` text NOT NULL,
	`validityFrom` timestamp NOT NULL,
	`validityUntil` timestamp NOT NULL,
	`expectedImpactAt` timestamp,
	`cascadeExplanation` text NOT NULL,
	`recommendedAction` text NOT NULL,
	`routeShelterDetails` text NOT NULL,
	`confidence` int NOT NULL,
	`englishMessage` text NOT NULL,
	`hindiMessage` text NOT NULL,
	`localMessage` text,
	`status` enum('DRAFT','ACKNOWLEDGED','APPROVED','ISSUED','CANCELLED','EXPIRED') NOT NULL DEFAULT 'DRAFT',
	`createdBy` int NOT NULL,
	`acknowledgedBy` int,
	`approvedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alertDrafts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` varchar(64) NOT NULL,
	`entityId` int NOT NULL,
	`action` varchar(80) NOT NULL,
	`actorId` int NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fieldReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportType` varchar(80) NOT NULL,
	`latitude` varchar(32),
	`longitude` varchar(32),
	`locationLabel` varchar(255) NOT NULL,
	`observedAt` timestamp NOT NULL,
	`severity` enum('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL,
	`description` text NOT NULL,
	`waterDepth` varchar(80),
	`roadBridgeStatus` varchar(120),
	`sensorCondition` varchar(120),
	`photoUrl` text,
	`status` enum('NEW','TRIAGED','VERIFIED','REJECTED') NOT NULL DEFAULT 'NEW',
	`submittedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fieldReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin','operator','approver','field_officer','viewer') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
