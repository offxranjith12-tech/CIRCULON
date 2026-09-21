import nodemailer from 'nodemailer';

export interface EmailNotification {
  id: string;
  to: string;
  companyName: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  type: 'approval' | 'rejection' | 'welcome';
  status: 'sent' | 'simulated';
  sentAt: string;
  loginUrl: string;
}

// In-memory store for dispatched email notifications (allows admin to review emails sent)
let dispatchedEmailLogs: EmailNotification[] = [
  {
    id: 'email-sample-1',
    to: 'admin@apexsteel.co',
    companyName: 'Apex Steel & Alloys',
    subject: 'Company Registration Approved - You Can Log In Now | CIRCULON',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #15803d; margin: 0; font-size: 24px;">CIRCULON</h2>
          <p style="color: #6b7280; font-size: 12px; margin-top: 4px;">Industrial Waste-to-Buyer Intelligence Network</p>
        </div>
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
          <h3 style="color: #166534; margin: 0 0 8px 0; font-size: 16px;">✓ Registration Approved by Administrator</h3>
          <p style="color: #14532d; font-size: 14px; margin: 0;">Your business documents and ID proof have been successfully verified.</p>
        </div>
        <p style="font-size: 15px; color: #374151; line-height: 1.6;">Dear <strong>Apex Steel & Alloys</strong> team,</p>
        <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
          Your company application on <strong>CIRCULON</strong> has been reviewed and officially <strong>APPROVED</strong> by our administrative team. Your account is now active and ready for use.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="http://localhost:3000/login" style="background-color: #16a34a; color: #ffffff; padding: 14px 28px; font-weight: bold; font-size: 15px; text-decoration: none; border-radius: 10px; display: inline-block;">
            Log In to CIRCULON Now →
          </a>
        </div>
        <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">
          Once logged in, you can browse verified industrial byproduct listings, generate instant AI material matching, and interact with verified sellers.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 11px; color: #9ca3af; text-align: center;">
          CIRCULON AI Intelligence Platform • Industrial Corridor, Tamil Nadu, India<br />
          For support contact: support@circulon.ai
        </p>
      </div>
    `,
    bodyText: 'Dear Apex Steel & Alloys team, Your company registration on CIRCULON has been APPROVED. You can log in now at http://localhost:3000/login',
    type: 'approval',
    status: 'simulated',
    sentAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    loginUrl: 'http://localhost:3000/login',
  }
];

export async function sendApprovalEmail({
  to,
  companyName,
  role = 'seller',
  loginUrl = 'http://localhost:3000/login',
}: {
  to: string;
  companyName: string;
  role?: string;
  loginUrl?: string;
}): Promise<{ success: boolean; message: string; notification: EmailNotification }> {
  const subject = `Company Registration Approved - You Can Log In Now | CIRCULON`;
  const roleLabel = role === 'buyer' ? 'Industrial Material Buyer / Recycler' : 'Industrial Waste Seller / Generator';

  const bodyHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px; background-color: #f9fafb;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <!-- Header Banner -->
                <tr>
                  <td style="background: linear-gradient(135deg, #15803d 0%, #16a34a 100%); padding: 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">CIRCULON</h1>
                    <p style="color: #dcfce7; font-size: 13px; margin: 6px 0 0 0; font-weight: 500;">
                      AI Industrial Waste-to-Buyer Intelligence Network
                    </p>
                  </td>
                </tr>

                <!-- Content Area -->
                <tr>
                  <td style="padding: 36px 32px;">
                    <!-- Approval Badge -->
                    <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; text-align: left;">
                      <div style="display: flex; align-items: center;">
                        <span style="font-size: 18px; line-height: 1; margin-right: 10px;">✅</span>
                        <div>
                          <strong style="color: #065f46; font-size: 15px; display: block;">Registration Verified & Approved</strong>
                          <span style="color: #047857; font-size: 13px;">Your company documents and ID proof have been approved by the Admin.</span>
                        </div>
                      </div>
                    </div>

                    <h2 style="color: #111827; font-size: 20px; font-weight: 800; margin: 0 0 16px 0;">
                      Welcome to CIRCULON, ${companyName}!
                    </h2>

                    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
                      Dear <strong>${companyName}</strong> team,
                    </p>
                    <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                      We are pleased to inform you that your registration as a verified <strong>${roleLabel}</strong> has been successfully reviewed and approved. 
                      You can now log in to the CIRCULON platform using your registered email address: <strong style="color: #111827;">${to}</strong>.
                    </p>

                    <!-- Role Details Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 28px;">
                      <tr>
                        <td style="padding: 16px 20px;">
                          <div style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Approved Account Role</div>
                          <div style="font-size: 15px; font-weight: 700; color: #15803d; margin-top: 4px;">${roleLabel}</div>
                          <div style="font-size: 12px; color: #6b7280; margin-top: 6px;">
                            ${role === 'buyer' 
                              ? 'Access the Buyer Portal, browse factory waste batches, post material requirements, and coordinate logistics.'
                              : 'Access the Seller Dashboard, list byproduct streams, run AI material matchmaking, and reach verified recyclers.'
                            }
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Action Button -->
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${loginUrl}" style="background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 12px; font-size: 16px; font-weight: 700; display: inline-block; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);">
                        You Can Log In Now →
                      </a>
                    </div>

                    <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0 0 24px 0;">
                      If the button does not work, copy and paste this link into your browser:<br />
                      <a href="${loginUrl}" style="color: #16a34a; word-break: break-all;">${loginUrl}</a>
                    </p>

                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0;" />

                    <h4 style="font-size: 13px; font-weight: 700; color: #374151; margin: 0 0 8px 0;">Next Steps:</h4>
                    <ul style="color: #4b5563; font-size: 13px; line-height: 1.6; margin: 0 0 24px 0; padding-left: 20px;">
                      <li>Visit the login page and sign in using your email and password.</li>
                      <li>Complete your material catalog specifications to improve AI match accuracy.</li>
                      <li>Receive real-time match recommendations from our automated matchmaking engine.</li>
                    </ul>

                    <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                      If you did not register for this account, please contact our security team immediately at <a href="mailto:support@circulon.ai" style="color: #16a34a;">support@circulon.ai</a>.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #030712; padding: 24px 32px; text-align: center;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0 0 6px 0;">
                      CIRCULON Inc. • Circular Industrial Intelligence Platform
                    </p>
                    <p style="color: #6b7280; font-size: 11px; margin: 0;">
                      Industrial Hub, Coimbatore & Chennai, Tamil Nadu, India • <a href="mailto:support@circulon.ai" style="color: #4ade80; text-decoration: none;">support@circulon.ai</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const bodyText = `
CIRCULON - Company Registration Approved!

Dear ${companyName} team,

Your company application on CIRCULON has been verified and APPROVED by the administrator.

Account: ${to}
Role: ${roleLabel}
Status: ACTIVE

You can log in now by visiting:
${loginUrl}

Best regards,
The CIRCULON Team
support@circulon.ai
  `.trim();

  let sentStatus: 'sent' | 'simulated' = 'simulated';

  // Check if SMTP is configured in environment
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const fromEmail = process.env.SMTP_FROM || 'CIRCULON Admin <no-reply@circulon.ai>';

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        text: bodyText,
        html: bodyHtml,
      });

      sentStatus = 'sent';
      console.log(`[EMAIL DISPATCHED via SMTP] to ${to}: ${subject}`);
    } catch (smtpErr) {
      console.warn('[EMAIL SMTP FAILED, falling back to simulated log]:', smtpErr);
      sentStatus = 'simulated';
    }
  } else {
    console.log(`[EMAIL NOTIFICATION DISPATCHED] To: ${to} | Subject: ${subject} | Link: ${loginUrl}`);
    sentStatus = 'simulated';
  }

  const notificationRecord: EmailNotification = {
    id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    to,
    companyName,
    subject,
    bodyHtml,
    bodyText,
    type: 'approval',
    status: sentStatus,
    sentAt: new Date().toISOString(),
    loginUrl,
  };

  dispatchedEmailLogs.unshift(notificationRecord);

  return {
    success: true,
    message: `Approval email notification successfully dispatched to ${to}! They can now log in.`,
    notification: notificationRecord,
  };
}

export async function sendRejectionEmail({
  to,
  companyName,
  reason,
}: {
  to: string;
  companyName: string;
  reason: string;
}): Promise<{ success: boolean; message: string; notification: EmailNotification }> {
  const subject = `Update Regarding Your CIRCULON Company Registration`;
  const bodyText = `Dear ${companyName} team, your registration could not be approved at this time. Reason: ${reason}. Please contact support@circulon.ai for questions.`;
  const bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #fee2e2; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #dc2626;">CIRCULON Application Update</h2>
      <p>Dear ${companyName} team,</p>
      <p>Thank you for submitting your business details to CIRCULON. Our admin team was unable to verify your company registration for the following reason:</p>
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 8px; color: #991b1b; font-size: 13px;">
        ${reason}
      </div>
      <p style="margin-top: 16px;">If you have any questions or have corrected documentation, please reply to <a href="mailto:support@circulon.ai">support@circulon.ai</a>.</p>
    </div>
  `;

  const notificationRecord: EmailNotification = {
    id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    to,
    companyName,
    subject,
    bodyHtml,
    bodyText,
    type: 'rejection',
    status: 'simulated',
    sentAt: new Date().toISOString(),
    loginUrl: 'http://localhost:3000/login',
  };

  dispatchedEmailLogs.unshift(notificationRecord);
  return {
    success: true,
    message: `Rejection notice dispatched to ${to}.`,
    notification: notificationRecord,
  };
}

export async function getDispatchedEmails(): Promise<EmailNotification[]> {
  return dispatchedEmailLogs;
}
