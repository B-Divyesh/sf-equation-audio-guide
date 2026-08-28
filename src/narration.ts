import type { GuideSegment, ReviewIssue, SegmentType } from './types';

const greek: Record<string, string> = {
  alpha: 'alpha', beta: 'beta', gamma: 'gamma', delta: 'delta', epsilon: 'epsilon',
  zeta: 'zeta', eta: 'eta', theta: 'theta', iota: 'iota', kappa: 'kappa',
  lambda: 'lambda', mu: 'mu', nu: 'nu', xi: 'xi', omicron: 'omicron', pi: 'pi',
  rho: 'rho', sigma: 'sigma', tau: 'tau', upsilon: 'upsilon', phi: 'phi',
  chi: 'chi', psi: 'psi', omega: 'omega', Gamma: 'capital gamma', Delta: 'capital delta',
  Theta: 'capital theta', Lambda: 'capital lambda', Xi: 'capital xi', Pi: 'capital pi',
  Sigma: 'capital sigma', Phi: 'capital phi', Psi: 'capital psi', Omega: 'capital omega',
};

const commands: Record<string, string> = {
  cdot: 'times', times: 'times', div: 'divided by', pm: 'plus or minus', mp: 'minus or plus',
  le: 'is less than or equal to', leq: 'is less than or equal to', ge: 'is greater than or equal to',
  geq: 'is greater than or equal to', neq: 'is not equal to', approx: 'is approximately equal to',
  infty: 'infinity', partial: 'partial', nabla: 'nabla', in: 'is in', notin: 'is not in',
  subset: 'is a subset of', subseteq: 'is a subset of or equal to', cup: 'union', cap: 'intersection',
  to: 'approaches', rightarrow: 'maps to', implies: 'implies', iff: 'if and only if',
  sin: 'sine', cos: 'cosine', tan: 'tangent', log: 'log', ln: 'natural log', exp: 'exponential',
  min: 'minimum', max: 'maximum', det: 'determinant', dots: 'and so on', ldots: 'and so on',
  quad: '', qquad: '', colon: 'colon',
};

const operatorWords: Record<string, string> = {
  '+': 'plus', '-': 'minus', '=': 'equals', '<': 'is less than', '>': 'is greater than',
  '/': 'divided by', '*': 'times', '(': 'open parenthesis', ')': 'close parenthesis',
  '[': 'open bracket', ']': 'close bracket', '{': 'open brace', '}': 'close brace',
  ',': 'comma', ':': 'colon', ';': 'semicolon', '|': 'vertical bar', '!': 'factorial',
};

function cleanSpeech(value: string): string {
  return value.replace(/\s+/g, ' ').replace(/\s+([,.;])/g, '$1').trim();
}

function readGroup(input: string, start: number): { value: string; end: number } | null {
  if (input[start] !== '{') return null;
  let depth = 0;
  for (let index = start; index < input.length; index += 1) {
    if (input[index] === '{') depth += 1;
    if (input[index] === '}') depth -= 1;
    if (depth === 0) return { value: input.slice(start + 1, index), end: index + 1 };
  }
  return null;
}

function readScript(input: string, start: number): { value: string; end: number } {
  const group = readGroup(input, start);
  if (group) return group;
  return { value: input[start] ?? '', end: start + 1 };
}

export function speakLatex(raw: string): string {
  const input = raw
    .replace(/^\s*(\$\$?|\\\[|\\\()|((\$\$?|\\\]|\\\))\s*$)/g, '')
    .replace(/\\begin\{(?:b?matrix|pmatrix|vmatrix)\}([\s\S]*?)\\end\{(?:b?matrix|pmatrix|vmatrix)\}/g, (_match, body: string) => {
      const rows = body.split(/\\\\/).map((row) => row.split('&').map((cell) => speakLatex(cell)));
      return ` \\text{matrix with ${rows.length} rows: ${rows.map((row, index) => `row ${index + 1}, ${row.join(', ')}`).join('; ')}; end matrix} `;
    });
  const words: string[] = [];
  let index = 0;

  while (index < input.length) {
    const character = input[index];
    if (/\s/.test(character)) { index += 1; continue; }
    if (character === '\\') {
      const match = input.slice(index + 1).match(/^[A-Za-z]+/);
      if (!match) { index += 2; continue; }
      const name = match[0];
      index += name.length + 1;
      if (name === 'left' || name === 'right') continue;
      if (name === 'frac') {
        const numerator = readGroup(input, index);
        const denominator = numerator ? readGroup(input, numerator.end) : null;
        if (numerator && denominator) {
          words.push(`fraction with numerator ${speakLatex(numerator.value)}, and denominator ${speakLatex(denominator.value)}; end fraction`);
          index = denominator.end;
          continue;
        }
      }
      if (name === 'sqrt') {
        let degree = '';
        if (input[index] === '[') {
          const close = input.indexOf(']', index);
          if (close > index) { degree = speakLatex(input.slice(index + 1, close)); index = close + 1; }
        }
        const radicand = readGroup(input, index);
        if (radicand) {
          words.push(`${degree ? `${degree} root` : 'square root'} of ${speakLatex(radicand.value)}; end root`);
          index = radicand.end;
          continue;
        }
      }
      if (['text', 'mathrm', 'mathbf', 'mathit', 'mathbb', 'operatorname'].includes(name)) {
        const text = readGroup(input, index);
        if (text) { words.push(text.value); index = text.end; continue; }
      }
      if (['sum', 'prod', 'int', 'lim'].includes(name)) {
        const base = { sum: 'sum', prod: 'product', int: 'integral', lim: 'limit' }[name];
        let lower = '';
        let upper = '';
        if (input[index] === '_') { const part = readScript(input, index + 1); lower = speakLatex(part.value); index = part.end; }
        if (input[index] === '^') { const part = readScript(input, index + 1); upper = speakLatex(part.value); index = part.end; }
        words.push(`${base}${lower ? ` from ${lower}` : ''}${upper ? ` to ${upper}` : ''}`);
        continue;
      }
      words.push(greek[name] ?? commands[name] ?? name.replace(/([a-z])([A-Z])/g, '$1 $2'));
      continue;
    }
    if (character === '^' || character === '_') {
      const script = readScript(input, index + 1);
      const spoken = speakLatex(script.value);
      if (character === '^') words.push(spoken === '2' ? 'squared' : spoken === '3' ? 'cubed' : `to the power of ${spoken}`);
      else words.push(`sub ${spoken}`);
      index = script.end;
      continue;
    }
    if (/\d/.test(character)) {
      const number = input.slice(index).match(/^\d+(?:\.\d+)?/)?.[0] ?? character;
      words.push(number);
      index += number.length;
      continue;
    }
    if (/[A-Za-z]/.test(character)) {
      const knownFunction = input.slice(index).match(/^(sin|cos|tan|log|ln|exp|min|max)(?=[^A-Za-z]|$)/)?.[0];
      if (knownFunction) { words.push(commands[knownFunction]); index += knownFunction.length; }
      else { words.push(character); index += 1; }
      continue;
    }
    words.push(operatorWords[character] ?? character);
    index += 1;
  }
  return cleanSpeech(words.join(' '));
}

function mathNodeSpeech(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return speakLatex(node.textContent ?? '');
  const element = node as Element;
  const children = Array.from(element.childNodes).map(mathNodeSpeech).filter(Boolean);
  switch (element.localName) {
    case 'math': case 'mrow': case 'semantics': return children.join(' ');
    case 'mfrac': return `fraction with numerator ${children[0] ?? ''}, and denominator ${children[1] ?? ''}; end fraction`;
    case 'msqrt': return `square root of ${children.join(' ')}; end root`;
    case 'mroot': return `${children[1] ?? ''} root of ${children[0] ?? ''}; end root`;
    case 'msup': return `${children[0] ?? ''} to the power of ${children[1] ?? ''}`;
    case 'msub': return `${children[0] ?? ''} sub ${children[1] ?? ''}`;
    case 'msubsup': return `${children[0] ?? ''} sub ${children[1] ?? ''} to the power of ${children[2] ?? ''}`;
    case 'annotation': return '';
    default: return children.join(' ');
  }
}

export function speakMathML(source: string): string {
  const document = new DOMParser().parseFromString(source, 'application/xml');
  if (document.querySelector('parsererror')) return 'Math expression. The MathML could not be parsed; write the intended reading.';
  return cleanSpeech(mathNodeSpeech(document.documentElement));
}

export function mathIssues(source: string): string[] {
  const issues: string[] = [];
  if (/\|/.test(source) || /\\vert|\\mid/.test(source)) issues.push('Confirm whether each vertical bar means absolute value, “such that,” divides, or a norm.');
  if (/(^|[=(])\s*-\s*[A-Za-z0-9\\]/.test(source)) issues.push('Confirm that the leading minus is read as “negative,” not subtraction.');
  if (/\d\s*[A-Za-z(]|\}\s*[A-Za-z(]/.test(source)) issues.push('Confirm the implicit multiplication is clear to a listener.');
  if (/\\(?:pm|mp)\b/.test(source)) issues.push('Choose whether the paired signs should be explained together.');
  if (/\\begin\{(?:b?matrix|pmatrix|vmatrix)\}/.test(source)) issues.push('Confirm the row-by-row matrix reading order.');
  if (/[^\\]\//.test(source)) issues.push('Confirm the intended grouping around the slash.');
  const supported = new Set([...Object.keys(greek), ...Object.keys(commands), 'frac', 'sqrt', 'text', 'mathrm', 'mathbf', 'mathit', 'mathbb', 'operatorname', 'sum', 'prod', 'int', 'lim', 'left', 'right', 'begin', 'end']);
  const unknown = Array.from(source.matchAll(/\\([A-Za-z]+)/g), (match) => match[1]).filter((name) => !supported.has(name));
  if (unknown.length) issues.push(`Check the reading of unsupported command${unknown.length > 1 ? 's' : ''}: ${Array.from(new Set(unknown)).join(', ')}.`);
  return issues;
}

const codeSymbols: Array<[RegExp, string]> = [
  [/===/g, ' strictly equals '], [/!==/g, ' strictly does not equal '], [/=>/g, ' arrow '],
  [/==/g, ' equals '], [/!=/g, ' does not equal '], [/>=/g, ' greater than or equal to '],
  [/<=/g, ' less than or equal to '], [/\+\+/g, ' increment '], [/--/g, ' decrement '],
  [/&&/g, ' and '], [/\|\|/g, ' or '], [/=/g, ' equals '], [/\+/g, ' plus '],
  [/-/g, ' minus '], [/\*/g, ' times '], [/\//g, ' slash '], [/%/g, ' percent '],
  [/\(/g, ' open parenthesis '], [/\)/g, ' close parenthesis '], [/\{/g, ' open brace '],
  [/\}/g, ' close brace '], [/\[/g, ' open bracket '], [/\]/g, ' close bracket '],
  [/:/g, ' colon '], [/;/g, ' semicolon '], [/,/g, ' comma '], [/\./g, ' dot '],
];

function speakCodeLine(line: string): string {
  if (!line.trim()) return 'blank line';
  const indentation = line.match(/^\s*/)?.[0].replace(/\t/g, '  ').length ?? 0;
  let speech = line.trim().replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/_/g, ' underscore ');
  for (const [symbol, word] of codeSymbols) speech = speech.replace(symbol, word);
  return cleanSpeech(`${indentation ? `indented ${indentation} spaces, ` : ''}${speech}`);
}

export function speakCode(source: string, language = ''): string {
  const lines = source.replace(/\n$/, '').split('\n');
  return cleanSpeech(`Code block${language ? ` in ${language}` : ''}, ${lines.length} ${lines.length === 1 ? 'line' : 'lines'}. ${lines.map((line, index) => `Line ${index + 1}: ${speakCodeLine(line)}.`).join(' ')}`);
}

function makeIssues(id: string, entries: string[]): ReviewIssue[] {
  return entries.map((text, index) => ({ id: `${id}-issue-${index}`, text, checked: false }));
}

function makeSegment(type: SegmentType, source: string, narration: string, entries: string[], index: number): GuideSegment {
  const id = `segment-${index + 1}`;
  const labels: Record<SegmentType, string> = { prose: 'Prose', heading: 'Section heading', equation: 'Equation', code: 'Code', table: 'Table', figure: 'Figure' };
  return { id, type, label: labels[type], source, narration, suggestedNarration: narration, issues: makeIssues(id, entries), status: 'needs-review' };
}

function splitInline(source: string): Array<{ type: SegmentType; source: string; meta?: string }> {
  const pattern = /(!\[([^\]]*)\]\([^)]+\)|`([^`\n]+)`|\$([^$\n]+)\$|\\\((.*?)\\\))/g;
  const parts: Array<{ type: SegmentType; source: string; meta?: string }> = [];
  let cursor = 0;
  for (const match of source.matchAll(pattern)) {
    const position = match.index ?? 0;
    const before = source.slice(cursor, position).trim();
    if (position > cursor && /[\p{L}\p{N}]/u.test(before)) parts.push({ type: 'prose', source: before });
    if (match[1].startsWith('![')) parts.push({ type: 'figure', source: match[1], meta: match[2] });
    else if (match[1].startsWith('`')) parts.push({ type: 'code', source: match[3], meta: 'inline' });
    else parts.push({ type: 'equation', source: match[4] ?? match[5] ?? match[1] });
    cursor = position + match[1].length;
  }
  const after = source.slice(cursor).trim();
  if (cursor < source.length && /[\p{L}\p{N}]/u.test(after)) parts.push({ type: 'prose', source: after });
  return parts.length ? parts : [{ type: 'prose', source: source.trim() }];
}

function isTableStart(lines: string[], index: number): boolean {
  return Boolean(lines[index]?.includes('|') && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1] ?? ''));
}

export function parseArticle(raw: string): GuideSegment[] {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const parts: Array<{ type: SegmentType; source: string; meta?: string }> = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }
    if (/^\s*```/.test(line)) {
      const language = line.trim().slice(3).trim();
      const collected: string[] = [];
      index += 1;
      while (index < lines.length && !/^\s*```/.test(lines[index])) { collected.push(lines[index]); index += 1; }
      if (index < lines.length) index += 1;
      parts.push({ type: 'code', source: collected.join('\n'), meta: language });
      continue;
    }
    if (/^\s*\$\$/.test(line) || /^\s*\\\[/.test(line)) {
      const dollar = /^\s*\$\$/.test(line);
      const close = dollar ? '$$' : '\\]';
      const collected = [line];
      if (!(line.trim().length > 2 && line.trim().endsWith(close))) {
        index += 1;
        while (index < lines.length) { collected.push(lines[index]); if (lines[index].includes(close)) { index += 1; break; } index += 1; }
      } else index += 1;
      parts.push({ type: 'equation', source: collected.join('\n') });
      continue;
    }
    if (/^\s*<math(?:\s|>)/i.test(line)) {
      const collected = [line];
      index += 1;
      while (!collected.join('\n').includes('</math>') && index < lines.length) { collected.push(lines[index]); index += 1; }
      parts.push({ type: 'equation', source: collected.join('\n'), meta: 'mathml' });
      continue;
    }
    if (isTableStart(lines, index)) {
      const collected = [line, lines[index + 1]];
      index += 2;
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) { collected.push(lines[index]); index += 1; }
      parts.push({ type: 'table', source: collected.join('\n') });
      continue;
    }
    const collected = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^\s*```|^\s*\$\$|^\s*\\\[|^\s*<math(?:\s|>)/i.test(lines[index]) && !isTableStart(lines, index)) {
      collected.push(lines[index]); index += 1;
    }
    const paragraph = collected.join('\n').trim();
    if (/^#{1,6}\s+/.test(paragraph) && !paragraph.includes('\n')) parts.push({ type: 'heading', source: paragraph.replace(/^#{1,6}\s+/, '') });
    else parts.push(...splitInline(paragraph));
  }

  return parts.filter((part) => part.source.trim()).map((part, partIndex) => {
    if (part.type === 'equation') {
      const mathml = part.meta === 'mathml' || /^\s*<math/i.test(part.source);
      const narration = mathml ? speakMathML(part.source) : speakLatex(part.source);
      return makeSegment('equation', part.source, `Equation: ${narration}.`, mathIssues(part.source), partIndex);
    }
    if (part.type === 'code') {
      const narration = part.meta === 'inline' ? `Inline code: ${speakCodeLine(part.source)}.` : speakCode(part.source, part.meta);
      const entries = part.source.split('\n').length > 10 ? ['Decide whether listeners need every line or a shorter purpose-first summary.'] : [];
      return makeSegment('code', part.source, narration, entries, partIndex);
    }
    if (part.type === 'table') {
      const rows = part.source.split('\n').filter((_, rowIndex) => rowIndex !== 1).map((row) => row.split('|').map((cell) => cell.trim()).filter(Boolean));
      const headings = rows[0] ?? [];
      const dataRows = rows.slice(1);
      const narration = `Table with ${headings.length} columns and ${dataRows.length} data ${dataRows.length === 1 ? 'row' : 'rows'}. Column headings: ${headings.join(', ')}. Add the comparison or trend listeners should notice.`;
      return makeSegment('table', part.source, narration, ['Write a purpose-first summary instead of reading every cell.', 'Confirm the row and column counts after editing the article.'], partIndex);
    }
    if (part.type === 'figure') {
      const alt = part.meta?.trim() ?? '';
      const narration = alt ? `Figure: ${alt}. Add the relationship or detail that matters here.` : 'Figure without alternative text. Add what the figure shows and why it matters.';
      return makeSegment('figure', part.source, narration, [alt ? 'Confirm the figure description explains its purpose, not only its appearance.' : 'Add meaningful alternative text before publishing.'], partIndex);
    }
    if (part.type === 'heading') return makeSegment('heading', part.source, `Section: ${part.source}.`, [], partIndex);
    return makeSegment('prose', part.source, part.source.replace(/\s*\n\s*/g, ' '), [], partIndex);
  });
}
