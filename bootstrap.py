"""Restore the initial source archive for the cloud development environment."""
from pathlib import Path
import hashlib
import zipfile

root = Path(__file__).resolve().parent
archive = root / "rtcom-source.zip"
expected = (root / "rtcom-source.sha256").read_text(encoding="utf-8-sig").strip()
actual = hashlib.sha256(archive.read_bytes()).hexdigest()
if actual != expected:
    raise SystemExit("Source archive checksum does not match.")
with zipfile.ZipFile(archive) as bundle:
    for member in bundle.infolist():
        target = (root / member.filename).resolve()
        if not target.is_relative_to(root) or ".git" in Path(member.filename).parts:
            raise SystemExit("Unsafe archive member: " + member.filename)
        if target.is_file() and target.read_bytes() != bundle.read(member):
            raise SystemExit("Refusing to overwrite modified file: " + member.filename)
    bundle.extractall(root)
print("Source restored. Run: node --test tests/core.test.cjs")
