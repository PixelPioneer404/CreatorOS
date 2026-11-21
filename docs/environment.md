# Creator OS Environment Configuration Guide

This document lists all environment variables required for **V1: Foundation**, their purpose, visibility, and how to configure them.

---

## 1. Backend Environment Variables (`server/.env`)

| Variable | Description | Type | Visibility | Required in V1? |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Application environment (`development` or `production`) | String | Private (Server) | Yes |
| `PORT` | Port the Express server listens on (default: `5000`) | Number | Private (Server) | Yes |
| `CLIENT_URL` | Frontend origin for CORS policy (default: `http://localhost:5173`) | String | Private (Server) | Yes |
| `DATABASE_URL` | PostgreSQL connection URI for Supabase database | String | Private (Server) | Yes (for live DB operations) |
| `SUPABASE_URL` | Supabase project URL (`https://<project-ref>.supabase.co`) | String | Private (Server) | Yes |
| `SUPABASE_ANON_KEY` | Supabase public anon key | String | Private (Server) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for server admin tasks) | String | Private (Server) | Yes |
| `AI_PROVIDER` | Provider identifier (`gemini`) | String | Private (Server) | No (Optional) |
| `AI_API_KEY` | Google Gemini API Key | String | Private (Server) | No (Optional) |
| `AI_MODEL` | Default model (e.g. `gemini-1.5-flash`) | String | Private (Server) | No (Optional) |
| `TOKEN_ENCRYPTION_KEY` | 32-character AES secret for token encryption | String | Private (Server) | No (Optional for V1) |

---

## 2. Frontend Environment Variables (`client/.env`)

| Variable | Description | Type | Visibility | Required in V1? |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Backend API base URL (`http://localhost:5000/api/v1`) | String | Public (Client) | Yes |
| `VITE_SUPABASE_URL` | Supabase project URL (`https://<project-ref>.supabase.co`) | String | Public (Client) | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key | String | Public (Client) | Yes |

---

## 3. Setup Instructions for Supabase

1. Create a Supabase project at [https://supabase.com](https://supabase.com).
2. Go to **Project Settings** > **API**:
   - Copy **Project URL** -> `SUPABASE_URL` & `VITE_SUPABASE_URL`
   - Copy **anon public** key -> `SUPABASE_ANON_KEY` & `VITE_SUPABASE_ANON_KEY`
   - Copy **service_role secret** -> `SUPABASE_SERVICE_ROLE_KEY`
3. Go to **Project Settings** > **Database** > **Connection string** (URI):
   - Copy the connection string and supply your database password -> `DATABASE_URL`
4. Under **Authentication** > **Providers** > **Email**:
   - Ensure "Enable Email provider" is turned on.
   - For local development, you may disable "Confirm email" if you wish to test sign-up and login immediately without configuring an SMTP email provider.
