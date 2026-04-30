// Uses Gmail API over HTTPS — completely free, 500 emails/day, no SMTP ports needed.
// Requires GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN env vars.
// See setup instructions in the conversation.

import { google } from 'googleapis';

function getGmailClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

async function sendEmail(to, subject, text, html) {
  try {
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const senderEmail = process.env.EMAIL;

    console.log('[Email] Sending to:', to);
    console.log('[Email] Gmail OAuth - clientId set:', !!clientId, '| secret set:', !!clientSecret, '| refresh token set:', !!refreshToken);

    if (!clientId || !clientSecret || !refreshToken || !senderEmail) {
      console.error('[Email] Missing Gmail OAuth env vars!');
      return { success: false, error: 'Missing GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, or EMAIL' };
    }

    const gmail = getGmailClient();
    const toList = Array.isArray(to) ? to.join(', ') : to;

    const message = [
      `To: ${toList}`,
      `From: VibeFit <${senderEmail}>`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      html || text,
    ].join('\r\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });

    console.log('[Email] Sent successfully via Gmail API! ID:', result.data.id);
    return { success: true, messageId: result.data.id };
  } catch (error) {
    console.error('[Email] Gmail API error:', error.message);
    return { success: false, error: error.message };
  }
}

export { sendEmail };
