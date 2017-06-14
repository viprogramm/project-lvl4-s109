import _ from 'lodash';
import buildFormObj from '../lib/formObjectBuilder';
import { requiredAuth } from '../helpers/auth';

const filterTasks = (tasks, filters = {}) =>
  Object.keys(filters).reduce((filteredTasks, key) => {
    if (key === 'tags') {
      return filteredTasks
        .filter(task =>
          task[key].filter(taskTag => taskTag.id === filters[key]).length > 0,
        );
    }

    return filteredTasks.filter(task => task[key].id === filters[key]);
  }, tasks);

const getTagsIds = (tags) => {
  if (typeof tags === 'string') {
    return [Number(tags)];
  }
  return tags.map(tagId => Number(tagId));
};

export default (router, { Task, TaskStatus, User, Tag }) => {
  router
    .get('tasks', '/tasks', async (ctx) => {
      const tasks = await Task.findAll({
        include: [
          { model: User, as: 'assignedTo' },
          { model: User, as: 'creator' },
          { model: TaskStatus, as: 'status' },
          { model: Tag, as: 'tags' },
        ],
      });

      const filters = Object.keys(ctx.query)
        .reduce((acc, key) => {
          if (ctx.query[key] === '') {
            return acc;
          }
          return {
            ...acc,
            [key]: Number(ctx.query[key]),
          };
        }, {});

      const filtredTasks = filterTasks(tasks, filters);
      const statuses = await TaskStatus.findAll();
      const users = await User.findAll().map((user) => {
        const userName = user.id === ctx.session.userId ? `${user.fullName} (me)` : user.fullName;
        return { id: user.id, name: userName };
      });
      const tags = await Tag.findAll();

      ctx.render('tasks', { f: buildFormObj(filters), tasks: filtredTasks, statuses, users, tags });
    })
    .get('newTask', '/tasks/new', async (ctx) => {
      const task = Task.build();
      const statuses = await TaskStatus.findAll();
      const users = await User.findAll().map(user => ({ id: user.id, name: user.fullName }));
      const tags = await Tag.findAll();
      ctx.render('tasks/new', { f: buildFormObj(task), statuses, users, tags });
    })
    .post('tasks', '/tasks', async (ctx) => {
      const { form } = ctx.request.body;
      const tagIds = getTagsIds(form.tags);

      const task = Task.build(_.merge(form, { creatorId: ctx.session.userId }));
      try {
        await task.save();
        const tags = await Tag.findAll({
          where: {
            id: {
              $in: tagIds,
            },
          },
        });
        await task.setTags(tags);
        ctx.flash.set('Task has been created');
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        const statuses = await TaskStatus.findAll();
        const users = await User.findAll().map(user => ({ id: user.id, name: user.fullName }));
        const tags = await Tag.findAll();
        ctx.render('tasks/new', { f: buildFormObj(task, e), statuses, users, tags });
      }
    })
    .get('editTask', '/tasks/:id', requiredAuth, async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findById(id, {
        include: [
          { model: User, as: 'assignedTo' },
          { model: User, as: 'creator' },
          { model: TaskStatus, as: 'status' },
          { model: Tag, as: 'tags' },
        ],
      });

      if (!task) {
        ctx.flash.set('Couldn\'t find this task');
        ctx.redirect(router.url('tasks'));
        return;
      }

      const statuses = await TaskStatus.findAll();
      const users = await User.findAll().map(user => ({ id: user.id, name: user.fullName }));
      const tags = await Tag.findAll();

      ctx.render('tasks/edit', { f: buildFormObj(task), statuses, users, tags });
    })
    .patch('updateTask', '/tasks/:id', requiredAuth, async (ctx) => {
      const { form } = ctx.request.body;
      const { id } = form;
      const tagIds = getTagsIds(form.tags);

      const task = await Task.findById(id);

      if (!task) {
        ctx.flash.set('Couldn\'t find this task');
        ctx.redirect(router.url('tasks'));
        return;
      }

      try {
        await task.update(form);

        const tags = await Tag.findAll({
          where: {
            id: {
              $in: tagIds,
            },
          },
        });
        await task.setTags(tags);

        ctx.flash.set('Task was renamed');
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        ctx.render('tasks/edit', { f: buildFormObj(task, e) });
      }
    })
    .delete('deleteTask', '/tasks/:id', requiredAuth, async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findById(id);
      try {
        task.destroy();
        ctx.flash.set(`Task (${task.name}) was deleted`);
      } catch (e) {
        ctx.flash.set(e);
      }
      ctx.redirect(router.url('tasks'));
    });
};
