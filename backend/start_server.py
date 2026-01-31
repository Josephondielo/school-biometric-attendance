import sys
import os
import subprocess

if sys.platform == 'win32':
    cmd = "waitress-serve --port=$PORT --call run:create_app"
else:
    cmd = "gunicorn run:app"

print(f"Detected platform: {sys.platform}. Running: {cmd}")
# This is physically not executable in a Procfile easily without a shell intermediate, 
# so we might stick to a simpler Procfile or just waitress for now since user is on Windows.
