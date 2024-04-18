// src/utility/supabase.js

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabaseEmail = process.env.SUPABASE_EMAIL;
const supabasePassword = process.env.SUPABASE_PASSWORD;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Error: SUPABASE_URL or SUPABASE_ANON_KEY is not defined in the environment."
  );
  process.exit(1);
}

let supabase;

const initialize = async () => {
  try {
    // await new Promise((resolve) => setTimeout(resolve, 10000));
    supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.auth.signInWithPassword({
      email: supabaseEmail,
      password: supabasePassword,
    });

    console.log("logged into supabase");
  } catch (error) {
    console.error("Error initializing Supabase client:", error.message);
  }
};

await initialize();

export { supabase };
