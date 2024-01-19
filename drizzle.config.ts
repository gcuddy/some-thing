import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	out: './drizzle/migrations/',
	strict: true,
	schema: './src/**/*.sql.ts',
	verbose: true,
	driver: 'turso',
	dbCredentials: {
		url: process.env.VITE_TURSO_DB_URL as string,
		authToken: process.env.VITE_TURSO_DB_AUTH_TOKEN as string
	}
})
