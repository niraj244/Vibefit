import nodemailer from 'nodemailer';

function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

async function sendEmail(to, subject, text, html) {
  try {
    const user = process.env.EMAIL;
    const pass = process.env.EMAIL_PASS;

    console.log('[Email] Attempting send to:', to);
    console.log('[Email] Auth user:', user, '| Pass set:', !!pass, '| Pass length:', pass?.length);

    if (!user || !pass) {
      console.error('[Email] Missing EMAIL or EMAIL_PASS env vars!');
      return { success: false, error: 'Missing email credentials' };
    }

    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: user,
      to,
      subject,
      text,
      html,
    });

    console.log('[Email] Sent successfully! MessageId:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email] Send failed:', error.message);
    return { success: false, error: error.message };
  }
}

export { sendEmail };
