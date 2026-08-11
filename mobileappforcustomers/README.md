# Phoenix Care

Mobile app for Phoenix OS pet owners (and staff dashboard via WebView).

**Stack:** Expo Router · Supabase Auth (email OTP) · Phoenix OS owner APIs · Plus Jakarta Sans

## Features
- Animated Phoenix logo splash + onboarding
- Email OTP + clinic invite (code or QR / deep link)
- Multi-clinic pets, appointments, medical history
- Cancel / reschedule visits, care journey, meds & vaccines
- Clinic messaging + in-app notifications
- Emergency call to clinic phone
- Staff WebView into Phoenix OS dashboard

## Setup

1. Copy env:

```bash
cp .env.example .env
```

Fill:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_APP_URL` — production Vetflow URL (e.g. `https://vetflow-psi.vercel.app`)

2. Apply backend migrations on the clinic Supabase project:

```bash
# from Vetflow repo root (linked CLI)
npx supabase db query --linked -f db/migrations/39_owner_accounts.sql
npx supabase db query --linked -f db/migrations/40_owner_care_phase2.sql
```

3. Install & run:

```bash
cd mobileappforcustomers
npm install
npx expo start
```

## Expo login (Windows)

`npx expo login -b` may crash when Windows `cmd start` fails. Use either:

```powershell
# Recommended: access token
# Create at https://expo.dev/settings/access-tokens
$env:EXPO_TOKEN = "your-token"
npx expo whoami
```

Or:

```powershell
.\scripts\expo-login-windows.ps1
# If a URL prints, open it in Chrome while the CLI waits
```

## Local Expo Go (recommended for free-tier testing)

```bash
cd mobileappforcustomers
cp .env.example .env   # fill Supabase + APP_URL
npx expo start
```

Scan the QR with **Expo Go** on your phone (same Wi‑Fi). Use tunnel if LAN fails: `npx expo start --tunnel`.

Cloud EAS APK builds are optional and slow on free tier — see [DEPLOY.md](./DEPLOY.md).


## Clinic workflow
1. Staff open a client in Phoenix OS → **Invite to Phoenix Care**
2. Owner installs the app, signs in with that email, enters the invite token
3. Pets and booking appear; multi-clinic links accumulate per email

## Deep link
Scheme: `phoenixcare://` (invite: `phoenixcare://invite/<token>`)
