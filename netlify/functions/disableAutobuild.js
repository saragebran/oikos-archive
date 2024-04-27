// disableAutoBuild.js
const fetch = require('node-fetch');

// Environment variables
const NETLIFY_ACCESS_TOKEN = process.env.NETLIFY_ACCESS_TOKEN;
const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID;

// Helper function to make authenticated API calls
async function fetchWithAuth(url, options) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${NETLIFY_ACCESS_TOKEN}`
  };
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
  }
  return response;
}

exports.handler = async (event, context) => {
  try {
    // Disable autobuild
    const disableUrl = `https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/build_settings`;
    console.log("Disabling autobuild...");
    await fetchWithAuth(disableUrl, {
      method: 'PATCH',
      body: JSON.stringify({ auto_build: false })
    });
    console.log("Autobuild disabled.");

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Autobuild disabled successfully." })
    };
  } catch (error) {
    console.error("Error during operation:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
