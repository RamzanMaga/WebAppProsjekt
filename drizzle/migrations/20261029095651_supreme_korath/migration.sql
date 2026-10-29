CREATE TABLE `buildings` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE `floors` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`building_id` integer NOT NULL,
	`number` integer NOT NULL,
	CONSTRAINT `fk_floors_building_id_buildings_id_fk` FOREIGN KEY (`building_id`) REFERENCES `buildings`(`id`)
);
--> statement-breakpoint
CREATE TABLE `auth_sessions` (
	`token_hash` text PRIMARY KEY,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	CONSTRAINT `fk_auth_sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`booking_id` integer PRIMARY KEY AUTOINCREMENT,
	`user_id` integer NOT NULL,
	`building_id` integer NOT NULL,
	`type` text NOT NULL,
	`date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	CONSTRAINT `fk_bookings_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_bookings_building_id_buildings_id_fk` FOREIGN KEY (`building_id`) REFERENCES `buildings`(`id`)
);
--> statement-breakpoint
CREATE TABLE `task_items` (
	`task_items_id` integer PRIMARY KEY AUTOINCREMENT,
	`task_id` text NOT NULL,
	`user_id` integer NOT NULL,
	`plan_id` integer,
	`week` integer,
	`reviewed_by` integer,
	`ansatt_rapport` text,
	`titles` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'todo' NOT NULL,
	`completed_at` text,
	CONSTRAINT `fk_task_items_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`),
	CONSTRAINT `fk_task_items_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_task_items_plan_id_task_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `task_plans`(`id`),
	CONSTRAINT `fk_task_items_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE TABLE `task_plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`floor_id` integer NOT NULL,
	`week_start` text NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`review_status` text DEFAULT 'pending' NOT NULL,
	`reviewed_by` integer,
	`ansatt_rapport` text,
	`reviewed_at` text,
	CONSTRAINT `fk_task_plans_floor_id_floors_id_fk` FOREIGN KEY (`floor_id`) REFERENCES `floors`(`id`),
	CONSTRAINT `fk_task_plans_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `first_name` text;--> statement-breakpoint
ALTER TABLE `users` ADD `last_name` text;--> statement-breakpoint
ALTER TABLE `users` ADD `password_hash` text;--> statement-breakpoint
ALTER TABLE `users` ADD `role` text DEFAULT 'student' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `building_id` integer REFERENCES buildings(id);--> statement-breakpoint
ALTER TABLE `users` ADD `floor_id` integer REFERENCES floors(id);--> statement-breakpoint
ALTER TABLE `tasks` ADD `floor_id` integer REFERENCES floors(id);--> statement-breakpoint
ALTER TABLE `tasks` ADD `status` text DEFAULT 'todo' NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `description` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `approved` integer REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `tasks` ADD `ansat_rapport` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `date` text;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_task_items_plan_task` ON `task_items` (`plan_id`,`task_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_task_plans_floor_week` ON `task_plans` (`floor_id`,`week_start`);