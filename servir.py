"""Servidor local de desenvolvimento sem cache: python servir.py  →  http://localhost:8000"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class SemCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    pasta = Path(__file__).resolve().parent
    print("Servindo em http://localhost:8000")
    ThreadingHTTPServer(("", 8000), partial(SemCache, directory=str(pasta))).serve_forever()
