import connect from './db';
import getModels from './models';

export default async () => {
  const models = getModels(connect);
  await Promise.all(Object.values(models).map(model => model.sync()));
  models.TaskStatus.bulkCreate([
    { name: 'new' },
    { name: 'in progress' },
    { name: 'testing' },
    { name: 'finished' },
  ]);
};
