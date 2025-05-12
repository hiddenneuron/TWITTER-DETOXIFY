
# 🌟 TWITTER-DETOXIFY 🚀

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)
![Last Commit](https://img.shields.io/github/last-commit/KunjShah95/TWITTER-DETOXIFY?style=for-the-badge)
![Repo Stars](https://img.shields.io/github/stars/KunjShah95/TWITTER-DETOXIFY?style=for-the-badge)
![Contributors](https://img.shields.io/github/contributors/KunjShah95/TWITTER-DETOXIFY?style=for-the-badge)

---

## ✨ Overview

TWITTER-DETOXIFY is a **browser extension** designed to help you take control of your Twitter/X experience. It empowers you to filter out unwanted content, block the site for focused work periods, and gain insights into what's being filtered, creating a more positive and productive online environment. 🌈

---

## ⚙️ Features

✅ **Site Blocker**: Set a timer (hours/minutes) to block access to Twitter/X, helping you stay focused.  
✅ **Keyword Filtering**: Hide tweets containing specific keywords or phrases you define.  
✅ **User Blocking**: Hide tweets from specified user accounts (enter usernames without '@').  
✅ **Content-Type Filtering**: Option to hide tweets containing images or videos.  
✅ **Detoxification Summary**: View statistics on how many tweets have been filtered by keywords, users, images, or videos.  
✅ **User-Friendly Popup**: Intuitive interface to manage all settings and view stats directly from your browser toolbar.  
✅ **Persistent Settings**: Your preferences are saved locally in your browser.

---

## 🛠️ Tech Stack

* **Frontend**: HTML, CSS (Tailwind CSS), JavaScript (Vanilla)  
* **Browser APIs**: Chrome Storage, Chrome Messaging, Chrome Scripting  
* **Build Tooling**: Node.js/npm for Tailwind CSS compilation

---

## 🚀 Getting Started

### Prerequisites

* A Chromium-based browser (e.g., Google Chrome, Microsoft Edge, Brave)
* [Node.js](https://nodejs.org/) and npm (only if you plan to modify styles or contribute to development)

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/KunjShah95/TWITTER-DETOXIFY.git
    cd TWITTER-DETOXIFY
    ```

2. **(Optional) Install dependencies and build CSS (if you made style changes):**
    If you don't plan to change styles, you can skip this step as `src/output.css` is already provided.
    ```bash
    npm install
    npm run build:css
    ```

3. **Load the Extension in Your Browser:**
    * Open your browser and navigate to the extensions page:
        * Chrome/Edge: `chrome://extensions/`
        * Brave: `brave://extensions/`
    * Enable **"Developer mode"** (usually a toggle in the top right corner)
    * Click on **"Load unpacked"**
    * Select the `src` directory from the cloned `TWITTER-DETOXIFY` project

The Twitter Detoxifier icon should now appear in your browser's toolbar!

---

## 📖 Usage

1. **Open the Popup:** Click the Twitter Detoxifier icon in your browser toolbar.

2. **Site Blocker:**
    * In the "Site Blocker" section, select the desired **Hours** and **Minutes**
    * Click **"Start Site Block"**
    * To unblock before the timer ends, open the popup and click **"Unlock Site Now"**

3. **Keyword Filtering:**
    * Navigate to the "Keyword Filtering" section
    * Enter keywords you wish to hide, one per line, in the textarea
    * Click **"Save Keywords"**
    * Use the "x" icon within the textarea to quickly clear your input

4. **User Blocking:**
    * Go to the "User Blocking" section
    * Enter Twitter usernames (one per line, **without the `@` symbol**) whose tweets you want to hide
    * Click **"Save Blocked Users"**
    * Use the "x" icon within the textarea to clear your input

5. **Content Filtering:**
    * In the "Content Filtering" section, check/uncheck:
        * "Hide tweets with images"
        * "Hide tweets with videos"
    * Click **"Apply Content Filters"**

6. **Detox Summary:**
    * The "Detox Summary" section shows statistics on filtered content
    * Click **"Reset Stats"** to clear these counts

**Note:** Filters are applied dynamically as you scroll through Twitter/X. For immediate effect on already loaded content, a page refresh might be necessary after changing filter settings.

---

## 💻 Development

The extension's core logic resides in the `src/` directory:

* `popup.html` & `popup.js`: The user interface and logic for the extension's popup
* `background.js`: The service worker handling timer logic, message passing, and background tasks
* `content.js` & `content.css`: Scripts and styles injected into Twitter/X pages to perform filtering and DOM manipulation
* `manifest.json`: The extension's manifest file defining its properties, permissions, and entry points
* `input.css` & Tailwind CSS Config (`tailwind.config.js`, `postcss.config.js`): Source files for styling. `output.css` is the compiled stylesheet

### Building CSS

If you modify the Tailwind CSS utility classes or `src/input.css`:

1. Ensure Node.js and npm are installed  
2. Install project dependencies:
    ```bash
    npm install
    ```
3. Build CSS once:
    ```bash
    npm run build:css
    ```
4. Or, watch for changes and rebuild CSS automatically during development:
    ```bash
    npm run watch:css
    ```

---

## 🌟 Future Updates

Here's what's being considered for future versions:

🔜 **Advanced AI Models**: Potential for more nuanced toxicity detection using NLP techniques (would likely require backend infrastructure)  
🔜 **Multi-Language Support**: Extend filtering capabilities to tweets in various languages  
🔜 **Import/Export Settings**: Allow users to backup and share their filter configurations  
🔜 **UI/UX Enhancements**: Continuously refine the user interface for better usability and accessibility  
🔜 **Dark Mode for Popup**: A dedicated dark mode for the extension popup itself (though it currently uses a dark theme)

---

## 💬 Contributing

We welcome contributions! 🎉 If you'd like to help improve Twitter Detoxifier, please follow these steps:

1. **Fork** the repository  
2. Create a **new branch** for your feature or bug fix:
    ```bash
    git checkout -b feature/your-amazing-feature
    ```
3. Make your changes and **commit** them with clear, descriptive messages:
    ```bash
    git commit -m "Add: Implement your amazing feature"
    ```
4. **Push** your changes to your forked repository:
    ```bash
    git push origin feature/your-amazing-feature
    ```
5. Open a **Pull Request** to the `main` branch of the original repository

Please ensure your code adheres to the existing style and that any UI changes are responsive and user-friendly

---

## 🛡️ License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 📧 Contact

For any inquiries, support, or feedback, please contact:

**Kunj Shah**  
* GitHub: [KunjShah95](https://github.com/KunjShah95)  
* Email: kunjshah572005@example.com (Please update if this is a placeholder)

---

## 🏆 Acknowledgments

* Thanks to the open-source community for the tools and libraries that make projects like this possible
* Special thanks to all contributors and users for their valuable feedback and support

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/KunjShah95">KunjShah95</a>
</div>
