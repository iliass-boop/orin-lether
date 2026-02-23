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
    video?: string; // Optional video URL for premium product pages
    model3dUrl?: string; // URL for 3D model (.glb/.gltf)
    model3dImages?: string[]; // Array of images for 360 spinner
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
        image: '/images/products/drifter_hero_1771640197945.png',
        images: ['/images/products/drifter_hero_1771640197945.png', '/images/products/drifter_detail_1771640218427.png', '/images/products/drifter_lifestyle_1771640245076.png'],
        color: { name: 'Cognac', hex: '#8B5E3C', slug: 'cognac' },
        bestseller: true,
        model3dUrl: '/models/placeholder.glb', // Added for testing 3D viewer implementation
        model3dImages: [
            '/images/products/drifter/spin/drifter_spin_000_1771797867059.png',
            '/images/products/drifter/spin/drifter_spin_030_1771797908041.png',
            '/images/products/drifter/spin/drifter_spin_060_1771797963777.png',
            '/images/products/drifter/spin/drifter_spin_090_1771798012241.png',
            '/images/products/drifter/spin/drifter_spin_120_1771798048524.png',
            '/images/products/drifter/spin/drifter_spin_150_1771798076274.png',
            '/images/products/drifter/spin/drifter_spin_180_1771798244351.png',
            '/images/products/drifter/spin/drifter_spin_210_1771798291670.png',
            '/images/products/drifter/spin/drifter_spin_240_1771798433936.png',
            '/images/products/drifter/spin/drifter_spin_270_1771798563493.png',
            '/images/products/drifter/spin/drifter_spin_300_1771798593025.png',
            '/images/products/drifter/spin/drifter_spin_330_1771798628726.png',
        ],
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
        image: '/images/products/folio_hero_1771640263615.png',
        images: ['/images/products/folio_hero_1771640263615.png', '/images/products/folio_detail_1771640277386.png', '/images/products/folio_interior_1771640293119.png'],
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
        image: '/images/products/nomad_hero_1771640323046.png',
        images: ['/images/products/nomad_hero_1771640323046.png', '/images/products/nomad_detail_1771640340081.png', '/images/products/nomad_lifestyle_1771640354703.png'],
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
        image: '/images/products/ridge_hero_1771640386871.png',
        images: ['/images/products/ridge_hero_1771640386871.png', '/images/products/ridge_detail_1771640402127.png', '/images/products/ridge_flatlay_1771640418543.png'],
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
        image: '/images/products/spine_hero_1771680358865.png',
        images: [
            '/images/products/spine_hero_1771680358865.png',
            '/images/products/spine_detail_1771680380954.png',
            '/images/products/spine_topdown_1771680404945.png'
        ],
        color: { name: 'Oxblood', hex: '#5C1A1B', slug: 'oxblood' },
    },
    {
        id: 'the-sleeve',
        name: 'The Sleeve',
        subtitle: 'Laptop Sleeve',
        price: 185,
        category: 'accessories',
        description: 'A minimalist, structurally reinforced laptop sleeve crafted from dense Obsidian Black full-grain leather. Designed for the modern professional, it offers sleek protection with a heavy-duty matte black zipper and soft, luxurious interior lining.',
        details: [
            'Obsidian Black (#2C2C2C) full-grain leather',
            'Heavy-duty matte black YKK zipper',
            'Soft micro-suede interior lining',
            'Slim, minimalist profile',
            'Hand-burnished edges',
            'Available in 13-inch and 15-inch sizes',
        ],
        materials: 'Full-grain Obsidian Black leather, YKK zipper, micro-suede lining',
        care: 'Wipe clean with a soft dry cloth. Condition every 6 months.',
        image: '/images/products/sleeve_hero.png',
        images: [
            '/images/products/sleeve_hero.png',
            '/images/products/sleeve_detail.png',
            '/images/products/sleeve_lifestyle.png'
        ],
        color: { name: 'Obsidian Black', hex: '#2C2C2C', slug: 'obsidian-black' },
        isNew: true,
    },
    {
        id: 'the-dopp',
        name: 'The Dopp Kit',
        subtitle: 'Toiletry Bag',
        price: 165,
        category: 'accessories',
        description: 'Built to survive a lifetime of travel. The Dopp Kit features a wide-mouth opening for easy access, heavy-duty solid brass hardware, and a water-resistant canvas lining to protect the thick vegetable-tanned leather exterior.',
        details: [
            'Premium Cognac (#8B5E3C) full-grain leather',
            'Heavy-duty solid brass YKK zipper',
            'Water-resistant dark canvas interior lining',
            'Structured rectangular profile',
            'Wide-mouth opening',
            'Dimensions: 10" × 5" × 5"',
        ],
        materials: 'Full-grain vegetable-tanned cowhide, solid brass hardware, waterproof canvas lining',
        care: 'Wipe interior clean with damp cloth. Condition leather exterior annually.',
        image: '/images/products/dopp_hero.png',
        images: [
            '/images/products/dopp_hero.png',
            '/images/products/dopp_detail.png',
            '/images/products/dopp_lifestyle.png'
        ],
        color: { name: 'Cognac', hex: '#8B5E3C', slug: 'cognac' },
    },
    {
        id: 'the-roll',
        name: 'The Watch Roll',
        subtitle: 'Cylindrical Case',
        price: 195,
        category: 'accessories',
        description: 'A fortified sanctuary for your most prized timepieces. Crafted from rigid, heavy-duty Saddle Brown leather, this cylindrical watch roll features a sliding slide-out cushion system that holds up to three watches securely during transit.',
        details: [
            'Saddle Brown (#A0764A) full-grain leather',
            'Secure wrap-around leather strap',
            'Solid antique brass buckle clasp',
            'Removable micro-suede watch cushions',
            'Rigid cylindrical construction',
            'Holds up to 3 standard timepieces',
        ],
        materials: 'Rigid vegetable-tanned cowhide, micro-suede interior, antique brass hardware',
        care: 'Keep closed when not in use. Condition exterior leather sparingly.',
        image: '/images/products/watchroll_hero.png',
        images: [
            '/images/products/watchroll_hero.png',
            '/images/products/watchroll_detail.png',
            '/images/products/watchroll_lifestyle.png'
        ],
        color: { name: 'Saddle Brown', hex: '#A0764A', slug: 'saddle-brown' },
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

