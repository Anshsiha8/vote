/**
 * Participant Session Identification
 * Non-invasive, browser-scoped persistent identifier for duplicate voting prevention.
 */

const PARTICIPANT_KEY = 'campus_vote_participant_id';
const VOTED_POLLS_KEY = 'campus_vote_voted_polls';

export function getParticipantId(): string {
  let id = localStorage.getItem(PARTICIPANT_KEY);
  if (!id) {
    id = 'p_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem(PARTICIPANT_KEY, id);
  }
  return id;
}

export function recordLocalVote(pollId: string, choiceSummary: string): void {
  try {
    const raw = localStorage.getItem(VOTED_POLLS_KEY);
    const map: Record<string, { votedAt: string; choiceSummary: string }> = raw ? JSON.parse(raw) : {};
    map[pollId] = {
      votedAt: new Date().toISOString(),
      choiceSummary,
    };
    localStorage.setItem(VOTED_POLLS_KEY, JSON.stringify(map));
  } catch (err) {
    console.error('Error saving local vote record', err);
  }
}

export function getLocalVoteRecord(pollId: string): { votedAt: string; choiceSummary: string } | null {
  try {
    const raw = localStorage.getItem(VOTED_POLLS_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[pollId] || null;
  } catch {
    return null;
  }
}
