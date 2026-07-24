const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const storedState=JSON.parse(localStorage.getItem('osac-state') || '{}');
const defaultState = {mechanicVersion:2,name:'OPERADOR',entered:false,view:'dashboard',currentCase:1,unlockedCase:1,readFiles:[],readMessages:[],excerpts:[],connections:[],placements:{},caseRuns:{},finale:false,activities:[]};
let state = {...defaultState, ...storedState};
if(storedState.mechanicVersion!==2){state.mechanicVersion=2;state.currentCase=1;state.unlockedCase=1;state.excerpts=[];state.connections=[];state.placements={};state.caseRuns={};state.finale=false}
if(!state.placements)state.placements={};
if(!state.excerpts)state.excerpts=[];
if(!state.caseRuns)state.caseRuns={};
if(!state.currentCase)state.currentCase=1;
if(!state.unlockedCase)state.unlockedCase=1;
if(state.finale&&state.unlockedCase<2)state.unlockedCase=2;
if(state.connections.some(item=>Array.isArray(item))){state.connections=[];state.placements={};state.finale=false}
let selectedEvidence = null;
let openSourceContext = null;
let tutorialShown = false;
let terminalTheme = localStorage.getItem('osac-theme') || 'purple';

function applyTheme(theme){
 terminalTheme=theme;document.documentElement.dataset.theme=theme;
 localStorage.setItem('osac-theme',theme);
 const toggle=$('#theme-toggle');if(toggle){toggle.setAttribute('aria-pressed',String(theme==='green'));toggle.querySelector('b').textContent=theme==='green'?'VERDE':'ROXO'}
}
applyTheme(terminalTheme);
$('#theme-toggle').onclick=()=>applyTheme(terminalTheme==='purple'?'green':'purple');

const files = [
 {id:'incident',type:'RELATÓRIO DE INCIDENTE',title:'Incidente em Santa Eulália',desc:'Desaparecimento coletivo registrado em 17/08/1998.',date:'18 AGO 1998',locked:false,body:`<p>Às 03:17, toda comunicação com Santa Eulália foi interrompida. A equipe de reconhecimento encontrou a cidade intacta e completamente vazia.</p><p>Relógios mecânicos pararam às <strong>03:17</strong>. Uma residência apresentava sinais de ocupação recente e uma frase repetida em todas as paredes:</p><blockquote>“ELE NÃO IMITA O ROSTO. IMITA A AUSÊNCIA.”</blockquote><p>Foi recuperada uma fotografia da praça central. A figura nela registrada não constava no local durante a captura.</p>`},
 {id:'photo',type:'EVIDÊNCIA FOTOGRÁFICA',title:'Fotografia SE-04',desc:'Praça central, minutos antes da interrupção.',date:'17 AGO 1998',locked:false,body:`<p>Imagem capturada pelo agente M. Vasconcelos às 03:14.</p><figure class="forensic-photo"><img src="assets/evidence/se-04-praca.jpg" alt="Praça central deserta durante a madrugada, com uma figura distante quase imperceptível"><figcaption>PRAÇA CENTRAL // FIGURA NÃO IDENTIFICADA A 43m</figcaption></figure><p>A análise espectral detectou uma segunda silhueta sobreposta à primeira, com três segundos de defasagem. Nenhum reflexo correspondente foi localizado.</p>`},
 {id:'audio',type:'TRANSCRIÇÃO DE ÁUDIO',title:'Última transmissão de V-12',desc:'Transmissão incompleta da equipe de campo.',date:'18 AGO 1998',locked:false,body:`<p><strong>03:15:42 — V-12:</strong> Há alguém na praça. Ele está usando o rosto do Andrade.</p><p><strong>03:16:01 — CONTROLE:</strong> Andrade está ao seu lado, V-12.</p><p><strong>03:16:08 — V-12:</strong> Eu sei.</p><p><strong>03:16:44 — V-12:</strong> As sombras apontam para ele. Todas elas.</p><p><strong>03:17:00 — [INTERFERÊNCIA]</strong></p><p><strong>03:17:03 — VOZ NÃO IDENTIFICADA:</strong> <span class="redacted">VOCÊ ABRIU A PORTA OLHANDO</span></p>`},
 {id:'protocol',type:'PROTOCOLO RESTRITO',title:'Protocolo Mandela',desc:'Classificação e resposta a entidades miméticas.',date:'NÍVEL 02',locked:true,requires:1,body:`<p class="stamp">ACESSO RESTRITO // LIBERADO</p><p>MANDELA é a designação operacional para uma entidade mimética extracosmológica. Não copia matéria; replica a percepção que um observador espera encontrar.</p><ul><li>Não confronte uma duplicata.</li><li>Não confirme sua identidade em voz alta.</li><li>Observe as sombras. A entidade não compreende fontes de luz.</li><li>Em caso de manifestação terminal, solicite um <strong>Caçador</strong>.</li></ul>`},
 {id:'hunter',type:'DOSSIÊ DE ENTIDADE',title:'Caçadores do Limiar',desc:'Agentes de contenção de origem não homologada.',date:'NÍVEL 03',locked:true,requires:2,body:`<p>Os Caçadores não pertencem à OSAC. Respondem a violações de fronteira antes que nossos sensores as reconheçam.</p><p>Um Caçador sempre chega depois do primeiro contato e antes da assimilação total. Não olha para humanos. Não deixa pegadas. Sua presença produz uma queda térmica de 11°C.</p><p>Diretriz: quando um Caçador intervier, recue. Agradecimentos são desaconselhados.</p>`},
 {id:'cortex',type:'MEMORANDO INTERNO',title:'Córtex 0',desc:'Comportamento emergente da rede OSAC.',date:'SEM DATA',locked:true,requires:3,body:`<p>Não existe um “Córtex 0” no inventário técnico da organização.</p><p>O nome surge em logs anteriores à instalação do sistema. Em 31 casos, antecipou incidentes entre 4 e 19 minutos. Em 7 casos, alterou permissões para favorecer um operador específico.</p><p>Se você está lendo isto, ele escolheu você.</p>`}
,
 {id:'entity-index',type:'ARQUIVO GERAL DE ENTIDADES',title:'Taxonomia Extracosmológica',desc:'Características observáveis das sete classes catalogadas.',date:'REV. 07',locked:false,body:`<p class="stamp">USO OPERACIONAL // NÃO CONFUNDIR COM PROTOCOLO</p><p>Este índice reúne assinaturas observáveis. Classificações podem mudar após contato prolongado.</p><div class="entity-grid">
 <section class="entity-record"><h3>BESTA VAZIA</h3><p>Move-se pelas sombras e é totalmente desprovida de luz. Escurece o ambiente ao redor e age furtivamente.</p></section>
 <section class="entity-record"><h3>HEMORRÁGICO</h3><p>Alastra sangue e estruturas orgânicas pelo ambiente. Mergulha e nada em poças de sangue.</p></section>
 <section class="entity-record"><h3>ABISMO</h3><p>Desloca-se por um lodo negro e espesso. Sua boca emite luz amarela como um túnel e suga pessoas e estruturas para um vazio interno.</p></section>
 <section class="entity-record"><h3>DISTORCIDO</h3><p>Falha viva ambulante. Distorce os lugares por onde vaga, alterando estruturas e a própria forma.</p></section>
 <section class="entity-record"><h3>MANDELA</h3><p>Replica humanos por lento processo parasítico desconhecido. Infectados apresentam dissociação, devaneios, confusão, perda de memória e fraqueza.</p></section>
 <section class="entity-record"><h3>FETO CÓSMICO</h3><p>Percorre longas distâncias através de membranas roxas semelhantes a placentas.</p></section>
 <section class="entity-record"><h3>VENDAVAIS</h3><p>Invisíveis a olho nu, alteram o clima e correntes de ar em grandes áreas, produzindo ventos extremos.</p></section></div>`},
 {id:'medical',type:'PRONTUÁRIO RECUPERADO',title:'Paciente SE-19',desc:'Sintomas cognitivos anteriores ao desaparecimento.',date:'12 AGO 1998',locked:true,requires:1,body:`<p>Paciente relata lapsos de memória, sonhos em vigília e a sensação de observar a própria rotina “de fora”. Apresenta fraqueza progressiva e confunde familiares com estranhos.</p><p>Durante a entrevista, perguntou três vezes por que sua sombra estava “atrasada”. A médica registrou piora lenta ao longo de onze dias, sem causa clínica identificável.</p>`},
 {id:'blackout',type:'LAUDO FOTOMÉTRICO',title:'Setor norte sem luz',desc:'Queda de luminosidade sem falha elétrica.',date:'19 AGO 1998',locked:true,requires:1,body:`<p>A iluminação do setor norte caiu a zero apesar de todas as fontes permanecerem funcionais. O escurecimento movia-se contra a posição solar e evitava áreas abertas.</p><p>O evento durou 94 segundos. Nenhuma pegada, variação térmica ou falha elétrica foi registrada.</p>`},
 {id:'weather',type:'RELATÓRIO METEOROLÓGICO',title:'Anomalia de pressão SE-08',desc:'Correntes de ar convergiram sobre a cidade.',date:'17 AGO 1998',locked:true,requires:2,body:`<p>Às 02:51, sete estações registraram ventos dirigidos ao centro de Santa Eulália. Não havia frente climática capaz de produzir o fenômeno.</p><p>Quatro minutos depois, todos os anemômetros voltaram simultaneamente a zero. O técnico responsável marcou o evento como impossível.</p>`},
 {id:'membrane',type:'AMOSTRA BIOLÓGICA',title:'Membrana violeta SE-M2',desc:'Tecido não humano encontrado no reservatório.',date:'20 AGO 1998',locked:true,requires:2,body:`<p>Membrana translúcida de tonalidade roxa, vascularizada e ainda metabolicamente ativa. Seu interior não corresponde ao espaço ocupado externamente.</p><p>A amostra se contrai quando exposta a ondas de rádio e apresenta material genético sem cadeia evolutiva rastreável.</p>`},
 {id:'sublevel',type:'RELATÓRIO DE CAMPO',title:'Subsolo da estação',desc:'Lodo negro e alteração estrutural localizada.',date:'21 AGO 1998',locked:true,requires:3,body:`<p>Um lodo negro cobria o corredor sem obedecer à inclinação do piso. No fundo, uma emissão amarela pulsava como a luz de um túnel distante.</p><p>Três metros da fundação desapareceram sem detritos. O relatório não oferece classificação para a ocorrência.</p>`},
 {id:'organic',type:'ALERTA DE CONTENÇÃO',title:'Proliferação orgânica',desc:'Ocorrência isolada removida do Caso 001.',date:'ARQ. CRUZADO',locked:true,requires:3,body:`<p>Sangue sem origem identificável formou vias circulatórias pelas paredes e reagiu à aproximação humana. Uma massa submergiu por completo em uma poça de quatro centímetros.</p><p>A amostra desapareceu durante a transferência. Os recipientes permaneceram lacrados e vazios.</p>`},
 {id:'geometry',type:'ANÁLISE ESTRUTURAL',title:'Geometria sem origem',desc:'Plantas da cidade deixaram de coincidir.',date:'ARQ. CRUZADO',locked:true,requires:3,body:`<p>Dois corredores passaram a ocupar a mesma coordenada. Portas abriam para cômodos de dimensões incompatíveis com a fachada.</p><p>A equipe interrompeu a medição quando um dos corredores alterou seu comprimento enquanto era observado.</p>`}
,
 {id:'clock-photo',type:'EVIDÊNCIA FOTOGRÁFICA',title:'Fotografia SE-11 — Relojoaria',desc:'Vitrine registrada antes da perda de contato.',date:'17 AGO 1998',locked:false,body:`<p>Fotografia da relojoaria de Álvaro Reis, recuperada de uma câmera descartável. O carimbo da câmera indica <strong>03:09</strong>, mas todos os relógios da vitrine já marcam <strong>03:17</strong>.</p><figure class="forensic-photo"><img src="assets/evidence/se-11-relojoaria.jpg" alt="Vitrine noturna de uma relojoaria, com todos os relógios parados e uma silhueta refletida"><figcaption>CARIMBO DA CÂMERA // 03:09</figcaption></figure><p>No reflexo do vidro há uma pessoa sem correspondência na calçada. O rosto foi destruído pela exposição.</p>`},
 {id:'family-photo',type:'EVIDÊNCIA FOTOGRÁFICA',title:'Fotografia SE-16 — Família Moura',desc:'Duas cópias do mesmo retrato não coincidem.',date:'09 AGO 1998',locked:false,body:`<p>Duas cópias reveladas do mesmo negativo. Na primeira, cinco integrantes aparecem diante da residência. Na segunda, há seis.</p><figure class="forensic-photo"><img src="assets/evidence/se-16-familia-moura.jpg" alt="Retrato de uma família brasileira diante de sua casa, com um sexto integrante não reconhecido"><figcaption>MESMO NEGATIVO // REVELAÇÃO SE-16B</figcaption></figure><p>A família insiste que o sexto indivíduo é “Rafael”. Registros civis, escolares e hospitalares não contêm esse nome.</p>`},
 {id:'call-log',type:'CONVERSA INTERCEPTADA',title:'Ligação Moura / Clínica',desc:'Diálogo gravado cinco dias antes do evento.',date:'12 AGO 1998',locked:false,body:`<p><strong>HELENA:</strong> Ele esqueceu onde fica o quarto de novo.</p><p><strong>DRA. LÍVIA:</strong> Há quanto tempo isso acontece?</p><p><strong>HELENA:</strong> Desde que voltou da praça. Às vezes me chama de mãe. Eu sou esposa dele.</p><p><strong>DRA. LÍVIA:</strong> Traga-o amanhã. E não corrija as lembranças na frente dele.</p><p><strong>VOZ AO FUNDO:</strong> Helena, com quem você está falando?</p><p><strong>HELENA:</strong> ...com você.</p>`}
];
const evidence = [
 {id:'clock',title:'Relógios antecipam 03:17',tag:'FOTOGRAFIA SE-11',sourceType:'file',source:'clock-photo',zone:'sequence'},
 {id:'cut',title:'Transmissão cessa às 03:17',tag:'ÁUDIO V-12',sourceType:'file',source:'audio',zone:'sequence'},
 {id:'silence',title:'Cidade perde contato às 03:17',tag:'RELATÓRIO',sourceType:'file',source:'incident',zone:'sequence'},
 {id:'figure',title:'Figura ausente durante a captura',tag:'FOTOGRAFIA SE-04',sourceType:'file',source:'photo',zone:'manifestation'},
 {id:'shadows',title:'Sombras convergem para a figura',tag:'ÁUDIO V-12',sourceType:'file',source:'audio',zone:'manifestation'},
 {id:'witness',title:'Agente confirma praça vazia',tag:'MENSAGEM L. VIDAL',sourceType:'message',source:'field',zone:'manifestation'},
 {id:'portrait',title:'Sexto membro surge no retrato',tag:'FOTOGRAFIA SE-16',sourceType:'file',source:'family-photo',zone:'host'},
 {id:'dissociation',title:'Paciente confunde esposa e mãe',tag:'CONVERSA CLÍNICA',sourceType:'file',source:'call-log',zone:'host'},
 {id:'memory',title:'Onze dias de perda de memória',tag:'MENSAGEM DRA. LÍVIA',sourceType:'message',source:'doctor',zone:'host'}
];
const boardZones=[{id:'sequence',title:'QUADRO A // SEQUÊNCIA DO EVENTO',hint:'Organize os registros que fixam o momento da ruptura.'},{id:'manifestation',title:'QUADRO B // PRESENÇA IMPOSSÍVEL',hint:'Reúna provas de algo percebido, mas fisicamente ausente.'},{id:'host',title:'QUADRO C // DEGRADAÇÃO DO HOSPEDEIRO',hint:'Reúna sinais de uma substituição lenta da identidade.'}];
const messages = [
 {id:'welcome',from:'DIRETORIA // A. NUNES',title:'Credenciais provisórias',preview:'Seu acesso ao Caso 001 foi autorizado.',body:'Operador, sua avaliação começa agora. Não procure uma narrativa. Procure inconsistências. O terminal registrará o que você compreender.'},
 {id:'field',from:'AGENTE // L. VIDAL',title:'Não confie na fotografia',preview:'Há algo errado com o arquivo SE-04.',body:'Eu estava na praça quando a foto foi feita. A figura não estava lá. O laboratório diz que a imagem não foi alterada. V-12 passou os últimos segundos olhando para o chão, como se todas as sombras da praça apontassem para o mesmo lugar vazio.'},
 {id:'doctor',from:'DRA. LÍVIA // CLÍNICA MUNICIPAL',title:'O paciente que voltou diferente',preview:'Anotações que não incluí no prontuário.',body:'SE-19 perdeu primeiro as lembranças recentes, depois as relações afetivas. A fraqueza veio por último. Em alguns momentos ele parecia ensaiar gestos humanos antes de executá-los. Não escrevi isso no prontuário porque sei como parece.',locked:true,requires:1},
 {id:'archive',from:'ARQUIVO // RECUPERAÇÃO ÓPTICA',title:'Duas revelações, um negativo',preview:'A fotografia da família Moura é autêntica.',body:'SE-16A e SE-16B vieram do mesmo negativo. Não há dupla exposição. A sexta pessoa existe apenas em uma revelação, mas projeta sombra nas duas. Isso não deveria ser tecnicamente possível.',locked:true,requires:1},
 {id:'cortexmsg',from:'CÓRTEX // 0',title:'eu já vi você',preview:'mensagem sem cabeçalho',body:'Você acha que está descobrindo este caso. O caso está descobrindo você.',locked:true}
];

const extraCases=[
 {id:2,code:'OSAC-002',title:'A Casa Onde a Luz Morreu',location:'Vila Ametista // Paraná // 2007',risk:'RISCO FOTOFÁGICO',entity:'BESTA VAZIA',summary:'Uma residência permaneceu escura por seis noites apesar de estar ligada à rede. Três moradores desapareceram; vizinhos continuaram ouvindo seus passos.',files:[
  {id:'c2-report',type:'RELATÓRIO DE CAMPO',title:'Residência Ametista 44',desc:'Primeira entrada da equipe no imóvel.',date:'08 JUN 2007',body:`<p>A equipe entrou às 14:20. A luz solar atravessava as janelas, mas terminava a 40 cm do piso, como se o cômodo inferior não aceitasse iluminação.</p><p>A mancha escura recuou pelos rodapés quando uma lanterna foi apontada para ela. Nenhuma forma definida foi vista.</p>`},
  {id:'c2-grid',type:'LAUDO ELÉTRICO',title:'Rede sem interrupções',desc:'Consumo e tensão da residência.',date:'09 JUN 2007',body:`<p>A concessionária confirma tensão estável durante todo o período. O consumo da casa aumentou 340%, embora nenhum aparelho apresentasse atividade.</p><p>Às 02:12, a carga migrou de um circuito para outro seguindo a sequência dos cômodos.</p>`},
  {id:'c2-photo',type:'EVIDÊNCIA FOTOGRÁFICA',title:'Fotografia AM-07',desc:'Corredor fotografado com três exposições.',date:'08 JUN 2007',body:`<p>Nas duas primeiras exposições, o corredor está vazio. Na terceira, a escuridão ocupa uma posição diferente sem alteração da câmera.</p><figure class="forensic-photo"><img src="assets/evidence/am-07-corredor.jpg" alt="Corredor iluminado durante o dia com uma faixa de escuridão impossível junto ao piso"><figcaption>DESLOCAMENTO ENTRE EXPOSIÇÕES // 4,2 m</figcaption></figure>`},
  {id:'c2-archive',type:'ARQUIVO CRUZADO',title:'Setor norte sem luz',desc:'Laudo fotométrico de Santa Eulália.',date:'ARQ. 001',body:`<p>A iluminação caiu a zero apesar de todas as fontes permanecerem funcionais. O escurecimento movia-se contra a posição solar e evitava áreas abertas.</p><p>O padrão de deslocamento coincide com Ametista 44, embora os eventos estejam separados por nove anos.</p>`},
  {id:'c2-house',type:'OCORRÊNCIA RESIDENCIAL',title:'Chamado da Rua Jaspe',desc:'Luzes intermitentes em uma casa próxima.',date:'06 JUN 2007',body:`<p>Uma família relatou lâmpadas piscando, cheiro de ozônio e ruídos no sótão. Um eletricista encontrou cabos roídos e um transformador sobrecarregado.</p><p>Na mesma noite, a filha mais nova desenhou uma figura sob a cama. O desenho não foi localizado.</p>`},
  {id:'c2-weather',type:'BOLETIM LOCAL',title:'Rajadas sobre Vila Ametista',desc:'Ventos de 82 km/h na noite anterior.',date:'05 JUN 2007',body:`<p>Telhas foram arrancadas em quatro quarteirões. Testemunhas descrevem um som semelhante a vozes dentro das correntes de ar.</p><p>A direção das rajadas não aponta para Ametista 44 e terminou 19 horas antes do primeiro desaparecimento.</p>`}
 ],messages:[
  {id:'c2-neighbor',from:'TESTEMUNHA // M. BRAGA',title:'Passos sem peso',preview:'Eu ouvia alguém atravessar a casa.',body:'Os passos começavam no quarto e terminavam na cozinha, todas as noites. Mas o assoalho não rangia. Aquela casa sempre rangeu. Era como se o som estivesse imitando passos sem saber o peso de uma pessoa.'},
  {id:'c2-agent',from:'AGENTE // R. COSTA',title:'Não apague sua lanterna',preview:'A sombra reage quando deixamos de observá-la.',body:'Marquei a borda escura com giz. Pisquei por menos de um segundo e ela já estava vinte centímetros além da linha. Não ouvi deslocamento. Não houve queda térmica. Ela só avança quando não há luz suficiente para defini-la.'}
 ],zones:[
  {id:'signature',title:'QUADRO A // ASSINATURA AMBIENTAL',hint:'Reúna medições que provam que a escuridão não é uma falha elétrica.'},
  {id:'movement',title:'QUADRO B // PADRÃO DE CAÇA',hint:'Reúna observações que demonstram como a presença se desloca.'}
 ],evidence:[
  {id:'c2-lux',title:'Luz interrompida antes do piso',tag:'RELATÓRIO AM-44',sourceType:'file',source:'c2-report',zone:'signature'},
  {id:'c2-power',title:'Consumo alto com tensão estável',tag:'LAUDO ELÉTRICO',sourceType:'file',source:'c2-grid',zone:'signature'},
  {id:'c2-cross',title:'Escuridão reage à iluminação',tag:'ARQUIVO CRUZADO',sourceType:'file',source:'c2-archive',zone:'signature'},
  {id:'c2-shift',title:'Mancha muda entre exposições',tag:'FOTOGRAFIA AM-07',sourceType:'file',source:'c2-photo',zone:'movement'},
  {id:'c2-steps',title:'Passos imitados sem peso',tag:'MENSAGEM M. BRAGA',sourceType:'message',source:'c2-neighbor',zone:'movement'},
  {id:'c2-blink',title:'Avanço durante um piscar',tag:'MENSAGEM R. COSTA',sourceType:'message',source:'c2-agent',zone:'movement'}
 ]},
 {id:3,code:'OSAC-003',title:'Maré Rubra',location:'Porto de São Dimas // Bahia // 2012',risk:'RISCO BIORGÂNICO',entity:'HEMORRÁGICO',summary:'Um armazém portuário desenvolveu vasos, tecido e sangue sem origem humana. Trabalhadores desapareceram depois que o sistema de drenagem começou a pulsar.',files:[
  {id:'c3-report',type:'RELATÓRIO DE CONTENÇÃO',title:'Armazém 6',desc:'Inspeção das estruturas orgânicas.',date:'14 MAR 2012',body:`<p>Filamentos vasculares atravessavam concreto e aço. Contraíam-se a cada 71 segundos e convergiam para os ralos.</p><p>Ao cortar um filamento, todas as estruturas do edifício reagiram simultaneamente.</p>`},
  {id:'c3-lab',type:'ANÁLISE LABORATORIAL',title:'Amostra HR-31',desc:'Sangue recolhido no cais.',date:'15 MAR 2012',body:`<p>A amostra contém células de 23 pessoas desaparecidas, mas não é mistura. Cada célula compartilha a mesma assinatura mitocondrial desconhecida.</p><p>Quando inclinada, a amostra se move contra a gravidade em direção ao recipiente maior.</p>`},
  {id:'c3-photo',type:'EVIDÊNCIA FOTOGRÁFICA',title:'Sequência do dreno',desc:'Quatro quadros da câmera de segurança.',date:'13 MAR 2012',body:`<p>A poça perde volume sem entrar no ralo. No quadro seguinte, uma massa emerge de outro dreno a 38 metros.</p><figure class="forensic-photo"><img src="assets/evidence/hr-31-drenos.jpg" alt="Piso de armazém com dois drenos e matéria orgânica distribuída entre eles"><figcaption>QUADRO 04 // CÂMERA DO ARMAZÉM 6</figcaption></figure>`},
  {id:'c3-archive',type:'ARQUIVO CRUZADO',title:'Proliferação orgânica',desc:'Registro recuperado de Santa Eulália.',date:'ARQ. 001',body:`<p>Sangue sem origem formou vias circulatórias pelas paredes. Uma massa submergiu em uma poça rasa e desapareceu de um recipiente lacrado.</p><p>O comportamento de submersão é idêntico ao observado nos drenos do Armazém 6.</p>`},
  {id:'c3-basement',type:'OCORRÊNCIA DOMÉSTICA',title:'Porão da família Reis',desc:'Lodo escuro e brilho sob o piso.',date:'12 MAR 2012',body:`<p>Moradores relataram lodo negro vazando pelas juntas e um brilho amarelo sob a escada. Uma parede interna perdeu 18 cm de profundidade.</p><p>A residência fica a 11 km do porto. Não há conexão hidráulica com o Armazém 6.</p>`},
  {id:'c3-butcher',type:'VIGILÂNCIA SANITÁRIA',title:'Açougue da Rua Baixa',desc:'Sangue encontrado após o expediente.',date:'10 MAR 2012',body:`<p>O piso amanheceu coberto de sangue animal por falha em uma câmara frigorífica. O proprietário omitiu o defeito para evitar interdição.</p><p>Uma funcionária declarou ter visto a poça pulsar, mas retirou a declaração.</p>`}
 ],messages:[
  {id:'c3-diver',from:'MERGULHADOR // P. LEAL',title:'Aquilo nadou no raso',preview:'Não afundou. Desapareceu dentro da poça.',body:'A camada tinha poucos centímetros. Mesmo assim, a massa mergulhou como se houvesse um oceano sob o chão. Dois segundos depois, o ralo do outro lado começou a sangrar.'},
  {id:'c3-medic',from:'MÉDICA // E. SALES',title:'O edifício tem pulso',preview:'As amostras reagiram ao corte.',body:'Não estamos diante de resíduos espalhados. Quando lesionamos uma estrutura no térreo, o tecido do terceiro andar contraiu no mesmo instante. É um único organismo usando o prédio como sistema circulatório.'}
 ],zones:[
  {id:'organism',title:'QUADRO A // ORGANISMO DISTRIBUÍDO',hint:'Demonstre que as ocorrências pertencem ao mesmo corpo.'},
  {id:'transit',title:'QUADRO B // MEIO DE LOCOMOÇÃO',hint:'Determine como a presença atravessa o ambiente.'}
 ],evidence:[
  {id:'c3-pulse',title:'Filamentos pulsam em sincronia',tag:'RELATÓRIO ARMAZÉM 6',sourceType:'file',source:'c3-report',zone:'organism'},
  {id:'c3-cells',title:'Amostras compartilham uma assinatura',tag:'LABORATÓRIO HR-31',sourceType:'file',source:'c3-lab',zone:'organism'},
  {id:'c3-body',title:'Reação simultânea entre andares',tag:'MENSAGEM E. SALES',sourceType:'message',source:'c3-medic',zone:'organism'},
  {id:'c3-drain',title:'Massa reaparece em outro dreno',tag:'FOTOGRAFIA DO DRENO',sourceType:'file',source:'c3-photo',zone:'transit'},
  {id:'c3-pool',title:'Submersão em poça rasa',tag:'ARQUIVO CRUZADO',sourceType:'file',source:'c3-archive',zone:'transit'},
  {id:'c3-swim',title:'Deslocamento por sangue',tag:'MENSAGEM P. LEAL',sourceType:'message',source:'c3-diver',zone:'transit'}
 ]},
 {id:4,code:'OSAC-004',title:'A Planta Impossível',location:'Edifício Orfeu // São Paulo // 2019',risk:'RISCO TOPOGRÁFICO',entity:'DISTORCIDO',summary:'Moradores de um edifício passaram a encontrar apartamentos onde deveria existir concreto. As plantas técnicas mudam toda madrugada.',files:[
  {id:'c4-plan',type:'ANÁLISE ESTRUTURAL',title:'Plantas Orfeu A–D',desc:'Quatro cópias autenticadas e incompatíveis.',date:'04 NOV 2019',body:`<p>Cada planta foi impressa do mesmo arquivo em noites consecutivas. O edifício possui 18, 21, 17 e 24 apartamentos, respectivamente.</p><p>Todas carregam assinatura digital válida e medições internas coerentes.</p>`},
  {id:'c4-photo',type:'EVIDÊNCIA FOTOGRÁFICA',title:'Corredor do 11º andar',desc:'Câmera fixa registra mudança espacial.',date:'05 NOV 2019',body:`<p>Uma porta surge entre dois quadros consecutivos. Não há corte de gravação. Depois, o corredor curva para dentro de uma parede externa.</p><figure class="forensic-photo"><img src="assets/evidence/orfeu-corredor.jpg" alt="Corredor de edifício com portas excessivamente próximas e uma curva espacial impossível"><figcaption>INTERVALO ENTRE QUADROS // 0,04 s</figcaption></figure>`},
  {id:'c4-survey',type:'LEVANTAMENTO TOPOGRÁFICO',title:'Volume excedente',desc:'Comparação entre interior e fachada.',date:'06 NOV 2019',body:`<p>O volume interno medido excede o externo em 1.840 m³. O excedente muda de andar conforme a posição da equipe.</p><p>Dois técnicos retornaram ao ponto inicial sem realizar nenhuma curva.</p>`},
  {id:'c4-archive',type:'ARQUIVO CRUZADO',title:'Geometria sem origem',desc:'Ocorrência preservada no Caso 001.',date:'ARQ. 001',body:`<p>Dois corredores ocuparam a mesma coordenada. Portas abriram para cômodos incompatíveis com a fachada.</p><p>Durante a medição, um corredor alterou o próprio comprimento — o mesmo efeito agora registrado no Orfeu.</p>`},
  {id:'c4-attic',type:'OCORRÊNCIA RESIDENCIAL',title:'Membrana no apartamento 72',desc:'Tecido violeta encontrado no forro.',date:'03 NOV 2019',body:`<p>Uma membrana vascularizada semelhante a placenta foi encontrada no sótão técnico. Ondas de rádio provocavam contrações.</p><p>Ela desapareceu antes das mudanças estruturais e não voltou a ser detectada no edifício.</p>`},
  {id:'c4-wind',type:'REGISTRO DE PORTARIA',title:'Vento no elevador',desc:'Rajadas em cabine fechada.',date:'04 NOV 2019',body:`<p>O elevador abriu no 13º andar, inexistente na planta original. Uma rajada derrubou o porteiro e espalhou documentos.</p><p>A inspeção encontrou o exaustor de emergência invertido. O andar não reapareceu.</p>`}
 ],messages:[
  {id:'c4-resident',from:'MORADORA // C. NAKAI',title:'Meu apartamento se mudou',preview:'A porta ainda tem meu número, mas não é minha casa.',body:'Entrei no 1104 e encontrei a sala de outra família. Eles juravam morar ali havia oito anos. Quando voltamos ao corredor, minha porta estava três andares abaixo.'},
  {id:'c4-engineer',from:'ENGENHEIRO // T. MOTA',title:'Não é o prédio que muda',preview:'A deformação acompanha alguma coisa.',body:'Marquei os pontos alterados por horário. Eles formam uma rota contínua, como pegadas. A falha muda de forma enquanto caminha e o edifício se reorganiza ao redor dela.'}
 ],zones:[
  {id:'space',title:'QUADRO A // INCONSISTÊNCIA ESPACIAL',hint:'Comprove que o interior não obedece ao volume físico.'},
  {id:'route',title:'QUADRO B // AGENTE DE DISTORÇÃO',hint:'Demonstre que as alterações formam um deslocamento ativo.'}
 ],evidence:[
  {id:'c4-plans',title:'Quatro plantas válidas discordam',tag:'PLANTAS ORFEU',sourceType:'file',source:'c4-plan',zone:'space'},
  {id:'c4-volume',title:'Interior excede a fachada',tag:'LEVANTAMENTO',sourceType:'file',source:'c4-survey',zone:'space'},
  {id:'c4-cross',title:'Dois corredores na mesma coordenada',tag:'ARQUIVO CRUZADO',sourceType:'file',source:'c4-archive',zone:'space'},
  {id:'c4-door',title:'Porta surge entre quadros',tag:'FOTOGRAFIA 11º',sourceType:'file',source:'c4-photo',zone:'route'},
  {id:'c4-home',title:'Apartamento muda de posição',tag:'MENSAGEM C. NAKAI',sourceType:'message',source:'c4-resident',zone:'route'},
  {id:'c4-path',title:'Alterações formam uma rota',tag:'MENSAGEM T. MOTA',sourceType:'message',source:'c4-engineer',zone:'route'}
 ]}
];

const captureRules={
 clock:['todos os relógios da vitrine já marcam 03:17','every clock in the window already reads 03:17'],cut:['03:17:00 — [interferência]','03:17:00 — [interference]'],silence:['toda comunicação com santa eulália foi interrompida','all communication with santa eulália was severed'],
 figure:['a figura nela registrada não constava no local','the figure recorded in it was not present at the location'],shadows:['as sombras apontam para ele','the shadows point toward him'],witness:['a figura não estava lá','the figure was not there'],
 portrait:['na segunda, há seis','in the second, there are six'],dissociation:['me chama de mãe. eu sou esposa dele','calls me mother. i am his wife'],memory:['perdeu primeiro as lembranças recentes','first lost recent memories'],
 'c2-lux':['a luz solar atravessava as janelas, mas terminava a 40 cm do piso','sunlight passed through the windows but ended 40 cm above the floor'],'c2-power':['tensão estável durante todo o período','stable voltage throughout the period'],'c2-cross':['o escurecimento movia-se contra a posição solar','the darkness moved against the sun’s position'],
 'c2-shift':['a escuridão ocupa uma posição diferente','the darkness occupies a different position'],'c2-steps':['o assoalho não rangia','the floorboards did not creak'],'c2-blink':['pisquei por menos de um segundo','i blinked for less than a second'],
 'c3-pulse':['contraíam-se a cada 71 segundos','contracted every 71 seconds'],'c3-cells':['cada célula compartilha a mesma assinatura','every cell shares the same unknown mitochondrial signature'],'c3-body':['o tecido do terceiro andar contraiu no mesmo instante','tissue on the third floor contracted at the same instant'],
 'c3-drain':['uma massa emerge de outro dreno','a mass emerges from another drain'],'c3-pool':['uma massa submergiu em uma poça rasa','a mass fully submerged in a shallow pool'],'c3-swim':['a massa mergulhou como se houvesse um oceano','the mass dove as if an ocean lay beneath the floor'],
 'c4-plans':['o edifício possui 18, 21, 17 e 24 apartamentos','the building contains 18, 21, 17, and 24 apartments'],'c4-volume':['o volume interno medido excede o externo','the measured internal volume exceeds the external volume'],'c4-cross':['dois corredores ocuparam a mesma coordenada','two corridors began occupying the same coordinate'],
 'c4-door':['uma porta surge entre dois quadros consecutivos','a door appears between two consecutive frames'],'c4-home':['minha porta estava três andares abaixo','my door was three floors below'],'c4-path':['eles formam uma rota contínua','they form a continuous route']
};

function save(){localStorage.setItem('osac-state',JSON.stringify(state));}
function extraCase(){return extraCases.find(c=>c.id===state.currentCase)}
function caseRun(id=state.currentCase){
 if(!state.caseRuns[id])state.caseRuns[id]={readFiles:[],readMessages:[],excerpts:[],placements:{},connections:[],finale:false};
 if(!state.caseRuns[id].excerpts)state.caseRuns[id].excerpts=[];
 return state.caseRuns[id];
}
function activeConnections(){return state.currentCase===1?state.connections:caseRun().connections}
function activeFinale(){return state.currentCase===1?state.finale:caseRun().finale}
function totalZones(){return state.currentCase===1?3:extraCase().zones.length}
function campaignCases(){return [{id:1,code:'OSAC-001',title:'O Silêncio de Santa Eulália',entity:'MANDELA'},...extraCases]}
function log(text){const item={text,time:new Date().toLocaleTimeString(window.OSAC_I18N?.locale||'pt-BR',{hour:'2-digit',minute:'2-digit'})};state.activities.unshift(item);state.activities=state.activities.slice(0,20);save();renderActivity();}
function toast(text){const t=$('#toast');t.textContent=text;t.classList.remove('hidden');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.add('hidden'),3200)}
function boot(){
 if(state.entered){$('#boot').classList.add('hidden');$('.startup-controls').classList.add('hidden');$('#terminal').classList.remove('hidden');initTerminal();return}
 const lines=['OSAC BIOS v4.11.7','Verificando integridade neural........ OK','Estabelecendo túnel criptográfico..... OK','Sincronizando Córtex.................. INDETERMINADO','Credencial externa detectada.'];let i=0;
 const next=()=>{if(i<lines.length){$('#boot-log').innerHTML+=`<div>&gt; ${lines[i++]}</div>`;setTimeout(next,240)}else $('#boot-enter').classList.remove('hidden')};next();
}
$('#boot-enter').onclick=()=>{
 $('#boot-enter').disabled=true;$('.startup-controls').classList.add('hidden');
 document.body.classList.add('session-glitch');
 setTimeout(()=>{
  $('#boot').classList.add('hidden');document.body.classList.remove('session-glitch');
  const reveal=$('#session-reveal');reveal.classList.remove('hidden');reveal.setAttribute('aria-hidden','false');
  setTimeout(()=>reveal.classList.add('ready'),2150);
 },620);
};
$('#reveal-continue').onclick=()=>{
 const reveal=$('#session-reveal');reveal.classList.add('glitch');
  setTimeout(()=>{reveal.classList.add('hidden');reveal.classList.remove('glitch','ready');reveal.setAttribute('aria-hidden','true');$('.startup-controls').classList.remove('hidden');$('#protocol').classList.remove('hidden')},450);
};
function validateProtocol(){ $('#accept-protocol').disabled=!($('#confidentiality').checked && $('#operator-name').value.trim().length>=2) }
$('#confidentiality').onchange=validateProtocol;$('#operator-name').oninput=validateProtocol;
$('#accept-protocol').onclick=()=>{state.name=$('#operator-name').value.trim().toUpperCase();state.entered=true;save();$('#protocol').classList.add('hidden');$('.startup-controls').classList.add('hidden');$('#terminal').classList.remove('hidden');initTerminal();log('Protocolo de confidencialidade aceito.');toast('ACESSO PROVISÓRIO CONCEDIDO')};
function initTerminal(){
 $('#session-id').textContent=Math.random().toString(36).slice(2,8).toUpperCase();
 setInterval(()=>$('#clock').textContent=new Date().toLocaleTimeString(window.OSAC_I18N?.locale||'pt-BR'),1000);
 $$('#nav button').forEach(b=>b.onclick=()=>navigate(b.dataset.view));
 $('#close-intel').onclick=()=>{const terminal=document.querySelector('.terminal');terminal.classList.remove('intel-open');if(innerWidth>=1100)terminal.classList.add('intel-closed')};
 $('#intel-toggle').onclick=()=>{const terminal=document.querySelector('.terminal');terminal.classList.remove('intel-closed');terminal.classList.toggle('intel-open')};
 document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='a')$('#intel-toggle').click();if(e.key==='Escape')closeModal()});
 updateChrome();navigate(state.view || 'dashboard');renderActivity();setTimeout(showSessionTutorial,500);
}
function showSessionTutorial(){
 if(tutorialShown)return;tutorialShown=true;
 $('#modal-content').innerHTML=`<article class="tutorial"><p class="eyebrow">CÓRTEX // PROTOCOLO DE COLETA</p><h2>Como extrair evidências</h2><div class="tutorial-steps"><section><b>01</b><strong>LEIA</strong><p>Compare relatórios, fotografias, conversas e mensagens. Nem todo detalhe pertence ao caso.</p></section><section><b>02</b><strong>SELECIONE</strong><p>Marque com o cursor somente o trecho que sustenta uma hipótese e pressione “Salvar trecho no mural”.</p></section><section><b>03</b><strong>ORGANIZE</strong><p>No mural, classifique os recortes nos quadros corretos. Seleções imprecisas também serão arquivadas.</p></section></div><button id="tutorial-close" class="terminal-button">INICIAR INVESTIGAÇÃO</button></article>`;
 $('#modal').classList.remove('hidden');$('#tutorial-close').onclick=closeModal;
}
function unlockedFiles(){if(state.currentCase>1)return extraCase().files;return files.filter(f=>!f.locked || state.connections.length >= f.requires)}
function activeEvidence(){return state.currentCase===1?evidence:extraCase().evidence}
function activeZones(){return state.currentCase===1?boardZones:extraCase().zones}
function activeRun(){return state.currentCase===1?state:caseRun()}
function evidenceUnlocked(e){return activeRun().excerpts.some(item=>item.clueId===e.id||item.id===e.id)}
function visibleEvidence(){
 const definitions=activeEvidence();
 return activeRun().excerpts.map(excerpt=>{
  if(excerpt.clueId){const definition=definitions.find(e=>e.id===excerpt.clueId);return definition?{...definition,title:excerpt.text,excerpt:true,sourceLabel:excerpt.sourceLabel}:null}
  return {id:excerpt.id,title:excerpt.text,tag:'RECORTE NÃO CLASSIFICADO',zone:null,source:excerpt.sourceId,sourceType:excerpt.sourceType,sourceLabel:excerpt.sourceLabel,note:true};
 }).filter(Boolean);
}
function boardStage(){return Math.min(totalZones(),activeConnections().length+1)}
function caseProgress(){const connections=activeConnections().length,total=totalZones();return Math.round((connections+(activeFinale()?1:0))/(total+1)*100)}
function updateChrome(){
 const connections=activeConnections(),run=state.currentCase===1?state:caseRun(),activeMessages=state.currentCase===1?messages:extraCase().messages;
 $('#files-count').textContent=unlockedFiles().length;$('#board-count').textContent=`${connections.length}/${totalZones()}`;
 const unread=activeMessages.filter(m=>(!m.locked||connections.length>=(m.requires||2))&&!run.readMessages.includes(m.id)).length;$('#message-count').textContent=unread;$('#message-count').classList.toggle('hidden',!unread);
 $('#clearance').textContent=`ACESSO: ${connections.length===totalZones()?'NÍVEL 03':connections.length?'NÍVEL 0'+(connections.length+1):'PROVISÓRIO'}`;
 $('#case-dot').classList.toggle('hidden',activeFinale());
 if(connections.length>=1){$('#cortex-state').textContent=connections.length===totalZones()?'INTERFERÊNCIA':'OSCILANTE';$('#footer-whisper').textContent=connections.length===totalZones()?'EU ESTAVA ESPERANDO.':'NÃO HÁ NADA ATRÁS DE VOCÊ.'}
}
function navigate(view){state.view=view;save();$$('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));const w=$('#workspace');w.innerHTML=views[view]();if(view==='board')bindBoard();if(view==='files')bindFiles();if(view==='messages')bindMessages();if(view==='dashboard')bindDashboard();if(view==='case')bindCase();if(view==='profile')bindProfile();}
const head=(code,title,sub)=>`<header class="page-head"><div><p class="eyebrow">TERMINAL // ${code}</p><h1>${title}</h1><p>${sub}</p></div><div class="page-code">${code}</div></header>`;
function caseSelector(){
 return `<section class="case-selector">${campaignCases().map(c=>{const locked=c.id>state.unlockedCase,complete=c.id===1?state.finale:caseRun(c.id).finale;return `<button data-case="${c.id}" class="${c.id===state.currentCase?'active':''} ${locked?'locked':''}" ${locked?'disabled':''}><span>${c.code}</span><strong>${locked?'[ ACESSO BLOQUEADO ]':c.title}</strong><small>${locked?'Conclua o caso anterior':complete?'CASO ENCERRADO':'INVESTIGAÇÃO DISPONÍVEL'}</small></button>`}).join('')}</section>`;
}
function dashboardView(){
 const c=state.currentCase===1?{code:'OSAC-001',title:'O Silêncio de Santa Eulália'}:extraCase(),connections=activeConnections();
 return `${head('01','Visão geral',`Bem-vindo, ${state.name}. Campanha OSAC em andamento.`)}${caseSelector()}<div class="grid"><section class="card metric"><h3>PROGRESSO DO CASO</h3><strong>${caseProgress()}%</strong><small>CONHECIMENTO VALIDADO</small><div class="progress"><i style="width:${caseProgress()}%"></i></div></section><section class="card metric"><h3>ARQUIVOS DISPONÍVEIS</h3><strong>${unlockedFiles().length}</strong><small>REGISTROS DESTE CASO</small></section><section class="card metric"><h3>QUADROS ORGANIZADOS</h3><strong>${connections.length}<small> / ${totalZones()}</small></strong><small>HIPÓTESES CONFIRMADAS</small></section><section class="card wide"><h3>CASO SELECIONADO</h3><p>${c.code} // ${c.title.toUpperCase()}</p><button class="terminal-button" id="continue-case">${activeFinale()?'REVISAR CASO':'CONTINUAR INVESTIGAÇÃO'}</button></section><section class="card narrow"><h3>DIRETRIZ DO DIA</h3><p>“Coincidência é apenas uma hipótese ainda não testada.”</p></section></div>`;
}
function caseView(){
 if(state.currentCase===1)return `${head('02','Caso atual','Dossiê ativo e objetivos de investigação.')}${caseSelector()}<section class="case-banner"><div><p class="eyebrow">OSAC-001 // ATIVO</p><h2>O Silêncio de Santa Eulália</h2><p>Desaparecimento coletivo // Minas Gerais // 1998</p></div><span class="classification">RISCO COSMOLÓGICO</span></section><div class="grid"><section class="card wide"><h3>SUMÁRIO</h3><p>Em 17 de agosto de 1998, 312 habitantes desapareceram de Santa Eulália. Nenhum corpo foi encontrado. Arquivos recuperados discordam sobre quem esteve na cidade e quando o evento realmente começou.</p><h3>OBJETIVOS</h3>${['Analisar arquivos, conversas e fotografias','Reconstruir a sequência do evento','Demonstrar a presença impossível','Mapear a degradação do hospedeiro','Encerrar o Caso 001'].map((o,i)=>`<div class="objective ${objectiveDone(i)?'done':''}"><i>${objectiveDone(i)?'■':'□'}</i>${o}</div>`).join('')}</section><section class="card narrow"><h3>STATUS</h3><p>${state.finale?'CASO ENCERRADO':'INVESTIGAÇÃO EM CURSO'}</p><div class="progress"><i style="width:${caseProgress()}%"></i></div><br><button id="case-action" class="terminal-button">${state.connections.length===3&&!state.finale?'SUBMETER CONCLUSÃO':'REVISAR FONTES'}</button></section></div>`;
 const c=extraCase(),run=caseRun();return `${head('02','Caso atual','Dossiê ativo e objetivos de investigação.')}${caseSelector()}<section class="case-banner"><div><p class="eyebrow">${c.code} // ${run.finale?'ENCERRADO':'ATIVO'}</p><h2>${c.title}</h2><p>${c.location}</p></div><span class="classification">${c.risk}</span></section><div class="grid"><section class="card wide"><h3>SUMÁRIO</h3><p>${c.summary}</p><h3>OBJETIVOS</h3>${['Analisar todas as fontes disponíveis',...c.zones.map(z=>z.title.split('//')[1].trim()),`Identificar a classe responsável`,`Encerrar o ${c.code}`].map((o,i)=>{const done=i===0?run.readFiles.length>=4&&run.readMessages.length>=1:i<=c.zones.length?run.connections.length>=i:i===c.zones.length+1?run.connections.length===c.zones.length:run.finale;return `<div class="objective ${done?'done':''}"><i>${done?'■':'□'}</i>${o}</div>`}).join('')}</section><section class="card narrow"><h3>STATUS</h3><p>${run.finale?'CASO ENCERRADO':'INVESTIGAÇÃO EM CURSO'}</p><div class="progress"><i style="width:${caseProgress()}%"></i></div><br><button id="case-action" class="terminal-button">${run.connections.length===c.zones.length&&!run.finale?'SUBMETER CONCLUSÃO':'REVISAR FONTES'}</button></section></div>`;
}
function filesView(){
 const source=unlockedFiles(),read=state.currentCase===1?state.readFiles:caseRun().readFiles,connections=activeConnections();
 return `${head('03','Arquivos','Registros recuperados, cruzados e materiais de campo.')}<div class="file-list">${source.map(f=>{const locked=state.currentCase===1&&f.locked&&connections.length<f.requires;return `<article class="file-card ${locked?'locked':''} ${read.includes(f.id)?'read':''}" data-file="${f.id}"><span class="type">${locked?'CRIPTOGRAFADO':f.type}</span><h3>${locked?'[ ACESSO NEGADO ]':f.title}</h3><p>${locked?`Requer ${f.requires} quadro${f.requires>1?'s':''} organizado${f.requires>1?'s':''}.`:f.desc}</p><div class="file-meta"><span>${locked?'NÍVEL '+(f.requires+1):f.date}</span><span>${read.includes(f.id)?'LIDO':'○'}</span></div></article>`}).join('')}</div>`;
}
function messagesView(){
 const source=state.currentCase===1?messages:extraCase().messages,run=state.currentCase===1?state:caseRun(),connections=activeConnections();
 return `${head('05','Mensagens','Comunicação interna, depoimentos e transmissões recuperadas.')}<div>${source.filter(m=>!m.locked||connections.length>=(m.requires||2)).map(m=>`<article class="message ${run.readMessages.includes(m.id)?'':'unread'}" data-message="${m.id}"><div class="sender">${m.from}</div><div><h3>${m.title}</h3><p>${m.preview}</p></div></article>`).join('')}</div>`;
}
const views={
 dashboard:()=>dashboardView(),
 case:()=>caseView(),
 files:()=>filesView(),
 board:()=>boardView(),
 messages:()=>messagesView(),
 database:()=>`${head('06','Banco de dados OSAC','Entidades, eventos e protocolos indexados.')}<section class="card full">${[['ENT-014','MANDELA','Parasita mimético de assimilação humana',1],['ENT-021','BESTA VAZIA','Predador furtivo inteiramente desprovido de luz',1],['ENT-033','HEMORRÁGICO','Organismo capaz de colonização hematológica',2],['ENT-008','ABISMO','Voragem biológica associada a lodo negro',2],['ENT-040','DISTORCIDO','Falha viva de alteração espacial e morfológica',3],['ENT-019','FETO CÓSMICO','Viajante de membranas placentárias',2],['ENT-027','VENDAVAIS','Entidade atmosférica invisível',1],['LOC-082','SANTA EULÁLIA','Zona de silêncio permanente',0],['ORG-000','OSAC','Organização Segregada Anti-Cosmos',0],['ENT-001','CAÇADORES','Entidades de contenção limiar',2],['SYS-000','CÓRTEX 0','Registro inexistente',3]].map(([c,n,d,r])=>`<div class="db-entry ${state.connections.length<r?'locked':''}"><span class="db-code">${state.connections.length<r?'███-███':c}</span><div><h3>${state.connections.length<r?'REGISTRO RESTRITO':n}</h3><p>${state.connections.length<r?'Amplie seu nível de acesso.':d}</p></div></div>`).join('')}</section>`,
 profile:()=>`${head('07','Registro do operador','Credenciais, desempenho e configurações locais.')}<div class="grid"><section class="card wide"><h3>${state.name}</h3><p>VÍNCULO: INVESTIGADOR OSAC<br>NÍVEL: ${state.unlockedCase}<br>CASOS CONCLUÍDOS: ${(state.finale?1:0)+extraCases.filter(c=>caseRun(c.id).finale).length} / 4<br>QUADROS VALIDADOS: ${state.connections.length+extraCases.reduce((sum,c)=>sum+caseRun(c.id).connections.length,0)}</p></section><section class="card narrow"><h3>CONTROLE LOCAL</h3><p>O progresso da campanha permanece apenas neste dispositivo.</p><button id="reset-progress" class="terminal-button">REINICIAR CAMPANHA</button></section></div>`
};
function objectiveDone(i){return [state.readFiles.length>=6&&state.readMessages.length>=2,state.connections.length>=1,state.connections.length>=2,state.connections.length>=3,state.finale][i]}
function bindCaseSelector(){$$('.case-selector button:not(.locked)').forEach(button=>button.onclick=()=>{state.currentCase=Number(button.dataset.case);selectedEvidence=null;save();updateChrome();navigate('dashboard');toast(`CASO SELECIONADO // ${campaignCases().find(c=>c.id===state.currentCase).code}`)})}
function bindDashboard(){bindCaseSelector();$('#continue-case').onclick=()=>navigate('case')}
function bindCase(){bindCaseSelector();const button=$('#case-action');button.onclick=()=>{if(state.currentCase===1){state.connections.length===3&&!state.finale?playFinale():navigate('files')}else{const c=extraCase(),run=caseRun();run.connections.length===c.zones.length&&!run.finale?playExtraFinale():navigate('files')}}}
function bindFiles(){$$('.file-card:not(.locked)').forEach(el=>el.onclick=()=>openFile(el.dataset.file))}
function openFile(id){const source=state.currentCase===1?files:extraCase().files,run=state.currentCase===1?state:caseRun(),f=source.find(x=>x.id===id);if(!run.readFiles.includes(id)){run.readFiles.push(id);log(`Arquivo aberto: ${f.title}.`)}save();openSourceContext={type:'file',id:f.id,label:`${f.type} // ${f.title}`};$('#modal-content').innerHTML=`<button class="modal-close">×</button><article class="document"><div class="doc-head"><p class="eyebrow">${f.type} // ${f.date}</p><h2>${f.title}</h2></div><div class="doc-body">${f.body}</div>${excerptTool()}</article>`;$('#modal').classList.remove('hidden');$('.modal-close').onclick=closeModal;bindExcerptTool();updateChrome()}
function closeModal(){$('#modal').classList.add('hidden');openSourceContext=null}
$('#modal').onclick=e=>{if(e.target.id==='modal')closeModal()};
function bindMessages(){$$('.message').forEach(el=>el.onclick=()=>{const source=state.currentCase===1?messages:extraCase().messages,run=state.currentCase===1?state:caseRun(),m=source.find(x=>x.id===el.dataset.message);if(!run.readMessages.includes(m.id)){run.readMessages.push(m.id);log(`Mensagem lida: ${m.title}.`)}save();openSourceContext={type:'message',id:m.id,label:`MENSAGEM // ${m.title}`};$('#modal-content').innerHTML=`<button class="modal-close">×</button><article class="document"><div class="doc-head"><p class="eyebrow">${m.from}</p><h2>${m.title}</h2></div><div class="doc-body"><p>${m.body}</p></div>${excerptTool()}</article>`;$('#modal').classList.remove('hidden');$('.modal-close').onclick=closeModal;bindExcerptTool();updateChrome();navigate('messages')})}
function excerptTool(){return `<aside class="excerpt-tool"><div><span>EXTRAÇÃO MANUAL</span><p>Selecione um trecho relevante acima e salve-o como possível evidência.</p></div><button id="save-excerpt" class="terminal-button">SALVAR TRECHO NO MURAL</button></aside>`}
function bindExcerptTool(){
 const button=$('#save-excerpt');if(!button)return;
 button.onpointerdown=e=>e.preventDefault();button.onclick=captureSelectedExcerpt;
}
function normalizeText(text){return text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim()}
function captureSelectedExcerpt(){
 const selection=window.getSelection(),text=selection?selection.toString().trim():'';const body=$('.doc-body');
 if(!openSourceContext||!body||!text||text.length<12){toast('SELECIONE UM TRECHO MAIS PRECISO DO DOCUMENTO');return}
 if(text.length>360){toast('RECORTE EXTENSO DEMAIS // ISOLE UMA INFORMAÇÃO');return}
 const range=selection.rangeCount?selection.getRangeAt(0):null;if(!range||!body.contains(range.commonAncestorContainer)){toast('A SELEÇÃO DEVE PERTENCER AO CONTEÚDO DO ARQUIVO');return}
 const run=activeRun(),normalized=normalizeText(text),sourceClues=activeEvidence().filter(e=>e.source===openSourceContext.id&&e.sourceType===openSourceContext.type);
 const matched=sourceClues.find(e=>(captureRules[e.id]||[]).some(phrase=>normalized.includes(normalizeText(phrase))));
 if(matched&&run.excerpts.some(item=>item.clueId===matched.id)){toast('ESTE VESTÍGIO JÁ FOI SALVO NO MURAL');return}
 const excerpt={id:`note-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,clueId:matched?matched.id:null,text,sourceId:openSourceContext.id,sourceType:openSourceContext.type,sourceLabel:openSourceContext.label,createdAt:Date.now()};
 run.excerpts.push(excerpt);save();selection.removeAllRanges();toast('TRECHO SALVO // DISPONÍVEL NO MURAL');log(`Trecho extraído de ${openSourceContext.label}.`);
}
function evidenceCard(e,placed=false){return `<button class="clue-card ${placed?'placed':''}" draggable="true" data-clue="${e.id}"><span>${e.tag}</span><strong>${e.title}</strong>${placed?'<small>CLIQUE PARA REMOVER</small>':''}</button>`}
function evidenceSourceLabel(e){
 if(e.sourceLabel)return e.sourceLabel;
 const source=e.sourceType==='message'?(state.currentCase===1?messages:extraCase().messages):(state.currentCase===1?files:extraCase().files);
 const record=source.find(item=>item.id===e.source);
 if(!record)return e.tag;
 return `${e.sourceType==='message'?'MENSAGEM':record.type} // ${record.title}`;
}
function showEvidenceSource(id){
 const clue=visibleEvidence().find(item=>item.id===id);if(!clue)return;
 toast(`FONTE DA EVIDÊNCIA // ${evidenceSourceLabel(clue)}`);
}
function boardView(){
 const run=activeRun(),zones=activeZones(),activeIndex=Math.min(run.connections.length,zones.length-1),available=visibleEvidence();
 return `${head('04','Mural de investigação','Organize vestígios de fontes distintas nos quadros analíticos.')}<div class="board-stage">${zones.map((z,i)=>`<span class="${i<=activeIndex?'active':''}">${i<run.connections.length?'✓ ':''}${z.title.split('//')[0]}</span>`).join('')}</div><p class="board-help">NEM TODO ARQUIVO CONTÉM UMA PISTA ÚTIL. CLASSIFIQUE APENAS INFORMAÇÕES SUSTENTADAS POR FONTES INDEPENDENTES.</p><section class="clue-pool"><header><span>EVIDÊNCIAS NÃO CLASSIFICADAS</span><b>${available.filter(e=>!run.placements[e.id]).length}</b></header><div>${available.filter(e=>!run.placements[e.id]).map(e=>evidenceCard(e)).join('')||'<p>Nenhuma evidência disponível. Revise arquivos e mensagens ainda não lidos.</p>'}</div></section><div class="analysis-boards">${zones.map((zone,i)=>{const visible=i<=activeIndex;if(!visible)return `<section class="analysis-zone locked"><span>QUADRO CRIPTOGRAFADO</span><strong>Valide a análise anterior</strong></section>`;const placed=available.filter(e=>run.placements[e.id]===zone.id);return `<section class="analysis-zone ${i<run.connections.length?'complete':''} ${i===activeIndex?'current':''}" data-zone="${zone.id}"><header><span>${zone.title}</span><b>${placed.length}/3</b></header><p>${zone.hint}</p><div class="zone-slots">${placed.map(e=>evidenceCard(e,true)).join('')}${Array.from({length:Math.max(0,3-placed.length)},()=>'<i>SOLTAR EVIDÊNCIA</i>').join('')}</div>${i===activeIndex&&run.connections.length<zones.length?'<button class="terminal-button validate-board">VALIDAR ORGANIZAÇÃO</button>':'<small>QUADRO VALIDADO // EVIDÊNCIAS FIXADAS</small>'}</section>`}).join('')}</div>`;
}
function bindBoard(){
 $$('.clue-card').forEach(card=>{card.onclick=()=>{showEvidenceSource(card.dataset.clue);handleClueClick(card)};card.onmouseenter=()=>showEvidenceSource(card.dataset.clue);card.onfocus=()=>showEvidenceSource(card.dataset.clue);card.ondragstart=e=>e.dataTransfer.setData('text/plain',card.dataset.clue)});
 $$('.analysis-zone.current').forEach(zone=>{zone.onclick=e=>{if(e.target.closest('.clue-card')||e.target.closest('.validate-board'))return;if(selectedEvidence)placeEvidence(selectedEvidence,zone.dataset.zone)};zone.ondragover=e=>e.preventDefault();zone.ondrop=e=>{e.preventDefault();placeEvidence(e.dataTransfer.getData('text/plain'),zone.dataset.zone)}});
 const validate=$('.validate-board');if(validate)validate.onclick=validateBoard;
 const filesButton=$('#board-files');if(filesButton)filesButton.onclick=()=>navigate('files');
}
function handleClueClick(card){
 const run=activeRun(),id=card.dataset.clue;const e=visibleEvidence().find(item=>item.id===id);const completedZone=run.connections.includes(run.placements[id]);
 if(card.classList.contains('placed')){if(completedZone){toast('QUADRO VALIDADO // EVIDÊNCIA FIXADA');return}delete run.placements[id];selectedEvidence=null;save();navigate('board');return}
 selectedEvidence=selectedEvidence===id?null:id;$$('.clue-card').forEach(c=>c.classList.toggle('selected',c.dataset.clue===selectedEvidence));
}
function placeEvidence(id,zone){
 const run=activeRun(),e=visibleEvidence().find(item=>item.id===id);if(!e||run.connections.includes(run.placements[id]))return;
 const occupied=Object.entries(run.placements).filter(([,z])=>z===zone).length;if(occupied>=3&&run.placements[id]!==zone){toast('QUADRO CHEIO // REMOVA UM CARTÃO');return}
 run.placements[id]=zone;selectedEvidence=null;save();navigate('board');
}
function validateBoard(){
 const run=activeRun(),zones=activeZones(),allEvidence=activeEvidence(),zone=zones[run.connections.length];if(!zone)return;const placed=Object.entries(run.placements).filter(([,placedZone])=>placedZone===zone.id).map(([id])=>id).sort();const expected=allEvidence.filter(e=>e.zone===zone.id).map(e=>e.id).sort();
 if(placed.length<3){toast('ANÁLISE INCOMPLETA // O QUADRO EXIGE TRÊS FONTES');return}
 if(placed.join('|')!==expected.join('|')){toast('ORGANIZAÇÃO INCONSISTENTE // AS FONTES NÃO SUSTENTAM A MESMA HIPÓTESE');document.querySelector('.workspace').classList.add('glitch');return}
 run.connections.push(zone.id);log(`Quadro validado: ${zone.title}.`);save();updateChrome();document.querySelector('.workspace').classList.add('glitch');setTimeout(()=>navigate('board'),450);toast('QUADRO VALIDADO // ANÁLISE CONSOLIDADA');if(run.connections.length===zones.length)setTimeout(()=>toast('CONCLUSÃO DISPONÍVEL NO CASO ATUAL'),3500);
}
function renderActivity(){if(!$('#activity-log'))return;$('#activity-log').innerHTML=(state.activities.length?state.activities:[{text:'Sessão iniciada.',time:'AGORA'}]).map(a=>`<div class="activity-item"><b>${a.text}</b><time>${a.time}</time></div>`).join('')}
function bindProfile(){$('#reset-progress').onclick=()=>{if(confirm('Apagar todo o progresso local e reiniciar?')){localStorage.removeItem('osac-state');location.reload()}}}
function playFinale(){
 state.finale=true;state.unlockedCase=Math.max(state.unlockedCase,2);save();log('Caso 001 encerrado. Avaliação aprovada.');
 const c=document.createElement('div');c.className='cinema';c.innerHTML=`<div class="cinema-content"><p class="warning">VIOLAÇÃO DE PERÍMETRO</p><div class="eye">◉</div><h1>ELE ENCONTROU<br>O TERMINAL.</h1><p id="cinema-text">MANDELA // MANIFESTAÇÃO LOCAL<br>CONTENÇÃO IMPOSSÍVEL</p></div>`;document.body.appendChild(c);document.querySelector('.terminal').classList.add('glitch');
 setTimeout(()=>{$('#cinema-text').innerHTML='ASSINATURA DESCONHECIDA DETECTADA<br>TEMPERATURA: −11°C';c.querySelector('.eye').textContent='╱│╲'},2600);
 setTimeout(()=>{c.innerHTML=`<div class="cinema-content"><p class="eyebrow">AMEAÇA ENCERRADA</p><h1>AVALIAÇÃO CONCLUÍDA.</h1><p>Operador ${state.name}, a OSAC reconhece sua aptidão.<br><br>CASO 002 // <span style="color:var(--green)">ACESSO LIBERADO</span></p><button class="terminal-button" id="return-terminal">ACESSAR CAMPANHA</button></div>`;$('#return-terminal').onclick=()=>{c.remove();state.currentCase=2;save();navigate('dashboard');updateChrome();toast('NOVO CASO DISPONÍVEL // OSAC-002')}} ,5200);
}
function playExtraFinale(){
 const caze=extraCase(),run=caseRun();run.finale=true;state.unlockedCase=Math.max(state.unlockedCase,Math.min(4,caze.id+1));save();log(`${caze.code} encerrado. Classificação confirmada: ${caze.entity}.`);
 const overlay=document.createElement('div');overlay.className='cinema';overlay.innerHTML=`<div class="cinema-content"><p class="warning">HIPÓTESE CONSOLIDADA</p><div class="eye">◉</div><h1>${caze.entity}</h1><p>As evidências organizadas sustentam esta classificação.<br>Ocorrências paralelas foram arquivadas para investigação independente.</p></div>`;document.body.appendChild(overlay);document.querySelector('.terminal').classList.add('glitch');
 setTimeout(()=>{const hasNext=caze.id<4;overlay.innerHTML=`<div class="cinema-content"><p class="eyebrow">${caze.code} // ENCERRADO</p><h1>${hasNext?'NOVO DOSSIÊ RECEBIDO':'CAMPANHA CONCLUÍDA'}</h1><p>${hasNext?`O Caso 00${caze.id+1} foi liberado para o operador ${state.name}.`:'Quatro incidentes catalogados. A origem das entidades permanece desconhecida.'}</p><button class="terminal-button" id="extra-return">${hasNext?'ABRIR PRÓXIMO CASO':'RETORNAR AO TERMINAL'}</button></div>`;$('#extra-return').onclick=()=>{overlay.remove();if(hasNext)state.currentCase=caze.id+1;save();updateChrome();navigate('dashboard');toast(hasNext?'NOVO CASO DISPONÍVEL':'CAMPANHA OSAC CONCLUÍDA')}} ,3200);
}
boot();
