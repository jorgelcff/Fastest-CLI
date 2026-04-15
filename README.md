# Fastest CLI

Pipeline Inteligente de Geração de Testes a partir de Cards

## 1. Título do Projeto

Fastest CLI — Pipeline Inteligente de Geração de Testes a partir de Cards

## 2. Domínio e Fase do SDLC

- Domínio: D2 — Testes de Software
- Fase: Validação e Qualidade no SDLC

## 3. Problema

A criação de testes é essencial para a qualidade do software, mas ainda é frequentemente negligenciada ou realizada de forma inconsistente. Em muitos times, desenvolvedores recebem cards com descrições funcionais e precisam traduzir esse contexto em testes de qualidade sob pressão de prazo.

Sem apoio automatizado, isso costuma gerar:

- Baixa cobertura de testes
- Ausência ou fragilidade de testes de integração
- Maior incidência de bugs em produção

## 4. Trabalhos Relacionados

- GitHub Copilot
- CodiumAI
- Diffblue Cover

### Gap Identificado

As soluções existentes auxiliam na geração de código e testes, mas não são centradas no card como entrada primária e estruturada para conduzir uma pipeline completa de validação.

## 5. Solução Proposta

Desenvolver uma pipeline com IA que execute, de forma orquestrada:

1. Recebimento do card (descrição funcional)
2. Geração automática de testes unitários
3. Execução dos testes e medição de cobertura
4. Identificação de lacunas e sugestão de novos testes
5. Geração de testes de integração
6. Geração de código de testes E2E (Cypress)

A IA atua como núcleo da geração, análise e iteração dos testes.

## 6. Arquitetura Preliminar

- CLI em Node.js
- API opcional em NestJS
- Serviço de LLM
- Executor de testes com Jest
- Analisador de cobertura com Istanbul
- Gerador de testes E2E

## 7. Escopo do MVP

### Inclui

- Geração de testes unitários
- Execução automática dos testes
- Análise de cobertura
- Sugestão de novos testes

### Exclui

- Execução real de Cypress
- Integração com ferramentas externas

## 8. Dependências Técnicas

- Node.js
- Jest
- Istanbul (coverage)
- API de LLM (OpenAI ou Claude)

## 9. Hipótese Principal

Testes gerados automaticamente a partir de cards são suficientes para melhorar cobertura e qualidade do software, reduzindo esforço manual sem comprometer consistência.

## 10. Critérios de Sucesso

- Aumento mensurável da cobertura de testes
- Execução bem-sucedida dos testes gerados
- Redução de esforço manual no processo de criação de testes

## 11. Fluxo do MVP

1. Entrada do card em linguagem natural
2. Normalização do contexto funcional
3. Geração inicial de testes unitários
4. Execução com relatório de cobertura
5. Análise de gaps (classes, funções e cenários)
6. Sugestão de testes complementares

## 12. Entregáveis Esperados

- CLI funcional para pipeline de geração de testes
- Relatório de execução e cobertura por rodada
- Mecanismo de sugestão incremental de cenários não cobertos
- Documentação de uso para replicação do experimento