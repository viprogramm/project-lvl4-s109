import buildFormObj from '../lib/formObjectBuilder';
import { requiredAuth } from '../helpers/auth';

export default (router, { TaskStatus }) => {
  router
    .get('taskStatuses', '/task-statuses', async (ctx) => {
      const taskStatuses = await TaskStatus.findAll();
      ctx.render('task-statuses', { taskStatuses });
    })
    .get('newTaskStatus', '/task-statuses/new', (ctx) => {
      const taskStatus = TaskStatus.build();
      ctx.render('task-statuses/new', { f: buildFormObj(taskStatus) });
    })
    .post('taskStatuses', '/task-statuses', async (ctx) => {
      const { form } = ctx.request.body;
      const taskStatus = TaskStatus.build(form);
      try {
        await taskStatus.save();
        ctx.flash.set('Task\'s status has been created');
        ctx.redirect(router.url('taskStatuses'));
      } catch (e) {
        ctx.render('task-statuses/new', { f: buildFormObj(taskStatus, e) });
      }
    })
    .get('editTaskStatus', '/task-statuses/:id', requiredAuth, async (ctx) => {
      const { id } = ctx.params;
      const taskStatus = await TaskStatus.findById(id);

      if (!taskStatus) {
        ctx.flash.set('Couldn\'t find this task status');
        ctx.redirect(router.url('taskStatuses'));
        return;
      }

      ctx.render('task-statuses/edit', { f: buildFormObj(taskStatus) });
    })
    .patch('updateTaskStatus', '/task-statuses/:id', requiredAuth, async (ctx) => {
      const { form } = ctx.request.body;
      const { id, name } = form;

      const taskStatus = await TaskStatus.findById(id);

      if (!taskStatus) {
        ctx.flash.set('Couldn\'t find this task status');
        ctx.redirect(router.url('taskStatuses'));
        return;
      }

      const oldTaskStatusName = taskStatus.name;

      try {
        await taskStatus.update({ name });
        ctx.flash.set(`Task status was renamed from ${oldTaskStatusName} to ${name}`);
        ctx.redirect(router.url('taskStatuses'));
      } catch (e) {
        ctx.render('task-statuses/edit', { f: buildFormObj(taskStatus, e) });
      }
    })
    .delete('deleteTaskStatus', '/task-statuses/:id', requiredAuth, async (ctx) => {
      const { id } = ctx.params;
      const taskStatus = await TaskStatus.findById(id);
      try {
        taskStatus.destroy();
        ctx.flash.set(`Task status (${taskStatus.name}) was deleted`);
      } catch (e) {
        ctx.flash.set(e);
      }
      ctx.redirect(router.url('taskStatuses'));
    });
};
