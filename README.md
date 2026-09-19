# PromptForge

PromptForge é um aplicativo desktop para Windows projetado para resolver a criação de prompts profissionais e permitir que múltiplas inteligências artificiais debatam entre si para produzir respostas de consenso.

## Navegação Principal em Abas

O aplicativo divide o fluxo de trabalho em duas visões dedicadas, acessíveis a qualquer momento pelo cabeçalho superior:

1. **Forjador de Prompts**:
   - Transforma qualquer ideia simples ou briefing em um prompt detalhado e profissional (com papel prático, contexto, roteiro, regras e formato de entrega).
   - Inclui seletor direto de modelo e raciocínio no painel, permitindo alternar entre versões rápidas (Flash) e avançadas (Pro, DeepSeek R1, GPT-4o, Claude Sonnet), além de campo livre para IDs customizados.
   - Fornece notas estruturais de engenharia de prompt explicando as técnicas aplicadas.
   - Permite testar o prompt diretamente com um modelo ou enviá-lo com 1 clique para a Mesa Redonda.

2. **Mesa Redonda (Debate entre IAs)**:
   - Permite enviar qualquer dúvida, problema técnico, decisão de arquitetura ou prompt já pronto para discussão conjunta entre todos os modelos conectados.
   - **Uso automático da versão mais atual**: na Mesa Redonda, cada IA conectada utiliza automaticamente a versão mais potente e de maior raciocínio liberada na sua conta (como Gemini Pro, DeepSeek R1, GPT-4o, Claude 3.7 Sonnet).
   - **Etapa 1: Propostas simultâneas**: cada IA gera sua resposta de forma independente.
   - **Etapa 2: Confronto e análise comparativa**: as IAs confrontam suas respostas, apontando convergências, pontos fortes e omissões mútuas.
   - **Etapa 3: Parecer unificado de consenso**: síntese executiva e definitiva pronta para copiar e aplicar.

## Modelos e Provedores Suportados

- **Google Gemini**: auto-detecção dos modelos autorizados da sua conta (priorizando versões Pro como `gemini-2.5-pro` e `gemini-1.5-pro`), com suporte a IDs customizados.
- **Groq**: modelos rápidos e abertos de alta concorrência (`llama-3.3-70b-versatile`, `deepseek-r1-distill-llama-70b`).
- **OpenAI**: família GPT-4o, GPT-4o-mini e modelos de raciocínio da série o1/o3.
- **Anthropic Claude**: Claude 3.7 Sonnet, Claude 3.5 Sonnet, Haiku e Opus.
- **OpenRouter**: hub universal com acesso a dezenas de modelos com uma única chave.
- **Motor local estruturado**: opera offline sem necessidade de chave de API.

## Como alterar modelos e versões de raciocínio

- **Direto no painel do Forjador**: abaixo do seletor de provedor, escolha qualquer modelo disponível na lista com destaque para versões `[Raciocínio / Pro]`. Se desejar usar uma prévia ou versão experimental, basta digitar o nome no campo "ID de modelo customizado".
- **Na Mesa Redonda**: o sistema já convoca automaticamente as versões mais recentes e potentes de cada provedor conectado, exibindo o selo de cada modelo na lista de participantes.

## Como abrir o programa

- Pelo atalho PromptForge na Área de Trabalho (janela independente do app).
- Pelo arquivo PromptForge.bat.
- Pelo arquivo index.html em qualquer navegador moderno.

## Repositório

https://github.com/SaruAkaza/PromptForge
