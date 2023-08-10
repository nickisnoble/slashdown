import { expect, test } from 'vitest'
import { lex } from '../src/lexer'

test('it works', () => {
  const src = "Hello\nworld";
  expect(lex(src)).toBeInstanceOf(Array)
  expect(lex(src)).toHaveLength(2)
})