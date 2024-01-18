import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	out: './migrations/',
	strict: true,
	schema: './src/**/*.sql.ts',
	verbose: true,
	driver: 'd1',
	dbCredentials: {
		dbName: 'sk_rep',
		wranglerConfigPath: './wrangler.toml'
	}
})
