import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  option_order: number;
}

interface Poll {
  id: string;
  title: string;
  question: string;
  type: 'yes_no' | 'multiple_choice' | 'rating';
  status: 'draft' | 'active' | 'closed';
  join_code: string;
  created_at: string;
  options?: PollOption[];
}

interface PollResponse {
  id: string;
  poll_id: string;
  option_id?: string | null;
  rating_value?: number | null;
  participant_id: string;
  created_at: string;
}

// Initial seed polls
const INITIAL_POLLS: { poll: Poll; options: PollOption[]; responses: PollResponse[] }[] = [
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

// Persistent state storage in memory with backup
let pollsStore: Poll[] = INITIAL_POLLS.map((item) => ({
  ...item.poll,
  options: item.options,
}));
let responsesStore: PollResponse[] = INITIAL_POLLS.flatMap((item) => item.responses);

// Connected SSE clients for live updates
const sseClients: Map<string, Set<Response>> = new Map();

function broadcastPollUpdate(pollId: string) {
  const clients = sseClients.get(pollId);
  if (clients && clients.size > 0) {
    const data = JSON.stringify({ type: 'UPDATE', pollId, timestamp: Date.now() });
    for (const res of clients) {
      try {
        res.write(`data: ${data}\n\n`);
      } catch {
        clients.delete(res);
      }
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS support for mobile devices
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // 1. Get all polls
  app.get('/api/polls', (_req: Request, res: Response) => {
    res.json(pollsStore);
  });

  // 2. Get single poll by ID or join code (case-insensitive)
  app.get('/api/polls/:idOrCode', (req: Request, res: Response) => {
    const query = req.params.idOrCode.trim();
    const queryUpper = query.toUpperCase();

    const poll = pollsStore.find(
      (p) => p.id === query || p.join_code.toUpperCase() === queryUpper
    );

    if (!poll) {
      res.status(404).json({ error: 'Poll not found' });
      return;
    }

    res.json(poll);
  });

  // 3. Create poll
  app.post('/api/polls', (req: Request, res: Response) => {
    const { title, question, type, options } = req.body;

    if (!title || !question || !type) {
      res.status(400).json({ error: 'Missing required poll fields' });
      return;
    }

    const pollId = 'poll_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let joinCode = '';
    for (let i = 0; i < 6; i++) {
      joinCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    let formattedOptions: PollOption[] = [];
    if (type === 'yes_no') {
      formattedOptions = [
        { id: `${pollId}-opt-1`, poll_id: pollId, option_text: 'Yes', option_order: 1 },
        { id: `${pollId}-opt-2`, poll_id: pollId, option_text: 'No', option_order: 2 },
      ];
    } else if (type === 'multiple_choice' && Array.isArray(options)) {
      formattedOptions = options.map((optText: string, index: number) => ({
        id: `${pollId}-opt-${index + 1}`,
        poll_id: pollId,
        option_text: String(optText).trim(),
        option_order: index + 1,
      }));
    }

    const newPoll: Poll = {
      id: pollId,
      title: String(title).trim(),
      question: String(question).trim(),
      type,
      status: 'draft',
      join_code: joinCode,
      created_at: new Date().toISOString(),
      options: formattedOptions,
    };

    pollsStore.unshift(newPoll);
    broadcastPollUpdate(pollId);
    res.status(201).json(newPoll);
  });

  // 4. Update poll status
  app.patch('/api/polls/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const poll = pollsStore.find((p) => p.id === id);
    if (!poll) {
      res.status(404).json({ error: 'Poll not found' });
      return;
    }

    if (['draft', 'active', 'closed'].includes(status)) {
      poll.status = status;
      broadcastPollUpdate(id);
      res.json(poll);
    } else {
      res.status(400).json({ error: 'Invalid status' });
    }
  });

  // 5. Delete poll
  app.delete('/api/polls/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    pollsStore = pollsStore.filter((p) => p.id !== id);
    responsesStore = responsesStore.filter((r) => r.poll_id !== id);
    broadcastPollUpdate(id);
    res.json({ success: true });
  });

  // 6. Submit student vote
  app.post('/api/polls/:id/vote', (req: Request, res: Response) => {
    const { id } = req.params;
    const { optionId, ratingValue, participantId } = req.body;

    const poll = pollsStore.find((p) => p.id === id || p.join_code.toUpperCase() === id.toUpperCase());
    if (!poll) {
      res.status(404).json({ error: 'Poll not found' });
      return;
    }

    if (poll.status !== 'active') {
      res.status(400).json({
        error: poll.status === 'closed' ? 'This poll has ended.' : 'Poll is not currently active.',
      });
      return;
    }

    const pid = String(participantId || '').trim();
    if (!pid) {
      res.status(400).json({ error: 'Missing participant identifier' });
      return;
    }

    // Duplicate check
    const existing = responsesStore.find((r) => r.poll_id === poll.id && r.participant_id === pid);
    if (existing) {
      res.status(409).json({ error: 'You have already submitted your response for this poll.' });
      return;
    }

    const newResponse: PollResponse = {
      id: 'resp_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      poll_id: poll.id,
      option_id: optionId || null,
      rating_value: typeof ratingValue === 'number' ? ratingValue : null,
      participant_id: pid,
      created_at: new Date().toISOString(),
    };

    responsesStore.push(newResponse);
    broadcastPollUpdate(poll.id);

    res.status(201).json({ success: true, responseId: newResponse.id });
  });

  // 7. Get live results
  app.get('/api/polls/:id/results', (req: Request, res: Response) => {
    const { id } = req.params;
    const poll = pollsStore.find((p) => p.id === id || p.join_code.toUpperCase() === id.toUpperCase());

    if (!poll) {
      res.status(404).json({ error: 'Poll not found' });
      return;
    }

    const responses = responsesStore.filter((r) => r.poll_id === poll.id);
    const totalResponses = responses.length;

    const options = (poll.options || []).map((opt) => {
      const count = responses.filter((r) => r.option_id === opt.id).length;
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
      const ratingResponses = responses.filter((r) => typeof r.rating_value === 'number');
      const sum = ratingResponses.reduce((acc, r) => acc + (r.rating_value || 0), 0);
      averageRating = ratingResponses.length > 0 ? Number((sum / ratingResponses.length).toFixed(1)) : 0;

      ratingBreakdown = [1, 2, 3, 4, 5].map((star) => {
        const count = responses.filter((r) => r.rating_value === star).length;
        const percentage = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
        return { rating: star, count, percentage };
      });
    }

    res.json({
      poll,
      totalResponses,
      options,
      averageRating,
      ratingBreakdown,
    });
  });

  // 8. Server-Sent Events (SSE) stream for instant real-time sync
  app.get('/api/polls/:id/events', (req: Request, res: Response) => {
    const { id } = req.params;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    if (!sseClients.has(id)) {
      sseClients.set(id, new Set());
    }
    sseClients.get(id)!.add(res);

    // Send initial ping
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', pollId: id })}\n\n`);

    req.on('close', () => {
      const clients = sseClients.get(id);
      if (clients) {
        clients.delete(res);
        if (clients.size === 0) {
          sseClients.delete(id);
        }
      }
    });
  });

  // Check if participant voted
  app.get('/api/polls/:id/voted/:participantId', (req: Request, res: Response) => {
    const { id, participantId } = req.params;
    const poll = pollsStore.find((p) => p.id === id || p.join_code.toUpperCase() === id.toUpperCase());
    if (!poll) {
      res.json({ voted: false });
      return;
    }
    const hasVoted = responsesStore.some((r) => r.poll_id === poll.id && r.participant_id === participantId);
    res.json({ voted: hasVoted });
  });

  // Mount Vite middleware in development
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Campus Vote server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
