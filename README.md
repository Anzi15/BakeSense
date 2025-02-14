# Bakesene Desktop

Bakesene Desktop is a desktop application built using **Electron.js, React, and Firebase**. This guide explains how to clone, set up, develop, and build the project.

---
## 🚀 Features
- Offline support
- React-based UI
- Firebase integration
- Electron-powered desktop experience

---
## 📥 Clone the Repository
To get started, clone this repository using:
```sh
git clone https://github.com/yourusername/bakesene-desktop.git
cd bakesene-desktop
```

---
## 🛠 Installation
Ensure you have **Node.js** installed (Recommended: Node.js 18+). Then, install the dependencies:
```sh
npm install --force
```
> **Note:** The `--force` flag is used to resolve potential dependency issues.

If you encounter any vulnerabilities, you can try fixing them with:
```sh
npm audit fix --force
```

---
## 🔧 Run in Development Mode
To start the development environment, run:
```sh
npm start
```
This will:
- Start the React development server on `http://localhost:3000`
- Launch the Electron app once the React app is ready

If you encounter errors related to missing dependencies, install them manually:
```sh
npm install concurrently wait-on --save-dev
```

Here’s the **Git Collaboration Workflow** section added to your README:  

---

## 🤝 Git Collaboration Workflow  
If you're collaborating on this project with a team, follow this workflow to ensure smooth development without merge conflicts.  

### 1️⃣ **Clone the Repository (First-Time Setup)**  
If you haven't already cloned the repository, do so with:  
```sh
git clone https://github.com/yourusername/bakesene-desktop.git
cd bakesene-desktop
```

### 2️⃣ **Create a New Feature Branch**  
Before making changes, create a new branch for your feature:  
```sh
git checkout -b feature-branch-name
```
> **Example:** If working on layout updates, name it `feature-layout`.

### 3️⃣ **Make Changes and Commit**  
After making changes, commit them:  
```sh
git add .
git commit -m "Added new feature"
```

### 4️⃣ **Push Your Branch to GitHub**  
Push your changes to the remote repository:  
```sh
git push origin feature-branch-name
```

### 5️⃣ **Create a Pull Request (PR)**  
1. Go to the GitHub repository.  
2. Click **Compare & pull request**.  
3. Add a description of your changes and submit the PR.  
4. Ask a teammate to review before merging.  

### 6️⃣ **Merge the PR into `main`**  
Once the PR is approved:  
- Click **Merge Pull Request** on GitHub.  
- Delete the `feature-branch-name` after merging.  

### 7️⃣ **Sync the Latest Code**  
After merging, ensure your local repo is up to date:  
```sh
git checkout main
git pull origin main
git branch -d feature-branch-name
```
Then, start working on a new feature:  
```sh
git checkout -b feature-next-task
```


---
## 🏗 Build for Production
To generate a production build:
```sh
npm run build
```
This will:
- Create an optimized production build of the React app inside the `build/` folder
- Package the Electron app

If you want to create a distributable package (Windows `.exe`, macOS `.dmg`, Linux `.AppImage`), run:
```sh
npm run dist
```
This uses `electron-builder` to create installers for different platforms.

---
## 🔍 Troubleshooting
### "Electron is not recognized" Error
If Electron is missing, install it manually:
```sh
npm install electron --save-dev
```

### "concurrently is not recognized" Error
If `concurrently` is missing, install it manually:
```sh
npm install concurrently --save-dev
```

### "wait-on is not recognized" Error
If `wait-on` is missing, install it manually:
```sh
npm install wait-on --save-dev
```

---
## 📜 License
This project is licensed under the **MIT License**.

---
## 💡 Contribution
If you'd like to contribute, feel free to submit a pull request!

---
## 📞 Contact
For any questions or support, reach out at **your-email@example.com**.

---
### 🔗 Useful Links
- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)

