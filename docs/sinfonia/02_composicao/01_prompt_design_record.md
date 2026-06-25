# Prompt Design Record - Fastest CLI

## Metadata

| Campo         | Valor                                                        |
|---------------|--------------------------------------------------------------|
| **Objetivo**  | Gerar testes Jest (unitarios e integracao) e analisar lacunas de cobertura a partir de codigo-fonte e requisitos em linguagem natural |
| **Modelos**   | OpenAI `gpt-4o-mini` (padrao), Anthropic `claude-haiku`      |
| **Versao**    | 1.0                                                          |
| **Responsavel** | Equipe Fastest CLI                                         |
| **Data**      | 2026-06-25                                                   |

---

## 1. Prompt de Geracao de Testes Unitarios

### Estrutura do Prompt

**Inputs:**

| Input       | Descricao                                      | Exemplo                                      |
|-------------|-------------------------------------------------|----------------------------------------------|
| `card`      | Requisito funcional em linguagem natural        | "Deve validar email antes de salvar usuario" |
| `code`      | Codigo-fonte do arquivo alvo + contexto auxiliar | Conteudo do arquivo `.ts` ou `.js`           |
| `language`  | Linguagem detectada (`typescript` ou `javascript`) | `typescript`                              |

**Template (TypeScript):**

```
Voce e um especialista em testes.
Gere testes unitarios em Jest para o seguinte codigo:

CARD:
{card}

CODIGO:
{code}

Inclua:
- casos principais
- edge cases
- mocks se necessario

Retorne apenas codigo TypeScript valido, sem explicacoes, sem blocos markdown.
```

**Template (JavaScript):**

Identico ao acima, porem a instrucao final muda para:

```
Retorne apenas codigo JavaScript valido (CommonJS, use require()), sem explicacoes, sem blocos markdown.
```

**Contexto auxiliar:** O campo `code` pode incluir codigo de arquivos adicionais fornecidos via `--context`. Guard rails aplicados:
- Maximo 20 arquivos de contexto (`maxFiles`)
- Maximo 4.000 caracteres por arquivo (`maxCharsPerFile`)
- Maximo 30.000 caracteres totais (`maxTotalChars`)
- Arquivos binarios e extensoes nao-suportadas sao ignorados
- Arquivos truncados recebem marcador `/* ... truncated ... */`

### Estrutura da Resposta

**Formato esperado:** Codigo Jest puro, sem code fences, sem explicacoes textuais.

**Exemplo de saida esperada:**

```typescript
import { validateEmail } from '../src/user.service';

describe('validateEmail', () => {
  it('deve retornar true para email valido', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('deve retornar false para email sem @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  it('deve retornar false para string vazia', () => {
    expect(validateEmail('')).toBe(false);
  });
});
```

**Pos-processamento aplicado pela CLI:**
1. `stripCodeFences()` - remove blocos markdown residuais da resposta
2. Correcao de import - ajusta o primeiro `from '...'` para apontar ao caminho relativo correto do arquivo-fonte
3. Contagem de test cases via regex `it(` / `test(`

---

## 2. Prompt de Geracao de Testes de Integracao

### Estrutura do Prompt

**Inputs:** Identicos ao prompt unitario.

**Template:**

```
Voce e um especialista em testes de integracao de APIs e fluxos de negocio.
Gere testes de integracao em Jest + Supertest para o codigo abaixo.

CARD (fluxo funcional):
{card}

CODIGO:
{code}

Regras obrigatorias:
- Cubra o fluxo ponta a ponta do caso de uso descrito no card
- Inclua cenarios de sucesso e de falha de comunicacao/API
- Use mocks deterministicos para dependencias externas (ex.: banco, fila, API externa) com jest.mock/jest.spyOn
- Evite dependencias de estado global e infraestrutura real
- Organize os testes por cenarios de negocio (nao apenas por funcao isolada)
- Se necessario, faca bootstrap da aplicacao para requisicoes HTTP via Supertest

Retorne apenas codigo TypeScript valido, sem explicacoes, sem blocos markdown.
```

### Estrutura da Resposta

**Formato:** Identico ao unitario - codigo Jest puro com Supertest.

**Diferencial:** Os testes devem cobrir fluxos end-to-end, cenarios de falha de API, e usar `jest.mock`/`jest.spyOn` para dependencias externas.

---

## 3. Prompt de Sugestao de Cobertura

### Estrutura do Prompt

**Inputs:**

| Input            | Descricao                                          |
|------------------|-----------------------------------------------------|
| `card`           | Requisito funcional original                        |
| `code`           | Codigo-fonte do arquivo                             |
| `coverageSummary`| Relatorio de cobertura Jest (statements, branches, functions, lines) |
| `testType`       | `unit` ou `integration`                             |

**Template (unitario):**

```
Voce e um especialista em qualidade de software.

Com base no seguinte relatorio de cobertura de testes, sugira novos casos de teste para melhorar a cobertura.

CARD:
{card}

CODIGO:
{code}

RELATORIO DE COBERTURA:
{coverageSummary}

Liste apenas os cenarios de teste que ainda nao estao cobertos. Seja conciso e objetivo.
```

**Template (integracao):** Adiciona ao final:

```
Destaque tambem fluxos criticos do caso de uso ainda nao cobertos ponta a ponta.
```

### Estrutura da Resposta

**Formato:** Lista textual de cenarios de teste sugeridos, sem codigo.

---

## Testes e Qualidade

### Criterios de Aceitacao do Prompt

| Criterio                                    | Status |
|---------------------------------------------|--------|
| Resposta contem apenas codigo valido         | Sim    |
| Imports gerados sao sintaticamente corretos  | Sim (pos-processado) |
| Testes seguem padrao describe/it do Jest     | Sim    |
| Edge cases sao incluidos                     | Sim    |
| Nenhuma explicacao textual na resposta       | Sim    |

### Parametros do Modelo

| Parametro     | Valor   | Justificativa                                      |
|---------------|---------|-----------------------------------------------------|
| `temperature` | 0.2     | Baixa variabilidade para gerar codigo deterministico |
| `max_tokens`  | 4096    | Suficiente para arquivos de teste completos (Anthropic) |
| `stream`      | Opcional| Suportado para feedback em tempo real via `onToken`  |

### Metricas de Qualidade

- **Taxa de compilacao:** % de testes gerados que compilam sem erros TypeScript
- **Taxa de execucao:** % de testes que passam no Jest sem modificacao manual
- **Cobertura resultante:** % de cobertura de statements/branches apos execucao
- **Contagem de test cases:** Numero de blocos `it()`/`test()` gerados por arquivo

---

## Notas Adicionais

- O prompt e escrito em portugues (pt-BR), alinhado com o contexto de uso primario do projeto.
- A selecao do provider (OpenAI vs Anthropic) e automatica baseada no prefixo do modelo: modelos com prefixo `claude-` usam Anthropic, demais usam OpenAI.
- O `max_tokens` e configurado apenas no provider Anthropic (4096). O provider OpenAI nao define limite explicito, delegando ao padrao da API.
- O contexto auxiliar (`--context`) permite que o LLM entenda dependencias, types e interfaces usadas pelo codigo-alvo, melhorando a qualidade dos mocks e imports gerados.
