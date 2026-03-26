FROM python:3.12-slim

RUN pip install poetry

WORKDIR /app

COPY pyproject.toml poetry.lock* ./
RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-root

COPY . .

EXPOSE 3002
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "3002"]