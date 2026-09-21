/**
 * PromptForge - Engine Multi-Motor de Meta-Prompting & Conselho de IAs
 * Suporta Google Gemini, Groq, OpenAI, Anthropic Claude e OpenRouter,
 * com auto-detecção de modelos da conta (Pro/Flash/Previews) e suporte a IDs customizados.
 */

const AI_PROVIDERS = {
    gemini: {
        id: 'gemini',
        name: 'Google Gemini',
        defaultModel: 'gemini-2.0-flash',
        topCuttingEdgeModel: 'gemini-2.0-flash',
        keyStorageKey: 'promptforge_key_gemini',
        modelStorageKey: 'promptforge_model_gemini',
        docsUrl: 'https://aistudio.google.com/app/apikey',
        canDiscoverModels: true,
        predefinedModels: [
            { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Mais recente / Recomendado)', isPro: false },
            { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Alta profundidade / Raciocínio)', isPro: true },
            { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Rápido e estável)', isPro: false },
            { id: 'gemini-2.0-flash-thinking-exp-01-21', name: 'Gemini 2.0 Flash Thinking (Raciocínio experimental)', isPro: true },
            { id: 'gemini-3.8-preview', name: 'Gemini 3.8 Preview (Preview / Se ativo na conta)', isPro: true }
        ]
    },
    groq: {
        id: 'groq',
        name: 'Groq',
        defaultModel: 'llama-3.3-70b-versatile',
        topCuttingEdgeModel: 'llama-3.3-70b-versatile',
        keyStorageKey: 'promptforge_key_groq',
        modelStorageKey: 'promptforge_model_groq',
        docsUrl: 'https://console.groq.com/keys',
        canDiscoverModels: true,
        predefinedModels: [
            { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (Topo de linha / 128k)', isPro: true },
            { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill 70B (Raciocínio avançado)', isPro: true },
            { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant (Ultra-rápido)', isPro: false },
            { id: 'gemma2-9b-it', name: 'Gemma 2 9B Instruct', isPro: false }
        ]
    },
    openai: {
        id: 'openai',
        name: 'OpenAI',
        defaultModel: 'gpt-4o',
        topCuttingEdgeModel: 'o3-mini',
        keyStorageKey: 'promptforge_key_openai',
        modelStorageKey: 'promptforge_model_openai',
        docsUrl: 'https://platform.openai.com/api-keys',
        canDiscoverModels: true,
        predefinedModels: [
            { id: 'o3-mini', name: 'o3-mini (Raciocínio mais recente)', isPro: true },
            { id: 'o1', name: 'o1 (Raciocínio profundo)', isPro: true },
            { id: 'gpt-4o', name: 'GPT-4o (Topo de linha multimodal)', isPro: true },
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Rápido e econômico)', isPro: false },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', isPro: true }
        ]
    },
    claude: {
        id: 'claude',
        name: 'Anthropic Claude',
        defaultModel: 'claude-3-7-sonnet',
        topCuttingEdgeModel: 'claude-3-7-sonnet',
        keyStorageKey: 'promptforge_key_claude',
        modelStorageKey: 'promptforge_model_claude',
        docsUrl: 'https://console.anthropic.com/settings/keys',
        canDiscoverModels: false,
        predefinedModels: [
            { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet (Mais recente / Raciocínio híbrido)', isPro: true },
            { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet v2', isPro: true },
            { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (Rápido)', isPro: false },
            { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus (Alta profundidade)', isPro: true }
        ]
    },
    openrouter: {
        id: 'openrouter',
        name: 'OpenRouter',
        defaultModel: 'anthropic/claude-3.7-sonnet',
        topCuttingEdgeModel: 'anthropic/claude-3.7-sonnet',
        keyStorageKey: 'promptforge_key_openrouter',
        modelStorageKey: 'promptforge_model_openrouter',
        docsUrl: 'https://openrouter.ai/keys',
        canDiscoverModels: true,
        predefinedModels: [
            { id: 'anthropic/claude-3.7-sonnet', name: 'Claude 3.7 Sonnet (OpenRouter)', isPro: true },
            { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (OpenRouter)', isPro: true },
            { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash (OpenRouter)', isPro: false },
            { id: 'openai/gpt-4o', name: 'GPT-4o (OpenRouter)', isPro: true },
            { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (OpenRouter)', isPro: true }
        ]
    }
};

const PROMPT_CATEGORIES = {
    coding: {
        id: 'coding',
        name: 'Programação e tecnologia',
        icon: 'code-2',
        defaultPersona: 'Desenvolvedor sênior e arquiteto de software',
        contextBase: 'desenvolvimento de soluções robustas, código limpo, boas práticas, tratamento de erros e performance.',
        outputFormat: 'Código comentado, explicação da lógica, instruções de execução e considerações de segurança.'
    },
    writing: {
        id: 'writing',
        name: 'Redação e conteúdo',
        icon: 'pen-tool',
        defaultPersona: 'Redator editorial e estrategista de comunicação',
        contextBase: 'criação de textos de alto impacto, retenção de atenção, clareza editorial e persuasão ética.',
        outputFormat: 'Estrutura clara com introdução atrativa, desenvolvimento consistente, conclusão pontual e orientações práticas.'
    },
    business: {
        id: 'business',
        name: 'Negócios e estratégia',
        icon: 'briefcase',
        defaultPersona: 'Consultor de negócios e estratégia operacional',
        contextBase: 'tomada de decisão orientada a resultados, visão de mercado, mitigação de riscos e impacto no negócio.',
        outputFormat: 'Sumário executivo, análise com pontos fortes e desafios, plano acionável e métricas de acompanhamento.'
    },
    study: {
        id: 'study',
        name: 'Estudo e conhecimento',
        icon: 'graduation-cap',
        defaultPersona: 'Professor e tutor especialista',
        contextBase: 'pedagogia ativa, simplificação de conceitos complexos através de analogias e metodologia Feynman.',
        outputFormat: 'Conceito essencial simplificado, analogia prática do dia a dia, passo a passo e exercícios para fixação.'
    },
    productivity: {
        id: 'productivity',
        name: 'Produtividade e rotina',
        icon: 'check-circle-2',
        defaultPersona: 'Especialista em organização e eficiência operacional',
        contextBase: 'otimização de rotinas, clareza mental, priorização ágil e redução de atrito em tarefas.',
        outputFormat: 'Checklist ordenado por prioridade, estimativa de tempo para cada etapa e recomendações contra dispersão.'
    }
};

const PROMPT_TONES = {
    technical: {
        id: 'technical',
        name: 'Especialista técnico',
        description: 'Aprofundado, preciso e sem superficialidades'
    },
    didactic: {
        id: 'didactic',
        name: 'Didático e detalhado',
        description: 'Paciente, com analogias claras e passo a passo acessível'
    },
    concise: {
        id: 'concise',
        name: 'Direto e objetivo',
        description: 'Sem enrolação, focado em respostas práticas e listas acionáveis'
    },
    creative: {
        id: 'creative',
        name: 'Criativo e inovador',
        description: 'Pensamento fora da caixa, engajante e inspirador'
    },
    human: {
        id: 'human',
        name: 'Humano e natural (Anti-IA)',
        description: 'Voz autêntica, sem clichês de IA, sem travessões e com ritmo variado'
    }
};

/**
 * Monta as instruções de engenharia do prompt mestre
 */
function buildMetaPromptRequest(rawIdea, categoryKey, toneKey) {
    const category = PROMPT_CATEGORIES[categoryKey] || PROMPT_CATEGORIES.coding;
    const tone = PROMPT_TONES[toneKey] || PROMPT_TONES.technical;

    return `
Você é um especialista em engenharia de prompts e seu trabalho é pegar uma ideia simples de um usuário e transformá-la em um PROMPT MESTRE DE ALTO DESEMPENHO, além de orientar o usuário sobre as técnicas aplicadas.

Ideia fornecida pelo usuário:
"${rawIdea}"

Categoria selecionada: ${category.name}
Tom de voz pretendido: ${tone.name} (${tone.description})

Seu objetivo:
1. Analisar a ideia bruta e preencher as lacunas de contexto necessárias para uma boa execução.
2. Criar um prompt profissional estruturado nos seguintes blocos:
   - [PAPEL & PERSONA]: Especialidade e ponto de vista que a IA deve adotar.
   - [CONTEXTO & CENÁRIO]: Situação real, público final e premissas do problema.
   - [OBJETIVO PRINCIPAL]: A meta clara a ser alcançada.
   - [ROTEIRO POR ETAPAS]: O que deve ser resolvido em sequência lógica.
   - [O QUE EVITAR & RESTRIÇÕES]: O que não deve entrar no texto (respostas genéricas, rodeios ou termos vagos).
   - [FORMATO DE ENTREGA]: Formato exato da resposta (Markdown, tópicos, tabela ou código).
3. Aplicar diretrizes da Skill Humanizer (Linguagem Humana & Anti-Clichês de IA):
   - Proibir travessões (—) usados como conectores universais.
   - Proibir a estrutura de contraste vazia "não apenas X, mas também Y" ou "não é X, é Y".
   - Evitar termos robóticos e clichês de chatbot como "crucial", "robusto", "mergulhar", "paisagem", "testemunho", "no cerne".
   - Variar naturalmente o tamanho das frases.
   - Eliminar introduções e conclusões óbvias de chatbot ("com certeza!", "espero ter ajudado!").
4. Gerar NOTAS DE ENGENHARIA explicando ao usuário as técnicas utilizadas no prompt.

Responda ESTRITAMENTE em formato JSON com o seguinte schema (não adicione texto fora do JSON):
{
  "title": "Um título descritivo e claro para este prompt",
  "formattedPrompt": "Texto completo do prompt mestre formatado em Markdown",
  "educationalXray": [
    {
      "technique": "Nome da técnica aplicada (ex: Atribuição de papel / Delimitação de restrições / Roteiro lógico)",
      "explanation": "Explicação prática de como essa técnica torna a resposta da IA precisa e útil."
    }
  ],
  "quickTips": [
    "Dica prática 1 para o usuário interagir melhor com este prompt",
    "Dica prática 2"
  ]
}
`.trim();
}

/**
 * Descoberta e Listagem Automática de Modelos por Chave de API
 * Consulta a API da conta e classifica os modelos priorizando versões Pro e topo de linha.
 */
async function fetchAvailableModels(providerId, apiKey) {
    if (!apiKey) return (AI_PROVIDERS[providerId]?.predefinedModels || []);

    try {
        if (providerId === 'gemini') {
            let apiModels = [];
            try {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
                if (res.ok) {
                    const data = await res.json();
                    apiModels = (data.models || [])
                        .filter(m => {
                            const id = (m.name || '').replace('models/', '').toLowerCase();
                            const methods = m.supportedGenerationMethods || [];
                            const isTextGen = methods.includes('generateContent');
                            const isExcluded = id.includes('embedding') || id.includes('aqa') || id.includes('imagen') || id.includes('bison') || id.includes('learnlm');
                            return isTextGen && !isExcluded;
                        })
                        .map(m => {
                            const id = m.name.replace('models/', '');
                            const isPro = id.includes('pro') || id.includes('ultra') || id.includes('3.') || id.includes('thinking');
                            let prettyName = m.displayName || id;
                            if (id === 'gemini-3.8-preview') prettyName = 'Gemini 3.8 Preview (Mais recente / Pro)';
                            else if (id === 'gemini-2.5-pro') prettyName = 'Gemini 2.5 Pro (Raciocínio avançado)';
                            else if (id === 'gemini-2.5-flash') prettyName = 'Gemini 2.5 Flash (Rápido e versátil)';
                            else if (id === 'gemini-2.0-flash-thinking-exp') prettyName = 'Gemini 2.0 Flash Thinking (Raciocínio)';
                            return { id, name: prettyName, isPro };
                        });
                }
            } catch (e) {
                console.warn('Erro ao consultar API de modelos Gemini:', e.message);
            }

            // Mescla com modelos predefinidos garantindo que versões topo de linha estejam sempre disponíveis
            const combined = [...(AI_PROVIDERS.gemini.predefinedModels || [])];
            apiModels.forEach(m => {
                const existingIdx = combined.findIndex(c => c.id === m.id);
                if (existingIdx === -1) {
                    combined.push(m);
                } else if (m.name && !combined[existingIdx].name.includes('(')) {
                    combined[existingIdx].name = m.name;
                }
            });

            // Ordena colocando modelos mais recentes e Pro no topo
            combined.sort((a, b) => {
                const rank = (id) => {
                    if (id.includes('3.8')) return 100;
                    if (id.includes('2.5-pro')) return 90;
                    if (id.includes('2.5-flash')) return 80;
                    if (id.includes('thinking')) return 75;
                    if (id.includes('2.0-flash')) return 70;
                    if (id.includes('1.5-pro')) return 60;
                    if (id.includes('1.5-flash')) return 50;
                    return 10;
                };
                return rank(b.id) - rank(a.id);
            });

            return combined;
        }

        if (providerId === 'groq') {
            let apiModels = [];
            try {
                const res = await fetch('https://api.groq.com/openai/v1/models', {
                    headers: { 'Authorization': `Bearer ${apiKey}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    apiModels = (data.data || [])
                        .filter(m => {
                            const id = m.id.toLowerCase();
                            return !id.includes('whisper') && !id.includes('guard') && !id.includes('audio');
                        })
                        .map(m => ({
                            id: m.id,
                            name: m.id.includes('llama-3.3-70b') ? 'Llama 3.3 70B Versatile (Topo de linha)' :
                                  m.id.includes('r1') ? 'DeepSeek R1 Distill 70B (Raciocínio)' :
                                  m.id.includes('llama-3.1-8b') ? 'Llama 3.1 8B Instant (Rápido)' : m.id,
                            isPro: m.id.includes('70b') || m.id.includes('r1')
                        }));
                }
            } catch (e) {
                console.warn('Erro ao consultar API de modelos Groq:', e.message);
            }

            const combined = [...(AI_PROVIDERS.groq.predefinedModels || [])];
            apiModels.forEach(m => {
                if (!combined.some(c => c.id === m.id)) {
                    combined.push(m);
                }
            });

            combined.sort((a, b) => {
                if (a.isPro && !b.isPro) return -1;
                if (!a.isPro && b.isPro) return 1;
                return a.id.localeCompare(b.id);
            });

            return combined;
        }

        if (providerId === 'openai') {
            let apiModels = [];
            try {
                const res = await fetch('https://api.openai.com/v1/models', {
                    headers: { 'Authorization': `Bearer ${apiKey}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    apiModels = (data.data || [])
                        .filter(m => {
                            const id = m.id.toLowerCase();
                            const isModern = id.startsWith('gpt-4') || id.startsWith('o1') || id.startsWith('o3');
                            const isExcluded = id.includes('realtime') || id.includes('audio') || id.includes('tts') || id.includes('whisper') || id.includes('dall-e') || id.includes('embedding');
                            return isModern && !isExcluded;
                        })
                        .map(m => ({
                            id: m.id,
                            name: m.id === 'o3-mini' ? 'o3-mini (Raciocínio mais recente)' :
                                  m.id === 'o1' ? 'o1 (Raciocínio profundo)' :
                                  m.id === 'gpt-4o' ? 'GPT-4o (Topo de linha)' :
                                  m.id === 'gpt-4o-mini' ? 'GPT-4o Mini (Econômico)' : m.id,
                            isPro: m.id.startsWith('o') || m.id === 'gpt-4o' || m.id === 'gpt-4-turbo'
                        }));
                }
            } catch (e) {
                console.warn('Erro ao consultar API de modelos OpenAI:', e.message);
            }

            const combined = [...(AI_PROVIDERS.openai.predefinedModels || [])];
            apiModels.forEach(m => {
                if (!combined.some(c => c.id === m.id)) {
                    combined.push(m);
                }
            });

            combined.sort((a, b) => {
                const rank = (id) => {
                    if (id === 'o3-mini') return 100;
                    if (id === 'o1') return 95;
                    if (id === 'gpt-4o') return 90;
                    if (id === 'gpt-4o-mini') return 80;
                    if (id.startsWith('o1-')) return 75;
                    if (id.startsWith('gpt-4-')) return 70;
                    return 30;
                };
                return rank(b.id) - rank(a.id);
            });

            return combined;
        }

        if (providerId === 'openrouter') {
            let apiModels = [];
            try {
                const res = await fetch('https://openrouter.ai/api/v1/models', {
                    headers: { 'Authorization': `Bearer ${apiKey}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    apiModels = (data.data || [])
                        .filter(m => {
                            const id = m.id.toLowerCase();
                            return !id.includes('embed') && !id.includes('whisper') && !id.includes('moderation');
                        })
                        .map(m => ({
                            id: m.id,
                            name: m.name || m.id,
                            isPro: m.id.includes('pro') || m.id.includes('sonnet') || m.id.includes('r1') || m.id.includes('o1') || m.id.includes('o3')
                        }));
                }
            } catch (e) {
                console.warn('Erro ao consultar API de modelos OpenRouter:', e.message);
            }

            const combined = [...(AI_PROVIDERS.openrouter.predefinedModels || [])];
            apiModels.forEach(m => {
                if (!combined.some(c => c.id === m.id)) {
                    combined.push(m);
                }
            });

            combined.sort((a, b) => {
                if (a.isPro && !b.isPro) return -1;
                if (!a.isPro && b.isPro) return 1;
                return a.id.localeCompare(b.id);
            });

            return combined.slice(0, 40);
        }

        if (providerId === 'claude') {
            return AI_PROVIDERS.claude.predefinedModels;
        }

        return [];
    } catch (err) {
        console.warn(`Não foi possível listar modelos de ${providerId}:`, err.message);
        return [];
    }
}

/**
 * Cliente Universal de IA com suporte a modelo dinâmico ou customizado
 */
async function callUniversalAI(providerId, apiKey, systemPrompt, userMessage, jsonMode = false, overrideModel = null) {
    if (providerId === 'gemini') {
        return callGemini(apiKey, systemPrompt, userMessage, jsonMode, overrideModel);
    } else if (providerId === 'groq') {
        return callGroq(apiKey, systemPrompt, userMessage, jsonMode, overrideModel);
    } else if (providerId === 'openai') {
        return callOpenAI(apiKey, systemPrompt, userMessage, jsonMode, overrideModel);
    } else if (providerId === 'claude') {
        return callClaude(apiKey, systemPrompt, userMessage, jsonMode, overrideModel);
    } else if (providerId === 'openrouter') {
        return callOpenRouter(apiKey, systemPrompt, userMessage, jsonMode, overrideModel);
    } else {
        throw new Error(`Provedor desconhecido: ${providerId}`);
    }
}

// 1. Google Gemini
async function callGemini(apiKey, systemPrompt, userMessage, jsonMode, modelId) {
    const rawTarget = (modelId || AI_PROVIDERS.gemini.defaultModel).trim();
    // Fallback prioritário: se o modelo configurado falhar (ex: 404 para previews ou versões experimentais não liberadas na conta),
    // tenta imediatamente os modelos estáveis e oficiais da Google AI Studio
    const fallbackList = [
        rawTarget,
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro'
    ];
    const tried = new Set();
    let lastError = null;

    for (const model of fallbackList) {
        if (tried.has(model)) continue;
        tried.add(model);

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
                const errMsg = errData.error?.message || `HTTP ${res.status}`;
                if (errMsg.includes('API key not valid') || errMsg.includes('API_KEY_INVALID') || res.status === 400 && errMsg.includes('API key')) {
                    throw new Error(`Chave do Google Gemini inválida: ${errMsg}`);
                }
                if (res.status === 403) {
                    throw new Error(`Acesso negado no Google Gemini (verifique permissões da chave ou cota): ${errMsg}`);
                }
                throw new Error(`Modelo ${model}: ${errMsg}`);
            }

            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error(`Resposta vazia do Gemini no modelo ${model}`);
            return text;
        } catch (err) {
            lastError = err;
            if (err.message.includes('inválida') || err.message.includes('Acesso negado')) {
                throw err;
            }
        }
    }
    throw lastError;
}

// 2. Groq
async function callGroq(apiKey, systemPrompt, userMessage, jsonMode, modelId) {
    const targetModel = modelId || AI_PROVIDERS.groq.defaultModel;
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: userMessage });

    const body = {
        model: targetModel,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2500
    };
    if (jsonMode) body.response_format = { type: 'json_object' };

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
    if (!text) throw new Error('Resposta vazia do Groq');
    return text;
}

// 3. OpenAI
async function callOpenAI(apiKey, systemPrompt, userMessage, jsonMode, modelId) {
    const targetModel = modelId || AI_PROVIDERS.openai.defaultModel;
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: userMessage });

    const body = {
        model: targetModel,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2500
    };
    if (jsonMode) body.response_format = { type: 'json_object' };

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

// 4. Anthropic Claude
async function callClaude(apiKey, systemPrompt, userMessage, jsonMode, modelId) {
    const targetModel = modelId || AI_PROVIDERS.claude.defaultModel;
    const body = {
        model: targetModel,
        max_tokens: 2500,
        messages: [{ role: 'user', content: (jsonMode ? `${userMessage}\nIMPORTANTE: Responda apenas com JSON válido.` : userMessage) }]
    };
    if (systemPrompt) body.system = systemPrompt;

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

// 5. OpenRouter (Hub Universal de Modelos)
async function callOpenRouter(apiKey, systemPrompt, userMessage, jsonMode, modelId) {
    // 1. Limpeza de prefixos acidentais (ex: til ~ gerado por teclado ABNT2 ou barras extras)
    let cleanModel = (modelId || AI_PROVIDERS.openrouter.defaultModel)
        .replace(/^[~/\s]+/, '')
        .trim();

    // 2. Normalização de aliases comuns para IDs oficiais da OpenRouter
    if (cleanModel.includes('claude-sonnet-latest') || cleanModel.includes('claude-3-7') || cleanModel === 'anthropic/claude-sonnet') {
        cleanModel = 'anthropic/claude-3.7-sonnet';
    } else if (cleanModel.includes('claude-3-5-sonnet') || cleanModel === 'claude-3.5-sonnet') {
        cleanModel = 'anthropic/claude-3.5-sonnet';
    } else if (cleanModel.includes('gemini-2') || cleanModel.includes('gemini-2.5')) {
        cleanModel = 'google/gemini-2.0-flash-001';
    } else if (cleanModel.includes('gpt-4o')) {
        cleanModel = 'openai/gpt-4o';
    }

    const fallbackList = [
        cleanModel,
        'anthropic/claude-3.7-sonnet',
        'anthropic/claude-3.5-sonnet',
        'google/gemini-2.0-flash-001',
        'openai/gpt-4o-mini'
    ];

    const tried = new Set();
    let lastError = null;

    for (const model of fallbackList) {
        if (tried.has(model)) continue;
        tried.add(model);

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
            if (jsonMode) body.response_format = { type: 'json_object' };

            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://promptforge.local',
                    'X-Title': 'PromptForge'
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                const errMsg = errData.error?.message || `HTTP ${res.status}`;
                if (res.status === 401 || errMsg.includes('auth') || errMsg.includes('key')) {
                    throw new Error(`Chave do OpenRouter inválida ou não autorizada (${errMsg})`);
                }
                if (res.status === 402 || errMsg.includes('credit')) {
                    throw new Error(`OpenRouter sem créditos disponíveis (${errMsg})`);
                }
                throw new Error(`Modelo ${model}: ${errMsg}`);
            }

            const data = await res.json();
            const text = data.choices?.[0]?.message?.content;
            if (!text) throw new Error(`Resposta vazia do OpenRouter no modelo ${model}`);
            return text;
        } catch (err) {
            lastError = err;
            if (err.message.includes('inválida') || err.message.includes('sem créditos')) {
                throw err;
            }
        }
    }
    throw lastError;
}

/**
 * Forja o prompt mestre usando o motor e modelo ativo
 */
async function forgePromptWithAI(providerId, apiKey, rawIdea, category, tone, modelId = null) {
    const instruction = buildMetaPromptRequest(rawIdea, category, tone);
    const rawResult = await callUniversalAI(providerId, apiKey, '', instruction, true, modelId);
    const cleanJson = rawResult.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
}

/**
 * Determina o modelo mais recente / topo de linha para o debate conjunto
 */
function resolveCuttingEdgeModel(provId, configuredModels = {}, discoveredModels = {}) {
    // 1. Se o usuário configurou um modelo customizado específico ou escolheu um Pro, usa ele (com sanitização)
    if (configuredModels[provId]) {
        let m = configuredModels[provId].replace(/^[~/\s]+/, '').trim();
        if (provId === 'openrouter' && (m.includes('claude-sonnet-latest') || m === 'anthropic/claude-sonnet')) {
            return 'anthropic/claude-3.7-sonnet';
        }
        return m;
    }

    // 2. Se a conta auto-detectou modelos autorizados, busca a melhor versão Pro / raciocínio
    const discovered = discoveredModels[provId] || [];
    const proModel = discovered.find(m => m.isPro);
    if (proModel) return proModel.id;

    // 3. Recorre ao modelo de ponta padrão definido
    const prov = AI_PROVIDERS[provId];
    return prov?.topCuttingEdgeModel || prov?.defaultModel;
}

/**
 * Executa a Mesa de Revisão e Consenso
 */
async function runAiCouncil({ promptText, connectedProviders, apiKeys, configuredModels = {}, discoveredModels = {}, onProgress }) {
    if (connectedProviders.length < 2) {
        throw new Error('A Mesa de Revisão requer ao menos 2 modelos conectados.');
    }

    // ETAPA 1: Propostas Individuais
    if (onProgress) onProgress({ phase: 1, text: 'Etapa 1 de 3: Coletando propostas independentes com os modelos mais atuais...' });
    
    const individualPromises = connectedProviders.map(async (provId) => {
        const prov = AI_PROVIDERS[provId];
        const modelToUse = resolveCuttingEdgeModel(provId, configuredModels, discoveredModels);
        try {
            const resp = await callUniversalAI(
                provId, 
                apiKeys[provId], 
                'Você participa de uma mesa técnica de redação e estratégia. Forneça uma resposta sólida e estruturada para a demanda a seguir.',
                promptText, 
                false,
                modelToUse
            );
            return { 
                providerId: provId, 
                providerName: prov.name, 
                modelUsed: modelToUse, 
                content: resp, 
                error: null 
            };
        } catch (err) {
            return { 
                providerId: provId, 
                providerName: prov.name, 
                modelUsed: modelToUse, 
                content: null, 
                error: err.message 
            };
        }
    });

    const individualResults = await Promise.all(individualPromises);
    const validProposals = individualResults.filter(r => !r.error && r.content);

    if (validProposals.length === 0) {
        const errorDetails = individualResults.map(r => `${r.providerName}: ${r.error}`).join(' | ');
        const err = new Error(`Nenhum dos modelos conectados conseguiu responder. Detalhes: ${errorDetails}`);
        err.individualResults = individualResults;
        throw err;
    }

    // ETAPA 2: Confronto de abordagens e pontos complementares
    if (onProgress) onProgress({ phase: 2, text: 'Etapa 2 de 3: Confrontando abordagens e pontos complementares...' });

    const debateSummaries = validProposals.map(p => `[Proposta de ${p.providerName} (${p.modelUsed})]:\n${p.content}`).join('\n\n---\n\n');

    let debateResult = '';
    if (validProposals.length > 1) {
        const debatePrompt = `
Você atua como mediador técnico de uma mesa de revisão. Abaixo estão as respostas apresentadas por diferentes modelos para o seguinte prompt:

"""
${promptText}
"""

RESPOSTAS APRESENTADAS:
${debateSummaries}

SUA ANÁLISE:
1. Compare objetivamente as soluções.
2. Identifique pontos fortes específicos e omissões em cada abordagem.
3. Aponte convergências e pontos complementares para a síntese final.
Escreva de forma direta e sem jargões de bajulação.
`.trim();

        const debater = validProposals[0];
        try {
            debateResult = await callUniversalAI(
                debater.providerId, 
                apiKeys[debater.providerId], 
                'Atue como mediador técnico de uma mesa de revisão.',
                debatePrompt, 
                false,
                debater.modelUsed
            );
        } catch (e) {
            debateResult = 'As abordagens convergiram na solução principal, com complementos em detalhamento e regras práticas.';
        }
    } else {
        debateResult = `Apenas o modelo ${validProposals[0].providerName} respondeu com sucesso nesta sessão. Sua proposta foi aproveitada e aprofundada para o parecer final.`;
    }

    // ETAPA 3: Síntese e Parecer de Consenso
    if (onProgress) onProgress({ phase: 3, text: 'Etapa 3 de 3: Sintetizando o parecer unificado de consenso...' });

    // Prioriza Gemini Pro, OpenAI ou o modelo de maior capacidade disponível para síntese
    const synthesizer = validProposals.find(p => p.providerId === 'gemini' || p.providerId === 'openai' || p.providerId === 'openrouter') || validProposals[0];

    const consensusPrompt = `
Você é o relator responsável pelo parecer final da mesa de revisão.
Sua missão é produzir o PARECER UNIFICADO DE CONSENSO definitivo.

PROMPT ORIGINAL:
"""
${promptText}
"""

CONTRIBUIÇÕES DOS MODELOS:
${debateSummaries}

ANÁLISE COMPARATIVA:
${debateResult}

DIRETRIZES:
1. Una o que há de mais preciso em cada proposta, eliminando repetições.
2. Apresente um resultado pronto para ação, claro, bem pontuado e formatado em Markdown.
3. Não use introduções genéricas ("Com certeza!", "Aqui está"). Entregue a resposta diretamente.
`.trim();

    const finalConsensus = await callUniversalAI(
        synthesizer.providerId,
        apiKeys[synthesizer.providerId],
        'Você é o relator do parecer técnico unificado.',
        consensusPrompt,
        false,
        synthesizer.modelUsed
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
# PROMPT: ${rawIdea.toUpperCase()}

### 1. PAPEL & PERSONA
Atue como um ${category.defaultPersona}. Você possui experiência prática em ${category.contextBase}. Seu estilo de comunicação deve ser ${tone.name.toLowerCase()} (${tone.description.toLowerCase()}).

### 2. CONTEXTO & CENÁRIO
O usuário precisa de uma solução completa para: "${rawIdea}". 
Considere que o objetivo precisa de profundidade técnica e foco em aplicação prática.

### 3. OBJETIVO PRINCIPAL
Fornecer um plano detalhado, prático e executável que atenda à demanda: "${rawIdea}".

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
${category.outputFormat} Use marcações em Markdown e listas ordenadas para facilitar a leitura.
`.trim();

    return {
        title: `${category.name}: ${rawIdea.slice(0, 35)}...`,
        formattedPrompt: formattedPrompt,
        educationalXray: [
            {
                technique: 'Atribuição de papel prático',
                explanation: `Ao invés de apenas pedir "${rawIdea}", definimos a IA como "${category.defaultPersona}". Isso orienta o vocabulário e a profundidade da resposta.`
            },
            {
                technique: 'Delimitação de restrições',
                explanation: 'Modelos tendem a dar introduções óbvias. A seção de regras bloqueia enrolações e exige soluções práticas.'
            },
            {
                technique: 'Formato de entrega específico',
                explanation: 'Instruir exatamente como a resposta deve vir poupa tempo e garante leitura direta.'
            }
        ],
        quickTips: [
            'Dica: Se a resposta da IA for muito longa, responda: "Resuma os pontos principais em uma tabela".',
            'Dica: Conecte suas chaves nas Configurações para que o sistema auto-detecte os modelos Pro e avançados da sua conta.'
        ],
        isOfflineFallback: true
    };
}
