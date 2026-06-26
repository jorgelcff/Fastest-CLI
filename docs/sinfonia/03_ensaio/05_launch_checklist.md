# Launch Checklist - Fastest CLI

## Projeto
**Fastest CLI v0.0.2** - Publicacao no npm como pacote publico `fastest-cli`.

---

## 1. Informacoes do Release

| Campo | Valor |
|-------|-------|
| Pacote npm | `fastest-cli` |
| Versao | 0.0.2 |
| Registro | npm public registry |
| Comando de instalacao | `npm install -g fastest-cli` |
| Binario | `fastest` |
| Licenca | Verificar package.json |

---

## 2. Pre-requisitos Tecnicos

### Build e Qualidade

- [ ] `npm run build` completa sem erros
- [ ] `npm test` passa todos os 154 testes
- [ ] Cobertura >= 80% (atual: 81.68%)
- [ ] Sem vulnerabilidades criticas (`npm audit`)
- [ ] `fastest doctor` funciona corretamente apos build
- [ ] TypeScript compila sem erros (`tsc --noEmit`)

### Configuracao do Pacote

- [ ] `package.json` com versao `0.0.2`
- [ ] Campo `bin` aponta para o entry point correto
- [ ] Campo `files` inclui apenas arquivos necessarios (dist/, README)
- [ ] Campo `engines` especifica versao minima do Node.js
- [ ] `.npmignore` ou `files` exclui: `src/`, `tests/`, `.env`, `node_modules/`
- [ ] `main` e `types` apontam para `dist/`

### Dependencias

- [ ] Todas as dependencias de producao estao em `dependencies` (nao `devDependencies`)
- [ ] Versoes fixas ou ranges seguros para: commander.js v14, chalk v4, ora v5, openai v6, @anthropic-ai/sdk v0.92
- [ ] Sem dependencias desnecessarias no bundle final

---

## 3. Testes de Integracao Pre-Lancamento

### Teste Manual Obrigatorio

- [ ] Instalar globalmente a partir do build local: `npm link`
- [ ] Executar `fastest --version` - exibe versao correta
- [ ] Executar `fastest --help` - exibe ajuda formatada
- [ ] Executar `fastest doctor` - verifica dependencias e configuracao
- [ ] Executar `fastest config set provider openai` - configura provedor
- [ ] Executar `fastest config set apiKey <chave>` - configura chave API
- [ ] Executar `fastest config list` - lista configuracao atual
- [ ] Executar `fastest generate <arquivo> -r "testar funcao principal"` - gera testes
- [ ] Executar `fastest generate <arquivo> --dry-run` - modo dry-run funciona
- [ ] Testar com provedor OpenAI (gpt-4o-mini)
- [ ] Testar com provedor Anthropic (claude-haiku)

---

## 4. Documentacao

- [ ] README.md atualizado com instrucoes de instalacao via npm
- [ ] README.md inclui exemplos de uso basicos
- [ ] DEMO.md com demonstracao visual/passo-a-passo
- [ ] CHANGELOG.md com mudancas da v0.0.2
- [ ] Badges de npm no README (versao, downloads, licenca)

---

## 5. Processo de Publicacao

### Passos

```bash
# 1. Garantir branch limpa
git status  # sem alteracoes pendentes

# 2. Atualizar versao
npm version 0.0.2

# 3. Build final
npm run build

# 4. Testes finais
npm test

# 5. Dry-run da publicacao
npm publish --dry-run

# 6. Publicar
npm publish --access public

# 7. Verificar publicacao
npm info fastest-cli

# 8. Testar instalacao global
npm install -g fastest-cli
fastest --version
```

### Tag Git

```bash
git tag v0.0.2
git push origin v0.0.2
```

---

## 6. Estrategia de Rollback

| Cenario | Acao | Comando |
|---------|------|---------|
| Bug critico nas primeiras 72h | Unpublish | `npm unpublish fastest-cli@0.0.2` |
| Bug menor apos 72h | Deprecate + patch | `npm deprecate fastest-cli@0.0.2 "use 0.0.3"` |
| Problema de seguranca | Unpublish + patch imediato | `npm unpublish` + corrigir + `npm publish` |
| Funcionalidade quebrada | Patch release | Corrigir, testar, publicar v0.0.3 |

**Nota**: `npm unpublish` so e possivel nas primeiras 72 horas apos publicacao.

---

## 7. Comunicacao

| Canal | Acao | Responsavel | Status |
|-------|------|-------------|--------|
| GitHub | Release notes com tag v0.0.2 | Mantenedor | [ ] |
| npm | Descricao e keywords atualizados | Mantenedor | [ ] |
| README | Instrucoes de instalacao atualizadas | Mantenedor | [ ] |

---

## 8. Monitoramento Pos-Lancamento

### Primeira Semana

- [ ] Monitorar issues no GitHub
- [ ] Verificar downloads no npm (`npm info fastest-cli`)
- [ ] Testar instalacao limpa em ambiente novo
- [ ] Responder issues/PRs em ate 48h

### Primeiro Mes

- [ ] Coletar feedback de usuarios
- [ ] Avaliar necessidade de patch releases
- [ ] Planejar roadmap v0.1.0

---

## 9. Criterios Go / No-Go

### Go (todos devem ser verdadeiros)

| Criterio | Status |
|----------|--------|
| Build passa sem erros | [ ] |
| 154 testes passam | [ ] |
| Cobertura >= 80% | [ ] |
| `fastest doctor` funciona | [ ] |
| Geracao funciona com OpenAI | [ ] |
| Geracao funciona com Anthropic | [ ] |
| Dry-run funciona | [ ] |
| README atualizado | [ ] |
| Sem vulnerabilidades criticas | [ ] |

### No-Go (qualquer um bloqueia)

| Criterio | Status |
|----------|--------|
| Build falha | [ ] |
| Testes falhando | [ ] |
| Cobertura < 75% | [ ] |
| Vulnerabilidade critica em dependencia | [ ] |
| Geracao de testes nao funciona com nenhum provedor | [ ] |
| Chaves API expostas no pacote | [ ] |
