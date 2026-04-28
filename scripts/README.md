# Scripts de Automação

Este diretório contém scripts de automação para facilitar o setup e manutenção do projeto.

## 📜 setup-env.sh

**Descrição:** Gera automaticamente o arquivo `.env` com credenciais seguras.

**O que faz:**
- Copia `.env.example` para `.env`
- Gera uma `SECRET_KEY` aleatória usando OpenSSL ou Python
- Gera senhas fortes para `DB_PASSWORD` e `POSTGRES_PASSWORD`
- Substitui os valores padrão no arquivo `.env`
- Exibe as credenciais geradas para o usuário salvar em local seguro

**Uso:**
```bash
./scripts/setup-env.sh
```

**Requisitos:**
- `openssl` OU `python3`/`python` (para geração de valores aleatórios)

**Exemplo de saída:**
```
🔍 Verificando arquivo .env...
📝 Criando arquivo .env a partir do exemplo...
🔐 Gerando SECRET_KEY aleatória...
✅ .env criado com sucesso!

⚠️  IMPORTANTE: Para produção, altere no .env:
   - SECRET_KEY (gere uma nova se desejar)
   - DB_PASSWORD e POSTGRES_PASSWORD (senhas fortes)

📄 Suas credenciais geradas:
   SECRET_KEY=abc123...
   DB_PASSWORD=xyz789...
   POSTGRES_PASSWORD=def456...

💾 Salve estas credenciais em um local seguro!
```

---

## 🔙 Voltar para o README principal

[⚡ Energy Pulse — Dashboard Analítico](../README.md)
