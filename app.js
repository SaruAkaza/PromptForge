/**
 * PromptForge - Controlador Principal da Aplicação
 */

// Estado da Aplicação
const state = {
    apiKey: localStorage.getItem('promptforge_gemini_api_key') || '',
    selectedCategory: 'coding',
    selectedTone: 'technical',
    currentPromptData: null,
    history: JSON.parse(localStorage.getItem('promptforge_history') || '[]'),
    activeTab: 'recent',
    isGenerating: false,
    isTesting: false
};

// Elementos DOM
const dom = {
    rawIdeaInput: document.getElementById('rawIdeaInput'),
    categoryContainer: document.getElementById('categoryContainer'),
    toneSelect: document.getElementById('toneSelect'),
    btnForge: document.getElementById('btnForge'),
    forgeBtnText: document.getElementById('forgeBtnText'),
    forgeIcon: document.getElementById('forgeIcon'),
    
    emptyState: document.getElementById('emptyState'),
    resultContent: document.getElementById('resultContent'),
    promptTitle: document.getElementById('promptTitle'),
    badgeCategory: document.getElementById('badgeCategory'),
    badgeTone: document.getElementById('badgeTone'),
    promptTextDisplay: document.getElementById('promptTextDisplay'),
    xrayCardsContainer: document.getElementById('xrayCardsContainer'),
    quickTipsContainer: document.getElementById('quickTipsContainer'),
    
    btnCopyPrompt: document.getElementById('btnCopyPrompt'),
    btnFavCurrent: document.getElementById('btnFavCurrent'),
    favStarIcon: document.getElementById('favStarIcon'),
    btnTestPrompt: document.getElementById('btnTestPrompt'),
    
    playgroundArea: document.getElementById('playgroundArea'),
    playgroundOutput: document.getElementById('playgroundOutput'),
    btnClosePlayground: document.getElementById('btnClosePlayground'),
    
    historyList: document.getElementById('historyList'),
    tabRecent: document.getElementById('tabRecent'),
    tabFavs: document.getElementById('tabFavs'),
    
    btnOpenSettings: document.getElementById('btnOpenSettings'),
    settingsModal: document.getElementById('settingsModal'),
    btnCloseSettings: document.getElementById('btnCloseSettings'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    btnSaveApiKey: document.getElementById('btnSaveApiKey'),
    btnClearApiKey: document.getElementById('btnClearApiKey'),
    apiKeyStatusText: document.getElementById('apiKeyStatusText'),
    
    btnOpenGuide: document.getElementById('btnOpenGuide'),
    guideModal: document.getElementById('guideModal'),
    btnCloseGuide: document.getElementById('btnCloseGuide'),
    btnGotItGuide: document.getElementById('btnGotItGuide'),
    
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initCategories();
    initTones();
    updateApiKeyUI();
    renderHistory();
    setupEventListeners();
    refreshIcons();
});

function refreshIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Renderiza os seletores de categoria
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

// Renderiza o select de tons
function initTones() {
    dom.toneSelect.innerHTML = '';
    Object.values(PROMPT_TONES).forEach(tone => {
        const opt = document.createElement('option');
        opt.value = tone.id;
        opt.textContent = `${tone.name} — ${tone.description}`;
        dom.toneSelect.appendChild(opt);
    });
    dom.toneSelect.value = state.selectedTone;
    dom.toneSelect.addEventListener('change', (e) => {
        state.selectedTone = e.target.value;
    });
}

// Configura ouvintes de eventos
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

    // Botão Forjar
    dom.btnForge.addEventListener('click', handleForgePrompt);

    // Enter com Ctrl no textarea
    dom.rawIdeaInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleForgePrompt();
        }
    });

    // Copiar Prompt
    dom.btnCopyPrompt.addEventListener('click', handleCopyPrompt);

    // Favoritar Prompt Atual
    dom.btnFavCurrent.addEventListener('click', handleToggleFavoriteCurrent);

    // Testar Prompt no Gemini
    dom.btnTestPrompt.addEventListener('click', handleTestPrompt);
    dom.btnClosePlayground.addEventListener('click', () => {
        dom.playgroundArea.classList.remove('open');
    });

    // Abas de Histórico
    dom.tabRecent.addEventListener('click', () => {
        state.activeTab = 'recent';
        dom.tabRecent.classList.add('active');
        dom.tabFavs.classList.remove('active');
        renderHistory();
    });

    dom.tabFavs.addEventListener('click', () => {
        state.activeTab = 'favs';
        dom.tabFavs.classList.add('active');
        dom.tabRecent.classList.remove('active');
        renderHistory();
    });

    // Modal de Configurações
    dom.btnOpenSettings.addEventListener('click', () => {
        dom.apiKeyInput.value = state.apiKey;
        dom.settingsModal.classList.add('open');
    });

    dom.btnCloseSettings.addEventListener('click', () => {
        dom.settingsModal.classList.remove('open');
    });

    dom.btnSaveApiKey.addEventListener('click', () => {
        const key = dom.apiKeyInput.value.trim();
        state.apiKey = key;
        if (key) {
            localStorage.setItem('promptforge_gemini_api_key', key);
            showToast('Chave de API do Gemini salva com sucesso!', 'success');
        } else {
            localStorage.removeItem('promptforge_gemini_api_key');
        }
        updateApiKeyUI();
        dom.settingsModal.classList.remove('open');
    });

    dom.btnClearApiKey.addEventListener('click', () => {
        state.apiKey = '';
        dom.apiKeyInput.value = '';
        localStorage.removeItem('promptforge_gemini_api_key');
        updateApiKeyUI();
        showToast('Chave removida!', 'info');
        dom.settingsModal.classList.remove('open');
    });

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

// Atualiza o visual da Chave de API no cabeçalho
function updateApiKeyUI() {
    if (state.apiKey) {
        dom.apiKeyStatusText.textContent = 'Gemini Ativo 🟢';
        dom.btnOpenSettings.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        dom.btnOpenSettings.style.color = '#6ee7b7';
    } else {
        dom.apiKeyStatusText.textContent = 'Configurar Gemini API';
        dom.btnOpenSettings.style.borderColor = 'var(--border-color)';
        dom.btnOpenSettings.style.color = 'var(--text-secondary)';
    }
}

// Lógica de Forjar Prompt
async function handleForgePrompt() {
    const rawIdea = dom.rawIdeaInput.value.trim();
    if (!rawIdea) {
        showToast('Digite uma ideia ou frase primeiro!', 'warning');
        dom.rawIdeaInput.focus();
        return;
    }

    setGeneratingState(true);

    try {
        let resultData = null;

        // Se houver chave API, tentamos chamar o Gemini
        if (state.apiKey) {
            try {
                resultData = await callGeminiMetaPrompt(rawIdea, state.selectedCategory, state.selectedTone, state.apiKey);
            } catch (err) {
                console.warn('Erro ao chamar Gemini API, usando gerador offline inteligente:', err);
                showToast('Falha na conexão com API. Usando motor estrutural inteligente.', 'warning');
                resultData = generateOfflinePrompt(rawIdea, state.selectedCategory, state.selectedTone);
            }
        } else {
            // Se não houver chave, usa o gerador estrutural offline
            resultData = generateOfflinePrompt(rawIdea, state.selectedCategory, state.selectedTone);
            showToast('Prompt gerado com o motor estrutural! Adicione sua chave Gemini para IA adaptativa.', 'info');
        }

        // Adiciona metadados
        resultData.id = 'pf_' + Date.now();
        resultData.createdAt = new Date().toISOString();
        resultData.category = state.selectedCategory;
        resultData.tone = state.selectedTone;
        resultData.rawIdea = rawIdea;
        resultData.isFavorite = false;

        // Atualiza estado e exibe resultado
        state.currentPromptData = resultData;
        displayPromptResult(resultData);

        // Salva no histórico
        saveToHistory(resultData);

    } catch (error) {
        console.error('Erro ao forjar prompt:', error);
        showToast('Ocorreu um erro ao forjar o prompt: ' + error.message, 'danger');
    } finally {
        setGeneratingState(false);
    }
}

// Chamada à API do Google Gemini
async function callGeminiMetaPrompt(rawIdea, category, tone, apiKey) {
    const promptInstructions = buildMetaPromptRequest(rawIdea, category, tone);
    
    // Modelos com tentativa em cascata (2.5-flash -> 1.5-flash)
    const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
    let lastError = null;

    for (const model of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptInstructions }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048,
                        responseMimeType: 'application/json'
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!textResponse) throw new Error('Resposta vazia da API');

            // Parse seguro do JSON
            const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            return parsed;
        } catch (err) {
            console.warn(`Tentativa com modelo ${model} falhou:`, err.message);
            lastError = err;
        }
    }

    throw lastError || new Error('Não foi possível conectar aos modelos do Gemini.');
}

// Renderiza o resultado na tela
function displayPromptResult(data) {
    dom.emptyState.style.display = 'none';
    dom.resultContent.style.display = 'flex';

    dom.promptTitle.textContent = data.title || 'Prompt Mestre Gerado';
    
    const catObj = PROMPT_CATEGORIES[data.category] || PROMPT_CATEGORIES.coding;
    const toneObj = PROMPT_TONES[data.tone] || PROMPT_TONES.technical;

    dom.badgeCategory.textContent = catObj.name;
    dom.badgeTone.textContent = toneObj.name;

    dom.promptTextDisplay.textContent = data.formattedPrompt;

    // Atualiza botão de favoritos
    updateFavoriteButtonUI(data.isFavorite);

    // Renderiza Cards do Raio-X Educativo
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

    // Renderiza Dicas Rápidas
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

    // Esconde o playground se estava aberto de outro prompt
    dom.playgroundArea.classList.remove('open');

    refreshIcons();
}

// Copiar Prompt para a Área de Transferência
function handleCopyPrompt() {
    if (!state.currentPromptData) return;
    navigator.clipboard.writeText(state.currentPromptData.formattedPrompt).then(() => {
        showToast('Prompt copiado! Cole agora no ChatGPT, Claude ou Gemini.', 'success');
    }).catch(err => {
        console.error('Falha ao copiar:', err);
        showToast('Erro ao copiar para a área de transferência', 'danger');
    });
}

// Alternar Favorito no Prompt Atual
function handleToggleFavoriteCurrent() {
    if (!state.currentPromptData) return;
    
    state.currentPromptData.isFavorite = !state.currentPromptData.isFavorite;
    updateFavoriteButtonUI(state.currentPromptData.isFavorite);

    // Atualiza no array de histórico
    const item = state.history.find(h => h.id === state.currentPromptData.id);
    if (item) {
        item.isFavorite = state.currentPromptData.isFavorite;
        persistHistory();
        renderHistory();
    }

    if (state.currentPromptData.isFavorite) {
        showToast('Adicionado aos Favoritos! ⭐', 'success');
    } else {
        showToast('Removido dos Favoritos', 'info');
    }
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

// Testar Prompt ao Vivo no Gemini
async function handleTestPrompt() {
    if (!state.currentPromptData) return;

    if (!state.apiKey) {
        showToast('Para testar ao vivo, configure sua chave do Gemini!', 'warning');
        dom.settingsModal.classList.add('open');
        return;
    }

    dom.playgroundArea.classList.add('open');
    dom.playgroundOutput.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; color: #93c5fd;">
            <i data-lucide="loader-2" class="animate-spin" style="width: 18px; height: 18px;"></i>
            <span>Enviando o prompt para o Gemini e aguardando resposta...</span>
        </div>
    `;
    refreshIcons();

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${state.apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: state.currentPromptData.formattedPrompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048
                }
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Nenhuma resposta retornada.';
        dom.playgroundOutput.textContent = outputText;

    } catch (err) {
        dom.playgroundOutput.innerHTML = `
            <div style="color: #f87171;">
                <b>Erro ao executar teste:</b> ${err.message}<br><br>
                Verifique se sua chave da API do Gemini é válida e possui cotas disponíveis.
            </div>
        `;
    }
}

// Histórico e Persistência
function saveToHistory(promptData) {
    // Insere no início
    state.history.unshift(promptData);
    // Limita aos 50 mais recentes
    if (state.history.length > 50) {
        state.history.pop();
    }
    persistHistory();
    renderHistory();
}

function persistHistory() {
    localStorage.setItem('promptforge_history', JSON.stringify(state.history));
}

function renderHistory() {
    dom.historyList.innerHTML = '';

    const list = state.activeTab === 'favs'
        ? state.history.filter(item => item.isFavorite)
        : state.history;

    if (list.length === 0) {
        dom.historyList.innerHTML = `
            <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted); font-size: 0.8rem;">
                ${state.activeTab === 'favs' ? 'Nenhum prompt favoritado ainda.' : 'Nenhum prompt no histórico.'}
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

        // Carregar ao clicar no título
        itemEl.querySelector('.history-item-title').addEventListener('click', () => {
            state.currentPromptData = item;
            dom.rawIdeaInput.value = item.rawIdea || '';
            state.selectedCategory = item.category || 'coding';
            state.selectedTone = item.tone || 'technical';
            initCategories();
            dom.toneSelect.value = state.selectedTone;
            displayPromptResult(item);
        });

        // Alternar favorito do item
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

        // Excluir item
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

// Estados de Carregamento
function setGeneratingState(isGen) {
    state.isGenerating = isGen;
    dom.btnForge.disabled = isGen;
    if (isGen) {
        dom.forgeBtnText.textContent = 'Forjando Contexto com IA...';
        dom.forgeIcon.classList.add('animate-spin');
    } else {
        dom.forgeBtnText.textContent = 'Forjar Prompt Mestre';
        dom.forgeIcon.classList.remove('animate-spin');
    }
}

// Notificações Toast
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
