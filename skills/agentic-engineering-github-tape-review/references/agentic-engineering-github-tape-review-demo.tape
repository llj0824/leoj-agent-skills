Output skills/agentic-engineering-github-tape-review/references/agentic-engineering-github-tape-review-demo.gif

Require bash
Require codex
Require gh
Require npx

Set Shell "bash"
Set Theme "GitHub Dark"
Set FontSize 24
Set Width 1540
Set Height 900
Set Padding 24
Set BorderRadius 18
Set WindowBar Colorful
Set Framerate 24
Set PlaybackSpeed 1.35
Set TypingSpeed 12ms

Hide
Type "export PS1='$ '"
Enter
Type "rm -rf /tmp/skills-github-tape-review-demo && mkdir -p /tmp/skills-github-tape-review-demo && cd /tmp/skills-github-tape-review-demo"
Enter
Type "printf '%s\\n' '$agentic-engineering-github-tape-review' 'Review my recent GitHub activity for repo your-username/your-agent-skills only.' 'Output only: 1 topline sentence and 2 bullets for patterns.' > prompt.txt"
Enter
Show

Type "pwd"
Enter
Sleep 1s

Type "npx skills add your-username/your-agent-skills --skill agentic-engineering-github-tape-review -a codex -y"
Enter
Sleep 1s

Type "cat prompt.txt"
Enter
Sleep 2s

Type "codex exec --skip-git-repo-check --sandbox danger-full-access --color never - < prompt.txt"
Enter
Sleep 11s
Ctrl+C
Sleep 2s
