const envValue = (key, fallback = "") => {
  const direct = process.env[key];
  const spaced = process.env[`${key} `];
  const raw = direct ?? spaced ?? fallback;
  return typeof raw === "string" ? raw.trim().replace(/^"(.*)"$/, "$1") : raw;
};

export const env = {
  get port() {
    return Number(envValue("PORT", 4000));
  },
  get jwtSecret() {
    return envValue("JWT_SECRET");
  },
  get mongodbUri() {
    return envValue("MONGODB_URI");
  },
  get huggingFaceToken() {
    return envValue("HF_TOKEN");
  },
  get huggingFaceModel() {
    return envValue("HF_MODEL", "Qwen/Qwen2.5-72B-Instruct:fastest");
  },
  get emailProvider() {
    return envValue("EMAIL_PROVIDER", "local-outbox");
  },
  get gmailUser() {
    return envValue("GMAIL_USER");
  },
  get gmailAppPassword() {
    return envValue("GMAIL_APP_PASSWORD");
  },
  get emailFrom() {
    return envValue("EMAIL_FROM", envValue("GMAIL_USER", "eventease@example.com"));
  },
  get paymentProvider() {
    return envValue("PAYMENT_PROVIDER", "mock");
  },
  get razorpayKeyId() {
    return envValue("RAZORPAY_KEY_ID");
  },
  get razorpayKeySecret() {
    return envValue("RAZORPAY_KEY_SECRET");
  },
  get frontendUrl() {
    return envValue("FRONTEND_URL", "http://127.0.0.1:5173");
  },
};

export const validateEnv = () => {
  if (!env.mongodbUri) {
    throw new Error("Missing MONGODB_URI");
  }

  if (!env.jwtSecret) {
    throw new Error("Missing JWT_SECRET");
  }
};
