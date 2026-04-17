import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data, error } = await supabase.from('questions').select('category, difficulty');
    if (error) { console.error(error); return; }
    const counts = {};
    for (const row of data) {
        const key = `${row.category}-${row.difficulty}`;
        counts[key] = (counts[key] || 0) + 1;
    }
    console.log(counts);
}
main();
