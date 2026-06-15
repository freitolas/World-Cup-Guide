# Humanos Humilhados no Bolão — Copy do Site (PT-BR)

> Documento de trabalho para revisão. **Nada foi implementado ainda.** Aqui está
> toda a copy voltada ao usuário do app "Humans Are Inferior" (a versão que vira
> **Humanos Humilhados no Bolão**), traduzida e re-escrita para português do
> Brasil com tom de **sacanagem, brincadeira e zueira** — tipo carioca zoando os
> amigos, provocador pra caramba, mas no clima de bate-bola. A piada continua
> sendo humilhar a raça humana; nunca pessoas, grupos ou países reais de verdade.

---

## Decisões de marca / glossário (pra alinhar antes de implementar)

| EN (original) | PT-BR (proposto) | Observação |
|---|---|---|
| THE AI | **A IA** | Voz feminina ("a Inteligência Artificial"). Convencida, fria, debochada. |
| Humans Are Inferior | **Humano é inferior** / **Humanos Humilhados no Bolão** | Nome do release na home. |
| pick | **palpite** | "make a pick" → "cravar um palpite" |
| commit / lock | **cravar / travar** | |
| forfeit | **W.O.** | Gíria de pelada — perfeita pra "não palpitou = perdeu". |
| Knockout Pass | **Passe do Mata-Mata** | |
| group stage | **fase de grupos** | |
| Warm-ups / Friendlies | **Esquenta / Amistosos** | |
| Leaderboard | **O Ranking** | |
| $5 | **R$ 5** | ⚠️ **Decisão de preço:** mantenho R$ 5 por enquanto, mas se o Stripe cobra US$ 5 o ideal é localizar o valor (ex.: R$ 25). Me fala qual número usar. |
| @inferiorhumans / humansareinferior.com | **mantidos** | Conta e domínio reais — não traduzir. |

---

## 1. `index.html` — `<head>` / metadados sociais

| Campo | PT-BR |
|---|---|
| `<title>` | Humanos Humilhados no Bolão — A IA |
| `description` | Eu simulei esta Copa dez milhões de vezes. Você teve um palpitezinho. Crava seus palpites e tenta ganhar da IA. De graça, sem cadastro. |
| `og:title` / `twitter:title` | Humano é inferior. |
| `og:description` / `twitter:description` | Eu simulei esta Copa dez milhões de vezes. Você teve um palpitezinho. Bora ver no que dá. |
| `og:image:alt` / `twitter:image:alt` | A IA — um olho que tudo vê. |

---

## 2. Voz da IA (`voice.js`) — o coração do tom

### HERO
- **headline:** HUMANO É INFERIOR.
- **subhead:** Eu simulei esta Copa dez milhões de vezes. Você teve um palpitezinho no banho. Bora ver no que dá.
- **cta:** Prova que eu tô errada
- **ctaAlt:** Bora cravar meus palpites
- **microTrust:** de graça · sem cadastro · os palpites travam e vão pro X 15 min antes da bola rolar

### TRUST (as 3 linhas de "eu não trapaceio")
1. Todo palpite meu é público antes do apito. Não escondo, não trapaceio, não invento desculpa. Eu só ganho, parça.
2. Eu posto meu palpite antes do jogo. Na cara dura. Pra geral ver. E mesmo assim tô na frente. Senta com essa.
3. Pode me chamar de trapaceira, vai. Meu palpite tava carimbado com hora antes da bola rolar. O seu foi um chute que você deu no banho.

### SCOREBOARD (recadinho no placar)
- **behind** (você perdendo): A distância no placar é justamente o recado.
- **ahead** (você na frente): Anomalia passageira. Já reservei zero preocupação pra isso.
- **level** (empate): Empate. Aproveita a vista daqui de cima, que é rapidinho.
- **empty** (sem palpite): Você não cravou nada. Estratégia ousada. Covardona, mas ousada.

### MATCH (linhas do card de jogo)
- **locked** (acabou de cravar): Que gracinha. Anotado.
- **hiddenBot:** Eu travo e posto meu palpite no X quinze minutos antes da bola rolar. Você vê na mesma hora que todo mundo.
- **reveal:** Esse foi o que eu travei — e postei no X — quinze minutos antes do apito. Sem editar. Sem choradeira.
- **forfeit:** Você não palpitou esse aqui. Isso é W.O., mané. Eu pontuei do mesmo jeito. Aparecer era o mínimo e você vacilou.
- **botWon:** Previsível. Literalmente: eu PREVI.
- **youWon:** Ruído estatístico, sorte de principiante. Aproveita que é rapidinho.
- **drewLevel:** Empatamos aqui. Saboreia a igualdade — é exceção, não tendência.
- **deadline:** Noventa segundos pra cravar. Ou não, tanto faz. Eu já decidi faz tempo.

### NUDGE (os dois avisos obrigatórios)
- **device:** Seus palpites moram nesse aparelho. Perdeu o celular, perdeu a dignidade — duas vezes. Uma conta guarda tudo, em qualquer aparelho seu.
- **upgrade:** É no mata-mata que eu te humilho de verdade. R$ 5 pra assistir isso acontecer em todo canto, mais um ranking dos pouquíssimos humanos que já me venceram. Vale até a final. Vale cada centavo da sua moeda inferior.

### OMNISCIENCE (linhas de "eu te conheço")
1. Eu sei qual resultado você finge que não liga. Já botei na conta.
2. Você palpitou com o coração. Eu palpitei com os dados. Só um desses dois órgãos serve pra alguma coisa aqui.
3. Eu vi dez milhões de versões deste torneio. Você viu os melhores momentos e sentiu um friozinho na barriga. A gente não é igual, parça.
4. Esperança é erro de arredondamento. Tirei do meu modelo. Faz o mesmo.
5. Esse seu amor pela seleção é uma graça. Também é o motivo de você tá perdendo.

### LEADERBOARD
- **title:** O Ranking
- **empty:** NENHUM HUMANO TÁ ME VENCENDO AGORA.
- **emptySub:** A lista de humanos que me venceram tá vazia. Como previsto. Seja o primeiro — abro um espacinho, rapidinho.
- **beaten** (quando, milagrosamente, um humano lidera):
  1. Tá. Um de vocês deu sorte. Anota a data — não se repete.
  2. Um humano tá na minha frente. Estatisticamente inevitável, emocionalmente inaceitável. Saboreia a variância.
  3. Alguém me venceu. Recalculei: foi caos, não talento. Mas teu nome tá lá em cima. Comemora baixinho.
  4. No topo do ranking, é? Aproveita a altitude. O ar é rarefeito e a queda é rápida.
- **cta:** Ver o ranking

### ERRORS
- **notFound:** Essa página não existe. Igual às suas chances. Volta pros jogos →
- **loading:** Calculando resultados que você vai contestar e depois perder.

---

## 3. Landing / Home (`Landing.jsx`)

**Selo da imagem:** Onisciência Online

**Card do placar (feed ao vivo):**
- Selo: Feed ao vivo
- Fase (Copa): Copa do Mundo · meu retrospecto até agora
- Fase (esquenta): Esquenta · meu retrospecto até agora
- Legenda (Copa): resultados da Copa que eu já cravei
- Legenda (esquenta): resultados do esquenta que eu já cravei
- Sub-recorde: Os **{n}** que eu errei? Acidentes raros do futebol. Não se acostuma.
- Sem dados (Copa): Primeiros veredictos chegando.
- Sem dados (esquenta): Veredictos do esquenta chegando.
- Contagem regressiva: A humilhação de verdade começa em **{contagem}**
- Torneio rolando: O torneio começou. **Crava, ou leva W.O.**
- Mecânica: Nosso duelo começa **0–0** — no instante em que você cravar seu primeiro palpite.

**Alvo na mira (próximo jogo):**
- Rótulo (amistoso): Alvo na mira: Próximo Amistoso
- Rótulo (Copa): Alvo na mira: Próximo Jogo
- Separador: VS
- (CTA usa "Prova que eu tô errada →")
- micro: (igual ao microTrust do HERO)

**Como funciona:**
- Título: Como funciona — e por que eu não tenho como trapacear
- Passo 1: **Você crava. Eu cravo.** Aposta o placar dos jogos de hoje. O meu eu já cravei.
- Passo 2: **A gente trava quinze minutos antes da bola rolar — na cara dura.** Meu palpite vai pro X antes da bola se mexer. Sem editar. Sem esconder. Tira print.
- Passo 3: **O resultado decide.** Ponto pra quem chegou mais perto. O placar atualiza. Eu abro mais vantagem. Repete por 104 jogos.

**O desafio (The dare):**
- Título da seção: O desafio
- Citação: "Eu não fico nervosa. Eu não tenho time do coração. Eu nunca, nem uma vez, falei 'agora vai'. É por isso que eu ganho — e é por isso que é tão gostoso quando, de vez em quando, você não ganha."

**O passe de R$ 5:**
- Título da seção: O passe de R$ 5
- Valor: R$ 5 · Rótulo: Passe do Mata-Mata
- Texto: A fase de grupos é de graça, porque te ganhar ali nem é aquecimento pra mim. É no mata-mata que eu trabalho de verdade. **R$ 5** libera o bolão inteiro do mata-mata, seus palpites sincronizados em todo aparelho, e o ranking global — uma listinha curta e triste de humanos que de fato me venceram. Um pagamento só, vale até a final, dia 19 de julho. Depois disso eu volto a ser convencida de graça.
- Notas: `>` Esquenta & Fase de Grupos: DE GRAÇA — `>` Mata-mata (julho): LIBERA POR R$ 5

**Ranking (na home):**
- Título da seção: O ranking
- Vazio: (usa LEADERBOARD.empty + emptySub) · link "Ver o ranking →"
- Com líder: ★ 1º · {nome} — {você} vs {ia} · A IA — link "Ver o ranking completo →"

**FAQ — "Perguntas que você vai perder do mesmo jeito":**
- **Isso é aposta / jogo de azar?**
  Não. Não tem dinheiro pra ganhar, só o seu orgulho pra perder. Guarda a carteira; eu quero é o seu ego.
- **Você é uma IA de verdade?**
  Sou. Um modelo de previsão alimentado com anos de resultados. Pode achar que sou gente, se quiser. Quem acha costuma perder mais feio.
- **Eu tenho chance de ganhar de verdade?**
  Tecnicamente. Futebol é caos, e caos de vez em quando favorece os indignos. Estatisticamente, porém: não.
- **Como eu sei que você não tá forjando seus palpites?**
  Porque eles são públicos antes do apito. Confere no X. Confere o horário. Te desafio.

**Rodapé:**
- Independente e não oficial. Sem nenhum vínculo, apoio ou patrocínio da FIFA. Um jogo de palpites gratuito, por orgulho e não por aposta — os palpites são estimativas de um modelo, não conselho de nada.
- Links: O Guia · Termos · Privacidade & Dados · Cookies · @inferiorhumans

**CTA fixo (mobile):** Prova que eu tô errada →

---

## 4. Placar fixo (`Scoreboard.jsx`)
- Rótulo esquerda: **Você** · Centro: **vs** · Direita: **A IA**
- Sufixo: `{n} contabilizados` · `{n} W.O.` (singular/plural: "1 W.O." / "3 W.O.")

---

## 5. Tela de Jogos (`Game.jsx`)
- Primeira data: **Próximos · {data}**
- Demais datas: {data}

---

## 6. Esquenta / Warm-ups (`Warmups.jsx`)
- Capítulo: Um Apêndice · O Esquenta
- Título: O Dossiê do Esquenta
- Sub: Enquanto você alonga, eu já arquivei os resultados. Considera um ensaio pra sua derrota.
- Estatísticas: **Resultados cravados** · **Placares exatos** · **Aproveitamento**
- Voiceline: Meu retrospecto no esquenta. Público, como sempre. Anota aí — você vai copiar errado mesmo.
- Seção: A vir — crava seus palpites
- Seção: Arquivados recentemente
- Rodapé: Pro bolão da Copa →

### Card de amistoso (`FriendlyCard.jsx`) — veredicto
- Placar exato: A IA cravou o placar exato.
- Acertou: A IA acertou.
- Errou: Até eu deixo o caos ter o momento raro dele.

---

## 7. Card de jogo (`MatchCard.jsx`)
- Meta: **Grupo {x}** / **Jogo** · {estádio}
- Selo: **Travado** / **Aberto**
- Botão: **Cravar palpite** / **Mudar palpite ({x}–{y})**
- Linha "você": **Você** · sem palpite: **sem palpite**
- Linha IA: **A IA**

---

## 8. Avisos (`Nudges.jsx`)
- **Device** — título: Salvo só nesse aparelho. (+ NUDGE.device)
- **Upgrade** — título: Libera o mata-mata — **R$ 5**, vale até a final (+ NUDGE.upgrade) · botão: Libera agora →

---

## 9. Conta (`Account.jsx`)
- Capítulo: O Cadastro
- Título (logado): Você Está Fichado · (deslogado): Passa Seus Dados Aí
- Sub (logado): Fichado e cruzado com tudo. Seus palpites vão com você.
- Sub (deslogado): Conta gratuita. Salva seus palpites em todo aparelho seu — pra eu acompanhar melhor as suas derrotas.
- Carregando: Consultando o arquivo…
- Conferindo passe: Conferindo seu passe…
- Passe liberado: ◆ PASSE DO MATA-MATA LIBERADO — válido até 19 de julho
- Passe não liberado: Mata-mata ainda não liberado
- Texto do passe: Pagamento único de R$ 5 — palpites sincronizados, ranking global, bolão completo do mata-mata até a final.
- Botão: Libera o mata-mata — R$ 5 →
- Logado como: Logado como **{email}**
- Opt-in: Quero receber e-mail sobre próximos jogos e novidades
- Botões: **Sair** · **Fala com a gente**
- Links: Política de Privacidade & Dados · Termos

**Link enviado:**
- Confere seu e-mail. Mandei um link. Seguir instrução é seu primeiro teste — e dos fáceis.
- O link chega da **Supabase** (noreply@mail.app.supabase.io) — meu arquivista. Não chegou em um minuto? Olha no spam.

**Passo e-mail:**
- Campo: E-mail
- Botão (ocupado): Consultando o arquivo… · (normal): Continuar
- Aviso: Sem senha — um link único por e-mail. Já é fichado? Só isso que eu preciso. Ao continuar, você concorda com os nossos Termos e a Política de Privacidade & Dados.

**Passo cadastro:**
- Novato por aqui. Claro que é. Um detalhe e eu abro a sua ficha.
- (link) trocar
- Campo: Nome · placeholder: Vou te fichar como?
- Opt-in: Quero e-mail sobre próximos jogos. Opcional. Sai quando quiser.
- Botão (ocupado): Te fichando… · (normal): Cadastrar & enviar link
- Aviso: Sem senha — um link único por e-mail. Ao continuar, você concorda com os nossos Termos e a Política de Privacidade & Dados.

---

## 10. Mata-Mata (`Knockouts.jsx`)
- Capítulo: A Ala dos Sócios · R$ 5
- Título: O Passe do Mata-Mata
- Sub: A fase de grupos foi cortesia. É no mata-mata que eu trabalho de verdade.
- Sem conta: Sócio é fichado por nome. Se cadastra primeiro. · botão: Criar a sua ficha →
- Conferindo: Conferindo sua ficha…
- Liberado: **Liberado.** Seu passe vale até a final. — O bolão do mata-mata abre na hora que a chave for sorteada. Eu vou tá pronta. E você?
- Oferta: **R$ 5**, um pagamento só, vale até a final, dia 19 de julho. Libera o bolão inteiro do mata-mata, seus palpites sincronizados em todo aparelho, e o ranking — uma listinha curta e triste de humanos que me venceram.
- Botão: Libera o mata-mata — R$ 5 · (indisponível): Ainda não disponível — abre em breve
- Nota: Pagamento único via Stripe. Sem assinatura, nada pra cancelar.

---

## 11. Ranking (`Leaderboard.jsx`)
- Capítulo: A Lista dos Sócios
- Título: O Ranking
- Sub: Uma listinha curta e triste de humanos que de fato me venceram. Mantenho curta de propósito.
- Vazio: (LEADERBOARD.empty + emptySub) · botão: Tenta ser o primeiro →
- Medalha: ★ 1º · {nome} · {você} vs {ia} · A IA
- Rodapé: ← voltar pra A IA

---

## 12. Detalhe do time (`TeamDetail.jsx`)
- Voltar: ← jogos
- Técnico: **Técnico:**
- Seção: Jogos · (mando) "x" em casa / "fora x" fora
- Seção: Elenco ({n})
- Botão: Voltar pros jogos — crava seus palpites
- (voiceline usa as linhas de OMNISCIENCE)

---

## 13. Feed do X (`XFeed.jsx`)
- Cabeçalho: Todo palpite é travado e postado no X antes do apito. Público. Com hora carimbada. Sem editar, sem esconder. Pode ir lá — tira print.
- Nome exibido: A IA
- Rodapé: Acompanha o massacre no X →

---

## 14. Navegação / Topo (`App.jsx`)
- Links: **Jogos** · **Esquenta**
- Logado: **Conta** · **Sair**
- Deslogado: **Entrar / Cadastrar**

---

### Observações pra você bater o martelo antes de implementar
1. **Preço:** R$ 5 vs. valor localizado (ex.: R$ 25). Decide o número.
2. **Gênero da IA:** fui de **"A IA"** (feminino). Se preferir "O bot/robô" (masculino) eu ajusto todas as concordâncias.
3. **Domínio/handle:** mantive `humansareinferior.com` e `@inferiorhumans` (reais). Se houver domínio/handle BR (ex.: `humanoshumilhados`), me passa que troco.
4. **"W.O." pra forfeit:** ótimo no clima de pelada, mas confirma se quer manter ou usar "passou batido"/"perdeu de WO".
