const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');
const compiler = require('vue-template-compiler');

function load(file, dependencies = {}) {
  let source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  if (file.endsWith('.vue')) source = compiler.parseComponent(source).script.content;
  const code = babel.transformSync(source, { configFile: false, babelrc: false, plugins: ['@babel/plugin-transform-modules-commonjs'] }).code;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: name => dependencies[name] || {}, console });
  return module.exports;
}
const access = load('src/services/access.js');

test('cord_intel reviewers and the account desk selector follow the chosen assignment', () => {
  for (const role of ['officier', 'analyste', 'conseiller', 'coordinateur', 'admin']) {
    assert.equal(access.canReviewObservations({ role, desk: ' CORD_INTEL ' }), true);
    assert.equal(access.canReviewObservations({ role, desk: 'desk_est' }), false);
  }
  assert.equal(access.canReviewObservations(null), false);
  const auth = load('src/store/auth.js', { '@/services/access': access }).default;
  assert.equal(auth.getters.canDelete({ user: { role: 'officier', desk: 'cord_intel' } })('observation'), true);
  assert.equal(auth.getters.canDelete({ user: { role: 'admin', desk: '' } })('observation'), false);
  const admin = load('src/pages/Admin/Users.vue').default;
  assert.deepEqual(Array.from(admin.computed.deskOptions.call({ users: [{ desk: 'desk_est' }, { desk: 'cord_intel' }] })), ['cord_intel', 'CCOC', 'desk_est']);
});

test('the reviewer loads fresh content, chooses several desks and submits the reviewed version', async () => {
  const calls = [];
  const record = { _id: 'obs1', summary: 'Contrôle', workflow: { target_desks: ['old_desk', 'desk_est'] }, _seq_no: 4, _primary_term: 2 };
  const api = { observations: {
    get: async id => { calls.push(['get', id]); return { data: record }; },
    desks: async () => ({ data: { items: ['desk_est', 'desk_ouest'] } }),
    validate: async (id, data) => { calls.push(['validate', id, data]); },
    search: async params => { calls.push(['search', params]); return { data: { items: [], count: 0 } }; },
  } };
  const component = load('src/pages/Dashboard/Observations.vue', { '@/services/api': api }).default;
  const context = { ...component.methods, isReviewer: true };
  Object.assign(context, component.data.call(context));
  await context.openValidation({ _id: 'obs1', summary: 'Stale list content' });
  assert.equal(context.observationToValidate, record);
  assert.deepEqual(Array.from(context.targetDesks), ['desk_est']);
  context.targetDesks = ['desk_est', 'desk_ouest'];
  await context.validateObservation();
  const submission = calls.find(call => call[0] === 'validate');
  assert.equal(submission[1], 'obs1');
  assert.equal(submission[2]._seq_no, 4);
  assert.equal(submission[2]._primary_term, 2);
  assert.deepEqual(submission[2].target_desks, ['desk_est', 'desk_ouest']);
  assert.equal(context.validationDialog, false);
  assert.equal(context.validating, false);
  assert.equal(calls.find(call => call[0] === 'search')[1].status, 'pending');
  const countBefore = calls.length;
  context.isReviewer = false;
  await context.openValidation(record);
  await context.validateObservation();
  assert.equal(calls.length, countBefore);
  await context.fetchObservations();
  assert.equal(calls[calls.length - 1][1].status, undefined);
});

test('a stale review stays open and shows the server conflict instead of reporting success', async () => {
  const component = load('src/pages/Dashboard/Observations.vue', { '@/services/api': { observations: {
    validate: async () => { throw { response: { data: { message: 'Cette information a changé' } } }; },
  } } }).default;
  const context = { ...component.methods, isReviewer: true };
  Object.assign(context, component.data.call(context));
  context.validationDialog = true;
  context.observationToValidate = { _id: 'obs1', _seq_no: 4, _primary_term: 1 };
  context.targetDesks = ['desk_est'];
  await context.validateObservation();
  assert.equal(context.validationDialog, true);
  assert.equal(context.snackbar.message, 'Cette information a changé');
  assert.equal(context.snackbar.color, 'error');
  assert.equal(context.validating, false);
});
