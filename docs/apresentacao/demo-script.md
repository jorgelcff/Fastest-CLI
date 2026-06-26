# Script da Demo ao Vivo (~3-4 min)

## Preparacao (antes da apresentacao)

- Terminal aberto no diretorio do projeto Fastest-CLI
- API key configurada (variavel `ANTHROPIC_API_KEY` ou `OPENAI_API_KEY` no `.env`)
- Arquivo exemplo pronto: `example/math.utils.ts` (funcoes: `add`, `subtract`, `multiply`, `divide`, `isPrime`)
- Segundo arquivo: `example/order.service.ts` (11 metodos de e-commerce)
- Limpar testes anteriores se existirem: `rm -rf tests/`
- Fonte do terminal em 18pt+ e fundo escuro
- Comandos copiados num arquivo txt para colar rapidamente
- WiFi testado e hotspot do celular como backup

---

## Sequencia da Demo

### Passo 1: Doctor (30s)

```bash
fastest doctor
```

**O que mostrar:**
- Verificacao automatica de: `package.json`, Jest/Vitest instalado, `tsconfig.json`, versao do Node.js, `.env` presente, API key valida
- Todos os checks verdes

**Fala do apresentador:**
> "Antes de gerar qualquer teste, o Fastest verifica se o ambiente esta pronto. Com um unico comando, ele checa tudo: dependencias, configuracao do TypeScript, framework de teste e chave de API. Tudo verde -- estamos prontos."

---

### Passo 2: Generate - Dry Run (30s)

```bash
fastest generate --card "Deve testar operacoes matematicas basicas incluindo divisao por zero e verificacao de primos" --file example/math.utils.ts --dry-run
```

**O que mostrar:**
- Configuracao detectada (framework, linguagem)
- Preview do prompt que seria enviado ao LLM
- Etapas planejadas sem executar nenhuma chamada externa

**Fala do apresentador:**
> "Agora vamos ver o dry-run. Eu descrevo o que quero testar em linguagem natural -- como se fosse um card do Jira. O Fastest analisa o arquivo, monta o prompt e mostra exatamente o que vai fazer. Reparem: nenhuma chamada externa foi feita. Isso e otimo para revisar antes de gastar tokens."

---

### Passo 3: Generate - Execucao Real (60s)

```bash
fastest generate --card "Deve testar operacoes matematicas basicas incluindo divisao por zero e verificacao de primos" --file example/math.utils.ts --output tests
```

**O que mostrar:**
- Spinner conectando ao LLM
- Contagem de tokens consumidos
- Validacao TypeScript do codigo gerado
- Tabela de cobertura: before / after / delta
- Resumo final: "X testes gerados em Y segundos"

**Fala do apresentador:**
> "Agora sim, execucao real. Mesmo comando, sem o dry-run. Observem o spinner -- ele esta se conectando ao modelo de linguagem. Em poucos segundos temos os testes prontos."

*(Enquanto aguarda o resultado:)*

> "Reparem que ele conta os tokens usados -- voce sempre sabe quanto esta gastando. E apos gerar, ele valida o TypeScript automaticamente para garantir que o codigo compila."

*(Quando o resultado aparecer:)*

> "Pronto. X testes gerados em Y segundos. E olhem a tabela de cobertura: saimos de zero para Z porcento. Tudo isso a partir de uma frase em portugues."

---

### Passo 4: Batch Mode (60s)

```bash
fastest batch --card "Testar funcionalidades do modulo" --files example/ --output tests
```

**O que mostrar:**
- Deteccao automatica de multiplos arquivos no diretorio
- Barra de progresso: `[1/2]`, `[2/2]`
- Resumo final consolidado: arquivos processados, sucesso/falha, total de testes

**Fala do apresentador:**
> "E se eu tiver varios arquivos? O batch mode resolve. Aponto para um diretorio e ele processa tudo em sequencia. Aqui temos dois arquivos: o math.utils que ja vimos e o order.service com 11 metodos de e-commerce."

*(Durante o processamento:)*

> "Observem o progresso: arquivo 1 de 2, arquivo 2 de 2. Cada um recebe seus testes individuais."

*(No resumo final:)*

> "No final, um resumo consolidado. X testes gerados para Y arquivos. Imaginem isso num projeto real com dezenas de modulos."

---

### Passo 5: Features Extras (30s)

Nao executar comandos -- apenas mencionar verbalmente.

**Fala do apresentador:**
> "Alem do que mostramos, o Fastest tem mais recursos importantes:
>
> - A flag `--retries` permite auto-correcao: se o teste gerado falhar, ele tenta corrigir automaticamente.
> - Com `--cache`, voce economiza chamadas de API reutilizando respostas anteriores.
> - Se seu projeto usa Vitest em vez de Jest, basta passar `--framework vitest`.
> - E para novos projetos, o comando `fastest init` faz um setup guiado do zero.
>
> Tudo pensado para o dia a dia do desenvolvedor."

---

## Plano B (se a demo falhar)

| Problema | Solucao |
|----------|---------|
| API key invalida ou sem conexao | Usar `--dry-run` em todos os passos como fallback |
| Erro inesperado no generate | Mostrar screenshots salvos em `docs/apresentacao/screenshots/` |
| Tudo falhar | Rodar video de demonstracao pre-gravado (link no README) |
| Terminal travou | Fechar e reabrir -- comandos estao no txt para colar |

### Screenshots de backup

Salvar prints de cada passo em:

```
docs/apresentacao/screenshots/
  01-doctor.png
  02-dry-run.png
  03-generate-resultado.png
  04-batch-progresso.png
  04-batch-resumo.png
```

---

## Dicas Finais

- Testar a demo completa pelo menos 3 vezes antes da apresentacao
- Usar fonte grande no terminal (18pt ou maior)
- Fundo escuro no terminal para melhor contraste no projetor
- Ter os comandos prontos num arquivo `demo-comandos.txt` para copiar/colar
- Testar WiFi do local e ter hotspot do celular como backup
- Cronometrar cada passo para garantir que cabe nos 3-4 minutos
- Se possivel, usar um segundo monitor para consultar este script durante a demo
