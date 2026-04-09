# MList

Dashboard de links para produtividade em sua nova aba. Compatível com navegadores Chromium.

## Visão Geral

O **MList** é uma extensão para navegadores Chromium (Chrome, Edge, Brave, Vivaldi, etc.) que substitui a página padrão de nova aba por um dashboard personalizado de links frequentes.

O foco do projeto é oferecer uma experiência simples e rápida para organizar recursos úteis do dia a dia em **cards (boards)** por categoria, facilitando navegação, foco e produtividade.

## Funcionalidades 

- Substitui a página de nova aba de navegadores Chromium por uma interface personalizada
- Organização de links em boards/categorias
- Drag and drop de cards entre colunas e dentro da mesma coluna
- Drag and drop de links dentro do card e entre cards diferentes
- Preview visual de inserção durante drag and drop
- Criação de temas personalizados com upload de imagem
- Extração automática de paleta de cores dos temas
- Opção de abrir links em nova guia (configurável)
- Estrutura visual baseada em cards
- Persistência local de dados com `chrome.storage.local`/`localStorage` e `IndexedDB`
- Migração automática de dados legados para o novo formato de board por aba
- Interface pensada para acesso rápido aos links mais utilizados

## Tecnologias Utilizadas

- **React**
- **Vite**
- **JavaScript (ES6+)**
- **dnd-kit** para drag and drop (`@dnd-kit/core` e `@dnd-kit/sortable`)
- **Chrome Extensions API**
- **chrome.storage.local** para armazenamento local
- **IndexedDB** para imagens de temas customizados
- **CSS Modules** para estilização de componentes

## Como Rodar o Projeto Localmente 🚀

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 20.19 ou superior)
- npm (geralmente instalado junto com o Node.js)
- Navegador Chromium (Chrome, Edge, Brave, Vivaldi, etc.)

### Passo a passo

1. Clone o repositório:

```bash
git clone <URL_DO_REPOSITORIO>
```

2. Acesse a pasta do projeto:

```bash
cd MList
```

3. Instale as dependências:

```bash
npm install
```

4. Rode o ambiente de desenvolvimento:

```bash
npm run dev
```

5. Abra o endereço exibido no terminal (normalmente `http://localhost:5173`) para visualizar a aplicação em modo de desenvolvimento.

## Build e Instalação como Extensão em Navegadores Chromium 

### 1) Gerar build de produção

```bash
npm run build
```

Após o build, os arquivos otimizados serão gerados na pasta `dist/`.

### 2) Carregar a extensão no navegador

**Para Chrome, Edge, Brave, Vivaldi e outros navegadores Chromium:**

1. Abra o navegador e acesse `chrome://extensions/` (ou `edge://extensions/`, `brave://extensions/`, conforme o navegador)
2. Ative o **Modo do desenvolvedor** (canto superior direito)
3. Clique em **Carregar sem compactação**
4. Selecione a pasta de build da extensão (ex.: `dist/`)
5. Confirme se a extensão foi carregada corretamente

### 3) Testar a nova aba

1. Abra uma nova aba no navegador
2. Verifique se o dashboard do MList está sendo exibido
3. Teste criação/edição dos cards, temas personalizados e persistência dos links

## Migração de Dados

As versões atuais migraram o formato de persistência para um modelo unificado por aba.

- A migração é automática ao abrir cada aba
- Os dados antigos (formato legado) sao lidos e convertidos para o novo formato
- As chaves legadas nao sao removidas durante a migracao, reduzindo risco de perda de dados
- Em caso de falha de escrita no storage, os dados antigos permanecem disponiveis

## Instalação pela Release

Use este fluxo quando quiser instalar uma versão estável já empacotada.

### 1) Baixar a release

1. Acesse a página de releases do repositório no GitHub
2. Abra a versão desejada (ex.: `v1.1.0`)
3. Baixe o arquivo `.zip` de distribuição da extensão (normalmente `mlist-dist.zip`)

### 2) Extrair os arquivos

1. Extraia o conteúdo do `.zip` em uma pasta local
2. Confirme que a pasta extraída contém os arquivos da extensão (incluindo `manifest.json`)

### 3) Instalar no navegador

1. Abra o navegador e acesse `chrome://extensions/` (ou equivalente para seu navegador Chromium)
2. Ative o **Modo do desenvolvedor**
3. Clique em **Carregar sem compactação**
4. Selecione a pasta extraída da release

### 4) Atualizar para uma nova versão

1. Baixe o `.zip` da nova release
2. Extraia os arquivos **por cima da pasta da extensão já instalada** (substituindo os arquivos antigos pelos novos)
3. No navegador, acesse `chrome://extensions/` (ou equivalente para seu navegador Chromium)
4. Clique em **Recarregar** na extensão MList (ou use o botão global de recarregar/atualizar extensões)
5. Abra uma nova aba para validar a versão atualizada

## Contribuição

Contribuições são bem-vindas.

### Fluxo recomendado

1. Faça um fork do projeto
2. Crie uma branch para sua alteração

```bash
git checkout -b feat/minha-melhoria
```

3. Instale as dependências e rode localmente

```bash
npm install
npm run dev
```

4. Valide o build antes de abrir PR

```bash
npm run build
```

5. Faça commit com mensagem clara

```bash
git add .
git commit -m "feat: descreve sua melhoria"
```

6. Envie sua branch

```bash
git push origin feat/minha-melhoria
```

7. Abra um Pull Request com:
- resumo da mudança
- motivação
- prints/gifs (quando houver alteração visual)
- passos para testar

### Boas práticas

- Mantenha PRs pequenos e focados
- Evite misturar refactor grande com nova feature
- Atualize documentação quando necessário
- Garanta que a aplicação builda sem erros

## Roadmap (Possíveis Melhorias Futuras) 

- [ ] Busca rápida global de links
- [ ] Importação e exportação de dados (JSON)
- [ ] Sincronização opcional entre dispositivos (quando aplicável)
- [ ] Temas visuais (claro/escuro e personalização de cores)
- [ ] Atalhos de teclado para navegação rápida
- [ ] Indicadores de uso/links mais acessados

## Objetivo do Projeto

Este projeto foi desenvolvido com foco em **produtividade** e **organização pessoal**, servindo também como peça de portfólio para demonstrar:

- Construção de interfaces com React
- Empacotamento com Vite
- Uso de APIs de extensões do Chrome
- Gerenciamento de estado e persistência local