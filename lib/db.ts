import { Pool } from 'pg'

// Create a connection pool for better performance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:turing1123@gpai.cluster-cnbeqlnoaeg9.us-west-2.rds.amazonaws.com:5432/production',
  ssl: {
    rejectUnauthorized: false // Required for AWS RDS
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export default pool

// Helper function to verify user exists in GPAI database
export async function verifyGPAIUser(email: string): Promise<boolean> {
  try {
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM users 
        WHERE LOWER(email) = LOWER($1)
      ) as exists
    `
    const result = await pool.query(query, [email])
    return result.rows[0]?.exists || false
  } catch {
    // Error verifying GPAI user
    // You might want to check the actual table structure
    // Let's try a more generic query
    try {
      const altQuery = `
        SELECT COUNT(*) as count 
        FROM users 
        WHERE LOWER(email) = LOWER($1)
      `
      const altResult = await pool.query(altQuery, [email])
      return (altResult.rows[0]?.count || 0) > 0
    } catch {
      // Alternative query also failed
      return false
    }
  }
}

// Get user details from GPAI database
export async function getGPAIUser(email: string) {
  try {
    const query = `
      SELECT id, email, name, created_at 
      FROM users 
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `
    const result = await pool.query(query, [email])
    return result.rows[0] || null
  } catch {
    // Error getting GPAI user
    return null
  }
}