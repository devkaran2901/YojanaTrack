# YojanaTrack 🇮🇳

YojanaTrack is a fullstack web application that helps Indian citizens
discover, explore, and keep track of government schemes (Yojanas) they
are eligible for — all in one place.

Built as an alternative interface to fragmented government portals,
YojanaTrack simplifies the process of finding relevant central and
state government schemes based on user profile, category, and
eligibility criteria.

## ✨ Features
- 🔍 Search and filter government schemes by category, state, and eligibility
- 📋 Detailed scheme pages with benefits, documents required, and application process
- 👤 Standalone Profile Management — intentional citizen profile fields (age, income, gender, state, occupation) with strict Zod validation bounds
- 🔔 Smart New Scheme Notifications — automatic in-app notification alerts matching citizens profile criteria (≥70% score match) upon scheme creation
- 🔖 Save and track schemes you're interested in
- 👤 User authentication and personal dashboard
- 📱 Responsive design for mobile and desktop

## 🛠️ Tech Stack
- **Frontend:** React, Vite, TypeScript, Vanilla CSS, TailwindCSS (optional/configured)
- **Backend:** Node.js, Express, TypeScript, Zod request validation
- **Database:** MongoDB + Mongoose
- **Caching:** Redis (gracefully degrading key-value store)
- **Testing:** Jest + Supertest (sequential execution with `--runInBand`)
- **CI/CD:** GitHub Actions (compilation & automated test runners)

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm or yarn

### Installation
# Clone the repo
git clone https://github.com/devkaran2901/YojanaTrack.git
cd YojanaTrack

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install

### Running Locally
# Start backend
cd server && npm run dev

# Start frontend (new terminal)
cd client && npm run dev

## 🗺️ Known Limitations & Future Roadmap

To keep the application honest about its current state and outline clear directions for production scaling, we have documented the following architectural constraints and roadmap items:

- **Notification Discovery Limits**: The scheme matching notification system currently covers admin-added schemes only. Automatic discovery and notification of new schemes from external feeds/sources remains a future integration pending a stable national data feed.
- **Static Seed Data vs. Live Integrations**: Currently, schemes are manually seeded and updated by administrators. The next phase is to integrate with government endpoints or deploy scrapers to automatically synchronize with active central/state database registries.
- **Rule-Based Matching vs. ML Recommendation**: Eligibility checks are computed using structured rule matching based on specific criteria. Future improvements will utilize machine learning models to suggest schemes based on historical demographics and correlation vectors.
- **Localization (i18n)**: Currently, the portal is English-only. Translating the portal to Hindi and other regional languages (e.g. Marathi, Tamil) is a priority to make it fully accessible to the general public.
- **Infrastructure Scaling**: The app currently assumes a single-region deployment. Multi-region DB replication and CDN edge caching are planned to support high concurrent usage across different Indian states.
- **Production Notification Scheduler**: The daily deadline checking mechanism runs via a scheduled GitHub Action scaffold. In production, this will be migrated to a dedicated worker scheduler (e.g. BullMQ / Redis) triggering a transactional mailer service (e.g. SendGrid).

## 📌 Inspired By
The gaps found in myscheme.gov.in — built to provide a faster,
more accessible, and user-friendly experience for citizens
navigating India's government welfare ecosystem.

## 📄 License
MIT
