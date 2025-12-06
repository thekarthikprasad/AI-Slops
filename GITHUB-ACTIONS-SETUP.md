# 🚀 GitHub Actions APK Build Setup

## ✅ What's Been Done

1. **Created GitHub Actions Workflow** - `.github/workflows/build-apk.yml`
2. **Updated .gitignore** - Excludes Android build artifacts
3. **Capacitor Setup Complete** - Android project ready in `android/` folder

## 📋 Next Steps: Push to GitHub

### 1. Initialize Git Repository (if not already done)

```bash
git init
git add .
git commit -m "Initial commit with Capacitor Android setup"
```

### 2. Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name: `expense-manager` (or your preferred name)
3. **Don't** initialize with README, .gitignore, or license
4. Click "Create repository"

### 3. Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/expense-manager.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## 🎯 How It Works

Once pushed, GitHub Actions will automatically:

1. ✅ Install Node.js and dependencies
2. ✅ Build the web app (`npm run build`)
3. ✅ Set up Java JDK 17
4. ✅ Set up Android SDK
5. ✅ Build the APK (`gradlew assembleDebug`)
6. ✅ Upload the APK as an artifact

## 📦 Download Your APK

After the workflow runs:

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Click on the latest workflow run
4. Scroll down to **Artifacts**
5. Download **app-debug** (contains your APK)

## 🔄 Manual Trigger

You can also trigger the build manually:

1. Go to **Actions** tab
2. Click **Build Android APK** workflow
3. Click **Run workflow** button
4. Select branch and click **Run workflow**

## ⏱️ Build Time

First build: ~5-10 minutes (downloads dependencies)  
Subsequent builds: ~3-5 minutes (uses cache)

## 🎉 That's It!

No Android SDK installation needed on your machine. The APK builds in the cloud and you just download it when ready!

---

**Note:** The workflow runs on every push to `main`/`master` branch. You can modify `.github/workflows/build-apk.yml` to change this behavior.
