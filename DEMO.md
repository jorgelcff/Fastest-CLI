# Fastest CLI — Roteiro de Demonstração

Roteiro para a apresentação ao vivo. Execute cada bloco na ordem.
Tempo estimado: **8–10 minutos**.

---

## Preparação (antes de apresentar)

```bash
# No repositório do Fastest CLI
npm run build

# Confirme que a chave está configurada
fastest config show

# Opcional: limpe testes anteriores para o demo ficar limpo
rm -f tests/order.service.spec.ts
```

---

## 1. Mostre o problema (1 min)

Abra `example/order.service.ts` no editor. Aponte:
- Lógica de negócio real (carrinho, estoque, desconto, cancelamento)
- **Nenhum teste existe ainda**
- Cobertura atual: **0%**

---

## 2. Valide o ambiente com `doctor` (1 min)

```bash
fastest doctor
```

Saída esperada — todos os checks verdes, mostrando a chave ativa e de qual fonte ela vem.

---

## 3. Inspecione o pipeline com `--dry-run` (1 min)

```bash
fastest generate \
  --card="Como QA, quero validar as regras de negócio do OrderService: criação de pedido com validação de estoque e desconto, confirmação e cancelamento" \
  --file="example/order.service.ts" \
  --dry-run
```

Aponte na saída:
- Linguagem detectada automaticamente: **TypeScript**
- Prompt preview mostrando o que será enviado ao LLM
- Etapas planejadas sem custar nenhum crédito

---

## 4. Gere os testes de verdade (3–4 min)

```bash
fastest generate \
  --card="Como QA, quero validar as regras de negócio do OrderService: criação de pedido com validação de estoque e desconto, confirmação e cancelamento" \
  --file="example/order.service.ts" \
  --test-type integration
```

**O que mostrar enquanto roda:**
- Spinner "Capturando baseline…" → cobertura antes: 0%
- Spinner animado com contagem de tokens ao vivo: `Gerando testes… 187 tokens`
- "TypeScript válido — nenhum erro de tipo" (validação pós-geração)
- Tabela antes/depois/delta aparecendo após o Jest rodar

**Saída esperada:**
```
✔ Baseline: 0% stmts · 0% branches · 0% funcs · 0% lines
✔ Testes gerados! (350 tokens · gpt-4o-mini)
  Arquivo    tests/order.service.integration.spec.ts
  Tipo       Integração
  Linguagem  TypeScript
  Testes     18 caso(s) encontrado(s)
✔ TypeScript válido
✔ Testes executados com sucesso!

┌────────────────┬────────────┬──────────────┬───────────────┬───────────┐
│ Cobertura      │ Statements │ Branches     │ Functions     │ Lines     │
├────────────────┼────────────┼──────────────┼───────────────┼───────────┤
│ Antes          │ 0%         │ 0%           │ 0%            │ 0%        │
│ Depois         │ 91%        │ 84%          │ 100%          │ 90%       │
├────────────────┼────────────┼──────────────┼───────────────┼───────────┤
│ Delta          │ +91%       │ +84%         │ +100%         │ +90%      │
└────────────────┴────────────┴──────────────┴───────────────┴───────────┘
```

---

## 5. Mostre o arquivo gerado (1 min)

```bash
cat tests/order.service.spec.ts
```

Aponte: casos principais, edge cases, mocks, imports corretos.

---

## 6. Demonstre suporte a JavaScript (30s)

```bash
fastest generate \
  --card="Funções matemáticas: add, subtract, multiply, divide" \
  --file="example/math.utils.ts" \
  --dry-run
```

Aponte: `Linguagem TypeScript` na saída.

Agora crie um arquivo `.js` rápido e mostre que muda para `JavaScript`:
```bash
echo "function soma(a, b) { return a + b; } module.exports = { soma };" > /tmp/soma.js
fastest generate --card="Testar soma" --file="/tmp/soma.js" --dry-run
```

Aponte: `Linguagem JavaScript`, saída planejada: `soma.spec.js`.

---

## 7. Demonstre suporte a Claude (opcional, 30s)

```bash
fastest config set-key --provider anthropic
fastest generate \
  --card="Validar OrderService" \
  --file="example/order.service.ts" \
  --model="claude-haiku-4-5-20251001" \
  --dry-run
```

Mostra que a abstração de provedores funciona sem mudar o restante do comando.

---

## 8. Mostre os testes do próprio projeto (1 min)

```bash
npm test
```

Aponte: **142 testes, 11 suites, 100% funcs cobertas**. Uma ferramenta de geração de testes que tem seus próprios testes.

---

## Pontos de narrativa para a banca

| Pergunta provável | Resposta |
|---|---|
| "Como você prova que melhora a cobertura?" | Tabela antes/depois/delta calculada por arquivo-alvo |
| "E se o LLM gerar código errado?" | `tsc --noEmit` roda antes do Jest e reporta erros de tipo |
| "Funciona só com TypeScript?" | Não — detecta a linguagem pela extensão, gera `.spec.ts` ou `.spec.js` |
| "Só OpenAI?" | Não — OpenAI e Anthropic via abstração de provedores |
| "Como instalar sem clonar o repo?" | `npm install -g github:jorgelcff/Fastest-CLI` + `fastest config set-key` |
