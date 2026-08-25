// ==========================================
// SUPABASE CONFIGURATION
// ==========================================

const SUPABASE_URL =
    "https://xmankokjmwantzshulkt.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Rf7RBn1_EthLgbc-TwTTmg_cgxma5io";


// ==========================================
// CREATE SUPABASE CLIENT
// ==========================================

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );