# Break Bell Bites Food Ordering App

## Current State
A mobile food ordering app called "B³ Angadi" with 5 simple menu items (Soya Kebab, Soya 65, Soya Manchurian, Lasagna, Caramel Pudding), basic cart, customer form, UPI + WhatsApp payment flow, and thank you page. Uses real UPI ID `sakthinaveen0707@okaxis` and WhatsApp `919994560691`.

## Requested Changes (Diff)

### Add
- New stall branding: "BREAK BELL BITES" with tagline "Crunch. Munch. Repeat. 🔥"
- Full expanded menu with categories: Break Bell Bites (main items), Boli, Protein Specials, More Bites, Combo Box
- All new menu items with correct prices (18+ items)
- Optional add-ons per item: "Extra Masala +₹10" for Crispy Swirl Sticks; "Peri Peri +₹10" for Crispy Neer Roll
- UPI ID updated to `sakthinaveen0707@oksbi` (was okaxis)
- Correct WhatsApp message header: "🛒 New Order – BREAK BELL BITES"
- New hero banner with Break Bell Bites branding
- Category section headers in menu

### Modify
- All menu items replaced with the full Break Bell Bites menu
- Hero section title changed to "BREAK BELL BITES"
- Hero tagline changed to "Crunch. Munch. Repeat. 🔥"
- UPI link: `upi://pay?pa=sakthinaveen0707@oksbi&pn=Break Bell Bites&am=TOTAL&cu=INR`
- WhatsApp message template updated to new format
- Thank you message: "Your order has been received! We are preparing it fresh 🔥"
- Order page sub-header: "BREAK BELL BITES"
- UPI ID shown in payment section: `sakthinaveen0707@oksbi`

### Remove
- Old B³ Angadi branding
- Old 5-item menu (Soya Kebab ₹40, Soya 65 ₹50, Soya Manchurian ₹60, Lasagna ₹80, Caramel Pudding ₹50)
- Old hero images for previous menu items

## Implementation Plan

1. Update App.tsx:
   - Replace MENU_ITEMS with full categorized menu data structure
   - Add addon support to CartItem type (selected addons per item)
   - Update hero title/tagline
   - Update UPI link to use `sakthinaveen0707@oksbi`
   - Update WhatsApp number remains `919994560691`
   - Update WhatsApp message header to "🛒 New Order – BREAK BELL BITES"
   - Update thank you message text
   - Add category labels in menu view
   - Add addon toggle UI for Crispy Swirl Sticks and Crispy Neer Roll
   - Adjust total calculation to include addon prices
   - Include addons in order summary and WhatsApp message

2. Generate new hero banner image for Break Bell Bites

3. Keep existing backend integration, hooks, and component structure intact
