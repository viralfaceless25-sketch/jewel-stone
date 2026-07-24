# Custom quotation workflow

Customer journey:

1. Customer uploads one to six reference images, attaches a public reference link, or does both.
2. Customer completes design choices and submits contact details.
3. Website creates a private status link and emails confirmation.
4. Owner receives request details, image attachments, and a private owner-workspace link.
5. Owner enters estimated price/range, estimated production time, validity date, and notes.
6. Customer receives email, opens status page, then accepts or declines quotation.
7. Owner receives decision, marks accepted piece in production, then adds shipping tracking.
8. Customer receives production and shipping notifications from same status page.

## Production configuration

Set these server-only values in hosting provider's encrypted environment settings:

```dotenv
NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN
RESEND_API_KEY=re_...
INQUIRY_TO_EMAIL=owner@YOUR_DOMAIN
INQUIRY_FROM_EMAIL="Jewel Stone <inquiries@YOUR_VERIFIED_DOMAIN>"
UPSTASH_REDIS_REST_URL=https://YOUR_DATABASE.upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` persist requests across devices and deployments. `KV_REST_API_URL` and `KV_REST_API_TOKEN` are supported aliases.

Development without Redis uses ignored local file `.data/custom-requests.json`. Production intentionally refuses new tracked requests when durable storage is missing.

Reference images are validated and sent as attachments in owner's original request email. Database stores filenames and sizes, not image contents. Reference links remain available inside owner workspace.

Owner workspace uses unguessable passwordless link from notification email. Treat link as confidential. Add authenticated staff accounts before multiple team members need access or audit history.
