// netlify/functions/send-confirmation.js
const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  try {
    // Only allow POST
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
    }

    // Parse request body
    let data = {};
    try {
      data = JSON.parse(event.body || "{}");
    } catch {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid JSON body" }),
      };
    }

    // Expected fields from your front-end
    const fullName = (data.fullName || "").trim();
    const email = (data.email || "").trim();
    const course = (data.course || "").trim();

    if (!fullName || !email) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing fullName or email" }),
      };
    }

    const GMAIL_FROM = process.env.GMAIL_FROM;
    const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

    if (!GMAIL_FROM || !GMAIL_APP_PASSWORD) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error:
            "Server is missing GMAIL_FROM or GMAIL_APP_PASSWORD env variables.",
        }),
      };
    }

    // Create transporter (Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_FROM,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    // Email content
    const subject = "Rody Babaran Digital Education — Enrollment Received";
const html = `
<div style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:680px;margin:0 auto;padding:28px;">
    <div style="background:#ffffff;border:1px solid #e6e9f2;border-radius:14px;overflow:hidden;">

      <!-- HEADER (blue background only here) -->
      <div style="background:#0b2a4a;padding:22px 22px 18px 22px;text-align:center;">
        <img
          src="https://i.imgur.com/zpxUXa5.png"
          alt="Rody Babaran Digital Education"
          width="90"
          style="display:block;margin:0 auto 12px auto;border-radius:50%;"
        />
        <div style="font-size:16px;font-weight:700;letter-spacing:.4px;color:#ffffff;">
          Rody Babaran Digital Education
        </div>
        <div style="font-size:13px;margin-top:4px;color:#ffffff;">
          Enrollment Confirmation
        </div>
      </div>
      <!-- END HEADER -->

      <!-- BODY (white background) -->
      <div style="padding:22px;color:#111827;background:#ffffff;">
        <h2 style="margin:0 0 10px 0;color:#0b2a4a;font-weight:700;">
          Enrollment Received
        </h2>

        <p style="margin:0 0 10px 0;">Hi <b>${escapeHtml(fullName)}</b>,</p>

        <p style="margin:0 0 12px 0;">
          Thank you for registering with <b>Rody Babaran Digital Education</b>.
        </p>

        ${
          course
            ? `<p style="margin:0 0 12px 0;"><b>Selected Course:</b> ${escapeHtml(course)}</p>`
            : ""
        }

        <div style="margin-top:16px;padding:14px;border-radius:12px;background:#fff7ed;border:1px solid #fed7aa;">
          <b style="color:#b91c1c;">Next Step (IMPORTANT)</b><br/><br/>
          Your Enrollment is not yet confirmed. Please message Pastor Rody on Facebook Messenger to confirm your enrollment:<br/>
          <a href="https://m.me/PastorRodyBabaran">https://m.me/PastorRodyBabaran</a>
        </div>

        <p style="margin-top:20px;margin-bottom:0;">
          Blessings,<br/>
          <b>Pastor Rody Babaran, B.Th, M.CE</b>
        </p>

        <hr style="margin:18px 0;border:none;border-top:1px solid #e5e7eb;" />

        <p style="font-size:12px;color:#666;margin:0;">
          This email was sent automatically to confirm your enrollment submission.
        </p>
      </div>
      <!-- END BODY -->

    </div>
  </div>
</div>
`;



    // Send email
    await transporter.sendMail({
      from: `Rody Babaran Digital Education <${GMAIL_FROM}>`,
      to: email,
      subject,
      html,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Email send failed",
        details: err?.message || String(err),
      }),
    };
  }
};

// Simple HTML escape to avoid breaking email layout
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

