export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_image: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          tags: Json | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id: string
          image_url?: string | null
          tags?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          tags?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          business_number: string
          created_at: string | null
          email: string | null
          id: number
          is_active: boolean | null
          license_number: string | null
          name: string
          phone: string | null
          representative_name: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          business_number: string
          created_at?: string | null
          email?: string | null
          id?: number
          is_active?: boolean | null
          license_number?: string | null
          name: string
          phone?: string | null
          representative_name?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          business_number?: string
          created_at?: string | null
          email?: string | null
          id?: number
          is_active?: boolean | null
          license_number?: string | null
          name?: string
          phone?: string | null
          representative_name?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_responses: {
        Row: {
          created_at: string
          id: number
          notification_schedule_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          notification_schedule_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          notification_schedule_id?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_visits: {
        Row: {
          chief_complaint: string | null
          company_id: number
          created_at: string | null
          customer_id: number
          diagnosis: string | null
          doctor_name: string | null
          id: number
          next_visit_date: string | null
          notes: string | null
          pharmacist_name: string | null
          status: string | null
          symptoms: Json | null
          updated_at: string | null
          visit_date: string
          visit_time: string | null
          visit_type: string
          vital_signs: Json | null
        }
        Insert: {
          chief_complaint?: string | null
          company_id: number
          created_at?: string | null
          customer_id: number
          diagnosis?: string | null
          doctor_name?: string | null
          id?: number
          next_visit_date?: string | null
          notes?: string | null
          pharmacist_name?: string | null
          status?: string | null
          symptoms?: Json | null
          updated_at?: string | null
          visit_date: string
          visit_time?: string | null
          visit_type: string
          vital_signs?: Json | null
        }
        Update: {
          chief_complaint?: string | null
          company_id?: number
          created_at?: string | null
          customer_id?: number
          diagnosis?: string | null
          doctor_name?: string | null
          id?: number
          next_visit_date?: string | null
          notes?: string | null
          pharmacist_name?: string | null
          status?: string | null
          symptoms?: Json | null
          updated_at?: string | null
          visit_date?: string
          visit_time?: string | null
          visit_type?: string
          vital_signs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_visits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_visits_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          allergies: string | null
          birth_date: string | null
          chronic_diseases: string | null
          company_id: number
          created_at: string | null
          customer_code: string | null
          email: string | null
          emergency_contact: string | null
          gender: string | null
          id: number
          is_active: boolean | null
          name: string
          notes: string | null
          notification_enabled: boolean | null
          phone: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          birth_date?: string | null
          chronic_diseases?: string | null
          company_id: number
          created_at?: string | null
          customer_code?: string | null
          email?: string | null
          emergency_contact?: string | null
          gender?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          notes?: string | null
          notification_enabled?: boolean | null
          phone: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          allergies?: string | null
          birth_date?: string | null
          chronic_diseases?: string | null
          company_id?: number
          created_at?: string | null
          customer_code?: string | null
          email?: string | null
          emergency_contact?: string | null
          gender?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          notes?: string | null
          notification_enabled?: boolean | null
          phone?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
          path: string | null
          thumbnail: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
          path?: string | null
          thumbnail?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
          path?: string | null
          thumbnail?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          created_at: string
          description: string | null
          id: number
          link: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          link?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          link?: string | null
          title?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_schedules: {
        Row: {
          company_id: number
          created_at: string | null
          customer_id: number
          delete_yn: boolean | null
          deleted_at: string | null
          error_message: string | null
          expires_at: string | null
          id: number
          prescription_id: number | null
          question_template_id: number
          retry_count: number | null
          scheduled_date: string
          scheduled_time: string
          sent_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: number
          created_at?: string | null
          customer_id: number
          delete_yn?: boolean | null
          deleted_at?: string | null
          error_message?: string | null
          expires_at?: string | null
          id?: number
          prescription_id?: number | null
          question_template_id: number
          retry_count?: number | null
          scheduled_date: string
          scheduled_time: string
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: number
          created_at?: string | null
          customer_id?: number
          delete_yn?: boolean | null
          deleted_at?: string | null
          error_message?: string | null
          expires_at?: string | null
          id?: number
          prescription_id?: number | null
          question_template_id?: number
          retry_count?: number | null
          scheduled_date?: string
          scheduled_time?: string
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_schedules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_schedules_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_schedules_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_schedules_question_template_id_fkey"
            columns: ["question_template_id"]
            isOneToOne: false
            referencedRelation: "question_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_modifications: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          automated: boolean | null
          created_at: string | null
          customer_response_id: number | null
          effective_date: string
          id: number
          modification_type: string
          new_value: Json | null
          notes: string | null
          prescription_id: number
          previous_value: Json | null
          reason: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          automated?: boolean | null
          created_at?: string | null
          customer_response_id?: number | null
          effective_date: string
          id?: number
          modification_type: string
          new_value?: Json | null
          notes?: string | null
          prescription_id: number
          previous_value?: Json | null
          reason?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          automated?: boolean | null
          created_at?: string | null
          customer_response_id?: number | null
          effective_date?: string
          id?: number
          modification_type?: string
          new_value?: Json | null
          notes?: string | null
          prescription_id?: number
          previous_value?: Json | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescription_modifications_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          company_id: number
          created_at: string | null
          customer_id: number
          discontinue_reason: string | null
          dispenser_name: string | null
          dosage: string
          duration_days: number
          end_date: string
          frequency: string
          id: number
          indication: string | null
          medication_code: string | null
          medication_name: string
          precautions: string | null
          prescribed_date: string
          prescriber_name: string | null
          prescription_number: string
          side_effects: string | null
          start_date: string
          status: string | null
          total_quantity: number
          unit: string
          updated_at: string | null
          visit_id: number
        }
        Insert: {
          company_id: number
          created_at?: string | null
          customer_id: number
          discontinue_reason?: string | null
          dispenser_name?: string | null
          dosage: string
          duration_days: number
          end_date: string
          frequency: string
          id?: number
          indication?: string | null
          medication_code?: string | null
          medication_name: string
          precautions?: string | null
          prescribed_date: string
          prescriber_name?: string | null
          prescription_number: string
          side_effects?: string | null
          start_date: string
          status?: string | null
          total_quantity: number
          unit: string
          updated_at?: string | null
          visit_id: number
        }
        Update: {
          company_id?: number
          created_at?: string | null
          customer_id?: number
          discontinue_reason?: string | null
          dispenser_name?: string | null
          dosage?: string
          duration_days?: number
          end_date?: string
          frequency?: string
          id?: number
          indication?: string | null
          medication_code?: string | null
          medication_name?: string
          precautions?: string | null
          prescribed_date?: string
          prescriber_name?: string | null
          prescription_number?: string
          side_effects?: string | null
          start_date?: string
          status?: string | null
          total_quantity?: number
          unit?: string
          updated_at?: string | null
          visit_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "customer_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      question_templates: {
        Row: {
          company_id: number
          created_at: string | null
          custom_schedule_days: Json | null
          delete_yn: boolean | null
          deleted_at: string | null
          duration_days: number | null
          id: number
          indication: string | null
          is_active: boolean | null
          is_required: boolean | null
          medication_categories: Json | null
          medication_names: Json | null
          options: Json | null
          priority: number | null
          question_text: string
          question_type: string
          scale_max: number | null
          scale_min: number | null
          schedule_time: string | null
          schedule_type: string
          start_after_days: number | null
          template_name: string
          updated_at: string | null
        }
        Insert: {
          company_id: number
          created_at?: string | null
          custom_schedule_days?: Json | null
          delete_yn?: boolean | null
          deleted_at?: string | null
          duration_days?: number | null
          id?: number
          indication?: string | null
          is_active?: boolean | null
          is_required?: boolean | null
          medication_categories?: Json | null
          medication_names?: Json | null
          options?: Json | null
          priority?: number | null
          question_text: string
          question_type: string
          scale_max?: number | null
          scale_min?: number | null
          schedule_time?: string | null
          schedule_type: string
          start_after_days?: number | null
          template_name: string
          updated_at?: string | null
        }
        Update: {
          company_id?: number
          created_at?: string | null
          custom_schedule_days?: Json | null
          delete_yn?: boolean | null
          deleted_at?: string | null
          duration_days?: number | null
          id?: number
          indication?: string | null
          is_active?: boolean | null
          is_required?: boolean | null
          medication_categories?: Json | null
          medication_names?: Json | null
          options?: Json | null
          priority?: number | null
          question_text?: string
          question_type?: string
          scale_max?: number | null
          scale_min?: number | null
          schedule_time?: string | null
          schedule_type?: string
          start_after_days?: number | null
          template_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "question_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      response_processes: {
        Row: {
          action_params: Json
          action_type: string
          auto_execute: boolean | null
          condition_type: string
          condition_value: Json
          created_at: string | null
          id: number
          is_active: boolean | null
          message_template: string | null
          priority: string | null
          question_template_id: number
          requires_approval: boolean | null
          staff_alert_message: string | null
          updated_at: string | null
        }
        Insert: {
          action_params: Json
          action_type: string
          auto_execute?: boolean | null
          condition_type: string
          condition_value: Json
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          message_template?: string | null
          priority?: string | null
          question_template_id: number
          requires_approval?: boolean | null
          staff_alert_message?: string | null
          updated_at?: string | null
        }
        Update: {
          action_params?: Json
          action_type?: string
          auto_execute?: boolean | null
          condition_type?: string
          condition_value?: Json
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          message_template?: string | null
          priority?: string | null
          question_template_id?: number
          requires_approval?: boolean | null
          staff_alert_message?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "response_processes_question_template_id_fkey"
            columns: ["question_template_id"]
            isOneToOne: false
            referencedRelation: "question_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule: {
        Row: {
          created_at: string
          endTime: string | null
          id: number
          startTime: string | null
          text: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          endTime?: string | null
          id?: number
          startTime?: string | null
          text?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          endTime?: string | null
          id?: number
          startTime?: string | null
          text?: string | null
          type?: string | null
        }
        Relationships: []
      }
      staff_notifications: {
        Row: {
          assigned_to: string | null
          company_id: number
          created_at: string | null
          customer_id: number
          customer_response_id: number | null
          id: number
          message: string
          notification_type: string
          priority: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          company_id: number
          created_at?: string | null
          customer_id: number
          customer_response_id?: number | null
          id?: number
          message: string
          notification_type: string
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          company_id?: number
          created_at?: string | null
          customer_id?: number
          customer_response_id?: number | null
          id?: number
          message?: string
          notification_type?: string
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_notifications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_pr_connections: {
        Row: {
          condition_type: string | null
          condition_value: string | null
          connection_order: number | null
          created_at: string | null
          from_node_id: string
          id: string
          project_id: string
          to_node_id: string
        }
        Insert: {
          condition_type?: string | null
          condition_value?: string | null
          connection_order?: number | null
          created_at?: string | null
          from_node_id: string
          id?: string
          project_id: string
          to_node_id: string
        }
        Update: {
          condition_type?: string | null
          condition_value?: string | null
          connection_order?: number | null
          created_at?: string | null
          from_node_id?: string
          id?: string
          project_id?: string
          to_node_id?: string
        }
        Relationships: []
      }
      tb_pr_execution_history: {
        Row: {
          action_by: string | null
          action_type: string
          executed_at: string | null
          id: string
          new_state: number
          node_id: string
          notes: string | null
          previous_state: number | null
          project_id: string
        }
        Insert: {
          action_by?: string | null
          action_type: string
          executed_at?: string | null
          id?: string
          new_state: number
          node_id: string
          notes?: string | null
          previous_state?: number | null
          project_id: string
        }
        Update: {
          action_by?: string | null
          action_type?: string
          executed_at?: string | null
          id?: string
          new_state?: number
          node_id?: string
          notes?: string | null
          previous_state?: number | null
          project_id?: string
        }
        Relationships: []
      }
      tb_pr_project_members: {
        Row: {
          id: string
          invited_at: string | null
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_at?: string | null
          project_id: string
          role?: string
          user_id: string
        }
        Update: {
          id?: string
          invited_at?: string | null
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      tb_pr_rag_image: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          id: string
          image_url?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          title?: string | null
        }
        Relationships: []
      }
      tb_pr_workflow_json: {
        Row: {
          approvers: string[] | null
          created_at: string | null
          current_nodes: Json | null
          id: number
          name: string | null
          template_id: number | null
          workflow: Json | null
        }
        Insert: {
          approvers?: string[] | null
          created_at?: string | null
          current_nodes?: Json | null
          id?: number
          name?: string | null
          template_id?: number | null
          workflow?: Json | null
        }
        Update: {
          approvers?: string[] | null
          created_at?: string | null
          current_nodes?: Json | null
          id?: number
          name?: string | null
          template_id?: number | null
          workflow?: Json | null
        }
        Relationships: []
      }
      tb_pr_workflow_template_json: {
        Row: {
          created_at: string | null
          current_nodes: Json | null
          del_yn: boolean
          deleted_at: string | null
          id: string
          template: Json | null
          title: string | null
          version: number
        }
        Insert: {
          created_at?: string | null
          current_nodes?: Json | null
          del_yn?: boolean
          deleted_at?: string | null
          id: string
          template?: Json | null
          title?: string | null
          version?: number
        }
        Update: {
          created_at?: string | null
          current_nodes?: Json | null
          del_yn?: boolean
          deleted_at?: string | null
          id?: string
          template?: Json | null
          title?: string | null
          version?: number
        }
        Relationships: []
      }
      TB_TEST_1: {
        Row: {
          created_at: string
          description: string | null
          id: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      count_tags: {
        Args: Record<PropertyKey, never>
        Returns: {
          count: number
          tag: string
        }[]
      }
      get_workflow_templates: {
        Args: Record<PropertyKey, never>
        Returns: Json[]
      }
      group_documents_by_week_nweeks: {
        Args: { n_weeks: number }
        Returns: {
          count: number
          week: string
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      pr_get_project_connections: {
        Args: { p_project_id: string }
        Returns: {
          condition_type: string
          condition_value: string
          connection_order: number
          from_node_key: string
          to_node_key: string
        }[]
      }
      pr_get_project_flow_data: {
        Args: { p_project_id: string }
        Returns: {
          do_condition: string
          front_flows: string[]
          next_flow_condition: string
          next_flows: string[]
          node_id: string
          node_key: string
          node_role: string
          node_state: number
          node_title: string
          position_x: number
          position_y: number
          project_description: string
          project_id: string
          project_name: string
        }[]
      }
      pr_update_node_status: {
        Args: {
          p_action_type: string
          p_node_key: string
          p_notes?: string
          p_project_id: string
        }
        Returns: boolean
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
