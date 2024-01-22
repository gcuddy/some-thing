CREATE TABLE `lists` (
	`time_created` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`time_updated` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`time_deleted` integer,
	`id` text(16) PRIMARY KEY NOT NULL,
	`user_id` text,
	`name` text,
	`index` integer DEFAULT 0,
	`shared` text DEFAULT 'private',
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE todos ADD `list_id` text REFERENCES lists(id);--> statement-breakpoint
/*
 SQLite does not support "Creating foreign key on existing column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/