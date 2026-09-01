import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
	api: {
		projectId: 'z8o776vu',
		dataset: 'production',
	},
	typegen: {
		path: './src/lib/**/*.{ts,tsx,js,jsx}',
		schema: './schema.json',
		generates: './sanity.types.ts',
		overloadClientMethods: true,
	},
})
