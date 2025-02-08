const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(express.json());

// Load Supabase credentials from .env
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Debug log to check if environment variables are loaded
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: Missing Supabase URL or API key in .env file.');
  process.exit(1); // Exit the process if credentials are missing
} else {
  console.log('Supabase URL:', SUPABASE_URL);
  console.log('Supabase Key:', '********'); // Mask the key for security
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    const payload = req.body;

    // Debug log to show the received payload
    console.log('Received payload:', payload);

    // Extract fields from the 'args' object
    const { patient_name, reason, call_time, status } = payload.args || {};

    // Insert data into Supabase
    const { data, error } = await supabase
      .from('recent_calls')
      .insert([
        {
          patient_name,
          reason,
          call_time,
          status,
        },
      ]);

    if (error) {
      console.error('Error inserting data into Supabase:', error);
      return res.status(500).send('Failed to save data');
    }

    console.log('Data saved successfully'); // Debug log

    res.status(200).send('Data saved successfully');
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});