// Uses SendGrid HTTP API — works from any host including Render (HTTPS port 443, never blocked)
// Free tier: 100 emails/day forever. Sign up at sendgrid.com — no domain needed, just verify your email.

async function sendEmail(to, subject, text, html) {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    const senderEmail = process.env.EMAIL;

    console.log('[Email] Sending to:', to, '| From:', senderEmail, '| API key set:', !!apiKey);

    if (!apiKey) {
      console.error('[Email] SENDGRID_API_KEY is not set!');
      return { success: false, error: 'SENDGRID_API_KEY env var missing' };
    }
    if (!senderEmail) {
      console.error('[Email] EMAIL env var is not set!');
      return { success: false, error: 'EMAIL env var missing' };
    }

    const toList = Array.isArray(to) ? to : [to];

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: toList.map(email => ({ email })) }],
        from: { email: senderEmail, name: 'VibeFit' },
        subject,
        content: [{ type: 'text/html', value: html || text }],
      }),
    });

    if (response.status === 202) {
      console.log('[Email] Sent successfully to:', to);
      return { success: true, messageId: `sg-${Date.now()}` };
    } else {
      const data = await response.json();
      console.error('[Email] SendGrid error:', JSON.stringify(data));
      return { success: false, error: JSON.stringify(data) };
    }
  } catch (error) {
    console.error('[Email] Unexpected error:', error.message);
    return { success: false, error: error.message };
  }
}

export { sendEmail };
