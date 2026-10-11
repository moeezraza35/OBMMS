import os

# Development Host Settings
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
RELOAD = os.getenv("RELOAD", "True").lower() == "true"

# Session Settings
SECRET_KEY = os.getenv("SECRET_KEY")
SESSION_COOKIE = "session_id"
SAME_SITE = "lax"
HTTPS_ONLY = False # Set to True if using HTTPS

# JWT Settings
JWT_ALGORITHM = os.getenv("HOST")
JWT_EXIPRE = os.getenv("JWT_EXPIRE", "False").lower() == "true"
JWT_EXP_TIME = int(os.getenv("JWT_EXP_TIME", "30"))

# Encryption settings
SCHEMES = ["bcrypt"]
DEPRECATED = "auto"

# CORS Settings
ALLOW_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
ALLOW_CREDENTIALS = True
ALLOW_HEADERS = ['*']
ALLOW_METHODS = ['*']

# Database Settings
DB_DIALECT  = os.getenv("DB_DIALECT", "mysql")
DB_HOST     = os.getenv("DB_HOST", "127.0.0.1")   # fallback for local host runs
DB_PORT     = int(os.getenv("DB_PORT", "3306"))
DB_NAME     = os.getenv("DB_NAME", "obmms")
DB_DRIVER   = os.getenv("DB_DRIVER", "pymysql")
DB_USERNAME = os.getenv("DB_USERNAME", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_ECHO     = os.getenv("DB_ECHO", "False").lower() == "true"

# Models settings
MODELS = ["users", "group", "buses", "location", "stops", "routes", "packages", "history"]
