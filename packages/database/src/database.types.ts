
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "clients": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"phone": string | null,"telegram_chat_id": number | null,"telegram_username": string | null,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"phone"?: string | null,"telegram_chat_id"?: number | null,"telegram_username"?: string | null,"workspace_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"phone"?: string | null,"telegram_chat_id"?: number | null,"telegram_username"?: string | null,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "clients_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"inventory_logs": {
                  Row: {
                    "created_at": string,"delta_amount": number,"id": string,"material_id": string,"print_job_id": string | null,"reason": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"delta_amount": number,"id"?: string,"material_id": string,"print_job_id"?: string | null,"reason": string
                  }
                  Update: {
                    "created_at"?: string,"delta_amount"?: number,"id"?: string,"material_id"?: string,"print_job_id"?: string | null,"reason"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "inventory_logs_material_id_fkey"
      columns: ["material_id"]
isOneToOne: false
      referencedRelation: "materials"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "inventory_logs_print_job_id_fkey"
      columns: ["print_job_id"]
isOneToOne: false
      referencedRelation: "print_jobs"
      referencedColumns: ["id"]
    }
                  ]
                },"materials": {
                  Row: {
                    "brand": string | null,"color_hex": string | null,"cost_per_unit": number,"created_at": string,"id": string,"initial_amount": number,"low_stock_threshold": number,"name": string,"remaining_amount": number,"type": string,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "brand"?: string | null,"color_hex"?: string | null,"cost_per_unit"?: number,"created_at"?: string,"id"?: string,"initial_amount"?: number,"low_stock_threshold"?: number,"name": string,"remaining_amount"?: number,"type": string,"workspace_id": string
                  }
                  Update: {
                    "brand"?: string | null,"color_hex"?: string | null,"cost_per_unit"?: number,"created_at"?: string,"id"?: string,"initial_amount"?: number,"low_stock_threshold"?: number,"name"?: string,"remaining_amount"?: number,"type"?: string,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "materials_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"order_items": {
                  Row: {
                    "created_at": string,"estimated_time_sec": number | null,"estimated_weight_g": number | null,"gcode_file_path": string | null,"id": string,"material_id": string | null,"name": string,"order_id": string,"post_processing_mins": number | null,"quantity": number,"stl_file_path": string | null,"technology": string,"thumbnail_path": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"estimated_time_sec"?: number | null,"estimated_weight_g"?: number | null,"gcode_file_path"?: string | null,"id"?: string,"material_id"?: string | null,"name": string,"order_id": string,"post_processing_mins"?: number | null,"quantity"?: number,"stl_file_path"?: string | null,"technology": string,"thumbnail_path"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"estimated_time_sec"?: number | null,"estimated_weight_g"?: number | null,"gcode_file_path"?: string | null,"id"?: string,"material_id"?: string | null,"name"?: string,"order_id"?: string,"post_processing_mins"?: number | null,"quantity"?: number,"stl_file_path"?: string | null,"technology"?: string,"thumbnail_path"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_items_material_id_fkey"
      columns: ["material_id"]
isOneToOne: false
      referencedRelation: "materials"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"orders": {
                  Row: {
                    "calculated_cost": number | null,"client_id": string,"created_at": string,"id": string,"is_paid": boolean,"order_number": string,"public_tracking_token": string,"status": string,"total_price": number | null,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "calculated_cost"?: number | null,"client_id": string,"created_at"?: string,"id"?: string,"is_paid"?: boolean,"order_number": string,"public_tracking_token"?: string,"status"?: string,"total_price"?: number | null,"workspace_id": string
                  }
                  Update: {
                    "calculated_cost"?: number | null,"client_id"?: string,"created_at"?: string,"id"?: string,"is_paid"?: boolean,"order_number"?: string,"public_tracking_token"?: string,"status"?: string,"total_price"?: number | null,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "orders_client_id_fkey"
      columns: ["client_id"]
isOneToOne: false
      referencedRelation: "clients"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "orders_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"print_jobs": {
                  Row: {
                    "actual_weight_used_g": number | null,"created_at": string,"failure_reason": string | null,"finished_at": string | null,"id": string,"order_item_id": string,"printer_id": string,"started_at": string | null,"status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "actual_weight_used_g"?: number | null,"created_at"?: string,"failure_reason"?: string | null,"finished_at"?: string | null,"id"?: string,"order_item_id": string,"printer_id": string,"started_at"?: string | null,"status"?: string
                  }
                  Update: {
                    "actual_weight_used_g"?: number | null,"created_at"?: string,"failure_reason"?: string | null,"finished_at"?: string | null,"id"?: string,"order_item_id"?: string,"printer_id"?: string,"started_at"?: string | null,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "print_jobs_order_item_id_fkey"
      columns: ["order_item_id"]
isOneToOne: false
      referencedRelation: "order_items"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "print_jobs_printer_id_fkey"
      columns: ["printer_id"]
isOneToOne: false
      referencedRelation: "printers"
      referencedColumns: ["id"]
    }
                  ]
                },"printers": {
                  Row: {
                    "access_code": string | null,"connection_type": string,"created_at": string,"depreciation_per_hour": number | null,"id": string,"local_ip": string | null,"name": string,"power_watts": number | null,"status": string,"technology": string,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "access_code"?: string | null,"connection_type": string,"created_at"?: string,"depreciation_per_hour"?: number | null,"id"?: string,"local_ip"?: string | null,"name": string,"power_watts"?: number | null,"status"?: string,"technology": string,"workspace_id": string
                  }
                  Update: {
                    "access_code"?: string | null,"connection_type"?: string,"created_at"?: string,"depreciation_per_hour"?: number | null,"id"?: string,"local_ip"?: string | null,"name"?: string,"power_watts"?: number | null,"status"?: string,"technology"?: string,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "printers_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"workspaces": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"owner_id": string,"settings": NonNullable<Json>,"slug": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"owner_id": string,"settings"?: NonNullable<Json>,"slug": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"owner_id"?: string,"settings"?: NonNullable<Json>,"slug"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "request_tracking_token":
{ Args: Record<PropertyKey, never>; Returns: string
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
