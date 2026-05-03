# 🧠 AI Context — Fastest CLI

Este documento fornece contexto estruturado para assistentes de IA (LLMs) sobre os objetivos, escopo, arquitetura e diretrizes do projeto.

---

# 📌 Visão Geral do Projeto

**Nome:** Fastest CLI  
**Tipo:** Ferramenta de linha de comando (CLI)  
**Área:** Engenharia de Software Assistida por IA  

## 🎯 Objetivo

Desenvolver uma CLI que utiliza modelos de linguagem (LLMs) para automatizar a geração, execução e análise de testes de software a partir de descrições de tarefas (cards).

O sistema deve atuar como uma **pipeline inteligente de testes**, integrando geração automática com validação prática (execução e cobertura).

---

# 🧩 Problema

Desenvolvedores frequentemente:

- Não escrevem testes suficientes
- Focam apenas em casos felizes
- Ignoram testes de integração
- Não analisam cobertura adequadamente

Isso resulta em:
- Baixa qualidade de software
- Bugs em produção
- Débito técnico crescente

---

# 💡 Solução Proposta

Fastest CLI atua como um **copiloto de testes**, realizando:

1. Interpretação de um card (requisito textual)
2. Análise de código existente
3. Geração de testes unitários
4. Execução automática dos testes
5. Análise de cobertura
6. Sugestão de novos testes
7. (Opcional) geração de testes de integração e E2E

---

# ⚙️ Fluxo Principal (Pipeline)

```text
Card (input)
   ↓
LLM (interpretação)
   ↓
Geração de testes
   ↓
Salvar arquivos
   ↓
Executar Jest
   ↓
Analisar coverage
   ↓
Sugerir melhorias
🧠 Papel da IA no Sistema

A IA é o núcleo do sistema, responsável por:

Traduzir requisitos em testes
Identificar edge cases
Sugerir melhorias
Avaliar qualidade dos testes

⚠️ A IA NÃO é usada apenas como auxiliar — ela é parte central da lógica.

🧱 Arquitetura (alto nível)
Componentes principais
CLI (entrada do usuário)
LLM Service (integração com modelo)
Test Generator
Test Runner (Jest)
Coverage Analyzer
📂 Organização do Código
Princípios
Separação de responsabilidades
Baixo acoplamento
Código testável
Facilidade de extensão
Diretórios esperados
/cli → comandos da CLI
/services → lógica principal
/utils → helpers
/tests → testes gerados
🧪 Filosofia de Testes

Este projeto não apenas executa testes — ele gera testes automaticamente.

Tipos de testes considerados
Unitários (MVP obrigatório)
Integração (opcional)
E2E / Cypress (opcional, geração apenas)
📊 Métricas importantes

O sistema deve permitir avaliar:

Quantidade de testes gerados
Coverage antes vs depois
Taxa de sucesso dos testes
Qualidade dos testes (subjetiva + heurística)
⚠️ Limitações conhecidas

LLMs podem:

Gerar testes incorretos
Criar mocks inadequados
Ignorar cenários importantes
Produzir código não executável

👉 Portanto, validação humana é obrigatória

🧠 Diretrizes para uso de IA (disciplina)

Este projeto segue princípios de uso responsável de IA:

Permitido
Geração de código
Sugestões de testes
Debug assistido
Refinamento de prompts
Obrigatório
Revisar todo código gerado
Entender o output
Documentar uso de IA
Proibido
Usar IA como caixa preta
Submeter código não revisado
💬 Estratégia de Prompting

Os prompts devem:

Ser específicos
Definir papel da IA
Definir formato de saída
Incluir contexto suficiente
📌 Exemplo de Prompt Base
Você é um especialista em testes de software.

Dado o seguinte requisito:
{card}

E o seguinte código:
{code}

Gere testes unitários em Jest.

Inclua:
- casos principais
- edge cases
- mocks se necessário

Retorne apenas código válido.
🔍 Escopo do MVP
Incluído
CLI funcional
Geração de testes unitários
Execução com Jest
Coverage básico
Sugestão de melhorias
Fora do escopo
UI completa
Integração com Jira/GitHub
Execução real de Cypress
🧠 Decisões de Projeto
CLI ao invés de UI

Motivo:

Alinhamento com workflow de dev
Menor complexidade
Mais realista
Execução local

Motivo:

Simula uso real
Evita dependências externas
Simplifica arquitetura
📈 Critérios de Sucesso

O projeto será considerado bem-sucedido se:

Gerar testes executáveis
Melhorar coverage
Reduzir esforço manual
Demonstrar uso eficaz de IA
🔄 Evoluções Futuras
Integração com CI/CD
Suporte a múltiplas linguagens
RAG para contexto de código
Análise semântica de cobertura
Ranking de qualidade de testes
🤖 Instruções para LLMs

Se você é um assistente de IA interagindo com este repositório:

Priorize soluções simples e funcionais
Evite overengineering
Gere código executável
Mantenha consistência com a arquitetura
Respeite o escopo do MVP
🧠 Contexto Acadêmico

Este projeto faz parte da disciplina:

Engenharia de Software Assistida por IA

Foco:

Uso prático de LLMs no SDLC
Avaliação crítica de IA
Integração IA + Engenharia de Software
🚨 Importante

Este projeto NÃO é:

Um chatbot genérico
Um wrapper de LLM
Uma ferramenta sem contexto

Este projeto É:

Uma ferramenta de engenharia de software
Uma pipeline inteligente de testes
Um experimento prático de IA aplicada