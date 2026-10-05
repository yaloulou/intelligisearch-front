const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');
const compiler = require('vue-template-compiler');
const Vue = require('vue');

function component(api, refs = []) {
  const source = fs.readFileSync(path.join(__dirname, '../src/components/Evidence/EvidenceAttachments.vue'), 'utf8');
  const script = compiler.parseComponent(source).script.content;
  const code = babel.transformSync(script, { configFile: false, babelrc: false, plugins: ['@babel/plugin-transform-modules-commonjs'] }).code;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: () => ({ __esModule: true, default: api }) });
  const instance = new Vue({ ...module.exports.default, propsData: { value: refs, context: 'events' } });
  instance.$on('input', value => { instance.value = value; });
  return instance;
}
const file = (name, size = 10) => ({ name, size, lastModified: 1 });
const api = upload => ({ evidence: { get: async id => ({ data: { title: id } }), upload } });

test('accumulates selections, rejects duplicates and unsupported files, and enforces the size limit', async () => {
  const instance = component(api());
  instance.addFiles([file('image.jpg'), file('recording.mp3')]);
  await Vue.nextTick();
  instance.addFiles([file('image.jpg'), file('clip.mp4'), file('report.docx')]);
  assert.equal(instance.pending.length, 4);
  instance.addFiles([file('active.html')]);
  assert.match(instance.error, /Format non accepté/);
  instance.addFiles([file('large.mp4', 100 * 1024 * 1024 + 1)]);
  assert.match(instance.error, /100 Mo/);
  instance.removePending(instance.pending[0].key);
  assert.equal(instance.pending.length, 3);
  instance.$destroy();
});

test('a retry retains successful uploads and existing references and sends only pending files', async () => {
  const sent = [];
  let fail = true;
  const instance = component(api(async selected => {
    sent.push(selected.name);
    if (selected.name === 'clip.mp4' && fail) throw new Error('Connection lost');
    return { data: { evidence: { doc_id: selected.name, type: 'video' }, document: { title: selected.name } } };
  }), [{ doc_id: 'existing', type: 'document' }]);
  instance.addFiles([file('image.jpg'), file('clip.mp4')]);
  await assert.rejects(instance.uploadPending(), /Connection lost/);
  assert.equal(instance.value.length, 2);
  assert.equal(instance.pending.length, 1);
  assert.equal(instance.uploading, false);
  fail = false;
  const refs = await instance.uploadPending();
  assert.equal(refs.length, 3);
  assert.deepEqual(sent, ['image.jpg', 'clip.mp4', 'clip.mp4']);
  assert.equal(instance.pending.length, 0);
  await instance.uploadPending(); // Retrying the record save must not upload again.
  assert.equal(sent.length, 3);
  instance.removeRef('existing');
  assert.equal(instance.value.length, 2);
  instance.$destroy();
});

test('existing and pending files share the same maximum of twenty attachments', () => {
  const instance = component(api(), Array.from({ length: 19 }, (_, i) => ({ doc_id: String(i) })));
  instance.addFiles([file('one.pdf'), file('two.pdf')]);
  assert.equal(instance.pending.length, 1);
  assert.match(instance.error, /20/);
  instance.$destroy();
});
