<<<<<<< HEAD
# 🔥 IGNITE 2026

IGNITE is a bridge between **students and entrepreneurs** — a space where ambition meets experience, and ideas turn into real opportunities.

---

## 📌 About IGNITE

**IGNITE 2026** is an innovation-driven event that connects students with entrepreneurs, startup founders, and industry professionals.

The goal is simple:
> Create meaningful interactions that inspire, guide, and launch the next generation of builders.

IGNITE is not just a hackathon or a conference — it is a **meeting point between learning and real-world execution**.

---

## 🎯 Core Mission

- Connect students with real entrepreneurs
- Expose participants to startup culture and challenges
- Encourage innovation and practical thinking
- Help students turn ideas into viable projects

---

## 🤝 What Makes IGNITE Different

Unlike traditional events, IGNITE focuses on:

- 💬 **Direct interaction** with entrepreneurs  
- 🧠 **Real insights** from people building actual startups  
- 🚀 **Opportunities** for mentorship, internships, or collaboration  
- 🔗 **Networking** that goes beyond the event  

---

## 🧩 Event Experience

IGNITE is structured to maximize interaction and impact:

### 1. 🎤 Talks & Panels
Entrepreneurs share their journeys, failures, and lessons learned.

### 2. 🤝 Networking Sessions
Students connect directly with founders and professionals.

### 3. 🛠️ Build / Ideation Phase
Participants work on ideas, often guided by mentors.

### 4. 🧭 Mentorship
Entrepreneurs provide feedback and direction on projects.

### 5. 🎯 Pitching
Teams present ideas to a panel of judges and entrepreneurs.

---

## 👥 Who Should Attend

- 🎓 Students (all fields, especially tech & business)
- 💡 Aspiring entrepreneurs
- 👨‍💻 Developers & designers
- 📈 Anyone interested in startups and innovation

---

## 🏆 What You Gain

- Real-world insights from entrepreneurs  
- Strong professional network  
- Experience working on impactful ideas  
- Exposure to startup thinking and execution  
- Potential opportunities (mentorship, internships, partnerships)

---

## 🌍 Vision

IGNITE aims to build a strong ecosystem where:
- Students are not just learners, but creators  
- Entrepreneurs actively support and guide new talent  
- Ideas are transformed into real startups  

---

## 🔥 Motto

> "Connect. Learn. Build. Ignite."

---

## 📅 Event Details

- **Edition:** IGNITE 2026  
- **Location:** To be announced  
- **Date:** Coming soon  

---

## 📬 Contact

For partnerships, participation, or inquiries:

- Email: [your-email@example.com]  
- Social Media: [links]

---

## 🚀 Final Note

IGNITE is where curiosity meets experience.  
Where students stop waiting — and start building.
=======
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
>>>>>>> 2865915 (update)
