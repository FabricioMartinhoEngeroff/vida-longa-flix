

#!/usr/bin/env bash
set -e

PROJECT_DIR="${1:-.}"

echo "============================================="
echo "🔎 BUSCANDO POSSÍVEIS CAUSAS DE OVERFLOW-X"
echo "📁 Projeto: $PROJECT_DIR"
echo "============================================="

echo
echo "✅ 1) Procurando padrões perigosos (100vw, calc(100vw), vw, overflow-x, translateX...)"
echo "-------------------------------------------------------------"

grep -RIn --color=always \
  --exclude-dir=node_modules \
  --exclude-dir=dist \
  --exclude-dir=.angular \
  --exclude-dir=.git \
  --exclude=package-lock.json \
  --exclude=yarn.lock \
  -E \
  "100vw|calc\([^)]*100vw|vw;|vw\)|translateX|translate3d|position:\s*fixed|overflow-x|overflow:\s*auto|margin-right|right:\s*-|left:\s*-|width:\s*[0-9]+px|min-width:\s*[0-9]+px|scrollbar" \
  "$PROJECT_DIR" || true

echo
echo "✅ 2) Procurando CSS/HTML com largura suspeita (width: 101%, 105%, etc)"
echo "-------------------------------------------------------------"

grep -RIn --color=always \
  --exclude-dir=node_modules \
  --exclude-dir=dist \
  --exclude-dir=.angular \
  --exclude-dir=.git \
  -E \
  "width:\s*10[1-9]%|width:\s*[2-9][0-9][0-9]%|max-width:\s*[2-9][0-9][0-9]%" \
  "$PROJECT_DIR" || true

echo
echo "✅ 3) Procurando qualquer uso de 100vw (maior culpado!)"
echo "-------------------------------------------------------------"

grep -RIn --color=always \
  --exclude-dir=node_modules \
  --exclude-dir=dist \
  --exclude-dir=.angular \
  --exclude-dir=.git \
  -E "100vw" \
  "$PROJECT_DIR" || true

echo
echo "============================================="
echo "🎯 DICA:"
echo "Se aparecer 'width: 100vw', quase sempre é isso."
echo "Troque por: width: 100%"
echo "============================================="

