# Artifex Backend (Go) Makefile
# Go SDK path: C:\Users\29623\sdk\go1.26.4
# Override GO if your go binary is elsewhere
#
# Quick usage:
#   make               → portable build (no ONNX, works everywhere)
#   make build         → full build with ONNX Runtime (needs GCC + onnxruntime.dll)
#   make run           → dev server (portable)

GO      ?= go
GOFLAGS ?=
LDFLAGS ?= -s -w

# Enable CGO by default for the full ONNX build.
# The -tags noonx builds (stub) ignore this via build tags anyway,
# but set CGO_ENABLED=0 explicitly if you don't have GCC installed.
CGO_ENABLED ?= 1
export CGO_ENABLED

.PHONY: all run build build-noonx build-windows build-linux dist dist-full clean

all: build-noonx

# ── Development ───────────────────────────────────────────────────────────

run:
	$(GO) run $(GOFLAGS) -tags noonx . -host 127.0.0.1 -port 8000

# ── Build ─────────────────────────────────────────────────────────────────

# Full build with ONNX Runtime support.
# Prerequisites: GCC (MinGW), onnxruntime.dll, downloaded tagger model.
build:
	$(GO) build $(GOFLAGS) -ldflags "$(LDFLAGS)" -o artifex-server.exe .

# Pure Go build — zero dependencies, no ONNX, no auto-tagging.
# Target-specific: forces CGO_ENABLED=0 regardless of shell.
build-noonx:
	$(GO) build $(GOFLAGS) -tags noonx -ldflags "$(LDFLAGS)" -o artifex-server-noonx.exe .

# These targets explicitly disable CGO via Make variable override.
# Use: make build-noonx CGO_ENABLED=0 (or rely on -tags noonx to skip cgo deps)

# Cross-compile for Windows from Linux/macOS
build-windows:
	CGO_ENABLED=0 GOOS=windows GOARCH=amd64 $(GO) build -tags noonx -ldflags "$(LDFLAGS)" -o artifex-server.exe .

# Cross-compile for Linux
build-linux:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 $(GO) build -tags noonx -ldflags "$(LDFLAGS)" -o artifex-server .

# ── Distribution ──────────────────────────────────────────────────────────

dist: build-noonx
	rm -rf dist/Artifex
	mkdir -p dist/Artifex/models/default dist/Artifex/models/user_model dist/Artifex/uploads
	cp artifex-server-noonx.exe dist/Artifex/Artifex.exe
	cp settings.json dist/Artifex/
	@echo
	@echo "Distribution prepared in dist/Artifex/"
	@echo "To include frontend, copy frontend/build/ to dist/Artifex/_internal/frontend/"

dist-full: build-noonx
	rm -rf dist/Artifex
	mkdir -p dist/Artifex/_internal/frontend dist/Artifex/models/default dist/Artifex/models/user_model dist/Artifex/uploads
	cp artifex-server-noonx.exe dist/Artifex/Artifex.exe
	cp settings.json dist/Artifex/
	cp -r ../frontend/build/* dist/Artifex/_internal/frontend/
	@echo
	@echo "Full distribution prepared in dist/Artifex/"
	@echo "  dist/Artifex/Artifex.exe          — server binary"
	@echo "  dist/Artifex/_internal/frontend/  — React frontend"
	@echo "  dist/Artifex/settings.json        — default config"
	@echo "  dist/Artifex/models/              — ONNX model storage"
	@echo "  dist/Artifex/uploads/             — user uploads"

# ── Clean ─────────────────────────────────────────────────────────────────

clean:
	rm -f artifex-server.exe artifex-server-noonx.exe
	rm -rf dist/
