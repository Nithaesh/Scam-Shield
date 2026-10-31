"""Middleware assigning a unique correlation ID to every incoming request."""

from __future__ import annotations

import uuid
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response


class RequestIdMiddleware(BaseHTTPMiddleware):
    """Ensure every request has an X-Request-ID header and request.state.request_id."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        req_id = request.headers.get("X-Request-ID")
        if not req_id or not req_id.strip():
            req_id = str(uuid.uuid4())

        request.state.request_id = req_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = req_id
        return response
