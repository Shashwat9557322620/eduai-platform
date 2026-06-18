# EduAI — Complete Technical Portfolio
## Everything About This Site (For AI Prompting)

---

## 1. WHAT IS THIS SITE?

**EduAI** is an AI-powered edtech platform for students. It uses **Google Gemini AI** to help students with:
- Breaking down their syllabus into a day-by-day study plan
- Generating flashcards from raw text
- Analyzing skill gaps between their current skills and target job roles

**Business Model:** Freemium + Credit System. Free users get limited daily uses. Paid users buy credit packs via **Razorpay** (Indian payment gateway). Each AI tool use costs 1 credit.

**Target Audience:** Indian students (IIT, NEET, UPSC, GATE, university exams, job seekers).

---

## 2. TECH STACK

| Layer | Technology |
|-------|------------|
| Framework | **Next.js 16.2.6** (App Router, React 19) |
| Language | **TypeScript 5** |
| Styling | **Tailwind CSS 4** + custom CSS animations (50+ keyframes) |
| Auth | **Clerk** (@clerk/nextjs 7.4.1) |
| Database | **Supabase** (PostgreSQL via REST API) |
| AI Engine | **Google Gemini 2.5 Flash Lite** |
| Payments | **Razorpay** (Orders + Webhooks with HMAC signature) |
| 3D Graphics | **Three.js** + **@react-three/fiber** + **@react-three/drei** |
| Animations | **Framer Motion** 12 + **GSAP** 3.15 + **Lenis** smooth scroll |
| Icons | **Lucide React** |
| Markdown | **react-markdown** |
| Email | **Nodemailer** |
| Fonts | **Geist Sans** + **Geist Mono** |

---

## 3. COLOR THEME & DESIGN SYSTEM

- **Background:** `#020203` (near-black with blue tint)
- **Card background:** `#07070a` / `#0a0a0e`
- **Primary (Cyan):** `#22d3ee` — Optimizer, general UI
- **Secondary (Purple):** `#a855f7` — Flashcards
- **Tertiary (Pink):** `#ec4899` — Skill Gap Analyzer
- **Glassmorphism:** Semi-transparent with `backdrop-blur`, borders `border-white/[0.06]`

---

## 4. ALL PAGES

### Public Pages
| Route | Description |
|-------|-------------|
| `/` | Homepage — Hero with glitch text, 3 module cards, animated counters, testimonials |
| `/optimizer` | Paste syllabus + target days → AI generates day-by-day study plan |
| `/flashcards` | Paste text → AI generates front/back flashcards with 3D flip |
| `/analyzer` | Input job role + skills → AI generates skill gap analysis markdown |
| `/billing` | 3 plans (Starter 199/150cr, Scholar 499/500cr, Apex 999/99999cr) |
| `/billing/success` | Payment success |
| `/support` | Support ticket form |
| `/faq` | FAQ |
| `/about` | About us |
| `/blog` + `/blog/[slug]` | Blog |
| `/privacy-policy` | Privacy policy |
| `/terms-of-service` | Terms of service |
| `/refund-policy` | Refund policy |
| `/sign-in` + `/sign-up` | Clerk auth pages |
| `404` | Sci-fi 404 with matrix rain + glitch text |

### Protected Pages
| Route | Description |
|-------|-------------|
| `/dashboard` | Credits balance, usage history, support tickets, refund requests |
| `/admin` | Admin panel |
| `/admin/hacker-tracker` | Intrusion log viewer |
| `/admin/support` | Admin support management |

### API Routes
| Route | Method | Description |
|-------|--------|-------------|
| `/api/generate` | POST | Curriculum Optimizer — Gemini AI |
| `/api/flashcards` | POST | Flashcard Generator — Gemini AI |
| `/api/analyzer` | POST | Skill Gap Analyzer — Gemini AI |
| `/api/checkout` | POST | Create Razorpay order (server-side validation) |
| `/api/webhook/razorpay` | POST | Razorpay webhook — verify signature, add credits |
| `/api/webhook/clerk` | POST | Clerk webhook |
| `/api/feedback` | POST | User feedback |
| `/api/newsletter` | POST | Newsletter subscribe |
| `/api/support` | POST | Create support ticket |
| `/api/refund` | POST | Submit refund request |
| `/api/history` | GET | Usage history |
| `/api/user/credits` | GET | Credit balance + plan |
| `/api/user/support` | GET | User support tickets |
| `/api/user/refunds` | GET | User refund requests |
| `/api/health` | GET | Health check |
| `/api/admin/*` | Various | Admin APIs |

---

## 5. CREDIT & PAYMENT SYSTEM

- **Free users (not logged in):** Daily limits via localStorage (2 optimizer, 3 flashcards, 2 analyzer)
- **Free users (logged in):** 5 optimizer, 10 flashcards, 5 analyzer/day
- **Paid users:** Credits in Supabase `user_credits` table. Each AI call costs 1 credit.

### Flow:
1. Client calls `/api/checkout` with plan details
2. Server validates against `ALLOWED_PLANS` (prevents price tampering)
3. Razorpay order created → user pays
4. Webhook verifies HMAC SHA-256 signature (timing-safe)
5. Credits added to `user_credits` table

### Plans (Server-Side Only):
- Starter Core: 150 credits for ₹199
- Scholar Protocol: 500 credits for ₹499
- Apex Overlord: 99999 credits for ₹999

---

## 6. DATABASE TABLES (Supabase)

| Table | Key Columns |
|-------|-------------|
| `user_credits` | user_id, credits, plan_name |
| `user_history` | user_id, tool_name, input, credits_used |
| `payments` | order_id, payment_id, user_id, amount, status, plan_name |
| `study_plans` | syllabus, days, plan (JSON) |
| `support_tickets` | tracking_id, user_id, subject, message, status, admin_response |
| `refund_requests` | user_id, order_id, reason, amount, status |
| `feedback` | User ratings |
| `newsletter` | Email subscriptions |
| `intrusion_log` | Security tracking |

---

## 7. SECURITY

- **Clerk** handles all auth
- **Admin auth:** Custom password via Bearer token (lib/adminAuth.ts)
- **Razorpay webhooks:** HMAC SHA-256 signature + timingSafeEqual()
- **Server-side price validation:** Plans defined ONLY in server code
- **User ID validation:** Checkout verifies userId === authUserId

---

## 8. COMPONENTS

### Animation Components (THE INSANE VISUALS)
| Component | What It Does |
|-----------|-------------|
| `AmbientBackground` | **Three.js WebGL**: wireframe icosahedron + octahedron, energy orbs, 2500 particles, **DNA double helix** (chemistry), **molecular ball-and-stick** (chemistry), **orbiting electron shells** with nucleus (physics), **GLSL gravity grid floor**, **energy wave** sine visualizer, CRT scan lines |
| `SciFiOverlay` | **2D Canvas**: Matrix katakana rain, 18 floating math/physics/chem formulas (E=mc2, H2O, PV=nRT) with mouse repulsion, HUD targeting reticles, constellation lines, scanning beam, mouse radar, corner brackets. Reduced-motion support. |
| `GlitchText` | RGB-split glitch effect, character scramble on hover, auto-glitch mode, scan line artifacts. Reduced-motion support. |
| `HolographicLoader` | Boot-up screen: 120-particle convergence, progress ring, 6-phase init, glitch overlay, terminal log. SessionStorage gated. |
| `MouseTrail` | Cursor trail (desktop) |
| `OnboardingTour` | First-visit tour |

### UI Components
| Component | Description |
|-----------|-------------|
| `Navbar` | Fixed glassmorphism nav, holographic laser line, PRO spinning gradient button, Clerk auth |
| `Footer` | Particle canvas, magnetic buttons, tilt cards, scramble text, social icons |
| `ShareButton` | Web Share API |
| `CopyFullContent` | Copy to clipboard |
| `RatingWidget` | Star rating |
| `Testimonials` | Tilt cards, featured carousel |
| `NewsletterSubscribe` | Email signup |

---

## 9. ANIMATIONS (50+ KEYFRAMES)

### Three.js (WebGL)
- Wireframe Icosahedron + Octahedron (slow rotation, emissive glow)
- Energy Orbs (floating spheres, orbiting paths)
- 2500 Particles (purple, slow rotation)
- DNA Double Helix (cyan/purple tube geometry + green cylinder rungs)
- Molecular Structure (8 atoms + bonds, multi-color emissive)
- Orbital Rings (3 torus + golden nucleus + 3 electrons)
- Gravity Grid (GLSL shader, perspective lines, fade by distance)
- Energy Wave (200-point multi-sine line)

### 2D Canvas
- Matrix Rain (katakana columns, varying speed/opacity)
- Floating Formulas (mouse repulsion, rotation)
- HUD Reticles (rotating targeting circles + crosshairs)
- Scanning Beam, Mouse Radar, Corner Brackets

### CSS Animations
- float, breathe, gradient-x, shimmer, pulse-glow, spin-slow
- slide-up, reveal-up, morph, typewriter, glitch, neon-flicker
- **Sci-fi:** holo-shimmer, energy-pulse, quantum-float, plasma-flow, orbit-spin, gravity-pull, magnetic-snap, electron-glow, thermal-vibration, wave-interference, r
