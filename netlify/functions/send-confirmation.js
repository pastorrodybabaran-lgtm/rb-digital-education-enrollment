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
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2>Enrollment Received</h2>
        <p>Hi <b>${escapeHtml(fullName)}</b>,</p>
        <p>Thank you for registering with <b>Rody Babaran Digital Education</b>.</p>
        ${
          course
            ? `<p><b>Selected Course:</b> ${escapeHtml(course)}</p>`
            : ""
        }
        <p><b>Next Step:</b> "IMPORTANT!", Please message Pastor Rody on Facebook Messenger to confirm your enrollment. https://m.me/PastorRodyBabaran</p>
        <p style="margin-top:20px;">Blessings,<br/>Pastor Rody Babaran, B.Th, M.CE</p>
        <hr/>
        <p style="font-size:12px;color:#666;">
          This email was sent automatically to confirm your enrollment submission.
        </p>
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

