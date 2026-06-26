# Reflexão sobre o Uso de IA no Projeto

**Projeto:** Fastest CLI  
**Data:** 25 de Junho de 2026

---

## 1. Como a IA foi Utilizada no Projeto

### 1.1 IA como Produto (Core do Fastest CLI)

O Fastest CLI é fundamentalmente um produto de IA — utiliza modelos de linguagem (LLMs) como motor principal para gerar código de teste. A IA não é um acessório; é o componente central sem o qual a ferramenta não existe.

**Modelos utilizados:**
- **OpenAI GPT-4o-mini:** Modelo padrão para geração de testes. Escolhido pelo equilíbrio entre custo (~$0.002/chamada) e qualidade de geração de código.
- **Anthropic Claude Haiku:** Modelo alternativo com custo ainda menor (~$0.001/chamada). Oferece perspectiva diferente na geração.

**Estratégia de prompting:**
- Zero-shot com contexto rico (código-fonte + requisito em linguagem natural)
- Sem necessidade de RAG ou fine-tuning — o contexto é fornecido diretamente pelo usuário
- Temperatura baixa (0.2) para maximizar determinismo na geração de código

### 1.2 IA como Ferramenta de Desenvolvimento

Além de ser o produto, IA generativa foi utilizada como ferramenta auxiliar durante o desenvolvimento do próprio Fastest CLI:

- **Geração de testes do projeto:** Utilizamos o Fastest CLI para gerar parte dos seus próprios testes (dogfooding)
- **Documentação Sinfonia:** Os 15 artefatos da metodologia foram elaborados com assistência de IA
- **Code review e refactoring:** IA auxiliou na identificação de melhorias de código e padrões

---

## 2. Limitações Identificadas

### 2.1 Limitações da IA como Geradora de Testes

| Limitação | Descrição | Mitigação |
|-----------|-----------|-----------|
| **Testes superficiais** | LLMs tendem a gerar happy path sem edge cases profundos | Prompt explícito para edge cases + validação de cobertura |
| **Imports incorretos** | Modelo não conhece estrutura de diretórios do projeto | Pós-processamento automático de imports |
| **Code fences residuais** | Resposta vem em markdown mesmo quando instruído ao contrário | `stripCodeFences()` no pipeline |
| **Mocks excessivos** | Tende a criar mocks desnecessários | Revisão humana obrigatória |
| **Contexto limitado** | Não "entende" o projeto inteiro, apenas o que recebe no prompt | Guard rails + contexto auxiliar via `--context` |
| **Não-determinismo** | Mesma entrada pode gerar testes diferentes | Temperatura baixa (0.2) mitiga parcialmente |

### 2.2 Limitações Técnicas

- **Dependência de APIs externas:** Requer conexão à internet e API keys válidas
- **Custo acumulativo:** Uso intensivo em projetos grandes pode gerar custos significativos
- **Privacidade:** Código-fonte é enviado a servidores externos (OpenAI/Anthropic)
- **Frameworks limitados:** Apenas Jest e Vitest (não suporta Mocha, Testing Library standalone, etc.)
- **Linguagens limitadas:** Apenas TypeScript/JavaScript

---

## 3. Considerações Éticas

### 3.1 Transparência

- O usuário sabe que está usando IA — é o propósito explícito da ferramenta
- O provedor e modelo são visíveis via `fastest config list`
- O modo `--dry-run` permite inspecionar o código gerado antes de salvar
- O `fastest doctor` mostra o estado completo da configuração

### 3.2 Privacidade e Segurança

- **Risco:** Código-fonte proprietário é transmitido a APIs externas
- **Mitigação atual:** Documentação clara sobre o que é enviado; API keys armazenadas localmente
- **Mitigação futura:** Suporte a modelos locais (Ollama) para uso sem transmissão externa
- **Responsabilidade:** O usuário deve avaliar se o código pode ser enviado a terceiros conforme políticas da sua organização

### 3.3 Qualidade e Responsabilidade

- Testes gerados por IA **não substituem** revisão humana
- Alta cobertura **não garante** testes de qualidade — é possível atingir 100% sem validar comportamento real
- O pipeline de validação (compilação + execução + cobertura) é uma camada de segurança, não uma garantia
- A responsabilidade final pela qualidade dos testes é do desenvolvedor

### 3.4 Atribuição

- O Fastest CLI não reclama autoria dos testes gerados — são código do usuário
- O uso de modelos comerciais (OpenAI, Anthropic) implica em aceitar seus termos de serviço
- Código gerado pode inadvertidamente replicar padrões de código de treinamento dos modelos

---

## 4. Reflexão Final

### O que Aprendemos

1. **IA generativa funciona bem para código estruturado:** Testes Jest seguem padrões previsíveis (describe/it/expect) que modelos geram com boa qualidade.

2. **Validação em pipeline é essencial:** Sem compilação TypeScript + execução Jest + análise de cobertura, a geração de testes seria uma caixa-preta. O pipeline transforma output de IA em output confiável.

3. **Retry com feedback é o game-changer:** Re-enviar erros de compilação ao LLM para auto-correção aumentou a taxa de sucesso de ~80% para 92%+. O modelo "aprende" dos próprios erros no contexto da conversa.

4. **Guard rails são necessários:** Sem limites de contexto (max files, max chars), é fácil exceder limites de tokens e gerar custos desnecessários. Os guard rails são uma feature de responsabilidade.

5. **IA como co-piloto, não substituto:** A ferramenta acelera drasticamente a escrita de testes, mas a revisão humana continua essencial. O melhor resultado vem da combinação: velocidade da IA + julgamento do desenvolvedor.

### O que Faríamos Diferente

- **Começar com retry desde v1.0:** O impacto do retry na qualidade foi tão significativo que deveria ter sido implementado desde o início.
- **Métricas de qualidade além de cobertura:** Implementar análise de complexidade de asserções, não apenas contagem de linhas cobertas.
- **Testes de benchmark entre modelos:** Comparação sistemática de qualidade entre GPT-4o-mini e Claude Haiku para diferentes tipos de código.

### Visão de Futuro

A geração de testes por IA está em estágio inicial. Com modelos cada vez mais capazes e baratos, e com suporte a modelos locais (Ollama), a barreira de adoção tende a zero. O desafio futuro não é gerar testes — é garantir que os testes gerados validem comportamento real, não apenas executem sem erros.

O Fastest CLI posiciona-se como infraestrutura para essa evolução: um pipeline de validação que pode ser acoplado a qualquer motor de geração, presente ou futuro.
