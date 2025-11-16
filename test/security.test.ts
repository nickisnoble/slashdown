import { describe, it, expect } from 'vitest';
import { createSlashdown, Slashdown } from '../src/slashdown';

describe('Security - XSS Prevention', () => {
  const sd = createSlashdown();

  it('should escape HTML in text nodes', () => {
    const html = sd`/div = <script>alert('xss')</script>`;
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&lt;/script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('should escape HTML in attribute values', () => {
    const html = sd`/div data-value="<script>alert('xss')</script>"`;
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('should escape quotes in text content', () => {
    const html = sd`/div = "Hello World"`;
    expect(html).toContain('&quot;');
    expect(html).not.toContain('"Hello');
  });

  it('should escape ampersands', () => {
    const html = sd`/div = A & B`;
    expect(html).toContain('&amp;');
  });

  it('should escape single quotes', () => {
    const html = sd`/div = It's working`;
    expect(html).toContain('&#39;');
  });

  it('should escape all special chars together', () => {
    const html = sd`/div = <tag attr="value">Content & 'text'</tag>`;
    expect(html).toContain('&lt;tag');
    expect(html).toContain('&quot;value&quot;');
    expect(html).toContain('&amp;');
    expect(html).toContain('&#39;text&#39;');
  });

  it('should escape class names with special chars', () => {
    const html = sd`/div class="<script>"`;
    expect(html).toContain('&lt;script&gt;');
  });

  it('should escape IDs with special chars', () => {
    const html = sd`/div id="<alert>"`;
    expect(html).toContain('&lt;alert&gt;');
  });
});

describe('Edge Cases - Nesting Depth', () => {
  it('should handle deeply nested structures', () => {
    const instance = new Slashdown({ maxDepth: 10 });
    const deeplyNested = `/div
  /div
    /div
      /div
        /div
          /div
            /div
              /div
                /div
                  /div
                    = Deep`;
    expect(() => instance.process(deeplyNested)).not.toThrow();
  });

  it('should throw error when max depth exceeded', () => {
    const sd = new Slashdown({ maxDepth: 3 });
    const tooDeep = `/div
  /div
    /div
      /div
        = Too deep`;
    expect(() => sd.process(tooDeep)).toThrow(/Maximum nesting depth/);
  });
});

describe('Edge Cases - Empty and Blank Input', () => {
  const sd = createSlashdown();

  it('should handle empty string', () => {
    const html = sd``;
    expect(html).toBe('');
  });

  it('should handle only whitespace', () => {
    const html = sd`

    `;
    expect(html).toBe('');
  });

  it('should handle empty tags', () => {
    const html = sd`/div`;
    expect(html).toBe('<div></div>');
  });
});

describe('Edge Cases - Boolean Attributes', () => {
  const sd = createSlashdown();

  it('should render boolean attribute without value', () => {
    const html = sd`/button disabled`;
    expect(html).toContain('<button disabled>');
    expect(html).not.toContain('disabled="true"');
  });

  it('should handle multiple boolean attributes', () => {
    const html = sd`/input disabled readonly required`;
    expect(html).toContain('disabled');
    expect(html).toContain('readonly');
    expect(html).toContain('required');
    expect(html).not.toContain('="true"');
  });

  it('should handle mixed boolean and string attributes', () => {
    const html = sd`/input type="text" disabled placeholder="Enter text"`;
    expect(html).toContain('type="text"');
    expect(html).toContain('disabled');
    expect(html).toContain('placeholder="Enter text"');
  });
});

describe('Edge Cases - Custom Default Tag', () => {
  it('should use custom default tag', () => {
    const sd = createSlashdown({ defaultTag: 'section' });
    const html = sd`/ .container`;
    expect(html).toContain('<section');
    expect(html).not.toContain('<div');
  });

  it('should use div as default when not specified', () => {
    const sd = createSlashdown();
    const html = sd`/ .container`;
    expect(html).toContain('<div');
  });
});

describe('Edge Cases - Special Characters in Content', () => {
  const sd = createSlashdown();

  it('should handle unicode characters', () => {
    const html = sd`/div = 你好 世界 🚀`;
    expect(html).toContain('你好');
    expect(html).toContain('🚀');
  });

  it('should handle newlines in markdown', () => {
    const instance = new Slashdown();
    const html = instance.process('Line 1\nLine 2\nLine 3');
    expect(html).toContain('Line 1');
    expect(html).toContain('Line 2');
    expect(html).toContain('Line 3');
  });
});

describe('Edge Cases - Error Handling', () => {
  it('should provide helpful error for unexpected token', () => {
    const sd = new Slashdown();
    // This would create an invalid parse state
    sd.tokens = [{ type: 'Class', content: 'foo', indent: 0 }];
    expect(() => sd.parse()).toThrow(/Unexpected root level token/);
  });
});

describe('Attribute Rendering Bug Fix', () => {
  const sd = createSlashdown();

  it('should actually render custom attributes (bug fix)', () => {
    const html = sd`/div custom-attr="test"`;
    expect(html).toContain('custom-attr="test"');
  });

  it('should render HTMX attributes', () => {
    const html = sd`/button hx-get="/api/data" hx-trigger="click"`;
    expect(html).toContain('hx-get="/api/data"');
    expect(html).toContain('hx-trigger="click"');
  });

  it('should render data attributes', () => {
    const html = sd`/div data-id="123" data-name="test"`;
    expect(html).toContain('data-id="123"');
    expect(html).toContain('data-name="test"');
  });
});
