# PromptForge

PromptForge é um aplicativo desktop para Windows que ajuda a montar prompts detalhados para inteligências artificiais a partir de uma frase simples. O programa organiza o pedido com instruções de contexto, persona, restrições e formato de resposta, e inclui um modo para rodar o mesmo prompt em modelos diferentes ao mesmo tempo para comparar ou unificar as respostas.

## Conselho de IAs

O programa pode consultar dois ou mais modelos em sequência sobre o mesmo prompt:

1. Propostas iniciais: cada modelo conectado responde à pergunta de forma independente.
2. Debate: os modelos comparam as respostas, apontando omissões e pontos fortes de cada abordagem.
3. Consenso final: o sistema reúne os melhores argumentos em uma resposta única e organizada.

Para usar o conselho, conecte ao menos duas chaves de API nas configurações. O Google Gemini e o Groq oferecem planos gratuitos sem cobrança inicial.

## Modelos suportados

- Google Gemini (gemini-2.5-flash e gemini-1.5-flash via Google AI Studio)
- Groq (llama-3.3-70b-versatile e deepseek-r1-distill-llama-70b via Groq Console)
- OpenAI (gpt-4o e gpt-4o-mini via OpenAI Platform)
- Anthropic Claude (claude-3-5-sonnet e claude-3-5-haiku via Anthropic Console)
- Motor local estruturado (funciona offline sem chave de API)

## Como abrir o programa

- Pelo atalho PromptForge na Área de Trabalho (abre como janela independente).
- Pelo arquivo PromptForge.bat.
- Pelo arquivo index.html em qualquer navegador.

## Recursos

- Gerador de prompts com parâmetros de categoria, tom e formato de saída.
- Modo educativo que explica por que cada bloco do prompt foi adicionado.
- Central de conexões para salvar as chaves de API no próprio navegador (localStorage).
- Teste individual com um clique e sessão de debate do conselho.
- Histórico local e lista de favoritos.

## Repositório

https://github.com/SaruAkaza/PromptForge
