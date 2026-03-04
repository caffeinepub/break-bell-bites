import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Smartphone,
  User,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useSubmitOrder } from "./hooks/useQueries";

/* ── Types ──────────────────────────────────────────────────────── */
type View = "menu" | "order" | "thankyou";

interface Addon {
  id: string;
  label: string;
  price: number;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  addons?: Addon[];
  comboContents?: string;
}

interface CartItem extends MenuItem {
  quantity: number;
  selectedAddons: string[];
}

/* ── Menu Data ───────────────────────────────────────────────────── */
const MENU: MenuItem[] = [
  // Break Bell Bites
  { id: 1, name: "Soya 65", price: 80, category: "Break Bell Bites" },
  { id: 2, name: "Soya Kebab", price: 110, category: "Break Bell Bites" },
  {
    id: 3,
    name: "Mushroom Lollipop",
    price: 130,
    category: "Break Bell Bites",
  },
  {
    id: 4,
    name: "Mushroom Dynamite",
    price: 150,
    category: "Break Bell Bites",
  },
  { id: 5, name: "Masala Murukku", price: 70, category: "Break Bell Bites" },
  // Boli
  { id: 6, name: "Kaaram Boli", price: 45, category: "Boli" },
  { id: 7, name: "Sweet Boli", price: 40, category: "Boli" },
  // Snacks
  { id: 8, name: "Grilled Pineapple", price: 69, category: "Snacks" },
  { id: 9, name: "Cucumber Spiral", price: 70, category: "Snacks" },
  {
    id: 10,
    name: "Crispy Swirl Sticks",
    price: 140,
    category: "Snacks",
    addons: [{ id: "extra-masala", label: "Extra Masala +₹10", price: 10 }],
  },
  {
    id: 11,
    name: "Crispy Neer Roll",
    price: 100,
    category: "Snacks",
    addons: [{ id: "peri-peri", label: "Peri Peri +₹10", price: 10 }],
  },
  { id: 12, name: "Melty Bites", price: 80, category: "Snacks" },
  // Protein Specials
  {
    id: 13,
    name: "Avatar Protein Bites",
    price: 100,
    category: "Protein Specials",
  },
  {
    id: 14,
    name: "Galaxy Protein Pops",
    price: 100,
    category: "Protein Specials",
  },
  // More Bites
  { id: 15, name: "Kheer", price: 139, category: "More Bites" },
  { id: 16, name: "Sago (Mango)", price: 150, category: "More Bites" },
  { id: 17, name: "Sago (Strawberry)", price: 170, category: "More Bites" },
  { id: 18, name: "Watermelon Rosemilk", price: 85, category: "More Bites" },
  // Combo Box
  {
    id: 19,
    name: "Combo 1",
    price: 200,
    category: "Combo Box",
    comboContents: "Crispy Naan Roll • Melty Bites • Watermelon Rosemilk",
  },
  {
    id: 20,
    name: "Combo 2",
    price: 250,
    category: "Combo Box",
    comboContents: "Soya 65 • Mushroom Lollipop • Watermelon Rosemilk",
  },
  {
    id: 21,
    name: "Combo 3",
    price: 180,
    category: "Combo Box",
    comboContents: "Masala Murukku • Grilled Pineapple • Avatar Protein Bites",
  },
];

const CATEGORIES = [
  "Break Bell Bites",
  "Boli",
  "Snacks",
  "Protein Specials",
  "More Bites",
  "Combo Box",
];

const CATEGORY_EMOJI: Record<string, string> = {
  "Break Bell Bites": "🔥",
  Boli: "🫓",
  Snacks: "🍢",
  "Protein Specials": "💪",
  "More Bites": "🍮",
  "Combo Box": "📦",
};

/* ── Helpers ─────────────────────────────────────────────────────── */
function getAddonPrice(item: MenuItem, selectedAddons: string[]): number {
  if (!item.addons) return 0;
  return item.addons
    .filter((a) => selectedAddons.includes(a.id))
    .reduce((sum, a) => sum + Math.round(Number(a.price)), 0);
}

function getItemSubtotal(cartItem: CartItem): number {
  const basePrice = Math.round(Number(cartItem.price));
  const addonPrice = getAddonPrice(cartItem, cartItem.selectedAddons);
  const qty = Math.round(Number(cartItem.quantity));
  return (basePrice + addonPrice) * qty;
}

/* ══════════════════════════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════════════════════════ */
export default function App() {
  const [view, setView] = useState<View>("menu");
  const [cart, setCart] = useState<Record<number, CartItem>>({});
  const [customerName, setCustomerName] = useState("");
  const [deliveryPlace, setDeliveryPlace] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderId, setOrderId] = useState<bigint | null>(null);
  const [submitError, setSubmitError] = useState("");
  const submitOrderMutation = useSubmitOrder();

  const cartItems = Object.values(cart);
  const totalItems = cartItems.reduce(
    (sum, i) => sum + Math.round(Number(i.quantity)),
    0,
  );
  const totalAmount = Math.round(
    Number(cartItems.reduce((sum, i) => sum + getItemSubtotal(i), 0)),
  );

  /* ── Cart helpers ─────────────────────────────────────────────── */
  const addItem = useCallback((item: MenuItem) => {
    setCart((prev) => {
      if (prev[item.id]) return prev;
      return {
        ...prev,
        [item.id]: { ...item, quantity: 1, selectedAddons: [] },
      };
    });
  }, []);

  const changeQty = useCallback((itemId: number, delta: number) => {
    setCart((prev) => {
      const item = prev[itemId];
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: { ...item, quantity: newQty } };
    });
  }, []);

  const toggleAddon = useCallback((itemId: number, addonId: string) => {
    setCart((prev) => {
      const item = prev[itemId];
      if (!item) return prev;
      const has = item.selectedAddons.includes(addonId);
      return {
        ...prev,
        [itemId]: {
          ...item,
          selectedAddons: has
            ? item.selectedAddons.filter((a) => a !== addonId)
            : [...item.selectedAddons, addonId],
        },
      };
    });
  }, []);

  /* ── Validation ───────────────────────────────────────────────── */
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!customerName.trim()) newErrors.name = "Please enter your name";
    if (!deliveryPlace.trim()) newErrors.place = "Please enter delivery place";
    if (!mobileNumber.trim()) newErrors.mobile = "Please enter mobile number";
    else if (!/^\d{10}$/.test(mobileNumber.trim()))
      newErrors.mobile = "Enter valid 10-digit mobile number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ── Build WhatsApp message ───────────────────────────────────── */
  const buildWhatsAppMessage = () => {
    const itemLines = cartItems
      .map((item) => {
        const addonLabels = item.selectedAddons
          .map((aId) => item.addons?.find((a) => a.id === aId)?.label)
          .filter(Boolean)
          .join(", ");
        const nameWithAddons = addonLabels
          ? `${item.name} (${addonLabels.replace(/ \+₹\d+/g, "")})`
          : item.name;
        return `• ${nameWithAddons} x${item.quantity} = ₹${getItemSubtotal(item)}`;
      })
      .join("\n");

    return [
      "🛒 New Order – BREAK BELL BITES",
      "",
      `Customer: ${customerName.trim()}`,
      `Mobile: ${mobileNumber.trim()}`,
      `Delivery Place: ${deliveryPlace.trim()}`,
      "",
      "Items Ordered:",
      itemLines,
      "",
      `Total: ₹${totalAmount}`,
      "",
      "Payment Done ✅",
    ].join("\n");
  };

  /* ── Order submission + WhatsApp ──────────────────────────────── */
  const handleConfirmOrder = async () => {
    if (!validate()) return;
    setSubmitError("");

    const orderItems = cartItems.map((item) => ({
      itemName: item.name,
      quantity: BigInt(item.quantity),
    }));

    submitOrderMutation.mutate(
      {
        customerName: customerName.trim(),
        deliveryPlace: deliveryPlace.trim(),
        mobileNumber: mobileNumber.trim(),
        items: orderItems,
        totalAmount: BigInt(Math.round(Number(totalAmount))),
      },
      {
        onSuccess: (id) => {
          setOrderId(id);
          const message = buildWhatsAppMessage();
          window.open(
            `https://wa.me/919994560691?text=${encodeURIComponent(message)}`,
            "_blank",
          );
          setView("thankyou");
        },
        onError: (err) => {
          console.error(err);
          setSubmitError("Something went wrong. Please try again.");
        },
      },
    );
  };

  /* ── Reset ────────────────────────────────────────────────────── */
  const handleOrderAgain = () => {
    setCart({});
    setCustomerName("");
    setDeliveryPlace("");
    setMobileNumber("");
    setErrors({});
    setOrderId(null);
    setSubmitError("");
    submitOrderMutation.reset();
    setView("menu");
  };

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[430px] min-h-screen flex flex-col relative">
        {view === "menu" && (
          <MenuView
            cart={cart}
            totalItems={totalItems}
            totalAmount={totalAmount}
            onAdd={addItem}
            onChangeQty={changeQty}
            onToggleAddon={toggleAddon}
            onProceed={() => setView("order")}
          />
        )}
        {view === "order" && (
          <OrderView
            cartItems={cartItems}
            totalAmount={totalAmount}
            customerName={customerName}
            deliveryPlace={deliveryPlace}
            mobileNumber={mobileNumber}
            errors={errors}
            isSubmitting={submitOrderMutation.isPending}
            submitError={submitError}
            onNameChange={setCustomerName}
            onPlaceChange={setDeliveryPlace}
            onMobileChange={setMobileNumber}
            onConfirm={handleConfirmOrder}
            onBack={() => setView("menu")}
          />
        )}
        {view === "thankyou" && (
          <ThankYouView
            customerName={customerName}
            orderId={orderId}
            onOrderAgain={handleOrderAgain}
          />
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   VIEW 1 — Menu
══════════════════════════════════════════════════════════════════ */
interface MenuViewProps {
  cart: Record<number, CartItem>;
  totalItems: number;
  totalAmount: number;
  onAdd: (item: MenuItem) => void;
  onChangeQty: (id: number, delta: number) => void;
  onToggleAddon: (itemId: number, addonId: string) => void;
  onProceed: () => void;
}

function MenuView({
  cart,
  totalItems,
  totalAmount,
  onAdd,
  onChangeQty,
  onToggleAddon,
  onProceed,
}: MenuViewProps) {
  return (
    <main className="flex-1 pb-32">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔔</span>
          <span className="font-display font-black text-foreground text-base tracking-tight">
            BREAK BELL BITES
          </span>
        </div>
        {totalItems > 0 && (
          <button
            type="button"
            data-ocid="menu.cart_badge"
            onClick={onProceed}
            className="relative flex items-center gap-1.5 bg-primary/15 text-primary border border-primary/30 rounded-full px-3 py-1.5 text-sm font-ui font-semibold touch-manipulation"
            aria-label={`Cart: ${totalItems} items`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs font-bold">{totalItems}</span>
          </button>
        )}
      </header>

      {/* ── Hero Banner ── */}
      <section className="relative h-52 overflow-hidden">
        <img
          src="/assets/generated/bbb-hero-banner.dim_800x400.jpg"
          alt="Break Bell Bites food spread"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end px-5 pb-5">
          <h1 className="font-display font-black text-foreground text-3xl leading-none tracking-tighter mb-1.5">
            BREAK BELL BITES
          </h1>
          <p className="text-accent font-ui font-bold text-sm tracking-wide">
            Crunch. Munch. Repeat. 🔥
          </p>
        </div>
      </section>

      {/* ── Menu Section ── */}
      <section className="px-4 pt-5 space-y-7">
        {CATEGORIES.map((category) => {
          const items = MENU.filter((m) => m.category === category);
          if (items.length === 0) return null;
          return (
            <div key={category}>
              {/* Category Header */}
              <div className="category-badge px-3 py-2 rounded-r-xl mb-3 flex items-center gap-2">
                <span className="text-lg leading-none">
                  {CATEGORY_EMOJI[category]}
                </span>
                <h2 className="font-display font-black text-foreground text-base tracking-tight">
                  {category}
                </h2>
              </div>

              {/* Items */}
              <div className="space-y-2.5">
                {items.map((item) => {
                  const globalIdx = MENU.findIndex((m) => m.id === item.id) + 1;
                  const cartItem = cart[item.id];
                  const inCart = !!cartItem;
                  return (
                    <article
                      key={item.id}
                      data-ocid={`menu.item.${globalIdx}`}
                      className={`rounded-2xl overflow-hidden transition-all duration-200 ${
                        inCart
                          ? "bg-card ring-1 ring-primary/50 fire-glow"
                          : "bg-card/80 border border-border/50"
                      }`}
                    >
                      <div className="px-4 py-3 flex items-start gap-3">
                        {/* Item info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p
                                className={`font-ui font-bold text-sm leading-snug ${
                                  inCart
                                    ? "text-foreground"
                                    : "text-foreground/90"
                                }`}
                              >
                                {item.name}
                              </p>
                              {item.comboContents && (
                                <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
                                  {item.comboContents}
                                </p>
                              )}
                            </div>
                            <p className="font-display font-black text-primary text-base flex-shrink-0">
                              ₹{item.price}
                            </p>
                          </div>

                          {/* Addon checkboxes – shown only when in cart */}
                          {inCart && item.addons && item.addons.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {item.addons.map((addon) => (
                                <label
                                  key={addon.id}
                                  htmlFor={`addon-${item.id}-${addon.id}`}
                                  className="flex items-center gap-1.5 cursor-pointer bg-accent/10 border border-accent/30 rounded-lg px-2.5 py-1.5 touch-manipulation"
                                >
                                  <Checkbox
                                    id={`addon-${item.id}-${addon.id}`}
                                    checked={cartItem.selectedAddons.includes(
                                      addon.id,
                                    )}
                                    onCheckedChange={() =>
                                      onToggleAddon(item.id, addon.id)
                                    }
                                    className="w-3.5 h-3.5"
                                  />
                                  <span className="text-xs font-ui font-semibold text-accent-foreground">
                                    {addon.label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Qty controls */}
                        <div className="flex-shrink-0 flex items-center">
                          {!inCart ? (
                            <button
                              type="button"
                              data-ocid={`menu.item.add_button.${globalIdx}`}
                              onClick={() => onAdd(item)}
                              className="flex items-center gap-1 bg-primary text-primary-foreground rounded-xl px-3 py-2 text-xs font-ui font-bold hover:bg-primary/90 active:scale-95 transition-all touch-manipulation min-h-[36px]"
                              aria-label={`Add ${item.name}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              ADD
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 bg-primary/10 rounded-xl px-1 py-1">
                              <button
                                type="button"
                                onClick={() => onChangeQty(item.id, -1)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-background/60 hover:bg-destructive/20 text-foreground/70 hover:text-destructive active:scale-90 transition-all touch-manipulation"
                                aria-label={`Decrease ${item.name}`}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-ui font-black text-primary text-sm w-5 text-center">
                                {cartItem.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onChangeQty(item.id, 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 active:scale-90 transition-all touch-manipulation"
                                aria-label={`Increase ${item.name}`}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Subtotal row – shown when in cart */}
                      {inCart && (
                        <div className="px-4 py-2 bg-primary/5 border-t border-primary/10 flex justify-between items-center">
                          <span className="text-muted-foreground text-xs font-ui">
                            {cartItem.quantity === 1
                              ? "1 item"
                              : `${cartItem.quantity} items`}
                            {cartItem.selectedAddons.length > 0 && " + add-ons"}
                          </span>
                          <span className="text-primary font-ui font-bold text-sm">
                            ₹{getItemSubtotal(cartItem)}
                          </span>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* ── Footer ── */}
        <footer className="py-6 text-center">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </section>

      {/* ── Sticky Bottom Bar ── */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 pb-safe-bottom pb-4 pt-2 z-50 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none">
          <div className="pointer-events-auto sticky-bar-shadow rounded-2xl overflow-hidden">
            <button
              type="button"
              data-ocid="menu.proceed_button"
              onClick={onProceed}
              className="w-full flex items-center justify-between bg-primary text-primary-foreground px-5 py-4 font-ui font-bold text-base hover:bg-primary/90 active:bg-primary/80 transition-colors touch-manipulation"
              style={{ minHeight: "3.5rem" }}
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
              <span className="flex items-center gap-2">
                ₹{totalAmount}
                <span className="text-sm opacity-90">Proceed →</span>
              </span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════════
   VIEW 2 — Order Form + Payment
══════════════════════════════════════════════════════════════════ */
interface OrderViewProps {
  cartItems: CartItem[];
  totalAmount: number;
  customerName: string;
  deliveryPlace: string;
  mobileNumber: string;
  errors: Record<string, string>;
  isSubmitting: boolean;
  submitError: string;
  onNameChange: (v: string) => void;
  onPlaceChange: (v: string) => void;
  onMobileChange: (v: string) => void;
  onConfirm: () => void;
  onBack: () => void;
}

function OrderView({
  cartItems,
  totalAmount,
  customerName,
  deliveryPlace,
  mobileNumber,
  errors,
  isSubmitting,
  submitError,
  onNameChange,
  onPlaceChange,
  onMobileChange,
  onConfirm,
  onBack,
}: OrderViewProps) {
  return (
    <main className="flex-1 pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-card hover:bg-muted transition-colors touch-manipulation"
          aria-label="Back to menu"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="font-display font-black text-foreground text-lg leading-none tracking-tight">
            Your Order
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5 font-ui">
            BREAK BELL BITES
          </p>
        </div>
      </header>

      <div className="px-4 py-5 space-y-5">
        {/* ── Order Summary ── */}
        <section className="bg-card rounded-2xl fire-glow overflow-hidden border border-border/50">
          <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
            <span className="text-base">🛒</span>
            <h2 className="font-display font-black text-foreground text-base tracking-tight">
              Order Summary
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {cartItems.map((item) => {
              const addonLabels = item.selectedAddons
                .map((aId) => item.addons?.find((a) => a.id === aId)?.label)
                .filter(Boolean)
                .join(", ");
              return (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-ui font-semibold text-foreground text-sm leading-snug">
                      {item.name}
                    </p>
                    {addonLabels && (
                      <p className="text-accent text-xs font-ui mt-0.5">
                        + {addonLabels}
                      </p>
                    )}
                    <p className="text-muted-foreground text-xs">
                      ₹{item.price + getAddonPrice(item, item.selectedAddons)} ×{" "}
                      {item.quantity}
                    </p>
                  </div>
                  <p className="font-display font-black text-primary text-base flex-shrink-0">
                    ₹{getItemSubtotal(item)}
                  </p>
                </div>
              );
            })}
            <div className="border-t border-border/50 pt-3 mt-3 flex items-center justify-between">
              <span className="font-ui font-bold text-foreground text-sm">
                Total Amount
              </span>
              <span className="font-display font-black text-primary text-2xl">
                ₹{totalAmount}
              </span>
            </div>
          </div>
        </section>

        {/* ── Customer Details ── */}
        <section className="bg-card rounded-2xl fire-glow overflow-hidden border border-border/50">
          <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
            <span className="text-base">📋</span>
            <h2 className="font-display font-black text-foreground text-base tracking-tight">
              Your Details
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="customer-name"
                className="font-ui font-semibold text-foreground flex items-center gap-2 text-sm"
              >
                <User className="w-4 h-4 text-primary" />
                Customer Name *
              </Label>
              <Input
                id="customer-name"
                data-ocid="order.name_input"
                value={customerName}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Enter your name"
                className={`h-12 text-base rounded-xl font-body bg-muted/40 border-border/60 ${
                  errors.name
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
                autoComplete="name"
              />
              {errors.name && (
                <p
                  className="text-destructive text-xs font-ui font-medium"
                  role="alert"
                >
                  {errors.name}
                </p>
              )}
            </div>

            {/* Delivery Place */}
            <div className="space-y-1.5">
              <Label
                htmlFor="delivery-place"
                className="font-ui font-semibold text-foreground flex items-center gap-2 text-sm"
              >
                <MapPin className="w-4 h-4 text-primary" />
                Delivery Place *
              </Label>
              <Input
                id="delivery-place"
                data-ocid="order.place_input"
                value={deliveryPlace}
                onChange={(e) => onPlaceChange(e.target.value)}
                placeholder="Table no. / Spot location"
                className={`h-12 text-base rounded-xl font-body bg-muted/40 border-border/60 ${
                  errors.place
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
                autoComplete="off"
              />
              {errors.place && (
                <p
                  className="text-destructive text-xs font-ui font-medium"
                  role="alert"
                >
                  {errors.place}
                </p>
              )}
            </div>

            {/* Mobile */}
            <div className="space-y-1.5">
              <Label
                htmlFor="mobile-number"
                className="font-ui font-semibold text-foreground flex items-center gap-2 text-sm"
              >
                <Smartphone className="w-4 h-4 text-primary" />
                Mobile Number *
              </Label>
              <Input
                id="mobile-number"
                data-ocid="order.mobile_input"
                type="tel"
                inputMode="numeric"
                value={mobileNumber}
                onChange={(e) =>
                  onMobileChange(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="10-digit mobile number"
                className={`h-12 text-base rounded-xl font-body bg-muted/40 border-border/60 ${
                  errors.mobile
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
                autoComplete="tel"
              />
              {errors.mobile && (
                <p
                  className="text-destructive text-xs font-ui font-medium"
                  role="alert"
                >
                  {errors.mobile}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── Payment Info ── */}
        <section className="bg-card rounded-2xl fire-glow overflow-hidden border border-primary/20">
          <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
            <span className="text-base">💳</span>
            <h2 className="font-display font-black text-foreground text-base tracking-tight">
              Payment
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {/* Total amount highlight */}
            <div className="bg-primary/10 border border-primary/30 rounded-2xl px-4 py-4 text-center">
              <p className="text-muted-foreground text-xs font-ui uppercase tracking-wider mb-1">
                Total Amount to Pay
              </p>
              <p className="font-display font-black text-primary text-4xl">
                ₹{totalAmount}
              </p>
            </div>

            {/* UPI ID */}
            <div className="bg-muted/40 border border-border/60 rounded-xl px-4 py-3">
              <p className="text-muted-foreground text-xs font-ui mb-1">
                Pay to this UPI ID
              </p>
              <p className="font-ui font-bold text-foreground text-base tracking-tight select-all">
                sakthinaveen0707@oksbi
              </p>
              <p className="text-muted-foreground text-xs font-ui mt-0.5">
                Break Bell Bites
              </p>
            </div>

            {/* Instruction */}
            <div className="bg-muted/40 border border-border/60 rounded-xl px-4 py-3 text-center">
              <p className="text-foreground/80 text-sm font-ui leading-relaxed">
                Please pay using <strong>Google Pay / PhonePe</strong> by
                entering the amount shown above.
              </p>
            </div>
          </div>
        </section>

        {/* ── Submit Error ── */}
        {submitError && (
          <div
            data-ocid="order.error_state"
            className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3"
            role="alert"
          >
            <p className="text-destructive text-sm font-ui font-medium">
              {submitError}
            </p>
          </div>
        )}

        {/* ── I Have Paid – Confirm on WhatsApp ── */}
        <Button
          data-ocid="order.confirm_button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="w-full h-14 rounded-2xl bg-[#25D366] hover:bg-[#1EBF5A] active:bg-[#18A64D] text-white font-display font-black text-base fire-glow-lg transition-all touch-manipulation"
          style={{ minHeight: "3.5rem" }}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Sending Order...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl">✅</span>I Have Paid – Send Screenshot
              on WhatsApp
            </span>
          )}
        </Button>

        <p className="text-center text-muted-foreground text-xs pb-2 font-body">
          Tap after completing payment to send your screenshot on WhatsApp
        </p>
      </div>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════════
   VIEW 3 — Thank You
══════════════════════════════════════════════════════════════════ */
interface ThankYouViewProps {
  customerName: string;
  orderId: bigint | null;
  onOrderAgain: () => void;
}

function ThankYouView({
  customerName,
  orderId,
  onOrderAgain,
}: ThankYouViewProps) {
  return (
    <main
      data-ocid="thankyou.success_state"
      className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center"
    >
      {/* Celebration Icon */}
      <div className="relative mb-8">
        <div className="w-28 h-28 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center fire-glow-lg">
          <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
        </div>
        <span className="absolute -top-2 -right-2 text-2xl">🎉</span>
        <span className="absolute -bottom-2 -left-2 text-2xl">🔥</span>
      </div>

      <h1 className="font-display font-black text-foreground text-4xl mb-3 tracking-tight">
        Order Placed!
      </h1>

      <p className="font-body text-muted-foreground text-base leading-relaxed max-w-xs mb-2">
        Your order has been received!
      </p>
      <p className="font-ui font-bold text-foreground text-base mb-6">
        We are preparing it fresh 🔥
      </p>

      {customerName && (
        <p className="text-muted-foreground text-sm font-body mb-4">
          Hey{" "}
          <span className="font-semibold text-foreground">{customerName}</span>,
          your food is on its way!
        </p>
      )}

      {orderId !== null && (
        <div className="bg-card rounded-2xl fire-glow border border-border/50 px-6 py-4 mb-6 w-full max-w-xs">
          <p className="text-muted-foreground text-xs font-ui uppercase tracking-wider mb-1">
            Order ID
          </p>
          <p className="font-display font-black text-primary text-2xl">
            #{orderId.toString()}
          </p>
        </div>
      )}

      <div className="bg-accent/10 border border-accent/20 rounded-2xl px-5 py-4 mb-8 w-full max-w-xs">
        <p className="font-ui font-semibold text-foreground text-sm">
          🚀 Order sent to WhatsApp!
        </p>
        <p className="text-muted-foreground text-xs mt-1 font-body">
          We'll see it and start preparing right away.
        </p>
      </div>

      <Button
        data-ocid="thankyou.order_again_button"
        onClick={onOrderAgain}
        className="w-full max-w-xs h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-display font-black text-base fire-glow-lg transition-all touch-manipulation"
        style={{ minHeight: "3.5rem" }}
      >
        Order Again 🛒
      </Button>

      <p className="mt-8 text-muted-foreground text-xs font-body">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </p>
    </main>
  );
}
