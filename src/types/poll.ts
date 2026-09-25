export type PollType = 'yes_no' | 'multiple_choice' | 'rating';

export type PollStatus = 'draft' | 'active' | 'closed';

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  option_order: number;
}

export interface Poll {
  id: string;
  title: string;
  question: string;
  type: PollType;
  status: PollStatus;
  join_code: string;
  created_at: string;
  options?: PollOption[];
}

export interface PollResponse {
  id: string;
  poll_id: string;
  option_id?: string | null;
  rating_value?: number | null;
  participant_id: string;
  created_at: string;
}

export interface OptionResult {
  id: string;
  text: string;
  order: number;
  count: number;
  percentage: number;
}

export interface RatingBreakdown {
  rating: number; // 1 to 5
  count: number;
  percentage: number;
}

export interface PollResults {
  poll: Poll;
  totalResponses: number;
  options: OptionResult[];
  averageRating?: number;
  ratingBreakdown?: RatingBreakdown[];
}
