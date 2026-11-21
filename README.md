# Eagle Global Facility Solutions (Eagle GFS) – Enterprise Website

A modern, responsive, accessible, and SEO-optimized corporate website for **Eagle Global Facility Solutions**, delivering integrated facility management, technical MEP maintenance, specialized soft services, and maintenance material supplies in Bengaluru, India.

---

## 🌟 Key Features & Improvements

### 1. Modern Corporate UI/UX Design
* **Brand Language**: Corporate Navy Blue (`#0f1e31`), Golden Yellow (`#d4a755`), clean white surfaces, and subtle modern shadows.
* **Header & Navigation**: Fixed desktop header (86px), high-resolution Eagle emblem alignment, accessible multi-level Services dropdown with keyboard navigation (Escape/Tab/Arrows), prominent "Contact Us" CTA button, and mobile hamburger drawer.
* **Hero Section**: Two-column balanced layout with responsive CSS `clamp()` typography, "Better spaces. Smarter operations." headline, high-impact facility imagery with `fetchpriority="high"`, and responsive floating proof badge.
* **Trust & Credibility**: Verified operational pillars directly beneath the hero: Integrated FM Coordination, 100% Compliance & Safety, Rapid Response Dispatch, and Dependable Material Supply.
* **Interactive Services & Sectors**: Cards with image hover elevation, category badges, and direct anchor links to detailed service scopes.
* **Operational Capabilities Showcase**: Factual representation of commercial tech park maintenance, industrial utility upkeep, and workplace sanitation.

### 2. Full Technical & On-Page SEO
* **Target Keywords**: Facility Management Services, Integrated Facility Management, Facility Management Company, Commercial Facility Management, Facility Maintenance Services, Global Facility Solutions, Material Supply Services, Bengaluru.
* **Metadata**: Unique page titles, high-CTR meta descriptions, Open Graph (`og:*`), Twitter Cards, and canonical tags across every page.
* **Structured Data (JSON-LD)**: Schema.org `Organization`, `LocalBusiness` (Wilson Garden, Bengaluru), and `BreadcrumbList` validated for rich search snippets.
* **Search Engine Crawling**: Includes `robots.txt` and `sitemap.xml`.
* **Custom 404 Page**: Branded error page (`404.html`) with navigational recovery links.

### 3. Contact Form & Real Email Backend
* **Admin Notifications**: Direct email delivery to `mcm50445@gmail.com` via Nodemailer with Gmail SMTP.
* **Visitor Details Captured**: Full Name, Company Name (optional), Work Email, Phone Number, Interested Service, Requirement Description, Submission Date & Time.
* **Reply-To Enabled**: Admin can reply directly to the visitor's email address from their inbox.
* **Spam Protection & Security**: Hidden honeypot field (`_gotcha`) and IP rate limiting (10 requests / 10 minutes).
* **Professional Thank-You Modal**: Animated SVG checkmark with pulsing circle, WCAG-compliant modal overlay, and automatic form reset without page refresh.
* **Error Handling**: Form fields are preserved upon network/backend failure so visitors never lose entered information.

### 4. Accessibility (WCAG 2.2 AA)
* Accessible skip-to-content navigation (`.skip-link`).
* Full keyboard navigability with visible `:focus-visible` focus rings.
* Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
* ARIA attributes (`aria-expanded`, `aria-haspopup`, `aria-controls`, `aria-label`, `role="menu"`).
* Full support for `@media (prefers-reduced-motion: reduce)`.

### 5. Performance & Core Web Vitals
* Responsive image scaling with explicit `width` and `height` attributes to prevent Cumulative Layout Shift (CLS).
* `loading="lazy"` and `decoding="async"` on below-the-fold assets.
* Zero external CSS frameworks or heavy JavaScript bundles (vanilla JS & modern CSS).

---

## 📁 Project Structure

```text
eagle-fms-redesign/
├── assets/
│   ├── logo.png          # High-resolution Eagle laurel emblem (PNG)
│   ├── logo.webp         # WebP optimized logo
│   ├── main.js           # Navigation, modal controls, and contact form AJAX
│   └── style.css         # Master responsive design system
├── .env                  # Secure environment variables (git-ignored)
├── .env.example          # Environment variable template
├── 404.html              # Custom branded 404 error page
├── about.html            # Company overview and values
├── contact.html          # Contact details & functional enquiry form
├── index.html            # Primary homepage with all sections
├── package.json          # Node.js dependencies
├── products.html         # Material and product procurement catalog
├── README.md             # Project documentation
├── robots.txt            # Search crawler directives
├── sectors.html          # Industries served breakdown
├── serve.js              # Production HTTP server & API endpoint
├── services.html         # Service portfolio and details
└── sitemap.xml           # XML sitemap for search engines
```

---

## 🚀 Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and configure your credentials:
   ```env
   PORT=8000
   ADMIN_EMAIL=mcm50445@gmail.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_16_char_google_app_password
   ```
3. **Start the Web Server**:
   ```bash
   node serve.js
   ```
4. **Open in Browser**:
   Visit [http://localhost:8000](http://localhost:8000).

---

## 🔒 Security Best Practices
* Never commit the `.env` file to public version control repositories.
* Use a dedicated 16-character Google App Password with 2-Step Verification for Gmail SMTP transmission.
* Keep server rate limiting active to prevent enquiry endpoint spam.
