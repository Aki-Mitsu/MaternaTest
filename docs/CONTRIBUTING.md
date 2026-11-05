# Contributing to Materna 🌸

First off, thank you for taking the time to contribute! 🎉 Whether it's bug fixes, new features, or documentation improvements, all contributions are welcome and appreciated.

To ensure a smooth collaboration process and keep the codebase clean, please follow the guidelines outlined in this document.

---

## 1. Code of Conduct

By participating in this project, you agree to abide by our standards. Please be respectful, welcoming, and constructive in all interactions, issues, and pull requests.

---

## 2. Branch Naming Conventions

Always create your working branches from the latest `staging` (or `main`) branch. Use the following prefix format depending on the nature of your work:

* **Features:** `feature/short-description-in-kebab-case` (e.g., `feature/user-login-oauth`)
* **Bug Fixes:** `bugfix/short-description-in-kebab-case` (e.g., `bugfix/fix-cart-rounding`)
* **Hotfixes:** `hotfix/short-description-in-kebab-case` (e.g., `hotfix/security-patch-jwt`)
* **Releases:** `release/vX.X.X` (e.g., `release/v1.2.0`)

---

## 3. Commit Message Guidelines (Conventional Commits)

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This helps generate automated changelogs and makes commit histories easy to read at a glance.

**Format:**
```text
<type>(<scope>): <short description>
```

### Common Types:
* `feat`: A new feature
* `fix`: A bug fix
* `docs`: Documentation only changes
* `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)
* `refactor`: A code change that neither fixes a bug nor adds a feature
* `test`: Adding missing tests or correcting existing tests
* `chore`: Changes to the build process or auxiliary tools/libraries

### Examples:
```bash
git commit -m "feat(auth): add Google OAuth login option"
git commit -m "fix(cart): resolve incorrect tax calculation on checkout"
git commit -m "docs(readme): update local development setup instructions"
```

---

## 4. Step-by-Step Contribution Workflow

### 1. Sync Your Local Repository
Ensure your local repository is up to date with the remote `staging` branch:
```bash
git checkout staging
git pull origin staging
```

### 2. Create a Working Branch
Branch off from `staging` using the branch naming convention:
```bash
git checkout -b feature/your-feature-name
```

### 3. Make Atomic Commits
Write code and commit incrementally with descriptive Conventional Commit messages. Keep changes focused and relevant to the task:
```bash
git add .
git commit -m "feat(module): brief description of atomic change"
```

### 4. Push to Remote
Push your branch to the remote repository:
```bash
git push origin feature/your-feature-name
```

### 5. Open a Pull Request (PR)
1. Go to GitHub and open a Pull Request targeting the `staging` branch.
2. Fill out the PR description completely (explaining what the changes do and how they were tested).
3. Request reviews from relevant team members.

### 6. Code Review & Merge
1. Address reviewer feedback constructively.
2. Ensure all automated CI/CD checks (linters, type checks, tests) pass successfully.
3. Once approved, the PR will be squashed and merged into `staging`.

---

## 5. Pull Request Etiquette

* **Keep PRs Small:** Aim for focused, digestible changes. Smaller PRs are reviewed faster and more thoroughly.
* **Be Respectful:** Focus comments on the code, not the author. Ask constructive questions (e.g., *"What do you think about using X approach here?"*) rather than making demands.

