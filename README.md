# ⚡ Energy Pulse — Dashboard Analítico de Demanda de Energia

Este repositório apresenta uma solução **Full-Stack** para análise e visualização de dados de demanda de energia elétrica nos estados australianos **NSW** e **VIC**. A aplicação processa uma base de dados com mais de 45 mil registos, disponibilizando métricas agregadas e gráficos interativos através de uma interface limpa e profissional.

## 🧱 Stack Tecnológica

### Back-end
- **Django + Django REST Framework** — API REST
- **PostgreSQL 15** — Banco de dados relacional
- **Gunicorn** — Servidor WSGI (produção)
- **Pandas** — Processamento e limpeza dos dados

### Front-end
- **React 19** — Componentes funcionais com Hooks
- **Vite 8** — Build tool e dev server
- **Tailwind CSS v4** — Estilização utilitária
- **Recharts** — Visualização de dados
- **Lucide React** — Iconografia

### Infraestrutura
- **Docker + Docker Compose** — Ambientes isolados e reproduzíveis
- **Nginx** — Servir estáticos e proxy reverso (produção)
- **Multi-stage build** — Imagem final ~25 MB

## 📊 Fonte dos Dados

Os dados utilizados neste projeto foram obtidos a partir do seguinte dataset público:

- [Electricity Demands Dataset (Kaggle)](https://www.kaggle.com/datasets/ulrikthygepedersen/electricity-demands/data)

## 🛠️ Pré-requisitos

Para rodar este projeto, precisas de ter instalado:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Git

---

## 🚀 Como Executar

### 🏃 Via Expressa

#### Windows
```bash
.\setup.bat
```

#### Linux / Mac
```bash
make setup
```

O script trata de tudo: sobe os containers, aplica migrações e carrega os dados.

### 🖐️ Via Manual (passo a passo)

```bash
# 1. Clona o repositório
git clone https://github.com/1arley/projeto-dashboard.git
cd projeto-dashboard

# 2. Sobe a infraestrutura (PostgreSQL + Django + Frontend)
docker compose up -d --build

# 3. Aplica as migrações
docker compose exec web python manage.py migrate

# 4. Carrega os dados do CSV
docker compose exec web python manage.py load_csv

# 5. Acede ao dashboard
# Frontend: http://localhost:5173
# API:      http://localhost:8000/api/electricity/dashboard/
```

### 🌐 Produção

```bash
docker compose -f docker-compose.prod.yml up -d --build
# Aceder em: http://localhost:80
```

---

## 📐 Layout do Dashboard

```
┌──────────────────────────────────────────────────────────┐
│  ⚡ Energy Pulse ··· 25 de abril de 2026                 │
├──────────────────────┬───────────────────┬───────────────┤
│  45.312 Registos     │  Preço Médio NSW  │  Preço VIC    │
├──────────────────────┴───────────────────┴───────────────┤
│ ┌────────────────────────────────────┐ ┌───────────────┐ │
│ │   Evolução da Demanda (NSW + VIC)  │ │  UP / DOWN    │ │
│ │   Gráfico de Linhas                │ │  Donut Chart  │ │
│ └────────────────────────────────────┘ └───────────────┘ │
├──────────────────────────────────────────────────────────┤
│  Energy Pulse © 2026 — Dados processados via API Django   │
└──────────────────────────────────────────────────────────┘
```

### Componentes

| Componente | Descrição |
|---|---|
| `KpiCard` | Cartão de métrica com ícone, label e valor formatado |
| `DemandLineChart` | Gráfico de linhas (NSW + VIC) com Recharts |
| `ClassPieChart` | Gráfico donut (UP / DOWN) com label central |
| `Dashboard` | Página principal com layout responsivo em grid |

---

## 📂 Arquitetura do Projeto

```
projeto-dashboard/
├── config/                        # Configurações Django
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/electricity/              # Módulo de domínio (energia)
│   ├── api/
│   │   ├── views.py               # Endpoint da dashboard
│   │   ├── serializers.py
│   │   └── urls.py
│   ├── management/commands/
│   │   └── load_csv.py            # Script de importação de dados
│   ├── models.py                  # Modelo ElectricityRecord
│   └── admin.py
├── frontend/                      # Aplicação React
│   ├── src/
│   │   ├── components/
│   │   │   ├── KpiCard.jsx
│   │   │   ├── DemandLineChart.jsx
│   │   │   └── ClassPieChart.jsx
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   └── api.js             # Cliente Axios
│   │   ├── index.css              # Design System (Tailwind v4)
│   │   └── App.jsx
│   ├── Dockerfile                 # Multi-stage (dev + production)
│   ├── nginx.conf                 # Proxy reverso + SPA fallback
│   └── vite.config.js
├── docker-compose.yml             # Desenvolvimento
├── docker-compose.prod.yml        # Produção (override)
├── Dockerfile                     # Back-end Django
├── setup.bat                      # Setup automático (Windows)
├── Makefile                       # Setup automático (Linux/Mac)
├── electricity.csv                # Dataset
└── requirements.txt
```

---

## 🧪 Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/electricity/dashboard/` | KPIs + dados dos gráficos |

### Resposta (exemplo)

```json
{
  "kpis": {
    "total_records": 45312,
    "avg_nsw_price": 0.0578,
    "avg_vic_price": 0.0034
  },
  "charts": {
    "class_distribution": [
      { "demand_class": "UP", "total": 19236 },
      { "demand_class": "DOWN", "total": 26076 }
    ],
    "demand_by_period": [
      { "period": 0.0, "avg_nsw_demand": 0.439, "avg_vic_demand": 0.422 }
    ]
  }
}
```

---

## 🎨 Design System

- **Fundo:** `bg-gray-50`
- **Cartões:** `bg-white border border-gray-100 shadow-sm rounded-xl`
- **Tipografia:** DM Sans (Google Fonts)
- **Cores dos gráficos:**
  - NSW Demand — `slate-500`
  - VIC Demand — `teal-500`
  - Classe UP — `amber-500`
  - Classe DOWN — `slate-400`

---

## 🐳 Comandos Docker úteis

```bash
# Ver logs
docker compose logs -f frontend
docker compose logs -f web

# Executar comandos no Django
docker compose exec web python manage.py shell
docker compose exec web python manage.py migrate

# Reconstruir um serviço específico
docker compose up -d --build frontend

# Parar tudo e limpar volumes (apaga a BD)
docker compose down -v
```
