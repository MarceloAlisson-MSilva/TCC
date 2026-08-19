import dotenv from 'dotenv';
import { defineConfig } from '@prisma/config';

// Carrega as variáveis de ambiente
dotenv.config();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
});