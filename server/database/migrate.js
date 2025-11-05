import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

const client = new Client({
    user: 'your_username', // replace with your database username
    host: 'localhost',
    database: 'your_database', // replace with your database name
    password: 'your_password', // replace with your database password
    port: 5432,
});

async function runMigration() {
    try {
        await client.connect();
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', '01_expand_universities.sql')).toString();
        await client.query(sql);
        console.log('Migration executed successfully.');
    } catch (err) {
        console.error('Error executing migration:', err);
    } finally {
        await client.end();
    }
}

runMigration();