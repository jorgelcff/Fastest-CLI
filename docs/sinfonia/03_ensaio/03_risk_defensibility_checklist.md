# Risk & Defensibility Checklist - Fastest CLI

## Projeto
**Fastest CLI** - Geracao de testes Jest via IA a partir de requisitos em linguagem natural.

---

## 1. Equidade (Fairness)

| Risco | Severidade | Probabilidade | Mitigacao |
|-------|------------|---------------|-----------|
| LLM gera apenas testes de caminho feliz (happy path), ignorando cenarios de erro | Media | Alta | Instrucoes explicitas no prompt para cobrir cenarios de erro, edge cases e excecoes |
| Vies em direcao a padroes de teste de linguagens/frameworks mais populares | Baixa | Media | Prompt especifico para Jest + TypeScript, com restricoes claras de formato |
| Geracao de testes superficiais que inflam cobertura sem validar logica | Media | Media | Metrica de delta de cobertura + revisao humana obrigatoria antes de commit |
| Qualidade inconsistente entre provedores (OpenAI vs Anthropic) | Baixa | Media | Testes de validacao identicos para ambos os provedores; documentacao de diferencas |

### Acoes

- [x] Prompt inclui instrucao para cobrir cenarios de erro
- [ ] Adicionar analise automatica de diversidade de cenarios nos testes gerados
- [ ] Benchmark comparativo entre provedores para mesmos inputs

---

## 2. Privacidade

| Risco | Severidade | Probabilidade | Mitigacao |
|-------|------------|---------------|-----------|
| Codigo fonte enviado para APIs externas (OpenAI/Anthropic) | Alta | Certa | Documentacao clara ao usuario; opcao futura de provedor local |
| Chaves API armazenadas em arquivo local `~/.fastest/config.json` | Media | Certa | Permissoes restritas no arquivo (600); chaves nao logadas em output |
| Codigo fonte pode conter dados sensiveis (credenciais hardcoded, PII) | Alta | Baixa | Alerta no README; responsabilidade do usuario sanitizar codigo |
| Logs podem capturar trechos de codigo fonte | Media | Baixa | Modo verbose desabilitado por padrao; logs nao persistidos |

### Acoes

- [x] Chaves API armazenadas localmente, nao em repositorio
- [x] Suporte a variaveis de ambiente (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) como alternativa
- [ ] Implementar alerta quando arquivo fonte contiver padroes de credenciais
- [ ] Adicionar suporte a provedores locais (Ollama) para uso sem envio externo
- [ ] Documentar politicas de retencao de dados dos provedores

---

## 3. Seguranca

| Risco | Severidade | Probabilidade | Mitigacao |
|-------|------------|---------------|-----------|
| Prompt injection via arquivos fonte maliciosos | Alta | Baixa | Codigo fonte e tratado como dados, nao como instrucao; sanitizacao basica |
| Codigo gerado pelo LLM pode conter codigo malicioso | Alta | Muito Baixa | Modo dry-run mostra codigo antes de salvar; usuario revisa antes de executar |
| Execucao automatica de testes gerados pode ter efeitos colaterais | Media | Baixa | Testes executados em ambiente Jest isolado; mocks para dependencias externas |
| Dependencias npm com vulnerabilidades conhecidas | Media | Media | Audit regular; dependabot/renovate configurado |
| Exfiltracao de dados via codigo de teste gerado | Alta | Muito Baixa | Revisao humana obrigatoria; testes executados localmente |

### Acoes

- [x] Modo `--dry-run` disponivel para inspecao antes de salvar
- [x] Usuario ve codigo gerado antes de qualquer execucao
- [ ] Implementar sandbox para execucao de testes gerados
- [ ] Adicionar validacao estatica (AST) do codigo gerado antes de salvar
- [ ] Limitar imports permitidos no codigo gerado

---

## 4. Transparencia

| Risco | Severidade | Probabilidade | Mitigacao |
|-------|------------|---------------|-----------|
| Usuario nao entende como o teste foi gerado | Baixa | Media | Codigo gerado e legivel; comentarios explicativos no output |
| Falha silenciosa na geracao (LLM retorna lixo) | Media | Baixa | Validacao de compilacao + execucao; erro claro ao usuario |
| Usuario nao sabe qual modelo/provedor esta sendo usado | Baixa | Alta | Exibir provedor e modelo no output do comando |
| Custos de API nao sao visiveis ao usuario | Media | Alta | Documentar custos estimados; considerar exibir tokens usados |

### Acoes

- [x] Codigo gerado e exibido integralmente ao usuario
- [x] Modo `--dry-run` permite inspecao sem efeitos colaterais
- [x] Comando `fastest doctor` verifica estado da configuracao
- [x] Provedor e modelo configuraveis e visiveis via `fastest config list`
- [ ] Exibir contagem de tokens e custo estimado apos cada geracao
- [ ] Adicionar flag `--verbose` para mostrar prompt completo enviado ao LLM

---

## Resumo de Riscos

| Dimensao | Riscos Criticos | Riscos Medios | Riscos Baixos | Status |
|----------|----------------|---------------|---------------|--------|
| Equidade | 0 | 2 | 2 | Aceitavel |
| Privacidade | 2 | 2 | 0 | Requer atencao |
| Seguranca | 2 | 2 | 0 | Requer atencao |
| Transparencia | 0 | 2 | 2 | Aceitavel |

### Veredicto Geral

**Risco Moderado** - O projeto pode prosseguir com as mitigacoes existentes. As areas de privacidade e seguranca requerem atencao continua, especialmente o envio de codigo fonte para APIs externas e a validacao de codigo gerado. A opcao futura de provedores locais e a validacao AST sao as mitigacoes de maior impacto pendentes.
