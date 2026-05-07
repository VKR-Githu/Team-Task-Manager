const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  const now = new Date();

  const [totalProjects, myTasks, overdueTasks, tasksByStatus] = await Promise.all([
    prisma.project.count({
      where: {
        OR: [
          { ownerId: req.userId },
          { members: { some: { userId: req.userId } } }
        ]
      }
    }),
    prisma.task.findMany({
      where: { assigneeId: req.userId },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } }
      },
      orderBy: { dueDate: 'asc' },
      take: 10
    }),
    prisma.task.count({
      where: {
        assigneeId: req.userId,
        dueDate: { lt: now },
        status: { not: 'DONE' }
      }
    }),
    prisma.task.groupBy({
      by: ['status'],
      where: {
        project: {
          OR: [
            { ownerId: req.userId },
            { members: { some: { userId: req.userId } } }
          ]
        }
      },
      _count: { status: true }
    })
  ]);

  res.json({
    totalProjects,
    myTasks,
    overdueTasks,
    tasksByStatus: tasksByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, { TODO: 0, IN_PROGRESS: 0, DONE: 0 })
  });
});

module.exports = router;
