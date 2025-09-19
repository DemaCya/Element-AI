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
          birth_date: string
          birth_time?: string
          birth_location: string
          gender: string
          bazi_data: any
          full_report: any
          preview_report: any
          is_paid: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          birth_date: string
          birth_time?: string
          birth_location: string
          gender: string
          bazi_data?: any
          full_report?: any
          preview_report?: any
          is_paid?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          birth_date?: string
          birth_time?: string
          birth_location?: string
          gender?: string
          bazi_data?: any
          full_report?: any
          preview_report?: any
          is_paid?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          report_id: string
          amount: number
          currency: string
          status: 'pending' | 'completed' | 'failed'
          payment_provider: string
          transaction_id?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          report_id: string
          amount: number
          currency: string
          status?: 'pending' | 'completed' | 'failed'
          payment_provider: string
          transaction_id?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          report_id?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed'
          payment_provider?: string
          transaction_id?: string
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