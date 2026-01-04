# Nutrition Consulting App

A beginner-friendly Node.js app for managing nutrition consulting data. It includes a simple frontend, BMI tracking, food and product databases, and note-taking.

## Folder structure

```
.
├── public
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── data.json (created automatically after first run)
├── package.json
├── server.js
└── README.md
```

## Features

- Create customers (name + optional email)
- Calculate BMI from height and weight
- Save BMI history per customer
- Add notes and recommendations
- Browse food and product databases
- Compare food vs product nutrition values

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open the app:
   - Visit `http://localhost:3000` in your browser.

## Notes

- Data is stored in a local `data.json` file for simplicity.
- This is a simple project intended for beginners.
