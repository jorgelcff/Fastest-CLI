# Persona Model Canvas

---

## Persona 1: Carlos, o Desenvolvedor Backend

### Nome
Carlos Silva, 28 anos — Desenvolvedor Backend Pleno

### Descricao
Carlos trabalha em uma startup de fintech ha 2 anos, desenvolvendo APIs REST em Node.js com TypeScript. Ele e competente em arquitetura de servicos e banco de dados, mas consistentemente deixa testes para depois. Seu time usa Jest como framework de testes e tem uma meta de cobertura de 70% no CI, que frequentemente falha. Carlos sabe que deveria escrever mais testes, mas acha o processo repetitivo e prefere gastar tempo em logica de negocios. Ele esta confortavel com a linha de comando e usa npm/yarn diariamente.

### Objetivos/Ganhos
| # | Objetivo |
|---|----------|
| 1 | Atingir a meta de 70% de cobertura sem gastar horas escrevendo testes manualmente |
| 2 | Gerar testes para modulos legados que nao tem nenhuma cobertura |
| 3 | Ter testes que realmente testam a logica do codigo, nao apenas testes triviais |
| 4 | Integrar a geracao de testes no seu fluxo de trabalho sem fricao (um comando no terminal) |
| 5 | Poder especificar requisitos em linguagem natural ao inves de pensar em casos de teste |

### Dores
| # | Dor | Intensidade |
|---|-----|-------------|
| 1 | Escrever mocks e fixtures para cada teste e extremamente tedioso | Alta |
| 2 | O CI falha por cobertura insuficiente e ele precisa parar a feature para escrever testes | Alta |
| 3 | Nao sabe quais edge cases cobrir — frequentemente descobre bugs que testes teriam pego | Media |
| 4 | Configurar Jest com TypeScript, paths e transformers e confuso | Media |
| 5 | Code reviews atrasam porque reviewers pedem mais testes | Alta |

### Cenarios de Uso
| # | Cenario | Comando |
|---|---------|---------|
| 1 | Carlos acabou de implementar um novo endpoint de pagamentos. Roda `fastest generate` apontando para o arquivo do service e um card descrevendo os requisitos de negocio. Em 2 minutos tem uma suite de testes com happy path e edge cases. | `fastest generate --source src/payments/payment.service.ts --card cards/payment-flow.md` |
| 2 | Antes de abrir um PR, Carlos roda `fastest doctor` para verificar se o ambiente esta configurado corretamente (chave de API, Jest, TypeScript). | `fastest doctor` |
| 3 | Carlos quer ver o impacto dos testes gerados na cobertura. O Fastest mostra a tabela delta: statements passou de 45% para 72%. | Saida automatica apos geracao |
| 4 | Carlos configura o modelo padrao para `gpt-4o-mini` para economizar na API. | `fastest config set-model gpt-4o-mini` |

---

## Persona 2: Marina, a Tech Lead

### Nome
Marina Costa, 34 anos — Tech Lead

### Descricao
Marina lidera um time de 6 desenvolvedores em uma empresa de e-commerce. Ela e responsavel pela qualidade do codigo, definicao de padroes e integracao continua. Marina configura pipelines de CI/CD no GitHub Actions e monitora metricas de cobertura semanalmente. Ela percebe que cada desenvolvedor escreve testes de forma diferente — alguns escrevem testes excelentes, outros escrevem testes que apenas aumentam o numero de cobertura sem testar nada real. Marina busca uma ferramenta que padronize a qualidade dos testes e que possa ser integrada no pipeline do time.

### Objetivos/Ganhos
| # | Objetivo |
|---|----------|
| 1 | Garantir cobertura minima de 80% em todos os modulos do projeto |
| 2 | Padronizar a estrutura e qualidade dos testes gerados pelo time |
| 3 | Reduzir o tempo de code review gasto pedindo mais testes |
| 4 | Integrar geracao de testes no pipeline de CI/CD como step automatizado |
| 5 | Ter visibilidade clara do impacto de cobertura (tabelas before/after/delta) |
| 6 | Controlar custos de API com guard rails de contexto configuráveis |

### Dores
| # | Dor | Intensidade |
|---|-----|-------------|
| 1 | Inconsistencia na qualidade dos testes entre membros do time | Alta |
| 2 | Tempo excessivo em code reviews pedindo cobertura de edge cases | Alta |
| 3 | Metricas de cobertura flutuam — sobem em um sprint e caem no seguinte | Media |
| 4 | Dificuldade em justificar o tempo gasto em testes para stakeholders | Media |
| 5 | Onboarding de novos devs: cada um traz seu estilo de testes | Media |
| 6 | Modulos legados com 0% de cobertura que ninguem quer tocar | Alta |

### Cenarios de Uso
| # | Cenario | Comando/Acao |
|---|---------|-------------|
| 1 | Marina adiciona um step no GitHub Actions que roda `fastest generate` para modulos modificados no PR, gerando testes automaticamente e reportando cobertura delta como comentario no PR. | Step no workflow CI |
| 2 | Marina configura o Fastest no projeto com limites de contexto (max 10 arquivos, 50k chars total) para controlar custos de API do time. | `fastest config` + `.fastest.json` |
| 3 | Marina usa o relatorio de cobertura delta para avaliar se um PR atinge os padroes do time antes de aprovar. | Analise da tabela before/after/delta |
| 4 | Marina troca o provider de OpenAI para Anthropic para testar se o Claude Haiku gera testes de melhor qualidade para o estilo do projeto. | `fastest config set-model claude-haiku-4-5-20251001` |
| 5 | Um novo dev entra no time. Marina pede que ele use `fastest generate` para os primeiros PRs, garantindo que os testes sigam o padrao do projeto desde o inicio. | Documentacao de onboarding |
