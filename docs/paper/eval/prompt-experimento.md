# Prompt do Experimento — cole na sessão Claude Code LOCAL

> Copie tudo abaixo da linha e cole na sessão do Claude Code rodando **na sua máquina**
> (com Fastest CLI instalado, keys da OpenAI e Anthropic configuradas, e os projetos-alvo
> disponíveis localmente). Ao final, você terá `experimento/results.csv` e
> `experimento/summary.md` para trazer de volta.

---

Você vai me ajudar a executar uma **avaliação empírica** para um artigo acadêmico
(workshop ISE'26). O objetivo é medir se o **loop de retry por feedback de erro** do
Fastest CLI aumenta a confiabilidade dos testes gerados por LLM, comparando geração
**com vs. sem retry**, em dois provedores, sobre módulos reais.

## Contexto do que estamos provando
- **Achado principal (RQ2):** o retry (reenviar o erro de compilação/execução ao LLM)
  eleva a taxa de suítes que passam **sem edição manual**.
- **Secundários:** taxa de compilação (RQ1), delta de cobertura (RQ3), custo/latência por
  provedor (RQ4).

## Pré-requisitos (verifique antes)
1. `fastest --version` funciona.
2. Keys configuradas para **ambos**: `OPENAI_API_KEY` e `ANTHROPIC_API_KEY`.
3. Os projetos-alvo compilam (`npx tsc --noEmit`) e rodam Jest (`npx jest`).
4. Crie a pasta de saída `experimento/` na raiz de trabalho.

## Passo 1 — Selecionar e catalogar os módulos
Percorra os projetos-alvo locais e selecione **20–30 módulos** testáveis. Estratifique:

| Estrato | O que é | Prioridade |
|---|---|---|
| `ts_logic` | TypeScript de **lógica pura** (utils, services, validators, parsers, cálculos) | **PRIMÁRIO — maioria da amostra** |
| `js` | JavaScript de lógica pura | secundário |
| `ui` | Componentes de UI (React/DOM) | secundário (só p/ análise estratificada) |

Regras de inclusão: arquivo compila isolado, tem ≥1 função/classe exportada, baixa
dependência de infra (evite banco/rede/UI no estrato primário). Comece com o
**repositório privado/sem testes** (código não visto pelo modelo → forte contra data leakage)
e complemente com os demais.

Para cada módulo registre em `experimento/modules.csv` as colunas:
`module_id,project,commit,stratum,path,exported_symbols`
(pegue o `commit` com `git rev-parse HEAD` em cada projeto).

## Passo 2 — Card padronizado por módulo
Para cada módulo, gere um **card curto e padronizado** derivado das assinaturas exportadas
/ JSDoc (1–2 frases, em português), descrevendo o comportamento a testar. Salve o card em
`experimento/cards/<module_id>.md`. Isso controla a variável "qualidade do card".

## Passo 3 — Construir um harness resumível
Escreva um script (`experimento/run-eval.mjs` ou `.ts`) que executa a **matriz completa** e
grava `experimento/results.csv` **incrementalmente** (uma linha por execução, com flush a
cada iteração, para ser resumível se travar). A matriz é:

```
para cada módulo m (de modules.csv):
  para cada provider p em [openai, anthropic]:
    modelo = gpt-4o-mini (openai) | claude-haiku-4-5-20251001 (anthropic)
    para cada condição c em [retry0, retry3]:   # 0 e 3 tentativas
      para cada repetição i em [1, 2, 3]:        # domar não-determinismo
        1. tempo_ini = agora
        2. rodar:
           fastest generate \
             --file <m.path> \
             --card "$(cat experimento/cards/<m.id>.md)" \
             --test-type unit \
             --model <modelo> \
             --retries <0|3> \
             --output experimento/gen/<m.id>/<p>/<c>/<i>/
           (capturar stdout, stderr, exit code, wall-clock)
        3. localizar o arquivo de teste gerado
        4. MEDIR (de forma independente, não confie só no output bonito do CLI):
           - compiled = (npx tsc --noEmit no arquivo gerado) exit 0 ?  # só p/ TS
           - passed   = (npx jest <arquivo_gerado> --silent) exit 0 ?
           - cobertura = rodar jest só com o teste gerado, com
             --coverage --collectCoverageFrom '<m.path>' e ler statements% e branches%
             do arquivo-alvo (atribui a cobertura AO teste gerado; baseline=0 p/ módulos sem teste)
           - test_count = nº de it()/test() no arquivo
           - retry_attempts = extrair do stdout do Fastest (linha "Retries")
           - tokens = extrair do stdout do Fastest (linha "(N tokens · modelo)")
           - cost_usd = tokens * preço (ver price table em config.json)
           - latency_s = agora - tempo_ini
           - error_snippet = primeiras linhas do erro, se falhou
        5. anexar linha ao results.csv
```

### Colunas de `experimento/results.csv`
```
module_id,project,stratum,provider,model,condition,rep,compiled,passed,
cov_statements,cov_branches,test_count,retry_attempts,tokens,cost_usd,
latency_s,generated_test_path,error_snippet
```

> Dica: rode cada `fastest generate` em um `--output` isolado por (módulo/provider/condição/rep)
> para não sobrescrever nem contaminar a medição. **Não** aponte o `--output` para dentro do
> `src` real dos projetos.

## Passo 4 — PILOTO antes de escalar
Rode **primeiro só 5 módulos** (a matriz inteira) e confira:
- o CSV está preenchendo todas as colunas corretamente?
- `compiled`/`passed` batem com o esperado numa inspeção manual de 1–2 casos?
- os tokens/custo estão sendo capturados?

Só depois de validar o piloto, rode a amostra completa (pode levar algumas horas; o script
deve ser resumível — pule linhas já presentes no CSV).

## Passo 5 — Análise e `summary.md`
Depois da coleta, gere `experimento/summary.md` com:
1. **N e composição** por estrato (quantos ts_logic / js / ui).
2. **Tabela principal (por estrato e condição):** taxa de compilação, pass-rate (sem edição),
   cobertura média (statements/branches) — **retry0 vs retry3**, por provider.
3. **Efeito do retry (RQ2):** unidade = (módulo, provider); desfecho por condição = voto de
   maioria de `passed` nas 3 reps (≥2/3 = passa). Monte a tabela 2×2 de discordâncias e
   aplique o **teste de McNemar** (reporte p-valor). Faça isso **por estrato** (o efeito no
   `ts_logic` é o headline).
4. **Custo/latência (RQ4):** mediana + IQR de `cost_usd` e `latency_s` por provider;
   comparação com Wilcoxon pareado se aplicável.
5. **Achado em uma frase:** "no estrato ts_logic, o retry elevou o pass-rate de X% para Y%
   (McNemar p=…), a um custo mediano adicional de US$Z por módulo".

## Passo 6 — Reprodutibilidade (`config.json`)
Grave `experimento/config.json` com:
- data/hora da execução;
- **modelos exatos** e a **data** (provider drift);
- **price table** usada (preço input/output por 1M tokens de cada modelo — **confirme os
  preços vigentes** e registre a fonte/data; não invente);
- lista de projetos-alvo + `commit` de cada;
- versão do Fastest CLI (`fastest --version`), Node e Jest.

## Cuidados
- **Não** faça commit de código-fonte privado dos projetos-alvo nem das keys.
- Determinismo: temperature já é 0.2 no Fastest; as 3 repetições capturam a variância.
- Se algum módulo falhar 100% por motivo de **setup de ambiente** (típico de `ui`), registre —
  isso vira análise estratificada honesta, não erro.

## Entregáveis para trazer de volta
- `experimento/results.csv` (linhas cruas)
- `experimento/summary.md` (agregados + McNemar + custo)
- `experimento/config.json` (reprodutibilidade)
- `experimento/modules.csv` (amostra)

Quando terminar, me diga o **achado principal em uma frase** e cole a **tabela principal**.
