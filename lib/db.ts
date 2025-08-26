/**
 * GPAI Database Connection Module
 * 
 * This module handles the connection to the GPAI competition database
 * and provides functions to verify user registration status.
 * 
 * Security Note: Only users registered in the main GPAI database
 * are allowed to create accounts and submit to the competition.
 */

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
    console.log(`Verifying GPAI user: ${email}`)
    
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM users 
        WHERE LOWER(email) = LOWER($1)
      ) as exists
    `
    const result = await pool.query(query, [email])
    const exists = result.rows[0]?.exists || false
    
    console.log(`GPAI verification result for ${email}: ${exists}`)
    return exists
  } catch (error) {
    console.error('Error verifying GPAI user:', error)
    // Return false on error to maintain security
    // Only registered GPAI users should be allowed
    return false
  }
}

// Get user details from GPAI database
export async function getGPAIUser(email: string) {
  try {
    const query = `
      SELECT id, email, "isGuest", "createdAt" 
      FROM users 
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `
    const result = await pool.query(query, [email])
    return result.rows[0] || null
  } catch (error) {
    console.error('Error getting GPAI user details:', error)
    return null
  }
}