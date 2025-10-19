[English](README.md) | [日本語](README.ja.md)

# pr-review

A tool for reviewing GitHub pull requests using AI agents. It adds a `/review` command to AI agents, automating detailed pull request reviews.

Currently supports **GitHub Copilot** and **Cursor**. You can specify which AI agent to install prompts for using command-line options.

## Features

- Automatically fetches and reviews pull request diffs
- Multi-faceted analysis covering code quality, bugs, security, performance, and more
- Support for Japanese and English review outputs
- Customizable review guidelines

## Installation

Run the following command from the root directory of your repository:

```bash
# Install for GitHub Copilot (default)
npx pr-review

# Install for Cursor
npx pr-review --cursor

# Specify language
npx pr-review --copilot --lang ja
```

This command will add the `.review` directory and prompt templates to your project.

## Usage with GitHub Copilot

### Prerequisites

- GitHub CLI (`gh`) must be installed and authenticated
- GitHub Copilot must be installed in VS Code
- Your project must be a GitHub repository

### How to Use

1. **After installation**, open GitHub Copilot Chat in Agent mode in VS Code

2. **Run the `/review` command**:

   ```
   /review
   ```

   This will automatically detect and review the pull request associated with the current branch.

3. **Review a specific PR**:

   ```
   /review 123
   ```

   You can also specify a PR number to review.

### Review Coverage

The `/review` command analyzes pull requests from the following perspectives:

- Functional and specification correctness
- Bug and regression risks
- Edge cases and error handling
- Security issues
- Performance and scalability
- Readability and maintainability
- Testing and validation
- Documentation alignment
- Dependency and configuration changes

### Customization

You can add project-specific review guidelines by creating a `.review/GUIDELINES.md` file.

## CLI Options

- `--copilot` - Install prompts for GitHub Copilot (default)
- `--cursor` - Install prompts for Cursor
- `--lang <locale>` - Set the review language (e.g., `ja`, `en`)
- `-h`, `--help` - Display help information

## What the Installer Does

When you run `npx pr-review`:

1. Creates a `.review` directory for configuration
2. Copies prompt templates to the agent-specific directory based on the specified option (defaults to GitHub Copilot):
   - `--copilot` or default: `.github/prompts`
   - `--cursor`: `.cursor/commands`
3. Generates/updates the configuration file `.review/config.yml`
4. Saves settings such as language preferences

## License

Licensed under the Apache License, Version 2.0. See `LICENSE` for details.
