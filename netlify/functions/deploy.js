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
  return await fetch(url, { ...options, headers });
};

const updateAutoBuild = async (enable) => {
  const url = `https://api.netlify.com/api/v1/sites/${SITE_ID}/build_settings`;
  return await fetchWithAuth(url, {
    method: 'PATCH',
    body: JSON.stringify({ auto_build: enable })
  });
};

const triggerBuild = async () => {
  return await fetchWithAuth(BUILD_HOOK_URL, { method: 'POST' });
};

exports.handler = async (event, context) => {
  try {
    // Step 1: Enable autobuild
    const enableResponse = await updateAutoBuild(true);
    if (!enableResponse.ok) throw new Error("Failed to enable autobuild");

    // Step 2: Trigger the build
    const triggerResponse = await triggerBuild();
    if (!triggerResponse.ok) throw new Error("Failed to trigger build");

    // Step 3: Disable autobuild
    const disableResponse = await updateAutoBuild(false);
    if (!disableResponse.ok) throw new Error("Failed to disable autobuild");

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Build triggered and autobuild status updated successfully!" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message })
    };
  }
};
