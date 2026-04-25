# ⚡ Energy Demand Analytics Dashboard (ps: desculpa pela documentação longa)

Este repositório contém a solução Full-Stack para o desafio de visualização e análise de dados. O projeto processa uma base de dados de demanda de eletricidade (preços e consumo) e expõe métricas agregadas através de uma REST API.

O back-end foi desenvolvido com **Django REST Framework**, utilizando **PostgreSQL** para o armazenamento relacional dos dados e **Docker** para garantir um ambiente de execução isolado e padronizado.

## 🛠️ Pré-requisitos

Para rodar este projeto, você precisará ter instalado em sua máquina:
* [Docker](https://www.docker.com/get-started)
* [Docker Compose](https://docs.docker.com/compose/install/)
* Git

## 🚀 Como Executar o Projeto Localmente

Siga o passo a passo abaixo para levantar a infraestrutura, preparar o banco de dados e iniciar a API.

## 🏃💨 Via Expressa

Como programador, sei que executar vários comandos de configuração manualmente pode ser um saco. A pensar na melhor experiência para quem for avaliar ou testar este código, criei scripts de automação que levantam a infraestrutura, aplicam as migrações e populam a base de dados com um único comando. ja que infelizmente não tenho o meu amigo package.json para facilitar a minha vida com um "npm run dev".

### 🪟 Windows
```bash
.\setup.bat
```

### 🐧/🍎 Linux/Mac
```bash
make setup
```

## 🖐️ A Via Manual

### 1. Clone o repositório
```bash
git clone [https://github.com/1arley/projeto-dashboard.git](https://github.com/1arley/projeto-dashboard.git)
cd NOME-DO-REPOSITORIO
```

### 2. Inicie os Containers (Banco de Dados e Back-end)

Na raiz do projeto (onde o arquivo docker-compose.yml está localizado), execute o comando abaixo para construir a imagem do Python e iniciar o PostgreSQL:

```bash
docker compose up -d --build
```

### 3. Crie a estrutura do banco de dados

Com os containers em execução, aplique as migrações para criar as tabelas necessárias no PostgreSQL:

```bash
docker compose exec web python manage.py migrate
```

### 4. Popule o banco de dados

O repositório já contém o arquivo electricity.csv. Para extrair, limpar e carregar esses dados no banco relacional, criei um script de automação. Execute:

```bash
docker compose exec web python manage.py load_csv
```

### 5. Acesse a API

```bash
http://localhost:8000/api/electricity/dashboard/
```

# 📂 Arquitetura do Back-end
O projeto foge da estrutura padrão monolítica do Django, adotando uma organização modular baseada em domínios para maior escalabilidade:

## 🧩 Estrutura de Diretórios

### `config/`
Responsável pelas configurações globais da aplicação, incluindo:
- Settings do Django  
- Configuração de ambientes  
- Roteamento principal (URLs)  

### `apps/electricity/`
Módulo central do domínio de negócio, contendo toda a lógica relacionada à área de energia. Essa separação garante maior coesão e facilita a evolução independente do domínio.

### `models.py`
Define o mapeamento entre as estruturas de dados da aplicação e as tabelas no PostgreSQL.  
Os modelos foram projetados com base direta no dataset utilizado.

### `api/`
Camada responsável pela interface HTTP da aplicação:
- Controllers (Views)  
- Definição de endpoints  
- Serialização e tratamento de requisições/respostas  

Essa separação desacopla a lógica de apresentação da lógica de persistência.

### `management/commands/load_csv.py`
Script customizado para ingestão de dados em lote, utilizando:
- **Pandas** para processamento dos dados  
- `bulk_create` para inserção eficiente no banco  