export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            products: {
                Row: {
                    id: string
                    name: string
                    subtitle: string
                    price: number
                    category: string
                    description: string
                    details: string[] | null
                    materials: string
                    care: string
                    image: string
                    images: string[] | null
                    color_name: string
                    color_hex: string
                    color_slug: string
                    bestseller: boolean
                    is_new: boolean
                    video_url: string | null
                    model_3d_url: string | null
                    model_3d_images: string[] | null
                    created_at: string
                }
                Insert: {
                    id: string
                    name: string
                    subtitle: string
                    price: number
                    category: string
                    description: string
                    details?: string[] | null
                    materials: string
                    care: string
                    image: string
                    images?: string[] | null
                    color_name: string
                    color_hex: string
                    color_slug: string
                    bestseller?: boolean
                    is_new?: boolean
                    video_url?: string | null
                    model_3d_url?: string | null
                    model_3d_images?: string[] | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    subtitle?: string
                    price?: number
                    category?: string
                    description?: string
                    details?: string[] | null
                    materials?: string
                    care?: string
                    image?: string
                    images?: string[] | null
                    color_name?: string
                    color_hex?: string
                    color_slug?: string
                    bestseller?: boolean
                    is_new?: boolean
                    video_url?: string | null
                    model_3d_url?: string | null
                    model_3d_images?: string[] | null
                    created_at?: string
                }
            }
            orders: {
                Row: {
                    id: string
                    customer_email: string
                    amount_total: number
                    currency: string
                    status: string
                    items: Json
                    shipping_address: Json | null
                    created_at: string
                }
                Insert: {
                    id: string
                    customer_email: string
                    amount_total: number
                    currency: string
                    status?: string
                    items: Json
                    shipping_address?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    customer_email?: string
                    amount_total?: number
                    currency?: string
                    status?: string
                    items?: Json
                    shipping_address?: Json | null
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
