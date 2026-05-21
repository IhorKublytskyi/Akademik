FROM python:3.12-slim AS builder

RUN pip install poetry poetry-plugin-export

WORKDIR /app

COPY pyproject.toml poetry.lock* ./

RUN poetry export --only main --without-hashes -f requirements.txt -o requirements.txt


FROM python:3.12-slim

WORKDIR /app

COPY --from=builder /app/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 3002
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "3002"]
