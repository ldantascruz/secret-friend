# 🎁 Secret Friend

Uma aplicação web moderna para organizar sorteios de **Amigo Secreto** de forma simples e rápida. Sem cadastro, sem complicação!

![Next.js](https://img.shields.io/badge/Next.js-14.1-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38B2AC?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)

## ✨ Funcionalidades

- 🚀 **Criação rápida de grupos** - Configure nome, valor sugerido e data do evento
- 👥 **Gerenciamento de participantes** - Adicione participantes com nome e WhatsApp
- 🎲 **Sorteio automático** - Algoritmo que garante que ninguém tire a si mesmo
- 📱 **Notificações via WhatsApp** - Integração com Evolution API para envio automático
- 🔐 **Códigos únicos** - Cada participante recebe um código de acesso exclusivo
- 👀 **Revelação do amigo secreto** - Interface interativa para descobrir quem você tirou
- 💝 **Lista de desejos** - Participantes podem cadastrar até 3 sugestões de presente
- 📊 **Dashboard do organizador** - Acompanhe quem já visualizou o resultado

## 🛠️ Tecnologias

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Banco de dados**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Estilização**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Mensageria**: [Evolution API](https://doc.evolution-api.com/) (WhatsApp)

## 📁 Estrutura do Projeto

```
secret-friend/
├── src/
│   ├── app/
│   │   ├── access/           # Página de acesso do participante
│   │   ├── admin/[code]/     # Dashboard do organizador
│   │   ├── admin-access/     # Login do organizador
│   │   ├── create/           # Criação de novo grupo
│   │   ├── p/[code]/         # Dashboard do participante
│   │   ├── actions.ts        # Server Actions (Next.js)
│   │   └── page.tsx          # Página inicial
│   ├── components/
│   │   ├── ui/               # Componentes reutilizáveis (Button, Card, Input)
│   │   └── PixButton.tsx     # Botão de doação via Pix
│   ├── lib/
│   │   ├── draw.ts           # Algoritmo de sorteio
│   │   ├── evolution-api.ts  # Integração WhatsApp
│   │   └── supabase.ts       # Cliente Supabase
│   ├── types.ts              # Tipos TypeScript
│   └── utils/
│       └── masks.ts          # Máscaras de telefone
├── supabase/
│   └── schema.sql            # Schema do banco de dados
└── package.json
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com/)
- (Opcional) [Evolution API](https://github.com/EvolutionAPI/evolution-api) para notificações WhatsApp

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/ldantascruz/secret-friend.git
   cd secret-friend
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` com suas credenciais:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   
   # Evolution API (WhatsApp) - Opcional
   EVOLUTION_API_URL=http://localhost:8080
   EVOLUTION_INSTANCE=your_instance_name
   EVOLUTION_API_KEY=your_api_key
   ```

4. **Configure o banco de dados**
   
   Execute o script SQL no Supabase:
   ```bash
   # Copie o conteúdo de supabase/schema.sql
   # Cole no SQL Editor do Supabase Dashboard
   ```

5. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

6. Acesse [http://localhost:3000](http://localhost:3000)

## 📦 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera a build de produção |
| `npm run start` | Inicia o servidor de produção |
| `npm run lint` | Executa o linter |

## 🗄️ Banco de Dados

O projeto utiliza 3 tabelas principais:

- **groups** - Informações do grupo (nome, código, valor, data)
- **participants** - Participantes e seus pares sorteados
- **wishes** - Lista de desejos dos participantes (até 3 por pessoa)

## 📱 Integração WhatsApp

A aplicação pode enviar notificações automáticas via WhatsApp usando a [Evolution API](https://doc.evolution-api.com/). 

Funcionalidades:
- ✅ Envio automático após o sorteio
- ✅ Reenvio individual para participantes
- ✅ Envio em massa para todos os participantes

> **Nota**: A Evolution API é opcional. Sem ela, os organizadores podem copiar e compartilhar manualmente os códigos de acesso.

## 🎨 Design

A interface foi desenvolvida com foco em:
- 📱 Responsividade (mobile-first)
- ✨ Animações suaves e micro-interações
- 🎄 Tema natalino com cores quentes
- 🧩 Componentes reutilizáveis

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Feito com ❤️ para o seu Amigo Secreto 🎄
