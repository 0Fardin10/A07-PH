# Better Auth on Vercel

## Vercel environment variables

In **Project Settings → Environment Variables**, configure these values and redeploy:

- `BETTER_AUTH_SECRET`: a private, high-entropy secret of at least 32 characters.
- `BETTER_AUTH_URL`: the production origin, for example `https://your-domain.com`, without a trailing slash.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: both are required to enable Google sign-in.
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`: optional; both are required to enable GitHub sign-in.

Use `.env.example` as the variable-name reference for local development. Do not commit real credentials.

## OAuth callback URLs

Register the matching callback URL with each OAuth provider, replacing `your-domain.com` with the origin used for `BETTER_AUTH_URL`:

- Google: `https://your-domain.com/api/auth/callback/google`
- GitHub: `https://your-domain.com/api/auth/callback/github`

For local testing, also register `http://localhost:3000/api/auth/callback/google` and/or `http://localhost:3000/api/auth/callback/github` with the corresponding provider.

## Database persistence

This repository does not currently configure a Better Auth database adapter. Add a persistent database and its Better Auth schema before relying on durable user and account records across deployments. Vercel environment variables and OAuth provider settings are managed in their respective dashboards and cannot be configured from this repository.