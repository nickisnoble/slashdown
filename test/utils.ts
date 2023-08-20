export function indentLevel( line: string ) {
  const match = line.match(/^\s*/);
  return match ? match[0].length : 0;
}

export function dedent(strings: TemplateStringsArray, ...values: any[]) {
  const fullString = strings.reduce((result, string, i) => (
    result + string + (values[i] || '')
  ), '').replace(/^\n+|\n+$/g, ''); // remove leading or trailing newlines

  const lines = fullString.split('\n');
  const firstLineIndent = indentLevel(lines[0]);

  return lines.map(line => line.slice(firstLineIndent)).join('\n');
}
