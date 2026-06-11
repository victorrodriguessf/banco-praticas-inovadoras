# Banco de Práticas Educação Inovadora — Senac RN

Catálogo interativo das melhores práticas educacionais desenvolvidas pelos docentes do Senac Rio Grande do Norte. A plataforma reúne **310 práticas** dos editais de 2022, 2023, 2024 e 2025, com busca em tempo real, filtros avançados e acesso direto aos e-books completos.

---

## Funcionalidades

- **Busca em tempo real** por título, docente, metodologia e tecnologia
- **Filtros** por Ano do Edital, Marcas Formativas, Unidade (CEP) e Eixo/Segmento
- **Ordenação** por mais recentes, mais antigas e A–Z
- **Modal de resumo** com detalhes completos de cada prática (ODS, marcas formativas, situação de aprendizagem, elementos de competência)
- **Visualização no e-book** — extrai e abre as páginas específicas da prática em PDF
- **Download de e-books completos** por edição (2025 disponível; 2022–2024 em breve)
- Layout totalmente responsivo com drawers mobile para navegação e filtros

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Estilização | Tailwind CSS 4 |
| Animações | Framer Motion (motion/react) |
| Ícones | Lucide React |
| PDF | pdf-lib |

---

## Estrutura do projeto

```
src/
├── components/
│   ├── Header.tsx               # Cabeçalho sticky com navegação
│   ├── Hero.tsx                 # Seção de destaque e busca
│   ├── EbookSection.tsx         # Faixa de download dos e-books completos
│   ├── Sidebar.tsx              # Painel de filtros (desktop e mobile)
│   ├── PracticeCard.tsx         # Card de cada prática
│   └── PracticeSummaryModal.tsx # Modal com resumo completo
├── hooks/
│   └── usePractices.ts          # Lógica de filtro, busca e ordenação
├── data/
│   ├── catalogo_2022.json       # 40 práticas do edital 2022
│   ├── catalogo_2023.json       # 75 práticas do edital 2023
│   ├── catalogo_2024.json       # 91 práticas do edital 2024
│   ├── catalogo_2025.json       # 104 práticas do edital 2025
│   └── practicesAdapter.ts      # Normalização dos dados JSON → Practice
├── utils/
│   └── pdfPrint.ts              # Extração de páginas do e-book por prática
├── types.ts                     # Interfaces TypeScript e dados dos 17 ODS
└── App.tsx                      # Componente raiz e layout principal
```

---

## Como rodar localmente

**Pré-requisitos:** Node.js 18+

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (porta 3000)
npm run dev

# Build de produção
npm run build

# Verificar tipos TypeScript
npm run lint
```

---

## PDFs dos e-books

Os arquivos PDF devem estar em `public/pdfs/` com o seguinte padrão de nome:

```
public/pdfs/praticas-inovadoras-2025.pdf
public/pdfs/praticas-inovadoras-2024.pdf
```

Os arquivos não são versionados no repositório por excederem o limite de tamanho do GitHub (100 MB). Para habilitar o download por prática e o download do e-book completo, adicione os PDFs localmente nessa pasta.

---

## Dados

As práticas são armazenadas em JSON (`src/data/`) e normalizadas pelo adapter antes de serem exibidas. Cada prática contém:

- Título, docente e orientação pedagógica
- Unidade (CEP), eixo e segmento do curso
- ODS relacionados (1–17)
- Marcas formativas
- Flags: aprendizagem integradora, prática inclusiva, fomento à inclusão
- Situação de aprendizagem e elementos de competência
- Páginas correspondentes no e-book

---

## LGPD

Esta plataforma exibe dados de docentes do Senac RN (nome e orientação pedagógica) extraídos dos e-books institucionais oficiais, publicados pelo próprio Senac com finalidade de divulgação das práticas educacionais.

- A aplicação **não coleta, armazena nem transmite** dados pessoais de usuários — não há cadastro, login, cookies de rastreamento ou formulários
- Os dados exibidos são de caráter **profissional e público**, vinculados à atuação institucional dos docentes
- Qualquer solicitação de correção, atualização ou remoção de dados pode ser encaminhada ao responsável pelo projeto

Para mais informações sobre a política de privacidade do Senac RN, consulte o site institucional.

---

## Licença

© 2026 Senac RN — Todos os direitos reservados.
