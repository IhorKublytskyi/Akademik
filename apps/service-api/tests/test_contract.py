import json
import threading
from collections.abc import Iterator
from http.server import BaseHTTPRequestHandler, HTTPServer

import pytest

from src.application.tasks import send_email_task
from src.application.tasks.send_email_task import fetch_user_email
from src.infrastructure.config import settings

API_KEY = "contract-test-key"
USER_ID = 7
CORE_API_USER = {
    "id": USER_ID,
    "email": "resident@akademik.local",
    "firstName": "Ivan",
    "lastName": "Student",
}

seen_requests: list[tuple[str, str | None]] = []


class CoreApiStub(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        seen_requests.append((self.path, self.headers.get("X-Api-Key")))

        if self.headers.get("X-Api-Key") != API_KEY:
            self.send_response(401)
            self.end_headers()
            return

        if self.path != f"/api/core/internal/users/{USER_ID}":
            self.send_response(404)
            self.end_headers()
            return

        body = json.dumps(CORE_API_USER).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args) -> None:
        pass


@pytest.fixture
def core_api(monkeypatch) -> Iterator[str]:
    seen_requests.clear()
    server = HTTPServer(("127.0.0.1", 0), CoreApiStub)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    url = f"http://127.0.0.1:{server.server_port}"
    monkeypatch.setattr(settings, "core_api_url", url)
    monkeypatch.setattr(settings, "internal_api_key", API_KEY)

    yield url

    server.shutdown()
    server.server_close()
    thread.join(timeout=5)


def test_fetch_user_email_matches_core_api_contract(core_api):
    email = fetch_user_email(USER_ID)

    assert email == CORE_API_USER["email"]
    assert seen_requests == [(f"/api/core/internal/users/{USER_ID}", API_KEY)]


def test_fetch_user_email_rejects_wrong_key(core_api, monkeypatch):
    monkeypatch.setattr(settings, "internal_api_key", "wrong-key")

    with pytest.raises(Exception) as exc_info:
        fetch_user_email(USER_ID)

    assert "401" in str(exc_info.value)


def test_fetch_user_email_unknown_user(core_api):
    with pytest.raises(Exception) as exc_info:
        fetch_user_email(999999)

    assert "404" in str(exc_info.value)


def test_send_email_delivers_address_from_core_api(core_api, monkeypatch):
    sent: dict = {}
    monkeypatch.setattr(
        send_email_task,
        "send_smtp_message",
        lambda recipient, title, content: sent.update(recipient=recipient),
    )
    monkeypatch.setattr(send_email_task, "_save_notification", _noop_save)

    send_email_task.send_email(user_id=USER_ID, title="Zamknięte", content="c")

    assert sent["recipient"] == CORE_API_USER["email"]


async def _noop_save(user_id, title, content, status) -> None:
    return None
