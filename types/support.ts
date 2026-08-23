export type SupportMessageStatus = 'unread' | 'pending' | 'replied' | 'closed';

export interface SupportMessage {
  id: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  message: string;
  status: SupportMessageStatus;
  admin_reply?: string | null;
  replied_at?: string | null;
  replied_by?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown>;
}

export interface CreateSupportMessageInput {
  customer_name: string;
  customer_email: string;
  subject: string;
  message: string;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown>;
}
