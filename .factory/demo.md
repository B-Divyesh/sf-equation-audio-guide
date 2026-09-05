# Demo sandbox

## Open the demo

Open <https://equation-audio-guide.sociobot.in/demo>. The landing-page action
**Try it with sample data** opens the same URL in one click.

The demo starts with a realistic gradient-descent article. It includes prose, a
display equation, inline math, Python code, a Markdown table, and a figure
description. It immediately builds nine editable review segments with three
proofing checks.

## Storage isolation

Demo data uses the `demo:equation-audio-guide:v1` and
`demo:equation-audio-guide:v1:draft` local-storage keys. Real work uses the
separate `equation-audio-guide:v1` keys. Demo mode never reads, writes, or
deletes the real keys.

The persistent banner says **Demo — sample data, nothing is saved**. Use
**Reset demo** to restore the shipped sample. Use **Start for real** to discard
the demo namespace and open the regular editor. The regular editor does not
receive a copy of demo changes.

## Verification entry point

Every browser claim starts from `/demo` in a fresh context. The commands are
listed in [claims.json](claims.json).
