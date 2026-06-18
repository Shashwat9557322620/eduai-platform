import { NextResponse } from 'next/server';

// Reuse the in-memory store from groups route
const messages: Record<string, any[]> = {
  'grp-001': [
    { id: 'm1', groupId: 'grp-001', userId: 'user_alice', userName: 'Alice', content: 'Has anyone started the final project?', timestamp: '2026-06-12T10:00:00Z' },
    { id: 'm2', groupId: 'grp-001', userId: 'user_bob', userName: 'Bob', content: 'Yes! I chose the web app track. Working on a budget planner.', timestamp: '2026-06-12T10:05:00Z' },
    { id: 'm3', groupId: 'grp-001', userId: 'user_demo', userName: 'You', content: 'Nice! I\'m doing the game track. anyone want to collaborate?', timestamp: '2026-06-12T10:10:00Z' },
    { id: 'm4', groupId: 'grp-001', userId: 'user_alice', userName: 'Alice', content: 'I can help with the CSS and design parts! 🎨', timestamp: '2026-06-12T10:15:00Z' },
    { id: 'm5', groupId: 'grp-001', userId: 'user_bob', userName: 'Bob', content: 'Let\'s set up a shared notes doc. What topics do we need to cover for the exam?', timestamp: '2026-06-12T10:20:00Z' },
  ],
  'grp-002': [
    { id: 'm6', groupId: 'grp-002', userId: 'user_alice', userName: 'Alice', content: 'Can someone explain Newton\'s third law with a real example?', timestamp: '2026-06-11T15:00:00Z' },
    { id: 'm7', groupId: 'grp-002', userId: 'user_demo', userName: 'You', content: 'When you push a wall, the wall pushes back with equal force. That\'s why you feel it!', timestamp: '2026-06-11T15:05:00Z' },
  ],
  'grp-003': [
    { id: 'm8', groupId: 'grp-003', userId: 'user_carol', userName: 'Carol', content: 'Found a great resource for number theory problems. I\'ll share the link.', timestamp: '2026-06-12T09:00:00Z' },
  ],
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get('groupId');
  if (!groupId) return NextResponse.json({ error: 'groupId required' }, { status: 400 });
  return NextResponse.json({ messages: messages[groupId] || [] });
}

export async function POST(req: Request) {
  const { groupId, content, userName } = await req.json();
  if (!groupId || !content) {
    return NextResponse.json({ error: 'groupId and content required' }, { status: 400 });
  }

  const msg = {
    id: `m${Date.now()}`,
    groupId,
    userId: 'user_demo',
    userName: userName || 'You',
    content,
    timestamp: new Date().toISOString(),
  };

  if (!messages[groupId]) messages[groupId] = [];
  messages[groupId].push(msg);

  return NextResponse.json({ message: msg });
}