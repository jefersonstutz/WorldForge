# Síntese e plano do produto

## Resumo do PRD

WORLD FORGE propõe uma plataforma de investigação narrativa na qual o usuário descobre universos por documentos, evidências e relações lógicas. O MVP apresenta a OSAC e valida se conhecimento — em vez de poder ou experiência — sustenta curiosidade, exploração e desejo de continuar.

O primeiro caso conduz o usuário por um terminal diegético, arquivos, mensagens, banco de dados e mural de investigação. O arco termina com a manifestação de Mandela, a intervenção de um Caçador, a aprovação do operador e a promessa do Caso 002.

## Requisitos convertidos em entrega

| Requisito | Implementação |
|---|---|
| Terminal OSAC | Shell diegético responsivo com módulos e atividade |
| Boot e login | Sequência de inicialização e protocolo nominal |
| Campanha | 4 casos sequenciais com arquivos cruzados e falsos caminhos |
| Documentos | 14 registros, com índice de entidades e desbloqueios por dedução |
| Mensagens | Caixa interna com estados lido/não lido |
| Banco OSAC | Entradas progressivamente reveladas |
| Mural | Trechos selecionados manualmente e organizados em quadros analíticos |
| Progressão | Nível de acesso derivado das conexões |
| Córtex 0 | Interferências textuais e mensagem emergente |
| Final | Sequência Mandela → Caçador → aprovação → Caso 002 |

## Plano técnico de evolução

1. Extrair casos, arquivos e regras para schemas JSON versionados.
2. Criar motor de condições para desbloqueios sem codificação por caso.
3. Adicionar API e autenticação quando houver necessidade real de sincronização.
4. Instrumentar eventos de funil: entrada, primeira leitura, tentativa de conexão, conclusão e intenção de continuar.
5. Criar ferramentas de autoria somente após validar o core loop com usuários.

## Métricas recomendadas

- Taxa de conclusão do Caso 001.
- Tempo até a primeira conexão válida.
- Tentativas inválidas por conexão.
- Percentual de arquivos opcionais lidos.
- Resposta pós-experiência: “Você investigaria o Caso 002?”.
- Clareza percebida do terminal sem tutorial externo.
