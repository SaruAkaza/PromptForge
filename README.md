# PromptForge

PromptForge é um aplicativo desktop para Windows que ajuda a montar prompts detalhados para inteligências artificiais a partir de uma frase simples. O programa organiza o pedido com instruções de contexto, persona, restrições e formato de resposta, e inclui um modo para rodar o mesmo prompt em modelos diferentes ao mesmo tempo para comparar ou unificar as respostas.

## Mesa de Revisão (Conselho de IAs)

O programa pode consultar dois ou mais modelos em sequência sobre o mesmo prompt:

1. Propostas iniciais: cada modelo conectado responde à pergunta de forma independente.
2. Debate: os modelos comparam as respostas, apontando omissões e pontos fortes de cada abordagem.
3. Consenso final: o sistema reúne os melhores argumentos em uma resposta única e organizada.

Para usar a mesa de revisão, conecte ao menos duas chaves de API nas configurações. O Google Gemini e o Groq oferecem planos gratuitos sem cobrança inicial.

## Modelos e Provedores Suportados

- **Google Gemini**: auto-detecção dos modelos autorizados da sua conta (priorizando versões Pro como `gemini-2.5-pro`, `gemini-1.5-pro` e `gemini-2.5-flash`), com suporte a IDs de modelos customizados para contas com acesso antecipado ou prévias.
- **OpenRouter**: hub universal com acesso a dezenas de modelos de ponta com uma única chave.
- **Groq**: modelos rápidos e de código aberto (`llama-3.3-70b-versatile`, `deepseek-r1-distill-llama-70b`).
- **OpenAI**: família GPT-4o, GPT-4o-mini e modelos de raciocínio da série o1/o3.
- **Anthropic Claude**: Claude 3.7 Sonnet, Claude 3.5 Sonnet, Haiku e Opus.
- **Motor local estruturado**: funciona offline sem necessidade de chave de API.

## Auto-Detecção e Modelos Customizados

Ao inserir sua chave de API nas Configurações de Conexão:
- O PromptForge consulta os modelos autorizados para sua chave e seleciona automaticamente a versão Pro ou de maior capacidade disponível.
- Se você tiver acesso a versões experimentais, prévias ou modelos internos específicos (como prévias do Gemini ou novos checkpoints), basta digitar o identificador exato no campo "ID de modelo customizado".

## Como abrir o programa

- Pelo atalho PromptForge na Área de Trabalho (abre como janela independente).
- Pelo arquivo PromptForge.bat.
- Pelo arquivo index.html em qualquer navegador.

## Recursos

- Gerador de prompts com parâmetros de categoria, tom e formato de saída.
- Modo educativo que explica por que cada bloco do prompt foi adicionado.
- Central de conexões para salvar as chaves de API e preferências no próprio navegador (localStorage).
- Teste individual com um clique e sessão de debate da mesa de revisão.
- Histórico local e lista de itens salvos.

## Repositório

https://github.com/SaruAkaza/PromptForge
