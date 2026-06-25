# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [2.1.0] - 2026-06-25

### Adicionado
- Comando `fastest batch` para geração de testes em múltiplos arquivos simultaneamente
- Comando `fastest init` — wizard interativo de configuração
- Lógica de retry com LLM (`--retries`) — reenvia erros de compilação ao LLM para correção automática
- Validação de testes gerados — verifica imports, casos de teste, blocos describe e asserções
- Suporte a Vitest como framework de teste (`--framework vitest|jest|auto`)
- Cache de respostas LLM (`--cache`) para evitar chamadas redundantes à API
- Subcomando `fastest config cache` para gerenciar o cache (stats/clear)
- Workflow de CI com GitHub Actions (Node 18/20/22)
- Thresholds de cobertura configuráveis em `analyzeCriticalFlowGaps`
- Documentação completa da metodologia Sinfonia (15 artefatos em 4 fases)

### Alterado
- Cobertura de testes aumentada de 81.68% para 96%+
- Movido `math.utils.spec.ts` de `tests/` para `example/` (teste de exemplo)

### Removido
- Dependência desnecessária `@types/ora` (ora v5 já inclui tipos)
- Dependências `supertest` e `@types/supertest` do devDependencies (pertencem ao projeto do usuário)

## [2.0.0] - 2026-06-20

### Adicionado
- Suporte a Anthropic Claude como provedor LLM alternativo
- Abstração de provedores com factory pattern (`provider.interface.ts`, `provider.factory.ts`)
- Detecção automática de provedor baseada no nome do modelo (`claude-*` → Anthropic)
- Comando `fastest config` para gerenciamento de configuração global
  - `set-key` — armazenar API keys por provedor
  - `show` — exibir configuração atual
  - `set-model` — definir modelo padrão
  - `clear` — limpar toda configuração
- Configuração global persistente em `~/.fastest/config.json`
- Resolução de API key com prioridade: argumento CLI → variável de ambiente → config global
- Geração de testes de integração (`--test-type integration`) com Jest + Supertest
- Flag `--suggest` para sugerir testes adicionais baseados em gaps de cobertura
- Guard rails de contexto: limites de arquivos, caracteres por arquivo, caracteres totais
- Flag `--strict-context` para falhar em violações de guard rails
- Tabela de cobertura antes/depois/delta com cores
- Análise de gaps críticos de cobertura
- Validação de TypeScript via `tsc --noEmit` antes de executar testes
- Comando `fastest doctor` com validação do provedor ativo e fonte da API key
- Suporte a streaming de tokens durante geração

### Alterado
- Flag `--model` agora suporta modelos de qualquer provedor
- Saída CLI com formatação aprimorada (chalk, ora, tabelas)

## [1.0.0] - 2026-05-01

### Adicionado
- Pipeline de geração de testes unitários com LLM (OpenAI)
- Comando `fastest generate` com opções `--card`, `--file`, `--output`, `--model`, `--dry-run`
- Detecção automática de linguagem (TypeScript/JavaScript)
- Remoção de code fences do markdown gerado pelo LLM
- Correção automática de paths de import nos testes gerados
- Contagem de casos de teste no código gerado
- Execução do Jest com análise de cobertura
- Comando `fastest doctor` para validação de ambiente
- Script de setup interativo (`npm run setup`)
- Exemplos: `math.utils.ts` e `order.service.ts`
