import { describe, expect, it } from 'vitest';
import { mathIssues, parseArticle, speakCode, speakLatex, speakMathML } from '../../src/narration';

describe('LaTeX narration', () => {
  it('speaks fractions, roots, scripts, and Greek symbols deterministically', () => {
    expect(speakLatex('\\frac{-b + \\sqrt{b^2 - 4ac}}{2a}')).toBe(
      'fraction with numerator minus b plus square root of b squared minus 4 a c; end root, and denominator 2 a; end fraction',
    );
    expect(speakLatex('E = mc^2')).toBe('E equals m c squared');
  });

  it('speaks sum limits explicitly', () => {
    expect(speakLatex('\\sum_{i=1}^{n} i')).toContain('sum from i equals 1 to n');
  });

  it.each([
    ['x^2 + y^2 = r^2', 'x squared plus y squared equals r squared'],
    ['\\sqrt{x + 1}', 'square root of x plus 1; end root'],
    ['\\frac{dy}{dx}', 'fraction with numerator d y, and denominator d x; end fraction'],
    ['\\sum_{i=1}^{n} i', 'sum from i equals 1 to n'],
    ['\\int_0^1 x \\, dx', 'integral from 0 to 1 x d x'],
    ['\\lim_{x \\to 0} x', 'limit from x approaches 0 x'],
    ['\\alpha + \\beta = \\gamma', 'alpha plus beta equals gamma'],
    ['a \\leq b', 'a is less than or equal to b'],
    ['x \\in \\mathbb{R}', 'x is in R'],
    ['\\begin{pmatrix}a & b \\\\ c & d\\end{pmatrix}', 'matrix with 2 rows: row 1, a, b; row 2, c, d; end matrix'],
  ])('covers representative equation %s', (latex, phrase) => {
    expect(speakLatex(latex)).toContain(phrase);
  });

  it('flags meanings that require author judgment', () => {
    const issues = mathIssues('|x| + 2y');
    expect(issues).toContain('Confirm whether each vertical bar means absolute value, “such that,” divides, or a norm.');
    expect(issues).toContain('Confirm the implicit multiplication is clear to a listener.');
  });
});

describe('MathML narration', () => {
  it('reads semantic fraction structure without rendering HTML', () => {
    const spoken = speakMathML('<math><mfrac><mi>a</mi><mi>b</mi></mfrac></math>');
    expect(spoken).toBe('fraction with numerator a, and denominator b; end fraction');
  });

  it('returns a review prompt for malformed MathML', () => {
    expect(speakMathML('<math><mi>x</math>')).toContain('could not be parsed');
  });
});

describe('whole-article parsing', () => {
  it('keeps article order across prose, math, code, table, and figure', () => {
    const source = `# A section

Area is $A = \\pi r^2$.

\`\`\`js
const area = pi * r * r;
\`\`\`

| Name | Value |
| --- | --- |
| radius | 2 |

![Circle with radius r](circle.png)`;
    const segments = parseArticle(source);
    expect(segments.map((segment) => segment.type)).toEqual(['heading', 'prose', 'equation', 'code', 'table', 'figure']);
    expect(segments[2].narration).toContain('A equals pi r squared');
    expect(segments[4].narration).toContain('2 columns and 1 data row');
  });

  it('removes display-math fences from the proposed speech', () => {
    const equation = parseArticle('$$\nE = mc^2\n$$')[0];
    expect(equation.narration).toBe('Equation: E equals m c squared.');
  });

  it('does not interpret arbitrary HTML as executable content', () => {
    const [segment] = parseArticle('<img src=x onerror="alert(1)">');
    expect(segment.type).toBe('prose');
    expect(segment.narration).toContain('onerror');
  });
});

describe('code narration', () => {
  it('chunks code by numbered lines and expands symbols', () => {
    expect(speakCode('total += 1;\nreturn total;', 'js')).toContain('Code block in js, 2 lines. Line 1: total plus equals 1 semicolon.');
  });
});
