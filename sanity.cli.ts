import {loadEnv} from 'vite'
import {defineCliConfig} from 'sanity/cli'

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), 'PUBLIC_')

export default defineCliConfig({
	api: {
		projectId: env.PUBLIC_SANITY_PROJECT_ID || 'z8o776vu',
		dataset: env.PUBLIC_SANITY_DATASET || 'production',
	},
	typegen: {
		path: './src/lib/**/*.{ts,tsx,js,jsx}',
		schema: './schema.json',
		generates: './sanity.types.ts',
		overloadClientMethods: true,
	},
})
