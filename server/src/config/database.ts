import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import dotenv from 'dotenv'
import { UserTable, GoalTable } from '../types/db.js'

// Load .env in dev & test only
if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}

const isTest = process.env.NODE_ENV === 'test'
const connectionString = isTest
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL

// In tests we *must* have TEST_DATABASE_URL
if (isTest && !connectionString) {
  throw new Error('❌ TEST_DATABASE_URL is not defined in your .env')
}

// In production we assume DATABASE_URL will be injected at runtime.
// If it really is missing, let PG throw a connection error instead of crashing at import time.
if (!isTest && !connectionString) {
  console.warn('⚠️  DATABASE_URL is not defined; proceeding without an early throw')
}

const pool = new Pool({
  connectionString,
  ssl: isTest
    ? false
    : {
        // for managed Postgres/Aurora etc.
        rejectUnauthorized: false,
      },
})

interface Database {
  users: UserTable
  goals: GoalTable
}

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
})