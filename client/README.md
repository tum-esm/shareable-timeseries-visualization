## Install the dependencies

Virtual environments with **venv**: https://docs.python.org/3/library/venv.html
Dependency management with **poetry**: https://python-poetry.org/docs/#installation

Set up project interpreter:

```bash
# Create a virtual environment (a local copy of python)
python3.10 -m venv .venv

# Switch to the virtual environment
source .venv/bin/activate

# Install dependencies
poetry install
```
