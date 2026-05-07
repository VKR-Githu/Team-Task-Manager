const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

async function getProjectRole(userId, projectId) {
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } }
  });
  return member ? member.role : null;
}

// Create task
router.post('/', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('projectId').notEmpty().withMessage('Project ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { title, description, projectId, assigneeId, priority, dueDate } = req.body;

  const role = await getProjectRole(req.userId, projectId);
  if (!role) return res.status(403).json({ error: 'Not a project member' });

  const task = await prisma.task.create({
    data: {
      title, description, projectId,
      assigneeId: assigneeId || null,
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
      creatorId: req.userId
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true } }
    }
  });
  res.status(201).json(task);
});

// Update task
router.put('/:id', async (req, res) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const role = await getProjectRole(req.userId, task.projectId);
  if (!role) return res.status(403).json({ error: 'Not a project member' });

  // Members can only update status of their own tasks; admins can update anything
  const { title, description, status, priority, dueDate, assigneeId } = req.body;
  const updateData = {};

  if (role === 'ADMIN') {
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;
  }
  if (status !== undefined) updateData.status = status;

  const updated = await prisma.task.update({
    where: { id: req.params.id },
    data: updateData,
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true } }
    }
  });
  res.json(updated);
});

// Delete task (admin only)
router.delete('/:id', async (req, res) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const role = await getProjectRole(req.userId, task.projectId);
  if (role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });

  await prisma.task.delete({ where: { id: req.params.id } });
  res.json({ message: 'Task deleted' });
});

module.exports = router;
