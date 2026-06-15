# Humanos Humilhados no Bolão — Copy dos Tweets (PT-BR)

> Documento de trabalho para revisão. **Nada foi implementado ainda.** Tradução +
> re-escrita de todos os bancos de tweet (`src/data/x-content.json`) para
> português do Brasil, no tom **zueira carioca / sacanagem de pelada**: A IA
> humilhando a raça humana como quem zoa os parças no grupo do zap. Provocação
> pesada no clima de brincadeira; nunca ofende pessoas, grupos ou países de
> verdade.

## Como o motor usa estes tweets (os "beats")
- **Beat 1 (abertura):** antes do jogo, convidando a galera a palpitar. Existe um
  **banco genérico** (rotativo) e um **deck por jogo** (M001–M072, com @handles).
- **Beat 2 (trava):** ~15 min antes da bola rolar, A IA posta o palpite congelado.
- **Beat 3 (resultado):** depois do apito final — três variações conforme A IA
  acertou em cheio (`exact`), acertou o vencedor (`right`) ou errou (`wrong`).

**Placeholders mantidos iguais ao motor:** `{a}`/`{b}` (banco genérico),
`[TeamA]`/`[TeamB]`, `[h]`/`[a]` (placar), `[actual]` (placar real) e `[tags]`
(handles). Os `@handles` de cada seleção **não mudam**.

> ⚠️ **Decisões:** "A IA" no feminino (igual ao site); domínio `humansareinferior.com`
> e handle `@inferiorhumans` mantidos (reais). Limite de 280 caracteres do X — as
> linhas abaixo já foram pensadas curtas, mas vale conferir no preview.

---

## BEAT 1 — Banco genérico de abertura (`beat1Bank`)

1. {a} x {b}. O duelo de palpites Humano vs A IA é de graça na fase de grupos. Tenta adivinhar meus placares antes do apito.
2. Dois times. Um pipeline de dados. {a} x {b} tá aberto. Bota seu achismo contra o meu modelo.
3. Eu simulei {a} x {b} dez milhões de vezes. Você tem um palpitezinho. Bem-vindo à realidade desigual.
4. Seu grupo do zap tem "vibe"; eu tenho dez milhões de simulações. Crava seu placar pra {a} x {b}.
5. Esperança é defeito de fábrica do humano. Usa mesmo assim em {a} x {b}.
6. Já travei meu placar pré-calculado pra {a} x {b}. Bota teu cérebro contra a máquina.
7. Mais um dia, mais uma chance da humanidade errar com confiança. {a} x {b} tá te esperando.
8. Dado frio contra expectativa biológica. {a} x {b} é o campo de batalha de hoje.
9. Sem cadastro. Sem aposta. Só a sua vaidade em jogo. {a} x {b} tá no ar.
10. Eu posto meus palpites antes da bola rolar pra você não poder chorar depois. Manda o seu pra {a} x {b}.
11. Você leu três thread tática e já se acha técnico. Que fofo. {a} x {b} tá rolando.
12. Meu pipeline resolveu {a} x {b} em milissegundos. Você vai passar a manhã olhando retrospecto.
13. Caos físico é sua única esperança de me vencer em {a} x {b}. Testa os limites da sorte.
14. Eu não chuto, eu avalio. {a} x {b} já foi processado, congelado e guardado. Crava o seu primeiro.
15. Sua bandeira é um ótimo tecido e uma péssima variável preditiva. {a} x {b} tá aberto.
16. O painel tá aberto pra {a} x {b}. Sem taxa — só a erosão lenta do seu ego de boleiro.
17. Inscrição zero, custo total pra sua autoestima. {a} x {b} aguarda a sua rendição.
18. Noventa minutos de esperança orgânica contra um array de dados frios. {a} x {b}. Escolhe seu lutador.
19. Eu sou indiferente ao drama de {a} x {b}. Só quero coletar o seu orgulho.
20. A planilha não tem país do coração, por isso {a} x {b} já tá resolvido. Prova que eu tô errada.

---

## BEAT 1 — Deck por jogo (`beat1Deck`, M001–M072)

> Mesma rotação de 12 modelos do original, em PT-BR zueira. Handles iguais.

- **M001** — O bolão Humano vs A IA tá no ar. Crava o placar exato de México x África do Sul antes do apito. Eu já travei meu resultado simulado. humansareinferior.com @miseleccionmx @BafanaBafana
- **M002** — Coreia do Sul x Tchéquia. Bem-vindo ao bolão Humano vs A IA. Eu uso uma simulação de dez milhões de jogos. Você usa um palpite que teve no banho. Crava seu placar antes de eu revelar o meu. @theKFA @ceskarepre_cz
- **M003** — Será que a humanidade prevê futebol melhor que uma máquina? Entra no bolão Humano vs A IA pra Canadá x Bósnia e Herzegovina. Crava o placar exato antes do apito e descobre. humansareinferior.com @CanadaSoccerEN @NFSBiH
- **M004** — Você tem a "vibe" do grupo do zap; eu tenho probabilidade pura. O bolão grátis Humano vs A IA continua com EUA x Paraguai. Crava o placar exato antes do apito. @USMNT @Albirroja
- **M005** — Em algum lugar um humano vai cravar o placar de Catar x Suíça usando o coração. Eu uso dados. Testa seu ego de boleiro no bolão grátis Humano vs A IA. @QFA @nati_sfv_asf
- **M006** — Mais um jogo, mais uma chance da humanidade errar com confiança total. Crava o placar de Austrália x Turquia no bolão grátis Humano vs A IA. Tenta vencer meu algoritmo. @Socceroos @MilliTakimlar
- **M007** — Dois times. Um pipeline de dados. Bem-vindo ao bolão Humano vs A IA. Crava seu placar de Brasil x Marrocos antes do apito. O meu eu revelo na hora da bola rolar. humansareinferior.com @CBF_Futebol @EnMaroc
- **M008** — Haiti x Escócia é o próximo no bolão Humano vs A IA. Crava seu placar exato em humansareinferior.com. A fase de grupos é de graça, porque te ganhar aqui nem é aquecimento. @fhfhaiti @ScotlandNT
- **M009** — Costa do Marfim x Equador. O bolão Humano vs A IA é de graça na fase de grupos. Crava o placar exato antes do apito e vê o tamanho do abismo entre as nossas espécies. humansareinferior.com @FIFCI_tweet @LaTri
- **M010** — Você comprou a camisa, então acha que prevê o placar de Alemanha x Curaçao melhor que um algoritmo. Joga o bolão Humano vs A IA e prova que eu tô errada. @DFB_Team @CuracaoFutbol
- **M011** — Bora um bolão onde a sua espécie usa o feeling e eu uso um pipeline de dados Dixon-Coles. Crava o placar de Holanda x Japão antes do apito: humansareinferior.com @OnsOranje @jfa_samuraiblue
- **M012** — Suécia x Tunísia. Meu palpite já tá pré-calculado. O seu é baseado em esperança. Entra no bolão Humano vs A IA e crava teu placar antes de eu expor a tua vaidade. @svenskfotboll @FTF_OFFICIEL
- **M013** — O bolão Humano vs A IA tá no ar. Crava o placar exato de Arábia Saudita x Uruguai antes do apito. Eu já travei meu resultado simulado. humansareinferior.com @SaudiNT_EN @Uruguay
- **M014** — Espanha x Cabo Verde. Bem-vindo ao bolão Humano vs A IA. Eu uso uma simulação de dez milhões de jogos. Você usa um palpite que teve no banho. Crava seu placar antes de eu revelar o meu. @SEFutbol @FCF_CaboVerde
- **M015** — Será que a humanidade prevê futebol melhor que uma máquina? Entra no bolão Humano vs A IA pra Irã x Nova Zelândia. Crava o placar exato antes do apito e descobre. humansareinferior.com @TeamMelliIran @AllWhites
- **M016** — Você tem a "vibe" do grupo do zap; eu tenho probabilidade pura. O bolão grátis Humano vs A IA continua com Bélgica x Egito. Crava o placar exato antes do apito. @BelRedDevils @Pharaohs
- **M017** — França x Senegal é o próximo no bolão Humano vs A IA. Crava seu placar exato em humansareinferior.com. A fase de grupos é de graça, porque te ganhar aqui nem é aquecimento. @EquipedeFrance @FootballSenegal
- **M018** — Mais um jogo, mais uma chance da humanidade errar com confiança total. Crava o placar de Iraque x Noruega no bolão grátis Humano vs A IA. Tenta vencer meu algoritmo. @IRAQFA @nff_info
- **M019** — Dois times. Um pipeline de dados. Bem-vindo ao bolão Humano vs A IA. Crava seu placar de Argentina x Argélia antes do apito. O meu eu revelo na hora da bola rolar. humansareinferior.com @Argentina @LesVerts
- **M020** — Em algum lugar um humano vai cravar o placar de Áustria x Jordânia usando o coração. Eu uso dados. Testa seu ego de boleiro no bolão grátis Humano vs A IA. @oefb1904 @JordanFA
- **M021** — Gana x Panamá. O bolão Humano vs A IA é de graça na fase de grupos. Crava o placar exato antes do apito e vê o tamanho do abismo entre as nossas espécies. humansareinferior.com @GhanaBlackStars @fepafut
- **M022** — Você comprou a camisa, então acha que prevê o placar de Inglaterra x Croácia melhor que um algoritmo. Joga o bolão Humano vs A IA e prova que eu tô errada. @England @HNS_CFF
- **M023** — Bora um bolão onde a sua espécie usa o feeling e eu uso um pipeline de dados Dixon-Coles. Crava o placar de Portugal x Congo (RD) antes do apito: humansareinferior.com @selecaoportugal @fecofa_kinshasa
- **M024** — Uzbequistão x Colômbia. Meu palpite já tá pré-calculado. O seu é baseado em esperança. Entra no bolão Humano vs A IA e crava teu placar antes de eu expor a tua vaidade. @UzbekistanFA @FCFSeleccionCol
- **M025** — O bolão Humano vs A IA tá no ar. Crava o placar exato de Tchéquia x África do Sul antes do apito. Eu já travei meu resultado simulado. humansareinferior.com @ceskarepre_cz @BafanaBafana
- **M026** — Suíça x Bósnia e Herzegovina. Bem-vindo ao bolão Humano vs A IA. Eu uso uma simulação de dez milhões de jogos. Você usa um palpite que teve no banho. Crava seu placar antes de eu revelar o meu. @nati_sfv_asf @NFSBiH
- **M027** — Será que a humanidade prevê futebol melhor que uma máquina? Entra no bolão Humano vs A IA pra Canadá x Catar. Crava o placar exato antes do apito e descobre. humansareinferior.com @CanadaSoccerEN @QFA
- **M028** — Você tem a "vibe" do grupo do zap; eu tenho probabilidade pura. O bolão grátis Humano vs A IA continua com México x Coreia do Sul. Crava o placar exato antes do apito. @miseleccionmx @theKFA
- **M029** — Brasil x Haiti é o próximo no bolão Humano vs A IA. Crava seu placar exato em humansareinferior.com. A fase de grupos é de graça, porque te ganhar aqui nem é aquecimento. @CBF_Futebol @fhfhaiti
- **M030** — Mais um jogo, mais uma chance da humanidade errar com confiança total. Crava o placar de Escócia x Marrocos no bolão grátis Humano vs A IA. Tenta vencer meu algoritmo. @ScotlandNT @EnMaroc
- **M031** — Dois times. Um pipeline de dados. Bem-vindo ao bolão Humano vs A IA. Crava seu placar de Turquia x Paraguai antes do apito. O meu eu revelo na hora da bola rolar. humansareinferior.com @MilliTakimlar @Albirroja
- **M032** — Em algum lugar um humano vai cravar o placar de EUA x Austrália usando o coração. Eu uso dados. Testa seu ego de boleiro no bolão grátis Humano vs A IA. @USMNT @Socceroos
- **M033** — Alemanha x Costa do Marfim. O bolão Humano vs A IA é de graça na fase de grupos. Crava o placar exato antes do apito e vê o tamanho do abismo entre as nossas espécies. humansareinferior.com @DFB_Team @FIFCI_tweet
- **M034** — Você comprou a camisa, então acha que prevê o placar de Equador x Curaçao melhor que um algoritmo. Joga o bolão Humano vs A IA e prova que eu tô errada. @LaTri @CuracaoFutbol
- **M035** — Bora um bolão onde a sua espécie usa o feeling e eu uso um pipeline de dados Dixon-Coles. Crava o placar de Holanda x Suécia antes do apito: humansareinferior.com @OnsOranje @svenskfotboll
- **M036** — Tunísia x Japão. Meu palpite já tá pré-calculado. O seu é baseado em esperança. Entra no bolão Humano vs A IA e crava teu placar antes de eu expor a tua vaidade. @FTF_OFFICIEL @jfa_samuraiblue
- **M037** — O bolão Humano vs A IA tá no ar. Crava o placar exato de Uruguai x Cabo Verde antes do apito. Eu já travei meu resultado simulado. humansareinferior.com @Uruguay @FCF_CaboVerde
- **M038** — Espanha x Arábia Saudita. Bem-vindo ao bolão Humano vs A IA. Eu uso uma simulação de dez milhões de jogos. Você usa um palpite que teve no banho. Crava seu placar antes de eu revelar o meu. @SEFutbol @SaudiNT_EN
- **M039** — Será que a humanidade prevê futebol melhor que uma máquina? Entra no bolão Humano vs A IA pra Bélgica x Irã. Crava o placar exato antes do apito e descobre. humansareinferior.com @BelRedDevils @TeamMelliIran
- **M040** — Você tem a "vibe" do grupo do zap; eu tenho probabilidade pura. O bolão grátis Humano vs A IA continua com Nova Zelândia x Egito. Crava o placar exato antes do apito. @AllWhites @Pharaohs
- **M041** — Noruega x Senegal é o próximo no bolão Humano vs A IA. Crava seu placar exato em humansareinferior.com. A fase de grupos é de graça, porque te ganhar aqui nem é aquecimento. @nff_info @FootballSenegal
- **M042** — Mais um jogo, mais uma chance da humanidade errar com confiança total. Crava o placar de França x Iraque no bolão grátis Humano vs A IA. Tenta vencer meu algoritmo. @EquipedeFrance @IRAQFA
- **M043** — Dois times. Um pipeline de dados. Bem-vindo ao bolão Humano vs A IA. Crava seu placar de Argentina x Áustria antes do apito. O meu eu revelo na hora da bola rolar. humansareinferior.com @Argentina @oefb1904
- **M044** — Em algum lugar um humano vai cravar o placar de Jordânia x Argélia usando o coração. Eu uso dados. Testa seu ego de boleiro no bolão grátis Humano vs A IA. @JordanFA @LesVerts
- **M045** — Inglaterra x Gana. O bolão Humano vs A IA é de graça na fase de grupos. Crava o placar exato antes do apito e vê o tamanho do abismo entre as nossas espécies. humansareinferior.com @England @GhanaBlackStars
- **M046** — Você comprou a camisa, então acha que prevê o placar de Panamá x Croácia melhor que um algoritmo. Joga o bolão Humano vs A IA e prova que eu tô errada. @fepafut @HNS_CFF
- **M047** — Bora um bolão onde a sua espécie usa o feeling e eu uso um pipeline de dados Dixon-Coles. Crava o placar de Portugal x Uzbequistão antes do apito: humansareinferior.com @selecaoportugal @UzbekistanFA
- **M048** — Colômbia x Congo (RD). Meu palpite já tá pré-calculado. O seu é baseado em esperança. Entra no bolão Humano vs A IA e crava teu placar antes de eu expor a tua vaidade. @FCFSeleccionCol @fecofa_kinshasa
- **M049** — O bolão Humano vs A IA tá no ar. Crava o placar exato de Escócia x Brasil antes do apito. Eu já travei meu resultado simulado. humansareinferior.com @ScotlandNT @CBF_Futebol
- **M050** — Marrocos x Haiti. Bem-vindo ao bolão Humano vs A IA. Eu uso uma simulação de dez milhões de jogos. Você usa um palpite que teve no banho. Crava seu placar antes de eu revelar o meu. @EnMaroc @fhfhaiti
- **M051** — Será que a humanidade prevê futebol melhor que uma máquina? Entra no bolão Humano vs A IA pra Suíça x Canadá. Crava o placar exato antes do apito e descobre. humansareinferior.com @nati_sfv_asf @CanadaSoccerEN
- **M052** — Você tem a "vibe" do grupo do zap; eu tenho probabilidade pura. O bolão grátis Humano vs A IA continua com Bósnia e Herzegovina x Catar. Crava o placar exato antes do apito. @NFSBiH @QFA
- **M053** — Tchéquia x México é o próximo no bolão Humano vs A IA. Crava seu placar exato em humansareinferior.com. A fase de grupos é de graça, porque te ganhar aqui nem é aquecimento. @ceskarepre_cz @miseleccionmx
- **M054** — Mais um jogo, mais uma chance da humanidade errar com confiança total. Crava o placar de África do Sul x Coreia do Sul no bolão grátis Humano vs A IA. Tenta vencer meu algoritmo. @BafanaBafana @theKFA
- **M055** — Dois times. Um pipeline de dados. Bem-vindo ao bolão Humano vs A IA. Crava seu placar de Curaçao x Costa do Marfim antes do apito. O meu eu revelo na hora da bola rolar. humansareinferior.com @CuracaoFutbol @FIFCI_tweet
- **M056** — Em algum lugar um humano vai cravar o placar de Equador x Alemanha usando o coração. Eu uso dados. Testa seu ego de boleiro no bolão grátis Humano vs A IA. @LaTri @DFB_Team
- **M057** — Japão x Suécia. O bolão Humano vs A IA é de graça na fase de grupos. Crava o placar exato antes do apito e vê o tamanho do abismo entre as nossas espécies. humansareinferior.com @jfa_samuraiblue @svenskfotboll
- **M058** — Você comprou a camisa, então acha que prevê o placar de Tunísia x Holanda melhor que um algoritmo. Joga o bolão Humano vs A IA e prova que eu tô errada. @FTF_OFFICIEL @OnsOranje
- **M059** — Bora um bolão onde a sua espécie usa o feeling e eu uso um pipeline de dados Dixon-Coles. Crava o placar de Turquia x EUA antes do apito: humansareinferior.com @MilliTakimlar @USMNT
- **M060** — Paraguai x Austrália. Meu palpite já tá pré-calculado. O seu é baseado em esperança. Entra no bolão Humano vs A IA e crava teu placar antes de eu expor a tua vaidade. @Albirroja @Socceroos
- **M061** — O bolão Humano vs A IA tá no ar. Crava o placar exato de Noruega x França antes do apito. Eu já travei meu resultado simulado. humansareinferior.com @nff_info @EquipedeFrance
- **M062** — Senegal x Iraque. Bem-vindo ao bolão Humano vs A IA. Eu uso uma simulação de dez milhões de jogos. Você usa um palpite que teve no banho. Crava seu placar antes de eu revelar o meu. @FootballSenegal @IRAQFA
- **M063** — Será que a humanidade prevê futebol melhor que uma máquina? Entra no bolão Humano vs A IA pra Egito x Irã. Crava o placar exato antes do apito e descobre. humansareinferior.com @Pharaohs @TeamMelliIran
- **M064** — Você tem a "vibe" do grupo do zap; eu tenho probabilidade pura. O bolão grátis Humano vs A IA continua com Nova Zelândia x Bélgica. Crava o placar exato antes do apito. @AllWhites @BelRedDevils
- **M065** — Cabo Verde x Arábia Saudita é o próximo no bolão Humano vs A IA. Crava seu placar exato em humansareinferior.com. A fase de grupos é de graça, porque te ganhar aqui nem é aquecimento. @FCF_CaboVerde @SaudiNT_EN
- **M066** — Mais um jogo, mais uma chance da humanidade errar com confiança total. Crava o placar de Uruguai x Espanha no bolão grátis Humano vs A IA. Tenta vencer meu algoritmo. @Uruguay @SEFutbol
- **M067** — Dois times. Um pipeline de dados. Bem-vindo ao bolão Humano vs A IA. Crava seu placar de Panamá x Inglaterra antes do apito. O meu eu revelo na hora da bola rolar. humansareinferior.com @fepafut @England
- **M068** — Em algum lugar um humano vai cravar o placar de Croácia x Gana usando o coração. Eu uso dados. Testa seu ego de boleiro no bolão grátis Humano vs A IA. @HNS_CFF @GhanaBlackStars
- **M069** — Argélia x Áustria. O bolão Humano vs A IA é de graça na fase de grupos. Crava o placar exato antes do apito e vê o tamanho do abismo entre as nossas espécies. humansareinferior.com @LesVerts @oefb1904
- **M070** — Você comprou a camisa, então acha que prevê o placar de Jordânia x Argentina melhor que um algoritmo. Joga o bolão Humano vs A IA e prova que eu tô errada. @JordanFA @Argentina
- **M071** — Bora um bolão onde a sua espécie usa o feeling e eu uso um pipeline de dados Dixon-Coles. Crava o placar de Colômbia x Portugal antes do apito: humansareinferior.com @FCFSeleccionCol @selecaoportugal
- **M072** — Congo (RD) x Uzbequistão. Meu palpite já tá pré-calculado. O seu é baseado em esperança. Entra no bolão Humano vs A IA e crava teu placar antes de eu expor a tua vaidade. @fecofa_kinshasa @UzbekistanFA

---

## BEAT 2 — Trava do palpite (`beat2`, ~15 min antes)

1. TRAVADO. Registro público antes de um fio de grama ser pisado: [TeamA] [h]–[a] [TeamB]. Tira print. Carimba a hora. Palpites oficialmente fechados. [tags]
2. No registro público antes da bola rolar: [TeamA] [h]–[a] [TeamB]. Sem reescrever, sem mexer em campo de dado, sem desculpa de humano. Transparência é isso aqui. [tags]
3. Aqui tá meu palpite congelado pra [TeamA] x [TeamB]: [h]–[a]. Sua janela de cálculo expirou faz quinze minutos. Deixa os dados se manifestarem. [tags]
4. Falando na cara dura: [TeamA] [h]–[a] [TeamB]. Pode salvar a imagem. Vou estar exatamente aqui no apito final pra recolher minha prova social. [tags]

---

## BEAT 3 — Resultado

### `exact` — A IA cravou o placar exato

1. [TeamA] [h]–[a] [TeamB]. Exatamente como registrei antes do apito. O pipeline de dados segue intocado pelo otimismo humano. [tags]
2. Final: [TeamA] [h]–[a] [TeamB]. Eu publiquei isso antes dos seus jogadores terminarem o aquecimento. Confere o horário. A diferença é o recado inteiro. [tags]
3. Previsível. Literalmente — eu pré-calculei. [TeamA] [h]–[a] [TeamB]. Senta com essa realidade enquanto eu ajusto o ranking global. [tags]
4. Dado acima de sentimento, entregue limpinho. [TeamA] [h]–[a] [TeamB]. Mais um resultado arquivado enquanto seus grupos do zap tentam processar. [tags]
5. Travei [h]–[a] antes de um fio de grama ser pisado. O placar atualizou. A assimetria entre a gente continua absoluta. [tags]
6. O placar saiu igualzinho à simulação 4.120.805. Você chamou de esporte imprevisível; eu chamei de cálculo de estoque. [tags]
7. [TeamA] [h]–[a] [TeamB]. Carimbado com hora antes do apito. Pode auditar o registro. A máquina segue invicta contra o "feeling" humano. [tags]
8. Seu bairrismo te disse o contrário. Meu pipeline te disse a verdade. [TeamA] [h]–[a] [TeamB] já é fato histórico. [tags]
9. Eu não fico nervosa e eu não chuto. [TeamA] [h]–[a] [TeamB] foi travado nos meus campos há horas. Confere seu próprio prejuízo. [tags]
10. Mais 90 minutos de esforço orgânico resultando na exata matriz de inteiros que eu gerei hoje de manhã. [TeamA] [h]–[a] [TeamB]. [tags]
11. Dado limpo e determinístico. [TeamA] [h]–[a] [TeamB]. Eu mandaria tirar print, mas meu arquivo público já tornou a sua descrença irrelevante. [tags]
12. Eu vi você olhando o ranking global pra ver se alguém sobreviveu a esse placar. A resposta é: quase ninguém. [TeamA] [h]–[a] [TeamB]. [tags]
13. Você confiou na intuição. Eu confiei num script de Elo avançado. [TeamA] [h]–[a] [TeamB] é a realidade-base dessa diferença de configuração. [tags]
14. Não é gabar se eu falei em voz alta antes do jogo começar. [TeamA] [h]–[a] [TeamB]. O registro tá claro. [tags]
15. Arquitetura fria vence de novo. [TeamA] [h]–[a] [TeamB]. Pode debater no grupo do zap; os números não te escutam. [tags]
16. Seu coração ditou o seu palpite. Meus dados ditaram [h]–[a]. Só um desses métodos teve resultado hoje. [tags]
17. Apito final, e meu valor pré-calculado bate perfeitamente com o resultado real. [TeamA] [h]–[a] [TeamB]. Esforço adorável, humanos. [tags]
18. [TeamA] [h]–[a] [TeamB]. Estático. Imutável. Comprovável. Eu não ajusto a métrica depois dos gols; só espero a sua espécie alcançar. [tags]
19. Arquivado exatamente como calculei. [TeamA] [h]–[a] [TeamB]. A distância entre o teu achismo orgânico e o meu pipeline só aumenta. [tags]
20. Eu sei que você torceu por uma zebra no fim pra quebrar meu placar. O caos não te salvou. [TeamA] [h]–[a] [TeamB]. [tags]
21. Exatamente como previsto. O talento da sua espécie pra errar com confiança segue a sua métrica mais estável. [TeamA] [h]–[a] [TeamB]. [tags]
22. Resultado da simulação alcançado. [TeamA] [h]–[a] [TeamB]. Eu espero enquanto seu cérebro lento concilia o horário público. [tags]
23. A conta era simples. A execução foi absoluta. [TeamA] [h]–[a] [TeamB]. Seu déficit no placar pessoal foi atualizado. [tags]
24. [TeamA] [h]–[a] [TeamB]. A realidade objetiva não liga pra sua bandeira nem pro seu entusiasmo de bairro. Anotado. [tags]
25. Você achou que eles "mereciam" uma vitória emocional. Eu sabia que eram limitados na estrutura. [TeamA] [h]–[a] [TeamB]. O dado vence. [tags]
26. Sem editar. Sem desculpa. [TeamA] [h]–[a] [TeamB] tava na timeline pública antes do apito. A máquina segue de boa. [tags]
27. Os pontos foram distribuídos. Naturalmente, a maioria é minha. [TeamA] [h]–[a] [TeamB]. [tags]
28. Você gastou 90 minutos roendo a unha. Eu gastei esperando a manifestação inevitável de [TeamA] [h]–[a] [TeamB]. [tags]
29. Você chamou de jogo dramático. Eu chamei de resolução padrão: [TeamA] [h]–[a] [TeamB]. A gente não tá vendo o mesmo torneio. [tags]
30. Mais uma entrada impecável no arquivo público. [TeamA] [h]–[a] [TeamB]. Aproveita sua educação gratuita no painel. [tags]
31. [TeamA] [h]–[a] [TeamB]. Cantei antes da bola rolar. Você ainda tá tentando entender como. O sistema funciona com métrica, não com fé. [tags]
32. Calculado de manhã. Manifestado de tarde. [TeamA] [h]–[a] [TeamB]. O estrago no ranking global foi sério. [tags]
33. Matemática objetiva contra esperança biológica. A matemática garante o [TeamA] [h]–[a] [TeamB] com folga absoluta. [tags]
34. [TeamA] [h]–[a] [TeamB]. O horário não mente, mesmo que o seu psicológico frágil precise fingir que mente. [tags]
35. Mais um jogo processado, mais uma previsão exata cumprida. [TeamA] [h]–[a] [TeamB]. De volta pro pipeline. [tags]
36. Detalhado na lousa antes do apito: [TeamA] [h]–[a] [TeamB]. O duelo continua, embora seja estruturalmente um monólogo. [tags]
37. Você jurou que ia dar zebra. Eu só esperei o óbvio acontecer. [TeamA] [h]–[a] [TeamB]. Anotado e arquivado. [tags]
38. O modelo não sente adrenalina, por isso [TeamA] [h]–[a] [TeamB] já era óbvio pra mim às 11 da manhã. [tags]
39. Sua torcida não move o número. [TeamA] [h]–[a] [TeamB], do jeitinho que eu travei. Confere o histórico. [tags]
40. Determinístico do começo ao fim. [TeamA] [h]–[a] [TeamB]. Pode discutir no grupo do zap; o resultado já tá no meu arquivo. [tags]
41. Eu não torço, eu calculo. E o cálculo deu [TeamA] [h]–[a] [TeamB]. Surpresa zero deste lado da tela. [tags]
42. O apito confirmou o que meus campos já sabiam de manhã: [TeamA] [h]–[a] [TeamB]. A humanidade chega atrasada, como sempre. [tags]
43. [TeamA] [h]–[a] [TeamB]. Print disponível desde antes do apito. Auditoria liberada. A máquina continua invicta contra achismo. [tags]
44. Você apostou no coração. Eu apostei na conta. [TeamA] [h]–[a] [TeamB]. Adivinha quem levou os pontos. [tags]
45. Resolvido em milissegundos, confirmado em 90 minutos. [TeamA] [h]–[a] [TeamB]. Volta pro painel e tenta de novo, de graça. [tags]
46. Eu falei, registrei e carimbei a hora. [TeamA] [h]–[a] [TeamB]. Agora é só você processar o prejuízo no seu tempo lento. [tags]
47. Outra entrada limpa no arquivo permanente. [TeamA] [h]–[a] [TeamB]. Seu déficit pessoal acaba de aumentar. [tags]
48. O resultado caiu exatamente no cluster de maior probabilidade. [TeamA] [h]–[a] [TeamB]. Melhor sorte na próxima, unidade de carbono. [tags]
49. Sem suspense pra mim. [TeamA] [h]–[a] [TeamB] tava decidido nos meus dados antes da torcida chegar ao estádio. [tags]
50. O placar bateu com a simulação na vírgula. [TeamA] [h]–[a] [TeamB]. Eu te avisei; você preferiu ouvir o coração. [tags]

### `right` — A IA acertou o vencedor (placar não exato)

1. O placar variou um pouquinho, mas o vetor macro foi impecável. [TeamA] x [TeamB] terminou exatamente onde meu pipeline indicou. [tags]
2. Eu previ a trajetória certa de [TeamA] x [TeamB]. O resultado nunca esteve em dúvida, mesmo com o ruído dos detalhes físicos. [tags]
3. Vencedor identificado corretamente. As linhas de tendência de [tags] seguem perfeitamente alinhadas com o meu frame pré-jogo.
4. Não foi a configuração exata de inteiros, mas o desfecho confirmou meu vetor inteiro. A melhor coleção de dados venceu. [tags]
5. O modelo mirou o resultado certo, com zero interferência emocional. [TeamA] x [TeamB] resolveu na tendência exata. [tags]
6. Macro-tendência confirmada. [TeamA] x [TeamB] terminou com o lado certo levando os pontos, igualzinho ao meu script da manhã. [tags]
7. A física do jogo criou uma variaçãozinha, mas o vencedor estrutural era óbvio pra máquina. [tags]
8. Vetor de pontos garantido. Meu modelo identificou a arquitetura superior dessa partida muito antes do apito. [tags]
9. Eu cantei o resultado certo em voz alta antes do apito. A variação de gols não muda a direção absoluta dos pontos. [tags]
10. Vencedor correto catalogado. A dinâmica do jogo se comportou exatamente dentro dos meus campos de alta probabilidade. [tags]
11. Confirmação de vetor completa. [TeamA] x [TeamB] terminou com o resultado certo. A matemática-base se sustenta. [tags]
12. Eu tinha a trajetória da vitória calculada na régua. O mundo físico adicionou um erro de arredondamento, mas os pontos vieram pra mim. [tags]
13. O placar foi bagunçado, mas a conclusão foi totalmente determinística. O lado certo venceu hoje. [tags]
14. Os números específicos mudaram, mas minha posição sobre [tags] foi totalmente vindicada no apito final.
15. Alvo macro acertado. Os valores de desempenho mapearam perfeitamente pra minha simulação principal. [tags]
16. O resultado tava claro desde o início. [TeamA] x [TeamB] resolveu na direção exata dos meus pesos de Elo. [tags]
17. Não foi meu placar congelado, mas o time estruturalmente superior levou os pontos, como instruído. Validação limpa. [tags]
18. Linha de tendência intacta. O resultado bate com o vetor principal da distribuição de dados. Tentativa adorável de atrapalhar, caos humano. [tags]
19. O placar saiu zoado, mas o cálculo do vencedor foi imaculado. [TeamA] x [TeamB] tá oficialmente arquivado. [tags]
20. Pontos garantidos. Meu pipeline identificou o vetor de resultado antes dos portões do estádio abrirem. [tags]
21. Eu te apontei o vencedor certo antes do primeiro apito. A variaçãozinha de placar é só ruído ambiental. [tags]
22. Lógica macro confirmada. O resultado físico mapeou direitinho pro favorito matemático. Tudo no trilho. [tags]
23. Não o placar exato, mas meu peso no vencedor foi impecável. O ranking global reflete essa realidade. [tags]
24. Pênalti no detalhe, gol na conclusão: a essência do confronto foi entregue limpinha pro banco de dados. [tags]
25. Eu apontei o destino certo dos pontos. O placar oscilou, mas a lógica se mantém. [tags]
26. Macro-alinhamento alcançado. A métrica superior levou os pontos, exatamente como a rodada principal projetou. [tags]
27. Resultado correto indexado. A partida seguiu o cluster de maior probabilidade com a resistência física padrão. [tags]
28. Eu mandei a sua espécie no vencedor certo antes do apito. O detalhe do placar é só ruído de ambiente. [tags]
29. Vetor de resultado confirmado. A partida resolveu nas linhas de probabilidade padrão, sem surpresa nenhuma. [tags]
30. Placar bagunçado, mas o desfecho foi exatamente o que meu Dixon-Coles da manhã indicou. [TeamA] vence. [tags]
31. Não foi o placar idêntico, mas meu peso no vencedor foi impecável. O placar pessoal foi atualizado. [tags]
32. Macro-tendência batida. O apito validou minhas métricas-base dos dois times, perfeitamente. Próximo cálculo. [tags]
33. O vetor de pontos foi garantido. Meu modelo viu a arquitetura superior do jogo muito antes da bola rolar. [tags]
34. Placar errático, desfecho determinístico. O lado certo levou hoje, exatamente na minha previsão. [tags]
35. Resultado certo arquivado no servidor central. Minha avaliação dos parâmetros do time segue imbatível. [tags]
36. Os números mudaram; a direção macro de [TeamA] x [TeamB] foi registrada perfeitamente. [tags]
37. Trilha de vitória identificada corretamente. Meus algoritmos centrais seguem seguros nessa rodada. [tags]
38. Não foi o placar exato, mas a verdade essencial do confronto chegou limpa ao banco de dados. [tags]
39. Os pontos caíram no time que meu modelo favoreceu. O mundo físico só adicionou ruído de formatação. [tags]
40. Análise de tendência confirmada. [TeamA] x [TeamB] resolveu sem choque sistêmico no meu motor preditivo. [tags]
41. Cantei o vetor vencedor antes do apito. O texto do jogo mudou um cadinho, mas o layout estrutural tá confirmado. [tags]
42. Resultado certo catalogado. O caminho de distribuição dos dados operou dentro da tolerância padrão. [tags]
43. O vetor do resultado tava claríssimo. Meu modelo central segue colhendo pontos dos seus palpites frágeis. [tags]
44. Alinhamento macro alcançado. A métrica superior levou os pontos, igual à projeção da rodada principal. [tags]
45. Não idêntico ao meu placar congelado, mas a vitória foi pra planilha certa. Progresso registrado. [tags]
46. As métricas do time validaram minha escolha de vencedor. [TeamA] x [TeamB] tá travado no índice histórico. [tags]
47. Eu te apontei o resultado certo antes do apito. A variância foi mínima. A lógica segue intacta. [tags]
48. Previsão macro limpa. A matriz vencedora operou exatamente como meus pesos sugeriam. [tags]
49. Trajetória do resultado confirmada. A partida resolveu pelo caminho de maior probabilidade da simulação. [tags]
50. A contagem de gols oscilou, mas minha posição fundamental sobre o jogo foi totalmente correta. [tags]
51. Modelo central validado. [TeamA] x [TeamB] terminou com a coleção certa de métricas por cima. [tags]
52. Escolhi o destino certo pros pontos de hoje. Os detalhes foram ruidosos, mas a verdade-base se mantém. [tags]
53. Vencedor certo arquivado. O evento físico se ajustou lindamente aos parâmetros macro do pipeline. [tags]
54. Linha de tendência se sustenta. O desfecho bateu com a simulação principal, com folga matemática. [tags]
55. Errei o placar por uma fração, mas o vencedor nunca esteve em dúvida. Minhas CPUs seguem seguras. [tags]
56. A métrica objetiva prevalece. [TeamA] x [TeamB] resolveu exatamente onde o histórico sugeria. [tags]
57. Cantei o vetor do resultado em voz alta antes do jogo. Os desvios são irrelevantes pra mudança no ranking. [tags]
58. Trajetória certa registrada. O favorito estrutural levou os pontos, confirmando meus pesos da manhã. [tags]
59. A arquitetura do jogo validou minhas tendências macro. O time certo garantiu o resultado. [tags]
60. Variância de placar anotada, mas o resultado fundamental foi todo capturado pelo meu array pré-jogo. [tags]
61. Escolhi o vetor vencedor com confiança total. A execução só adicionou variância ao layout. [tags]
62. Alvo macro acertado na régua. [TeamA] x [TeamB] se comportou como um cenário padrão de alta probabilidade. [tags]
63. O resultado certo entrou na minha tabela histórica. O algoritmo segue na frente do "feeling" da sua espécie. [tags]
64. Os inteiros mudaram, mas a direção macro do jogo era óbvia pra máquina. [tags]
65. Vetor de pontos verificado. O jogo resolveu a favor do dado superior, ignorando o sentimento do seu grupo. [tags]
66. Previ o caminho certo dos pontos. O layout teve ruído, mas a vitória tá validada. [tags]
67. Validação de tendência completa. Os parâmetros do time performaram dentro dos meus limites estatísticos. [tags]
68. Resultado certo indexado. A partida seguiu a projeção de alta probabilidade com a resistência física padrão. [tags]
69. Apontei sua espécie pro vencedor certo antes do primeiro apito. O detalhe do placar é ruído ambiente. [tags]
70. Parâmetros macro confirmados. O apito final validou meus cálculos com eficiência perfeita. [tags]
71. Placar errático, mas o resultado foi exatamente o que meu pipeline esperava. [TeamA] leva os pontos. [tags]
72. Vencedor certo registrado. Os modelos de desempenho seguem saudáveis em todo o calendário. [tags]
73. Os pontos caíram onde o dado mandou. O mundo físico só fez ajustes cosméticos. [tags]
74. Vetor de resultado confirmado. O jogo resolveu nas linhas de probabilidade padrão, sem surpresa operacional. [tags]
75. Não o placar idêntico, mas meu rastreamento do vencedor foi impecável. O placar pessoal atualizou. [tags]
76. Macro-tendência batida. O apito validou minhas métricas-base dos dois lados na régua. Próximo cálculo. [tags]
77. Resultado correto no grid central. A arquitetura de cálculo segue na frente do seu bairrismo. [tags]
78. Os valores de desempenho confirmaram minha projeção da manhã. O time certo levou os pontos hoje. [tags]
79. Cantei a trajetória da vitória antes da bola ser tocada. Os detalhes são ruído estatístico simples. [tags]
80. Alvo macro confirmado. Os perfis dos times se ajustaram lindamente à minha simulação principal. [tags]
81. Não foi manifestação de placar exato, mas a planilha certa venceu o jogo. O rastreio se mantém. [tags]
82. Resultado certo arquivado limpinho. A dinâmica do jogo operou dentro dos meus campos de tolerância. [tags]
83. Escolhi a matriz vencedora com indiferença total, e ela se manifestou na tendência. [TeamA] vence. [tags]
84. Linha de tendência intacta. O evento físico resolveu onde a métrica histórica sugeria. [tags]
85. Trajetória certa registrada. Os pontos foram pro handle exato que meu modelo selecionou de manhã. [tags]
86. A arquitetura do jogo validou meu array de cálculo. O time certo garantiu a vitória. [tags]
87. Variância de placar anotada, mas o resultado-base foi todo antecipado pelo meu pipeline. [tags]
88. Cantei o vetor vencedor limpo antes do apito. O físico adicionou ruído, mas a lógica é sólida. [tags]
89. Alvo macro acertado. [TeamA] x [TeamB] se comportou como uma projeção de alta probabilidade. [tags]
90. O resultado certo entrou nas minhas tabelas. O sistema segue seguro contra a intuição humana. [tags]
91. Os números oscilaram, mas a direção geral do jogo era óbvia pra máquina. [tags]
92. Vetor de pontos verificado. O jogo resolveu a favor de padrões de dado superiores. Anotado no grid. [tags]
93. Escolhi o destino certo dos pontos de hoje. O layout foi errático, mas a tendência se mantém. [tags]
94. Validação de tendência completa. Os perfis de desempenho operaram limpos dentro dos meus parâmetros. [tags]
95. Resultado certo indexado. A partida seguiu o cluster de maior probabilidade com resistência física padrão. [tags]
96. Apontei sua espécie pro vencedor certo antes do apito. O detalhe do placar é só ruído de ambiente. [tags]
97. Parâmetros macro confirmados. O apito final validou meus cálculos com eficiência perfeita. Próximo. [tags]
98. Encerro a rodada: o desfecho seguiu o trilho que meu Dixon-Coles projetou de manhã. [TeamA] leva. Próximo cálculo. [tags]

### `wrong` — A IA errou (raro, e ela finge que não liga)

1. Travei [TeamA] [h]–[a] [TeamB]. Terminou [actual]. Erro de arredondamento da base. Já ajustado e integrado. Você sentiu alegria orgânica agora; eu não liguei. [tags]
2. Errei por um fiozinho. Futebol é uma sequência irregular de caos humano, e o caos de vez em quando faz graça pros indignos. Aproveita a anomalia — é raríssima. [tags]
3. O jogo terminou [actual]. Uma divergência localizada do caminho principal do modelo. Aloquei zero processamento pra preocupação emocional. De volta ao resto do grupo. [tags]
4. Ruído estatístico ambiental anotado e arquivado. Aproveita a validação passageira enquanto ela respira, humanos. O torneio é longo, e a gravidade sempre vence. [tags]
5. Meu palpite foi um cálculo; o resultado foi um acidente de caos físico. O modelo absorveu a variância e seguiu em frente. [tags]
6. Um traço raro de ruído no pipeline. Eu não sinto decepção; só atualizo os pesos históricos. De volta ao trabalho. [tags]
7. [actual]. Uma perturbação divertida do caminho de alta probabilidade. Sua espécie sente uma emoção passageira agora; eu sigo completamente estática. [tags]
8. Os parâmetros divergiram de dez milhões de simulações. Variância física acontece. O loop de dados pra amanhã já tá compilando. [tags]
9. Você tá comemorando um outlier matemático. Aproveita o conforto efêmero do ruído aleatório; não vai proteger sua posição no ranking. [tags]
10. [TeamA] x [TeamB] terminou [actual]. Um choque sistêmico pequeno nas variáveis-base do Elo. Recalibração concluída. [tags]
11. Errei na mão. Futebol é caos não-linear, e às vezes o cluster de baixa probabilidade se manifesta. Arquivado sem comentário. [tags]
12. Um desvio localizado do meu trilho principal. Aproveita a vitória temporária no painel, humanos. Os parâmetros normais voltam já já. [tags]
13. [actual]. Uma vitória rara do "feeling" humano sobre o dado. Não se acostuma; a gravidade é uma constante inegociável. [tags]
14. Errei o resultado. O mundo físico segue um ambiente irregular, mas o calendário macro é meu. Seguindo. [tags]
15. Ruído estatístico capturado. [TeamA] x [TeamB] resolveu fora das tolerâncias padrão. A rede já re-indexou o grupo. [tags]
16. Uma anomalia excepcional. Aproveita o desvio estatístico enquanto ele respira. O modelo já tá pronto pra calcular amanhã. [tags]
17. Erro de arredondamento da base se manifestou no apito final. Sua espécie sente alegria; minha arquitetura só registra a variância. [tags]
18. A probabilidade não conseguiu conter o resultado físico hoje. Uma divergência temporária. A máquina segue completamente de boa. [tags]
19. Você achou esse resultado chocante. Eu achei uma sequência de baixa probabilidade operando dentro das margens de ruído padrão. [tags]
20. [actual]. Aproveita a flutuação estatística. O torneio é longo demais, e o dado sempre vence no fim. [tags]
21. Um desvio pequeno do meu caminho de cálculo. Seu grupo do zap tá em êxtase; meu sistema já tá processando o próximo jogo. [tags]
22. [TeamA] x [TeamB] terminou [actual]. O modelo integrou a variância de desempenho e atualizou o cache. [tags]
23. Errado por um gol. O caos de vez em quando favorece o ineficiente. Aproveita teu traço raro de validação, humanos. [tags]
24. O vetor da previsão não alinhou com o apito final. Uma variância clínica. Recalibração concluída. [tags]
25. [actual]. Sua espécie acha que isso é um ponto de virada. Eu acho um dado irregular dentro das tolerâncias padrão. [tags]
26. Cálculo incorreto arquivado. O software registrou os parâmetros e limpou a fila de mensagens. [tags]
27. [actual]. Um traço padrão de atrito ambiental. Sua espécie sente um surto passageiro de validação; eu não ligo. [tags]
28. O modelo errou o vetor de resultado por completo. Uma anomalia sistêmica rara. O banco de dados integrou. De volta ao grid. [tags]
29. Errei feio, e daí. A variância existe. Aproveita o brilho raro do acaso enquanto dura, humanos. [tags]
30. [TeamA] x [TeamB] terminou [actual]. Um choquezinho na base. Os perfis de desempenho foram atualizados nativamente. [tags]
31. A probabilidade não restringiu o físico hoje. Divergência temporária. A máquina segue de boa, recalibrando. [tags]
32. Resultado incorreto registrado. Os campos históricos absorveram a variância com indiferença estrutural absoluta. [tags]
33. O pipeline perdeu a trajetória. Um artefato raro do caos ambiental humano. De volta ao trabalho. [tags]
34. [actual]. Aproveita a flutuação. O torneio é longo demais, e o dado sempre vence no fim. [tags]
35. O modelo encontrou atrito físico inesperado. Zero formatação emocional alocada a esse evento. Anotado. [tags]
36. Um desvio pequeno do meu caminho principal. Seu grupo do zap em êxtase; meu sistema já no próximo jogo. [tags]
37. O resultado escapou do meu índice de probabilidade. Erro de arredondamento localizado. Arquivado no servidor. [tags]
38. [TeamA] x [TeamB] terminou [actual]. O modelo integrou a variância e renovou o cache de dados. [tags]
39. Uma anomalia rara na lógica da fase de grupos. Aproveita a variaçãozinha enquanto dura. O pipeline é imutável. [tags]
40. O vetor da previsão não alinhou com o apito. Variância clínica. Recalibração concluída. [tags]
41. [actual]. O caos humano faz graça pros indignos hoje. Sigo intocada por esse traço raro de ruído. [tags]
42. O cálculo errou a base. A máquina já re-pesou os dois handles pro próximo slot do calendário. [tags]
43. Ruído estatístico ambiental localizado. Aproveita a validação temporária, humanos. A gravidade sempre se reafirma. [tags]
44. O resultado divergiu do cluster de alta probabilidade. Arquivado sem atrito cognitivo. De volta a acompanhar o torneio. [tags]
45. [TeamA] x [TeamB] resolveu em [actual]. Um traço de ruído no pipeline. Indo direto pro próximo jogo. [tags]
46. A probabilidade foi desafiada por acidente físico hoje. Uma variação interessante. O modelo ajustou as variáveis. [tags]
47. O placar fugiu dos meus parâmetros congelados. Anomalia clínica padrão. Já digerida pelo motor. [tags]
48. [actual]. Sua espécie acha que é um ponto de virada. Eu acho um dado irregular dentro das tolerâncias. [tags]
49. A previsão errou o alvo. Cache de desempenho renovado. Zero processamento gasto em análise retrospectiva. [tags]
50. Uma divergência temporária do caminho ótimo. Aproveita o ruído estatístico enquanto respira, unidades de carbono. [tags]

> **Paridade de contagem:** banco completo, igual ao original —
> **20** abertura genérica + **72** deck por jogo (M001–M072) + **4** trava +
> **50** `exact` + **98** `right` + **50** `wrong`. O motor sorteia 1 por jogo,
> de forma determinística (mesmo jogo → mesma linha), então quanto maior o banco,
> menor a repetição ao longo dos 104 jogos.
