import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { APP_NAME } from "@/lib/constants";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || "contact@aneesh-pissay.in";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SMTP_HOST = process.env.SMTP_HOST || "smtpout.secureserver.net";
const SMTP_DEBUG = process.env.SMTP_DEBUG === "true";
const IS_DEV = process.env.NODE_ENV === "development";

function smtpPortsToTry(): number[] {
  const preferred = Number(process.env.SMTP_PORT || 587);
  const fallbacks = preferred === 465 ? [587] : [465];
  return [...new Set([preferred, ...fallbacks])];
}

function createSmtpTransport(port: number) {
  const secure = port === 465;
  const options: SMTPTransport.Options = {
    host: SMTP_HOST,
    port,
    secure,
    auth:
      EMAIL_USER && EMAIL_PASSWORD
        ? { user: EMAIL_USER, pass: EMAIL_PASSWORD }
        : undefined,
    requireTLS: port === 587,
    tls: {
      rejectUnauthorized: false,
      minVersion: "TLSv1.2",
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
    ...(SMTP_DEBUG ? { debug: true, logger: true } : {}),
  };
  return nodemailer.createTransport(options);
}

function logDevActionLink(label: string, url: string) {
  if (!IS_DEV) return;
  console.log(`\n[DEV] SMTP unavailable — ${label}`);
  console.log(url);
}

async function sendMailWithFallback(
  mailOptions: nodemailer.SendMailOptions,
  devActionUrl?: string
): Promise<nodemailer.SentMessageInfo> {
  if (!EMAIL_USER || !EMAIL_PASSWORD) {
    if (devActionUrl) logDevActionLink("copy this link manually", devActionUrl);
    throw new Error("Email credentials are not configured (EMAIL_USER / EMAIL_PASSWORD)");
  }

  const ports = smtpPortsToTry();
  let lastError: Error | null = null;

  for (const port of ports) {
    try {
      const transporter = createSmtpTransport(port);
      return await transporter.sendMail(mailOptions);
    } catch (error: unknown) {
      const err = error as Error & { code?: string };
      lastError = err;
      const retryable =
        err.code === "ESOCKET" ||
        err.code === "ECONNECTION" ||
        err.code === "ECONNRESET" ||
        err.code === "ETIMEDOUT";
      const hasMore = port !== ports[ports.length - 1];
      if (retryable && hasMore) continue;
      break;
    }
  }

  if (devActionUrl) logDevActionLink("copy this link manually", devActionUrl);
  throw lastError ?? new Error("Failed to send email");
}

export function buildEmailHtml({
  title,
  greeting,
  bodyHtml,
  actionUrl,
  actionLabel,
  footerNote,
}: {
  title: string;
  greeting: string;
  bodyHtml: string;
  actionUrl: string;
  actionLabel: string;
  footerNote: string;
}): string {
  const greetingLine = greeting
    ? `<h2 style="margin:0 0 12px;font-size:20px;font-weight:700;">Hi ${greeting},</h2>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0a0a0a;color:#e5e5e5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#141414;border:1px solid #262626;border-radius:16px;">
      <tr>
        <td style="padding:28px 32px;border-bottom:1px solid #262626;">
          <p style="margin:0;font-size:18px;font-weight:800;color:#a78bfa;">${APP_NAME}</p>
          <h1 style="margin:16px 0 0;font-size:24px;font-weight:800;">${title}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          ${greetingLine}
          ${bodyHtml}
          <p style="margin:28px 0;">
            <a href="${actionUrl}" style="display:inline-block;padding:14px 28px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:10px;font-weight:600;">${actionLabel}</a>
          </p>
          <p style="margin:0 0 8px;font-size:13px;color:#a3a3a3;">Or copy and paste this link:</p>
          <p style="margin:0;padding:12px 14px;background:#1a1a1a;border:1px solid #262626;border-radius:8px;font-size:12px;word-break:break-all;color:#a78bfa;">${actionUrl}</p>
          <p style="margin:24px 0 0;font-size:12px;color:#a3a3a3;">${footerNote}</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function formatGreetingName(
  email: string,
  options?: { firstName?: string | null; username?: string }
): string {
  const first = options?.firstName?.trim();
  if (first) return first;

  const local = (email.split("@")[0] ?? "").trim();
  const parts = local.split(/[._-]+/).filter((p) => p.length > 1);
  if (parts.length >= 2) {
    return parts
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join(" ");
  }

  const single = parts[0] ?? options?.username ?? "";
  if (single && single.length <= 16 && /^[A-Za-z][a-z]+$/.test(single)) {
    return single.charAt(0).toUpperCase() + single.slice(1).toLowerCase();
  }

  return "";
}

export async function sendHtmlEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  await sendMailWithFallback({
    from: `"${APP_NAME}" <${EMAIL_FROM}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}

export async function sendVerificationEmail(
  email: string,
  username: string,
  token: string
): Promise<void> {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}`;
  const greeting = formatGreetingName(email, { username });

  await sendMailWithFallback(
    {
      from: `"${APP_NAME}" <${EMAIL_FROM}>`,
      to: email,
      subject: `Verify your email — ${APP_NAME}`,
      html: buildEmailHtml({
        title: "Verify your email",
        greeting,
        bodyHtml: `<p style="margin:0;font-size:15px;line-height:1.6;color:#d4d4d4;">Thanks for signing up for <strong>${APP_NAME}</strong>. Please verify your email to access your workspace.</p>`,
        actionUrl: verificationUrl,
        actionLabel: "Verify Email Address",
        footerNote:
          "This link expires in 24 hours. If you did not create this account, you can safely ignore this email.",
      }),
    },
    verificationUrl
  );
}

export async function sendPasswordResetEmail(
  email: string,
  username: string,
  token: string,
  firstName?: string | null
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  const greeting = formatGreetingName(email, { username, firstName });

  await sendMailWithFallback(
    {
      from: `"${APP_NAME}" <${EMAIL_FROM}>`,
      to: email,
      subject: `Reset your password — ${APP_NAME}`,
      html: buildEmailHtml({
        title: "Reset your password",
        greeting,
        bodyHtml: `<p style="margin:0;font-size:15px;line-height:1.6;color:#d4d4d4;">We received a request to reset your ${APP_NAME} password. Click below to choose a new password.</p>`,
        actionUrl: resetUrl,
        actionLabel: "Reset Password",
        footerNote:
          "This link expires in 1 hour. If you did not request a reset, ignore this email.",
      }),
    },
    resetUrl
  );
}
