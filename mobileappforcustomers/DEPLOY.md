# Phoenix Care — deploy checklist

## Project

- Expo account: `salmaniqbaljoyia`
- Project: https://expo.dev/accounts/salmaniqbaljoyia/projects/phoenix-care
- EAS project ID: `61a8da34-2c6d-47ae-bea5-8af632f80ce6`
- Preview build (Android): https://expo.dev/accounts/salmaniqbaljoyia/projects/phoenix-care/builds/3708cf7f-1be8-46b8-b752-52b71092a121

## 1. Expo login (Windows)

```powershell
cd mobileappforcustomers
npm run login:windows
# Or create a token at https://expo.dev/settings/access-tokens
$env:EXPO_TOKEN = "<token>"
npx expo whoami
```

## 2. Secrets (required for a working APK against live API)

```powershell
npx eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://YOUR_PROJECT.supabase.co" --environment preview --visibility sensitive
npx eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..." --environment preview --visibility sensitive
```

`EXPO_PUBLIC_APP_URL` is set in [`eas.json`](eas.json) to `https://vetflow-psi.vercel.app`.

## 3. DB migrations (clinixdev)

```powershell
# from Vetflow root
npx supabase db query --linked -f db/migrations/39_owner_accounts.sql
npx supabase db query --linked -f db/migrations/40_owner_care_phase2.sql
```

## 4. Rebuild preview APK

```powershell
npm run eas:preview
# = eas build --profile preview --platform android
```

## 5. Smoke test

Splash → onboarding → OTP → invite/connect → Home → Book → Visits cancel → Messages → Pet care journey → Emergency → More
