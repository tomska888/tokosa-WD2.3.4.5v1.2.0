import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import dotenv from 'dotenv'
import { UserTable, GoalTable } from '../types/db.js'

// Load .env in dev & test only
if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}

const isTest = process.env.NODE_ENV === 'test'

// Use TEST_DATABASE_URL in tests, otherwise DATABASE_URL
const connectionString =
  isTest ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL

// Fail fast if missing in test
if (isTest && !connectionString) {
  throw new Error('❌ TEST_DATABASE_URL is not defined in your .env/CI')
}

// Decide SSL: Neon requires TLS; also honor sslmode=require
const needsTls =
  /neon\.tech/i.test(connectionString ?? '') ||
  /sslmode=require/i.test(connectionString ?? '') ||
  isTest // our tests use Neon branch

const pool = new Pool({
  connectionString,
  ssl: needsTls ? { rejectUnauthorized: false } : false,
})

interface Database {
  users: UserTable
  goals: GoalTable
}

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
})
