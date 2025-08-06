# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/3a2552d7-d143-4fe0-b6d8-9a5d48084343

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3a2552d7-d143-4fe0-b6d8-9a5d48084343) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3a2552d7-d143-4fe0-b6d8-9a5d48084343) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
<<<<<<< HEAD

WebSite description:

## **"I Malati dello Sport": A Vision for the Ultimate Sports News Platform**

"I Malati dello Sport" (The Sports Addicts) is not merely a news website; it is a meticulously engineered digital ecosystem designed for the passionate, knowledgeable, and discerning sports fan. It combines cutting-edge aesthetics with profound functionality, creating a vibrant, community-driven hub that feels both exclusive and welcoming. The core philosophy is to deliver high-quality, editorially-driven content within a visually arresting, dynamically animated, and hyper-intuitive user interface.

### **Design Philosophy & Visual Language**

The visual identity of "I Malati dello Sport" is modern, unique, and relentlessly engaging. It rejects minimalist emptiness in favor of a rich, layered, and information-dense experience, guided by a sophisticated design language that embraces movement and depth.

* **Core Color Palette:** The primary theme is built on a powerful contrast:
    * **Primary Red:** #ff3036 - An energetic, attention-grabbing red used for calls-to-action, highlights, active states, and branding accents.
    * **Primary Gray:** #3e3e3e - A deep, sophisticated charcoal gray used for backgrounds, text, and structural elements, providing a strong foundation for the red to pop.
* **Theme System:** A seamless theme-switcher is omnipresent in the user settings, allowing instant toggling between:
    * **Dark Mode (Default):** Utilizes the #3e3e3e gray as the primary background, making images, animations, and the #ff3036 red accents incredibly vibrant.
    * **Light Mode:** Switches to a clean, off-white background (#f5f5f5), while retaining the primary red and gray for text, icons, and branding.
* **The "Liquid Glass" Header:** The main navigation header is a statement piece. It employs a "liquid glass" or "frosted glass" effect, a semi-transparent element that subtly blurs the page content as it scrolls underneath. This creates a stunning sense of depth and keeps the navigation accessible without being visually obstructive.
* **Iconography and Symbology:** There are **no emojis**. Every interactive element is represented by a custom-designed icon from a dedicated asset library (/assets/icons/). These icons are sharp, vector-based (SVG), and follow a consistent design style.
* **Typography:** A modern, highly legible sans-serif font family is used, with varied weights to create clear visual hierarchy.

---
### **Dynamic Motion & 3D Interactivity**

Animation is a core component of the user experience, used purposefully to guide the user, provide feedback, and create moments of "wow" without being distracting. The motion design is fluid, physics-based, and integral to the site's modern feel.

* **UI & Micro-animations:**
    * **Fluid Page Transitions:** Navigating between pages or sections does not trigger a harsh reload. Instead, smooth, fast transitions (e.g., content sliding in, subtle fades) create the seamless feel of a native application.
    * **Interactive Feedback:** Buttons and icons don't just change state; they animate. The "Like" icon might emit a small burst of particles when clicked. The "Bookmark" icon might animate a folding motion.
    * **Intelligent Hover States:** Hovering over an article card in the content grid causes it to subtly lift towards the user on the z-axis, gaining a soft, colored glow, inviting a click.
    * **Animated Filtering:** When a user filters the content grid, articles don't just vanish. Existing items gracefully animate out, and the new set elegantly animates into place, making the filtering action feel satisfying and clear.
    * **Custom Loaders:** Loading states are replaced with beautifully crafted, on-brand animations, such as a stylized 3D version of the site's logo or a spinning football.

* **Signature 3D Elements:** To push the boundaries of web design, the site incorporates interactive 3D elements in key areas.
    * **3D Hero Banners:** In the "Prima Pagina" section, top-tier articles can feature subtle, interactive 3D models. A major F1 story might have a low-poly 3D model of a race car that the user can slightly rotate with their mouse. A Champions League article could feature a slowly spinning 3D football in the background of its card.
    * **Animated Sport Hub Icons:** When navigating to a specific sport's hub, the icon in the header could feature a short, high-quality 3D animation—a basketball bouncing into place, a tennis ball spinning, etc.—to create a memorable transition.
    * **Interactive Data Visualizations:** For articles heavy on statistics, static charts are replaced with interactive 3D graphs and charts that users can rotate and explore, making complex data intuitive and engaging.

---

### **Website Architecture & Page Structure**

#### **1. The Main Portal (Homepage)**

* **"Prima Pagina" (Headline Hero):** A full-width carousel showcasing the most important stories, enhanced with the aforementioned 3D and animation capabilities to make them truly stand out.
* **Main Content Grid:** The core grid feels alive. Cards animate on hover, and the entire grid reflows with fluid animation when filters are applied.

#### **2. Sport-Specific Hubs (Calcio, Tennis, F1, NFL, Basket)**

The transition to each hub is marked by a unique loading animation tied to the sport, reinforcing the user's destination. The sub-navigation for leagues animates smoothly into view.

#### **3. The Article Page**

* **Interaction Bar:** The "sticky" interaction bar icons provide delightful animated feedback upon click, confirming the user's action in a satisfying way.
* **Scroll-based Animations:** As a user scrolls through a long article, elements like blockquotes or embedded images can subtly fade or slide into view, keeping the reading experience dynamic.

---

### **User Roles & Permissions**

The site operates on a clear, three-tiered user hierarchy.

Registered User:

Can create a personalized profile.

Can comment on articles.

Can like, repost, and bookmark articles.

Can customize their homepage feed and theme.

Cannot create or edit posts.

Editor:

Possesses all Registered User permissions.

Gains access to a sophisticated Content Creation Interface.

Can write, edit, and publish news articles.

Can upload and manage media (images, videos).

Has granular control over their own posts, including:

Disabling/Enabling Comments: A simple toggle in the post settings.

Restricting Visibility: Can limit a post's visibility to certain user groups (e.g., a future "Subscriber" tier).

Administrator:

Has absolute control over the entire platform via a dedicated Admin Dashboard.

### **Core Features & Functionality**

Content Creation (Editor Interface)
A modern, web-based WYSIWYG (What You See Is What You Get) editor that is a pleasure to use.

Intuitive Toolbar: Provides easy access to text formatting (headings, bold, lists), and embedding features.

Media Integration: A drag-and-drop interface for uploading images. Images are automatically optimized and served via a CDN.

Markdown Support: For power users, the editor can be toggled to a raw Markdown mode.

SEO & Metadata: Fields for SEO title, meta description, and social sharing cards are built directly into the publishing workflow.

Advanced Search
The search engine is powerful and context-aware.

Scope: Users can choose to search the entire site or only within the sport hub they are currently viewing.

Parameters: The advanced search page allows users to query by:

title:

content:

author: (e.g., author:JohnDoe)

# (hashtag)

@ (mention)

Date Range

User Profiles & Social Integration
Profiles: Every registered user has a public profile page displaying their chosen username, profile picture, a short bio, and a feed of their public activity (comments, reposts).

Social Login/Registration: Users can register and log in using their Google, Twitter, or Facebook accounts for ease of access.

Social Sharing & Integration: Sharing buttons are elegantly integrated. Instead of generic email links, the focus is on rich integration with platforms like Twitter, where sharing a post automatically generates a visually appealing card with the headline and main image.

---

### **Administrative Backend (The Dashboard)**
Accessible only to the Administrator, this is the site's command center.

User Management: A master table of all users. The admin can:

View users, their email addresses, and roles.

Manually assign or revoke permissions (e.g., promote a user to Editor).

Ban or delete users.

Security: Passwords are never visible. They are securely stored in the database using a strong, one-way hashing algorithm like bcrypt.

Content Oversight: The admin can view, edit, or delete any post from any editor.

Site Analytics: Integrated dashboard showing key metrics like user growth, article views, and popular content.

Asset Management: Interface to manage the custom icons, logos, and other global visual assets.

Technical Stack & Implementation
Database: A secure and robust MySQL (or PostgreSQL) database. The schema is fully normalized, with indexing for fast queries. All interactions are handled through prepared statements to prevent SQL injection vulnerabilities.

Backend: A scalable backend framework (e.g., Laravel for PHP, or Django/Node.js for other environments) that exposes a RESTful API.

Frontend: A modern JavaScript framework like Vue.js or React to create the dynamic, interactive, and app-like user experience.

Security: SSL/TLS encryption is enforced site-wide. Input sanitization, CSRF protection, and other security best practices are implemented.

Performance: A Content Delivery Network (CDN) is used to serve images, icons, and static assets, ensuring fast load times for a global audience.

Additional Value-Added Features
Live Match Center: A dedicated section with real-time score updates, key incidents (goals, cards, etc.), and live text commentary for major events.

Notification System: A small bell icon in the header provides users with real-time notifications for replies to their comments, or when an editor they follow publishes a new article.

Community Forums: Beyond comments, a dedicated forum section for each sport would allow for deeper, long-form discussions and community building.

Monetization Ready: The user role system is built to easily accommodate a future "Premium Subscriber" tier, which could offer ad-free Browse, exclusive content, or access to a private Discord server.

### **Technical Stack & Implementation**

* **Database:** Secure and robust **MySQL** or **PostgreSQL**.
* **Backend:** A scalable backend framework (e.g., Laravel, Django, Node.js) with a RESTful API.
* **Frontend:** A modern JavaScript framework like **Vue.js** or **React**.
* **Animation & 3D Libraries:** The sophisticated animations are powered by industry-leading libraries:
    * **GSAP (GreenSock Animation Platform):** For all high-performance, complex UI and timeline-based animations.
    * **Three.js / WebGL:** To create and render the interactive 3D models and data visualizations directly in the browser.
* **Security:** Enforced SSL/TLS, input sanitization, CSRF protection, and bcrypt for password hashing.
* **Performance:** A **Content Delivery Network (CDN)** is crucial for serving not only images and icons but also the 3D model assets and animation libraries, ensuring the visually rich experience remains fast worldwide.

### **Additional Value-Added Features**
Live Match Center: A dedicated section with real-time score updates, key incidents (goals, cards, etc.), and live text commentary for major events.

Notification System: A small bell icon in the header provides users with real-time notifications for replies to their comments, or when an editor they follow publishes a new article.

Community Forums: Beyond comments, a dedicated forum section for each sport would allow for deeper, long-form discussions and community building.

Monetization Ready: The user role system is built to easily accommodate a future "Premium Subscriber" tier, which could offer ad-free Browse, exclusive content, or access to a private Discord server.

E questo è quello che mi ha risposto:
Looking at your vision for "I Malati dello Sport," I can see this is a sophisticated sports news platform with a focus on stunning visuals, animations, and user experience. Let me implement the foundation with:

**Design Inspiration:**
- Modern sports media platforms like ESPN and Sky Sports, but with Italian flair
- Focus on the dramatic red (#ff3036) and sophisticated gray (#3e3e3e) palette
- "Liquid glass" navigation with depth and movement
- Rich, animated content grids that feel alive

**First Version Features:**
- Sports hub navigation (Calcio, Tennis, F1, NFL, Basket)
- Dynamic article grid with hover animations
- Theme switcher (dark/light mode)
- Liquid glass header effect
- User authentication system foundation
- Interactive article cards with micro-animations

**Design System:**
- Custom red and gray color scheme
- Elegant gradients and glass effects
- Fluid animations and transitions
- Professional typography hierarchy
=======
>>>>>>> 5cd0e60dad5ef7cbd3c8abb8bbfeeac5e65d7377
