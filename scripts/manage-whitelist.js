#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const whitelistPath = path.join(__dirname, '../lib/whitelist-emails.ts');

function readWhitelist() {
  const content = fs.readFileSync(whitelistPath, 'utf8');
  const match = content.match(/export const WHITELISTED_EMAILS = \[([\s\S]*?)\]/);
  if (!match) return [];
  
  const emails = match[1]
    .split('\n')
    .map(line => {
      const emailMatch = line.match(/['"]([^'"]+)['"]/);
      return emailMatch ? emailMatch[1] : null;
    })
    .filter(email => email && !email.includes('//'));
  
  return emails;
}

function writeWhitelist(emails) {
  const uniqueEmails = [...new Set(emails.map(e => e.toLowerCase().trim()))];
  const emailLines = uniqueEmails.map(email => `  '${email}',`).join('\n');
  
  const content = `// Manual whitelist for bypassing email verification
// Add emails here that should automatically be marked as verified
// This is for testing and special cases only

export const WHITELISTED_EMAILS = [
  // Add emails here in lowercase
${emailLines}
  // Add more emails as needed
]

export function isEmailWhitelisted(email: string): boolean {
  return WHITELISTED_EMAILS.includes(email.toLowerCase().trim())
}`;
  
  fs.writeFileSync(whitelistPath, content);
}

const command = process.argv[2];
const email = process.argv[3];

if (!command) {
  console.log('Usage:');
  console.log('  node scripts/manage-whitelist.js add <email>');
  console.log('  node scripts/manage-whitelist.js remove <email>');
  console.log('  node scripts/manage-whitelist.js list');
  process.exit(1);
}

switch (command) {
  case 'add':
    if (!email) {
      console.error('Please provide an email to add');
      process.exit(1);
    }
    const currentEmails = readWhitelist();
    if (currentEmails.includes(email.toLowerCase())) {
      console.log(`Email ${email} is already whitelisted`);
    } else {
      currentEmails.push(email.toLowerCase());
      writeWhitelist(currentEmails);
      console.log(`✅ Added ${email} to whitelist`);
    }
    break;
    
  case 'remove':
    if (!email) {
      console.error('Please provide an email to remove');
      process.exit(1);
    }
    const emails = readWhitelist();
    const filtered = emails.filter(e => e.toLowerCase() !== email.toLowerCase());
    if (filtered.length === emails.length) {
      console.log(`Email ${email} was not in whitelist`);
    } else {
      writeWhitelist(filtered);
      console.log(`✅ Removed ${email} from whitelist`);
    }
    break;
    
  case 'list':
    const list = readWhitelist();
    if (list.length === 0) {
      console.log('No emails in whitelist');
    } else {
      console.log('Whitelisted emails:');
      list.forEach(email => console.log(`  - ${email}`));
    }
    break;
    
  default:
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}