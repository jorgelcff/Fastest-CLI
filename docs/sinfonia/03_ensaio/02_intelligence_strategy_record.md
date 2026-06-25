# Intelligence Strategy Record - Fastest CLI

## Projeto
**Fastest CLI** - Geracao de testes Jest via IA a partir de requisitos em linguagem natural.

---

## 1. Abordagem Escolhida

| Criterio | Decisao |
|----------|---------|
| **Estrategia** | Prompt Engineering (Zero-shot com contexto rico) |
| **Alternativas descartadas** | RAG (complexidade desnecessaria para escopo), Fine-tuning (custo elevado, dados insuficientes) |
| **Justificativa** | O codigo fonte do usuario ja fornece todo o contexto necessario. Nao ha base de conhecimento proprietaria que justifique RAG. Os modelos base ja possuem forte capacidade de geracao de codigo. |

---

## 2. Modelos Utilizados

| Provedor | Modelo Padrao | Uso |
|----------|---------------|-----|
| OpenAI | `gpt-4o-mini` | Geracao de testes (padrao) |
| Anthropic | `claude-haiku` | Geracao de testes (alternativa) |

### Criterios de Selecao

- **Custo**: Modelos menores e mais baratos para uso frequente em desenvolvimento
- **Velocidade**: Latencia baixa para feedback rapido no terminal
- **Qualidade**: Capacidade suficiente para gerar testes TypeScript/JavaScript validos
- **Configurabilidade**: Usuario pode alterar modelo via `fastest config set model <nome>`

---

## 3. Estrategia de Prompting

### Tipo: Zero-shot com Contexto Rico

O prompt e construido dinamicamente com tres fontes de informacao:

1. **Codigo Fonte**: Conteudo completo do arquivo alvo (funcoes, classes, tipos)
2. **Cartao de Requisitos**: Descricao em linguagem natural do que testar (fornecida pelo usuario)
3. **Arquivos de Contexto Adicional**: Arquivos relacionados que ajudam o LLM a entender dependencias e tipos

### Estrutura do Prompt

```
[Instrucao do Sistema]
Voce e um gerador de testes Jest para TypeScript/JavaScript.

[Codigo Fonte]
<conteudo do arquivo alvo>

[Requisitos]
<descricao em linguagem natural dos testes desejados>

[Contexto Adicional]
<tipos, interfaces, dependencias relevantes>

[Restricoes]
- Gerar testes Jest validos
- Usar mocks para dependencias externas
- Incluir describe/it blocks
- Cobrir cenarios de sucesso e erro
```

### Por que nao RAG?

- O contexto e fornecido diretamente pelo usuario (arquivo fonte + requisitos)
- Nao existe base de conhecimento de testes anterior para consultar
- O escopo de cada geracao e limitado a um arquivo/funcionalidade
- A janela de contexto dos modelos atuais comporta o codigo + requisitos

### Por que nao Fine-tuning?

- Volume insuficiente de dados de treinamento especificos
- Modelos base ja geram testes de alta qualidade
- Custo de manutencao de modelo fine-tuned nao se justifica
- Flexibilidade de trocar modelos seria perdida

---

## 4. Avaliacao e Validacao

### Metricas de Qualidade da Geracao

| Metrica | Descricao | Como e Medida |
|---------|-----------|---------------|
| **Compilacao TypeScript** | Teste gerado compila sem erros | `tsc --noEmit` no arquivo gerado |
| **Taxa de Aprovacao Jest** | Testes gerados passam ao executar | `jest --testPathPattern=<arquivo>` |
| **Delta de Cobertura** | Melhoria na cobertura apos adicionar testes | Comparacao before/after via Istanbul |

### Pipeline de Validacao

```
Prompt -> LLM -> Codigo Gerado -> Compilacao TS -> Execucao Jest -> Relatorio Cobertura
                                       |                |                |
                                   Falha?            Falha?         Delta < 0?
                                   Reportar          Reportar       Alertar
```

---

## 5. Custos Estimados

| Modelo | Custo por Geracao (estimativa) | Tokens Medios |
|--------|-------------------------------|---------------|
| gpt-4o-mini | ~$0.001 - $0.005 | ~2000-5000 tokens |
| claude-haiku | ~$0.001 - $0.003 | ~2000-5000 tokens |

*Valores aproximados baseados em precos publicos dos provedores. Custo real depende do tamanho do codigo fonte e da complexidade dos requisitos.*

---

## 6. Decisoes Futuras

| Decisao | Status | Gatilho |
|---------|--------|---------|
| Adicionar RAG com exemplos de testes do projeto | Pendente | Se usuarios reportarem qualidade insuficiente |
| Suportar modelos locais (Ollama) | Pendente | Demanda por uso offline/privacidade |
| Implementar retry com refinamento de prompt | Pendente | Se taxa de compilacao < 80% |
| Few-shot prompting com exemplos | Pendente | Se zero-shot nao atingir qualidade desejada |
