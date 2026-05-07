const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get all projects for current user
router.get('/', async (req, res) => {
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: req.userId },
        { members: { some: { userId: req.userId } } }
      ]
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      _count: { select: { tasks: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(projects);
});

// Create project
router.post('/', [
  body('name').trim().notEmpty().withMessage('Project name is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, description } = req.body;
  const project = await prisma.project.create({
    data: {
      name, description,
      ownerId: req.userId,
      members: { create: { userId: req.userId, role: 'ADMIN' } }
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } }
    }
  });
  res.status(201).json(project);
});

// Get single project
router.get('/:id', async (req, res) => {
  const project = await prisma.project.findFirst({
    where: {
      id: req.params.id,
      OR: [
        { ownerId: req.userId },
        { members: { some: { userId: req.userId } } }
      ]
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          creator: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// Update project (admin only)
router.put('/:id', async (req, res) => {
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: req.userId, projectId: req.params.id } }
  });
  if (!member || member.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });

  const { name, description } = req.body;
  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: { name, description }
  });
  res.json(project);
});

// Delete project (admin only)
router.delete('/:id', async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: 'Not found' });
  if (project.ownerId !== req.userId) return res.status(403).json({ error: 'Only owner can delete' });

  await prisma.project.delete({ where: { id: req.params.id } });
  res.json({ message: 'Project deleted' });
});

// Add member
router.post('/:id/members', async (req, res) => {
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: req.userId, projectId: req.params.id } }
  });
  if (!member || member.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });

  const { email, role } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const existing = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId: req.params.id } }
  });
  if (existing) return res.status(409).json({ error: 'User already a member' });

  const newMember = await prisma.projectMember.create({
    data: { userId: user.id, projectId: req.params.id, role: role || 'MEMBER' },
    include: { user: { select: { id: true, name: true, email: true } } }
  });
  res.status(201).json(newMember);
});

// Remove member
router.delete('/:id/members/:userId', async (req, res) => {
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: req.userId, projectId: req.params.id } }
  });
  if (!member || member.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });

  await prisma.projectMember.delete({
    where: { userId_projectId: { userId: req.params.userId, projectId: req.params.id } }
  });
  res.json({ message: 'Member removed' });
});

module.exports = router;
