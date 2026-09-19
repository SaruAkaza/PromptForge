/**
 * PromptForge - Engine de Meta-Prompting & Engenharia de Prompts
 * Transforma frases simples em prompts profissionais contextualizados e gera o Raio-X Educativo.
 */

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
        description: 'Riguroso, técnico, aprofundado e sem superficialidades'
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
    }
};

/**
 * Cria a instrução do Meta-Prompt para a API do Gemini gerar o prompt expandido + análise educativa em JSON.
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
3. Gerar um RAIO-X EDUCATIVO explicando ao usuário exatamente por que esse prompt é muito melhor do que a frase simples dele e quais técnicas foram aplicadas.

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
 * Gerador de fallback quando o usuário ainda não colocou uma chave de API,
 * garantindo que o aplicativo funcione e seja testável imediatamente de forma offline!
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
1. Faça um diagnóstico inicial do desafio, mapeando premissas e variáveis cruciais.
2. Apresente a solução em etapas lógicas e estruturadas, justificando as escolhas feitas.
3. Destaque erros comuns e armadilhas a serem evitados durante a execução.
4. Forneça exemplos práticos ou modelos imediatamente aplicáveis.

### 5. REGRAS & RESTRIÇÕES
- Não forneça respostas vagas ou teóricas demais; priorize ações concretas.
- Seja objetivo e vá direto ao cerne da questão.
- Caso existam alternativas, compare os prós e contras sucintamente.

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
            'Dica: Se a resposta da IA for muito longa, responda apenas: "Resuma os 3 pontos mais cruciais em uma tabela".',
            'Dica: Adicione sua própria chave de API gratuita do Gemini nas Configurações para obter expansões hiperpersonalizadas geradas pelo modelo Flash!'
        ],
        isOfflineFallback: true
    };
}
