import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kgpcruwlejoougjbeouw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const newCategories = [
    {
        category: 'DEPOSITS — M-PESA',
        templates: [
            {
                title: 'Failed Deposit',
                triggers: ['deposit haikuingia', 'mpesa code', 'deposit failed', 'niliweka'],
                emotions: ['neutral', 'urgent', 'impatient'],
                responses: [
                    { type: 'Standard', text: 'Tafadhali tutumie ile M-PESA message yako kama text, au ile code ya herufi 10 kutoka kwa SMS (mfano: UA58134GTJ). Usitume screenshot au mini-statement — haifanyi kazi. Tukipata code, tutacheck saa hii 🔍' },
                    { type: 'High Empathy', text: 'Pole sana kwa inconvenience 🙏 Tafadhali tutumie ile M-PESA message yako kama text, au ile code ya herufi 10 kutoka kwa SMS (mfano: UA58134GTJ). Usitume screenshot au mini-statement — haifanyi kazi. Tukipata code, tutacheck saa hii 🔍' }
                ]
            }
        ]
    },
    {
        category: 'WITHDRAWALS & TRANSACTIONS',
        templates: [
            {
                title: 'Urgent Withdrawal',
                triggers: ['where is my money', 'withdrawal not received', 'pesa yangu iko wapi', 'sijaona doo', 'withdrawal haijaingia'],
                emotions: ['urgent', 'angry', 'impatient'],
                responses: [
                    { type: 'Standard', text: 'Ombi lako limepokewa na linashughulikiwa. Tafadhali tushirikishe nambari yako ya simu ✦ kiasi ulichoomba ✦ na wakati halisi wa ombi. Tutaangalia mara moja.' },
                    { type: 'High Empathy', text: 'Tunaelewa hii ni muhimu sana 🙏 Ombi lako limepokewa na linashughulikiwa. Tafadhali tushirikishe nambari yako ya simu ✦ kiasi ulichoomba ✦ na wakati halisi wa ombi. Tutaangalia mara moja.' }
                ]
            }
        ]
    },
    {
        category: 'RESPONSIBLE GAMING',
        templates: [
            {
                title: 'RG Distress',
                triggers: ['lost everything', 'nimeosha', 'can\'t stop', 'nisaidie kuwacha', 'nimechomeka'],
                emotions: ['distress'],
                responses: [
                    { type: 'Standard', text: 'Please remember that betting should always stay within your limits. If you feel overwhelmed, we strongly encourage you to take a break. You can activate self-exclusion by visiting betfalme.ke/delete-account ✦ go to Profile ✦ DELETE Account ✦ choose your exclusion period ✦ confirm.' },
                    { type: 'High Empathy', text: 'We hear you and we truly care about your well-being 🙏 Please remember that betting should always stay within your limits. If you feel overwhelmed, we strongly encourage you to take a break. You can activate self-exclusion by visiting betfalme.ke/delete-account ✦ go to Profile ✦ DELETE Account ✦ choose your exclusion period ✦ confirm. We\'re proud of you for reaching out.' }
                ]
            }
        ]
    },
    {
        category: 'CASHBACK — 10%',
        templates: [
            {
                title: 'Cashback Query',
                triggers: ['where is my cashback', 'cashback yangu iko wapi', 'cashback leo', 'bonasi'],
                emotions: ['neutral', 'impatient'],
                responses: [
                    { type: 'Standard', text: 'Cashback inaingia automatically kila siku saa 2 usiku (8:35 PM) 🙂 Kama ulikuwa na net loss — yaani deposits zako zilikuwa zaidi ya withdrawals — itaingia automatically. Hakuna kitu unahitaji kufanya.' },
                    { type: 'Alt Angry', text: 'Cashback inaingia automatically kila siku saa 2 usiku (8:35 PM). Kama ulikuwa na net loss — yaani deposits zako zilikuwa zaidi ya withdrawals — itaingia automatically. Hakuna kitu unahitaji kufanya. Kama bado haijaingia baada ya 8:35 PM, tutumie nambari yako tucheck.' }
                ]
            }
        ]
    },
    {
        category: 'SPORTS BETTING DISPUTES',
        templates: [
            {
                title: 'Voided Bet — Placed After Match',
                triggers: ['bet ilifutwa', 'why was my bet cancelled', 'imefutwa'],
                emotions: ['angry', 'confused'],
                responses: [
                    { type: 'Official Decision', text: 'Tunaelewa hii inaudhi sana 🙏 Baada ya review, system iliconfirm kwamba bet iliwekwa baada ya match kuanza. Kwa mujibu wa betting rules na T&Cs zetu, bets zote lazima ziwekwe kabla ya kick-off isipokuwa ni live market. Kwa sababu hiyo, bet ilivoidwa na uamuzi huu ni wa mwisho. Tukiwa na maswali zaidi, tuko hapa kusaidia.' },
                    { type: 'Shorter Version', text: 'Baada ya review, system iliconfirm kwamba bet iliwekwa baada ya match kuanza. Kwa mujibu wa betting rules na T&Cs zetu, bets zote lazima ziwekwe kabla ya kick-off isipokuwa ni live market. Kwa sababu hiyo, bet ilivoidwa na uamuzi huu ni wa mwisho.' }
                ]
            }
        ]
    },
    {
        category: 'HARD CASES — REFUND REFUSAL',
        templates: [
            {
                title: 'Refund Demand',
                triggers: ['refund me', 'give my money back', 'nirudishie pesa', 'rudisha doo'],
                emotions: ['angry', 'threatening'],
                responses: [
                    { type: 'Firm Policy', text: 'Please be advised that we do not offer refunds on completed bets or deposits unless a verified system error occurred. We have reviewed your account and found no system faults.' },
                    { type: 'Empathy', text: 'We understand your frustration 🙏 However, please be advised that we do not offer refunds on completed bets or deposits unless a verified system error occurred. We have reviewed your account and found no system faults.' }
                ]
            }
        ]
    },
    {
        category: 'THREATENING CLIENT',
        templates: [
            {
                title: 'Compliance & Audit Confidence',
                triggers: ['i\'ll report you', 'lawyer', 'authority', 'nitaripoti'],
                emotions: ['threatening'],
                responses: [
                    { type: 'Standard', text: 'We operate in full compliance with the Betting Control and Licensing Board (BCLB) regulations. All our transactions and bet histories are independently audited. You are welcome to escalate this matter to the relevant authorities, and we will cooperate fully with their review by providing your complete account logs.' }
                ]
            }
        ]
    }
];

async function seedNewTemplates() {
    console.log("Seeding new categories to Supabase...");
    for (const cat of newCategories) {
        const { data, error } = await supabase.from('support_templates').insert([cat]).select();
        if (error) {
            console.error(`Error inserting ${cat.category}:`, error.message);
        } else {
            console.log(`Successfully inserted ${cat.category}`);
        }
    }
    console.log("Seeding complete!");
}

seedNewTemplates();
