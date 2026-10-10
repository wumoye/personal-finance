import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Next.js uses .env.local; load the same file for the Prisma CLI.
config({ path: '.env.local', quiet: true });
config({ quiet: true });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Generation/build need no credentials; database commands require a real URL.
    url: process.env.DIRECT_URL,
  },
});
