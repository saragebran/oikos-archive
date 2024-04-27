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
  console.log("Request URL:", url);  // Log the full URL being requested
  console.log("Request Options:", JSON.stringify(options));  // Log the full request options including headers and body
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorBody = await response.text();  // Retrieve the full error message from the response
    console.log("Error Response Body:", errorBody);  // Log the error body for more context
    throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
  }
  return response;
}

exports.handler = async (event, context) => {
  try {
    // Enable autobuild
    const enableUrl = `https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}`;
    console.log("Enabling autobuild...");
    await fetchWithAuth(enableUrl, {
      method: 'PATCH',
      body: JSON.stringify({ build_settings: { stop_builds: false } })
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
