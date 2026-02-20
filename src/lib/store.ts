import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/* ========================================
   ORIN — Product Data & Cart Store
   ======================================== */

// --- Types ---
export interface LeatherColor {
    name: string;
    hex: string;
    slug: string;
}

export interface Product {
    id: string;
    name: string;
    subtitle: string;
    price: number;
    category: 'bags' | 'wallets' | 'accessories';
    description: string;
    details: string[];
    materials: string;
    care: string;
    image: string;
    images: string[];
    color: LeatherColor;
    bestseller?: boolean;
    isNew?: boolean;
}

export interface CartItem {
    product: Product;
    quantity: number;
    selectedColor: LeatherColor;
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    totalItems: () => number;
    totalPrice: () => number;
    wishlist: string[];
    toggleWishlist: (productId: string) => void;
}

// --- Products ---
export const products: Product[] = [
    {
        id: 'the-drifter',
        name: 'The Drifter',
        subtitle: 'Weekender Bag',
        price: 485,
        category: 'bags',
        description: 'Built for the journey, not the destination. The Drifter is our signature weekender — cut from a single hide of full-grain vegetable-tanned leather, lined in waxed canvas, and fitted with solid brass hardware. It arrives stiff and proud. In six months, it\'ll be unmistakably yours.',
        details: [
            'Full-grain vegetable-tanned leather',
            'Waxed canvas interior lining',
            'Solid brass YKK zippers & hardware',
            'Detachable leather shoulder strap',
            'Interior zip pocket + 2 slip pockets',
            'Dimensions: 22" × 11" × 10"',
        ],
        materials: 'Full-grain vegetable-tanned cowhide, waxed cotton canvas, solid brass hardware',
        care: 'Condition with leather balm every 3-6 months. Store stuffed to maintain shape. Avoid prolonged exposure to water.',
        image: '/images/products/drifter-hero.png',
        images: ['/images/products/drifter-hero.png', '/images/products/drifter-detail.png', '/images/products/drifter-interior.png'],
        color: { name: 'Cognac', hex: '#8B5E3C', slug: 'cognac' },
        bestseller: true,
    },
    {
        id: 'the-folio',
        name: 'The Folio',
        subtitle: 'Laptop Briefcase',
        price: 395,
        category: 'bags',
        description: 'Carry your work with intention. The Folio is a slim-profile briefcase with a padded 15" laptop compartment, structured gussets, and a reinforced leather handle built to bear weight without complaint. Professional without being corporate.',
        details: [
            'Full-grain vegetable-tanned leather',
            'Padded 15" laptop compartment',
            'Structured side gussets',
            'Reinforced top handle + shoulder strap',
            'Interior organizer: pen loops, card slots',
            'Dimensions: 16" × 12" × 3"',
        ],
        materials: 'Full-grain vegetable-tanned cowhide, cotton twill lining, solid brass hardware',
        care: 'Wipe with damp cloth as needed. Apply leather conditioner bi-annually. Keep away from direct heat sources.',
        image: '/images/products/folio-hero.png',
        images: ['/images/products/folio-hero.png', '/images/products/folio-detail.png'],
        color: { name: 'Obsidian', hex: '#2C2C2C', slug: 'obsidian' },
        isNew: true,
    },
    {
        id: 'the-nomad',
        name: 'The Nomad',
        subtitle: 'Crossbody Satchel',
        price: 295,
        category: 'bags',
        description: 'Your daily constant. The Nomad is a compact crossbody satchel with three organized compartments and an adjustable strap that sits just right. Small enough to stay out of the way, big enough to carry your essentials.',
        details: [
            'Full-grain vegetable-tanned leather',
            'Three-compartment interior',
            'Adjustable crossbody strap',
            'Magnetic front closure',
            'Rear slip pocket',
            'Dimensions: 10" × 8" × 3"',
        ],
        materials: 'Full-grain vegetable-tanned cowhide, microsuede lining, antique brass hardware',
        care: 'Condition regularly with leather cream. Store in dust bag when not in use.',
        image: '/images/products/nomad-hero.png',
        images: ['/images/products/nomad-hero.png', '/images/products/nomad-detail.png'],
        color: { name: 'Saddle', hex: '#A0764A', slug: 'saddle' },
        bestseller: true,
    },
    {
        id: 'the-ridge',
        name: 'The Ridge',
        subtitle: 'Bifold Wallet',
        price: 125,
        category: 'wallets',
        description: 'Thin enough to forget. Tough enough to last. The Ridge is a classic bifold cut from a single piece of full-grain leather, with eight card slots, a bill compartment, and integrated RFID blocking. No excess stitching, no unnecessary flaps.',
        details: [
            'Full-grain vegetable-tanned leather',
            '8 card slots + 2 hidden slots',
            'Full-length bill compartment',
            'RFID blocking layer',
            'Hand-stitched edges',
            'Dimensions: 4.5" × 3.5" (closed)',
        ],
        materials: 'Full-grain vegetable-tanned cowhide, RFID blocking fabric, waxed thread',
        care: 'The less you do, the better it ages. Occasional conditioning with leather balm.',
        image: '/images/products/ridge-hero.png',
        images: ['/images/products/ridge-hero.png'],
        color: { name: 'Natural', hex: '#C8A882', slug: 'natural' },
        bestseller: true,
    },
    {
        id: 'the-spine',
        name: 'The Spine',
        subtitle: 'Card Holder',
        price: 75,
        category: 'wallets',
        description: 'The wallet for people who hate wallets. The Spine holds four cards and a few folded bills in a profile slim enough to disappear in your front pocket. Pure simplicity.',
        details: [
            'Full-grain vegetable-tanned leather',
            '4 card slots (2 per side)',
            'Center pocket for folded bills',
            'Ultra-slim profile (5mm)',
            'Burnished edges',
            'Dimensions: 4" × 2.75"',
        ],
        materials: 'Full-grain vegetable-tanned cowhide, waxed thread',
        care: 'Carry daily — this leather only gets better with use.',
        image: '/images/products/ridge-hero.png',
        images: ['/images/products/ridge-hero.png'],
        color: { name: 'Oxblood', hex: '#5C1A1B', slug: 'oxblood' },
    },
    {
        id: 'the-loop',
        name: 'The Loop',
        subtitle: 'Belt',
        price: 145,
        category: 'accessories',
        description: 'One belt. Worn daily. Replaced never. The Loop is a 38mm full-grain belt with a solid brass roller buckle and five adjustment holes. The leather stiffens, softens, and curves to your body over time.',
        details: [
            'Full-grain vegetable-tanned leather',
            '38mm width',
            'Solid brass roller buckle',
            '5 adjustment holes (1" spacing)',
            'Burnished and waxed edges',
            'Available in sizes 30–42',
        ],
        materials: 'Full-grain vegetable-tanned cowhide (3.5mm thick), solid brass buckle',
        care: 'Rotate with another belt to extend life. Condition annually.',
        image: '/images/products/nomad-hero.png',
        images: ['/images/products/nomad-hero.png', '/images/products/nomad-detail.png'],
        color: { name: 'Cognac', hex: '#8B5E3C', slug: 'cognac' },
        isNew: true,
    },
    {
        id: 'the-keeper',
        name: 'The Keeper',
        subtitle: 'Valet Tray',
        price: 85,
        category: 'accessories',
        description: 'A place for everything that matters. The Keeper is a snap-corner valet tray that lays flat for travel and snaps together for your nightstand. Embossed with a subtle ORIN mark.',
        details: [
            'Full-grain vegetable-tanned leather',
            'Snap corners (unfolds flat)',
            'Embossed ORIN mark',
            'Suede-lined interior',
            'Dimensions: 8" × 6" (assembled)',
        ],
        materials: 'Full-grain vegetable-tanned cowhide, genuine suede lining, antique brass snaps',
        care: 'Wipe clean with soft cloth. Keep away from moisture.',
        image: '/images/products/folio-hero.png',
        images: ['/images/products/folio-hero.png', '/images/products/folio-detail.png'],
        color: { name: 'Natural', hex: '#C8A882', slug: 'natural' },
    },
    {
        id: 'the-thread',
        name: 'The Thread',
        subtitle: 'Keychain',
        price: 45,
        category: 'accessories',
        description: 'The smallest ORIN. The Thread is a vegetable-tanned leather strap with a solid brass clip that develops patina faster than anything else you own — because it never leaves your side.',
        details: [
            'Full-grain vegetable-tanned leather',
            'Solid brass trigger clip',
            'Leather strap with brass rivet',
            'Total length: 4.5"',
        ],
        materials: 'Full-grain vegetable-tanned cowhide, solid brass clip and rivet',
        care: 'No care needed. Just use it.',
        image: '/images/products/drifter-hero.png',
        images: ['/images/products/drifter-hero.png'],
        color: { name: 'Saddle', hex: '#A0764A', slug: 'saddle' },
    },
];

// --- Categories ---
export const categories = [
    { name: 'All', slug: 'all' },
    { name: 'Bags', slug: 'bags' },
    { name: 'Wallets', slug: 'wallets' },
    { name: 'Accessories', slug: 'accessories' },
];

// --- Cart Store ---
export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (product, quantity = 1) => {
                set((state) => {
                    const existing = state.items.find(
                        (item) => item.product.id === product.id
                    );
                    if (existing) {
                        return {
                            items: state.items.map((item) =>
                                item.product.id === product.id
                                    ? { ...item, quantity: item.quantity + quantity }
                                    : item
                            ),
                            isOpen: true,
                        };
                    }
                    return {
                        items: [...state.items, { product, quantity, selectedColor: product.color }],
                        isOpen: true,
                    };
                });
            },

            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter(
                        (item) => item.product.id !== productId
                    ),
                }));
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                set((state) => ({
                    items: state.items.map((item) =>
                        item.product.id === productId
                            ? { ...item, quantity }
                            : item
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),

            totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
            totalPrice: () =>
                get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),

            // --- Wishlist ---
            wishlist: [],
            toggleWishlist: (productId) => {
                set((state) => {
                    const inWishlist = state.wishlist.includes(productId);
                    return {
                        wishlist: inWishlist
                            ? state.wishlist.filter((id) => id !== productId)
                            : [...state.wishlist, productId],
                    };
                });
            },
        }),
        {
            name: 'orin-cart-storage',
            storage: createJSONStorage(() => localStorage),
            // Only persist cart items and wishlist — not UI state like isOpen
            partialize: (state) => ({ items: state.items, wishlist: state.wishlist }),
        }
    )
);

