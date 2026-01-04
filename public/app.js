const customerForm = document.getElementById("customer-form");
const customerSelect = document.getElementById("customer-select");
const customerDetails = document.getElementById("customer-details");
const bmiForm = document.getElementById("bmi-form");
const bmiHistory = document.getElementById("bmi-history");
const notesForm = document.getElementById("notes-form");
const notesHistory = document.getElementById("notes-history");
const foodSelect = document.getElementById("food-select");
const productSelect = document.getElementById("product-select");
const compareButton = document.getElementById("compare-button");
const comparisonResult = document.getElementById("comparison-result");

let customers = [];

const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Request failed");
  }
  return response.json();
};

const renderCustomerOptions = () => {
  customerSelect.innerHTML = "";
  customers.forEach((customer) => {
    const option = document.createElement("option");
    option.value = customer.id;
    option.textContent = customer.name;
    customerSelect.appendChild(option);
  });

  if (customers.length === 0) {
    const option = document.createElement("option");
    option.textContent = "No customers yet";
    option.value = "";
    customerSelect.appendChild(option);
  }
};

const renderCustomerDetails = (customer) => {
  if (!customer) {
    customerDetails.innerHTML = "<p>Select a customer to view details.</p>";
    bmiHistory.innerHTML = "";
    notesHistory.innerHTML = "";
    return;
  }

  customerDetails.innerHTML = `
    <p><strong>Name:</strong> ${customer.name}</p>
    <p><strong>Email:</strong> ${customer.email || "-"}</p>
    <p><strong>Entries:</strong> ${customer.bmiHistory.length} BMI records</p>
  `;

  bmiHistory.innerHTML = renderHistoryList(
    customer.bmiHistory.map(
      (entry) =>
        `${new Date(entry.date).toLocaleString()} - BMI ${entry.bmi} (H: ${
          entry.heightCm
        }cm, W: ${entry.weightKg}kg)`
    ),
    "No BMI entries yet."
  );

  notesHistory.innerHTML = renderHistoryList(
    customer.notes.map(
      (entry) =>
        `${new Date(entry.date).toLocaleString()} - ${
          entry.note || "(No note)"
        } ${entry.recommendation ? `| Recommendation: ${entry.recommendation}` : ""}`
    ),
    "No notes yet."
  );
};

const renderHistoryList = (items, emptyText) => {
  if (items.length === 0) {
    return `<p>${emptyText}</p>`;
  }
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
};

const loadCustomers = async () => {
  customers = await request("/api/customers");
  renderCustomerOptions();
  const selected = customers.find(
    (customer) => customer.id === customerSelect.value
  );
  renderCustomerDetails(selected || customers[0]);
  if (customers.length > 0) {
    customerSelect.value = selected ? selected.id : customers[0].id;
  }
};

const loadFoodsAndProducts = async () => {
  const [foods, products] = await Promise.all([
    request("/api/foods"),
    request("/api/products")
  ]);

  foods.forEach((food) => {
    const option = document.createElement("option");
    option.value = food.id;
    option.textContent = food.name;
    foodSelect.appendChild(option);
  });

  products.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.id;
    option.textContent = product.name;
    productSelect.appendChild(option);
  });
};

customerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = document.getElementById("customer-name").value.trim();
  const email = document.getElementById("customer-email").value.trim();

  try {
    await request("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email })
    });
    customerForm.reset();
    await loadCustomers();
  } catch (error) {
    alert(error.message);
  }
});

customerSelect.addEventListener("change", async () => {
  const id = customerSelect.value;
  if (!id) {
    renderCustomerDetails(null);
    return;
  }
  const customer = await request(`/api/customers/${id}`);
  renderCustomerDetails(customer);
});

bmiForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = customerSelect.value;
  if (!id) {
    alert("Create a customer first.");
    return;
  }

  const heightCm = document.getElementById("height").value;
  const weightKg = document.getElementById("weight").value;

  try {
    await request(`/api/customers/${id}/bmi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heightCm, weightKg })
    });
    bmiForm.reset();
    await loadCustomers();
  } catch (error) {
    alert(error.message);
  }
});

notesForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = customerSelect.value;
  if (!id) {
    alert("Create a customer first.");
    return;
  }

  const note = document.getElementById("note").value;
  const recommendation = document.getElementById("recommendation").value;

  try {
    await request(`/api/customers/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note, recommendation })
    });
    notesForm.reset();
    await loadCustomers();
  } catch (error) {
    alert(error.message);
  }
});

compareButton.addEventListener("click", async () => {
  try {
    const result = await request(
      `/api/compare?foodId=${foodSelect.value}&productId=${productSelect.value}`
    );

    comparisonResult.innerHTML = `
      <h3>${result.food.name} vs ${result.product.name}</h3>
      <ul>
        ${result.comparison
          .map(
            (item) =>
              `<li>${item.metric}: Food ${item.food} | Product ${item.product} (Difference: ${item.difference})</li>`
          )
          .join("")}
      </ul>
    `;
  } catch (error) {
    alert(error.message);
  }
});

const init = async () => {
  await loadCustomers();
  await loadFoodsAndProducts();
};

init();
