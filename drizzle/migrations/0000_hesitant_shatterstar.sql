CREATE TABLE `replicache_client` (
	`time_created` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`time_updated` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`time_deleted` integer,
	`id` text(36) PRIMARY KEY NOT NULL,
	`client_group_id` text(36) NOT NULL,
	`last_mutation_id` integer DEFAULT 0 NOT NULL,
	`client_version` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `replicache_client_group` (
	`time_created` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`time_updated` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`time_deleted` integer,
	`id` text(36) PRIMARY KEY NOT NULL,
	`user_id` text(16) NOT NULL,
	`cvr_version` integer,
	`client_version` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `replicache_cvr` (
	`time_created` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`time_updated` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`time_deleted` integer,
	`data` text NOT NULL,
	`id` integer NOT NULL,
	`client_group_id` text(36) NOT NULL,
	`client_version` integer NOT NULL,
	PRIMARY KEY(`client_group_id`, `id`)
);
--> statement-breakpoint
CREATE TABLE `replicache_server` (
	`id` integer PRIMARY KEY NOT NULL,
	`version` integer
);
--> statement-breakpoint
CREATE TABLE `todos` (
	`time_created` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`time_updated` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`time_deleted` integer,
	`id` text PRIMARY KEY NOT NULL,
	`text` text,
	`completed` integer,
	`archived_at` integer,
	`notes` text,
	`user_id` text NOT NULL,
	`version` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL
);
