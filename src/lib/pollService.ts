import { RealtimeChannel } from '@supabase/supabase-js';
import { Poll, PollOption, PollResponse, PollResults, PollStatus, PollType } from '../types/poll';
import { getParticipantId, recordLocalVote, getLocalVoteRecord } from './participant';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

const POLLS_STORAGE_KEY = 'campus_vote_polls_data';
const RESPONSES_STORAGE_KEY = 'campus_vote_responses_data';
const BROADCAST_CHANNEL_NAME = 'campus_vote_realtime_bus';

// BroadcastChannel for cross-tab synchronization
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch {
  // Graceful fallback
}

function notifySubscribers(pollId: string): void {
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'POLL_UPDATED', pollId, timestamp: Date.now() });
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('campus_vote_update', { detail: { pollId } }));
  }
}

// Default fallback sample polls
const DEFAULT_SAMPLE_POLLS: { poll: Poll; options: PollOption[]; responses: PollResponse[] }[] = [
  {
    poll: {
      id: 'demo-tech-fest',
      title: 'College Tech Fest 2026',
      question: 'Which keynote track are you most excited for today?',
      type: 'multiple_choice',
      status: 'active',
      join_code: 'TECH26',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    options: [
      { id: 'opt-1', poll_id: 'demo-tech-fest', option_text: 'Autonomous Robotics & Drones', option_order: 1 },
      { id: 'opt-2', poll_id: 'demo-tech-fest', option_text: 'Web3 & Decentralized Cloud', option_order: 2 },
      { id: 'opt-3', poll_id: 'demo-tech-fest', option_text: 'Full-Stack System Architecture', option_order: 3 },
      { id: 'opt-4', poll_id: 'demo-tech-fest', option_text: 'Cybersecurity & Ethical Hacking', option_order: 4 },
    ],
    responses: [
      { id: 'r1', poll_id: 'demo-tech-fest', option_id: 'opt-1', participant_id: 'p_init_1', created_at: new Date().toISOString() },
      { id: 'r2', poll_id: 'demo-tech-fest', option_id: 'opt-1', participant_id: 'p_init_2', created_at: new Date().toISOString() },
      { id: 'r3', poll_id: 'demo-tech-fest', option_id: 'opt-2', participant_id: 'p_init_3', created_at: new Date().toISOString() },
      { id: 'r4', poll_id: 'demo-tech-fest', option_id: 'opt-3', participant_id: 'p_init_4', created_at: new Date().toISOString() },
      { id: 'r5', poll_id: 'demo-tech-fest', option_id: 'opt-3', participant_id: 'p_init_5', created_at: new Date().toISOString() },
      { id: 'r6', poll_id: 'demo-tech-fest', option_id: 'opt-4', participant_id: 'p_init_6', created_at: new Date().toISOString() },
      { id: 'r7', poll_id: 'demo-tech-fest', option_id: 'opt-1', participant_id: 'p_init_7', created_at: new Date().toISOString() },
    ],
  },
  {
    poll: {
      id: 'demo-algorithms-check',
      title: 'CS301: Graph Algorithms Lecture',
      question: 'Did today’s visual breakdown of Dijkstra’s shortest path make sense?',
      type: 'yes_no',
      status: 'active',
      join_code: 'ALGO99',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    options: [
      { id: 'opt-yes', poll_id: 'demo-algorithms-check', option_text: 'Yes', option_order: 1 },
      { id: 'opt-no', poll_id: 'demo-algorithms-check', option_text: 'No', option_order: 2 },
    ],
    responses: [
      { id: 'r20', poll_id: 'demo-algorithms-check', option_id: 'opt-yes', participant_id: 'p_20', created_at: new Date().toISOString() },
      { id: 'r21', poll_id: 'demo-algorithms-check', option_id: 'opt-yes', participant_id: 'p_21', created_at: new Date().toISOString() },
      { id: 'r22', poll_id: 'demo-algorithms-check', option_id: 'opt-yes', participant_id: 'p_22', created_at: new Date().toISOString() },
      { id: 'r23', poll_id: 'demo-algorithms-check', option_id: 'opt-no', participant_id: 'p_23', created_at: new Date().toISOString() },
    ],
  },
  {
    poll: {
      id: 'demo-orientation-rating',
      title: 'Freshers Orientation 2026',
      question: 'How would you rate the campus lab tour and student club showcases today?',
      type: 'rating',
      status: 'draft',
      join_code: 'TOUR26',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    options: [],
    responses: [
      { id: 'r31', poll_id: 'demo-orientation-rating', rating_value: 5, participant_id: 'p_31', created_at: new Date().toISOString() },
      { id: 'r32', poll_id: 'demo-orientation-rating', rating_value: 4, participant_id: 'p_32', created_at: new Date().toISOString() },
      { id: 'r33', poll_id: 'demo-orientation-rating', rating_value: 5, participant_id: 'p_33', created_at: new Date().toISOString() },
    ],
  },
];

// Helper to initialize local storage safely
function getLocalFallback(): { polls: Poll[]; responses: PollResponse[] } {
  let polls: Poll[] = [];
  let responses: PollResponse[] = [];

  try {
    const rawPolls = localStorage.getItem(POLLS_STORAGE_KEY);
    const rawResponses = localStorage.getItem(RESPONSES_STORAGE_KEY);

    if (rawPolls) {
      const parsed = JSON.parse(rawPolls);
      if (Array.isArray(parsed) && parsed.length > 0) {
        polls = parsed;
      }
    }

    if (rawResponses) {
      const parsed = JSON.parse(rawResponses);
      if (Array.isArray(parsed)) {
        responses = parsed;
      }
    }
  } catch {
    // ignore
  }

  // Ensure sample polls are always present if local storage is empty
  if (polls.length === 0) {
    polls = DEFAULT_SAMPLE_POLLS.map((item) => ({
      ...item.poll,
      options: item.options,
    }));
  }

  if (responses.length === 0) {
    responses = DEFAULT_SAMPLE_POLLS.flatMap((item) => item.responses);
  }

  return { polls, responses };
}

// 1. Get all polls
export async function getPolls(): Promise<Poll[]> {
  try {
    const res = await fetch('/api/polls');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        try {
          localStorage.setItem(POLLS_STORAGE_KEY, JSON.stringify(data));
        } catch {}
        return data;
      }
    }
  } catch (err) {
    console.warn('API /api/polls failed, falling back to local cache:', err);
  }

  // Supabase fallback if configured
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data: pollsData, error } = await supabase
        .from('polls')
        .select('*, options:poll_options(*)')
        .order('created_at', { ascending: false });

      if (!error && pollsData) {
        return pollsData.map((p) => ({
          ...p,
          options: (p.options || []).sort((a: PollOption, b: PollOption) => a.option_order - b.option_order),
        }));
      }
    } catch {}
  }

  const { polls } = getLocalFallback();
  return polls.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// 2. Get single poll by ID or Join Code
export async function getPoll(idOrCode: string): Promise<Poll | null> {
  if (!idOrCode) return null;
  const cleanQuery = idOrCode.trim();

  // Try Server API first (connects all phones and laptops to the same data!)
  try {
    const res = await fetch(`/api/polls/${encodeURIComponent(cleanQuery)}`);
    if (res.ok) {
      const poll = await res.json();
      if (poll && poll.id) {
        return poll;
      }
    }
  } catch (err) {
    console.warn(`API /api/polls/${cleanQuery} failed, checking local cache:`, err);
  }

  // Supabase fallback if configured
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      let query = supabase.from('polls').select('*, options:poll_options(*)');
      const cleanUpper = cleanQuery.toUpperCase();
      if (cleanQuery.includes('-') && cleanQuery.length > 10) {
        query = query.eq('id', cleanQuery);
      } else {
        query = query.or(`id.eq.${cleanQuery},join_code.eq.${cleanUpper}`);
      }

      const { data, error } = await query.single();
      if (!error && data) {
        return {
          ...data,
          options: (data.options || []).sort((a: PollOption, b: PollOption) => a.option_order - b.option_order),
        };
      }
    } catch {}
  }

  // Check Local / Sample Fallback
  const { polls } = getLocalFallback();
  const queryUpper = cleanQuery.toUpperCase();
  const poll = polls.find(
    (p) => p.id === cleanQuery || p.join_code.toUpperCase() === queryUpper
  );

  return poll ? JSON.parse(JSON.stringify(poll)) : null;
}

// 3. Create a new poll
export async function createPoll(params: {
  title: string;
  question: string;
  type: PollType;
  options: string[];
}): Promise<Poll> {
  try {
    const res = await fetch('/api/polls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const newPoll = await res.json();
      notifySubscribers(newPoll.id);
      return newPoll;
    }
  } catch (err) {
    console.warn('API create poll failed, falling back to local:', err);
  }

  // Local fallback
  const pollId = 'poll_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let joinCode = '';
  for (let i = 0; i < 6; i++) {
    joinCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  let formattedOptions: PollOption[] = [];
  if (params.type === 'yes_no') {
    formattedOptions = [
      { id: `${pollId}-opt-1`, poll_id: pollId, option_text: 'Yes', option_order: 1 },
      { id: `${pollId}-opt-2`, poll_id: pollId, option_text: 'No', option_order: 2 },
    ];
  } else if (params.type === 'multiple_choice') {
    formattedOptions = params.options.map((optText, index) => ({
      id: `${pollId}-opt-${index + 1}`,
      poll_id: pollId,
      option_text: optText.trim(),
      option_order: index + 1,
    }));
  }

  const newPoll: Poll = {
    id: pollId,
    title: params.title.trim(),
    question: params.question.trim(),
    type: params.type,
    status: 'draft',
    join_code: joinCode,
    created_at: new Date().toISOString(),
    options: formattedOptions,
  };

  const { polls } = getLocalFallback();
  polls.unshift(newPoll);
  try {
    localStorage.setItem(POLLS_STORAGE_KEY, JSON.stringify(polls));
  } catch {}
  notifySubscribers(newPoll.id);

  return newPoll;
}

// 4. Update poll status
export async function updatePollStatus(pollId: string, status: PollStatus): Promise<Poll | null> {
  try {
    const res = await fetch(`/api/polls/${pollId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      const updated = await res.json();
      notifySubscribers(pollId);
      return updated;
    }
  } catch (err) {
    console.warn('API update status failed, falling back to local:', err);
  }

  const { polls } = getLocalFallback();
  const poll = polls.find((p) => p.id === pollId);
  if (poll) {
    poll.status = status;
    try {
      localStorage.setItem(POLLS_STORAGE_KEY, JSON.stringify(polls));
    } catch {}
    notifySubscribers(pollId);
    return poll;
  }
  return null;
}

// 5. Delete poll
export async function deletePoll(pollId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/polls/${pollId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      notifySubscribers(pollId);
      return true;
    }
  } catch (err) {
    console.warn('API delete poll failed, falling back to local:', err);
  }

  const { polls, responses } = getLocalFallback();
  const filteredPolls = polls.filter((p) => p.id !== pollId);
  const filteredResponses = responses.filter((r) => r.poll_id !== pollId);

  try {
    localStorage.setItem(POLLS_STORAGE_KEY, JSON.stringify(filteredPolls));
    localStorage.setItem(RESPONSES_STORAGE_KEY, JSON.stringify(filteredResponses));
  } catch {}
  notifySubscribers(pollId);
  return true;
}

// 6. Check if user already voted
export async function hasUserVoted(pollId: string, participantId?: string): Promise<boolean> {
  const pid = participantId || getParticipantId();
  if (getLocalVoteRecord(pollId)) {
    return true;
  }

  try {
    const res = await fetch(`/api/polls/${pollId}/voted/${pid}`);
    if (res.ok) {
      const data = await res.json();
      if (data.voted) return true;
    }
  } catch {}

  const { responses } = getLocalFallback();
  return responses.some((r) => r.poll_id === pollId && r.participant_id === pid);
}

// 7. Submit a student response
export async function submitResponse(params: {
  pollId: string;
  optionId?: string;
  ratingValue?: number;
  choiceSummary?: string;
}): Promise<{ success: boolean; error?: string }> {
  const participantId = getParticipantId();

  try {
    const res = await fetch(`/api/polls/${params.pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        optionId: params.optionId,
        ratingValue: params.ratingValue,
        participantId,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to submit vote' };
    }

    recordLocalVote(params.pollId, params.choiceSummary || 'Submitted');
    notifySubscribers(params.pollId);
    return { success: true };
  } catch (err) {
    console.warn('API vote failed, falling back to local submission:', err);
  }

  // Local fallback
  const poll = await getPoll(params.pollId);
  if (!poll) return { success: false, error: 'Poll not found' };
  if (poll.status !== 'active') {
    return { success: false, error: poll.status === 'closed' ? 'This poll has ended.' : 'Poll is not active.' };
  }

  const { responses } = getLocalFallback();
  responses.push({
    id: 'resp_' + Date.now().toString(36),
    poll_id: params.pollId,
    option_id: params.optionId || null,
    rating_value: params.ratingValue || null,
    participant_id: participantId,
    created_at: new Date().toISOString(),
  });
  try {
    localStorage.setItem(RESPONSES_STORAGE_KEY, JSON.stringify(responses));
  } catch {}

  recordLocalVote(params.pollId, params.choiceSummary || 'Submitted');
  notifySubscribers(params.pollId);
  return { success: true };
}

// 8. Get aggregated results
export async function getPollResults(pollId: string): Promise<PollResults | null> {
  try {
    const res = await fetch(`/api/polls/${pollId}/results`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.poll) {
        return data;
      }
    }
  } catch (err) {
    console.warn('API results failed, falling back to local calculation:', err);
  }

  const poll = await getPoll(pollId);
  if (!poll) return null;

  const { responses } = getLocalFallback();
  const pollResponses = responses.filter((r) => r.poll_id === pollId);
  const totalResponses = pollResponses.length;

  const options = (poll.options || []).map((opt) => {
    const count = pollResponses.filter((r) => r.option_id === opt.id).length;
    const percentage = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
    return {
      id: opt.id,
      text: opt.option_text,
      order: opt.option_order,
      count,
      percentage,
    };
  });

  let averageRating: number | undefined;
  let ratingBreakdown: { rating: number; count: number; percentage: number }[] | undefined;

  if (poll.type === 'rating') {
    const ratingResponses = pollResponses.filter((r) => typeof r.rating_value === 'number');
    const sum = ratingResponses.reduce((acc, r) => acc + (r.rating_value || 0), 0);
    averageRating = ratingResponses.length > 0 ? Number((sum / ratingResponses.length).toFixed(1)) : 0;

    ratingBreakdown = [1, 2, 3, 4, 5].map((star) => {
      const count = pollResponses.filter((r) => r.rating_value === star).length;
      const percentage = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
      return { rating: star, count, percentage };
    });
  }

  return {
    poll,
    totalResponses,
    options,
    averageRating,
    ratingBreakdown,
  };
}

// 9. Realtime subscription (SSE + BroadcastChannel + Window event)
export function subscribeToPollUpdates(pollId: string, onUpdate: () => void): () => void {
  let isCleanedUp = false;

  // 1. SSE Connection for cross-device updates (phone to laptop & projector!)
  let eventSource: EventSource | null = null;
  try {
    eventSource = new EventSource(`/api/polls/${pollId}/events`);
    eventSource.onmessage = (event) => {
      if (isCleanedUp) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'UPDATE') {
          onUpdate();
        }
      } catch {}
    };
  } catch {}

  // 2. Local window events & storage sync
  const handleLocalUpdate = (e: Event) => {
    if (isCleanedUp) return;
    const customEvt = e as CustomEvent<{ pollId: string }>;
    if (!customEvt.detail || !customEvt.detail.pollId || customEvt.detail.pollId === pollId) {
      onUpdate();
    }
  };

  const handleBroadcast = (evt: MessageEvent) => {
    if (isCleanedUp) return;
    if (evt.data && evt.data.pollId === pollId) {
      onUpdate();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('campus_vote_update', handleLocalUpdate);
  }

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    isCleanedUp = true;
    if (eventSource) {
      eventSource.close();
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('campus_vote_update', handleLocalUpdate);
    }
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
  };
}
