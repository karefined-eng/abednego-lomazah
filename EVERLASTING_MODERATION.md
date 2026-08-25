# #EVERLASTING moderation workflow

## What happens when a visitor submits a word

The public form sends the visitor’s name and message to `/api/tributes`. The server strips angle brackets, enforces length limits, assigns a unique id, and stores the record in both the pending moderation list and a durable Vercel KV archive. The visitor receives a confirmation that the word is awaiting review. It is not returned by the public wall API while it is pending.

## How the reviewer publishes a word

1. Configure the Vercel production environment variable `TRIBUTE_ADMIN_TOKEN` with a strong random secret. It must be set for the Production environment and a fresh deployment must be created after adding or rotating it.
2. Open `https://abednego-lomazah-site.vercel.app/everlasting-admin.html`.
3. Enter the token. The page stores it only in the current browser session and sends it in an `Authorization: Bearer` header; it is not placed in the URL or in the repository.
4. Read each pending word. Correct spelling or remove identifying details with **Save edit** when appropriate, then review the edited copy again.
5. Select **Approve & publish** to update the durable archive, copy the reviewed record to `everlasting_tributes_public`, and mark the pending record as published. It will appear on the public wall on the next fetch, subject to the public cache window.
6. Select **Reject & archive** for a submission that should not be published. The record is updated in the durable archive, retained in the KV list `everlasting_tributes_rejected`, and marked rejected in the pending list; it is not permanently deleted.

## Exporting approved messages

After signing in on the review page, use **Download approved CSV** for a spreadsheet-friendly copy or **Backup approved JSON** for a complete machine-readable backup of published messages. The additional **Backup all CSV** and **Backup all JSON** controls export pending, published, and rejected records from the durable archive. All downloads are authenticated by the server-side review token and include the submission id, author, message, category, status, and available moderation timestamps. Save the downloaded files in a private location because they contain user-submitted messages. The application retains up to 10,000 records in its archive and moderation lists.

## Security boundaries

The admin page is marked `noindex`, but that is not authentication. The real protection is the server-side `TRIBUTE_ADMIN_TOKEN` check. Do not put the token in HTML, JavaScript, Git, a query string, a screenshot, or a shared public document. If the token is exposed, rotate it in Vercel and redeploy. The archive is initialized from the existing pending, published, and rejected lists the first time the updated API is used; future submissions and moderation edits are written to the durable archive automatically.

This first version uses one shared reviewer token. If several people will moderate, the next improvement should be individual accounts with an audit trail, rather than sharing the same secret. Submissions remain text-only for now; visitor-uploaded images or videos should not be enabled until file-type, size, storage, and moderation rules are added.
