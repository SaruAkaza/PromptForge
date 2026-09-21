/**
 * PromptForge - Controlador Principal com Suporte Multi-Motor e Auto-Detecção de Modelos
 */

// Estado Global
const state = {
    apiKeys: {
        gemini: localStorage.getItem('promptforge_key_gemini') || localStorage.getItem('promptforge_gemini_api_key') || '',
        groq: localStorage.getItem('promptforge_key_groq') || '',
        openai: localStorage.getItem('promptforge_key_openai') || '',
        claude: localStorage.getItem('promptforge_key_claude') || '',
        openrouter: localStorage.getItem('promptforge_key_openrouter') || ''
    },
    configuredModels: {
        gemini: localStorage.getItem('promptforge_model_gemini') || '',
        groq: localStorage.getItem('promptforge_model_groq') || '',
        openai: localStorage.getItem('promptforge_model_openai') || '',
        claude: localStorage.getItem('promptforge_model_claude') || '',
        openrouter: localStorage.getItem('promptforge_model_openrouter') || ''
    },
    discoveredModels: {},
    selectedForgingProvider: localStorage.getItem('promptforge_selected_provider') || 'gemini',
    selectedCategory: 'coding',
    selectedTone: 'technical',
    currentPromptData: null,
    history: JSON.parse(localStorage.getItem('promptforge_history') || '[]'),
    activeHistoryTab: 'recent',
    activeMainTab: 'forger',
    activeModalProvider: 'gemini',
    isForging: false,
    isSingleTesting: false,
    isCouncilRunning: false
};

// Sanitização de modelos salvos com caracteres espúrios (como til ~ acidental) ou aliases obsoletos
Object.keys(state.configuredModels).forEach(provId => {
    const m = state.configuredModels[provId];
    if (m && typeof m === 'string') {
        const cleaned = m.replace(/^[~/\s]+/, '').trim();
        if (provId === 'openrouter' && (cleaned.includes('claude-sonnet-latest') || cleaned === 'anthropic/claude-sonnet')) {
            state.configuredModels[provId] = 'anthropic/claude-3.7-sonnet';
            const prov = AI_PROVIDERS[provId];
            if (prov) localStorage.setItem(prov.modelStorageKey, 'anthropic/claude-3.7-sonnet');
        } else if (cleaned !== m) {
            state.configuredModels[provId] = cleaned;
            const prov = AI_PROVIDERS[provId];
            if (prov) localStorage.setItem(prov.modelStorageKey, cleaned);
        }
    }
});

// Elementos DOM
const dom = {
    // Header & Navegação em Abas
    navTabForger: document.getElementById('navTabForger'),
    navTabRoundTable: document.getElementById('navTabRoundTable'),
    navConnectedBadge: document.getElementById('navConnectedBadge'),
    viewForger: document.getElementById('viewForger'),
    viewRoundTable: document.getElementById('viewRoundTable'),
    btnOpenSettings: document.getElementById('btnOpenSettings'),
    connectionsStatusText: document.getElementById('connectionsStatusText'),
    btnOpenGuide: document.getElementById('btnOpenGuide'),

    // Painel Esquerdo (Forjador)
    rawIdeaInput: document.getElementById('rawIdeaInput'),
    forgingProviderSelect: document.getElementById('forgingProviderSelect'),
    activeEngineBadge: document.getElementById('activeEngineBadge'),
    btnConfigProvKeyInline: document.getElementById('btnConfigProvKeyInline'),
    panelModelGroup: document.getElementById('panelModelGroup'),
    panelModelSelect: document.getElementById('panelModelSelect'),
    panelModelTypeTag: document.getElementById('panelModelTypeTag'),
    panelCustomModelInput: document.getElementById('panelCustomModelInput'),
    categoryContainer: document.getElementById('categoryContainer'),
    toneSelect: document.getElementById('toneSelect'),
    toneSelectWrapper: document.getElementById('toneSelectWrapper'),
    toneTooltip: document.getElementById('toneTooltip'),
    toneDescriptionCaption: document.getElementById('toneDescriptionCaption'),
    toneInfoTag: document.getElementById('toneInfoTag'),
    btnForge: document.getElementById('btnForge'),
    forgeBtnText: document.getElementById('forgeBtnText'),
    forgeIcon: document.getElementById('forgeIcon'),

    // Histórico
    historyList: document.getElementById('historyList'),
    tabRecent: document.getElementById('tabRecent'),
    tabFavs: document.getElementById('tabFavs'),

    // Painel Direito (Forjador)
    emptyState: document.getElementById('emptyState'),
    resultContent: document.getElementById('resultContent'),
    promptTitle: document.getElementById('promptTitle'),
    badgeCategory: document.getElementById('badgeCategory'),
    badgeTone: document.getElementById('badgeTone'),
    badgeEngineUsed: document.getElementById('badgeEngineUsed'),
    promptTextDisplay: document.getElementById('promptTextDisplay'),
    xrayCardsContainer: document.getElementById('xrayCardsContainer'),
    quickTipsContainer: document.getElementById('quickTipsContainer'),

    // Botões de Ação do Forjador
    btnCopyPrompt: document.getElementById('btnCopyPrompt'),
    btnDownloadPromptMd: document.getElementById('btnDownloadPromptMd'),
    btnFavCurrent: document.getElementById('btnFavCurrent'),
    favStarIcon: document.getElementById('favStarIcon'),
    btnTestSinglePrompt: document.getElementById('btnTestSinglePrompt'),
    btnSendToCouncil: document.getElementById('btnSendToCouncil'),

    // Playground & Conselho
    playgroundArea: document.getElementById('playgroundArea'),
    singleTestTitle: document.getElementById('singleTestTitle'),
    playgroundOutput: document.getElementById('playgroundOutput'),
    btnClosePlayground: document.getElementById('btnClosePlayground'),
    councilArea: document.getElementById('councilArea'),

    // Tela Exclusiva: Mesa Redonda (Debate entre IAs)
    roundTableQuestionInput: document.getElementById('roundTableQuestionInput'),
    roundTableParticipantsList: document.getElementById('roundTableParticipantsList'),
    rtParticipantCountTag: document.getElementById('rtParticipantCountTag'),
    rtNeedMoreModelsWarning: document.getElementById('rtNeedMoreModelsWarning'),
    linkOpenSettingsFromRT: document.getElementById('linkOpenSettingsFromRT'),
    btnStartRoundTable: document.getElementById('btnStartRoundTable'),
    roundTableEmptyState: document.getElementById('roundTableEmptyState'),
    roundTableResultContent: document.getElementById('roundTableResultContent'),
    rtHeaderModelCount: document.getElementById('rtHeaderModelCount'),
    btnCopyRoundTableConsensus: document.getElementById('btnCopyRoundTableConsensus'),
    btnDownloadCouncilMd: document.getElementById('btnDownloadCouncilMd'),
    btnCopyRtConsensusInline: document.getElementById('btnCopyRtConsensusInline'),
    rtStatusStepper: document.getElementById('rtStatusStepper'),
    rtSpinner: document.getElementById('rtSpinner'),
    rtStatusText: document.getElementById('rtStatusText'),
    rtProposalsGrid: document.getElementById('rtProposalsGrid'),
    rtDebateSection: document.getElementById('rtDebateSection'),
    rtDebateContent: document.getElementById('rtDebateContent'),
    rtConsensusSection: document.getElementById('rtConsensusSection'),
    rtConsensusContent: document.getElementById('rtConsensusContent'),

    // Modal de Conexões
    settingsModal: document.getElementById('settingsModal'),
    btnCloseSettings: document.getElementById('btnCloseSettings'),
    provModalLabel: document.getElementById('provModalLabel'),
    provModalStatus: document.getElementById('provModalStatus'),
    provModalInput: document.getElementById('provModalInput'),
    btnRefreshProvModels: document.getElementById('btnRefreshProvModels'),
    refreshProvIcon: document.getElementById('refreshProvIcon'),
    refreshProvText: document.getElementById('refreshProvText'),
    provModalHelp: document.getElementById('provModalHelp'),
    provModalModelSelect: document.getElementById('provModalModelSelect'),
    provModalCustomModelInput: document.getElementById('provModalCustomModelInput'),
    provModelDetectTag: document.getElementById('provModelDetectTag'),
    btnSaveProvKey: document.getElementById('btnSaveProvKey'),
    btnClearProvKey: document.getElementById('btnClearProvKey'),

    // Modal do Guia
    guideModal: document.getElementById('guideModal'),
    btnCloseGuide: document.getElementById('btnCloseGuide'),
    btnGotItGuide: document.getElementById('btnGotItGuide'),

    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initCategories();
    initTones();
    initForgingProviderSelect();
    renderPanelModelControls();
    updateConnectionsHeader();
    renderRoundTableParticipants();
    renderHistory();
    setupEventListeners();
    refreshIcons();

    // Auto-detecta modelos em background para chaves já salvas
    Object.keys(state.apiKeys).forEach(provId => {
        if (state.apiKeys[provId]) {
            loadModelsForProvider(provId, state.apiKeys[provId]);
        }
    });
});

function refreshIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Inicializa categorias
function initCategories() {
    dom.categoryContainer.innerHTML = '';
    Object.values(PROMPT_CATEGORIES).forEach(cat => {
        const chip = document.createElement('div');
        chip.className = `category-chip ${cat.id === state.selectedCategory ? 'active' : ''}`;
        chip.dataset.id = cat.id;
        chip.innerHTML = `
            <i data-lucide="${cat.icon}" style="width: 15px; height: 15px;"></i>
            <span>${cat.name}</span>
        `;
        chip.addEventListener('click', () => {
            document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            state.selectedCategory = cat.id;
        });
        dom.categoryContainer.appendChild(chip);
    });
}

// Atualiza a legenda explicativa e o balão flutuante da diretriz de tom
function updateToneDisplay(toneId) {
    const tone = PROMPT_TONES[toneId] || PROMPT_TONES.human || PROMPT_TONES.technical;
    if (dom.toneDescriptionCaption) {
        dom.toneDescriptionCaption.innerHTML = `<span style="color: var(--accent); font-weight: 600;">Diretriz ativa:</span> ${tone.description}`;
    }
    if (dom.toneTooltip) {
        dom.toneTooltip.innerHTML = `
            <div class="tone-tooltip-title">
                <i data-lucide="compass" style="width: 14px; height: 14px;"></i>
                <span>${tone.name}</span>
            </div>
            <div class="tone-tooltip-desc">${tone.description}</div>
        `;
        if (window.lucide) {
            lucide.createIcons();
        }
    }
    if (dom.toneSelect) {
        dom.toneSelect.title = tone.description;
    }
}

// Inicializa tons de voz e diretrizes de linguagem
function initTones() {
    if (!dom.toneSelect) return;
    dom.toneSelect.innerHTML = '';
    Object.values(PROMPT_TONES).forEach(tone => {
        const opt = document.createElement('option');
        opt.value = tone.id;
        opt.textContent = tone.name;
        opt.title = tone.description;
        dom.toneSelect.appendChild(opt);
    });
    dom.toneSelect.value = state.selectedTone;
    updateToneDisplay(state.selectedTone);

    dom.toneSelect.addEventListener('change', (e) => {
        state.selectedTone = e.target.value;
        updateToneDisplay(e.target.value);
    });

    if (dom.toneInfoTag && dom.toneTooltip) {
        dom.toneInfoTag.addEventListener('mouseenter', () => dom.toneTooltip.classList.add('visible'));
        dom.toneInfoTag.addEventListener('mouseleave', () => dom.toneTooltip.classList.remove('visible'));
    }
}

// Inicializa seletor do motor gerador
function initForgingProviderSelect() {
    dom.forgingProviderSelect.value = state.selectedForgingProvider;
    updateActiveEngineBadge();
    renderPanelModelControls();

    dom.forgingProviderSelect.addEventListener('change', (e) => {
        state.selectedForgingProvider = e.target.value;
        localStorage.setItem('promptforge_selected_provider', e.target.value);
        updateActiveEngineBadge();
        renderPanelModelControls();
    });
}

function updateActiveEngineBadge() {
    const provId = state.selectedForgingProvider;
    if (provId === 'offline') {
        dom.activeEngineBadge.textContent = 'Motor estrutural';
        dom.activeEngineBadge.style.color = 'var(--ink-muted)';
        return;
    }

    const prov = AI_PROVIDERS[provId];
    if (!prov) return;
    const hasKey = !!state.apiKeys[provId];
    const activeModel = state.configuredModels[provId] || prov.defaultModel;

    dom.activeEngineBadge.textContent = hasKey ? `${prov.name} (${activeModel})` : `${prov.name} (sem chave)`;
    dom.activeEngineBadge.style.color = hasKey ? 'var(--sage)' : 'var(--ink-muted)';
}

// Alternância de Abas Principais (Forjador vs Mesa Redonda)
function switchMainTab(tabName) {
    state.activeMainTab = tabName;
    if (tabName === 'forger') {
        dom.navTabForger.classList.add('active');
        dom.navTabRoundTable.classList.remove('active');
        dom.viewForger.classList.add('active');
        dom.viewForger.style.display = 'grid';
        dom.viewRoundTable.classList.remove('active');
        dom.viewRoundTable.style.display = 'none';
    } else {
        dom.navTabRoundTable.classList.add('active');
        dom.navTabForger.classList.remove('active');
        dom.viewRoundTable.classList.add('active');
        dom.viewRoundTable.style.display = 'grid';
        dom.viewForger.classList.remove('active');
        dom.viewForger.style.display = 'none';
        renderRoundTableParticipants();
    }
    refreshIcons();
}

// Renderiza o seletor de modelos de raciocínio no painel do Forjador
function renderPanelModelControls() {
    const provId = state.selectedForgingProvider;
    if (provId === 'offline') {
        if (dom.panelModelGroup) dom.panelModelGroup.style.display = 'none';
        return;
    }

    if (dom.panelModelGroup) dom.panelModelGroup.style.display = 'block';
    const prov = AI_PROVIDERS[provId];
    if (!prov) return;

    dom.panelModelSelect.innerHTML = '';
    const models = state.discoveredModels[provId] || prov.predefinedModels || [
        { id: prov.topCuttingEdgeModel || prov.defaultModel, name: prov.topCuttingEdgeModel || prov.defaultModel, isPro: true },
        { id: prov.defaultModel, name: prov.defaultModel, isPro: false }
    ];

    models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.name + (m.isPro ? ' [Raciocínio / Pro]' : '');
        dom.panelModelSelect.appendChild(opt);
    });

    const activeModel = state.configuredModels[provId] || prov.defaultModel;
    const isCustom = !models.some(m => m.id === activeModel);

    if (isCustom && activeModel) {
        dom.panelCustomModelInput.value = activeModel;
    } else {
        dom.panelModelSelect.value = activeModel;
        dom.panelCustomModelInput.value = '';
    }

    updatePanelModelTypeTag(activeModel);
}

function updatePanelModelTypeTag(modelId) {
    if (!dom.panelModelTypeTag) return;
    const lower = (modelId || '').toLowerCase();
    const isPro = lower.includes('pro') || lower.includes('ultra') || lower.includes('r1') || lower.includes('o1') || lower.includes('o3') || lower.includes('sonnet');
    dom.panelModelTypeTag.textContent = isPro ? 'Raciocínio / Pro' : 'Rápido (Flash)';
    dom.panelModelTypeTag.style.color = isPro ? 'var(--accent)' : 'var(--ink-muted)';
}

function handlePanelModelSelectChange() {
    const provId = state.selectedForgingProvider;
    const prov = AI_PROVIDERS[provId];
    if (!prov) return;

    const chosen = dom.panelModelSelect.value;
    state.configuredModels[provId] = chosen;
    dom.panelCustomModelInput.value = '';
    localStorage.setItem(prov.modelStorageKey, chosen);

    updatePanelModelTypeTag(chosen);
    updateActiveEngineBadge();
    renderRoundTableParticipants();
    if (state.activeModalProvider === provId) {
        renderModelsDropdown(provId);
    }
    showToast(`Modelo alterado para ${chosen}`, 'info');
}

function handlePanelCustomModelInputChange() {
    const provId = state.selectedForgingProvider;
    const prov = AI_PROVIDERS[provId];
    if (!prov) return;

    const custom = dom.panelCustomModelInput.value.trim();
    const chosen = custom || dom.panelModelSelect.value || prov.defaultModel;
    state.configuredModels[provId] = chosen;
    localStorage.setItem(prov.modelStorageKey, chosen);

    updatePanelModelTypeTag(chosen);
    updateActiveEngineBadge();
    renderRoundTableParticipants();
}

// Renderiza a lista de participantes da Mesa Redonda
function renderRoundTableParticipants() {
    if (!dom.roundTableParticipantsList) return;
    const connectedProviders = Object.keys(state.apiKeys).filter(p => !!state.apiKeys[p]);

    if (connectedProviders.length < 2) {
        if (dom.rtNeedMoreModelsWarning) dom.rtNeedMoreModelsWarning.style.display = 'block';
        if (dom.btnStartRoundTable) {
            dom.btnStartRoundTable.disabled = true;
            dom.btnStartRoundTable.style.opacity = '0.5';
            dom.btnStartRoundTable.title = 'Conecte ao menos 2 modelos para iniciar';
        }
    } else {
        if (dom.rtNeedMoreModelsWarning) dom.rtNeedMoreModelsWarning.style.display = 'none';
        if (dom.btnStartRoundTable) {
            dom.btnStartRoundTable.disabled = false;
            dom.btnStartRoundTable.style.opacity = '1';
            dom.btnStartRoundTable.title = `Confrontar propostas de ${connectedProviders.length} modelos`;
        }
    }

    if (dom.rtParticipantCountTag) {
        dom.rtParticipantCountTag.textContent = `${connectedProviders.length} modelos disponíveis`;
    }

    dom.roundTableParticipantsList.innerHTML = '';
    if (connectedProviders.length === 0) {
        dom.roundTableParticipantsList.innerHTML = `
            <div style="font-size: 0.78rem; color: var(--ink-muted); padding: 0.5rem 0;">
                Nenhum modelo conectado ainda. Clique em 'Conectar modelos' acima.
            </div>
        `;
        return;
    }

    connectedProviders.forEach(provId => {
        const prov = AI_PROVIDERS[provId];
        const modelToUse = resolveCuttingEdgeModel(provId, state.configuredModels, state.discoveredModels);
        const chip = document.createElement('div');
        chip.className = 'participant-chip';
        chip.innerHTML = `
            <div class="participant-chip-left">
                <span class="participant-chip-status"></span>
                <span>${prov.name}</span>
            </div>
            <span class="participant-chip-model" title="Versão mais recente / raciocínio">${modelToUse}</span>
        `;
        dom.roundTableParticipantsList.appendChild(chip);
    });
}

// Dispara a Mesa Redonda a partir da aba dedicada
async function handleStartRoundTable() {
    const question = dom.roundTableQuestionInput.value.trim();
    if (!question) {
        showToast('Digite uma demanda ou pergunta para a Mesa Redonda.', 'warning');
        dom.roundTableQuestionInput.focus();
        return;
    }

    const connectedProviders = Object.keys(state.apiKeys).filter(p => !!state.apiKeys[p]);
    if (connectedProviders.length < 2) {
        showToast('A Mesa Redonda requer ao menos 2 modelos conectados.', 'warning');
        openConnectionsModal();
        return;
    }

    dom.roundTableEmptyState.style.display = 'none';
    dom.roundTableResultContent.style.display = 'flex';
    dom.roundTableResultContent.scrollIntoView({ behavior: 'smooth', block: 'start' });

    dom.rtSpinner.style.display = 'inline-block';
    dom.rtStatusText.textContent = `Consultando ${connectedProviders.length} modelos com as versões mais atuais...`;
    dom.rtHeaderModelCount.textContent = `${connectedProviders.length} modelos em sessão`;

    dom.rtProposalsGrid.innerHTML = `
        <div style="color: var(--ink-muted); font-size: 0.82rem; padding: 0.5rem;">
            Aguardando propostas individuais formuladas pelas versões mais recentes...
        </div>
    `;
    dom.rtDebateSection.style.display = 'none';
    dom.rtConsensusSection.style.display = 'none';
    refreshIcons();

    try {
        const councilResult = await runAiCouncil({
            promptText: question,
            connectedProviders: connectedProviders,
            apiKeys: state.apiKeys,
            configuredModels: state.configuredModels,
            discoveredModels: state.discoveredModels,
            onProgress: (prog) => {
                dom.rtStatusText.textContent = prog.text;
            }
        });

        // ETAPA 1: Propostas
        dom.rtProposalsGrid.innerHTML = '';
        councilResult.proposals.forEach(p => {
            const card = document.createElement('div');
            if (p.error) {
                card.className = 'proposal-card';
                card.style.borderColor = 'rgba(200, 100, 100, 0.4)';
                card.style.background = 'rgba(200, 100, 100, 0.04)';
                card.innerHTML = `
                    <div class="proposal-card-header" style="border-bottom: 1px solid rgba(200, 100, 100, 0.2);">
                        <span style="color: var(--crimson); font-weight: 600;">${escapeHtml(p.providerName)} (Aviso)</span>
                        <span style="font-size: 0.72rem; color: var(--ink-muted);">${escapeHtml(p.modelUsed)}</span>
                    </div>
                    <div class="proposal-content" style="color: var(--ink-secondary); font-size: 0.8rem; padding: 0.75rem;">
                        <p style="margin-bottom: 0.35rem; color: var(--crimson); font-weight: 500;">Não foi possível obter resposta desta IA nesta rodada:</p>
                        <div style="font-family: monospace; font-size: 0.74rem; background: var(--canvas); padding: 0.45rem; border-radius: 4px; border: 1px solid var(--border); word-break: break-word;">
                            ${escapeHtml(p.error)}
                        </div>
                    </div>
                `;
            } else {
                card.className = 'proposal-card';
                card.innerHTML = `
                    <div class="proposal-card-header">
                        <span>${escapeHtml(p.providerName)}</span>
                        <span style="font-size: 0.72rem; color: var(--accent);">${escapeHtml(p.modelUsed)}</span>
                    </div>
                    <div class="proposal-content">${escapeHtml(p.content)}</div>
                `;
            }
            dom.rtProposalsGrid.appendChild(card);
        });

        // ETAPA 2: Debate
        if (councilResult.debate) {
            dom.rtDebateSection.style.display = 'block';
            dom.rtDebateContent.textContent = councilResult.debate;
        }

        // ETAPA 3: Consenso
        if (councilResult.consensus) {
            dom.rtConsensusSection.style.display = 'flex';
            dom.rtConsensusContent.textContent = councilResult.consensus;
        }

        dom.rtSpinner.style.display = 'none';
        dom.rtStatusText.textContent = `Sessão concluída. Parecer unificado gerado a partir de ${councilResult.participatingCount} modelo(s).`;
        showToast('Parecer da Mesa Redonda formulado com sucesso.', 'success');

    } catch (err) {
        console.error('Erro na Mesa Redonda:', err);
        dom.rtSpinner.style.display = 'none';
        dom.rtStatusText.textContent = `Falha na consulta: ${err.message}`;
        
        if (err.individualResults && err.individualResults.length > 0) {
            dom.rtProposalsGrid.innerHTML = '';
            err.individualResults.forEach(p => {
                const card = document.createElement('div');
                card.className = 'proposal-card';
                card.style.borderColor = 'rgba(200, 100, 100, 0.45)';
                card.style.background = 'rgba(200, 100, 100, 0.04)';
                card.innerHTML = `
                    <div class="proposal-card-header" style="border-bottom: 1px solid rgba(200, 100, 100, 0.2);">
                        <span style="color: var(--crimson); font-weight: 600;">${escapeHtml(p.providerName)}</span>
                        <span style="font-size: 0.72rem; color: var(--ink-muted);">${escapeHtml(p.modelUsed)}</span>
                    </div>
                    <div class="proposal-content" style="color: var(--ink-secondary); font-size: 0.8rem; padding: 0.85rem;">
                        <p style="margin-bottom: 0.4rem; color: var(--crimson); font-weight: 600;">Erro retornado pela API:</p>
                        <div style="font-family: monospace; font-size: 0.75rem; background: var(--canvas); padding: 0.5rem; border-radius: 4px; border: 1px solid var(--border); word-break: break-word; color: var(--ink-primary); margin-bottom: 0.75rem;">
                            ${escapeHtml(p.error || 'Erro desconhecido')}
                        </div>
                        <button class="btn-ghost" style="font-size: 0.75rem; padding: 0.35rem 0.65rem; border: 1px solid var(--border-strong); border-radius: 4px; color: var(--ink-primary);" onclick="openConnectionsModal('${p.providerId}')">
                            Ajustar chave ou modelo de ${escapeHtml(p.providerName)}
                        </button>
                    </div>
                `;
                dom.rtProposalsGrid.appendChild(card);
            });
            refreshIcons();
        }
        showToast('Nenhum modelo respondeu. Verifique os avisos abaixo.', 'danger');
    }

    refreshIcons();
}

// Copiar Parecer da Mesa Redonda
function handleCopyRoundTableConsensus() {
    const text = dom.rtConsensusContent.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        showToast('Parecer da Mesa Redonda copiado com sucesso.', 'success');
    }).catch(() => {
        showToast('Erro ao copiar parecer.', 'danger');
    });
}

// Baixar Parecer da Mesa Redonda em arquivo .md
function handleDownloadCouncilMarkdown() {
    const consensusEl = dom.rtConsensusContent;
    if (!consensusEl || !consensusEl.textContent.trim()) {
        showToast('Nenhum parecer disponível para baixar.', 'warning');
        return;
    }
    const consensusText = consensusEl.innerText || consensusEl.textContent;
    const questionText = dom.roundTableQuestionInput ? dom.roundTableQuestionInput.value.trim() : 'Debate Técnico';
    const dateStr = new Date().toISOString().split('T')[0];

    let md = '';
    md += '---\n';
    md += `tipo: "Parecer de Consenso da Mesa Redonda"\n`;
    md += `demanda: "${questionText.replace(/"/g, '\\"')}"\n`;
    md += `data: "${dateStr}"\n`;
    md += '---\n\n';
    md += `# PARECER DE CONSENSO • MESA REDONDA DE IAS\n\n`;
    md += `**Demanda Analisada:**\n> ${questionText}\n\n`;
    md += `---\n\n`;
    md += consensusText.trim() + '\n';

    const slug = questionText
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 35) || 'parecer-mesa-redonda';
    const filename = `consenso-${slug}.md`;
    downloadFile(md, filename);
    showToast(`Parecer salvo como ${filename}!`, 'success');
}

// Transfere o prompt mestre do Forjador para a Mesa Redonda
function handleSendToRoundTable() {
    if (!state.currentPromptData) return;
    dom.roundTableQuestionInput.value = state.currentPromptData.formattedPrompt;
    switchMainTab('roundtable');
    showToast('Prompt transferido para a Mesa Redonda. Inicie o debate.', 'info');
}

// Atualiza contador de conexões no cabeçalho
function updateConnectionsHeader() {
    const connectedCount = Object.keys(state.apiKeys).filter(p => !!state.apiKeys[p]).length;
    dom.connectionsStatusText.textContent = `Modelos (${connectedCount}/5 conectados)`;
    if (dom.navConnectedBadge) {
        dom.navConnectedBadge.textContent = connectedCount;
    }
    
    if (connectedCount >= 2) {
        dom.btnOpenSettings.style.borderColor = 'var(--border-strong)';
        dom.btnOpenSettings.style.color = 'var(--accent)';
        if (dom.btnSendToCouncil) dom.btnSendToCouncil.disabled = false;
    } else if (connectedCount === 1) {
        dom.btnOpenSettings.style.borderColor = 'var(--border)';
        dom.btnOpenSettings.style.color = 'var(--sage)';
    } else {
        dom.btnOpenSettings.style.borderColor = 'var(--border)';
        dom.btnOpenSettings.style.color = 'var(--ink-secondary)';
    }
    renderRoundTableParticipants();
}

// Event Listeners Gerais
function setupEventListeners() {
    // Exemplos rápidos
    document.querySelectorAll('.example-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            dom.rawIdeaInput.value = pill.dataset.text;
            if (pill.dataset.cat) {
                state.selectedCategory = pill.dataset.cat;
                initCategories();
            }
            if (pill.dataset.tone) {
                state.selectedTone = pill.dataset.tone;
                dom.toneSelect.value = pill.dataset.tone;
            }
            showToast('Exemplo carregado.', 'info');
        });
    });

    // Enter com Ctrl no textarea
    dom.rawIdeaInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleForgePrompt();
        }
    });

    // Botão Forjar
    dom.btnForge.addEventListener('click', handleForgePrompt);

    // Copiar Prompt
    dom.btnCopyPrompt.addEventListener('click', handleCopyPrompt);

    // Baixar Prompt como arquivo .md
    if (dom.btnDownloadPromptMd) {
        dom.btnDownloadPromptMd.addEventListener('click', handleDownloadPromptMarkdown);
    }

    // Favoritar
    dom.btnFavCurrent.addEventListener('click', handleToggleFavoriteCurrent);

    // Teste Individual
    if (dom.btnTestSinglePrompt) dom.btnTestSinglePrompt.addEventListener('click', handleSingleTestPrompt);
    if (dom.btnClosePlayground) {
        dom.btnClosePlayground.addEventListener('click', () => {
            dom.playgroundArea.classList.remove('open');
        });
    }

    // Abas de Histórico
    if (dom.tabRecent) {
        dom.tabRecent.addEventListener('click', () => {
            state.activeHistoryTab = 'recent';
            dom.tabRecent.classList.add('active');
            dom.tabFavs.classList.remove('active');
            renderHistory();
        });
    }

    if (dom.tabFavs) {
        dom.tabFavs.addEventListener('click', () => {
            state.activeHistoryTab = 'favs';
            dom.tabFavs.classList.add('active');
            dom.tabRecent.classList.remove('active');
            renderHistory();
        });
    }

    // Modal de Conexões
    if (dom.btnOpenSettings) {
        dom.btnOpenSettings.addEventListener('click', () => {
            openConnectionsModal(state.selectedForgingProvider !== 'offline' ? state.selectedForgingProvider : 'gemini');
        });
    }

    if (dom.btnConfigProvKeyInline) {
        dom.btnConfigProvKeyInline.addEventListener('click', () => {
            const provId = state.selectedForgingProvider !== 'offline' ? state.selectedForgingProvider : 'gemini';
            openConnectionsModal(provId);
        });
    }

    if (dom.activeEngineBadge) {
        dom.activeEngineBadge.addEventListener('click', () => {
            const provId = state.selectedForgingProvider !== 'offline' ? state.selectedForgingProvider : 'gemini';
            openConnectionsModal(provId);
        });
    }

    if (dom.btnCloseSettings) {
        dom.btnCloseSettings.addEventListener('click', () => {
            dom.settingsModal.classList.remove('open');
        });
    }

    // Abas do Modal de Conexões
    document.querySelectorAll('.provider-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.provider-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.activeModalProvider = btn.dataset.prov;
            renderProviderModalTab();
        });
    });

    if (dom.btnSaveProvKey) dom.btnSaveProvKey.addEventListener('click', handleSaveProviderKey);
    if (dom.btnClearProvKey) dom.btnClearProvKey.addEventListener('click', handleClearProviderKey);

    if (dom.btnRefreshProvModels) {
        dom.btnRefreshProvModels.addEventListener('click', () => {
            const provId = state.activeModalProvider;
            const key = dom.provModalInput ? dom.provModalInput.value.trim() : '';
            if (!key) {
                showToast('Insira uma chave de API para consultar os modelos.', 'warning');
                if (dom.provModalInput) dom.provModalInput.focus();
                return;
            }
            loadModelsForProvider(provId, key, true);
        });
    }

    let provKeyDebounce = null;
    if (dom.provModalInput) {
        dom.provModalInput.addEventListener('input', (e) => {
            clearTimeout(provKeyDebounce);
            const key = e.target.value.trim();
            const provId = state.activeModalProvider;
            if (key.length >= 10) {
                provKeyDebounce = setTimeout(() => {
                    loadModelsForProvider(provId, key, false);
                }, 600);
            }
        });
    }

    // Modal do Guia
    dom.btnOpenGuide.addEventListener('click', () => {
        dom.guideModal.classList.add('open');
    });

    dom.btnCloseGuide.addEventListener('click', () => {
        dom.guideModal.classList.remove('open');
    });

    dom.btnGotItGuide.addEventListener('click', () => {
        dom.guideModal.classList.remove('open');
    });

    // Alternância de Abas Principais (Forjador vs Mesa Redonda)
    if (dom.navTabForger) {
        dom.navTabForger.addEventListener('click', () => switchMainTab('forger'));
    }
    if (dom.navTabRoundTable) {
        dom.navTabRoundTable.addEventListener('click', () => switchMainTab('roundtable'));
    }

    // Seletor de Modelo Inline no Forjador
    if (dom.panelModelSelect) {
        dom.panelModelSelect.addEventListener('change', handlePanelModelSelectChange);
    }
    if (dom.panelCustomModelInput) {
        dom.panelCustomModelInput.addEventListener('input', handlePanelCustomModelInputChange);
    }

    // Enviar para Mesa Redonda a partir do Forjador
    if (dom.btnSendToCouncil) {
        dom.btnSendToCouncil.addEventListener('click', handleSendToRoundTable);
    }

    // Mesa Redonda
    if (dom.btnStartRoundTable) {
        dom.btnStartRoundTable.addEventListener('click', handleStartRoundTable);
    }
    if (dom.btnCopyRoundTableConsensus) {
        dom.btnCopyRoundTableConsensus.addEventListener('click', handleCopyRoundTableConsensus);
    }
    if (dom.btnDownloadCouncilMd) {
        dom.btnDownloadCouncilMd.addEventListener('click', handleDownloadCouncilMarkdown);
    }
    if (dom.btnCopyRtConsensusInline) {
        dom.btnCopyRtConsensusInline.addEventListener('click', handleCopyRoundTableConsensus);
    }
    if (dom.linkOpenSettingsFromRT) {
        dom.linkOpenSettingsFromRT.addEventListener('click', (e) => {
            e.preventDefault();
            openConnectionsModal();
        });
    }

    // Exemplos rápidos da Mesa Redonda
    document.querySelectorAll('.rt-example-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            dom.roundTableQuestionInput.value = pill.dataset.text;
            showToast('Pergunta carregada na Mesa Redonda.', 'info');
        });
    });
}

// Modal de Conexões: Renderização da Aba
function openConnectionsModal(provId = 'gemini') {
    state.activeModalProvider = provId;
    document.querySelectorAll('.provider-tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.prov === provId);
    });
    renderProviderModalTab();
    dom.settingsModal.classList.add('open');
}

function renderProviderModalTab() {
    const provId = state.activeModalProvider;
    const prov = AI_PROVIDERS[provId];
    const key = state.apiKeys[provId] || '';
    
    dom.provModalLabel.textContent = `Chave do ${prov.name}`;
    dom.provModalInput.value = key;
    
    if (key) {
        dom.provModalStatus.textContent = 'Conectado';
        dom.provModalStatus.style.color = 'var(--sage)';
    } else {
        dom.provModalStatus.textContent = 'Não configurado';
        dom.provModalStatus.style.color = 'var(--ink-muted)';
    }

    dom.provModalHelp.innerHTML = `
        Acesse para obter uma chave: <a href="${prov.docsUrl}" target="_blank" rel="noopener noreferrer">${prov.docsUrl}</a>
    `;

    // Renderiza a lista de modelos daquele provedor
    renderModelsDropdown(provId);

    // Se a chave existir mas os modelos ainda não foram carregados, dispara auto-detecção
    if (key && !state.discoveredModels[provId]) {
        loadModelsForProvider(provId, key);
    }
}


// Renderiza o select de modelos no modal
function renderModelsDropdown(provId) {
    const prov = AI_PROVIDERS[provId];
    dom.provModalModelSelect.innerHTML = '';

    const models = state.discoveredModels[provId] || prov.predefinedModels || [
        { id: prov.defaultModel, name: `${prov.defaultModel} (Padrão)` }
    ];

    models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        const needsProTag = m.isPro && !m.name.includes('Pro') && !m.name.includes('Avançado') && !m.name.includes('Topo') && !m.name.includes('(');
        opt.textContent = m.name + (needsProTag ? ' [Pro/Avançado]' : '');
        dom.provModalModelSelect.appendChild(opt);
    });

    const activeModel = state.configuredModels[provId] || prov.defaultModel;
    const isCustom = !models.some(m => m.id === activeModel);

    if (isCustom && activeModel) {
        dom.provModalCustomModelInput.value = activeModel;
    } else {
        dom.provModalModelSelect.value = activeModel;
        dom.provModalCustomModelInput.value = '';
    }
}

// Executa auto-detecção assíncrona consultando a API do provedor
async function loadModelsForProvider(provId, key, isManualRefresh = false) {
    if (!key) return;
    const prov = AI_PROVIDERS[provId];

    if (dom.refreshProvIcon) dom.refreshProvIcon.classList.add('animate-spin');
    if (dom.btnRefreshProvModels) dom.btnRefreshProvModels.disabled = true;
    if (dom.refreshProvText) dom.refreshProvText.textContent = 'Buscando...';
    if (dom.provModelDetectTag) {
        dom.provModelDetectTag.textContent = 'Consultando modelos mais recentes da conta...';
        dom.provModelDetectTag.style.color = 'var(--accent)';
    }

    try {
        const models = await fetchAvailableModels(provId, key);
        if (models && models.length > 0) {
            state.discoveredModels[provId] = models;

            // Se o usuário não digitou um modelo customizado manual, auto-seleciona a versão mais avançada (index 0)
            const currentCustom = dom.provModalCustomModelInput ? dom.provModalCustomModelInput.value.trim() : '';
            if (!currentCustom) {
                const topModel = models[0].id;
                state.configuredModels[provId] = topModel;
                localStorage.setItem(prov.modelStorageKey, topModel);
            }

            const activeModel = state.configuredModels[provId] || models[0].id;
            const topModelObj = models.find(m => m.id === activeModel) || models[0];

            if (dom.provModelDetectTag) {
                dom.provModelDetectTag.textContent = `${models.length} modelos detectados • ${topModelObj.name.split(' ')[0]} ativo`;
                dom.provModelDetectTag.style.color = 'var(--sage)';
            }

            if (state.activeModalProvider === provId) {
                renderModelsDropdown(provId);
            }
            updateActiveEngineBadge();
            renderPanelModelControls();
            renderRoundTableParticipants();

            if (isManualRefresh) {
                showToast(`${models.length} modelos atualizados com sucesso da conta ${prov.name}.`, 'success');
            }
        } else {
            if (dom.provModelDetectTag) {
                dom.provModelDetectTag.textContent = 'Modelos padrão ativos';
                dom.provModelDetectTag.style.color = 'var(--ink-muted)';
            }
            if (isManualRefresh) {
                showToast(`Nenhum modelo retornado. Usando modelos padrão de ${prov.name}.`, 'warning');
            }
        }
    } catch (err) {
        console.warn('Erro ao consultar modelos da conta:', err);
        if (dom.provModelDetectTag) {
            dom.provModelDetectTag.textContent = 'Erro ao consultar API da conta';
            dom.provModelDetectTag.style.color = 'var(--crimson)';
        }
        if (isManualRefresh) {
            showToast('Erro ao consultar modelos. Verifique a chave ou conexão.', 'error');
        }
    } finally {
        if (dom.refreshProvIcon) dom.refreshProvIcon.classList.remove('animate-spin');
        if (dom.btnRefreshProvModels) dom.btnRefreshProvModels.disabled = false;
        if (dom.refreshProvText) dom.refreshProvText.textContent = 'Buscar modelos';
    }
}

function handleSaveProviderKey() {
    const provId = state.activeModalProvider;
    const key = dom.provModalInput.value.trim();
    const customModel = dom.provModalCustomModelInput.value.trim();
    const selectedModel = dom.provModalModelSelect.value;
    const prov = AI_PROVIDERS[provId];

    state.apiKeys[provId] = key;
    if (key) {
        localStorage.setItem(prov.keyStorageKey, key);
    } else {
        localStorage.removeItem(prov.keyStorageKey);
    }

    // Salva o modelo escolhido ou customizado
    const chosenModel = customModel || selectedModel || prov.defaultModel;
    state.configuredModels[provId] = chosenModel;
    localStorage.setItem(prov.modelStorageKey, chosenModel);

    showToast(`Configurações de ${prov.name} salvas com sucesso.`, 'success');

    // Se adicionou a chave, auto-detecta imediatamente os modelos da conta
    if (key) {
        loadModelsForProvider(provId, key);
    }

    renderProviderModalTab();
    updateConnectionsHeader();
    updateActiveEngineBadge();
    renderPanelModelControls();
    renderRoundTableParticipants();
}

function handleClearProviderKey() {
    const provId = state.activeModalProvider;
    const prov = AI_PROVIDERS[provId];

    state.apiKeys[provId] = '';
    state.configuredModels[provId] = '';
    dom.provModalInput.value = '';
    dom.provModalCustomModelInput.value = '';
    localStorage.removeItem(prov.keyStorageKey);
    localStorage.removeItem(prov.modelStorageKey);

    renderProviderModalTab();
    updateConnectionsHeader();
    updateActiveEngineBadge();
    renderPanelModelControls();
    renderRoundTableParticipants();
    showToast(`Chave de ${prov.name} removida.`, 'info');
}

// LÓGICA DE FORJAR PROMPT (MULTI-MOTOR COM MODELO DINÂMICO)
async function handleForgePrompt() {
    const rawIdea = dom.rawIdeaInput.value.trim();
    if (!rawIdea) {
        showToast('Digite um briefing ou ideia primeiro.', 'warning');
        dom.rawIdeaInput.focus();
        return;
    }

    setGeneratingState(true);

    try {
        const provId = state.selectedForgingProvider;
        const apiKey = state.apiKeys[provId];
        const activeModel = state.configuredModels[provId] || (AI_PROVIDERS[provId] ? AI_PROVIDERS[provId].defaultModel : null);
        let resultData = null;
        let usedEngineName = 'Motor estrutural';

        if (provId !== 'offline' && apiKey) {
            try {
                const prov = AI_PROVIDERS[provId];
                usedEngineName = `${prov.name} (${activeModel})`;
                resultData = await forgePromptWithAI(provId, apiKey, rawIdea, state.selectedCategory, state.selectedTone, activeModel);
            } catch (err) {
                console.warn(`Erro no motor ${provId}, acionando motor offline:`, err);
                showToast(`Falha na chamada (${err.message}). Usando motor estrutural.`, 'warning');
                resultData = generateOfflinePrompt(rawIdea, state.selectedCategory, state.selectedTone);
                usedEngineName = 'Motor estrutural';
            }
        } else {
            resultData = generateOfflinePrompt(rawIdea, state.selectedCategory, state.selectedTone);
            if (provId !== 'offline' && !apiKey) {
                showToast(`${AI_PROVIDERS[provId].name} sem chave cadastrada. Gerando com motor estrutural.`, 'info');
            }
        }

        // Metadados
        resultData.id = 'pf_' + Date.now();
        resultData.createdAt = new Date().toISOString();
        resultData.category = state.selectedCategory;
        resultData.tone = state.selectedTone;
        resultData.rawIdea = rawIdea;
        resultData.isFavorite = false;
        resultData.engineUsed = usedEngineName;

        state.currentPromptData = resultData;
        displayPromptResult(resultData);
        saveToHistory(resultData);

    } catch (err) {
        console.error('Erro ao estruturar prompt:', err);
        showToast('Erro ao estruturar prompt: ' + err.message, 'danger');
    } finally {
        setGeneratingState(false);
    }
}

// Renderiza o resultado
function displayPromptResult(data) {
    dom.emptyState.style.display = 'none';
    dom.resultContent.style.display = 'flex';

    dom.promptTitle.textContent = data.title || 'Documento estruturado';
    
    const catObj = PROMPT_CATEGORIES[data.category] || PROMPT_CATEGORIES.coding;
    const toneObj = PROMPT_TONES[data.tone] || PROMPT_TONES.technical;

    dom.badgeCategory.textContent = catObj.name;
    dom.badgeTone.textContent = toneObj.name;
    dom.badgeEngineUsed.textContent = data.engineUsed || 'PromptForge';

    dom.promptTextDisplay.textContent = data.formattedPrompt;

    updateFavoriteButtonUI(data.isFavorite);

    // Notas Estruturais
    dom.xrayCardsContainer.innerHTML = '';
    const xrayList = Array.isArray(data.educationalXray) ? data.educationalXray : [];
    if (xrayList.length > 0) {
        xrayList.forEach(item => {
            const card = document.createElement('div');
            card.className = 'xray-card';
            const tech = (item && item.technique) || 'Engenharia de Prompt';
            const expl = (item && item.explanation) || String(item || '');
            card.innerHTML = `
                <div class="xray-card-title">${escapeHtml(tech)}</div>
                <div class="xray-card-desc">${escapeHtml(expl)}</div>
            `;
            dom.xrayCardsContainer.appendChild(card);
        });
    }

    // Dicas
    dom.quickTipsContainer.innerHTML = '';
    const tipsList = Array.isArray(data.quickTips) ? data.quickTips : [];
    if (tipsList.length > 0) {
        tipsList.forEach(tip => {
            const tipEl = document.createElement('div');
            tipEl.className = 'tip-item';
            tipEl.innerHTML = `
                <i data-lucide="arrow-right" style="width: 12px; height: 12px; flex-shrink: 0; color: var(--accent);"></i>
                <span>${escapeHtml(String(tip))}</span>
            `;
            dom.quickTipsContainer.appendChild(tipEl);
        });
    }

    if (dom.playgroundArea) dom.playgroundArea.classList.remove('open');
    if (dom.councilArea) dom.councilArea.classList.remove('open');

    refreshIcons();
}

// Utilitário Genérico de Download no Navegador
function downloadFile(content, filename, mimeType = 'text/markdown;charset=utf-8;') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Constrói Documento Markdown Completo com Metadados e Frontmatter
function buildMarkdownDocument(data) {
    if (!data) return '';
    const catObj = PROMPT_CATEGORIES[data.category] || PROMPT_CATEGORIES.coding;
    const toneObj = PROMPT_TONES[data.tone] || PROMPT_TONES.technical;
    const dateStr = data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    let md = '';
    // Frontmatter YAML para compatibilidade universal com Obsidian, VS Code, Notion e IAs
    md += '---\n';
    md += `titulo: "${(data.title || 'Prompt Mestre').replace(/"/g, '\\"')}"\n`;
    md += `categoria: "${catObj.name}"\n`;
    md += `tom_de_voz: "${toneObj.name}"\n`;
    md += `motor_utilizado: "${data.engineUsed || 'PromptForge'}"\n`;
    md += `data_geracao: "${dateStr}"\n`;
    md += '---\n\n';

    // Corpo integral do Prompt Mestre
    md += data.formattedPrompt + '\n\n';

    // Notas de Engenharia
    const xrayList = Array.isArray(data.educationalXray) ? data.educationalXray : [];
    if (xrayList.length > 0) {
        md += '---\n\n';
        md += '### 📐 Notas de Engenharia de Prompt\n\n';
        xrayList.forEach(item => {
            const tech = item.technique || 'Engenharia de Prompt';
            const expl = item.explanation || String(item);
            md += `* **${tech}:** ${expl}\n`;
        });
        md += '\n';
    }

    // Dicas de Execução & Interação
    const tipsList = Array.isArray(data.quickTips) ? data.quickTips : [];
    if (tipsList.length > 0) {
        md += '### 💡 Dicas de Execução & Interação\n\n';
        tipsList.forEach(tip => {
            md += `* ${tip}\n`;
        });
        md += '\n';
    }

    return md.trim() + '\n';
}

// Baixar Prompt Estruturado como Arquivo .md
function handleDownloadPromptMarkdown() {
    if (!state.currentPromptData) {
        showToast('Nenhum documento disponível para baixar.', 'warning');
        return;
    }
    const mdContent = buildMarkdownDocument(state.currentPromptData);
    const rawTitle = state.currentPromptData.title || state.currentPromptData.rawIdea || 'prompt-mestre';
    const slug = rawTitle
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 35) || 'prompt-mestre';
    const filename = `${slug}.md`;
    downloadFile(mdContent, filename);
    showToast(`Arquivo ${filename} baixado com sucesso!`, 'success');
}

// Copiar Prompt
function handleCopyPrompt() {
    if (!state.currentPromptData) return;
    navigator.clipboard.writeText(state.currentPromptData.formattedPrompt).then(() => {
        showToast('Prompt copiado para a área de transferência.', 'success');
    }).catch(() => {
        showToast('Erro ao copiar para a área de transferência.', 'danger');
    });
}

// Favoritar
function handleToggleFavoriteCurrent() {
    if (!state.currentPromptData) return;
    state.currentPromptData.isFavorite = !state.currentPromptData.isFavorite;
    updateFavoriteButtonUI(state.currentPromptData.isFavorite);

    const item = state.history.find(h => h.id === state.currentPromptData.id);
    if (item) {
        item.isFavorite = state.currentPromptData.isFavorite;
        persistHistory();
        renderHistory();
    }

    showToast(state.currentPromptData.isFavorite ? 'Salvo no arquivo local.' : 'Removido dos salvos.', 'info');
}

function updateFavoriteButtonUI(isFav) {
    if (isFav) {
        dom.favStarIcon.setAttribute('fill', 'var(--accent)');
        dom.favStarIcon.style.color = 'var(--accent)';
        dom.btnFavCurrent.querySelector('span').textContent = 'Salvo';
    } else {
        dom.favStarIcon.removeAttribute('fill');
        dom.favStarIcon.style.color = 'currentColor';
        dom.btnFavCurrent.querySelector('span').textContent = 'Salvar';
    }
}

// TESTE INDIVIDUAL COM O MODELO ATIVO
async function handleSingleTestPrompt() {
    if (!state.currentPromptData) return;

    let provId = state.selectedForgingProvider !== 'offline' ? state.selectedForgingProvider : null;
    if (!provId || !state.apiKeys[provId]) {
        provId = Object.keys(state.apiKeys).find(p => !!state.apiKeys[p]);
    }

    if (!provId) {
        showToast('Cadastre ao menos uma chave de modelo para testar.', 'warning');
        openConnectionsModal('gemini');
        return;
    }

    const prov = AI_PROVIDERS[provId];
    const activeModel = state.configuredModels[provId] || prov.defaultModel;

    dom.singleTestTitle.textContent = `Retorno do modelo: ${prov.name} (${activeModel})`;
    dom.playgroundArea.classList.add('open');
    dom.playgroundOutput.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--ink-secondary);">
            <i data-lucide="loader-2" class="animate-spin" style="width: 15px; height: 15px;"></i>
            <span>Enviando documento para ${prov.name} (${activeModel})...</span>
        </div>
    `;
    refreshIcons();

    try {
        const response = await callUniversalAI(
            provId, 
            state.apiKeys[provId], 
            'Responda profissionalmente ao prompt com clareza e estrutura.', 
            state.currentPromptData.formattedPrompt, 
            false,
            activeModel
        );
        dom.playgroundOutput.textContent = response;
    } catch (err) {
        dom.playgroundOutput.innerHTML = `
            <div style="color: var(--crimson);">
                <b>Erro na resposta do modelo ${activeModel}:</b> ${err.message}<br><br>
                Verifique se o modelo informado está habilitado e se sua chave de API possui cotas suficientes.
            </div>
        `;
    }
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Histórico
function saveToHistory(promptData) {
    state.history.unshift(promptData);
    if (state.history.length > 50) state.history.pop();
    persistHistory();
    renderHistory();
}

function persistHistory() {
    localStorage.setItem('promptforge_history', JSON.stringify(state.history));
}

function renderHistory() {
    dom.historyList.innerHTML = '';

    const list = state.activeHistoryTab === 'favs'
        ? state.history.filter(item => item.isFavorite)
        : state.history;

    if (list.length === 0) {
        dom.historyList.innerHTML = `
            <div style="text-align: center; padding: 2rem 1rem; color: var(--ink-muted); font-size: 0.78rem;">
                ${state.activeHistoryTab === 'favs' ? 'Nenhum documento salvo.' : 'Nenhum item recente.'}
            </div>
        `;
        return;
    }

    list.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'history-item';
        itemEl.innerHTML = `
            <div class="history-item-title" title="${item.title || item.rawIdea}">
                ${item.title || item.rawIdea}
            </div>
            <div class="history-item-actions">
                <button class="icon-btn-sm btn-item-fav ${item.isFavorite ? 'active-fav' : ''}" title="${item.isFavorite ? 'Remover' : 'Salvar'}">
                    <i data-lucide="bookmark" style="width: 13px; height: 13px;" ${item.isFavorite ? 'fill="var(--accent)"' : ''}></i>
                </button>
                <button class="icon-btn-sm btn-item-del" title="Excluir">
                    <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
                </button>
            </div>
        `;

        itemEl.querySelector('.history-item-title').addEventListener('click', () => {
            state.currentPromptData = item;
            dom.rawIdeaInput.value = item.rawIdea || '';
            state.selectedCategory = item.category || 'coding';
            state.selectedTone = item.tone || 'technical';
            initCategories();
            dom.toneSelect.value = state.selectedTone;
            displayPromptResult(item);
        });

        itemEl.querySelector('.btn-item-fav').addEventListener('click', (e) => {
            e.stopPropagation();
            item.isFavorite = !item.isFavorite;
            if (state.currentPromptData && state.currentPromptData.id === item.id) {
                state.currentPromptData.isFavorite = item.isFavorite;
                updateFavoriteButtonUI(item.isFavorite);
            }
            persistHistory();
            renderHistory();
        });

        itemEl.querySelector('.btn-item-del').addEventListener('click', (e) => {
            e.stopPropagation();
            state.history = state.history.filter(h => h.id !== item.id);
            persistHistory();
            renderHistory();
            showToast('Item removido.', 'info');
        });

        dom.historyList.appendChild(itemEl);
    });

    refreshIcons();
}

function setGeneratingState(isGen) {
    state.isForging = isGen;
    dom.btnForge.disabled = isGen;
    if (isGen) {
        dom.forgeBtnText.textContent = 'Estruturando...';
        dom.forgeIcon.classList.add('animate-spin');
    } else {
        dom.forgeBtnText.textContent = 'Estruturar prompt';
        dom.forgeIcon.classList.remove('animate-spin');
    }
}

// Toast
let toastTimeout = null;
function showToast(message, type = 'info') {
    clearTimeout(toastTimeout);
    dom.toastMessage.textContent = message;
    dom.toast.className = 'toast show';
    if (type === 'success') dom.toast.classList.add('toast-success');
    toastTimeout = setTimeout(() => {
        dom.toast.classList.remove('show');
    }, 3200);
}
