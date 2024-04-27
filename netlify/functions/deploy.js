const fetch = require('node-fetch');

const ACCESS_TOKEN = process.env.NETLIFY_ACCESS_TOKEN;
const SITE_ID = process.env.NETLIFY_SITE_ID;
const BUILD_HOOK = process.env.BUILD_HOOK;
const BUILD_HOOK_URL = `https://api.netlify.com/build_hooks/${BUILD_HOOK}`;

const fetchWithAuth = async (url, options) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ACCESS_TOKEN}`
  };
  console.log("Fetching with options:", { ...options, headers });
  const response = await fetch(url, { ...options, headers });
  console.log(`Response from ${url}:`, response.status);
  return response;
};

const updateAutoBuild = async (enable) => {
  const url = `https://api.netlify.com/api/v1/sites/${SITE_ID}/build_settings`;
  console.log(`Updating autobuild to ${enable} at ${url}`);
  return await fetchWithAuth(url, {
    method: 'PATCH',
    body: JSON.stringify({ auto_build: enable })
  });
};

const triggerBuild = async () => {
  console.log(`Triggering build at ${BUILD_HOOK_URL}`);
  return await fetchWithAuth(BUILD_HOOK_URL, { method: 'POST' });
};

exports.handler = async (event, context) => {
  try {
    console.log("Handler started");
    
    // Step 1: Enable autobuild
    console.log("Enabling autobuild...");
    const enableResponse = await updateAutoBuild(true);
    if (!enableResponse.ok) throw new Error(`Failed to enable autobuild: ${await enableResponse.text()}`);

    // Step 2: Trigger the build
    console.log("Triggering the build...");
    const triggerResponse = await triggerBuild();
    if (!triggerResponse.ok) throw new Error(`Failed to trigger build: ${await triggerResponse.text()}`);

    // Step 3: Disable autobuild
    console.log("Disabling autobuild...");
    const disableResponse = await updateAutoBuild(false);
    if (!disableResponse.ok) throw new Error(`Failed to disable autobuild: ${await disableResponse.text()}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Build triggered and autobuild status updated successfully!" })
    };
  } catch (error) {
    console.error("Error in handler:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message })
    };
  }
};
