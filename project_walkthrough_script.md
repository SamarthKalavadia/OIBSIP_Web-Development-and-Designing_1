# PizzaGo Walkthrough Script (3.5 to 4 Minutes)

This script is designed for a step-by-step demonstration video of the **PizzaGo** Full-Stack MERN application running on `http://localhost:5173`. 

---

## ⏱️ Video Timeline & Script

### 🎬 Part 1: Introduction (0:00 – 0:30)
* **[Visual]**: Open the web browser at `http://localhost:5173/`. Scroll down the landing page to show the clean typography, hero section, feature cards, and CTA buttons.
* **[Narration]**:
  > *"Welcome to PizzaGo, a next-generation MERN-stack custom pizza ordering and delivery application. Engineered with MongoDB, Express, React, and Node.js, PizzaGo provides an immersive visual customization experience for customers, paired with a powerful administrative panel for inventory control and order tracking.*
  >
  > *In this walkthrough, we will cover the entire project flow: starting with user registration and secure email verification, moving to the custom pizza builder studio, proceeding through a secure Razorpay checkout, and concluding with real-time order tracking and admin management dashboards."*

---

### 🔑 Part 2: Authentication & Route Protection (0:30 – 1:15)
* **[Visual]**: Click on **"Register"** in the Navbar. Fill out the registration form with a new user name, email, and password. Click register, show the toast notification, and then navigate to the **"Login"** page to sign in.
* **[Narration]**:
  > *"Security is baked into the foundation of PizzaGo. User accounts are created securely by hashing passwords using `BcryptJS` with a salt factor of 10. To prevent invalid signups, we have integrated a `Nodemailer` loop: on registration, users receive a unique token link to verify their email before accessing the store.*
  >
  > *Session state is managed via `JSON Web Tokens (JWT)` stored in HTTP-Only cookies to protect against XSS and CSRF attacks. Role-based React route guards (`ProtectedRoute.jsx` and `AdminRoute.jsx`) parse token payloads, guaranteeing that only authenticated customers can place orders and only authorized administrators can access the control panels."*

---

### 🎨 Part 3: Pizza Craft Studio (1:15 – 2:15)
* **[Visual]**: Click on **"Build Pizza"** or **"Go to Pizza Studio"**. Step through the visual builder:
  1. *Choose Base*: Select **Sourdough** or **Thin Crust**.
  2. *Select Sauce*: Select **Marinara** or **Pesto**.
  3. *Add Cheese*: Select **Mozzarella** or **Cheddar**.
  4. *Toppings*: Add multiple veggies (Onions, Mushrooms) and meats (Pepperoni, Chicken). Show the topping category filter tabs (Veg/Meat/All).
  *Point to the left side where layers fade in on the canvas as selections are made, and highlight the running subtotal dynamically updating.*
* **[Narration]**:
  > *"Next, we enter the Craft Studio—our interactive visual pizza customizer. The builder uses React state to stack absolute-positioned transparent PNG layers from Cloudinary, updating the rendering in real-time as we customize the pizza.*
  >
  > *Customers are guided step-by-step through selecting a crust, sauce, cheese blend, and a variety of toppings. Prices adjust dynamically with every click, incorporating base ingredient costs and premium topping fees. Once our masterpiece is ready, we see the full breakdown and tax calculations, before proceeding to checkout."*

---

### 💳 Part 4: Secure Checkout & Razorpay Integration (2:15 – 3:00)
* **[Visual]**: Click **"Proceed to Checkout"**. Review the billing details and the order receipt. Click **"Pay with Razorpay"**. The test integration modal will appear. Select net banking/wallet/card, click "Success" to simulate a paid transaction, and watch the page transition to the **Order Confirmed** screen.
* **[Narration]**:
  > *"When we proceed to the Checkout screen, we integrate directly with the Razorpay API. The frontend requests a secure Razorpay Order ID from our backend. Upon completing payment in the secure modal, transaction parameters are sent back to our server.*
  >
  > *Our backend cryptographically verifies the payment signature using HMAC-SHA256 with our private key. If verification is successful, the order is registered in MongoDB, and the server runs atomic operations to decrement ingredient counts from our database. If any stock level drops below our safety threshold of 20 units, the server immediately dispatches an automated alert email to the store manager."*

---

### 📊 Part 5: Order Tracking & Admin Dashboards (3:00 – 3:45)
* **[Visual]**: Click **"Track My Order"** on the success screen to show the active progress timeline. In a separate tab or by logging out and signing in as `admin@pizza.com` (password `Admin@123`), navigate to `/admin` to show the charts, order table, and inventory stock status list. Change the status of the customer's order to **"In the Kitchen"** or **"Sent to Delivery"**, then show how it instantly updates.
* **[Narration]**:
  > *"Once confirmed, customers can monitor their pizza's journey in real-time using our interactive progress timeline—tracking the status from 'Order Received' through 'Delivered'.*
  >
  > *On the management side, store owners log into the Admin Control Room. Here, they have access to live revenue and sales charts, a central order dashboard, and inventory management controls. Admins can update order statuses, manage ingredient pricing, adjust stock levels, and review automated restock notifications, establishing a complete operational loop."*

---

### 🏁 Part 6: Conclusion (3:45 – 4:00)
* **[Visual]**: Log out of the admin panel and return to the main landing page.
* **[Narration]**:
  > *"By bridging a beautiful, highly interactive frontend with a secure, automated backend, PizzaGo demonstrates how modern food-tech systems coordinate payments, logistics, and supply chain updates seamlessly in real-time. This concludes our walkthrough. Thank you!"*
