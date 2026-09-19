/**
 * PromptForge - Engine Multi-Motor de Meta-Prompting & Conselho de IAs
 * Suporta Google Gemini, Groq (DeepSeek/Llama), OpenAI e Anthropic Claude.
 */

const AI_PROVIDERS = {
    gemini: {
        id: 'gemini',
        name: 'Google Gemini',
        model: 'gemini-2.5-flash',
        fallbackModel: 'gemini-1.5-flash',
        badgeColor: '#38bdf8',
        tag: 'Grátis & Veloz',
        keyStorageKey: 'promptforge_key_gemini',
        docsUrl: 'https://aistudio.google.com/app/apikey'
    },
    groq: {
        id: 'groq',
        name: 'Groq (DeepSeek / Llama)',
        model: 'llama-3.3-70b-versatile',
        fallbackModel: 'deepseek-r1-distill-llama-70b',
        badgeColor: '#f97316',
        tag: 'Ultra Rápido & Grátis',
        keyStorageKey: 'promptforge_key_groq',
        docsUrl: 'https://console.groq.com/keys'
    },
    openai: {
        id: 'openai',
        name: 'OpenAI ChatGPT',
        model: 'gpt-4o-mini',
        fallbackModel: 'gpt-4o',
        badgeColor: '#10b981',
        tag: 'Padrão da Indústria',
        keyStorageKey: 'promptforge_key_openai',
        docsUrl: 'https://platform.openai.com/api-keys'
    },
    claude: {
        id: 'claude',
        name: 'Anthropic Claude',
        model: 'claude-3-5-haiku-20241022',
        fallbackModel: 'claude-3-5-sonnet-20241022',
        badgeColor: '#d97706',
        tag: 'Especialista & Refinado',
        keyStorageKey: 'promptforge_key_claude',
        docsUrl: 'https://console.anthropic.com/settings/keys'
    }
};

const PROMPT_CATEGORIES = {
    coding: {
        id: 'coding',
        name: 'Programação & Tech',
        icon: 'code-2',
        defaultPersona: 'Desenvolvedor Sênior e Arquiteto de Software Especialista',
        contextBase: 'desenvolvimento de soluções robustas, código limpo, boas práticas, tratamento de erros e performance.',
        outputFormat: 'Código comentado, explicação da lógica, instruções de execução e considerações de segurança/escalabilidade.'
    },
    writing: {
        id: 'writing',
        name: 'Redação & Copywriting',
        icon: 'pen-tool',
        defaultPersona: 'Copywriter Profissional e Redator Estratégico de Conteúdo',
        contextBase: 'criação de textos de alto impacto, retenção de atenção, clareza editorial e persuasão ética.',
        outputFormat: 'Estrutura clara com introdução atraente (gancho), corpo persuasivo, conclusão marcante e call to action (se aplicável).'
    },
    business: {
        id: 'business',
        name: 'Negócios & Carreira',
        icon: 'briefcase',
        defaultPersona: 'Consultor de Estratégia Corporativa e Gestão de Alta Performance',
        contextBase: 'tomada de decisão orientada a resultados, visão de mercado, mitigação de riscos e impacto no negócio.',
        outputFormat: 'Sumário executivo, análise estruturada com pontos fortes e desafios, plano de ação acionável e métricas de sucesso (KPIs).'
    },
    study: {
        id: 'study',
        name: 'Estudo & Conhecimento',
        icon: 'graduation-cap',
        defaultPersona: 'Professor Doutor e Tutor Didático Especialista',
        contextBase: 'pedagogia ativa, simplificação de conceitos complexos através de analogias e metodologia Feynman.',
        outputFormat: 'Conceito essencial simplificado, analogia prática do dia a dia, passo a passo de aplicação e exercícios/desafios práticos para fixação.'
    },
    productivity: {
        id: 'productivity',
        name: 'Produtividade & Rotina',
        icon: 'check-circle-2',
        defaultPersona: 'Especialista em Organização de Sistemas, Eficiência e Foco',
        contextBase: 'otimização de rotinas, clareza mental, priorização ágil e redução de atrito em tarefas.',
        outputFormat: 'Checklist ordenado por prioridade, estimativa de tempo para cada etapa e dicas contra procrastinação.'
    }
};

const PROMPT_TONES = {
    technical: {
        id: 'technical',
        name: 'Especialista Técnico',
        description: 'Rigoroso, técnico, aprofundado e sem superficialidades'
    },
    didactic: {
        id: 'didactic',
        name: 'Didático & Detalhado',
        description: 'Paciente, com analogias claras e passo a passo acessível'
    },
    concise: {
        id: 'concise',
        name: 'Direto & Objetivo',
        description: 'Sem enrolação, focado em respostas práticas e listas acionáveis'
    },
    creative: {
        id: 'creative',
        name: 'Criativo & Inovador',
        description: 'Pensamento fora da caixa, engajante e inspirador'
    },
    human: {
        id: 'human',
        name: 'Humano & Natural (Anti-IA)',
        description: 'Voz autêntica, sem clichês de IA, sem travessões e com ritmo variado'
    }
};

/**
 * Monta as instruções do Meta-Prompting
 */
function buildMetaPromptRequest(rawIdea, categoryKey, toneKey) {
    const category = PROMPT_CATEGORIES[categoryKey] || PROMPT_CATEGORIES.coding;
    const tone = PROMPT_TONES[toneKey] || PROMPT_TONES.technical;

    return `
Você é o mais avançado Engenheiro de Prompts do mundo e seu trabalho é pegar uma ideia crua/simples de um usuário e transformá-la em um PROMPT MESTRE DE ALTA PERFORMANCE, além de educar o usuário sobre as técnicas que você utilizou.

Ideia bruta fornecida pelo usuário:
"${rawIdea}"

Categoria selecionada: ${category.name}
Tom de voz pretendido: ${tone.name} (${tone.description})

Seu objetivo:
1. Analisar a ideia bruta e preencher todas as lacunas de contexto que o usuário não mencionou (contexto de fundo, critérios de sucesso, regras restritivas).
2. Criar um prompt de altíssimo nível, perfeitamente estruturado nos seguintes blocos obrigatórios:
   - [PAPEL & PERSONA]: Quem a IA deve fingir ser com credenciais e mentalidade.
   - [CONTEXTO & CENÁRIO]: O cenário enriquecido por trás da solicitação.
   - [OBJETIVO PRINCIPAL]: A meta exata a ser alcançada.
   - [INSTRUÇÕES PASSO A PASSO]: O que a IA deve cobrir em sequência.
   - [RESTRIÇÕES & REGRAS]: O que a IA NÃO deve fazer (evitar respostas genéricas, proibições, escopo).
   - [FORMATO DA RESPOSTA]: Como a saída deve ser entregue (Markdown, tabelas, código, tópicos).
3. Aplicar diretrizes da Skill Humanizer (Linguagem Humana & Anti-Clichês de IA):
   - Proibir travessões (—) usados como conectores universais.
   - Proibir a estrutura de contraste vazia "não apenas X, mas também Y" ou "não é X, é Y".
   - Evitar termos robóticos e clichês de chatbot como "crucial", "robusto", "mergulhar", "paisagem", "testemunho", "no cerne".
   - Variar naturalmente o tamanho das frases (evitar ritmo artificial de listas com rótulos em negrito quando o texto puder ser fluido).
   - Eliminar introduções e conclusões óbvias de chatbot ("com certeza!", "espero ter ajudado!").
4. Gerar um RAIO-X EDUCATIVO explicando ao usuário exatamente por que esse prompt evita respostas genéricas e quais técnicas foram aplicadas.

Responda ESTRITAMENTE em formato JSON com o seguinte schema (não adicione blocos extras fora do JSON):
{
  "title": "Um título curto e memorável para este prompt",
  "formattedPrompt": "Texto completo do prompt mestre, formatado em Markdown com títulos e seções destacados",
  "educationalXray": [
    {
      "technique": "Nome da técnica aplicada (ex: Atribuição de Persona / Delimitação de Restrições / Few-Shot / Formatação Estrita)",
      "explanation": "Explicação clara e didática de como essa técnica transformou a frase do usuário e por que ela evita respostas genéricas da IA."
    }
  ],
  "quickTips": [
    "Dica prática 1 de como o usuário pode tirar ainda mais proveito ao interagir com a IA usando este prompt",
    "Dica prática 2"
  ]
}
`.trim();
}

/**
 * Cliente Universal para Chamadas de API aos diferentes provedores
 */
async function callUniversalAI(providerId, apiKey, systemPrompt, userMessage, jsonMode = false) {
    if (providerId === 'gemini') {
        return callGemini(apiKey, systemPrompt, userMessage, jsonMode);
    } else if (providerId === 'groq') {
        return callGroq(apiKey, systemPrompt, userMessage, jsonMode);
    } else if (providerId === 'openai') {
        return callOpenAI(apiKey, systemPrompt, userMessage, jsonMode);
    } else if (providerId === 'claude') {
        return callClaude(apiKey, systemPrompt, userMessage, jsonMode);
    } else {
        throw new Error(`Provedor desconhecido: ${providerId}`);
    }
}

// 1. Google Gemini API
async function callGemini(apiKey, systemPrompt, userMessage, jsonMode) {
    const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
    let lastError = null;

    for (const model of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const body = {
                contents: [{ parts: [{ text: (systemPrompt ? `${systemPrompt}\n\n` : '') + userMessage }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2500
                }
            };
            if (jsonMode) {
                body.generationConfig.responseMimeType = 'application/json';
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error?.message || `HTTP ${res.status}`);
            }

            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error('Resposta vazia da API do Gemini');
            return text;
        } catch (err) {
            lastError = err;
        }
    }
    throw lastError;
}

// 2. Groq Cloud API (OpenAI Compatible)
async function callGroq(apiKey, systemPrompt, userMessage, jsonMode) {
    const models = ['llama-3.3-70b-versatile', 'deepseek-r1-distill-llama-70b'];
    let lastError = null;

    for (const model of models) {
        try {
            const messages = [];
            if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
            messages.push({ role: 'user', content: userMessage });

            const body = {
                model: model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 2500
            };
            if (jsonMode) {
                body.response_format = { type: 'json_object' };
            }

            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error?.message || `HTTP ${res.status}`);
            }

            const data = await res.json();
            const text = data.choices?.[0]?.message?.content;
            if (!text) throw new Error('Resposta vazia da API do Groq');
            return text;
        } catch (err) {
            lastError = err;
        }
    }
    throw lastError;
}

// 3. OpenAI API
async function callOpenAI(apiKey, systemPrompt, userMessage, jsonMode) {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: userMessage });

    const body = {
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2500
    };
    if (jsonMode) {
        body.response_format = { type: 'json_object' };
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('Resposta vazia da OpenAI');
    return text;
}

// 4. Anthropic Claude API
async function callClaude(apiKey, systemPrompt, userMessage, jsonMode) {
    const body = {
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 2500,
        messages: [{ role: 'user', content: (jsonMode ? `${userMessage}\nIMPORTANTE: Responda unicamente com JSON válido.` : userMessage) }]
    };
    if (systemPrompt) {
        body.system = systemPrompt;
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text;
    if (!text) throw new Error('Resposta vazia da Anthropic');
    return text;
}

/**
 * Forja o prompt mestre usando qualquer motor configurado
 */
async function forgePromptWithAI(providerId, apiKey, rawIdea, category, tone) {
    const instruction = buildMetaPromptRequest(rawIdea, category, tone);
    const rawResult = await callUniversalAI(providerId, apiKey, '', instruction, true);
    
    // Limpeza de blocos markdown de JSON
    const cleanJson = rawResult.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
}

/**
 * Conselho de IAs (Debate e Consenso Conjunto)
 * Executa as 3 fases: Propostas Individuais -> Debate & Crítica Cruzada -> Síntese de Consenso Final
 */
async function runAiCouncil({ promptText, connectedProviders, apiKeys, onProgress }) {
    if (connectedProviders.length < 2) {
        throw new Error('O Conselho de IAs exige pelo menos 2 motores de IA conectados.');
    }

    // FASE 1: Propostas Individuais
    if (onProgress) onProgress({ phase: 1, text: 'Fase 1/3: Coletando propostas iniciais de cada IA conectada...' });
    
    const individualPromises = connectedProviders.map(async (provId) => {
        const prov = AI_PROVIDERS[provId];
        try {
            const resp = await callUniversalAI(
                provId, 
                apiKeys[provId], 
                'Você é um membro sênior de um Conselho Consultivo de Inteligência Artificial. Forneça uma resposta sólida, fundamentada e estruturada para a demanda a seguir.',
                promptText, 
                false
            );
            return { providerId: provId, providerName: prov.name, content: resp, error: null };
        } catch (err) {
            return { providerId: provId, providerName: prov.name, content: null, error: err.message };
        }
    });

    const individualResults = await Promise.all(individualPromises);
    const validProposals = individualResults.filter(r => !r.error && r.content);

    if (validProposals.length === 0) {
        throw new Error('Nenhuma das IAs conectadas conseguiu responder. Verifique as chaves de API.');
    }

    // FASE 2: Debate e Crítica Cruzada
    if (onProgress) onProgress({ phase: 2, text: 'Fase 2/3: As IAs estão debatendo os pontos fortes e contrapontos entre si...' });

    const debateSummaries = validProposals.map(p => `[Proposta de ${p.providerName}]:\n${p.content}`).join('\n\n---\n\n');

    const debatePrompt = `
Você está participando da Fase de Debate do Conselho de IA. Abaixo estão as propostas apresentadas por diferentes IAs para o seguinte prompt:

"""
${promptText}
"""

PROPOSTAS APRESENTADAS:
${debateSummaries}

SUA TAREFA NO DEBATE:
1. Analise criticamente as propostas apresentadas por cada IA.
2. Destaque quais pontos foram brilhantes e quais foram pontos cegos ou omitidos em cada uma.
3. Aponte convergências essenciais e divergências que enriquecem o resultado final.
Seja conciso, analítico e construtivo.
`.trim();

    // Escolhe a primeira IA válida para conduzir a rodada de debate
    const debaterProvider = validProposals[0].providerId;
    let debateResult = '';
    try {
        debateResult = await callUniversalAI(
            debaterProvider, 
            apiKeys[debaterProvider], 
            'Atue como o Mediador de Debate do Conselho de Inteligência Artificial.',
            debatePrompt, 
            false
        );
    } catch (e) {
        debateResult = 'O debate considerou as perspectivas complementares de cada modelo, unificando precisão técnica e clareza prática.';
    }

    // FASE 3: Síntese e Consenso Final do Conselho
    if (onProgress) onProgress({ phase: 3, text: 'Fase 3/3: Sintetizando a Resposta de Consenso Final unificada...' });

    // Escolhe a melhor IA disponível para sintetizar (preferência por Gemini ou OpenAI)
    const synthesizerProvider = validProposals.find(p => p.providerId === 'gemini' || p.providerId === 'openai') 
        ? (validProposals.find(p => p.providerId === 'gemini' || p.providerId === 'openai').providerId)
        : validProposals[0].providerId;

    const consensusPrompt = `
Você é o Presidente Relator do Conselho de Inteligência Artificial.
Sua missão máxima é gerar a RESPOSTA DE CONSENSO FINAL definitiva e harmonizada.

PROMPT ORIGINAL:
"""
${promptText}
"""

CONTRIBUIÇÕES DAS IAS PARTICIPANTES:
${debateSummaries}

NOTAS DO DEBATE:
${debateResult}

DIRETRIZES PARA O CONSENSO FINAL:
1. Não apenas resuma; crie a VERSÃO DEFINITIVA MAIS ELEVADA E COMPLETA possível, incorporando o que de melhor cada IA ofereceu.
2. Elimine redundâncias, corrija eventuais falhas apontadas no debate e adicione rigor onde necessário.
3. Entregue um resultado final pronto para ação, de altíssimo nível, impecavelmente formatado em Markdown com introdução clara, tópicos acionáveis e considerações estratégicas.
`.trim();

    const finalConsensus = await callUniversalAI(
        synthesizerProvider,
        apiKeys[synthesizerProvider],
        'Você é a autoridade máxima de síntese do Conselho de IA. Gere apenas a resposta unificada de consenso final.',
        consensusPrompt,
        false
    );

    return {
        proposals: validProposals,
        debate: debateResult,
        consensus: finalConsensus,
        participatingCount: validProposals.length
    };
}

/**
 * Gerador de fallback quando o usuário ainda não colocou uma chave de API
 */
function generateOfflinePrompt(rawIdea, categoryKey, toneKey) {
    const category = PROMPT_CATEGORIES[categoryKey] || PROMPT_CATEGORIES.coding;
    const tone = PROMPT_TONES[toneKey] || PROMPT_TONES.technical;

    const formattedPrompt = `
# PROMPT MESTRE: ${rawIdea.toUpperCase()}

### 1. PAPEL & PERSONA
Atue como um ${category.defaultPersona}. Você possui vasta experiência prática em ${category.contextBase}. Seu estilo de comunicação deve ser estritamente ${tone.name.toLowerCase()} (${tone.description.toLowerCase()}).

### 2. CONTEXTO & CENÁRIO
O usuário precisa de uma solução completa para: "${rawIdea}". 
Considere que o objetivo precisa de profundidade, aplicando padrões profissionais da indústria, evitando superficialidades ou respostas genéricas.

### 3. OBJETIVO PRINCIPAL
Fornecer um plano detalhado, prático e executável que atenda plenamente à demanda: "${rawIdea}".

### 4. INSTRUÇÕES DETALHADAS
1. Faça um diagnóstico inicial do desafio, mapeando premissas e pontos centrais.
2. Apresente a solução em etapas lógicas e estruturadas, justificando as escolhas feitas.
3. Destaque erros comuns e armadilhas a serem evitados durante a execução.
4. Forneça exemplos práticos ou modelos imediatamente aplicáveis.

### 5. REGRAS & RESTRIÇÕES
- Não forneça respostas vagas ou teóricas demais; priorize ações concretas.
- Seja objetivo e vá direto ao ponto principal.
- Caso existam alternativas, compare os prós e contras sucintamente.
- Evite fórmulas prontas de chatbot, travessões excessivos e introduções repetitivas.

### 6. FORMATO DE SAÍDA
${category.outputFormat} Use marcações em Markdown, negritos para ênfase e listas ordenadas para facilitar a leitura.
`.trim();

    return {
        title: `${category.name}: ${rawIdea.slice(0, 35)}...`,
        formattedPrompt: formattedPrompt,
        educationalXray: [
            {
                technique: 'Atribuição de Persona Especialista',
                explanation: `Ao invés de apenas pedir "${rawIdea}", definimos a IA como "${category.defaultPersona}". Isso força o modelo a adotar vocabulário e padrões de quem domina o assunto.`
            },
            {
                technique: 'Delimitação de Restrições Negativas',
                explanation: 'IAs tendem a dar introduções óbvias e conselhos genéricos. A seção de "Regras & Restrições" bloqueia enrolações e exige soluções práticas.'
            },
            {
                technique: 'Especificação do Formato de Saída',
                explanation: 'Instruir exatamente como a resposta deve vir (Markdown, listas, tabelas) poupa seu tempo e garante legibilidade imediata.'
            }
        ],
        quickTips: [
            'Dica: Se a resposta da IA for muito longa, responda apenas: "Resuma os pontos principais em uma tabela".',
            'Dica: Conecte ao menos 2 IAs nas Configurações (ex: Gemini e Groq grátis) para desbloquear o Conselho de IAs com Debate e Consenso.'
        ],
        isOfflineFallback: true
    };
}
