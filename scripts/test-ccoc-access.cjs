const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');
const compiler = require('vue-template-compiler');

function load(relativePath, dependencies = {}, globals = {}) {
  let source = fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
  if (relativePath.endsWith('.vue')) source = compiler.parseComponent(source).script.content;
  const code = babel.transformSync(source, { configFile: false, babelrc: false, plugins: ['@babel/plugin-transform-modules-commonjs'] }).code;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: name => dependencies[name] || {}, ...globals });
  return module.exports;
}

const access = load('src/services/access.js');
const sidebar = load('src/components/Sidebar/Sidebar.vue', { vuex: { mapActions: () => ({}), mapState: () => ({}) } }).default;
const users = [
  [{ role: 'admin', desk: '' }, true],
  [{ role: 'admin', desk: 'desk_est' }, true],
  [{ role: 'analyste', desk: 'CCOC' }, true],
  [{ role: 'analyste', desk: ' ccoc ' }, true],
  [{ role: 'analyste', desk: 'desk_est' }, false],
  [{ role: 'analyste', desk: '' }, false],
  [{ role: 'analyste', desk: 'CCOC_EST' }, false],
  ...['officier', 'conseiller', 'coordinateur'].map(role => [{ role, desk: 'CCOC' }, false]),
  [null, false],
];

test('both CCOC menus are visible only for admins and CCOC analysts', () => {
  for (const [user, allowed] of users) {
    assert.equal(access.canAccessCcoc(user), allowed, JSON.stringify(user));
    const items = sidebar.computed.filteredItems.call({
      userRole: user?.role, items: sidebar.data().items,
      $store: { getters: { 'auth/canAccessCcoc': access.canAccessCcoc(user) } },
    });
    for (const title of ['Enregistrer CCOC', 'Rechercher CCOC']) {
      assert.equal(items.some(item => item.title === title), allowed, `${JSON.stringify(user)}: ${title}`);
    }
    assert.equal(items.some(item => item.title === 'Informations'), true);
    assert.equal(access.homePath(user), allowed ? '/dashboard' : '/observations');
  }
});

test('the real router denies direct CCOC navigation and redirects login to an allowed page', () => {
  let currentUser;
  let token = 'test-token';
  class Router {
    constructor(options) { this.options = options; }
    beforeEach(guard) { this.guard = guard; }
  }
  const router = load('src/Routes.js', {
    vue: { use: () => {} }, 'vue-router': Router,
    './mixins/auth': { getTokenPayload: () => currentUser }, '@/services/access': access,
  }, { localStorage: { getItem: () => token } }).default;
  const routes = router.options.routes.flatMap(route => route.children || []);
  const check = target => {
    let result;
    const route = routes.find(item => item.path === target);
    router.guard({ path: target, fullPath: target, matched: route ? [route] : [], meta: route?.meta || {} }, {}, value => { result = value; });
    return result;
  };
  for (const [user, allowed] of users) {
    currentUser = user;
    for (const target of ['/dashboard', '/search', '/incident/:id', '/board']) {
      const result = check(target);
      assert.equal(result?.path, allowed ? undefined : '/403', `${JSON.stringify(user)}: ${target}`);
    }
    assert.equal(check('/observations'), undefined);
    assert.equal(check('/login').path, allowed ? '/dashboard' : '/observations');
  }
  token = null;
  assert.equal(check('/search').path, '/login');
});
