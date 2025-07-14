import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { CASE_MODIFIERS } from '../core/templateUtils';
import { buildVarsObject } from '../core/vars';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});

suite('Template Variable Modifiers', () => {
  const input = 'my super-name';

  test('CASE_MODIFIERS map covers all', () => {
    for (const [mod, fn] of Object.entries(CASE_MODIFIERS)) {
      assert.strictEqual(typeof fn(input), 'string');
    }
  });
  test('buildVarsObject generates all keys', () => {
    const vars = buildVarsObject({ name: input });
    assert.strictEqual(vars['name'], input);
    assert.strictEqual(vars['name.pascalCase'], 'MySuperName');
    assert.strictEqual(vars['name.camelCase'], 'mySuperName');
    assert.strictEqual(vars['name.snakeCase'], 'my_super_name');
    assert.strictEqual(vars['name.kebabCase'], 'my-super-name');
    assert.strictEqual(vars['name.screamingSnakeCase'], 'MY_SUPER_NAME');
    assert.strictEqual(vars['name.upperCase'], 'My super-name');
    assert.strictEqual(vars['name.lowerCase'], 'my super-name');
    assert.strictEqual(vars['name.upperCaseAll'], 'MYSUPERNAME');
    assert.strictEqual(vars['name.lowerCaseAll'], 'mysupername');
  });
});
