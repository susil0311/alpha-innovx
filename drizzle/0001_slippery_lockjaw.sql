CREATE TABLE `commandTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskKey` varchar(32) NOT NULL,
	`status` enum('PENDING','COMPLETED') NOT NULL DEFAULT 'PENDING',
	`completedBy` int,
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commandTasks_id` PRIMARY KEY(`id`),
	CONSTRAINT `commandTasks_taskKey_unique` UNIQUE(`taskKey`)
);
