# SaaS Source of Truth Book

This document serves as the COMPLETE, LOSSLESS, and REBUILDABLE Source of Truth for the `Nafzz studio` Calligraphy SaaS platform. It maps the exact state, business logic, and architectural design strictly derived from the provided codebase. 

---

## 1. SYSTEM OVERVIEW

**Exact Purpose:**
A bespoke E-commerce and SaaS platform designed for "Nafzz studio", allowing the business to showcase and sell handcrafted luxury calligraphy pieces. It features a public-facing storefront for customers to browse products and place personalized orders via a WhatsApp redirection flow. Concurrently, it offers a secure Admin Dashboard for the business owner to manage inventory (products), track orders in real-time, analyze performance metrics, and generate printable invoices.

**Core Features:**
*   **Public Storefront:** A premium, responsive interface featuring dynamic theming (Light/Dark mode), real-time product listing, searching, and sorting mechanisms.
*   **Order Placement System:** A specialized checkout flow where users provide personalization details (custom text) and their contact info, which records the order in the database and redirects the user to WhatsApp with a pre-formatted message.
*   **Admin Authentication:** Secure login portal for the business owner.
*   **Command Center (Admin Dashboard):** Real-time analytics, revenue tracking, and recent activity monitoring.
*   **Product Inventory Management:** Full CRUD (Create, Read, Update, Delete) capabilities for products, including image uploads and soft-delete logic.
*   **Order Tracking & Invoicing:** Table-based order management with status toggling (Pending/Completed) and a dedicated printable A4 invoice generation system.

**High-Level Architecture:**
*   **Frontend:** A Single Page Application (SPA) built with Vue 3 (Composition API), Vite, Vue Router, and Vuetify 3 (for UI components and Material Design styling).
*   **Backend/Database:** Serverless backend powered by Supabase. It utilizes Supabase PostgreSQL for relational data, Supabase Auth for identity management, and Supabase Storage for product images.
*   **Real-time Layer:** Supabase real-time channels are utilized to synchronize product and order states dynamically across clients without requiring manual page refreshes.
*   **Integrations:** WhatsApp web API (`wa.me`) for bridging the gap between web-order placement and direct business-to-customer communication.

---

## 2. PROJECT STRUCTURE

```text
calligraphy-saas/
├── .env                        # Environment variables (Supabase URL/Key)
├── .gitignore                  # Git ignore rules
├── index.html                  # Vite application entry point
├── package-lock.json           # Exact dependency tree lockfile
├── package.json                # Project metadata, scripts, and dependencies
├── vercel.json                 # Vercel deployment configuration
├── vite.config.js              # Vite bundler configuration
├── public/                     # Public static assets (not detailed in code provided)
└── src/                        # Core application source code
    ├── main.js                 # App bootstrap, plugin registration (Router, Vuetify, Pinia)
    ├── App.vue                 # Root Vue component, global layouts, snackbar, loader
    ├── assets/                 # Local images/icons (hero.png, vite.svg)
    ├── config/                 # Configuration variables
    │   └── constants.js        # Global app constants (WhatsApp #, Social URLs)
    ├── plugins/                # Vue plugins setup
    │   └── vuetify.js          # Vuetify 3 theme definitions (Luxury themes)
    ├── router/                 # Vue Router configuration
    │   └── index.js            # Route definitions and auth guards
    ├── services/               # External API integrations
    │   └── SupabaseService.js  # Supabase client wrapper (Auth, DB, Storage)
    └── views/                  # Page-level Vue components
        ├── AdminDashboard.vue  # Layout wrapper for admin section (Sidebar, Header)
        ├── AdminLogin.vue      # Admin authentication page
        ├── AdminOverview.vue   # Dashboard statistics and recent orders
        ├── HomeView.vue        # Public storefront and order placement logic
        ├── OrderManagement.vue # Admin table for tracking orders and printing invoices
        └── ProductManagement.vue # Admin grid/table for inventory CRUD
```

---

## 3. TECHNOLOGY STACK

**Languages & Frameworks:**
*   **Vue.js (`^3.5.30`)**: Core reactive frontend framework using the Composition API (`<script setup>`).
*   **Vuetify (`^4.0.5`)**: Material Design component framework responsible for the UI, Grid system, and theming.
*   **JavaScript (ES6+)**: Primary scripting language.

**Libraries:**
*   **Vue Router (`^5.0.4`)**: Client-side routing.
*   **Pinia (`^3.0.4`)**: State management (Installed and registered in `main.js`, but localized state via `Provide/Inject` is predominantly used instead).
*   **Supabase JS Client (`^2.101.1`)**: Official SDK for interacting with Supabase services.
*   **Material Design Icons (`@mdi/font ^7.4.47`)**: Iconography system.

**Build Tools & Environment:**
*   **Vite (`^6.0.0`)**: Fast frontend build tool and development server.
*   **Vite Vue Plugin (`@vitejs/plugin-vue ^5.2.1`)**: Vue SFC support for Vite.
*   **Sass (`^1.98.0`)**: CSS preprocessor.
*   **Node.js**: Environment requirement for NPM and Vite.

---

## 4. CONFIGURATION & ENVIRONMENT

**Environment Variables (`.env`):**
*   `VITE_SUPABASE_URL`: The Supabase project endpoint.
*   `VITE_SUPABASE_ANON_KEY`: The public anonymous key for Supabase API access.
*   *(Note: These are hardcoded in the codebase snapshot as `https://yprevigfgrbsemixzepa.supabase.co` and its corresponding JWT).*

**App Constants (`src/config/constants.js`):**
*   `CONFIG.WHATSAPP_NUMBER`: `'8643839796'`
*   `CONFIG.CURRENCY_SYMBOL`: `'₹'`
*   `CONFIG.YOUTUBE_URL`: `'https://youtube.com/@nafzzcalligraphy?si=0CQPGxebe-D4Y3QX'`
*   `CONFIG.INSTAGRAM_URL`: `'https://instagram.com/@nafzzcalligraphy'`
*   `CONFIG.APP_NAME`: `'Nafzz studio'`

**Deployment Settings:**
*   `vercel.json` exists in the root, indicating the project is configured/optimized for Vercel edge deployment.

---

## 5. DATABASE & DATA MODELS

Derived strictly from the queries in `SupabaseService.js`, the Supabase PostgreSQL database requires the following exact schema:

**Table: `products`**
*   `id`: Primary Key (Type: UUID or Auto-increment Int)
*   `name`: Text/Varchar
*   `description`: Text
*   `price`: Numeric/Decimal
*   `image_url`: Text (URL linking to Supabase Storage)
*   `is_active`: Boolean (Used for soft-deletes)
*   `created_at`: Timestamp (Used for sorting: `order('created_at', { ascending: false })`)

**Table: `orders`**
*   `id`: Primary Key (Type: UUID expected due to `.slice(0, 8)` invoice logic)
*   `customer_name`: Text/Varchar
*   `phone`: Text/Varchar (WhatsApp number)
*   `custom_text`: Text (Personalization details)
*   `notes`: Text (Currently initialized in `HomeView.vue` but optional)
*   `product_id`: Foreign Key linking to `products.id`
*   `product_name`: Text/Varchar (Denormalized to prevent historical invoice corruption)
*   `price`: Numeric/Decimal (Denormalized at time of purchase)
*   `status`: Text (Values: `'pending'`, `'completed'`)
*   `created_at`: Timestamp

**Storage Bucket:**
*   A public bucket named `products` must exist to handle image uploads (`supabase.storage.from('products')`).

**Database Features:**
*   **Realtime**: The schema `public`, tables `products` and `orders` must have Supabase Realtime publication enabled for the `subscribeToProducts` and `subscribeToOrders` channel listeners to function.

---

## 6. BACKEND LOGIC

Backend logic is entirely outsourced to Supabase via the `SupabaseService.js` abstraction layer.

**Authentication:**
*   `login(email, password)`: Uses `supabase.auth.signInWithPassword`.
*   `logout()`: Uses `supabase.auth.signOut`.
*   `getUser()`: Uses `supabase.auth.getUser` to return the active session user.

**Product APIs:**
*   `getProducts()`: Fetches only active products (`eq('is_active', true)`). Used on the public storefront.
*   `getAllProducts()`: Fetches ALL products (active and inactive). Used in the Admin dashboard.
*   `createProduct(product)`: Inserts a new row into `products`.
*   `updateProduct(id, updates)`: Updates an existing product row.
*   `deleteProduct(id)`: Performs a **Soft Delete** by setting `is_active: false`. (This prevents breaking existing orders that rely on the product).
*   `uploadProductImage(file)`: Generates a random filename (`Math.random()`), uploads to `product-images/` directory in the `products` bucket, and retrieves the public URL.

**Order APIs:**
*   `createOrder(order)`: Inserts a new row into `orders`.
*   `getOrders()`: Fetches all orders, sorted newest first.
*   `updateOrderStatus(id, status)`: Updates the `status` column of an order.

**Real-time Logic:**
*   `subscribeToProducts(callback)` and `subscribeToOrders(callback)` open websocket channels to listen for `postgres_changes` on `INSERT`, `UPDATE`, and `DELETE` events.

---

## 7. FRONTEND LOGIC

**Global State & Injection:**
Instead of Pinia, global UI state (loading overlays, snackbar notifications) is managed centrally in `App.vue` using Vue's `provide/inject` API. `showMessage(text, color)` and `setLoading(boolean)` are injected into all child components.

**Routing Logic (`src/router/index.js`):**
*   `/`: Public Home.
*   `/admin/login`: Admin Login.
*   `/admin`: Parent Admin Dashboard Route (Requires Auth).
    *   `/admin` (default child): `AdminOverview.vue`
    *   `/admin/products`: `ProductManagement.vue`
    *   `/admin/orders`: `OrderManagement.vue`
*   **Navigation Guard:** `router.beforeEach` intercepts routes with `meta: { requiresAuth: true }`. It calls `SupabaseService.getUser()`. If no user exists, it redirects to `/admin/login`.

**UI Flows & State Management:**
1.  **Public Browsing (`HomeView.vue`)**:
    *   Fetches active products. Uses computed properties to handle Search (`searchQuery`) and Sorting (`sortBy`: newest, price_asc, price_desc, name_asc).
    *   Theming is toggled via `useTheme()` from Vuetify, flipping between `luxuryTheme` and `luxuryDark`.
2.  **Admin Login (`AdminLogin.vue`)**: Forms submit to `SupabaseService.login`. On success, redirects to `/admin`.
3.  **Dashboard Shell (`AdminDashboard.vue`)**: Provides the sidebar navigation and dynamic breadcrumb generation based on `route.path`.
4.  **Analytics (`AdminOverview.vue`)**: Computes `totalRevenue` from orders where `status === 'completed'`. Identifies `pendingOrders` and `uniqueCustomers` based on phone numbers.
5.  **Inventory (`ProductManagement.vue`)**: Toggles between table and grid view. Handles image upload base64 preview via `FileReader` before uploading the raw file to Supabase.
6.  **Orders & Invoicing (`OrderManagement.vue`)**: Tracks orders. Allows inline status updates via `v-select`. Contains an HTML/CSS printable invoice interface mapped strictly to A4 dimensions (`210mm x 297mm`) using `@media print` rules to hide the rest of the application.

---

## 8. INTEGRATIONS

**WhatsApp Integration:**
The application relies on WhatsApp for the final checkout conversion.
In `HomeView.vue`, `submitOrder()` creates a database record, then constructs a multi-line formatted string containing the product name, price, custom text, customer name, phone, and notes.
It encodes this string using `encodeURIComponent(message)` and redirects the user via `window.location.href = https://wa.me/{CONFIG.WHATSAPP_NUMBER}?text={encoded}`.

---

## 9. AUTHENTICATION & SECURITY

*   **Session Handling**: Token/session handling is intrinsically managed by `@supabase/supabase-js` within `localStorage`.
*   **Security Measures**: 
    *   Vue Router Navigation Guards prevent unauthorized access to `/admin/*`.
    *   Supabase Row Level Security (RLS) is heavily implied, though defined in the backend, not the codebase. To rebuild, RLS must protect `INSERT/UPDATE/DELETE` on `products` and `orders` restricting them to authenticated users, while allowing public `INSERT` on `orders` and `SELECT` on `products`.
*   **Data Integrity**: Deleting a product uses a "Soft Delete" (`is_active: false`) instead of a destructive `DELETE` query to maintain relational integrity for historical orders.

---

## 10. DEPLOYMENT & INFRASTRUCTURE

*   **Hosting Assumptions**: Optimized for static web app hosting (Vercel, Netlify, GitHub Pages). `vercel.json` implies Vercel.
*   **Build Steps**: 
    1. `npm install`
    2. Setup `.env` variables
    3. `npm run build`
    4. Serve the `/dist` output directory.
*   **Scaling Logic**: Scaling relies entirely on Supabase's managed infrastructure and real-time socket connections. The frontend is fully stateless aside from localStorage session tokens.

---

## 11. BUSINESS LOGIC (CORE VALUE)

**Step-by-Step User Journey (Internal Execution Path):**
1.  **Discovery**: Customer visits `/`. `fetchProducts()` fires, calling `SupabaseService.getProducts()`. Real-time socket `subscribeToProducts()` is opened.
2.  **Selection**: Customer clicks a product card, triggering `openOrderDialog(product)`. `selectedProduct` ref is populated.
3.  **Personalization**: Customer fills `orderForm` (Name, WhatsApp, Custom Text).
4.  **Submission**: Customer clicks "Confirm & Order".
    *   `form.validate()` runs.
    *   `orderData` payload is constructed, freezing `price` and `product_name` at current values.
    *   `SupabaseService.createOrder()` writes to the database (`status: 'pending'`).
    *   A timeout of 1500ms allows the UI to show a success snackbar.
    *   `window.location.href` fires, opening WhatsApp Web/App.
5.  **Fulfillment**: Admin views `/admin/orders`. The real-time listener `subscribeToOrders()` automatically injects the new order into the table. Admin reviews the custom text, executes the calligraphy physical work, updates the `status` to `completed` in the UI (firing `updateOrderStatus`), and generates a print/PDF invoice.

---

## 12. EDGE CASES & LIMITATIONS

**Found in Code:**
*   **Missing Validations**: The WhatsApp phone number field (`orderForm.phone`) relies solely on `[v => !!v || 'WhatsApp number is required']`. It does not validate numeric formatting, length, or country codes.
*   **Image Uploads**: `uploadProductImage` does not compress images or enforce file size limits natively on the frontend. It assumes the user uploads web-friendly files.
*   **Order Abandonment**: The order is recorded in the DB *before* the WhatsApp redirect. If the user closes the WhatsApp prompt without sending the message, the admin still sees a `pending` order in the dashboard but receives no WhatsApp message.
*   **Pagination**: `getAllProducts()` and `getOrders()` do not utilize Supabase pagination (`.range()`). For thousands of orders, the Admin dashboard will attempt to load the entire dataset into memory, which is a potential scaling failure point.

---

## 13. REBUILD GUIDE (CRITICAL)

To recreate this exact SaaS from scratch without the code, follow these exact steps:

**Phase 1: Backend Setup (Supabase)**
1.  Create a new Supabase project.
2.  **Database Schema:**
    *   Create `products` table: `id` (uuid, default uuid_generate_v4()), `name` (text), `description` (text), `price` (numeric), `image_url` (text), `is_active` (boolean, default true), `created_at` (timestamptz, default now()).
    *   Create `orders` table: `id` (uuid), `customer_name` (text), `phone` (text), `custom_text` (text), `notes` (text), `product_id` (uuid, FK to products.id), `product_name` (text), `price` (numeric), `status` (text, default 'pending'), `created_at` (timestamptz).
3.  **Storage:** Create a public bucket named `products`.
4.  **Realtime:** Go to Database -> Replication -> Enable `products` and `orders` for public schema.
5.  **Auth / RLS:** 
    *   Enable Email/Password Auth. Create an admin user.
    *   Set RLS on `products`: `SELECT` is public. `INSERT/UPDATE/DELETE` requires authentication.
    *   Set RLS on `orders`: `INSERT` is public. `SELECT/UPDATE/DELETE` requires authentication.

**Phase 2: Frontend Scaffolding**
1.  Run `npm create vite@latest calligraphy-saas -- --template vue`
2.  Install dependencies: `npm install vue-router@4 pinia vuetify@3 @mdi/font @supabase/supabase-js sass`
3.  Initialize Vuetify in `src/plugins/vuetify.js` exactly matching the `luxuryTheme` and `luxuryDark` color palettes (Primary: `#1A1A1A`, Secondary: `#D4AF37`).

**Phase 3: Code Implementation Order**
1.  **Constants:** Create `src/config/constants.js` with WhatsApp number and App Name.
2.  **Supabase Service:** Implement `src/services/SupabaseService.js` handling the exact DB abstractions.
3.  **Router:** Setup `src/router/index.js` with the specific routes and the `requiresAuth` navigation guard hooked to Supabase.
4.  **Global Shell:** Modify `App.vue` to Provide `showMessage` and `setLoading`, and include `<router-view />`, the global loader blur, and the glassmorphism snackbar.
5.  **Admin Views:** Implement `AdminDashboard.vue` layout. Build `AdminLogin.vue`. Build `ProductManagement.vue` (Table/Grid toggle, Dialog with FileReader image preview). Build `OrderManagement.vue` (Table, Status V-Select, A4 Print Invoice Dialog). Build `AdminOverview.vue` (Metric calculations).
6.  **Public Storefront:** Implement `HomeView.vue`. Map the grid to active products, implement the Order Dialog, and construct the WhatsApp URI redirect logic inside `submitOrder()`.

---

## 14. FILE-BY-FILE DEEP DIVE

*   **`vite.config.js`**
    *   *Purpose:* Bundler configuration.
    *   *Role:* Loads the `@vitejs/plugin-vue` to allow `.vue` files to be compiled into standard JS/CSS.
*   **`src/main.js`**
    *   *Purpose:* Application entry point.
    *   *Role:* Instantiates the Vue app (`createApp`), mounts Vuetify, Vue Router, and Pinia, and attaches them to the `#app` DOM node.
*   **`src/App.vue`**
    *   *Purpose:* Root component and global layout provider.
    *   *Role:* Contains `<router-view />`. Manages a global `v-overlay` for loading states and a `v-snackbar` for success/error alerts. Provides these methods via `provide()` to child components. Establishes global CSS variables, custom scrollbars, and luxury fonts (`Playfair Display`, `Outfit`).
*   **`src/router/index.js`**
    *   *Purpose:* Navigation controller.
    *   *Role:* Defines path-to-component mappings. Implements the `beforeEach` auth guard using `SupabaseService.getUser()`.
*   **`src/config/constants.js`**
    *   *Purpose:* Environment agnostic configuration.
    *   *Role:* Centralizes hardcoded business variables (`CONFIG.WHATSAPP_NUMBER`, URLs) to prevent magic strings.
*   **`src/plugins/vuetify.js`**
    *   *Purpose:* UI Framework definition.
    *   *Role:* Defines the visual identity of the SaaS. Sets up `luxuryTheme` (light) and `luxuryDark` (dark). Establishes default component behaviors (e.g., `VCard` flat with subtle borders, `VTextField` outlined).
*   **`src/services/SupabaseService.js`**
    *   *Purpose:* Backend abstraction.
    *   *Role:* Connects to Supabase via ENV vars. Exposes all necessary DB/Auth/Storage methods. Returns Promises for consumption by UI components.
*   **`src/views/HomeView.vue`**
    *   *Purpose:* Public storefront.
    *   *Key Functions:* `fetchProducts()`, `filteredProducts` (Computed logic for search/sort), `submitOrder()` (DB write + WhatsApp URI redirect payload generation).
*   **`src/views/AdminLogin.vue`**
    *   *Purpose:* Auth gatekeeper.
    *   *Role:* A simple card layout capturing email/password.
*   **`src/views/AdminDashboard.vue`**
    *   *Purpose:* Admin Layout Shell.
    *   *Role:* Provides the sidebar (`v-navigation-drawer`) and top header for the Admin portal. Computes dynamic breadcrumbs based on the router path.
*   **`src/views/AdminOverview.vue`**
    *   *Purpose:* Business Intelligence Dashboard.
    *   *Role:* Aggregates data. `totalRevenue` is calculated locally via `.reduce()`. Subscribes to real-time events to keep metrics live.
*   **`src/views/ProductManagement.vue`**
    *   *Purpose:* Inventory CRUD logic.
    *   *Key Functions:* `onFileChange` (FileReader preview), `saveProduct` (Uploads image if changed, then creates/updates record), `deleteProduct` (Soft delete toggle).
*   **`src/views/OrderManagement.vue`**
    *   *Purpose:* Order fulfillment logic.
    *   *Key Functions:* `updateStatus` (toggles between pending/completed). Contains a massive hidden HTML block (`#invoice-print-area`) designed precisely for `@media print` physical A4 printing.

---

## 15. RAW CODE REFERENCES

**Core Algorithm 1: WhatsApp Redirect Logic (`HomeView.vue`)**
```javascript
const submitOrder = () => {
  // ... validation and Supabase DB insert logic ...
  SupabaseService.createOrder(orderData).then(() => {
    // Construct structured WhatsApp message
    const message = `*NEW ORDER FROM THE Nafzz studio*
------------------------------
*Product:* ${selectedProduct.value.name}
*Price:* ${CONFIG.CURRENCY_SYMBOL}${selectedProduct.value.price}
*Custom Text:* ${orderForm.value.custom_text || 'Not specified'}
------------------------------
*Customer:* ${orderForm.value.customer_name}
*Phone:* ${orderForm.value.phone}
*Notes:* ${orderForm.value.notes || 'None'}
------------------------------
Please confirm my order. Thank you!`

    const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    
    setTimeout(() => {
      window.location.href = whatsappUrl
      dialog.value = false
    }, 1500)
  })
}
```

**Core Algorithm 2: Dynamic Sorting & Filtering (`HomeView.vue`)**
```javascript
const filteredProducts = computed(() => {
  let result = products.value

  // Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.description?.toLowerCase().includes(query)
    )
  }

  // Sort
  result = [...result].sort((a, b) => {
    if (sortBy.value === 'price_asc') return a.price - b.price
    if (sortBy.value === 'price_desc') return b.price - a.price
    if (sortBy.value === 'name_asc') return a.name.localeCompare(b.name)
    return new Date(b.created_at) - new Date(a.created_at)
  })

  return result
})
```

**Core DB Logic: Real-time Listener (`SupabaseService.js`)**
```javascript
  subscribeToProducts(callback) {
    return supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, callback)
      .subscribe()
  }
```

**Core Architecture: Soft Delete (`SupabaseService.js`)**
```javascript
  deleteProduct(id) {
    return supabase
      .from('products')
      .update({ is_active: false }) // Explicitly setting active to false rather than destroying row
      .eq('id', id)
      .select()
      // ...
  }
```
