// Uses Brevo (formerly Sendinblue) HTTP API — works from any host (HTTPS, not SMTP)
// Render blocks outbound SMTP; this API call goes over port 443 which is never blocked.

async function sendEmail(to, subject, text, html) {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.EMAIL;

    console.log('[Email] Sending to:', to, '| From:', senderEmail, '| Brevo key set:', !!apiKey);

    if (!apiKey) {
      console.error('[Email] BREVO_API_KEY is not set!');
      return { success: false, error: 'BREVO_API_KEY env var missing' };
    }
    if (!senderEmail) {
      console.error('[Email] EMAIL env var is not set!');
      return { success: false, error: 'EMAIL env var missing' };
    }

    const toList = Array.isArray(to)
      ? to.map(e => ({ email: e }))
      : [{ email: to }];

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'VibeFit', email: senderEmail },
        to: toList,
        subject,
        htmlContent: html || text,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('[Email] Sent successfully! MessageId:', data.messageId);
      return { success: true, messageId: data.messageId };
    } else {
      console.error('[Email] Brevo API error:', JSON.stringify(data));
      return { success: false, error: JSON.stringify(data) };
    }
  } catch (error) {
    console.error('[Email] Unexpected error:', error.message);
    return { success: false, error: error.message };
  }
}

export { sendEmail };
