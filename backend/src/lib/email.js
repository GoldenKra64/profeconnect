const { Resend } = require("resend");

const DEFAULT_FROM = "ProfeConnect <onboarding@resend.dev>";

function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

function isResendTestMode() {
  return String(process.env.RESEND_TEST_MODE || "").toLowerCase() === "true";
}

function getTestRecipient() {
  return (process.env.RESEND_TEST_TO_EMAIL || "").trim();
}

function getMailer() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  return new Resend(process.env.RESEND_API_KEY);
}

async function sendEmail({ to, subject, html, text, required = false }) {
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;
  const mailer = getMailer();
  const testMode = isResendTestMode();
  const testRecipient = getTestRecipient();
  const recipient = testMode ? testRecipient : to;
  const finalSubject = testMode ? `[TEST] ${subject}` : subject;
  const finalHtml = testMode
    ? html.replace("</div>\n    </div>", `${paragraph(`Destinatario original: ${to}`)}</div>\n    </div>`)
    : html;
  const finalText = testMode
    ? `${text}\n\nDestinatario original: ${to}`
    : text;

  if (!mailer || !process.env.RESEND_FROM_EMAIL) {
    const message = `Correo no enviado porque Resend no esta configurado: ${subject} -> ${to}`;

    if (process.env.NODE_ENV === "production") {
      const error = new Error(message);
      error.statusCode = 500;
      throw error;
    }

    console.info("[email:dev]", {
      to: recipient || to,
      originalTo: testMode ? to : undefined,
      from,
      subject: finalSubject,
      text: finalText,
    });
    return null;
  }

  if (testMode && !testRecipient) {
    const message = "RESEND_TEST_MODE esta activo, pero RESEND_TEST_TO_EMAIL no esta configurado";

    if (process.env.NODE_ENV === "production" || required) {
      const error = new Error(message);
      error.statusCode = 500;
      throw error;
    }

    console.warn(message);
    console.info("[email:dev]", {
      to,
      from,
      subject: finalSubject,
      text: finalText,
    });
    return null;
  }

  const { data, error } = await mailer.emails.send({
    from,
    to: recipient,
    subject: finalSubject,
    html: finalHtml,
    text: finalText,
  });

  if (error) {
    const sendError = new Error(error.message || "No se pudo enviar el correo");
    sendError.statusCode = required || process.env.NODE_ENV === "production" ? 500 : undefined;
    throw sendError;
  }

  return data;
}

function paragraph(value) {
  return `<p style="margin:0 0 12px;color:#334155;line-height:1.5">${value}</p>`;
}

function button(url, label) {
  return `<p style="margin:24px 0"><a href="${url}" style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:8px">${label}</a></p>`;
}

function layout(title, body) {
  return `
    <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:24px">
        <h1 style="margin:0 0 16px;color:#0f172a;font-size:22px">${title}</h1>
        ${body}
        <p style="margin:24px 0 0;color:#64748b;font-size:12px">ProfeConnect</p>
      </div>
    </div>
  `;
}

async function sendRegistrationReceivedEmail(request) {
  return sendEmail({
    to: request.institutionalEmail,
    subject: "Solicitud de registro recibida",
    html: layout(
      "Solicitud recibida",
      [
        paragraph(`Hola ${request.firstName}, recibimos correctamente tu solicitud de registro.`),
        paragraph("Un administrador revisara la informacion y te notificaremos cuando sea aprobada o rechazada."),
      ].join("")
    ),
    text: `Hola ${request.firstName}, recibimos correctamente tu solicitud de registro. Un administrador revisara la informacion.`,
  });
}

async function sendInstitutionalVerificationEmail(request, verificationUrl) {
  return sendEmail({
    to: request.institutionalEmail,
    subject: "Verifica tu correo institucional",
    required: true,
    html: layout(
      "Verifica tu correo institucional",
      [
        paragraph(`Hola ${request.firstName}, confirma que este correo institucional te pertenece para activar tu cuenta.`),
        button(verificationUrl, "Verificar correo"),
        paragraph("Si no solicitaste este registro, puedes ignorar este mensaje."),
      ].join("")
    ),
    text: `Verifica tu correo institucional abriendo este enlace: ${verificationUrl}`,
  });
}

async function sendRegistrationApprovedEmail(request) {
  return sendEmail({
    to: request.institutionalEmail,
    subject: "Solicitud de registro aprobada",
    html: layout(
      "Solicitud aprobada",
      [
        paragraph(`Hola ${request.firstName}, tu solicitud fue aprobada.`),
        paragraph("Ya puedes iniciar sesion en ProfeConnect con tu correo institucional y contrasena."),
      ].join("")
    ),
    text: `Hola ${request.firstName}, tu solicitud fue aprobada. Ya puedes iniciar sesion en ProfeConnect.`,
  });
}

async function sendRegistrationRejectedEmail(request) {
  const reason = request.reviewComment
    ? paragraph(`Motivo: ${request.reviewComment}`)
    : "";

  return sendEmail({
    to: request.institutionalEmail,
    subject: "Solicitud de registro rechazada",
    html: layout(
      "Solicitud rechazada",
      [
        paragraph(`Hola ${request.firstName}, tu solicitud de registro fue rechazada.`),
        reason,
        paragraph("Si crees que se trata de un error, contacta con la administracion de la institucion."),
      ].join("")
    ),
    text: `Hola ${request.firstName}, tu solicitud de registro fue rechazada.${request.reviewComment ? ` Motivo: ${request.reviewComment}` : ""}`,
  });
}

async function sendInstitutionalAccountActivatedEmail(request) {
  return sendEmail({
    to: request.institutionalEmail,
    subject: "Cuenta activada",
    html: layout(
      "Cuenta activada",
      [
        paragraph(`Hola ${request.firstName}, tu correo institucional fue verificado correctamente.`),
        paragraph("Tu cuenta docente ya esta activa y puedes iniciar sesion en ProfeConnect."),
      ].join("")
    ),
    text: `Hola ${request.firstName}, tu cuenta docente ya esta activa y puedes iniciar sesion en ProfeConnect.`,
  });
}

module.exports = {
  isEmailConfigured,
  sendRegistrationReceivedEmail,
  sendInstitutionalVerificationEmail,
  sendRegistrationApprovedEmail,
  sendRegistrationRejectedEmail,
  sendInstitutionalAccountActivatedEmail,
};
