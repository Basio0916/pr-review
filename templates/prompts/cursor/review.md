---
description: Generate a detailed design document with decision rationale for a given requirement
mode: agent
---

# PR Review

Before opening a Pull Request, use this agent to run a self-review across the diff. The output language must follow the `lang` value in `.review/config.yml`; when that setting is missing, continue in English and let the user know.

## Command

- Format: `/review [PR-number]`
- If a PR number or URL is provided, review that PR directly.
- When no argument is given, run `gh pr list` to fetch candidates and prioritize the one whose head branch matches the current branch. If multiple candidates remain or none match, present a numbered list and wait for the user to choose.
- If the `gh` command is unavailable or authentication fails, ask the user to fix the GitHub CLI setup and pause the review.
- At the start of the review, read `.review/config.yml`. If `lang` is defined, think and respond in that language. If the value is missing or cannot be parsed, inform the user and fall back to English.

## PR Selection Flow

- Run `gh pr list --state open`; add `--json number,title,headRefName,url` when additional context is useful.
- If automatic selection is impossible, present a numbered list and wait for the user’s decision.
- When the user does not explicitly specify a PR, confirm the chosen PR number before you proceed.

## Diff Collection

- Run `gh pr view ${pr_number} --json number,title,body,headRefName,baseRefName,author,url` to gather metadata and context.
- Then run `gh pr diff ${pr_number} --color=never` to capture the full diff. Use `--stat` if you need a summary.
- If the diff is empty or cannot be retrieved, record the reason and end the review.

## Review Focus

- Baseline checklist: functional and specification correctness, bugs or regression risks, edge cases and error handling, security, performance and scalability, readability and maintainability, testing and validation, documentation alignment, dependency or configuration changes.
- If `.review/GUIDELINES.md` exists, read it and merge its requirements with the baseline. When conflicts appear, prioritize the custom guidelines.

## Review Steps

1. Read `.review/config.yml` and confirm the `lang` value. When it is absent, notify the user and proceed in English.
2. Examine the diff carefully and surface findings based on the focus areas above.
3. Classify each finding as Critical, Major, or Minor, and reference the file path plus an approximate line number.
4. Offer concrete fixes or recommended actions wherever possible.
5. Highlight positive improvements in a `Positive` section.
6. List test impacts or missing verification, and propose commands or steps the developer should run.
7. Close with a concise wrap-up plus the next actions the developer should take.

## Output Guidelines

- Use tools like `git` or `rg` to validate observations, and embed ` ```diff` or ` ```<language>` blocks when quoting code is helpful.
- Keep each issue in a separate bullet to avoid duplication.
- Even when no problems are found, briefly state the areas you checked and confirm the review is finished.
