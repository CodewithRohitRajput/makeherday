const CASHFREE_API_VERSION="2025-01-01"

const CASHFREE_BASE_URL= process.env.CASHFREE_ENV === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg"

const cashfreeHeaders = {
    "Content-Type" : "application/json",
    Accept : "application/json",
    "x-api-version" : CASHFREE_API_VERSION,
    "x-client-id" : process.env.CASHFREE_CLIENT_ID,
    "x-client-secret" : process.env.CASHFREE_CLIENT_SECRET
}

export {
    CASHFREE_BASE_URL,
    cashfreeHeaders,
}