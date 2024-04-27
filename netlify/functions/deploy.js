const fetch = require('node-fetch');

const ACCESS_TOKEN = process.env.NETLIFY_ACCESS_TOKEN; // Make sure to secure this token
const SITE_ID = process.env.NETLIFY_SITE_ID; // Your Netlify Site ID
const BUILD_HOOK = process.env.BUILD_HOOK;
const BUILD_HOOK_URL = `https://api.netlify.com/build_hooks/${BUILD_HOOK}`;

exports.handler = async (event, context) => {
  // Function to update the autobuild setting
  const updateAutoBuild = async (enable) => {
    const url = `https://api.netlify.com/api/v1/sites/${SITE_ID}/build_settings`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify({ auto_build: enable })
    });
    return response;
  };

  // Step 1: Enable autobuild
  const enableResponse = await updateAutoBuild(true);
  if (!enableResponse.ok) {
    return {
      statusCode: enableResponse.status,
      body: JSON.stringify({ message: "Failed to enable autobuild" })
    };
  }

  // Step 2: Trigger the build
  const triggerResponse = await fetch(BUILD_HOOK_URL, { method: 'POST' });
  if (!triggerResponse.ok) {
    return {
      statusCode: triggerResponse.status,
      body: JSON.stringify({ message: "Failed to trigger build" })
    };
  }

  // Step 3: Disable autobuild
  const disableResponse = await updateAutoBuild(false);
  if (!disableResponse.ok) {
    return {
      statusCode: disableResponse.status,
      body: JSON.stringify({ message: "Failed to disable autobuild" })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Build triggered and autobuild status updated successfully!" })
  };
};
