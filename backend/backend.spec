# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec for Artifex backend.
Usage:
    pip install pyinstaller
    pyinstaller --clean backend.spec
Output in dist/Artifex/
"""

import os
import sys
from pathlib import Path

# Paths
_BASE = Path(__file__).resolve().parent if '__file__' in dir() else Path(os.getcwd())
_BACKEND = _BASE / "backend" if (_BASE / "backend").is_dir() else _BASE
_ENTRY = _BACKEND / "main.py"

a = Analysis(
    [str(_ENTRY)],
    pathex=[str(_BACKEND)],
    binaries=[],
    datas=[
        # Bundle settings.json if present (not fatal if missing)
        (str(_BACKEND / "settings.json"), "."),
        # Bundle frontend build → _internal/frontend/ (PyInstaller onedir)
        (str(_BASE / ".." / "frontend" / "build"), "frontend"),
    ],
    hiddenimports=[
        "fastapi",
        "uvicorn",
        "uvicorn.loops",
        "uvicorn.loops.auto",
        "uvicorn.protocols",
        "uvicorn.protocols.http",
        "uvicorn.protocols.http.auto",
        "uvicorn.protocols.websockets",
        "uvicorn.protocols.websockets.auto",
        "uvicorn.logging",
        "uvicorn.middleware",
        "onnxruntime",
        "onnxruntime.capi",
        "PIL",
        "PIL.Image",
        "PIL.PngImagePlugin",
        "PIL.JpegImagePlugin",
        "PIL.WebPImagePlugin",
        "numpy",
        "numpy.core",
        "numpy.random",
        "csv",
        "urllib",
        "json",
        "logging",
        "sqlite3",
        "asyncio",
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # Test frameworks & dev tools
        "pytest",
        "unittest",
        "doctest",
        "pdb",
        "distutils",
        "setuptools",
        "pip",
        "wheel",
        "tkinter",
        "turtle",
        "tcl",
        # Unused data science libs (no longer imported after code changes)
        "pandas",
        "huggingface_hub",
        # Large unused stdlib modules
        "lib2to3",
        "xmlrpc",
        "ensurepip",
        "pydoc",
        "test",
        "tests",
        # Platform-specific
        "curses",
        "readline",
        "_tkinter",
    ],
    ignore_errors=True,  # Skip missing optional imports gracefully
    module_collection_mode={},
)

pyz = PYZ(
    a.pure,
    a.zipped_data,
    cipher=None,
)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name="Artifex",
    debug=False,
    bootloader_ignore_signals=False,
    strip=True,           # Strip debug symbols → smaller
    upx=True,             # UPX compression → smaller
    upx_exclude=[],       # Exclude DLLs that break under UPX
    runtime_tmpdir=None,  # Extract in place (onedir, not temp)
    console=True,         # Show console window
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

# Collect the entire application folder for distribution
coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[
        # onnxruntime/providers DLLs — UPX can corrupt them
        "onnxruntime_providers_*.dll",
        "onnxruntime*.dll",
    ],
    name="Artifex",
)
