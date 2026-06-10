// Provider-agnostic WhatsApp send. THE AI's push is a BUSINESS-INITIATED message,
// so it must use a pre-APPROVED template with variables — free-text is blocked by
// WhatsApp. Implement sendTemplate() for the chosen provider (Twilio or Meta
// Cloud API); nothing else in the bot needs to change.

export function credsFromEnv(env = process.env) {
  // Twilio shape (recommended). Swap for Meta Cloud API if chosen.
  const c = {
    accountSid: env.TWILIO_ACCOUNT_SID,
    authToken: env.TWILIO_AUTH_TOKEN,
    from: env.TWILIO_WHATSAPP_FROM,     // e.g. 'whatsapp:+14155238886'
    contentSid: env.TWILIO_TEMPLATE_SID, // approved template (Content API)
  };
  return Object.values(c).every(Boolean) ? c : null;
}

// Send the approved template to `to` (E.164, e.g. +5511999999999) with ordered
// `vars` (e.g. [TeamA, TeamB, 'h–a']). TODO: implement once the provider + the
// approved template are set up (see WHATSAPP_BOT.md).
export async function sendTemplate(to, vars, creds) {
  void to; void vars; void creds;
  throw new Error('WhatsApp provider not implemented yet — pick Twilio or Meta Cloud API (WHATSAPP_BOT.md)');
}
