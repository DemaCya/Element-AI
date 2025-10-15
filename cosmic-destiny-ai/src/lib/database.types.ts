export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          full_name?: string
          avatar_url?: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
          full_name?: string
          avatar_url?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          avatar_url?: string
        }
      }
      user_reports: {
        Row: {
          id: string
          user_id: string
          name?: string
          birth_date: string
          birth_time?: string
          timezone: string
          gender: string
          bazi_data: any
          full_report: any
          preview_report: any
          is_paid: boolean
          is_time_known_input: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string
          birth_date: string
          birth_time?: string
          timezone: string
          gender: string
          bazi_data?: any
          full_report?: any
          preview_report?: any
          is_paid?: boolean
          is_time_known_input?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          birth_date?: string
          birth_time?: string
          timezone?: string
          gender?: string
          bazi_data?: any
          full_report?: any
          preview_report?: any
          is_paid?: boolean
          is_time_known_input?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          report_id: string
          checkout_id: string
          order_id?: string
          customer_id?: string
          amount: number
          currency: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_provider: string
          transaction_id?: string
          metadata?: any
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          report_id: string
          checkout_id: string
          order_id?: string
          customer_id?: string
          amount: number
          currency: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_provider?: string
          transaction_id?: string
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          report_id?: string
          checkout_id?: string
          order_id?: string
          customer_id?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_provider?: string
          transaction_id?: string
          metadata?: any
          created_at?: string
          updated_at?: string
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