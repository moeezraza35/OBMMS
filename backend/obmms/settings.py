# Development Host Settings
HOST = "127.0.0.1"
PORT = 8000
RELOAD = True

# Session Settings
SECRET_KEY = "63856-OBMMS$66688-&-66566"
SESSION_COOKIE = "session_id"
SAME_SITE = "lax"
HTTPS_ONLY = False # Set to True if using HTTPS

# JWT Settings
JWT_ALGORITHM = "HS256"
JWT_EXIPRE = False
JWT_EXP_TIME = 30   # Days

# Encryption settings
SCHEMES = ["bcrypt"]
DEPRECATED = "auto"

# CORS Settings
ALLOW_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
ALLOW_CREDENTIALS = True
ALLOW_HEADERS = ['*']
ALLOW_METHODS = ['*']

# Database Settings
DB_DIALECT = "mysql"
DB_HOST = "127.0.0.1"
DB_PORT = 3306
DB_NAME = "test"
DB_DRIVER = "pymysql"
DB_USERNAME = "root"
DB_PASSWORD = ""
DB_ECHO = False

# Models settings
MODELS = ["users", "group", "buses", "location", "stops"]

# Email Settings
EMAIL = "moeezrazaseven@gmail.com"
EMAIL_PASSWORD = ""