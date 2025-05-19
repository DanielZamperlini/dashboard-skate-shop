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
          description: string
          price: number
          cost_price: number
          quantity: number
          category: string
          min_stock: number | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          cost_price: number
          quantity?: number
          category: string
          min_stock?: number | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          cost_price?: number
          quantity?: number
          category?: string
          min_stock?: number | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          customer_name: string
          total: number
          paid: boolean
          payment_method: string | null
          notes: string | null
          created_at: string
          payment_date: string | null
        }
        Insert: {
          id?: string
          customer_name: string
          total: number
          paid?: boolean
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          payment_date?: string | null
        }
        Update: {
          id?: string
          customer_name?: string
          total?: number
          paid?: boolean
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          payment_date?: string | null
        }
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
          subtotal: number
        }
        Insert: {
          id?: string
          sale_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
          subtotal: number
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          unit_price?: number
          subtotal?: number
        }
      }
      expenses: {
        Row: {
          id: string
          description: string
          amount: number
          category: string
          date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          description: string
          amount: number
          category: string
          date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          description?: string
          amount?: number
          category?: string
          date?: string
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}