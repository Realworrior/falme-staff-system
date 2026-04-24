
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kgpcruwlejoougjbeouw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTable(tableName, testData) {
    console.log(`\n🔍 Testing Table: ${tableName}`);
    
    // 1. CREATE
    console.log(`  - Attempting INSERT...`);
    const { data: inserted, error: insertError } = await supabase.from(tableName).insert([testData]).select();
    if (insertError) {
        console.error(`  ❌ INSERT Failed:`, insertError.message);
        return false;
    }
    const recordId = inserted[0].id || inserted[0].ticket_id || inserted[0].date;
    const idField = inserted[0].ticket_id ? 'ticket_id' : (inserted[0].date ? 'date' : 'id');
    console.log(`  ✅ INSERT Success (ID: ${recordId})`);

    // 2. READ
    console.log(`  - Attempting SELECT...`);
    const { data: selected, error: selectError } = await supabase.from(tableName).select('*').eq(idField, recordId);
    if (selectError || !selected.length) {
        console.error(`  ❌ SELECT Failed:`, selectError?.message || "No record found");
    } else {
        console.log(`  ✅ SELECT Success`);
    }

    // 3. UPDATE
    console.log(`  - Attempting UPDATE...`);
    const updateData = tableName === 'tickets' ? { title: 'Updated Test Ticket' } : { status: 'UPDATED' };
    const { error: updateError } = await supabase.from(tableName).update(updateData).eq(idField, recordId);
    if (updateError) {
        console.error(`  ❌ UPDATE Failed:`, updateError.message);
    } else {
        console.log(`  ✅ UPDATE Success`);
    }

    // 4. DELETE
    console.log(`  - Attempting DELETE...`);
    const { error: deleteError } = await supabase.from(tableName).delete().eq(idField, recordId);
    if (deleteError) {
        console.error(`  ❌ DELETE Failed:`, deleteError.message);
    } else {
        console.log(`  ✅ DELETE Success`);
    }

    return true;
}

async function runTests() {
    console.log("🚀 Starting Global CRUD Verification...");

    const tests = [
        {
            name: 'tickets',
            data: { ticket_id: 'TEST-123', title: 'CRUD Test Ticket', category: 'General', comments: 'Testing...' }
        },
        {
            name: 'support_templates',
            data: { category: 'TEST_CAT', templates: [{ title: 'Test Tpl', responses: [{ type: 'Standard', text: 'Test' }] }] }
        },
        {
            name: 'aviator_logs',
            data: { id: `test-${Date.now()}`, ts: Date.now(), type: 'Slot 1', status: 'FAILED' }
        },
        {
            name: 'rota_overrides',
            data: { date: '2099-12-31', shifts: { AM: ['Test'], PM: [], NT: [] } }
        }
    ];

    for (const test of tests) {
        await testTable(test.name, test.data);
    }

    console.log("\n🏁 CRUD Verification Complete!");
}

runTests();
