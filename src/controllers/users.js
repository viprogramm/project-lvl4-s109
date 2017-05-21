import _ from 'lodash';
import buildFormObj from '../lib/formObjectBuilder';
import { encrypt } from '../lib/secure';

const requiredAuth = async (ctx, next) => {
  if (!ctx.state.isSignedIn()) {
    await next(ctx.throw(403));
  }
  await next();
};

export default (router, { User }) => {
  router
    .get('users', '/users', async (ctx) => {
      const users = await User.findAll();
      ctx.render('users', { users });
    })
    .get('newUser', '/users/new', (ctx) => {
      const user = User.build();
      ctx.render('users/new', { f: buildFormObj(user) });
    })
    .post('users', '/users', async (ctx) => {
      const { form } = ctx.request.body;
      const user = User.build(form);
      try {
        await user.save();
        ctx.flash.set('User has been created');
        ctx.redirect(router.url('root'));
      } catch (e) {
        ctx.render('users/new', { f: buildFormObj(user, e) });
      }
    })
    .get('editUser', '/users/:id', requiredAuth, async (ctx) => {
      const { id } = ctx.params;
      const user = await User.findById(id);
      ctx.render('users/edit', { f: buildFormObj(user) });
    })
    .patch('updateUser', '/users/:id', requiredAuth, async (ctx) => {
      const { form } = ctx.request.body;
      const { id, oldPassword, newPassword } = form;
      const user = await User.findById(id);
      const error = { errors: [] };

      if (!user) {
        ctx.flash.set('Couldn\'t find such a user');
        ctx.redirect(router.url('users'));
        return;
      }

      if (oldPassword || newPassword) {
        if (oldPassword === '') {
          error.errors.push({ field: 'oldPassword', message: 'Please set old password' });
        } else if (newPassword === '') {
          error.errors.push({ field: 'newPassword', message: 'Please set new password' });
        } else if (user.passwordDigest !== encrypt(oldPassword)) {
          error.errors.push({ field: 'oldPassword', message: 'Old password is incorrect' });
        }
      }

      if (error.errors.length > 0) {
        ctx.render('users/edit', { f: buildFormObj(form, error, 'field') });
        return;
      }

      try {
        const newData = newPassword ? _.merge(form, { password: newPassword }) : form;
        await user.update(newData);
        ctx.flash.set(`User ${user.fullName} was updated`);
        ctx.redirect(router.url('users'));
      } catch (e) {
        ctx.render('users/edit', { f: buildFormObj(user, e) });
      }
    })
    .delete('deleteUser', '/users/:id', requiredAuth, async (ctx) => {
      const { id } = ctx.params;
      const user = await User.findById(id);
      try {
        user.destroy();
        ctx.flash.set(`User ${user.fullName} was deleted`);
      } catch (e) {
        ctx.flash.set(e);
      }
      ctx.redirect(router.url('users'));
    });
};
