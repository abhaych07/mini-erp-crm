const API_URL = import.meta.env.VITE_API_URL;

const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,

        headers: {
            "Content-Type": "application/json",

            ...(token
                ? {
                    Authorization: `Bearer ${token}`
                }
                : {}),

            ...(options.headers || {})
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Something went wrong"
        );
    }

    return data;
};


// =========================
// DASHBOARD
// =========================

export const getDashboard = async () => {
    return await apiRequest("/dashboard");
};


// =========================
// CUSTOMERS
// =========================

export const getCustomers = async (
    search = "",
    page = 1,
    limit = 10
) => {

    const params = new URLSearchParams();

    params.append("page", page);
    params.append("limit", limit);

    if (search) {
        params.append("search", search);
    }

    return await apiRequest(
        `/customers?${params.toString()}`
    );
};


export const getCustomer = async (id) => {
    return await apiRequest(
        `/customers/${id}`
    );
};


export const createCustomer = async (customerData) => {

    return await apiRequest(
        "/customers",
        {
            method: "POST",

            body: JSON.stringify(customerData)
        }
    );
};


export const updateCustomer = async (
    id,
    customerData
) => {

    return await apiRequest(
        `/customers/${id}`,
        {
            method: "PUT",

            body: JSON.stringify(customerData)
        }
    );
};


// =========================
// FOLLOW UPS
// =========================

export const createFollowUp = async (
    customerId,
    followUpData
) => {

    return await apiRequest(
        `/customers/${customerId}/follow-ups`,
        {
            method: "POST",

            body: JSON.stringify(followUpData)
        }
    );
};


// =========================
// PRODUCTS
// =========================

export const getProducts = async (search = "") => {

    const endpoint = search
        ? `/products?search=${encodeURIComponent(search)}`
        : "/products";

    return await apiRequest(endpoint);
};


export const getProduct = async (id) => {

    return await apiRequest(
        `/products/${id}`
    );
};


export const createProduct = async (data) => {

    return await apiRequest(
        "/products",
        {
            method: "POST",
            body: JSON.stringify(data)
        }
    );
};


export const updateProduct = async (id, data) => {

    return await apiRequest(
        `/products/${id}`,
        {
            method: "PUT",
            body: JSON.stringify(data)
        }
    );
};


export const getStockMovements = async (productId) => {
    return await apiRequest(
        `/products/${productId}/stock-movements`
    );
};

export const createStockMovement = async (productId, data) => {
    return await apiRequest(
        `/products/${productId}/stock`,
        {
            method: "POST",
            body: JSON.stringify(data)
        }
    );
};

export const getChallans = async () => {

    return await apiRequest(
        "/challans"
    );
};


export const getChallan = async (id) => {

    return await apiRequest(
        `/challans/${id}`
    );
};


export const createChallan = async (data) => {

    return await apiRequest(
        "/challans",
        {
            method: "POST",
            body: JSON.stringify(data)
        }
    );
};


export const updateChallan = async (id, data) => {

    return await apiRequest(
        `/challans/${id}`,
        {
            method: "PUT",
            body: JSON.stringify(data)
        }
    );
};


// =========================
// AUTH
// =========================

export const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");
};


// Export apiRequest as well
export { apiRequest };