# Sending PDFs to WhatsApp

Use a backend (Cloud Function or your server) to call WhatsApp Cloud API or Twilio WhatsApp. Frontend alone cannot send WhatsApp messages.

## WhatsApp Cloud API (Meta)
1. Create a Meta app, enable WhatsApp, get `WHATSAPP_ACCESS_TOKEN` and `PHONE_NUMBER_ID`.
2. From backend, POST to:
```
POST https://graph.facebook.com/v17.0/{PHONE_NUMBER_ID}/messages
Authorization: Bearer WHATSAPP_ACCESS_TOKEN
Content-Type: application/json

{
  "messaging_product": "whatsapp",
  "to": "<customer_mobile_in_msisdn>",
  "type": "document",
  "document": {
    "link": "https://your-bucket/report.pdf",
    "filename": "LabReport.pdf"
  }
}
```

## Twilio WhatsApp
1. Verify WhatsApp sandbox/business.
2. Send via Twilio REST API from backend:
```
POST https://api.twilio.com/2010-04-01/Accounts/{SID}/Messages.json
Auth: {SID}:{TOKEN}
Body:
  To=whatsapp:+<customer>
  From=whatsapp:+<your_twilio_number>
  Body=Your report is ready. Link: https://your-bucket/report.pdf
```

## Recommended flow
- Frontend uploads PDF to Firebase Storage, gets URL.
- Frontend calls your secured backend endpoint with `to`, `pdfUrl`.
- Backend calls WhatsApp API and returns status.

Secure the endpoint (Auth token / Firebase Auth) and avoid exposing WhatsApp credentials to the client.
