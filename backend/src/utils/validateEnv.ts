/**
 * Environment Variable Validator
 * Checks for required environment variables before server starts
 */

const REQUIRED_ENV_VARS = [
    'PORT',
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'DB_PORT',
    'NODE_ENV',
    'JWT_SECRET',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET'
] as const;

export function validateEnv(): void {
    const missing: string[] = [];
    const empty: string[] = [];

    for (const envVar of REQUIRED_ENV_VARS) {
        const value = process.env[envVar];
        if (value === undefined) {
            missing.push(envVar);
        } else if (value.trim() === '') {
            empty.push(envVar);
        }
    }

    if (missing.length > 0 || empty.length > 0) {
        console.error('\nEnvironment Variable Check Failed!\n');

        if (missing.length > 0) {
            console.error('Missing variables:');
            missing.forEach(v => console.error(`  - ${v}`));
        }

        if (empty.length > 0) {
            console.error('Empty variables:');
            empty.forEach(v => console.error(`  - ${v}`));
        }

        console.error('\nRefer to .env.example for required variables.\n');
        process.exit(1);
    }

    console.log('All environment variables validated successfully');
}
