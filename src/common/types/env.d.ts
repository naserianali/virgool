declare namespace NodeJS {
  interface ProcessEnv {
    PORT: number;
    HOST: string;
    HOST_PREFIX: string;
    DB_PORT: number;
    DB_NAME: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_HOST: string;
    COOKIE_SECRET: string;
    OTP_TOKEN_SECRET: string;
    ACCESS_TOKEN_SECRET: string;
    EMAIL_TOKEN_SECRET: string;
    PHONE_TOKEN_SECRET: string;
    SMS_IR_VERIFY_SEND_URL: string;
    SMS_IR_API_KEY: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    PRODUCTION: boolean;
    APP_URL: string;
  }
}
