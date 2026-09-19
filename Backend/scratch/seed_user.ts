import { pool } from '../src/config/db.js';
import bcrypt from 'bcrypt';

async function seedAdmin() {
  const hash = await bcrypt.hash('password', 10);
  const pin = await bcrypt.hash('1234', 10);
  await pool.query(
    `INSERT INTO users (id, username, password, name, role, must_change_password, pin_code_hash, email) 
     VALUES (1, 'admin', $1, 'NEXUS Administrator', 'ADMINISTRATOR', false, $2, 'admin@nexuspos.com') 
     ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password`,
    [hash, pin]
  );
  console.log('Seeded admin user credentials cleanly.');
  await pool.end();
}

seedAdmin().catch(console.error);
