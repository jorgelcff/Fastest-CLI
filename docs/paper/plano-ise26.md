# Plano de Submissão — ISE'26 (Emerging Results, 2–4 páginas)

**Venue:** 5º Workshop Brasileiro de Engenharia de Software Inteligente (ISE'26), co-located CBSoft 2026
**Track:** Industry / Emerging Results (2–4 páginas)
**Formato:** ACM `acmart` `[sigconf]` · `\bibliographystyle{ACM-Reference-Format}` · submissão via JEMS
**Revisão:** double-blind (anonimizar tudo)
**Datas:** Registro 10/jul · Update do PDF 12/jul · Notificação 03/ago

**Eixo central:** pipeline de geração de testes com LLM **auto-corretivo em ciclo fechado**
(gerar → `tsc` → Jest → cobertura → reenviar erro ao LLM), com evidência de melhoria de
taxa de aprovação (pass-rate) **com vs. sem retry**. Card-driven e trade-off custo/qualidade
multi-provider como diferenciais secundários.

---

## 1. Abstract (draft — EN, paper-ready)

> **Title (draft):** *Closing the Loop: Error-Feedback Retry for Reliable LLM-Based Unit Test Generation from Natural-Language Cards*

> **Abstract.** Large Language Models (LLMs) can generate unit tests from source code,
> but a substantial fraction of the produced tests fail to compile or fail at run time,
> forcing developers to fix them by hand and eroding the promised productivity gains.
> This paper investigates whether a **closed-loop, self-correcting pipeline** can raise the
> reliability of LLM-generated tests without human intervention. We present an approach that
> takes a natural-language requirement (a *card*) plus a source file, generates a test suite,
> and then **validates it through a deterministic pipeline** — TypeScript type-checking, test
> execution, and coverage measurement — feeding any compilation or execution error back to
> the model for a bounded number of repair attempts. We implemented the approach as a
> command-line tool supporting two commercial LLM providers. In a preliminary evaluation over
> *N* TypeScript modules drawn from open-source projects, the error-feedback retry loop
> increased the share of test suites that pass without manual edits from *X%* to *Y%*
> (k ≤ 3 attempts), at a median additional cost of *US$Z* per module. We also report a
> cost/quality comparison between a low-cost model from each provider. Our results suggest
> that pairing LLM generation with a cheap, deterministic verification-and-repair loop is a
> practical lever for making AI-assisted test generation dependable enough for everyday use.

*Placeholders X/Y/Z/N vêm da mini-avaliação (Seção 3 deste plano).*

**Por que esse abstract funciona para um revisor:**
- Enuncia o problema (testes gerados falham) e a lacuna (esforço manual anula o ganho).
- A contribuição é **mensurável e reproduzível** (X%→Y% com/sem retry, custo por módulo).
- Não vende "mais uma CLI" — vende um *mecanismo* (loop de verificação-e-reparo) com evidência.

---

## 2. As três contribuições (draft — EN, paper-ready)

**C1 — A closed-loop self-correcting generation pipeline.**
An architecture that couples LLM test generation with a *deterministic* verification stage
(type-check → execute → measure coverage) and an **error-feedback repair loop** that returns
the concrete compiler/runtime error to the model for up to *k* bounded repair attempts.
The verification stage doubles as a guard rail against hallucinated APIs and non-compiling code.

**C2 — Empirical evidence that error-feedback retry improves reliability.**
A preliminary, reproducible evaluation over open-source TypeScript modules quantifying the
effect of the retry loop on (i) compilation rate, (ii) pass rate without manual edits, and
(iii) coverage delta — reporting the paired improvement (with vs. without retry) and its cost.

**C3 — A card-driven, multi-provider design with a cost/quality characterization.**
Natural-language requirements ("cards") as the primary driver of generation, and a practical
comparison of a low-cost model from two providers (cost per module, latency, pass rate),
an economic angle rarely reported in the LLM-test-generation literature.

> Se o revisor perguntar "o que há de novo além de gerar teste com LLM?": a resposta é **C1+C2** —
> o loop de reparo por feedback de erro e a evidência quantitativa do seu efeito. C3 é tempero.

---

## 3. Plano da mini-avaliação (a peça crítica no prazo)

Objetivo: transformar "eu acho" em evidência paired **com vs. sem retry**.

### 3.1 Perguntas de pesquisa
- **RQ1 (compilação):** o loop de retry aumenta a taxa de testes que compilam (`tsc --noEmit`)?
- **RQ2 (execução):** o loop aumenta a taxa de suítes que passam sem edição manual?
- **RQ3 (cobertura):** qual o delta de cobertura (statements/branches) dos testes gerados?
- **RQ4 (custo):** qual o custo (tokens, US$) e latência por módulo, e como variam entre providers?

### 3.2 Sujeitos (alvos de teste)
Amostrar **N = 30–40 módulos** TypeScript de **4–6 projetos open-source** com estas propriedades:
- funções/classes com **lógica pura ou baixa dependência de infra** (fáceis de exercitar);
- licença permissiva; sem necessidade de banco/rede para rodar.

Candidatos (priorizar arquivos utilitários autocontidos, não o projeto inteiro):
- bibliotecas de utilitários de data/string/número;
- validadores, parsers, formatadores, funções de cálculo;
- **evitar** UI/React, I/O pesado, código que dependa de estado global.

Critério de inclusão: o arquivo compila isolado e tem ≥1 função exportada testável.
Registrar o **commit hash** de cada repo para reprodutibilidade.

### 3.3 Protocolo (desenho pareado)
Para cada módulo *m* e cada provider *p* ∈ {gpt-4o-mini, claude-haiku}:
1. **Condição A (baseline):** `fastest generate` com `--retries 0`.
2. **Condição B (tratamento):** mesma entrada com `--retries 3` (loop de feedback de erro).
3. Card: gerar um card padronizado por módulo (curto, derivado da assinatura/JSDoc) para
   controlar a variável "qualidade do card".
4. **Mitigar não-determinismo do LLM:** repetir cada geração **r = 3 vezes** (temperature 0.2)
   e reportar média/execução; fixar seeds onde a API permitir.
5. Coletar por execução: compila? (bool), passa? (bool), cobertura antes/depois, tokens, US$, tempo.

A e B usam **os mesmos módulos** → comparação **pareada** (permite teste estatístico forte).

### 3.4 Métricas e análise
| Métrica | Como medir |
|---|---|
| Taxa de compilação | % execuções onde `tsc --noEmit` passa |
| Pass rate (sem edição) | % suítes que rodam verdes no Jest sem modificação |
| Delta de cobertura | cobertura_depois − cobertura_antes (statements, branches) |
| Custo | tokens × preço do modelo; reportar mediana e IQR |
| Latência | tempo end-to-end por módulo |
| Δ retry | pass_rate(B) − pass_rate(A), **pareado** |

**Teste estatístico:** para RQ2 (efeito do retry, desfecho binário pareado nos mesmos módulos),
usar **teste de McNemar**; reportar p-valor e tamanho de efeito (ex.: razão de discordância).
Para custo/latência, reportar mediana + IQR e comparar providers com Wilcoxon pareado.

### 3.5 Ameaças à validade (já antecipar — revisor vai cobrar)
- **Externa (seleção):** módulos escolhidos podem não representar código real; mitigar
  amostrando de múltiplos domínios e reportando critérios de inclusão explícitos.
- **Construção (pass ≠ bom):** um teste pode passar sem validar comportamento real
  (inflação de cobertura); discutir e, se der tempo, inspeção manual de amostra.
- **Interna (não-determinismo):** LLM varia entre execuções; mitigar com r=3 e temperature baixa.
- **Contaminação de dados (data leakage):** modelos podem ter visto os repos OSS no treino;
  declarar como ameaça e, se possível, incluir ≥1 módulo "fresco"/privado como sanity check.
- **Provider drift:** modelos comerciais mudam sem aviso; registrar datas e versões dos modelos.

### 3.6 Reprodutibilidade / Open Science
- Publicar (anonimizado) um artefato: lista de repos+commits, cards usados, script de coleta,
  planilha de resultados, e o comando exato do CLI por condição.
- Sob double-blind: repositório do artefato **anonimizado** (sem nome/GitHub identificável).

### 3.7 Viabilidade no prazo
- Automatizável: um script itera módulos × providers × condições e coleta as métricas.
- Gargalos: custo/tempo de API (N×2×3×2 ≈ algumas centenas de chamadas — barato com modelos mini),
  e curadoria dos módulos. Estimativa: **1–2 dias** de execução + análise se o script sair rápido.

---

## 4. Outline do paper mapeado às seções ACM (2–4 páginas)

1. **Introduction** (~0,75 pág)
   - Problema: testes gerados por LLM falham → esforço manual anula o ganho.
   - Lacuna: pouca ênfase em *verificação+reparo* automáticos guiados por erro real.
   - Contribuições C1–C3 (bullets). Prévia do resultado (X%→Y%).
2. **Related Work** (~0,5 pág)
   - LLM/search-based test generation (TestPilot, CodaMosa, ChatTester, Diffblue, CodiumAI…).
   - Posicionamento: terceira pessoa, **anonimizado**; destacar o que é diferente
     (loop de feedback de erro + card-driven + custo multi-provider).
3. **Approach** (~0,75 pág)
   - Pipeline card → geração → `tsc` → Jest → cobertura → **retry por feedback de erro** (k≤3).
   - Diagrama da arquitetura (uma figura, anonimizada).
   - Prompts (resumo do catálogo: geração, retry, sugestão de cobertura).
4. **Preliminary Evaluation** (~1 pág — coração do paper)
   - Setup (repos, N, providers, protocolo pareado, métricas).
   - Resultados: tabela compila/pass/cobertura A vs B; McNemar; custo/latência por provider.
   - Achado principal: pass-rate X%→Y% com retry (significância + custo).
5. **Threats to Validity** (~0,25 pág) — da Seção 3.5.
6. **Conclusion & Future Work** (~0,25 pág)
   - Verificação-e-reparo barata como alavanca prática; próximos passos (Vitest, mais linguagens).
7. **Acknowledgment on AI use** (obrigatório pela política do ISE'26)
   - Declarar uso de LLMs na redação/implementação; trabalho intelectual dos autores.
8. **References** (ACM-Reference-Format).

---

## 5. Checklist de conformidade

- [ ] Formato ACM `acmart[sigconf]` no Overleaf (reescrever conteúdo do relatório em LaTeX).
- [ ] ≤ 4 páginas incluindo figuras e referências.
- [ ] **Double-blind:** remover nomes, afiliação, links GitHub, "we/our/nosso"; citar próprio
      trabalho em terceira pessoa; artefato anonimizado.
- [ ] Disclosure de uso de IA no Acknowledgment.
- [ ] PDF submetido via JEMS até 10/jul (registro) / 12/jul (update).
- [ ] Pelo menos um autor pagante registrado no CBSoft (se aceito).

---

## 6. Próximos passos sugeridos (nesta ordem)

1. **Validar o ângulo** deste plano (abstract + C1–C3). ⟵ *aguardando seu OK*
2. **Rodar a mini-avaliação** (Seção 3) — escrever o script de coleta e selecionar os módulos.
3. **Montar o esqueleto LaTeX** `acmart[sigconf]` anonimizado e preencher com os resultados.
4. **Revisão double-blind** (varrer "we/our/github/nomes") + disclosure de IA.
