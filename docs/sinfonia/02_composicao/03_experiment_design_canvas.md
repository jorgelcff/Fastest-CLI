# Experiment Design Canvas - Fastest CLI

## Ideia

Ferramenta CLI que gera testes Jest funcionais a partir de requisitos escritos em linguagem natural ("cards") e codigo-fonte TypeScript/JavaScript, utilizando LLMs como motor de geracao.

**Premissa central:** Modelos de linguagem (GPT-4o-mini, Claude Haiku) conseguem produzir testes unitarios e de integracao sintaticamente corretos e semanticamente relevantes quando recebem contexto adequado (codigo-fonte + requisito funcional), com custo por chamada inferior a $0.01.

---

## Hipotese Principal

> **Acreditamos que** fornecer uma CLI alimentada por IA que gera testes Jest a partir de cards de requisitos **reduzira o tempo de escrita de testes em 60%** enquanto mantem qualidade de cobertura equivalente a testes escritos manualmente.

### Sub-hipoteses

1. **H1 - Compilacao:** Pelo menos 80% dos testes gerados compilam sem erros de TypeScript na primeira tentativa, sem intervencao manual.

2. **H2 - Execucao:** Pelo menos 60% dos testes gerados passam no Jest sem modificacao, quando o card descreve adequadamente o comportamento esperado.

3. **H3 - Cobertura:** Os testes gerados atingem no minimo 70% de cobertura de statements do arquivo-alvo.

4. **H4 - Tempo:** O ciclo completo (escrever card + executar CLI + revisar output) leva menos de 40% do tempo que o desenvolvedor gastaria escrevendo os mesmos testes manualmente.

5. **H5 - Adocao:** Desenvolvedores que experimentam a ferramenta voltam a usa-la em pelo menos 3 dos proximos 5 arquivos que precisam de testes.

---

## Desenho do Experimento (MVP)

### Escopo do MVP

| Componente          | Incluido no MVP | Versao futura |
|---------------------|-----------------|---------------|
| Comando `generate`  | Sim             | -             |
| Testes unitarios    | Sim             | -             |
| Testes de integracao | Nao            | v2            |
| Provider OpenAI     | Sim             | -             |
| Provider Anthropic  | Nao             | v2            |
| Streaming de resposta | Nao           | v2            |
| Contexto auxiliar (`--context`) | Nao  | v2            |
| Correcao de imports | Sim             | -             |
| Strip de code fences | Sim            | -             |
| Comando `doctor` (validacao + cobertura) | Nao | v3    |
| Configuracao de API key via CLI | Sim  | -             |

### Fluxo do MVP

```
1. Usuario configura API key: fastest config set-key --provider openai
2. Usuario executa: fastest generate --card "Deve validar email" --file src/user.service.ts
3. CLI le o arquivo-fonte
4. CLI monta prompt com card + codigo (buildTestPrompt)
5. CLI chama OpenAI gpt-4o-mini (temperature=0.2)
6. CLI recebe resposta, aplica stripCodeFences()
7. CLI corrige import relativo do arquivo-fonte
8. CLI salva arquivo em tests/user.service.spec.ts
9. CLI exibe: "Gerados X testes em tests/user.service.spec.ts"
```

### Parametros Fixos do MVP

| Parametro       | Valor   | Justificativa                                    |
|-----------------|---------|---------------------------------------------------|
| Modelo          | `gpt-4o-mini` | Baixo custo, boa qualidade para geracao de codigo |
| Temperature     | 0.2     | Maximiza determinismo e consistencia do codigo    |
| Linguagem prompt | pt-BR  | Alinhado com publico-alvo inicial                 |
| Framework de teste | Jest | Framework mais popular no ecossistema Node.js     |
| Output dir      | `tests/` | Convencao padrao do projeto                      |

### Duracao do Experimento

- **Setup:** 2 semanas (implementacao do MVP)
- **Coleta de dados:** 4 semanas (uso por 5-10 desenvolvedores em projetos reais)
- **Analise:** 1 semana

---

## Metricas-Chave

### Metricas Primarias

| Metrica                       | Como medir                                                    | Fonte               |
|-------------------------------|---------------------------------------------------------------|----------------------|
| Taxa de compilacao            | % de arquivos gerados que compilam com `tsc --noEmit`         | Execucao automatica  |
| Taxa de execucao sem editar   | % de suites que passam `jest --bail` sem modificacao manual    | Execucao automatica  |
| Cobertura de statements       | % statements cobertos (`jest --coverage`)                     | Relatorio Jest       |
| Tempo de geracao (e2e)        | Segundos desde execucao do comando ate arquivo salvo           | Timestamp da CLI     |
| Numero de test cases gerados  | Contagem de blocos `it()`/`test()` no arquivo gerado          | Regex na CLI         |

### Metricas Secundarias

| Metrica                       | Como medir                                                    |
|-------------------------------|---------------------------------------------------------------|
| Custo por arquivo             | Tokens consumidos x preco do modelo por execucao              |
| Taxa de reuso                 | % de desenvolvedores que usam a CLI mais de 3x em 2 semanas   |
| Edicoes pos-geracao           | Numero de linhas alteradas manualmente apos geracao            |
| Satisfacao (NPS)              | Pesquisa rapida (1-10) apos 2 semanas de uso                  |

---

## Criterios de Sucesso

### Para validar a hipotese (GO)

| Criterio                                          | Threshold  |
|---------------------------------------------------|------------|
| Taxa de compilacao TypeScript                     | >= 80%     |
| Taxa de execucao Jest sem edicao                  | >= 60%     |
| Cobertura media de statements                     | >= 70%     |
| Reducao de tempo vs escrita manual                | >= 50%     |
| NPS de satisfacao                                 | >= 7       |

### Para pivotar (NO-GO)

| Criterio                                          | Threshold  |
|---------------------------------------------------|------------|
| Taxa de compilacao TypeScript                     | < 50%      |
| Taxa de execucao Jest sem edicao                  | < 30%      |
| Desenvolvedores que abandonam apos primeiro uso   | > 60%      |

### Para iterar (AJUSTAR)

Se os resultados ficarem entre GO e NO-GO:

- **Compilacao 50-80%:** Investir em pos-processamento mais robusto (correcao automatica de erros de tipo, melhor resolucao de imports)
- **Execucao 30-60%:** Enriquecer prompt com mais contexto (tipos, interfaces, dependencias) via flag `--context`
- **Cobertura < 70%:** Implementar comando `doctor` que analisa lacunas e sugere testes adicionais via `buildCoverageSuggestionPrompt`
- **Tempo nao reduz 50%:** Adicionar streaming para feedback imediato e cache de respostas para arquivos similares

---

## Riscos e Mitigacoes

| Risco                                           | Probabilidade | Impacto | Mitigacao                                              |
|-------------------------------------------------|---------------|---------|--------------------------------------------------------|
| LLM gera testes que compilam mas nao testam nada | Media        | Alto    | Validar que testes contem assertions reais              |
| Custo de API excede orcamento dos usuarios       | Baixa         | Medio   | Usar gpt-4o-mini (custo ~$0.005/chamada)               |
| Mudancas na API do OpenAI quebram a CLI          | Baixa         | Alto    | Abstrair provider atras de interface `LLMProvider`      |
| Card mal escrito gera testes irrelevantes        | Alta          | Medio   | Documentar boas praticas para escrita de cards          |
| Contexto insuficiente gera imports errados       | Alta          | Medio   | Pos-processamento de imports + flag `--context`         |

---

## Proximos Passos (pos-validacao)

1. **v2:** Adicionar provider Anthropic, testes de integracao com Supertest, streaming, contexto auxiliar
2. **v3:** Comando `doctor` com validacao TypeScript + execucao Jest + analise de cobertura em fluxo unico
3. **v4:** Modo watch para regeneracao automatica ao salvar arquivos
4. **Longo prazo:** Avaliar Ideias B (plugin IDE) e C (bot CI/CD) usando a CLI como motor de geracao
