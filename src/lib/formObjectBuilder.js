import _ from 'lodash';

export default (object, error = { errors: [] }, groupField = 'path') => ({
  name: 'form',
  object,
  errors: _.groupBy(error.errors, groupField),
});
