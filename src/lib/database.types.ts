export type Database = {
  public: {
    Tables: {
      waitlist_signups: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: string;
          due_label: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role: string;
          due_label?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["waitlist_signups"]["Insert"]>;
        Relationships: [];
      };
      registries: {
        Row: {
          id: string;
          slug: string;
          edit_token: string;
          mom_name: string;
          due_label: string | null;
          current_week: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          edit_token: string;
          mom_name: string;
          due_label?: string | null;
          current_week?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["registries"]["Insert"]>;
        Relationships: [];
      };
      registry_slots: {
        Row: {
          id: string;
          registry_id: string;
          category: "meal" | "item" | "care";
          day_label: string;
          description: string;
          status: "open" | "taken";
          claimed_by_name: string | null;
          claimed_by_contact: string | null;
          claimed_at: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          registry_id: string;
          category: "meal" | "item" | "care";
          day_label: string;
          description: string;
          status?: "open" | "taken";
          claimed_by_name?: string | null;
          claimed_by_contact?: string | null;
          claimed_at?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["registry_slots"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
