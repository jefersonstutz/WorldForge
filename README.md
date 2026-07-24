# WORLD FORGE — MVP

Protótipo jogável do Terminal OSAC baseado no PRD do WORLD FORGE.

## Executar

Abra `index.html` em um navegador moderno. Não há dependências, build ou servidor obrigatório.

Para servir localmente (opcional):

```powershell
python -m http.server 8080
```

Depois visite `http://localhost:8080`.

## Campanha investigativa

1. Complete o boot e aceite o protocolo.
2. Leia relatórios, conversas, mensagens e fotografias.
3. Selecione com o cursor trechos relevantes e use **Salvar trecho no mural**.
4. No mural, organize os recortes nos quadros de sequência, presença e hospedeiro.
5. Cada quadro corretamente organizado libera novas fontes e amplia o banco OSAC.
6. Após organizar todos os quadros, submeta a conclusão no módulo **Caso Atual**.
7. A conclusão libera o caso seguinte.

Casos incluídos:

- OSAC-001 — O Silêncio de Santa Eulália
- OSAC-002 — A Casa Onde a Luz Morreu
- OSAC-003 — Maré Rubra
- OSAC-004 — A Planta Impossível

Os Casos 002–004 reutilizam registros anômalos encontrados anteriormente como arquivos cruzados. Outros documentos descrevem ocorrências paralelas plausíveis, mas somente fontes coerentes geram cartões que sustentam os quadros do caso.

O progresso é persistido em `localStorage` e pode ser reiniciado no módulo **Operador**.

## Decisões do MVP

- Aplicação web estática e autocontida para reduzir fricção de teste.
- Interface inteiramente diegética, conforme a constituição do produto.
- Progressão por leitura e dedução; não há pontos, inventário ou combate.
- Identidade visual violeta e liberação gradual dos quadros analíticos.
- Arquivo geral com sete classes de entidades e laudos cruzados investigáveis.
- Progressão baseada em classificação de evidências provenientes de múltiplas fontes.
- Extração manual de trechos: seleções corretas e falsas são preservadas no mural para triagem.
- Tutorial da mecânica exibido no início de cada sessão.
- Caso e conteúdo são definidos como dados em `app.js`, facilitando futura modularização.
- Campanha sequencial com quatro casos, progresso independente e desbloqueio persistente.
- A experiência funciona em desktop e telas móveis.
- Arquitetura visual mobile-first com navegação inferior no celular, layout intermediário para tablets/iPad e terminal completo no desktop.

## Próximos passos de produto

- Testes com 5–8 usuários do público-alvo e medição de conclusão, tempo e abandono.
- Sistema de autoria de casos baseado em JSON/CMS.
- Backend para contas, telemetria consentida e sincronização de progresso.
- Recursos audiovisuais próprios, acessibilidade ampliada e localização.
