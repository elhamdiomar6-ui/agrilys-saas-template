export type AgentId =
  | 'directeur'
  | 'juridique'
  | 'financier'
  | 'patrimoine'
  | 'communication'
  | 'financement'
  | 'technique'
  | 'diaspora'
  | 'cooperatives'
  | 'architecte'
  | 'agronome'
  | 'hydraulique'
  | 'energie'
  | 'sante'
  | 'urbaniste';

export interface Agent {
  id: AgentId;
  nameAr: string;
  nameFr: string;
  icon: string;
  color: string;
  description: string;
}

export interface OrchidMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentId: AgentId;
  timestamp: number;
}
