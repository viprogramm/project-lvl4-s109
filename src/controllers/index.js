import welcome from './welcome';
import users from './users';
import sessions from './sessions';
import tasks from './tasks';
import taskStatus from './taskStatus';
import tag from './tag';

const controllers = [welcome, users, sessions, tasks, taskStatus, tag];

export default (router, container) => controllers.forEach(f => f(router, container));
