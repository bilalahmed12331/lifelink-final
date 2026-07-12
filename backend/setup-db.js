const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: ''
    });

    console.log('Connected to MySQL server');

    const schemaPath = path.join(__dirname, 'src', 'config', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    const statements = schema.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
        if (statement.trim()) {
            try {
                await connection.query(statement);
                console.log('Executed:', statement.substring(0, 50) + '...');
            } catch (error) {
                console.error('Error executing statement:', error.message);
            }
        }
    }

    await connection.end();
    console.log('Database setup complete');
}

setupDatabase().catch(console.error);
