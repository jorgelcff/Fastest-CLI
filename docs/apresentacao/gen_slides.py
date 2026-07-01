# -*- coding: utf-8 -*-
#
# Gerador dos slides da apresentacao final do Fastest CLI.
# Fonte de conteudo: docs/apresentacao/roteiro.md
#
# Uso:
#   pip install python-pptx
#   python3 docs/apresentacao/gen_slides.py
#   -> gera docs/apresentacao/slides.pptx (19 slides + notas do apresentador)
#
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

# ---------- Theme ----------
NAVY   = RGBColor(0x0B, 0x24, 0x47)
CYAN   = RGBColor(0x14, 0x9E, 0xCA)
LIGHT  = RGBColor(0xF2, 0xF6, 0xF9)
GREY   = RGBColor(0x5B, 0x6B, 0x79)
DARK   = RGBColor(0x1B, 0x2A, 0x36)
WHITE  = RGBColor(0xFF, 0xFF, 0xFF)
GREEN  = RGBColor(0x1E, 0x9E, 0x5A)
CODEBG = RGBColor(0x0E, 0x1B, 0x26)
CODEFG = RGBColor(0xCF, 0xE8, 0xF3)
TBLHEAD= NAVY
TBLALT = RGBColor(0xEA, 0xF1, 0xF6)

SW, SH = Inches(13.333), Inches(7.5)
LM = Inches(0.6)
CONTENT_W = Inches(13.333 - 1.2)

prs = Presentation()
prs.slide_width  = SW
prs.slide_height = SH
BLANK = prs.slide_layouts[6]

def add_notes(slide, text):
    if not text:
        return
    slide.notes_slide.notes_text_frame.text = text

def fill_rect(slide, x, y, w, h, color):
    from pptx.enum.shapes import MSO_SHAPE
    shp = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h)
    shp.fill.solid()
    shp.fill.fore_color.rgb = color
    shp.line.fill.background()
    shp.shadow.inherit = False
    return shp

def textbox(slide, x, y, w, h, anchor=MSO_ANCHOR.TOP):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = Inches(0.05)
    tf.margin_right = Inches(0.05)
    tf.margin_top = Inches(0.02)
    tf.margin_bottom = Inches(0.02)
    return tb, tf

def set_run(r, text, size, color, bold=False, italic=False, font="Calibri"):
    r.text = text
    r.font.size = Pt(size)
    r.font.color.rgb = color
    r.font.bold = bold
    r.font.italic = italic
    r.font.name = font

def base_slide(kicker, title, page):
    slide = prs.slides.add_slide(BLANK)
    # top accent bar
    fill_rect(slide, 0, 0, SW, Inches(0.18), CYAN)
    # kicker
    if kicker:
        tb, tf = textbox(slide, LM, Inches(0.35), CONTENT_W, Inches(0.35))
        p = tf.paragraphs[0]
        set_run(p.add_run(), kicker.upper(), 12, CYAN, bold=True)
    # title
    tb, tf = textbox(slide, LM, Inches(0.66), CONTENT_W, Inches(0.9))
    p = tf.paragraphs[0]
    set_run(p.add_run(), title, 28, NAVY, bold=True)
    # page number
    tb, tf = textbox(slide, Inches(12.4), Inches(7.0), Inches(0.8), Inches(0.35))
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.RIGHT
    set_run(p.add_run(), str(page), 11, GREY)
    # footer brand
    tb, tf = textbox(slide, LM, Inches(7.0), Inches(6), Inches(0.35))
    p = tf.paragraphs[0]
    set_run(p.add_run(), "Fastest CLI  ·  Metodologia Sinfonia", 10, GREY)
    return slide

def add_bullets(slide, y, items, w=CONTENT_W, size=16):
    h = Inches(0.34) * (len(items) + 1)
    tb, tf = textbox(slide, LM, y, w, h)
    first = True
    for it in items:
        lvl = 0
        txt = it
        bold = False
        if it.startswith("**") and it.endswith("**"):
            txt = it[2:-2]; bold = True
        elif it.startswith("  "):
            lvl = 1; txt = it.strip()
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.level = lvl
        p.space_after = Pt(4)
        if bold:
            set_run(p.add_run(), txt, size+1, NAVY, bold=True)
        else:
            bullet = "▸ " if lvl == 0 else "– "
            r = p.add_run(); set_run(r, bullet, size, CYAN, bold=True)
            r2 = p.add_run(); set_run(r2, txt, size, DARK)
    return Emu(int(y) + int(h))

def add_subtitle(slide, y, text, w=CONTENT_W):
    tb, tf = textbox(slide, LM, y, w, Inches(0.4))
    p = tf.paragraphs[0]
    set_run(p.add_run(), text, 17, CYAN, bold=True)
    return Emu(int(y) + int(Inches(0.45)))

def add_callout(slide, y, text, w=CONTENT_W, color=LIGHT, fg=NAVY):
    h = Inches(0.5 + 0.28 * (len(text)//90))
    rect = fill_rect(slide, LM, y, w, h, color)
    # accent left bar
    fill_rect(slide, LM, y, Inches(0.08), h, CYAN)
    tf = rect.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = Inches(0.25)
    p = tf.paragraphs[0]
    set_run(p.add_run(), text, 15, fg, italic=True, bold=True)
    return Emu(int(y) + int(h) + int(Inches(0.1)))

def add_code(slide, y, code, w=CONTENT_W):
    lines = code.split("\n")
    h = Inches(0.18) * len(lines) + Inches(0.3)
    rect = fill_rect(slide, LM, y, w, h, CODEBG)
    tf = rect.text_frame
    tf.word_wrap = False
    tf.margin_left = Inches(0.2)
    tf.margin_top = Inches(0.12)
    first = True
    for ln in lines:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.space_after = Pt(0)
        set_run(p.add_run(), ln if ln else " ", 10.5, CODEFG, font="Consolas")
    return Emu(int(y) + int(h) + int(Inches(0.1)))

def add_table(slide, y, rows, w=CONTENT_W, col_ratios=None):
    nrows = len(rows); ncols = len(rows[0])
    rh = 0.42
    h = Inches(rh * nrows)
    gt = slide.shapes.add_table(nrows, ncols, LM, y, w, h).table
    # column widths
    if col_ratios:
        total = sum(col_ratios)
        for i, r in enumerate(col_ratios):
            gt.columns[i].width = Emu(int(int(w) * r / total))
    # disable banding default styling by setting cell fills manually
    for ri, row in enumerate(rows):
        for ci, val in enumerate(row):
            cell = gt.cell(ri, ci)
            cell.margin_left = Inches(0.08)
            cell.margin_right = Inches(0.08)
            cell.margin_top = Inches(0.02)
            cell.margin_bottom = Inches(0.02)
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            if ri == 0:
                cell.fill.solid(); cell.fill.fore_color.rgb = TBLHEAD
            else:
                cell.fill.solid()
                cell.fill.fore_color.rgb = TBLALT if ri % 2 == 0 else WHITE
            tf = cell.text_frame; tf.word_wrap = True
            p = tf.paragraphs[0]
            r = p.add_run()
            set_run(r, str(val), 12 if ri else 12.5,
                    WHITE if ri == 0 else DARK, bold=(ri == 0))
    return Emu(int(y) + int(h) + int(Inches(0.1)))

def render(slide, blocks, start_y=1.55):
    y = Inches(start_y)
    for kind, data in blocks:
        if kind == "bullets":
            y = add_bullets(slide, y, data)
        elif kind == "subtitle":
            y = add_subtitle(slide, y, data)
        elif kind == "table":
            y = add_table(slide, y, data, col_ratios=None)
        elif kind == "table2":
            rows, ratios = data
            y = add_table(slide, y, rows, col_ratios=ratios)
        elif kind == "code":
            y = add_code(slide, y, data)
        elif kind == "callout":
            y = add_callout(slide, y, data)
        elif kind == "gap":
            y = Emu(int(y) + int(Inches(data)))
    return y

# ---------------- TITLE SLIDE ----------------
def title_slide():
    slide = prs.slides.add_slide(BLANK)
    fill_rect(slide, 0, 0, SW, SH, NAVY)
    fill_rect(slide, 0, Inches(4.55), SW, Inches(0.06), CYAN)
    tb, tf = textbox(slide, Inches(1.0), Inches(2.0), Inches(11.3), Inches(1.6))
    p = tf.paragraphs[0]
    set_run(p.add_run(), "Fastest CLI", 54, WHITE, bold=True)
    p2 = tf.add_paragraph()
    set_run(p2.add_run(), "Geração Inteligente de Testes com IA", 26, CYAN, bold=True)
    tb, tf = textbox(slide, Inches(1.0), Inches(4.8), Inches(11.3), Inches(2.2))
    lines = [
        ("Pipeline Inteligente de Geração de Testes a partir de Requisitos em Linguagem Natural", 15, WHITE, False),
        ("Domínio SWEBOK: Software Testing (Capítulo 4)  ·  v0.1.0", 13, RGBColor(0xB9,0xCE,0xDC), False),
        ("Equipe: Jorge Freitas (líder)", 13, RGBColor(0xB9,0xCE,0xDC), False),
        ("github.com/jorgelcff/Fastest-CLI", 13, CYAN, False),
        ("TypeScript · Node.js · Jest/Vitest · OpenAI · Anthropic", 12, RGBColor(0x8FA,0x0,0x0) if False else RGBColor(0x9F,0xB7,0xC8), False),
    ]
    first = True
    for txt, sz, col, b in lines:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.space_after = Pt(6)
        set_run(p.add_run(), txt, sz, col, bold=b)
    add_notes(slide, "Boa noite a todos. Hoje vou apresentar o Fastest CLI, uma ferramenta de linha de comando que usa inteligencia artificial para gerar testes automatizados a partir de requisitos escritos em linguagem natural. O projeto se insere no dominio de Software Testing do SWEBOK, especificamente no Capitulo 4. A ferramenta esta na versao 0.1.0 e suporta tanto Jest quanto Vitest.")

title_slide()

# ---------------- SLIDES ----------------
M1 = "Movimento 1 · Exposição"
M2 = "Movimento 2 · Composição"
M3 = "Movimento 3 · Ensaio"
M4 = "Movimento 4 · Ressonância"

page = 2

def slide(kicker, title, blocks, notes, start_y=1.55):
    global page
    s = base_slide(kicker, title, page)
    render(s, blocks, start_y)
    add_notes(s, notes)
    page += 1
    return s

# Slide 2 - Problema
slide(M1, "O Problema: Testes são Caros e Negligenciados",
    [("table2", ([
        ["Dado", "Valor"],
        ["Tempo gasto em testes", "15–30% do ciclo de desenvolvimento"],
        ["Cobertura média em projetos reais", "< 50%"],
        ["Testes escritos após o código", "> 70% dos projetos"],
        ["Devs que consideram testes \"chatos\"", "62% (Stack Overflow)"],
    ], [4, 6])),
     ("gap", 0.15),
     ("bullets", [
        "Testes repetitivos consomem tempo criativo",
        "Qualidade inconsistente entre membros do time",
        "Cobertura cai conforme prazos apertam",
     ])],
    "Desenvolvedores gastam entre 15 e 30 por cento do tempo escrevendo testes, e ainda assim a cobertura media fica abaixo de 50 por cento. Existe uma tensao constante entre velocidade e qualidade. Testes sao a primeira coisa cortada quando o prazo aperta, e a qualidade varia muito entre desenvolvedores do mesmo time.")

# Slide 3 - Personas
slide(M1, "Para Quem Construímos: Carlos e Marina",
    [("subtitle", "Carlos, 28 — Desenvolvedor Backend"),
     ("bullets", [
        "Stack Node.js/TypeScript, 4 anos de experiência",
        "Dor: \"Detesto escrever testes, mas sei que preciso\"",
        "Meta: alcançar 70% de cobertura sem perder tempo",
        "Necessidade: gerar testes rápido a partir do que já sabe do código",
     ]),
     ("subtitle", "Marina, 34 — Tech Lead"),
     ("bullets", [
        "Gerencia time de 6 desenvolvedores",
        "Dor: \"Cada dev escreve testes de um jeito diferente\"",
        "Meta: padronizar qualidade de testes no time inteiro",
        "Necessidade: garantir consistência e cobrir edge cases",
     ])],
    "Duas personas guiaram o design. Carlos e o dev backend que considera testes tediosos e quer velocidade. Marina e a tech lead que sofre com inconsistencia e gasta horas revisando testes nos PRs. Para Marina, o Fastest precisa garantir um padrao de qualidade uniforme.")

# Slide 4 - Missao/Visao/KPIs
slide(M1, "Missão, Visão e Indicadores-Chave",
    [("callout", "Missão: democratizar a escrita de testes de qualidade através de IA generativa, reduzindo a barreira de entrada e aumentando a cobertura."),
     ("callout", "Visão: ser a ferramenta padrão de geração de testes em projetos TypeScript/JavaScript até 2027."),
     ("table2", ([
        ["KPI", "Meta", "Status Atual"],
        ["Cobertura do próprio projeto", "≥ 90%", "93%+"],
        ["Compilação dos testes gerados", "≥ 80%", "Validado"],
        ["Redução de tempo de escrita", "≥ 50%", "Validado"],
        ["Número de testes automatizados", "≥ 150", "201"],
        ["Taxa de passagem no Jest", "≥ 60%", "Validado"],
     ], [6, 2, 2]))],
    "Nossa missao e democratizar a escrita de testes. A visao e ser a ferramenta padrao para TypeScript e JavaScript. Definimos cinco KPIs e todos foram atingidos ou superados. Nosso proprio projeto tem 201 testes e mais de 93 por cento de cobertura — praticamos o que pregamos.")

# Slide 5 - C4 Contexto
slide(M2, "Arquitetura C4 — Diagrama de Contexto",
    [("code",
"""        Desenvolvedor (Persona)
                |
                |  requisitos em linguagem natural
                v
          +--------------+
          |  Fastest CLI |  v0.1.0  (TypeScript/Node.js)
          +--------------+
            |        |        |
            v        v        v
        +-------+ +--------+ +-------------+
        |OpenAI | |Anthro- | | Jest /      |
        | API   | |pic API | | Vitest      |
        +-------+ +--------+ +------+------+
                                    |
                                    v
                            Relatorios de Cobertura"""),
     ("bullets", [
        "Ator principal: desenvolvedor (via terminal)",
        "Sistema central: Fastest CLI (TypeScript/Node.js)",
        "Externos: OpenAI (gpt-4o-mini), Anthropic (claude-haiku), Jest/Vitest",
     ])],
    "No nivel de contexto, o desenvolvedor interage com o Fastest pelo terminal. A CLI se comunica com dois provedores de IA e os testes gerados sao executados por Jest ou Vitest, que produzem relatorios de cobertura. Um fluxo simples e direto.")

# Slide 6 - C4 Containers
slide(M2, "Arquitetura C4 — Containers e Integração com IA",
    [("code",
"""  +------------------------------------------------------+
  |            Fastest CLI Application (TS/Node)         |
  |  +-----------+  +-------------+  +---------------+   |
  |  | CLI Layer |  | Services    |  | Providers     |   |
  |  | generate  |  | LLM Service |  | OpenAI        |   |
  |  | batch     |  | TestGen     |  | Anthropic     |   |
  |  | doctor    |  | Coverage    |  | Factory       |   |
  |  | config    |  | Cache       |  |               |   |
  |  | init      |  |             |  |               |   |
  |  +-----------+  +-------------+  +---------------+   |
  +------------------------------------------------------+
         |                         |
         v                         v
   File System              LLM APIs (OpenAI/Anthropic)"""),
     ("bullets", [
        "LLM Service orquestra as chamadas aos provedores",
        "Provider Factory seleciona OpenAI ou Anthropic por configuração",
        "Cache Service evita chamadas duplicadas (economia de custo)",
        "Test Generator valida e formata o output da IA",
     ])],
    "A aplicacao tem tres camadas. CLI com cinco comandos. Services e o coracao: LLM Service orquestra, Test Generator valida, Coverage analisa, Cache evita chamadas duplicadas. Providers usa Factory Pattern para alternar entre OpenAI e Anthropic. A IA permeia a camada de servicos — nao e um modulo isolado.")

# Slide 7 - Decisoes arquiteturais
slide(M2, "Decisões Arquiteturais e Trade-offs",
    [("table2", ([
        ["Decisão", "Alternativa Rejeitada", "Justificativa"],
        ["CLI (terminal)", "App web / extensão IDE", "Menor fricção, integra com CI/CD"],
        ["Multi-provider (Factory)", "Apenas OpenAI", "Resiliência, evita vendor lock-in"],
        ["Cache local em arquivo", "Redis / banco", "Simplicidade, zero infra"],
        ["Temperature 0.2", "Temperature alta", "Testes determinísticos"],
        ["Jest + Vitest", "Apenas Jest", "Vitest é mais rápido e cresce"],
     ], [3, 3, 4])),
     ("gap", 0.1),
     ("bullets", [
        "Trade-offs aceitos: dependência de API (cache+retry+dry-run), custo por chamada (modelos econômicos), código enviado a APIs (permissões+dry-run)",
     ])],
    "Cada decisao envolveu trade-offs conscientes. CLI ao inves de app web por zero fricao. Factory Pattern evita lock-in. Temperature 0.2 e critica: testes precisam ser previsiveis, nao criativos. Aceitamos dependencia de APIs externas mas mitigamos com cache, retry e dry-run.")

# Slide 8 - Catalogo de prompts
slide(M2, "Catálogo de Prompts — 3 Prompts Centrais",
    [("subtitle", "1. buildTestPrompt (principal)"),
     ("bullets", [
        "Entrada: código-fonte, tipo (unit/integration/use-case), framework",
        "Saída: arquivo de teste completo · temperature 0.2, max_tokens 4096",
     ]),
     ("subtitle", "2. buildRetryPrompt (correção)"),
     ("bullets", [
        "Entrada: teste gerado + erro de compilação/execução → teste corrigido",
        "Loop de até 3 tentativas com feedback do erro",
     ]),
     ("subtitle", "3. buildCoverageSuggestionPrompt (otimização)"),
     ("bullets", [
        "Entrada: relatório de cobertura + código → sugestões de testes adicionais",
        "Prompts versionados no código (rastreabilidade e reproducibilidade)",
     ])],
    "Tres prompts com responsabilidades definidas. buildTestPrompt gera o arquivo completo com temperature 0.2. buildRetryPrompt e acionado quando o teste falha — recebe o erro e corrige, em loop de ate 3 tentativas. buildCoverageSuggestionPrompt sugere testes para linhas nao cobertas. Todos versionados no codigo.")

# Slide 9 - Canvas Experimento
slide(M2, "Canvas de Experimento — Hipótese e GO/NO-GO",
    [("callout", "Hipótese: uma CLI alimentada por IA reduz o tempo de escrita de testes em 60%, mantendo qualidade de cobertura equivalente."),
     ("table2", ([
        ["Critério GO", "Meta", "Resultado", "Status"],
        ["Compilação TypeScript", "≥ 80%", "Validado", "GO"],
        ["Taxa de passagem no Jest", "≥ 60%", "Validado", "GO"],
        ["Cobertura de código", "≥ 70%", "93%+", "GO"],
        ["Redução de tempo", "≥ 50%", "Validado", "GO"],
     ], [5, 2, 3, 2])),
     ("gap", 0.1),
     ("bullets", ["**Resultado: todos os critérios GO atendidos. Pipeline validada end-to-end.**"])],
    "Hipotese clara e mensuravel, com quatro criterios GO simultaneos. Todos atingidos ou superados. A cobertura chegou a 93 por cento, bem acima da meta de 70. A pipeline foi validada de ponta a ponta. Isso nos deu confianca para perseverar.")

# Slide 10 - DEMO
slide(M3, "🖥️  DEMO AO VIVO — Fastest CLI em Ação",
    [("callout", "⏸  PARAR A APRESENTAÇÃO E IR PARA O TERMINAL"),
     ("subtitle", "Roteiro da demo (~3–4 min)"),
     ("bullets", [
        "fastest doctor — diagnóstico do ambiente (15s)",
        "fastest generate — modo interativo sem flags (60s)",
        "fastest generate --test-type use-case — geração com flags (60s)",
        "fastest batch --files src/utils/ --dry-run — modo batch (30s)",
        "npx jest — execução dos testes gerados (30s)",
     ]),
     ("bullets", [
        "**Destaques: modo interativo · 3 tipos de teste (unit/integration/use-case) · pipeline geração→validação→execução→delta de cobertura**",
        "Plano B: screenshots prontos caso a API falhe (ver demo-script.md)",
     ])],
    "Agora pauso os slides e demonstro ao vivo. Primeiro o fastest doctor para mostrar o ambiente configurado. Depois o modo interativo — reparem que o CLI pergunta arquivo, card e tipo de teste, incluindo o novo tipo caso de uso. Em seguida geracao com flags e o modo batch. Consultar demo-script.md para falas detalhadas e plano B. Vamos ao terminal.")

# Slide 11 (orig 12) - Estrategia de testes
slide(M3, "Estratégia de Testes — 201 Testes, 93%+ Cobertura",
    [("table2", ([
        ["Marco", "Testes", "Cobertura"],
        ["v0.0.1 (baseline)", "154", "81,68%"],
        ["v0.0.2 (refatoração)", "~180", "~88%"],
        ["v0.1.0 (atual)", "201", "93%+"],
     ], [5, 2, 3])),
     ("gap", 0.1),
     ("bullets", [
        "**Distribuição por módulo**",
        "CLI Commands: generate, batch, doctor, config, init",
        "Services: llm, test-generator, coverage, cache (mocks de API)",
        "Providers: openai, anthropic, factory (respostas simuladas)",
        "Edge cases: inputs inválidos, timeouts, erros de API, cache miss/hit",
     ])],
    "Comecamos com 154 testes e 81 por cento e chegamos a 201 testes com 93 por cento. Foi estrategia deliberada. Cada modulo tem testes focados: providers com respostas simuladas, servicos com mocks, comandos CLI end-to-end. Investimos em edge cases — erro de API, cache expirado, input invalido. Essa cobertura nos da confianca para evoluir.")

# Slide 12 (orig 13) - Qualidade outputs IA
slide(M3, "Qualidade dos Testes Gerados pela IA",
    [("subtitle", "O que a IA faz bem"),
     ("bullets", [
        "Estrutura de teste (describe/it) consistente",
        "Identificação de happy paths e geração de mocks adequados",
        "Cobertura de branches básicas",
     ]),
     ("subtitle", "Onde a IA precisa de ajuda"),
     ("bullets", [
        "Lógica de negócio complexa e específica do domínio",
        "Testes de integração com estado compartilhado",
        "Assertions de performance e edge cases muito específicos",
     ]),
     ("callout", "Mecanismo de correção: retry com feedback do erro (até 3 tentativas) → eleva a taxa de passagem.")],
    "A qualidade e surpreendentemente boa para cenarios comuns — compilacao acima de 80 por cento. A IA e excelente em estrutura, mocks e happy path. Mas logica de dominio e edge cases especificos ainda precisam de intervencao humana. O retry com feedback ajuda: quando falha, enviamos o erro de volta e a IA corrige. Ate 3 tentativas resolvem a maioria.")

# Slide 13 (orig 14) - Seguranca
slide(M3, "Segurança e Confiabilidade",
    [("table2", ([
        ["Risco", "Mitigação"],
        ["Código-fonte enviado a APIs externas", "Documentação clara, consentimento, dry-run"],
        ["API keys expostas", "Permissões 0o600, .env no .gitignore"],
        ["Prompt injection via código-fonte", "Validação de input, sanitização"],
        ["Testes com código malicioso", "Validação antes da escrita, dry-run"],
        ["Custo descontrolado de API", "Cache local, limites de tokens, modelos econômicos"],
     ], [4, 6])),
     ("gap", 0.1),
     ("bullets", [
        "--dry-run visualiza sem executar  ·  cache evita reprocessamento  ·  nenhum dado persistido em servidores externos",
     ])],
    "Seguranca foi prioridade desde o inicio. O maior risco e enviar codigo-fonte a APIs externas — mitigado com transparencia e dry-run, que mostra o que sera enviado antes da chamada. API keys com permissoes 0o600. Validacao de inputs previne prompt injection. O cache local reduz chamadas, economizando custo e exposicao.")

# Slide 14 (orig 15) - Evolucao
slide(M3, "Evolução: v0.0.2 → v0.1.0",
    [("table2", ([
        ["Feature", "v0.0.2", "v0.1.0"],
        ["Providers", "Apenas OpenAI", "OpenAI + Anthropic"],
        ["Frameworks", "Apenas Jest", "Jest + Vitest"],
        ["Comandos", "4", "6 (+batch)"],
        ["Testes / Cobertura", "154 / 81,68%", "201 / 93%+"],
        ["Retry", "Sem retry", "Até 3 tentativas com feedback"],
        ["Validação", "Mínima", "Input validation completa"],
     ], [4, 3, 3])),
     ("gap", 0.1),
     ("bullets", [
        "Refatorações: Factory Pattern, separação de responsabilidades, tipagem TypeScript, batch mode",
     ])],
    "A evolucao foi significativa. De um provedor para dois, de um framework para dois, com batch mode e retry com feedback. Cobertura saltou de 81 para 93 por cento. As refatoracoes incluiram Factory Pattern, melhor separacao de responsabilidades e validacao de input completa. Cada melhoria guiada por feedback e pelos criterios do experimento.")

# Slide 15 (orig 16) - Resultados
slide(M4, "Resultados — Métricas vs Metas",
    [("table2", ([
        ["Métrica", "Meta", "Resultado", "Delta"],
        ["Testes automatizados", "≥ 150", "201", "+34%"],
        ["Cobertura de código", "≥ 70%", "93%+", "+23pp"],
        ["Compilação dos outputs", "≥ 80%", "Atingido", "GO"],
        ["Passagem no Jest", "≥ 60%", "Atingido", "GO"],
        ["Comandos funcionais", "4", "6", "+50%"],
        ["Providers suportados", "1", "2", "+100%"],
     ], [4, 2, 2, 2])),
     ("gap", 0.1),
     ("bullets", ["**Pipeline validada: requisito → prompt → LLM → teste → execução → cobertura. Todos os GO atendidos.**"])],
    "Cada metrica nao apenas atingiu, mas superou. De 154 para 201 testes, 34 por cento acima da meta. Cobertura 23 pontos acima da meta. Seis comandos em vez de quatro, dois providers em vez de um. E o mais importante: a pipeline foi validada de ponta a ponta.")

# Slide 16 (orig 17) - Feedback
slide(M4, "Painel de Feedback — Temas e Insights",
    [("subtitle", "Feedback positivo"),
     ("bullets", [
        "\"Gerar testes pelo terminal é muito mais rápido que manualmente\"",
        "\"O modo batch é um game-changer para projetos grandes\"",
        "\"Suporte a Vitest faltava em outras ferramentas\"",
     ]),
     ("subtitle", "Oportunidades"),
     ("bullets", [
        "Mais linguagens além de TypeScript/JavaScript",
        "Integração com IDE  ·  testes de integração com banco de dados",
     ]),
     ("callout", "Insight: batch mode é a feature mais valorizada por tech leads (Marina); generate simples agrada devs individuais (Carlos); dry-run é mais usado que o esperado.")],
    "O feedback confirmou as hipoteses sobre as personas. Carlos adora o generate simples. Marina se identifica com o batch mode para padronizar em escala. Insight surpresa: o uso do dry-run — desenvolvedores querem ver o que sera gerado antes. As oportunidades alimentam o roadmap: mais linguagens, IDEs, documentacao.")

# Slide 17 (orig 18) - Decisao PERSEVERAR
slide(M4, "Decisão: PERSEVERAR",
    [("table2", ([
        ["Opção", "Critério", "Resultado"],
        ["PERSEVERAR", "Todos os critérios GO atendidos", "SIM"],
        ["PIVOTAR", "Hipótese invalidada, domínio válido", "N/A"],
        ["ABANDONAR", "Domínio sem viabilidade", "N/A"],
     ], [3, 5, 2])),
     ("gap", 0.1),
     ("bullets", [
        "201 testes, 93%+ cobertura (meta: 150 / 70%)",
        "Pipeline end-to-end funcional · hipótese validada",
        "Arquitetura extensível (Factory permite novos providers)",
        "**Próximos passos: publicar v0.1.0, coletar métricas reais, expandir beta**",
     ])],
    "A decisao e clara: PERSEVERAR. Todos os criterios GO atendidos ou superados. A hipotese foi validada. Os dados suportam: 201 testes, 93 por cento de cobertura, pipeline funcional. A arquitetura e extensivel — Factory Pattern permite novos providers sem mudar o codigo. Nao ha razao para pivotar ou abandonar.")

# Slide 18 (orig 19) - Roadmap
slide(M4, "Roadmap — v0.5 e v1.0",
    [("subtitle", "v0.5 (próximo trimestre)"),
     ("bullets", [
        "Mais modelos (GPT-4o, Claude Sonnet)  ·  watch mode",
        "Retry com análise semântica  ·  prompts customizados  ·  relatório HTML",
     ]),
     ("subtitle", "v1.0 (6 meses)"),
     ("bullets", [
        "Suporte a Python e Go  ·  plugin system para frameworks",
        "Integração VS Code / JetBrains  ·  análise de mutação  ·  CI/CD",
     ]),
     ("callout", "Visão de longo prazo: agente autônomo de qualidade — sugere testes proativamente em PRs e aprende com as correções do time.")],
    "O roadmap tem dois horizontes. v0.5 foca em polimento: mais modelos, watch mode, prompts customizaveis. v1.0 cresce em ambicao: Python e Go, integracao com IDEs, sistema de plugins. A visao de longo prazo e um agente autonomo de qualidade que sugere testes em pull requests e aprende com correcoes. O Factory Pattern de hoje e o alicerce dessa extensibilidade.")

# Slide 19 (orig 20) - Reflexao IA
slide(M4, "Reflexão: Uso de IA no Desenvolvimento",
    [("table2", ([
        ["Onde", "Ferramenta", "Para quê"],
        ["Desenvolvimento do CLI", "Claude (Anthropic)", "Codificação, refatoração, testes"],
        ["Geração de testes (produto)", "gpt-4o-mini, Claude Haiku", "Core feature da ferramenta"],
        ["Documentação", "Claude", "Revisão e estruturação"],
     ], [4, 3, 4])),
     ("bullets", [
        "Limitações: foco em happy path · outputs exigem revisão humana · dependência de APIs externas",
     ]),
     ("callout", "Atribuição: a IA foi usada como assistente no desenvolvimento. Todos os outputs foram revisados e validados por humanos — a IA é ferramenta, não substituto.")],
    "Para encerrar, uma reflexao. Usamos Claude como assistente no desenvolvimento e OpenAI/Anthropic como motores do produto. E importante reconhecer limitacoes: a IA e excelente para cenarios comuns, mas logica complexa precisa do olhar humano. Os testes tendem ao happy path — por isso o retry e importante. Somos transparentes: o usuario sabe que os testes sao gerados por IA. A IA e poderosa, mas o desenvolvedor continua essencial. Obrigado — aberto para perguntas.")

prs.save("/home/user/Fastest-CLI/docs/apresentacao/slides.pptx")
print("OK - slides:", len(prs.slides._sldIdLst))
