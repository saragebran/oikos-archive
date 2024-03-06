const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const url = 'https://api.netlify.com/build_hooks/65e88b7276bd4a0b6a8c10b1';

  try {
    const response = await fetch(url, {
      method: 'POST',
    });

    if (response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Build triggered successfully!" }),
      };
    } else {
      return {
        statusCode: response.status,
        body: JSON.stringify({ message: "Failed to trigger build" }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
