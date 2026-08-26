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
      chat_sessions: {
        Row: {
          id: string;
          status: "ai_chat" | "waiting_to_pair" | "paired" | "ended";
          pair_chat_id: string | null;
          last_ping_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          status?: "ai_chat" | "waiting_to_pair" | "paired" | "ended";
          pair_chat_id?: string | null;
          last_ping_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chat_sessions"]["Insert"]>;
        Relationships: [];
      };
      pair_chats: {
        Row: {
          id: string;
          session_a_id: string;
          session_b_id: string;
          status: "active" | "ended";
          ended_reason: string | null;
          created_at: string;
          ended_at: string | null;
        };
        Insert: {
          id?: string;
          session_a_id: string;
          session_b_id: string;
          status?: "active" | "ended";
          ended_reason?: string | null;
          created_at?: string;
          ended_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["pair_chats"]["Insert"]>;
        Relationships: [];
      };
      pair_messages: {
        Row: {
          id: string;
          pair_chat_id: string;
          sender_session_id: string;
          content: string;
          flagged: boolean;
          flag_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pair_chat_id: string;
          sender_session_id: string;
          content: string;
          flagged?: boolean;
          flag_reason?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pair_messages"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      try_pair_session: {
        Args: { p_session_id: string };
        Returns: string | null;
      };
    };
  };
};
