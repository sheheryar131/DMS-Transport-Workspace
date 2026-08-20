# DMS Transport Workspace

A Monday-style transport operations workspace designed to replace the current Monday.com Transport workspace while leaving existing Jotform forms/apps unchanged.

## V1 modules

- Dashboard
- Master Bookings
- Daily Vehicle Checks
- Submitted Transfer Forms
- Fleet / Vehicle Register
- Stock Register
- Staff Directory
- ASTP Compliance
- Incident & Hazard Reporting
- Integrations
- Automation map

## Architecture

`Jotform apps/forms -> Netlify webhook -> Supabase/Postgres -> DMS Transport Workspace`

Jotform remains the mobile data-collection layer for support workers/drivers. The application only receives submission data; it does not edit Jotform forms.

## Current prototype

The frontend is dependency-free and can be deployed directly to Netlify. It uses representative sample records only; the Monday export files are deliberately not committed to avoid exposing operational data.

## Netlify

The repository includes `netlify.toml` and a serverless function at:

`/.netlify/functions/jotform-webhook`

Alias:

`/api/jotform`

Before enabling the webhook, configure these environment variables in Netlify:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JOTFORM_WEBHOOK_SECRET`

Then the intended webhook URL is:

`https://YOUR-DOMAIN/api/jotform?key=YOUR_SECRET`

Do **not** configure this in Jotform until the database is ready and a test submission has been validated.

## Database

Run `supabase/schema.sql` in a Supabase project. The schema contains relational tables for bookings, staff, ASTP compliance, vehicles, checks, transfer logs, incidents, stock and raw Jotform submissions.

## Local preview

Because the frontend is static, any local HTTP server works. For example:

```bash
python -m http.server 8888
```

Then open `http://localhost:8888`.

## Data migration

The next migration step will import the existing Monday exports into Supabase after the database project is connected. Raw exports should stay outside the public web root and outside public Git history.
