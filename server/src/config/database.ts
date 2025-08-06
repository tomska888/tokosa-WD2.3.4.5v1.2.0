import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import dotenv from 'dotenv'
import { UserTable, GoalTable } from '../types/db.js'

dotenv.config()

const isTest = process.env.NODE_ENV === 'test'
const connectionString = isTest
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    isTest
      ? '❌ TEST_DATABASE_URL is not defined in your .env'
      : '❌ DATABASE_URL is not defined in your .env'
  )
}

const pool = new Pool({
  connectionString,
  ssl: {
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