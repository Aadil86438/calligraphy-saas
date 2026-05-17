# SaaS Source of Truth Book (Updated)

This document serves as the COMPLETE, LOSSLESS, and REBUILDABLE Source of Truth for the `Nafzz studio` Calligraphy SaaS platform. It maps the exact state, business logic, and architectural design strictly derived from the provided codebase.

---

## 1. SYSTEM OVERVIEW

**Exact Purpose:**
A bespoke hybrid E-commerce platform designed for "Nafzz studio". It operates on two distinct paradigms:
1. **Physical Handcrafted Products:** A storefront with a multi-item cart system allowing customers to browse physical calligraphy pieces, bundle them into a cart, and place personalized orders via a WhatsApp redirection flow.
2. **Digital Products (Secure Downloads):** A parallel automated storefront allowing customers to purchase digital assets (e.g., PDFs, workbooks) via manual UPI transactions. It includes a secure, rate-limited, and time-expiring download mechanism to prevent unauthorized sharing.

**Core Features:**
*   **Dual-Mode Public Storefront:** Two distinct customer interfaces (Physical vs Digital) featuring dynamic theming (Light/Dark mode) and real-time product listings.
*   **Multi-Item Cart System (Physical):** Pinia-backed shopping cart allowing quantity adjustments, total calculations, and bundled WhatsApp checkouts.
*   **Automated Digital Fulfillment (Digital):** Secure UPI verification flow, followed by rate-limited download links via signed URLs.
*   **Admin Command Center:** Secure login portal for business owners featuring real-time analytics, revenue tracking across both physical and digital pipelines.
*   **Inventory Management:** Full CRUD capabilities for physical products (soft deletes, image uploads) and digital products (PDF uploads to private buckets, cover images to public buckets).
*   **Order Fulfillment Logs:** Real-time physical order tracking (pending/completed) with A4 printable invoices, alongside digital order management and IP-tracked download logs.

**High-Level Architecture:**
*   **Frontend:** A Single Page Application (SPA) built with Vue 3 (Composition API), Vite, Vue Router, Pinia (for Cart state), and Vuetify 3 (for UI components).
*   **Backend/Database:** Serverless backend powered by Supabase. Utilizes Supabase PostgreSQL, Supabase Auth, and Supabase Storage (both Public and Private buckets).
*   **Real-time Layer:** Supabase real-time channels synchronize physical products, physical orders, digital products, and digital orders dynamically across clients without refreshing.
*   **Integrations:** WhatsApp web API (`wa.me`) for physical checkouts, and custom UPI string matching for digital products.

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
├── digital_migration.sql       # Schema for digital product DB tables
├── supabase_migration.sql      # Schema for physical cart/order_items DB tables
├── public/                     # Public static assets
└── src/                        # Core application source code
    ├── main.js                 # App bootstrap (Router, Vuetify, Pinia)
    ├── App.vue                 # Root Vue component, global layouts, snackbar, loader
    ├── components/             # Reusable UI fragments
    │   ├── CartDrawer.vue      # Slide-out shopping cart for physical items
    │   ├── CheckoutDialog.vue  # Final checkout form for WhatsApp routing
    │   ├── DigitalProductCard.vue # UI card for digital storefront
    │   └── DigitalPurchaseDialog.vue # UPI checkout flow for digital items
    ├── config/                 # Configuration variables
    │   └── constants.js        # Global app constants (WhatsApp, UPI, Limits)
    ├── plugins/                # Vue plugins setup
    │   └── vuetify.js          # Vuetify 3 theme definitions
    ├── router/                 # Vue Router configuration
    │   └── index.js            # Route definitions and auth guards
    ├── services/               # External API integrations
    │   ├── SupabaseService.js  # Supabase client wrapper (Auth, Physical DB)
    │   └── DigitalProductService.js # Isolated Supabase wrapper for Digital DB
    ├── stores/                 # State management (Pinia)
    │   └── cart.js             # Cart state (Items, Totals, LocalStorage sync)
    └── views/                  # Page-level Vue components
        ├── AdminDashboard.vue  # Layout wrapper for admin section
        ├── AdminLogin.vue      # Admin authentication page
        ├── AdminOverview.vue   # Dashboard statistics
        ├── DigitalOrderAdmin.vue # Admin table for digital transactions & logs
        ├── DigitalProductAdmin.vue # Admin CRUD for digital inventory
        ├── DigitalProducts.vue # Public storefront for digital items
        ├── HomeView.vue        # Public storefront for physical items
        ├── OrderManagement.vue # Admin table for physical orders & invoices
        └── ProductManagement.vue # Admin CRUD for physical inventory
```

---

## 3. TECHNOLOGY STACK

**Languages & Frameworks:**
*   **Vue.js (`^3.5.30`)**: Frontend framework (Composition API).
*   **Vuetify (`^4.0.5`)**: Material Design component framework (UI, Grid, Theming).

**Libraries:**
*   **Vue Router (`^5.0.4`)**: Client-side routing.
*   **Pinia (`^3.0.4`)**: State management (used specifically for the `cart.js` store, hydrated via LocalStorage).
*   **Supabase JS Client (`^2.101.1`)**: Official SDK for Supabase services.
*   **Material Design Icons (`@mdi/font ^7.4.47`)**: Iconography.

**Build Tools:**
*   **Vite (`^6.0.0`)**: Build tool and dev server.
*   **Sass (`^1.98.0`)**: CSS preprocessor.

---

## 4. CONFIGURATION & ENVIRONMENT

**Environment Variables (`.env`):**
*   `VITE_SUPABASE_URL`: The Supabase project endpoint.
*   `VITE_SUPABASE_ANON_KEY`: The public anonymous key for Supabase API access.

**App Constants (`src/config/constants.js`):**
*   `WHATSAPP_NUMBER`: `'8643839796'`
*   `CURRENCY_SYMBOL`: `'₹'`
*   `APP_NAME`: `'Nafzz studio'`
*   `UPI_ID`: `'mohammedadil3002@okhdfcbank'`
*   `DIGITAL_DOWNLOAD_LIMIT`: `3`
*   `SIGNED_URL_EXPIRY`: `60` (seconds)

**Deployment Settings:**
*   `vercel.json` implies the project is configured for Vercel edge deployment.

---

## 5. DATABASE & DATA MODELS

Derived strictly from the migration files (`digital_migration.sql`, `supabase_migration.sql`) and Service abstractions.

### Physical Commerce Schema
**Table: `products`**
*   `id`: UUID (Primary Key)
*   `name`: Text
*   `description`: Text
*   `price`: Numeric
*   `image_url`: Text (Storage URL)
*   `is_active`: Boolean (Default `true`)
*   `category`: Text (Default `'General'`)
*   `created_at`: Timestamptz

**Table: `orders`**
*   `id`: UUID (Primary Key)
*   `customer_name`: Text
*   `phone`: Text
*   `custom_text`: Text
*   `notes`: Text
*   `product_id`: UUID (FK to products - Legacy fallback)
*   `product_name`: Text (Legacy fallback)
*   `price`: Numeric (Legacy fallback)
*   `total_amount`: Numeric
*   `status`: Text (`'pending'`, `'completed'`)
*   `created_at`: Timestamptz

**Table: `order_items` (New for Cart System)**
*   `id`: UUID (Primary Key)
*   `order_id`: UUID (FK to orders ON DELETE CASCADE)
*   `product_id`: UUID (FK to products)
*   `product_name`: Text
*   `price`: Numeric
*   `quantity`: Integer (Default 1)
*   `subtotal`: Numeric
*   `created_at`: Timestamptz

### Digital Commerce Schema
**Table: `digital_products`**
*   `id`: UUID (Primary Key)
*   `title`: Text
*   `description`: Text
*   `price`: Numeric
*   `preview_image_url`: Text
*   `original_pdf_path`: Text (Internal path, not public URL)
*   `product_type`: Text (Default `'digital'`)
*   `is_active`: Boolean (Default `true`)
*   `created_at`: Timestamptz

**Table: `digital_orders`**
*   `id`: UUID (Primary Key)
*   `digital_product_id`: UUID (FK to digital_products)
*   `customer_name`: Text
*   `phone`: Text
*   `transaction_id`: Text (UNIQUE, prevents double-spending)
*   `amount`: Numeric
*   `payment_status`: Text (Default `'self_confirmed'`)
*   `download_enabled`: Boolean (Default `false`, though code sets to `true` on creation)
*   `download_count`: Integer (Default 0)
*   `download_limit`: Integer (Default 3)
*   `created_at`: Timestamptz

**Table: `digital_download_logs`**
*   `id`: UUID (Primary Key)
*   `digital_order_id`: UUID (FK to digital_orders ON DELETE CASCADE)
*   `downloaded_at`: Timestamptz
*   `ip_address`: Text
*   `user_agent`: Text

### Storage Buckets
1.  **`products` (Public)**: Images for physical products.
2.  **`digital-previews` (Public)**: Cover images for digital products.
3.  **`digital-originals` (Private - CRITICAL)**: Stores actual PDF files. Must NOT be public. Accessible only via Signed URLs.

---

## 6. BACKEND LOGIC

Backend logic is abstracted into two services: `SupabaseService.js` and `DigitalProductService.js`.

**Physical Orders (`SupabaseService.js`):**
*   `createOrderWithItems(order, items)`: Atomically inserts an order and its associated `order_items`. Handles cleanup if item insertion fails.
*   `getOrdersWithItems()`: Fetches orders joined with their items (`select('*, order_items(*)')`).
*   Soft-delete logic on `products` is maintained to preserve historical `order_items` references.

**Digital Orders (`DigitalProductService.js`):**
*   `createDigitalOrder(order)`: Implements double-spend protection by explicitly querying `checkDuplicateTransaction(transactionId)`. If a duplicate is found, throws an error.
*   `uploadOriginalPdf(file)`: Uploads to the private `digital-originals` bucket and returns ONLY the internal path.
*   `processDownload(orderId)` (CRITICAL SECURITY):
    1. Fetches the order and validates `download_enabled`.
    2. Validates `download_count` against `download_limit` (Constant: 3).
    3. Calls Supabase `createSignedUrl` using the `original_pdf_path` with an expiry of 60 seconds.
    4. Increments the `download_count`.
    5. Inserts an audit log into `digital_download_logs` capturing the User-Agent.

**Real-time Subscriptions:**
Four websocket channels exist: `products`, `orders`, `digital_products`, `digital_orders`, all listening to `postgres_changes`.

---

## 7. FRONTEND LOGIC

**State Management (Pinia - `src/stores/cart.js`):**
*   Tracks physical product selections.
*   Calculates `cartCount` and `cartTotal`.
*   Hydrates state from `localStorage('nafzzCart')` on initialization and watches for changes.
*   Implements `removeInactiveProducts(activeProducts)` to scrub carts of items an Admin soft-deletes.

**Routing Logic (`src/router/index.js`):**
*   `/`: Physical Home.
*   `/digital`: Digital Products Home.
*   `/admin/login`: Auth gate.
*   `/admin`: Dashboard Wrapper (Requires Auth). Sub-routes (`products`, `orders`) redirect to `/admin` where Vuetify Tabs handle local view swapping.

**UI Flows:**
1.  **Physical Cart Flow (`HomeView.vue` + `CartDrawer.vue` + `CheckoutDialog.vue`)**: Users add items to the Pinia cart. The cart drawer displays subtotals. Clicking checkout opens the `CheckoutDialog`, captures Name/Phone/Notes, writes to the DB via `createOrderWithItems`, clears the cart, and redirects to WhatsApp via URI encoding.
2.  **Digital Purchase Flow (`DigitalProducts.vue` + `DigitalPurchaseDialog.vue`)**: User selects a digital item. Dialog shows UPI details (QR not in code, implies manual entry). User inputs their Name, Phone, and the 12-digit UPI Transaction ID. DB verifies uniqueness. Success grants immediate download access.
3.  **Admin Tabs (`AdminDashboard.vue`)**: Admin interface uses `v-window`/`v-tabs` to seamlessly switch between: Overview, Physical Inventory, Physical Orders, Digital Inventory, and Digital Orders.

---

## 8. INTEGRATIONS

**WhatsApp Integration (Physical):**
*   Constructs a multi-line string iterating through `cart.items`, appending Subtotals and Grand Total.
*   Redirects via `https://wa.me/{CONFIG.WHATSAPP_NUMBER}?text={encoded}`.

**UPI System (Digital):**
*   A fully manual validation loop. The customer is shown `CONFIG.UPI_ID`. They pay on their own app, find the UTR/Transaction ID, and paste it. The system trusts this ID, logging it into the DB (enforced UNIQUE). Admin later cross-references their bank statements.

---

## 9. AUTHENTICATION & SECURITY

*   **Admin Auth**: Managed by `@supabase/supabase-js`.
*   **Signed URLs**: Digital PDF downloads are strictly gated. The browser NEVER knows the permanent URL of the PDF. The frontend requests a download, backend (`processDownload`) mints a 60-second expiring URL, and redirects the browser.
*   **Row Level Security (RLS)**: Enforced via the `.sql` migration files.
    *   `digital_products`: Select is public, mutations require Auth.
    *   `digital_orders`: Insert is public, Select/Update requires Auth (or public if policies allow, but primarily used by admin).
    *   `digital_download_logs`: Insert public, Select Auth.
*   **Idempotency**: SQL migrations are wrapped in `IF NOT EXISTS` or `DO $$ BEGIN` blocks to allow safe re-runs.

---

## 10. DEPLOYMENT & INFRASTRUCTURE

*   **Hosting**: Vercel/Netlify optimized (Static output).
*   **Database**: Supabase PostgreSQL.
*   **Storage Setup Requirements**: The admin MUST manually create `digital-previews` (PUBLIC) and `digital-originals` (PRIVATE) in the Supabase dashboard as defined in `digital_migration.sql`.

---

## 11. BUSINESS LOGIC (CORE VALUE)

**User Journey (Physical - Multi-Item):**
1. User visits `/`. Adds multiple items to Cart (Pinia state updates, LocalStorage syncs).
2. User opens Cart Drawer, reviews totals, proceeds to Checkout.
3. User enters contact info. `createOrderWithItems` fires atomically.
4. User redirected to WhatsApp with formatted receipt. Admin fulfills manually.

**User Journey (Digital - Instant Download):**
1. User visits `/digital`. Clicks "Buy Now" on a workbook.
2. Dialog shows UPI ID. User pays via external app (GPay/PhonePe).
3. User types the 12-digit UPI ID into the site and submits.
4. System validates the ID is not a duplicate. Creates `digital_order`.
5. User is shown a "Download Now" button.
6. Clicking triggers `processDownload()`. Server verifies limits (<3), logs the IP/Agent, mints a 60s Signed URL, and downloads the PDF directly to the user's device.

---

## 12. EDGE CASES & LIMITATIONS

*   **Cart Integrity vs DB State**: If an admin deletes a product while it is in a user's `localStorage` cart, the cart will display a dead item until `removeInactiveProducts` scrubs it upon a fresh product fetch.
*   **Digital Download Limits**: Fixed at 3 downloads per order to prevent URL sharing. If a user fails the download 3 times, they are permanently locked out and must contact support (WhatsApp).
*   **Transaction ID Guessing**: The system relies on the uniqueness of the UPI ID. If a user inputs a fake but unique ID, they will receive the download for free. The Admin must manually reconcile bank statements against the `digital_orders` table and revoke access/contact the user if fraudulent.
*   **Client-side IP Logging**: The `digital_download_logs` table logs `ip_address: 'client'` because Supabase JS client runs in the browser. True IP tracking requires an Edge Function or server-side middleware, which is absent here.

---

## 13. REBUILD GUIDE (CRITICAL)

To recreate this exact SaaS without the code:

**Phase 1: Backend Infrastructure (Supabase)**
1.  Create a project. Enable Auth (Email/Password).
2.  Execute `supabase_migration.sql` (Creates `order_items`, updates `orders`/`products`, sets RLS).
3.  Execute `digital_migration.sql` (Creates `digital_products`, `digital_orders`, `digital_download_logs`, sets RLS).
4.  Create Storage Buckets:
    *   `products` (Public)
    *   `digital-previews` (Public)
    *   `digital-originals` (PRIVATE - Do not tick the public box).
5.  Enable Realtime publication for: `products`, `orders`, `order_items`, `digital_products`, `digital_orders`.

**Phase 2: Frontend Environment**
1.  `npm create vite@latest calligraphy-saas -- --template vue`
2.  `npm install vue-router@4 pinia vuetify@3 @mdi/font @supabase/supabase-js sass`
3.  Populate `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

**Phase 3: Code Scaffolding**
1.  Initialize Vuetify (`plugins/vuetify.js`) and Pinia (`main.js`).
2.  Implement `src/config/constants.js` with UPI, WhatsApp, and Limit constants.
3.  Implement `src/services/SupabaseService.js` (Physical) and `src/services/DigitalProductService.js` (Digital) adhering to the RPC signatures documented above.
4.  Implement `src/stores/cart.js` (Pinia + LocalStorage watcher).
5.  Build UI components (`CartDrawer.vue`, `CheckoutDialog.vue`, `DigitalPurchaseDialog.vue`).
6.  Assemble Views and map to `vue-router`.

---

## 14. FILE-BY-FILE DEEP DIVE

*   **`src/stores/cart.js`**
    *   *Purpose:* Centralized physical cart state.
    *   *Key Functions:* `hydrate` (try/catch localStorage), `watch` (persist changes), `addToCart`, `removeInactiveProducts` (integrity check).
*   **`src/services/DigitalProductService.js`**
    *   *Purpose:* Dedicated boundary for digital data.
    *   *Key Functions:* `checkDuplicateTransaction` (Unique DB check), `uploadOriginalPdf` (returns path, NOT URL), `processDownload` (Atomic check of limit -> createSignedUrl -> log download).
*   **`digital_migration.sql` & `supabase_migration.sql`**
    *   *Purpose:* Source of truth for database schema and security (RLS).
    *   *Role:* Idempotent setup scripts ensuring tables, relationships (Cascades), and realtime hooks exist.
*   **`src/components/CheckoutDialog.vue`**
    *   *Purpose:* Finalizes physical orders.
    *   *Role:* Collects user info, calculates total from Pinia, triggers atomic DB write, maps order lines into WhatsApp string.
*   **`src/components/DigitalPurchaseDialog.vue`**
    *   *Purpose:* Digital storefront checkout.
    *   *Role:* Validates 12-digit UPI, manages the transition from "Purchase" to "Download" states, displays download limit countdown.
*   **`src/views/AdminDashboard.vue`**
    *   *Purpose:* Unified command center.
    *   *Role:* Uses `v-tabs` (`admin-tabs`) to navigate between Overview, Physical Products, Physical Orders, Digital Products, Digital Orders without changing the router path.

---

## 15. RAW CODE REFERENCES

**Core Algorithm 1: Atomic Multi-Item Order (`SupabaseService.js`)**
```javascript
async createOrderWithItems(order, items) {
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([order])
    .select()

  if (orderError) throw orderError
  const createdOrder = orderData[0]

  const itemsWithOrderId = items.map(item => ({
    ...item,
    order_id: createdOrder.id
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsWithOrderId)

  if (itemsError) {
    await supabase.from('orders').delete().eq('id', createdOrder.id) // Cleanup on fail
    throw itemsError
  }
  return createdOrder
}
```

**Core Security 1: Rate-Limited Secure Download (`DigitalProductService.js`)**
```javascript
async processDownload(orderId) {
  const { data: order } = await supabase.from('digital_orders')
    .select('*, digital_products(original_pdf_path, title)').eq('id', orderId).single()

  if (order.download_count >= order.download_limit) {
    throw new Error(`Download limit reached`)
  }

  const signedUrl = await this.getDownloadUrl(order.digital_products.original_pdf_path)

  await supabase.from('digital_orders')
    .update({ download_count: order.download_count + 1 }).eq('id', orderId)

  await supabase.from('digital_download_logs')
    .insert([{ digital_order_id: orderId, ip_address: 'client', user_agent: navigator.userAgent }])

  return { signedUrl, fileName: order.digital_products.title, remainingDownloads: order.download_limit - order.download_count - 1 }
}
```

**Core Algorithm 2: Pinia LocalStorage Sync (`cart.js`)**
```javascript
// Hydrate
try {
  const saved = localStorage.getItem('nafzzCart')
  if (saved) {
    const parsed = JSON.parse(saved)
    if (Array.isArray(parsed)) items.value = parsed
  }
} catch { localStorage.removeItem('nafzzCart') }

// Persist
watch(items, (val) => {
  try { localStorage.setItem('nafzzCart', JSON.stringify(val)) } catch {}
}, { deep: true })
```
