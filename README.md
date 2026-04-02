# MList

Dashboard de links para produtividade em sua nova aba do Chrome.

## Visão Geral

O **MList** é uma extensão do Google Chrome que substitui a página padrão de nova aba por um dashboard personalizado de links frequentes.

O foco do projeto é oferecer uma experiência simples e rápida para organizar recursos úteis do dia a dia em **cards (boards)** por categoria, facilitando navegação, foco e produtividade.

## Funcionalidades 

- Substitui a página de nova aba do Chrome por uma interface personalizada
- Organização de links em boards/categorias
- Estrutura visual baseada em cards
- Persistência local de dados com `chrome.storage.local`
- Interface pensada para acesso rápido aos links mais utilizados

## Tecnologias Utilizadas

- **React**
- **Vite**
- **JavaScript (ES6+)**
- **Chrome Extensions API**
- **chrome.storage.local** para armazenamento local
- **CSS Modules** para estilização de componentes

## Como Rodar o Projeto Localmente 🚀

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- npm (geralmente instalado junto com o Node.js)
- Google Chrome

### Passo a passo

1. Clone o repositório:

```bash
git clone 
```

2. Acesse a pasta do projeto:

```bash
cd Mlist
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

## Build e Instalação como Extensão no Chrome 

### 1) Gerar build de produção

```bash
npm run build
```

Após o build, os arquivos otimizados serão gerados na pasta `dist/`.

### 2) Carregar a extensão no Chrome

1. Abra o Chrome e acesse `chrome://extensions/`
2. Ative o **Modo do desenvolvedor** (canto superior direito)
3. Clique em **Carregar sem compactação**
4. Selecione a pasta de build da extensão (ex.: `dist/`)
5. Confirme se a extensão foi carregada corretamente

### 3) Testar a nova aba

1. Abra uma nova aba no Chrome
2. Verifique se o dashboard do MList está sendo exibido
3. Teste criação/edição dos cards e persistência dos links

## Roadmap (Possíveis Melhorias Futuras) 

- [ ] Suporte a arrastar e soltar (drag and drop) para reordenar cards e links
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