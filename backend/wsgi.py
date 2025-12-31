import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from obmms import OBMMS

obmms_app = OBMMS()
application = obmms_app.app
