import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// In-memory store (demo — in production use Supabase)
const groups: Record<string, any> = {
  'grp-001': {
    id: 'grp-001',
    name: 'CS50 Study Squad',
    subject: 'Computer Science',
    description: 'Preparing for CS50 final exam together',
    emoji: '💻',
    createdBy: 'user_demo',
    members: ['user_demo', 'user_alice', 'user_bob'],
    maxMembers: 10,
    createdAt: '2026-06-01T10:00:00Z',
    pinned: true,
  },
  'grp-002': {
    id: 'grp-002',
    name: 'Physics Problem Solvers',
    subject: 'Physics',
    description: 'Solving tricky physics problems together',
    emoji: '⚛️',
    createdBy: 'user_alice',
    members: ['user_alice', 'user_demo'],
    maxMembers: 8,
    createdAt: '2026-06-05T14:30:00Z',
    pinned: false,
  },
  'grp-003': {
    id: 'grp-003',
    name: 'Math Olympiad Prep',
    subject: 'Mathematics',
    description: 'Training for math olympiad 2026',
    emoji: '📐',
    createdBy: 'user_bob',
    members: ['user_bob', 'user_carol', 'user_demo'],
    maxMembers: 6,
    createdAt: '2026-06-10T09:00:00Z',
    pinned: false,
  },
};

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

const sharedNotes: Record<string, any[]> = {
  'grp-001': [
    { id: 'n1', title: 'Key Concepts', content: '1. Data Structures: Arrays, Linked Lists, Trees, Hash Tables\n2. Algorithms: Sorting, Searching, Graph Traversal\n3. Complexity Analysis: Big O notation', updatedBy: 'Alice', updatedAt: '2026-06-12T11:00:00Z' },
    { id: 'n2', title: 'Study Schedule', content: 'Day 1-2: Review data structures\nDay 3-4: Practice algorithms\nDay 5-6: Mock exams\nDay 7: Final review', updatedBy: 'Bob', updatedAt: '2026-06-12T12:00:00Z' },
  ],
  'grp-002': [
    { id: 'n3', title: 'Physics Formula Sheet', content: 'F = ma (Newton\'s Second Law)\nE = mc² (Mass-Energy Equivalence)\nV = IR (Ohm\'s Law)\nPV = nRT (Ideal Gas Law)', updatedBy: 'Alice', updatedAt: '2026-06-11T16:00:00Z' },
  ],
};

let msgCounter = 100;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get('id');
  const action = searchParams.get('action') || 'list';

  if (action === 'list') {
    const allGroups = Object.values(groups).map(g => ({
      ...g,
      memberCount: g.members.length,
      messageCount: (messages[g.id] || []).length,
    }));
    return NextResponse.json({ groups: allGroups });
  }

  if (action === 'detail' && groupId) {
    const group = groups[groupId];
    if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    return NextResponse.json({
      group,
      messages: messages[groupId] || [],
      notes: sharedNotes[groupId] || [],
    });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { action } = body;

    if (action === 'create') {
      const { name, subject, description, emoji } = body;
      if (!name) return NextResponse.json({ error: 'Group name is required' }, { status: 400 });

      const id = `grp-${String(Object.keys(groups).length + 1).padStart(3, '0')}`;
      const newGroup = {
        id,
        name,
        subject: subject || 'General',
        description: description || '',
        emoji: emoji || '📚',
        createdBy: userId || 'anonymous',
        members: [userId || 'anonymous'],
        maxMembers: 10,
        createdAt: new Date().toISOString(),
        pinned: false,
      };
      groups[id] = newGroup;
      messages[id] = [];
      sharedNotes[id] = [];
      return NextResponse.json({ group: newGroup });
    }

    if (action === 'join') {
      const { groupId } = body;
      const group = groups[groupId];
      if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });
      if (group.members.length >= group.maxMembers) {
        return NextResponse.json({ error: 'Group is full' }, { status: 400 });
      }
      if (!group.members.includes(userId || 'anonymous')) {
        group.members.push(userId || 'anonymous');
      }
      return NextResponse.json({ group });
    }

    if (action === 'leave') {
      const { groupId } = body;
      const group = groups[groupId];
      if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });
      group.members = group.members.filter((m: string) => m !== (userId || 'anonymous'));
      return NextResponse.json({ group });
    }

    if (action === 'add-note') {
      const { groupId, title, content } = body;
      if (!sharedNotes[groupId]) sharedNotes[groupId] = [];
      const note = {
        id: `n${Date.now()}`,
        title,
        content,
        updatedBy: 'You',
        updatedAt: new Date().toISOString(),
      };
      sharedNotes[groupId].push(note);
      return NextResponse.json({ note });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}