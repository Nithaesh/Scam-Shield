"""Main entrypoint and application factory for Scam Shield v2 FastAPI backend."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from v2.api.config import settings
from v2.api.middleware.rate_limit import limiter
from v2.api.middleware.request_id import RequestIdMiddleware
from v2.api.middleware.security_headers import SecurityHeadersMiddleware
from v2.api.db.session import init_db
from v2.api.routers import analyze, community, health, samples

logger = logging.getLogger("scam_shield.v2")
logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Startup and shutdown lifecycle management."""
    logger.info("Initializing Scam Shield v2 backend (env: %s)...", settings.APP_ENV)
    init_db()
    yield
    logger.info("Scam Shield v2 backend shutdown complete.")


def create_app() -> FastAPI:
    """Build and configure the FastAPI application instance."""
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.VERSION,
        description="Production API for Scam Shield Indian citizen fraud intelligence.",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Attach slowapi rate limiter
    app.state.limiter = limiter

    # Middleware: Execution order is bottom-up (first added is outermost)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RequestIdMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID"],
    )

    # Exception Handlers
    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
        req_id = getattr(request.state, "request_id", "unknown")
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "error": "RATE_LIMIT_EXCEEDED",
                "message": "Too many requests. Please wait a moment before trying again.",
                "request_id": req_id,
            },
            headers={"Retry-After": "60", "X-Request-ID": req_id},
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        req_id = getattr(request.state, "request_id", "unknown")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": "HTTP_ERROR",
                "message": str(exc.detail),
                "request_id": req_id,
            },
            headers={"X-Request-ID": req_id},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        req_id = getattr(request.state, "request_id", "unknown")
        logger.error("Unhandled server exception [%s]: %s", req_id, str(exc), exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred while processing the request.",
                "request_id": req_id,
            },
            headers={"X-Request-ID": req_id},
        )

    # Register API Routers (support both /api/v2 and legacy /api/v1 prefixes)
    for prefix in ("/api/v2", "/api/v1"):
        app.include_router(health.router, prefix=prefix)
        app.include_router(analyze.router, prefix=prefix)
        app.include_router(samples.router, prefix=prefix)
        app.include_router(community.router, prefix=prefix)

    # Top-level health probe
    app.include_router(health.router)

    return app


# Root ASGI application instance
app = create_app()
