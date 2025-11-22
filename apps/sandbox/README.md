# Python Sandbox Service

FastAPI service for secure Python code execution in isolated environments.

## Tech Stack

- FastAPI
- Docker (for sandboxing)
- Python 3.11+

## Development

```bash
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```
