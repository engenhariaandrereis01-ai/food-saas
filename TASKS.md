# Tarefas - Food SaaS Multi-Tenant

## Fase 1: Modelo de Dados Multi-Tenant [/] EM ANDAMENTO
- [ ] Criar tabela `tenants` (restaurantes)
- [ ] Criar tabela `usuarios_tenant` (usuários por restaurante)
- [ ] Adicionar `tenant_id` em todas as tabelas existentes
- [ ] Configurar RLS (Row Level Security)
- [ ] Criar tenant de exemplo para testes

## Fase 2: Autenticação por Tenant
- [ ] Modificar Login.jsx para identificar tenant
- [ ] Criar TenantContext.jsx
- [ ] Criar hook useTenant.js
- [ ] Proteger rotas por tenant

## Fase 3: Roteamento por Slug
- [ ] Modificar App.jsx para detectar slug na URL
- [ ] Criar rota /:slug/cardapio
- [ ] Criar rota /:slug/garcom
- [ ] Aplicar tema dinâmico por tenant

## Fase 4: Painel Self-Service
- [ ] Página de Landing (público)
- [ ] Página de Cadastro/Onboarding
- [ ] CRUD de Produtos com upload
- [ ] CRUD de Categorias
- [ ] Página de Configurações

## Fase 5: Upload de Imagens
- [ ] Configurar Supabase Storage
- [ ] Componente de Upload
- [ ] Integrar com CRUD de Produtos

## Fase 6: Personalização Visual
- [ ] CSS Variables dinâmicas
- [ ] Aplicar logo/cores por tenant

## Fase 7: Planos e Cobrança
- [ ] Tabela de planos
- [ ] Integração com gateway de pagamento
- [ ] Portal de assinatura
