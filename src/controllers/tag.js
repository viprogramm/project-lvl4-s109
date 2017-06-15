import buildFormObj from '../lib/formObjectBuilder';
import { requiredAuth } from '../helpers/auth';

export default (router, { Tag }) => {
  router
    .get('tags', '/tags', async (ctx) => {
      const tags = await Tag.findAll();
      ctx.render('tags', { tags });
    })
    .get('newTag', '/tags/new', requiredAuth, (ctx) => {
      const tag = Tag.build();
      ctx.render('tags/new', { f: buildFormObj(tag) });
    })
    .post('tags', '/tags', async (ctx) => {
      const { form } = ctx.request.body;
      const tag = Tag.build(form);
      try {
        await tag.save();
        ctx.flash.set('Tag has been created');
        ctx.redirect(router.url('tags'));
      } catch (e) {
        ctx.render('tags/new', { f: buildFormObj(tag, e) });
      }
    })
    .get('editTag', '/tags/:id', requiredAuth, async (ctx) => {
      const { id } = ctx.params;
      const tag = await Tag.findById(id);

      if (!tag) {
        ctx.flash.set('Couldn\'t find this tag');
        ctx.redirect(router.url('tags'));
        return;
      }

      ctx.render('tags/edit', { f: buildFormObj(tag) });
    })
    .patch('updateTag', '/tags/:id', requiredAuth, async (ctx) => {
      const { form } = ctx.request.body;
      const { id, name } = form;

      const tag = await Tag.findById(id);

      if (!tag) {
        ctx.flash.set('Couldn\'t find this tag');
        ctx.redirect(router.url('tags'));
        return;
      }

      const oldTagName = tag.name;

      try {
        await tag.update({ name });
        ctx.flash.set(`Tag was renamed from ${oldTagName} to ${name}`);
        ctx.redirect(router.url('tags'));
      } catch (e) {
        ctx.render('tags/edit', { f: buildFormObj(tag, e) });
      }
    })
    .delete('deleteTag', '/tags/:id', requiredAuth, async (ctx) => {
      const { id } = ctx.params;
      const tag = await Tag.findById(id);
      try {
        tag.destroy();
        ctx.flash.set(`Tag (${tag.name}) was deleted`);
      } catch (e) {
        ctx.flash.set(e);
      }
      ctx.redirect(router.url('tags'));
    });
};
