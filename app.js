/**
 * PromptForge - Controlador Principal com Suporte Multi-Motor e Conselho de IAs
 */

// Estado Global
const state = {
    apiKeys: {
        gemini: localStorage.getItem('promptforge_key_gemini') || localStorage.getItem('promptforge_gemini_api_key') || '',
        groq: localStorage.getItem('promptforge_key_groq') || '',
        openai: localStorage.getItem('promptforge_key_openai') || '',
        claude: localStorage.getItem('promptforge_key_claude') || ''
    },
    selectedForgingProvider: localStorage.getItem('promptforge_selected_provider') || 'gemini',
    selectedCategory: 'coding',
    selectedTone: 'technical',
    currentPromptData: null,
    history: JSON.parse(localStorage.getItem('promptforge_history') || '[]'),
    activeHistoryTab: 'recent',
    activeModalProvider: 'gemini',
    isForging: false,
    isSingleTesting: false,
    isCouncilRunning: false
};

// Elementos DOM
const dom = {
    // Header
    btnOpenSettings: document.getElementById('btnOpenSettings'),
    connectionsStatusText: document.getElementById('connectionsStatusText'),
    btnOpenGuide: document.getElementById('btnOpenGuide'),

    // Painel Esquerdo
    rawIdeaInput: document.getElementById('rawIdeaInput'),
    forgingProviderSelect: document.getElementById('forgingProviderSelect'),
    activeEngineBadge: document.getElementById('activeEngineBadge'),
    categoryContainer: document.getElementById('categoryContainer'),
    toneSelect: document.getElementById('toneSelect'),
    btnForge: document.getElementById('btnForge'),
    forgeBtnText: document.getElementById('forgeBtnText'),
    forgeIcon: document.getElementById('forgeIcon'),

    // Histórico
    historyList: document.getElementById('historyList'),
    tabRecent: document.getElementById('tabRecent'),
    tabFavs: document.getElementById('tabFavs'),

    // Painel Direito
    emptyState: document.getElementById('emptyState'),
    resultContent: document.getElementById('resultContent'),
    promptTitle: document.getElementById('promptTitle'),
    badgeCategory: document.getElementById('badgeCategory'),
    badgeTone: document.getElementById('badgeTone'),
    badgeEngineUsed: document.getElementById('badgeEngineUsed'),
    promptTextDisplay: document.getElementById('promptTextDisplay'),
    xrayCardsContainer: document.getElementById('xrayCardsContainer'),
    quickTipsContainer: document.getElementById('quickTipsContainer'),

    // Botões de Ação
    btnCopyPrompt: document.getElementById('btnCopyPrompt'),
    btnFavCurrent: document.getElementById('btnFavCurrent'),
    favStarIcon: document.getElementById('favStarIcon'),
    btnTestSinglePrompt: document.getElementById('btnTestSinglePrompt'),
    btnCallCouncil: document.getElementById('btnCallCouncil'),

    // Playground Teste Individual
    playgroundArea: document.getElementById('playgroundArea'),
    singleTestTitle: document.getElementById('singleTestTitle'),
    playgroundOutput: document.getElementById('playgroundOutput'),
    btnClosePlayground: document.getElementById('btnClosePlayground'),

    // Conselho de IAs
    councilArea: document.getElementById('councilArea'),
    btnCloseCouncil: document.getElementById('btnCloseCouncil'),
    councilStatus: document.getElementById('councilStatus'),
    councilStatusText: document.getElementById('councilStatusText'),
    councilSpinner: document.getElementById('councilSpinner'),
    councilProposalsGrid: document.getElementById('councilProposalsGrid'),
    councilDebateSection: document.getElementById('councilDebateSection'),
    councilDebateContent: document.getElementById('councilDebateContent'),
    councilConsensusSection: document.getElementById('councilConsensusSection'),
    councilConsensusContent: document.getElementById('councilConsensusContent'),
    btnCopyConsensus: document.getElementById('btnCopyConsensus'),

    // Modal de Conexões
    settingsModal: document.getElementById('settingsModal'),
    btnCloseSettings: document.getElementById('btnCloseSettings'),
    provModalLabel: document.getElementById('provModalLabel'),
    provModalStatus: document.getElementById('provModalStatus'),
    provModalInput: document.getElementById('provModalInput'),
    provModalHelp: document.getElementById('provModalHelp'),
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
    updateConnectionsHeader();
    renderHistory();
    setupEventListeners();
    refreshIcons();
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
            <i data-lucide="${cat.icon}" style="width: 16px; height: 16px;"></i>
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

// Inicializa tons de voz
function initTones() {
    dom.toneSelect.innerHTML = '';
    Object.values(PROMPT_TONES).forEach(tone => {
        const opt = document.createElement('option');
        opt.value = tone.id;
        opt.textContent = `${tone.name}: ${tone.description}`;
        dom.toneSelect.appendChild(opt);
    });
    dom.toneSelect.value = state.selectedTone;
    dom.toneSelect.addEventListener('change', (e) => {
        state.selectedTone = e.target.value;
    });
}

// Inicializa seletor do motor de IA forjador
function initForgingProviderSelect() {
    dom.forgingProviderSelect.value = state.selectedForgingProvider;
    updateActiveEngineBadge();

    dom.forgingProviderSelect.addEventListener('change', (e) => {
        state.selectedForgingProvider = e.target.value;
        localStorage.setItem('promptforge_selected_provider', e.target.value);
        updateActiveEngineBadge();
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
    const hasKey = !!state.apiKeys[provId];
    dom.activeEngineBadge.textContent = `${prov.name} ${hasKey ? '(conectado)' : '(sem chave)'}`;
    dom.activeEngineBadge.style.color = hasKey ? 'var(--sage)' : 'var(--ink-muted)';
}

// Atualiza contador de conexões no cabeçalho
function updateConnectionsHeader() {
    const connectedCount = Object.keys(state.apiKeys).filter(p => !!state.apiKeys[p]).length;
    dom.connectionsStatusText.textContent = `Modelos (${connectedCount}/4 conectados)`;
    
    if (connectedCount >= 2) {
        dom.btnOpenSettings.style.borderColor = 'var(--border-strong)';
        dom.btnOpenSettings.style.color = 'var(--accent)';
        dom.btnCallCouncil.disabled = false;
        dom.btnCallCouncil.title = `Mesa do conselho (${connectedCount} modelos conectados)`;
    } else if (connectedCount === 1) {
        dom.btnOpenSettings.style.borderColor = 'var(--border)';
        dom.btnOpenSettings.style.color = 'var(--sage)';
    } else {
        dom.btnOpenSettings.style.borderColor = 'var(--border)';
        dom.btnOpenSettings.style.color = 'var(--ink-secondary)';
    }
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
            showToast('Exemplo carregado!', 'info');
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

    // Favoritar
    dom.btnFavCurrent.addEventListener('click', handleToggleFavoriteCurrent);

    // Teste Individual
    dom.btnTestSinglePrompt.addEventListener('click', handleSingleTestPrompt);
    dom.btnClosePlayground.addEventListener('click', () => {
        dom.playgroundArea.classList.remove('open');
    });

    // Conselho de IAs
    dom.btnCallCouncil.addEventListener('click', handleCallCouncil);
    dom.btnCloseCouncil.addEventListener('click', () => {
        dom.councilArea.classList.remove('open');
    });
    dom.btnCopyConsensus.addEventListener('click', handleCopyConsensus);

    // Abas de Histórico
    dom.tabRecent.addEventListener('click', () => {
        state.activeHistoryTab = 'recent';
        dom.tabRecent.classList.add('active');
        dom.tabFavs.classList.remove('active');
        renderHistory();
    });

    dom.tabFavs.addEventListener('click', () => {
        state.activeHistoryTab = 'favs';
        dom.tabFavs.classList.add('active');
        dom.tabRecent.classList.remove('active');
        renderHistory();
    });

    // Modal de Conexões
    dom.btnOpenSettings.addEventListener('click', () => {
        openConnectionsModal(state.selectedForgingProvider !== 'offline' ? state.selectedForgingProvider : 'gemini');
    });

    dom.btnCloseSettings.addEventListener('click', () => {
        dom.settingsModal.classList.remove('open');
    });

    // Abas do Modal de Conexões
    document.querySelectorAll('.provider-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.provider-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.activeModalProvider = btn.dataset.prov;
            renderProviderModalTab();
        });
    });

    dom.btnSaveProvKey.addEventListener('click', handleSaveProviderKey);
    dom.btnClearProvKey.addEventListener('click', handleClearProviderKey);

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
    const prov = AI_PROVIDERS[state.activeModalProvider];
    const key = state.apiKeys[prov.id] || '';
    
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
}

function handleSaveProviderKey() {
    const provId = state.activeModalProvider;
    const key = dom.provModalInput.value.trim();
    const prov = AI_PROVIDERS[provId];

    state.apiKeys[provId] = key;
    if (key) {
        localStorage.setItem(prov.keyStorageKey, key);
        showToast(`Chave do ${prov.name} salva com sucesso!`, 'success');
    } else {
        localStorage.removeItem(prov.keyStorageKey);
    }

    renderProviderModalTab();
    updateConnectionsHeader();
    updateActiveEngineBadge();
}

function handleClearProviderKey() {
    const provId = state.activeModalProvider;
    const prov = AI_PROVIDERS[provId];

    state.apiKeys[provId] = '';
    dom.provModalInput.value = '';
    localStorage.removeItem(prov.keyStorageKey);

    renderProviderModalTab();
    updateConnectionsHeader();
    updateActiveEngineBadge();
    showToast(`Chave do ${prov.name} removida`, 'info');
}

// LÓGICA DE FORJAR PROMPT (MULTI-MOTOR)
async function handleForgePrompt() {
    const rawIdea = dom.rawIdeaInput.value.trim();
    if (!rawIdea) {
        showToast('Digite uma ideia ou frase primeiro!', 'warning');
        dom.rawIdeaInput.focus();
        return;
    }

    setGeneratingState(true);

    try {
        const provId = state.selectedForgingProvider;
        const apiKey = state.apiKeys[provId];
        let resultData = null;
        let usedEngineName = 'Motor Estrutural Local';

        if (provId !== 'offline' && apiKey) {
            try {
                const prov = AI_PROVIDERS[provId];
                usedEngineName = prov.name;
                resultData = await forgePromptWithAI(provId, apiKey, rawIdea, state.selectedCategory, state.selectedTone);
            } catch (err) {
                console.warn(`Erro no motor ${provId}, acionando motor offline:`, err);
                showToast(`Falha na API (${err.message}). Usando motor estrutural offline.`, 'warning');
                resultData = generateOfflinePrompt(rawIdea, state.selectedCategory, state.selectedTone);
                usedEngineName = 'Motor Estrutural (Fallback)';
            }
        } else {
            resultData = generateOfflinePrompt(rawIdea, state.selectedCategory, state.selectedTone);
            if (provId !== 'offline' && !apiKey) {
                showToast(`O ${AI_PROVIDERS[provId].name} não tem chave salva. Gerando com motor offline inteligente!`, 'info');
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
        console.error('Erro ao forjar prompt:', err);
        showToast('Erro ao forjar prompt: ' + err.message, 'danger');
    } finally {
        setGeneratingState(false);
    }
}

// Renderiza o resultado forjado
function displayPromptResult(data) {
    dom.emptyState.style.display = 'none';
    dom.resultContent.style.display = 'flex';

    dom.promptTitle.textContent = data.title || 'Prompt Mestre Gerado';
    
    const catObj = PROMPT_CATEGORIES[data.category] || PROMPT_CATEGORIES.coding;
    const toneObj = PROMPT_TONES[data.tone] || PROMPT_TONES.technical;

    dom.badgeCategory.textContent = catObj.name;
    dom.badgeTone.textContent = toneObj.name;
    dom.badgeEngineUsed.textContent = `Gerador: ${data.engineUsed || 'PromptForge'}`;

    dom.promptTextDisplay.textContent = data.formattedPrompt;

    updateFavoriteButtonUI(data.isFavorite);

    // Cards do Raio-X Educativo
    dom.xrayCardsContainer.innerHTML = '';
    if (data.educationalXray && data.educationalXray.length > 0) {
        data.educationalXray.forEach(item => {
            const card = document.createElement('div');
            card.className = 'xray-card';
            card.innerHTML = `
                <div class="xray-card-title">
                    <i data-lucide="check" style="width: 14px; height: 14px; color: #38bdf8;"></i>
                    <span>${item.technique}</span>
                </div>
                <div class="xray-card-desc">${item.explanation}</div>
            `;
            dom.xrayCardsContainer.appendChild(card);
        });
    }

    // Dicas
    dom.quickTipsContainer.innerHTML = '';
    if (data.quickTips && data.quickTips.length > 0) {
        data.quickTips.forEach(tip => {
            const tipEl = document.createElement('div');
            tipEl.className = 'tip-item';
            tipEl.innerHTML = `
                <i data-lucide="zap" style="width: 14px; height: 14px; flex-shrink: 0; margin-top: 2px;"></i>
                <span>${tip}</span>
            `;
            dom.quickTipsContainer.appendChild(tipEl);
        });
    }

    dom.playgroundArea.classList.remove('open');
    dom.councilArea.classList.remove('open');

    refreshIcons();
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

    showToast(state.currentPromptData.isFavorite ? 'Salvo nos favoritos.' : 'Removido dos favoritos.', 'info');
}

function updateFavoriteButtonUI(isFav) {
    if (isFav) {
        dom.favStarIcon.setAttribute('fill', '#f59e0b');
        dom.favStarIcon.style.color = '#f59e0b';
        dom.btnFavCurrent.querySelector('span').textContent = 'Favoritado';
    } else {
        dom.favStarIcon.removeAttribute('fill');
        dom.favStarIcon.style.color = 'currentColor';
        dom.btnFavCurrent.querySelector('span').textContent = 'Favoritar';
    }
}

// TESTE INDIVIDUAL RÁPIDO
async function handleSingleTestPrompt() {
    if (!state.currentPromptData) return;

    // Acha a primeira IA conectada ou a IA selecionada
    let provId = state.selectedForgingProvider !== 'offline' ? state.selectedForgingProvider : null;
    if (!provId || !state.apiKeys[provId]) {
        provId = Object.keys(state.apiKeys).find(p => !!state.apiKeys[p]);
    }

    if (!provId) {
        showToast('Configure ao menos uma chave de IA para testar ao vivo!', 'warning');
        openConnectionsModal('gemini');
        return;
    }

    const prov = AI_PROVIDERS[provId];
    dom.singleTestTitle.textContent = `Resposta em Tempo Real: ${prov.name}`;
    dom.playgroundArea.classList.add('open');
    dom.playgroundOutput.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; color: #93c5fd;">
            <i data-lucide="loader-2" class="animate-spin" style="width: 18px; height: 18px;"></i>
            <span>Enviando o prompt para ${prov.name}...</span>
        </div>
    `;
    refreshIcons();

    try {
        const response = await callUniversalAI(
            provId, 
            state.apiKeys[provId], 
            'Responda profissionalmente ao prompt com clareza e estrutura.', 
            state.currentPromptData.formattedPrompt, 
            false
        );
        dom.playgroundOutput.textContent = response;
    } catch (err) {
        dom.playgroundOutput.innerHTML = `
            <div style="color: #f87171;">
                <b>Erro ao executar teste com ${prov.name}:</b> ${err.message}<br><br>
                Verifique se a sua chave de API possui cotas e é válida.
            </div>
        `;
    }
}

// =======================================================
// CONSELHO DE IAS (DEBATE E CONSENSO CONJUNTO)
// =======================================================
async function handleCallCouncil() {
    if (!state.currentPromptData) return;

    // Obtém quais IAs estão com chave conectada
    const connectedProviders = Object.keys(state.apiKeys).filter(p => !!state.apiKeys[p]);

    // Requisito estrito: mínimo de 2 provedores
    if (connectedProviders.length < 2) {
        showToast('O Conselho precisa de ao menos 2 IAs conectadas. Configure o Groq ou Gemini para continuar.', 'warning');
        const missing = !state.apiKeys.groq ? 'groq' : 'gemini';
        openConnectionsModal(missing);
        return;
    }

    // Abre a Sala do Conselho
    dom.councilArea.classList.add('open');
    dom.councilArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Reseta visual
    dom.councilSpinner.style.display = 'inline-block';
    dom.councilStatusText.textContent = `Consultando ${connectedProviders.length} modelos conectados...`;
    dom.councilProposalsGrid.innerHTML = `
        <div style="color: var(--text-muted); font-size: 0.85rem; padding: 1rem;">
            Aguardando propostas individuais dos modelos...
        </div>
    `;
    dom.councilDebateSection.style.display = 'none';
    dom.councilConsensusSection.style.display = 'none';
    refreshIcons();

    try {
        const councilResult = await runAiCouncil({
            promptText: state.currentPromptData.formattedPrompt,
            connectedProviders: connectedProviders,
            apiKeys: state.apiKeys,
            onProgress: (prog) => {
                dom.councilStatusText.textContent = prog.text;
            }
        });

        // FASE 1: Renderiza Propostas Individuais
        dom.councilProposalsGrid.innerHTML = '';
        councilResult.proposals.forEach(p => {
            const prov = AI_PROVIDERS[p.providerId];
            const card = document.createElement('div');
            card.className = 'proposal-card';
            card.innerHTML = `
                <div class="proposal-card-header">
                    <span style="color: ${prov.badgeColor};">● ${p.providerName}</span>
                    <span style="font-size: 0.7rem; color: var(--text-muted);">${prov.model}</span>
                </div>
                <div class="proposal-content">${escapeHtml(p.content)}</div>
            `;
            dom.councilProposalsGrid.appendChild(card);
        });

        // FASE 2: Renderiza Debate
        if (councilResult.debate) {
            dom.councilDebateSection.style.display = 'block';
            dom.councilDebateContent.textContent = councilResult.debate;
        }

        // FASE 3: Renderiza Consenso Final
        if (councilResult.consensus) {
            dom.councilConsensusSection.style.display = 'flex';
            dom.councilConsensusContent.textContent = councilResult.consensus;
        }

        // Status Final
        dom.councilSpinner.style.display = 'none';
        dom.councilStatusText.textContent = `Sessão concluída. Consenso reunido a partir de ${councilResult.participatingCount} modelos.`;
        showToast('Consenso unificado gerado.', 'success');

    } catch (err) {
        console.error('Erro no Conselho de IAs:', err);
        dom.councilSpinner.style.display = 'none';
        dom.councilStatusText.textContent = `Falha na sessão do conselho: ${err.message}`;
        showToast('Erro no Conselho de IAs: ' + err.message, 'danger');
    }

    refreshIcons();
}

function handleCopyConsensus() {
    const text = dom.councilConsensusContent.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        showToast('Resposta de consenso copiada.', 'success');
    }).catch(() => {
        showToast('Erro ao copiar.', 'danger');
    });
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Histórico e Persistência
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
            <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted); font-size: 0.8rem;">
                ${state.activeHistoryTab === 'favs' ? 'Nenhum prompt favoritado ainda.' : 'Nenhum prompt no histórico.'}
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
                <button class="icon-btn-sm btn-item-fav ${item.isFavorite ? 'active-fav' : ''}" title="${item.isFavorite ? 'Desfavoritar' : 'Favoritar'}">
                    <i data-lucide="star" style="width: 14px; height: 14px;" ${item.isFavorite ? 'fill="#f59e0b"' : ''}></i>
                </button>
                <button class="icon-btn-sm btn-item-del" title="Excluir">
                    <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
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
            showToast('Prompt removido do histórico', 'info');
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
    }, 3500);
}
