export interface Report {
  id: string;
  category: string;
  description: string;
  address: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  created_at: string;
}