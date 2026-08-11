# Phoenix Care — Implementation Roadmap

Derived from reference video analysis (`20260810-2110-14.2333443.mp4`) and locked product decisions.

| Decision | Choice |
|----------|--------|
| Scope now | **1A** — Clinic-linked care UI/UX parity; stub/hide Shop, Loyalty, Chat |
| Splash | **2A** — Short Phoenix logo intro (1.5–2.5s) |
| Auth | Clinic invite (email OTP + invite code / QR) |
| Multi-clinic | Owner sees all linked pets across Phoenix clinics |
| Staff | WebView into Phoenix OS dashboard |
| App name | **Phoenix Care** (by Phoenix OS) |

---

## Phase 1 — Build next (UI polish + core care)

Goal: Match the **feel and primary workflows** of the reference video without shipping e-commerce or chat backends.

### 1.1 Logo pre-animation (splash)
- Screen before auth/home: Phoenix mark scales/fades in → wordmark “Phoenix Care” → tagline “by Phoenix OS”
- Duration **1.5–2.5s**, then route to onboarding (first launch) or auth/home
- Use `react-native-reanimated`; respect `prefers-reduced-motion` / disable animation if needed
- Assets: `assets/images/phoenix-logo.png`, `phoenix-logo-mark.png`

### 1.2 Onboarding (3 slides)
Match video copy/structure:
1. Paw icon — “Everything about your pet. In one place.”
2. Care/heart icon — “Care doesn’t stop at the clinic.”
3. Clinic connect teaser → Continue to Connect
- Skip control, pill progress indicator, primary Continue / Get Started
- Persist `hasSeenOnboarding` in SecureStore

### 1.3 Connect clinic
- QR scanner UI (camera permission) + **Enter invitation code instead**
- Accept token via existing `POST /api/owner/invites/accept`
- Optional: clinic prints QR encoding `phoenixcare://invite/<token>` (deep link)
- After link: refresh `/api/owner/me` and land on Home

### 1.4 Design system upgrade
- Light Soft UI: off-white bg, white cards, blue primary (`#2563EB` / Phoenix cyan accent), soft shadows, 16–20px radii
- Shared components: `Screen`, `Card`, `Badge`, `PrimaryButton`, `SegmentedControl`, `PetChip`, `GradientPetHero`, `QuickActionTile`, `TimelineCard`, `Stepper`, `BottomSheet`
- Bottom tabs (video parity, clinic-safe): **Home · Pets · Visits · More**  
  - Move Book into Visits (+ Book) and Home quick action (remove dedicated Book tab to match video; keep Book as screen)
  - Messages tab: **visible but “Coming soon”** stub (Phase 2)
- Touch ≥44pt, safe areas, Pressable feedback

### 1.5 Home (video layout)
- Connected clinic chip (active clinic / multi-clinic switcher if multiple links)
- Horizontal pet switcher chips
- Gradient hero pet card (photo placeholder if none): name, breed, age/weight/sex, **Next care** row (next appointment or med placeholder from appointments)
- Quick actions grid (4–8 tiles):
  - **Live:** Book appointment, Medical records, Vaccinations (→ history filter), Medications (→ history / notes)
  - **Stub (Coming soon):** Chat doctor, Emergency, Surgery detail, Shop
- Header: search (stub or filter pets), notifications (stub count), profile avatar → More/Profile

### 1.6 Pets
- List with clinic badges
- Detail: profile stats
- Medical history as **timeline cards** (date, status pill, title, doctor if available, notes) — wire to `/api/owner/pets/[id]/history`
- **Care journey stepper** (UI): map visit/appointment stages when data exists; otherwise illustrative empty state for active visit

### 1.7 Visits
- Segmented: Upcoming / Past / Cancelled
- `+ Book Appointment` CTA
- Appointment cards: status pill, date/time, service/reason, pet, clinic, View details / Cancel (cancel → API if we add PATCH; else hide until Phase 1.5 API)
- Book flow as **bottom sheet / multi-step** (Step of 4): Pet → Service type → Date/time → Confirm  
  - Service chips map into `reason` / purpose string for existing `POST /api/owner/appointments`

### 1.8 More (hub)
- Profile card (name/email from owner links)
- Connected clinic(s) list with Active badge
- Menu rows:
  - **Live:** Notifications settings (local), Profile, Open clinic dashboard (if staff), Sign out, Accept invite
  - **Stub:** Shop, My Orders, My Loyalty (Coming soon)
- My Profile sub-screen: phone/address from customer record (read-only from `/me`)

### 1.9 Expo.dev readiness
- Keep `eas.json`, env docs, store metadata
- Ensure splash + icon use Phoenix assets
- Smoke path: Expo Go → splash → onboarding → OTP → invite → home

### Phase 1 acceptance
- [x] Logo splash plays once per cold start (or until auth ready)
- [x] Onboarding shows once
- [x] Connect via invite code works end-to-end
- [x] Home matches video structure (hero + quick actions)
- [x] Visits tabs + book wizard create real appointments
- [x] History timeline renders real visit data
- [x] Shop / Chat / Loyalty clearly stubbed, not broken empty screens
- [x] `npx expo start` + EAS preview build docs still valid

---

## Phase 2 — What to build next (from video)

Build after Phase 1 is stable with pilot clinics.

### 2.1 Messages / chat with clinic
- [x] Thread per linked organization (`owner_clinic_threads` / `owner_clinic_messages`)
- [ ] Push notifications for new messages (token table ready; send deferred)
- [x] Unread badges on Messages tab / thread list
- [x] Owner APIs: `GET|POST /api/owner/messages`, `GET|POST /api/owner/messages/[threadId]`

### 2.2 Emergency
- [x] One-tap call clinic phone from `app_settings.clinic_phone` / branch phone (via `/api/owner/me`)
- [x] After-hours instructions alert

### 2.3 Care journey (live data)
- [x] Map `visits.status` → stepper via `/api/owner/pets/[id]/care-journey`
- [ ] Push/SMS updates on stage change (deferred)

### 2.4 Medications & vaccinations views
- [x] Dedicated lists from prescriptions + `workflow_payload` vaccines
- [ ] Reminder scheduling / local notifications (deferred)

### 2.5 Cancel / reschedule appointments
- [x] Owner API: `PATCH /api/owner/appointments/[id]`
- [x] Visits UI Cancel + Reschedule sheet

### 2.6 Notifications center
- [x] In-app inbox (`owner_notifications`)
- [x] Expo route `/(owner)/notifications`
- [ ] Expo push send pipeline (token storage in migration 40)

Migration: `db/migrations/40_owner_care_phase2.sql`
---

## Phase 3 — Commerce & loyalty (video “More / Shop”)

Only after care core is trusted.

### 3.1 Shop
- Clinic-curated catalog (products flagged for owner shop)
- Cart, checkout (Stripe or pay-at-clinic)
- Orders list + status

### 3.2 Loyalty
- Points ledger per customer/org
- Tiers (e.g. Gold Member)
- Earn on visits/purchases; redeem rules

### 3.3 QR clinic ops
- Staff dashboard: generate/print Phoenix Care QR for customer invite
- Deep link analytics

---

## Phase 4 — Polish & scale
- Dark mode
- Multi-language
- Offline cache for pets/history
- App Store / Play submission (privacy policy, screenshots from real UI)
- Performance: FlashList, image caching, Reanimated worklets only where needed

---

## Suggested build order (checklist)

```
NOW  → Phase 1 (this doc § Phase 1)
NEXT → Phase 2.5 cancel/reschedule + 2.4 meds/vax views + 2.6 notifications
THEN → Phase 2.1 Messages + 2.2 Emergency + 2.3 live care journey
LATER→ Phase 3 Shop + Loyalty
LAST → Phase 4 store launch polish
```

---

## Architecture notes (unchanged)
- Expo app: `mobileappforcustomers/`
- APIs: `/api/owner/*`, invite accept, staff WebView `/api/mobile/session`
- Migration: `db/migrations/39_owner_accounts.sql`
- Do not invent Shop/Chat data in Phase 1 — UI stubs only

## Reference
- Video frames: `mobileappforcustomers/_video_analysis/frame_*.jpg`
- Extract script: `mobileappforcustomers/_extract_frames.py`
