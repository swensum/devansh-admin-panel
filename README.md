# Devansh Admin Panel (React + Firebase)

Separate admin app for managing the Devansh catalog: products, categories,
companies, types & materials, orders, and a live analytics dashboard.

## 1. Firebase project setup
1. Create/open your project at console.firebase.google.com.
2. **Authentication** → Sign-in method → enable Email/Password.
3. **Authentication** → Users → Add user (this is your first admin login —
   there's no public sign-up screen, on purpose).
4. **Firestore Database** → Create database → production mode.
5. **Storage** → Get started (for product images).
6. **Project settings** → General → "Your apps" → Add app → Web. Copy the
   config values into a `.env.local` file (copy `.env.example` and fill it in).

## 2. Firestore security rules
Paste into Firestore → Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{collection}/{docId} {
      allow read: if true;                 // your storefront reads publicly
      allow write: if request.auth != null; // only signed-in admins write
    }
  }
}
```

## 3. Storage security rules
Paste into Storage → Rules:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /product_images/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 4. Install & run
```bash
npm install
npm run dev
```
Opens at http://localhost:5173. Sign in with the user you created in step 1.3.

## 5. Firestore schema
```
categories/{id}    { name, sortOrder }
companies/{id}      { name }
productTypes/{id}   { name, categoryId }
materials/{id}       { name, categoryId }

products/{id}
  name, price, categoryId, companyId, typeId, materialId,
  imageUrl, thickness, size, quantity, finish, availability,
  description, createdAt

orders/{id}
  customerName, customerPhone, items: [{productId,name,price,qty}],
  total, status ('pending'|'confirmed'|'shipped'|'delivered'|'cancelled'),
  createdAt
```
Orders are created by your **customer-facing app** at checkout (not from this
admin panel) — this panel only views and updates their status.

## What's included
- Email/password auth, login-gated routes (`src/context/AuthContext.jsx`)
- Sidebar layout (`src/components/Layout.jsx`, `Sidebar.jsx`)
- Analytics dashboard: revenue, order/product counts, charts (`pages/DashboardPage.jsx`)
- Products: list + search + add + edit + delete, with image upload (`pages/Products*.jsx`)
- Categories / Companies / Types & Materials: shared CRUD component (`components/LookupManager.jsx`)
- Orders: list + status update (`pages/OrdersPage.jsx`)

## Still to do on your side
- **Migrate the customer app** off the static `catalog.dart` to read live from
  this same Firestore data — otherwise admin changes won't reach shoppers.
  Happy to help with that next.
- Wire up order creation from the customer app's checkout flow into the
  `orders` collection using the schema above.
- Once you have more than one admin, consider Firestore custom claims to
  distinguish admin roles instead of "any signed-in user can write."
