import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import ts from 'typescript';

test('App-authored JSX text and labels use locale expressions', () => {
  const files = ['App.tsx', ...['app', 'src/components'].flatMap(dir =>
    readdirSync(new URL(`../${dir}/`, import.meta.url)).filter(f => f.endsWith('.tsx')).map(f => `${dir}/${f}`))];
  for (const file of files) {
    const source = ts.createSourceFile(file, readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const visit = node => {
      if (ts.isJsxText(node)) assert.equal(node.text.trim(), '', `${file}: literal JSX text`);
      if (ts.isJsxAttribute(node) && ['title', 'label', 'placeholder', 'accessibilityLabel'].includes(node.name.getText(source))) {
        assert.ok(!node.initializer || !ts.isStringLiteral(node.initializer), `${file}: literal UI attribute`);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
});
