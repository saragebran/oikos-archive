// combinedBuildFunction.js
const fetch = require('node-fetch');

// Environment variables
const NETLIFY_ACCESS_TOKEN = process.env.NETLIFY_ACCESS_TOKEN;
const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID;
const BUILD_HOOK = process.env.BUILD_HOOK;

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
    // Enable autobuild
    const enableUrl = `https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/build_settings`;
    console.log("Enabling autobuild...");
    await fetchWithAuth(enableUrl, {
      method: 'PATCH',
      body: JSON.stringify({ auto_build: true })
    });
    console.log("Autobuild enabled.");

    // Trigger the build
    const buildUrl = `https://api.netlify.com/build_hooks/${BUILD_HOOK}`;
    console.log("Triggering the build...");
    await fetchWithAuth(buildUrl, { method: 'POST' });
    console.log("Build triggered.");

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Autobuild enabled and build triggered successfully." })
    };
  } catch (error) {
    console.error("Error during operation:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
