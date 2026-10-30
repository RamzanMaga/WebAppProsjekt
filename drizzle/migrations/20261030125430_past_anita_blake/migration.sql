CREATE TABLE `ansatt_reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`floor_id` integer NOT NULL,
	`week_start` text NOT NULL,
	`checks` text NOT NULL,
	`comment` text NOT NULL,
	`status` text NOT NULL,
	`reviewed_by` integer NOT NULL,
	CONSTRAINT `fk_ansatt_reviews_floor_id_floors_id_fk` FOREIGN KEY (`floor_id`) REFERENCES `floors`(`id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ansatt_reviews_floor_week_unique` ON `ansatt_reviews` (`floor_id`,`week_start`);