# VOUCH: ELITE SAAS IMPLEMENTATION PLAN
**Studio Elite Design • Top 1% Professional SaaS Architecture**

---

## ARCHITECTURE OVERVIEW

### Design System: "Studio Minimalism"
- **Light Mode**: `#FEF9F0` (Cream Fade) background, `#0F172A` (Slate-900) text
- **Dark Mode**: `#0A0A0B` (Obsidian) background, `#F8FAFC` text  
- **Typography**: Geist Sans (UI), Geist Mono (Data/Metrics)
- **Borders**: `rgba(0,0,0,0.05)` light, `rgba(255,255,255,0.08)` dark
- **Radius**: `0px` (sharp edges) - Studio Elite aesthetic
- **Glassmorphism**: `backdrop-blur-[20px]` with inner shadows

### Tech Stack
- **Frontend**: Next.js 15 App Router, React 19, TypeScript
- **Styling**: Tailwind CSS v3.4+, Custom CSS utilities
- **Animations**: Framer Motion v12.26+ (elite transitions)
- **Backend**: Convex (serverless, real-time)
- **Auth**: Clerk (JWT template configured)
- **AI**: Gemini 1.5 Flash (Free tier)
- **Payments**: Dodo Payments React SDK
- **Fonts**: Geist Sans & Mono (variable fonts)

---

## MISSION 1: REFACTOR TO STUDIO DESIGN

### 1.1 Theme System Overhaul

**File**: `app/globals.css`
- Remove all `border-radius` defaults (except `full` for circular elements)
- Implement CSS custom properties:
  ```css
  --studio-cream: #FEF9F0;
  --studio-obsidian: #0A0A0B;
  --studio-border-light: rgba(0,0,0,0.05);
  --studio-border-dark: rgba(255,255,255,0.08);
  ```
- Add `.elite-kerning` utility: `letter-spacing: -0.02em`
- Add `.elite-mono` utility: Geist Mono with `font-feature-settings: "tnum" 1`
- Glassmorphism utility: `.glass-panel` with `backdrop-blur-[20px]` + inner shadows

**File**: `tailwind.config.ts`
- Set `borderRadius` config: `lg: "0px"`, `md: "0px"`, `sm: "0px"`, `full: "9999px"`
- Custom spacing scale: Mathematical precision (4, 8, 12, 16, 24, 32, 48, 64...)
- Extend font sizes: Elite typography scale

### 1.2 Asymmetric Bento Grid Hero

**File**: `app/page.tsx`

**Layout Structure**:
```
┌─────────────────────────────────────────────┐
│ [12-col] Hero Section                      │
│ ┌─────────────┬─────────────────────────┐  │
│ │ 7 cols      │ 5 cols                  │  │
│ │ AI Lightning│ Multi-source Float      │  │
│ │ Feature     │ Feature                 │  │
│ └─────────────┴─────────────────────────┘  │
│ ┌──────┬──────┬──────┐                     │
│ │ 4    │ 4    │ 4    │                     │
│ │ Zero │ +24% │ Trust│                     │
│ │ Lat. │ Lift │ Score│                     │
│ └──────┴──────┴──────┘                     │
└─────────────────────────────────────────────┘
```

**Component**: `components/hero/lightning-grid.tsx`
- SVG path with 6 nodes (n8n-style)
- Animated `motion.path` with `pathLength: [0, 1]` (2s loop)
- Pulsing nodes: Scale `[1, 1.2, 1]` with `ease: "easeInOut"`
- Colors: Foreground/background (no neon purple/blue)

**Component**: `components/hero/floating-composition.tsx`
- Shopify-style floating cards (Google, Yelp, Manual)
- `motion.div` with `y: [0, -12, 0]`, `rotate: [0, 2, 0]`
- Staggered delays (0s, 0.5s, 1s)
- Sync indicator badge (glass-panel)

**Typography**:
- Hero H1: `text-7xl md:text-8xl`, `tracking-[-0.04em]`, `elite-kerning`
- Tagline: `text-xl md:text-2xl`, `tracking-tight`
- Metrics: Geist Mono, `text-4xl`, `font-bold`

### 1.3 Component Refinements

**File**: `components/ui/logo.tsx`
- Minimalist 'V' checkmark slash SVG
- Path: `M 8 24 L 16 8 L 24 24`
- Subtle slash accent: `M 6 26 L 26 6` (30% opacity)
- `strokeLinecap="square"` for sharp edges

**File**: `components/ui/button.tsx`
- Remove all `rounded-md` classes
- Sharp edges by default
- Elite tracking: `tracking-tight`
- Hover: `opacity-90` transition (no scale flash)

---

## MISSION 2: CONVERSION ENGINE (7-DAY TRIAL)

### 2.1 Convex Schema Updates

**File**: `convex/schema.ts`

```typescript
subscriptions: defineTable({
    userId: v.id("users"),
    dodoId: v.string(), // Dodo payment ID
    status: v.union(
        v.literal("active"),
        v.literal("cancelled"),
        v.literal("past_due"),
        v.literal("trialing")
    ),
    currentPeriodEnd: v.number(),
    trialEndsAt: v.optional(v.number()), // 7-day trial end timestamp
    isSubscriptionActive: v.boolean(), // Computed field
}).index("by_user_id", ["userId"])
```

**Computed Logic**:
- `isSubscriptionActive = (status === "active" || (status === "trialing" && trialEndsAt > Date.now()))`

### 2.2 Trial Initialization

**File**: `convex/billing.ts`

**Mutation**: `initializeTrial`
```typescript
args: { clerkId: v.string(), email: v.string() }
handler:
  1. Check existing user (by_clerk_id index)
  2. If exists → return userId
  3. Create user with plan: "pro" (trial grants Pro access)
  4. Create subscription:
     - status: "trialing"
     - trialEndsAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
     - currentPeriodEnd: trialEndsAt
     - dodoId: "" (empty until payment)
     - isSubscriptionActive: true
  5. Return userId
```

**Integration Point**: `components/providers/user-initializer.tsx`
- `useEffect` hook on dashboard mount
- Calls `initializeTrial` with Clerk `user.id` and email
- Silent fail if user already exists (idempotent)

### 2.3 Dashboard ROI Metrics

**File**: `app/dashboard/page.tsx`

**Metrics Grid**:
1. **Trust Score Ring** (Left, 140px SVG)
   - Geist Mono: `text-4xl font-bold`
   - Color: Green (80+), Yellow (50-79), Red (<50)
   - Calculation: `(positive * 100 + questionable * 50) / total`

2. **Conversion Lift** (Center-left)
   - Static: `+24%` (Geist Mono, `text-4xl`)
   - Subtext: `"↑ +2.3% vs last week"` (elite-mono)

3. **Total Reviews** (Center-right)
   - Count from `getAllByUser` query
   - Geist Mono for number

4. **Positive/Flagged** (Right)
   - Positive count (sentiment === "Positive")
   - Flagged count (Questionable + Spam)

**ROI Dashboard Section**:
- Glass panel with 3-column grid
- Headline: "ROI Dashboard" (Geist Sans, `elite-kerning`)
- Metrics in Geist Mono with `tracking-tight`

---

## MISSION 3: MOBILE-FIRST & WIDGET SDK

### 3.1 Landing Page Mobile Optimization

**File**: `app/page.tsx`

**Hero Section**:
- `flex-col md:grid md:grid-cols-2` (stack on mobile)
- Typography: `text-5xl md:text-7xl` (responsive scaling)
- Bento Grid: `grid-cols-1 md:grid-cols-12` (single column mobile)

**Bento Grid Responsive**:
- Mobile: All cards stack vertically (`col-span-12`)
- Tablet+: Asymmetric layout (7-5, then 4-4-4)

**Touch Targets**:
- Buttons: `min-h-[48px]` (iOS HIG compliance)
- Card spacing: `gap-4 md:gap-6` (thumb-friendly)

### 3.2 Widget SDK

**File**: `public/widget/vouch-widget.js`

**Architecture**:
```javascript
(function() {
    'use strict';
    const VOUCH_WIDGET_CONFIG = {
        userId: '{{USER_ID}}',
        widgetId: '{{WIDGET_ID}}',
        theme: 'light|dark|auto',
        position: 'bottom-right|bottom-left|top-right|top-left',
        apiUrl: 'https://{{CONVEX_DEPLOYMENT}}.convex.site'
    };
    
    // Fetch reviews from Convex public endpoint
    async function fetchReviews() {
        const response = await fetch(`${VOUCH_WIDGET_CONFIG.apiUrl}/api/reviews?widgetId=${VOUCH_WIDGET_CONFIG.widgetId}`);
        return response.json();
    }
    
    // Render glassmorphic widget
    function renderWidget(reviews) {
        const widget = document.createElement('div');
        widget.id = 'vouch-widget';
        widget.className = 'vouch-widget';
        widget.innerHTML = `
            <div class="vouch-widget-container">
                <div class="vouch-widget-header">
                    <span>Reviews</span>
                </div>
                <div class="vouch-widget-body">
                    ${reviews.map(review => `
                        <div class="vouch-review-card">
                            <div class="vouch-review-author">${review.author}</div>
                            <div class="vouch-review-content">${review.content}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(widget);
    }
    
    // Inline CSS (glassmorphism)
    const style = document.createElement('style');
    style.textContent = `
        .vouch-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .vouch-widget-container {
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(0, 0, 0, 0.05);
            box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
                        inset 0 -1px 0 0 rgba(0, 0, 0, 0.05),
                        0 4px 20px rgba(0, 0, 0, 0.1);
            border-radius: 0;
            width: 320px;
            max-height: 480px;
            overflow-y: auto;
            padding: 16px;
        }
        .dark .vouch-widget-container {
            background: rgba(10, 10, 11, 0.6);
            border-color: rgba(255, 255, 255, 0.08);
        }
        .vouch-review-card {
            padding: 12px 0;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        .dark .vouch-review-card {
            border-color: rgba(255, 255, 255, 0.08);
        }
    `;
    document.head.appendChild(style);
    
    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    async function init() {
        const reviews = await fetchReviews();
        renderWidget(reviews.filter(r => r.isVisible));
    }
})();
```

**Embedding**:
```html
<script src="https://vouch.so/widget/vouch-widget.js" 
        data-user-id="clerk_xxx" 
        data-widget-id="widget_xxx"
        data-theme="auto">
</script>
```

**Backend**: `convex/public/reviews.ts` (public query for widget)

---

## MISSION 4: DODO PAYMENTS INTEGRATION

### 4.1 Dodo Payments React SDK Setup

**File**: `lib/dodo.ts`

```typescript
export const dodoConfig = {
    publishableKey: process.env.NEXT_PUBLIC_DODO_PUBLISHABLE_KEY || "pk_test_...",
    proPlanPriceId: "price_vouch_pro_49",
    trialDays: 7,
    proPlanPrice: 49,
};

export function getDodoCheckoutUrl(params: {
    priceId: string;
    customerId?: string;
    successUrl: string;
    cancelUrl: string;
    trialDays?: number;
}) {
    const baseUrl = "https://checkout.dodopayments.com";
    const queryParams = new URLSearchParams({
        price_id: params.priceId,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        ...(params.customerId && { customer_id: params.customerId }),
        ...(params.trialDays && { trial_period_days: String(params.trialDays) }),
    });
    return `${baseUrl}?${queryParams.toString()}`;
}
```

**File**: `components/dashboard/upgrade-button.tsx`
- Uses `getDodoCheckoutUrl` for checkout redirect
- Passes `customerId: user.id` (Clerk ID)
- No redirects (window.location.href only)

### 4.2 Webhook Handler

**File**: `app/api/webhook/dodo/route.ts`

**Events to Handle**:
1. `subscription.created`
   - Extract `clerk_id` from `data.metadata`
   - Call `convex.mutation(api.billing.syncSubscription)`
   - Set `status: "active"`, `dodoId: data.id`, `trialEndsAt: undefined`

2. `subscription.updated`
   - Same as `subscription.created` (idempotent)

3. `subscription.cancelled`
   - Set `status: "cancelled"`, `isSubscriptionActive: false`
   - Keep `dodoId` for history

4. `payment.failed`
   - Set `status: "past_due"`, `isSubscriptionActive: false`

**Signature Verification** (TODO):
```typescript
function verifySignature(payload: string, signature: string, secret: string): boolean {
    // Implement HMAC-SHA256 verification
    const expected = crypto.createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
    return expected === signature;
}
```

**Convex Mutation**: `convex/billing.ts`

**Mutation**: `syncSubscription`
```typescript
args: {
    clerkId: v.string(),
    dodoPaymentId: v.string(),
    status: v.union(...),
    currentPeriodEnd: v.number(),
    trialEndsAt: v.optional(v.number()),
}
handler:
  1. Find user by clerkId
  2. Find subscription by userId
  3. If subscription exists:
     - Update dodoId, status, currentPeriodEnd, trialEndsAt
     - Update user plan: "pro" if active, "free" if cancelled
  4. Else: Create new subscription
```

---

## IMPLEMENTATION SEQUENCE

### Phase 1: Design System (Day 1)
1. ✅ Update `globals.css` with Studio Elite tokens
2. ✅ Update `tailwind.config.ts` (sharp edges, spacing)
3. ✅ Refactor logo component (checkmark slash)
4. ✅ Update button components (no rounded corners)

### Phase 2: Hero & Bento Grid (Day 1-2)
1. ✅ Build asymmetric Bento Grid layout (`app/page.tsx`)
2. ✅ Create `LightningGrid` component (n8n-style SVG)
3. ✅ Create `FloatingComposition` component (Shopify-style)
4. ✅ Mobile-first responsive breakpoints

### Phase 3: Backend & Trial (Day 2)
1. ✅ Update `convex/schema.ts` (trialEndsAt, isSubscriptionActive)
2. ✅ Create `initializeTrial` mutation
3. ✅ Build `UserInitializer` component (auto-initialize on dashboard)
4. ✅ Test 7-day trial flow

### Phase 4: Dashboard ROI (Day 2-3)
1. ✅ Build Trust Score Ring (Geist Mono)
2. ✅ Add Conversion Lift metric (+24%)
3. ✅ Create ROI Dashboard section
4. ✅ Integrate with Convex queries

### Phase 5: Widget SDK (Day 3)
1. ✅ Create `public/widget/vouch-widget.js`
2. ✅ Implement glassmorphism CSS (backdrop-blur-[20px])
3. ✅ Build public Convex endpoint for reviews
4. ✅ Test widget embedding on external site

### Phase 6: Dodo Integration (Day 3-4)
1. ✅ Setup `lib/dodo.ts` config
2. ✅ Update `UpgradeButton` with checkout URL
3. ✅ Create `/api/webhook/dodo` route
4. ✅ Implement `syncSubscription` mutation
5. ✅ Test webhook with Dodo test mode

### Phase 7: Polish & Testing (Day 4)
1. ✅ Mobile responsiveness audit
2. ✅ Animation performance (60fps target)
3. ✅ Accessibility (WCAG AA)
4. ✅ Cross-browser testing (Chrome, Safari, Firefox)

---

## QUALITY GATES

### Design
- [ ] Zero `border-radius` (except circular elements)
- [ ] Geist Mono for all numbers/metrics
- [ ] Elite kerning (`-0.02em`) on headlines
- [ ] Glass panels: `backdrop-blur-[20px]` + inner shadows

### Performance
- [ ] Lighthouse score: 95+ (Performance)
- [ ] FCP < 1.5s, LCP < 2.5s
- [ ] Animations: 60fps (check Chrome DevTools)

### Mobile
- [ ] Touch targets: 48px minimum
- [ ] Typography scales: `text-5xl` → `text-7xl` (desktop)
- [ ] Bento Grid: Single column on mobile

### Functionality
- [ ] 7-day trial auto-grants Pro access
- [ ] Webhook syncs Convex on payment events
- [ ] Widget loads reviews from public endpoint
- [ ] Trust Score calculates correctly

---

## ENVIRONMENT VARIABLES

```bash
# .env.local
NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
NEXT_PUBLIC_DODO_PUBLISHABLE_KEY=pk_test_...
DODO_WEBHOOK_SECRET=whsec_...
GEMINI_API_KEY=AIza...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

---

## NOTES

- **No AI bullshit**: Clean, professional, no neon purple/blue gradients
- **Mathematical precision**: 4px, 8px spacing scale (no arbitrary values)
- **Studio Elite**: Sharp edges, high-end kerning, zero-radius
- **Mobile-first**: Stack layouts, thumb-friendly touch targets
- **Glassmorphism**: Elite backdrop-blur, not generic rounded cards

---

**Status**: Ready for Implementation ✅
