const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the email from the request body
    const { email } = JSON.parse(event.body);

    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Valid email required' })
      };
    }

    // Submit to Substack's API from server-side (no CORS issues!)
    const response = await fetch('https://memoirsofalanguagemodel.substack.com/api/v1/free', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        first_url: event.headers.referer || 'https://technejad.github.io/Memoirs-of-a-Language-Model/',
      })
    });

    // Check if Substack accepted the subscription
    if (response.ok || response.status === 303) {
      // 303 is a redirect which Substack uses for success
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Subscription successful! Check your email to confirm.'
        })
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Subscription submitted! Check your email to confirm.'
        })
      };
    }
  } catch (error) {
    console.error('Subscription error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Subscription failed. Please try again.',
        details: error.message
      })
    };
  }
};
