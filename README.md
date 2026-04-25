# ⚡ Energy Pulse — Dashboard Analítico

Este projeto é a solução Full-Stack para o desafio técnico. A partir do [Electricity Demands Dataset (Kaggle)](https://www.kaggle.com/datasets/ulrikthygepedersen/electricity-demands/data) contendo mais de **45.312 registros**, desenvolvi uma arquitetura end-to-end organizada, responsiva e voltada para a clareza analítica.

## 🎯 Atendimento aos Requisitos e Visão Analítica

A solução foi estruturada para ir além de código funcional, fornecendo verdadeiro valor analítico:

1. **Manipulação e Organização (ETL):** O script de importação (`load_csv.py`) limpa bytes e tipos sujos nativamente e executa inserção otimizada (`bulk_create`) no PostgreSQL.
2. **Back-end em Django REST:** API RESTful modularizada com serializers do DRF, provendo validação rígida de filtros (retornando HTTP 400 claro em vez de falhas silenciosas) e proteção de throttling.
3. **Interface Funcional e Limpa:** Front-end React 19 + Tailwind v4 focado na experiência do usuário (UX). Design harmonioso, carregamento assíncrono por gráficos ("graceful degradation" de animações em navegadores restritivos) e indicadores vitais na primeira dobra.
4. **🧠 Olhar Analítico sobre os Dados:** Fiel ao compromisso de transformar números em informações úteis, identifiquei uma peculiaridade histórica gravada na visualização: *As métricas do estado de Victoria (VIC) fluem como uma linha constante no primeiro ano do dataset.* Isso não é um erro de manipulação, mas um reflexo da formação do mercado elétrico australiano real (onde a leitura contínua começou no ano seguinte e o autor do dataset imputou o passado com a média constante). O sistema de insights capta e evidencia essas minúcias confiavelmente.

---

## 🛠️ Stack Tecnológica

* **Back-end:** Python, Django, Django REST Framework
* **Banco de Dados:** PostgreSQL 15
* **Front-end:** React 19, Vite, Tailwind CSS v4, Recharts
* **Infraestrutura:** Docker, Docker Compose, Gunicorn + Nginx

---

## 🚀 Como Executar Localmente

Toda a solução está containerizada e requer apenas o **Docker** instalado.

### Opção 1: Inicialização Expressa (Recomendada)

**Windows:**
```bash
.\setup.bat
```

**Linux / Mac:**
```bash
make setup
```

### Opção 2: Inicialização Manual (Passo a passo)

Se preferir rodar os comandos individualmente pelo terminal:

```bash
# 1. Suba os containers do Banco, Backend e Frontend em background
docker compose up -d --build

# 2. Aguarde 5 segundos para o banco mapear e aplique as migrações
docker compose exec web python manage.py migrate

# 3. Importe a base de dados original para o PostgreSQL
docker compose exec web python manage.py load_csv
```

### 🌐 Acessando a Aplicação
Após executar o script de inicialização, abra o navegador:
* **Frontend:** [http://localhost:5173/](http://localhost:5173/)
* **API Endpoints:** [http://localhost:8000/api/electricity/dashboard/](http://localhost:8000/api/electricity/dashboard/)

---

## 🧪 Estrutura da API (Endpoints)

Base URL: `/api/electricity/`

---

### Requisição bem-sucedida

```bash
curl "http://localhost:8000/api/electricity/dashboard/kpis/?day=Monday&class=UP"
```

Resposta `200 OK`:
```json
{
  "total_records": 1,
  "avg_nsw_price": 0.05,
  "avg_vic_price": 0.03,
  "avg_transfer": 0.01
}
```

### Filtro inválido

```bash
curl "http://localhost:8000/api/electricity/dashboard/kpis/?day=Xyz"
```

Resposta `400 Bad Request`:
```json
{
  "detail": "Filtros inválidos",
  "errors": {
    "day": ["Dia inválido: 'Xyz'. Valores aceites: Friday, Monday, Saturday, Sunday, Thursday, Tuesday, Wednesday"]
  }
}
```

### Valores aceites nos filtros

| Parâmetro | Valores válidos |
|---|---|
| `day` | `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`, `Sunday` |
| `class` | `UP`, `DOWN` |

### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/dashboard/` | Agrega KPIs + dados de todos os gráficos |
| GET | `/dashboard/kpis/` | Apenas os 4 KPIs cardinais |
| GET | `/dashboard/charts/demand/` | Série temporal NSW vs VIC |
| GET | `/dashboard/charts/classes/` | Distribuição UP / DOWN |
| GET | `/dashboard/charts/days/` | Procura média por dia da semana |

---

## 🧪 Cobertura de Testes

O projeto segue TDD na camada principal de dados com **29 testes unitários independentes** cobrindo os modelos, os comportamentos de endpoint, e falha proposital de filtros.

**Como rodar e certificar:**
```bash
docker compose exec web python manage.py test apps.electricity -v2
```
