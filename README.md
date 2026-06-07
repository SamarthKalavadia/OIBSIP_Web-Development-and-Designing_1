# OIBSIP Web Development & Designing — Task 1: Pizza Delivery Application

# 🍕 PizzaGo — Enterprise Full-Stack Pizza Customization & Delivery System

PizzaGo is a high-fidelity, production-grade **MERN (MongoDB, Express, React, Node.js)** web application engineered for the modern food-technology sector. The application provides an interactive customer experience, featuring a dynamic visual pizza customizer, and pairs it with a comprehensive administrative console to manage orders, inventory, and automated supply chains.

---

## 📸 System Architecture & Project Structure

The project is architected with a decoupled Client-Server layout to separate concerns and guarantee independent scaling:

```
OIBSIP_Web_Development_Designing_1-main/
│
├── client/                     # Frontend Application (Vite + React)
│   ├── src/
│   │   ├── components/         # Reusable UI elements (Navbar, Footer, Layouts)
│   │   ├── context/            # AuthContext managing session state
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register, Verification, Password Reset
│   │   │   ├── user/           # Dashboard, BuildPizza, Checkout, MyOrders, Profile
│   │   │   └── admin/          # AdminDashboard, Inventory, PizzaMenu, Orders, Analytics
│   │   └── services/           # Axios HTTP client configurations
│   ├── .env                    # Frontend environment configurations
│   └── index.html              # Main HTML entry point
│
└── server/                     # Backend API Server (Node + Express)
    ├── middleware/             # Route protection and role authorization guards
    ├── models/                 # Mongoose Schemas (User, Order, Inventory, Pizza)
    ├── routes/                 # REST API Routers (Auth, Order, Payment, Inventory)
    ├── utils/                  # Automated helper functions (Email dispatch, stock checkers)
    ├── server.js               # Entrypoint configuring middleware, routes, and DB
    └── .env                    # Private backend credentials and keys
```

---

## 🎯 Project Objective

The goal of this application is to solve the complex coordination problems inherent in food customization and logistics. It addresses three primary requirements:

1.  **Immersive Visual Assembly:** Allow users to build custom pizzas, choosing crust thickness, sauce types, cheese blends, and multiple vegetable/meat toppings, with instantaneous, photorealistic layered rendering and automatic price calculation.
2.  **Financial Transaction Integrity:** Process payments safely via Razorpay, ensuring payments are validated server-side using secure cryptographic hashes before recording orders or altering inventory levels.
3.  **Autonomous Supply Chain Management:** Deduct inventory on successful payments and alert store managers via automated emails if any ingredient level falls below safety margins, ensuring zero out-of-stock events during peak operating hours.

---

## 💎 Core Features Breakdown & Technical Explanation

### 1. Robust User Authentication & Session Security
*   **Encrypted Registrations:** User passwords are hashed with `bcryptjs` using a salt work factor of `10` before storage in MongoDB.
*   **Email Verification Loop:** Upon registering, the backend sends a unique token link to the user's email via `Nodemailer`. The account remains locked until the token is verified.
*   **Session Management:** State is tracked via `JSON Web Tokens (JWT)` stored in HTTP-Only cookies to protect against Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF) vulnerabilities.
*   **Role-Based Route Guards:** Custom React route wrappers (`ProtectedRoute.jsx` and `AdminRoute.jsx`) parse token payloads to selectively grant access to the customer dashboard or administrative options.

### 2. Interactive Visual Pizza Builder
*   **Canvas Layering:** The preview window renders custom combinations by stacking absolute-positioned transparent PNG overlays. Selecting a specific crust, sauce, cheese, or topping triggers CSS animations to fade in the corresponding ingredient layer, simulating real-life preparation.
*   **Real-time Stepper Logic:** The builder guides the user through five custom selection categories. Price adjustments are dynamically tallied, incorporating base crust costs and incremental topping fees.
*   **State Transmission:** Once finished, toppings and selections are bundled into a single configuration state and forwarded to the checkout panel.

### 3. Razorpay Gateway Checkout & Signature Verification
*   **Order Creation:** When checking out, the client initiates a request to the backend `/payment/create-order` endpoint, which communicates with the Razorpay API to generate a verified Razorpay Order ID.
*   **Cryptographic Verification:** Upon successful payment authorized by the client-side Razorpay modal, the checkout page sends payment identifiers to the server `/payment/verify` endpoint. The server calculates an HMAC-SHA256 hash using the transaction variables and the private `RAZORPAY_KEY_SECRET`:
    $$\text{Expected Signature} = \text{HMAC-SHA256}(\text{order\_id} + \text{"|"} + \text{payment\_id}, \text{RAZORPAY\_KEY\_SECRET})$$
*   **Verification Action:** If the signatures match, the transaction is marked as `'Paid'`, the order status becomes `'Order Received'`, and the database is updated.

### 4. Dynamic Inventory System & Automated Restock Alerts
*   **Atomic Decrement:** When the order is confirmed, the server loops through the chosen base, sauce, cheese, and toppings, running atomic database updates (`$inc: { quantity: -1 }`) on matching inventory records.
*   **Threshold Scanning:** After decrementing quantities, the server triggers `checkStockAndAlert()`. This scans all ingredient levels against the safety threshold (default: `20` units).
*   **Nodemailer Dispatch:** If any items drop below this limit, the system formats and sends an automated HTML alert email to the store manager detailing the low-stock items.

### 5. Dual Dashboard Control Rooms
*   **Customer Console (`/my-orders`):** Offers real-time tracking of order preparation steps using an active progress timeline:
    $$\text{Order Received} \rightarrow \text{In the Kitchen} \rightarrow \text{Sent to Delivery} \rightarrow \text{Delivered}$$
    The frontend polls the backend server every 10 seconds to update status details dynamically.
*   **Admin Console (`/admin`):** Provides store managers with high-level revenue charts, live sales summaries, inventory controls, and status update dropdowns that immediately sync with the customer's timeline view.

---

## 🛠️ Detailed Database Models & Schema Design

### User Model (`server/models/User.js`)
*   `name`: String (Required)
*   `email`: String (Required, Unique, Lowercase)
*   `password`: String (Required, Hashed)
*   `role`: String (Enum: `['user', 'admin']`, Default: `'user'`)
*   `isVerified`: Boolean (Default: `false`)
*   `verificationToken`: String (Nullable)

### Order Model (`server/models/Order.js`)
*   `user`: ObjectId (Ref: `'User'`, Required)
*   `pizza`: Object containing base, sauce, cheese, and toppings arrays.
*   `totalPrice`: Number (Required)
*   `razorpayOrderId`: String (Required)
*   `razorpayPaymentId`: String (Required)
*   `paymentStatus`: String (Enum: `['Pending', 'Paid', 'Failed']`, Default: `'Pending'`)
*   `status`: String (Enum: `['Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered']`, Default: `'Order Received'`)

### Inventory Model (`server/models/Inventory.js`)
*   `name`: String (Required, Unique)
*   `category`: String (Enum: `['base', 'sauce', 'cheese', 'veggie', 'meat']`)
*   `quantity`: Number (Required, Default: `100`)
*   `price`: Number (Required)
*   `image`: String (Emoji or URL)

---

## 🚀 Installation & Local Environment Setup

### Prerequisites
*   Node.js v18 or higher
*   MongoDB running locally or a MongoDB Atlas URI link

### 1. Server Environment Setup
1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `server` directory and paste the following configurations:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/PizzaGoDB
    SESSION_SECRET=super-secret-session-key
    RAZORPAY_KEY_ID=rzp_test_SyhqD9o0SKTbMD
    RAZORPAY_KEY_SECRET=BggCChUX1mQsZtIhdKtrZrWL
    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=465
    EMAIL_SECURE=true
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASS=your-app-password
    ADMIN_EMAIL=admin@pizza.com
    STOCK_THRESHOLD=20
    ```
    *(Note: Replace `EMAIL_USER` and `EMAIL_PASS` with your active Gmail credentials and app password to test restock notifications).*
4.  Seed the ingredient database:
    ```bash
    npm run seed
    ```
5.  Start the Express server:
    ```bash
    npm run dev
    ```

### 2. Client Environment Setup
1.  Navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `client` directory:
    ```env
    VITE_API_URL=http://localhost:5000/api
    VITE_RAZORPAY_KEY_ID=rzp_test_SyhqD9o0SKTbMD
    ```
4.  Launch the Vite React development server:
    ```bash
    npm run dev
    ```
5.  Access the web application at **[http://localhost:5173](http://localhost:5173)**.

### 🔑 Test Credentials
*   **Administrator Account:**
    *   **Email:** `admin@pizza.com`
    *   **Password:** `Admin@123`
*   **Customer Account:**
    *   Create any user account via the registration panel, complete the email confirmation step (or toggle the verification state directly in MongoDB), and start custom building your pizzas!
