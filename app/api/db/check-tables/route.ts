import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    // Query to list all tables in the database
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `
    
    const tablesResult = await pool.query(tablesQuery)
    const tables = tablesResult.rows.map(row => row.table_name)
    
    // If we find a users-related table, get its structure
    const userTables = tables.filter(table => 
      table.toLowerCase().includes('user') || 
      table.toLowerCase().includes('member') ||
      table.toLowerCase().includes('participant') ||
      table.toLowerCase().includes('team')
    )
    
    let tableStructures: any = {}
    
    for (const table of userTables) {
      const structureQuery = `
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `
      const structureResult = await pool.query(structureQuery, [table])
      tableStructures[table] = structureResult.rows
    }
    
    return NextResponse.json({
      success: true,
      allTables: tables,
      userRelatedTables: userTables,
      tableStructures: tableStructures
    })
  } catch (error: any) {
    console.error('Database check error:', error)
    return NextResponse.json(
      { 
        error: 'Database connection failed', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}