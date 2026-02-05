export async function fetchFromApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {

    const apiBase =
      typeof window === "undefined"
        ? process.env.API_URL || "http://rest-api:3000"
        : process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3100";



  const res = await fetch(`${apiBase}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error: ${res.status} ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";

  // Wenn Server korrekt JSON liefert → nimm res.json()
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }

  // Sonst: Fallback über Text → JSON.parse
  const raw = await res.text().catch(() => "");
  if (!raw) return (undefined as unknown) as T;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return (undefined as unknown) as T;
  }
}


// GET
export async function getProducts() {
  return fetchFromApi<
    { ProductID: number; ProductName: string; Price: number }[]
  >("/products");
}

export async function getCustomers() {
  return fetchFromApi<
    { CustomerID: number; CustomerName: string; ContactName?: string; Country?: string }[]
  >("/customers");
}

export async function getCategories() {
  return fetchFromApi<
    { CategoryID: number; CategoryName: string; Description?: string }[]
  >("/categories");
}

/* =========================
   POST (Create) – Punkt 3
   ========================= */

// Entity 1: Customer erstellen
export async function createCustomer(payload: {
  CustomerName: string;
  ContactName?: string;
  Address?: string;
  City?: string;
  PostalCode?: string;
  Country?: string;
}) {
  // Rückgabe deiner API ist vermutlich mysql2 result mit insertId/affectedRows
  // deshalb hier generisch
  return fetchFromApi<any>("/customers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Entity 2: Product erstellen
export async function createProduct(payload: {
  ProductName: string;
  SupplierID?: number;
  CategoryID?: number;
  Unit?: string;
  Price?: number;
}) {
  return fetchFromApi<any>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// PATCH (Update)
export async function updateProduct(
  id: number,
  patch: {
    ProductName?: string;
    Price?: number;
  }
) {
  return fetchFromApi<any>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function updateCustomer(
  id: number,
  patch: {
    CustomerName?: string;
    ContactName?: string;
    City?: string;
    Country?: string;
  }
) {
  return fetchFromApi<any>(`/customers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

//DELETE
export async function deleteProduct(id: number) {
  return fetchFromApi<any>(`/products/${id}`, {
    method: "DELETE",
  });
}

export async function deleteCustomer(id: number) {
  return fetchFromApi<any>(`/customers/${id}`, {
    method: "DELETE",
  });
}
