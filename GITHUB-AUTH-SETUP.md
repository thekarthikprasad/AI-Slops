# GitHub Authentication Setup

## The Issue

The `git push` command failed because GitHub requires authentication. Password authentication is no longer supported - you need a Personal Access Token (PAT).

## Solution: Create a Personal Access Token

### Step 1: Generate Token

1. Go to https://github.com/settings/tokens/new
2. **Note**: `Expense Manager Push`
3. **Expiration**: 90 days (or your preference)
4. **Select scopes**: Check `repo` (Full control of private repositories)
5. Click **Generate token**
6. **IMPORTANT**: Copy the token immediately (you won't see it again!)

### Step 2: Push with Token

Run the push command again:

```bash
git push -u origin main
```

When prompted:
- **Username**: `thekarthikprasad`
- **Password**: Paste your token (not your GitHub password!)

## Alternative: Use GitHub CLI

If you have GitHub CLI installed:

```bash
gh auth login
git push -u origin main
```

## Alternative: Use VS Code

1. Open the project in VS Code
2. Click the Source Control icon (left sidebar)
3. Click the three dots (...) → Push
4. VS Code will handle authentication for you

## After Successful Push

Once pushed, GitHub Actions will automatically:
1. Build your web app
2. Set up Android SDK
3. Build the APK
4. Upload it as an artifact

Check progress at: https://github.com/thekarthikprasad/AI-Slops/actions

The APK will be ready in ~5-10 minutes!
