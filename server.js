const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data.json");

const foods = [
  {
    id: "food-apple",
    name: "Apple",
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    fiber: 4.4
  },
  {
    id: "food-broccoli",
    name: "Broccoli",
    calories: 55,
    protein: 3.7,
    carbs: 11.2,
    fat: 0.6,
    fiber: 5.1
  },
  {
    id: "food-banana",
    name: "Banana",
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    fiber: 3.1
  }
];

const products = [
  {
    id: "product-multivitamin",
    name: "Daily Multivitamin",
    calories: 5,
    protein: 0,
    carbs: 1,
    fat: 0,
    fiber: 0
  },
  {
    id: "product-protein-powder",
    name: "Whey Protein Scoop",
    calories: 120,
    protein: 24,
    carbs: 3,
    fat: 2,
    fiber: 0
  },
  {
    id: "product-omega-3",
    name: "Omega-3 Softgel",
    calories: 10,
    protein: 0,
    carbs: 0,
    fat: 1,
    fiber: 0
  }
];

const ensureDataFile = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const starter = { customers: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(starter, null, 2));
  }
};

const readData = () => {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
};

const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

const findCustomer = (data, id) =>
  data.customers.find((customer) => customer.id === id);

const calculateBmi = (heightCm, weightKg) => {
  const heightMeters = heightCm / 100;
  return weightKg / (heightMeters * heightMeters);
};

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/customers", (req, res) => {
  const data = readData();
  res.json(data.customers);
});

app.post("/api/customers", (req, res) => {
  const { name, email } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Name is required." });
  }

  const data = readData();
  const newCustomer = {
    id: `customer-${Date.now()}`,
    name: name.trim(),
    email: email ? email.trim() : "",
    bmiHistory: [],
    notes: []
  };

  data.customers.push(newCustomer);
  writeData(data);
  res.status(201).json(newCustomer);
});

app.get("/api/customers/:id", (req, res) => {
  const data = readData();
  const customer = findCustomer(data, req.params.id);

  if (!customer) {
    return res.status(404).json({ message: "Customer not found." });
  }

  return res.json(customer);
});

app.post("/api/customers/:id/bmi", (req, res) => {
  const { heightCm, weightKg } = req.body;
  if (!heightCm || !weightKg) {
    return res
      .status(400)
      .json({ message: "Height (cm) and weight (kg) are required." });
  }

  const data = readData();
  const customer = findCustomer(data, req.params.id);

  if (!customer) {
    return res.status(404).json({ message: "Customer not found." });
  }

  const bmi = calculateBmi(Number(heightCm), Number(weightKg));
  const entry = {
    date: new Date().toISOString(),
    heightCm: Number(heightCm),
    weightKg: Number(weightKg),
    bmi: Number(bmi.toFixed(2))
  };

  customer.bmiHistory.push(entry);
  writeData(data);
  res.json(entry);
});

app.post("/api/customers/:id/notes", (req, res) => {
  const { note, recommendation } = req.body;
  if (!note && !recommendation) {
    return res
      .status(400)
      .json({ message: "Provide a note or recommendation." });
  }

  const data = readData();
  const customer = findCustomer(data, req.params.id);

  if (!customer) {
    return res.status(404).json({ message: "Customer not found." });
  }

  const entry = {
    date: new Date().toISOString(),
    note: note ? note.trim() : "",
    recommendation: recommendation ? recommendation.trim() : ""
  };

  customer.notes.push(entry);
  writeData(data);
  res.json(entry);
});

app.get("/api/foods", (req, res) => {
  res.json(foods);
});

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.get("/api/compare", (req, res) => {
  const { foodId, productId } = req.query;
  const food = foods.find((item) => item.id === foodId);
  const product = products.find((item) => item.id === productId);

  if (!food || !product) {
    return res
      .status(400)
      .json({ message: "Please select one food and one product." });
  }

  const comparison = [
    "calories",
    "protein",
    "carbs",
    "fat",
    "fiber"
  ].map((key) => ({
    metric: key,
    food: food[key],
    product: product[key],
    difference: Number((food[key] - product[key]).toFixed(2))
  }));

  res.json({ food, product, comparison });
});

app.listen(PORT, () => {
  console.log(`Nutrition app running at http://localhost:${PORT}`);
});
