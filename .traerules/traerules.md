VOUCH constitution: Y-COMBINATOR GRADE SaaS STANDARDS
1. ARCHITECTURE (SOLITO MONOREPO)
Use Solito to share logic between Next.js 15 (Web) and Expo (Mobile).

Frontend: Tailwind v4 (NativeWind) for universal styling.

Backend: Convex (Reactive transactions).

Auth: Clerk with Passkey/Biometric support.

2. REVENUE & RETENTION LOGIC (STRICT)
Trial: 7-day Pro Trial (Full Access). Track trialEndsAt in Convex.

Dunning: Automated 4-email sequence via Resend if payment fails.

Hibernation: $5/mo plan to lock data instead of churning.

Payments: Dodo Payments (LIVE MODE). Handle proration: difference_immediately.

3. ELITE UI/UX (STUDIO MINIMALISM)
Theme: Cream-Fade (#FEF9F0) vs Obsidian (#0A0A0B).

Typography: Geist Sans (UI), Geist Mono (Metrics). Tracking: -0.02em.

Visuals: Layered glassmorphism (blur 20px), sharp 2px edges.

Analytics: Dashboard must front-load ROI (Conversion Lift: +34.2%).

4. MISSION CRITICAL
A/B Testing: Implement Next.js Middleware to split-test widget designs.

Mobile Native: Use expo-local-authentication for FaceID/Biometrics.

Code Quality: No placeholders. Write surgical, production-ready code.