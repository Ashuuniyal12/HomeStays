const { exec } = require('child_process');
require('dotenv').config();

// Fallback found in index.ts
if (!process.env.DATABASE_URL) {
    console.log('Using fallback DATABASE_URL from index.ts');
    process.env.DATABASE_URL = "postgresql://neondb_owner:npg_Vpo5Iw1yKlSR@ep-royal-union-ahn7elce-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
}

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'FOUND' : 'NOT FOUND');

if (process.env.DATABASE_URL) {
    // Use db push for non-interactive schema push
    const command = 'npx prisma db push --accept-data-loss';
    const child = exec(command, { env: process.env });

    child.stdout.on('data', (data) => console.log(data));
    child.stderr.on('data', (data) => console.error(data));

    child.on('exit', (code) => {
        console.log(`Child process exited with code ${code}`);
        process.exit(code);
    });
} else {
    console.error('DATABASE_URL is missing!');
}
