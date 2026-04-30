document.addEventListener('DOMContentLoaded', () => {
    const solveBtn = document.getElementById('solve-btn');
    const problemInput = document.getElementById('problem-input');
    const loading = document.getElementById('loading');
    const resultSection = document.getElementById('result-section');
    const solutionOutput = document.getElementById('solution-output');
    const explanationOutput = document.getElementById('explanation-output');
    const solutionContainer = document.getElementById('solution-container');
    const explanationContainer = document.getElementById('explanation-container');
    const toggleHistoryBtn = document.getElementById('toggle-history-btn');
    const historyContainer = document.getElementById('history-container');
    
    // Modal elements
    const aboutLink = document.getElementById('about-link');
    const aboutModal = document.getElementById('about-modal');
    const closeModal = document.querySelector('.close-modal');

    solveBtn.addEventListener('click', solveProblem);
    problemInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') solveProblem();
    });

    toggleHistoryBtn.addEventListener('click', async () => {
        if (historyContainer.classList.contains('hidden')) {
            await loadHistory();
            historyContainer.classList.remove('hidden');
            toggleHistoryBtn.textContent = 'Hide History';
        } else {
            historyContainer.classList.add('hidden');
            toggleHistoryBtn.textContent = 'View History';
        }
    });

    // Modal listeners
    aboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        aboutModal.classList.remove('hidden');
    });

    closeModal.addEventListener('click', () => {
        aboutModal.classList.add('hidden');
    });

    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            aboutModal.classList.add('hidden');
        }
    });

    async function solveProblem() {
        const problem = problemInput.value.trim();
        if (!problem) return;

        // Reset UI & Remove animations
        resultSection.classList.add('hidden');
        solutionContainer.classList.remove('animate-reveal', 'delay-1');
        explanationContainer.classList.remove('animate-reveal', 'delay-2');
        loading.classList.remove('hidden');
        solutionOutput.innerHTML = '';
        explanationOutput.innerHTML = '';

        try {
            const response = await fetch('/solve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ problem })
            });

            const data = await response.json();

            loading.classList.add('hidden');

            if (response.ok) {
                solutionOutput.innerHTML = `<div style="font-size: 1.3rem; font-weight: 600; padding: 10px 0;">\\[ ${data.solution} \\]</div>`;
                
                // Parse markdown to HTML
                explanationOutput.innerHTML = marked.parse(data.explanation);
                
                // Trigger MathJax typeset
                if (window.MathJax) {
                    MathJax.typesetPromise([solutionOutput, explanationOutput]).catch(function (err) {
                        console.error('MathJax error:', err.message);
                    });
                }
                
                // Show results and add animation classes
                resultSection.classList.remove('hidden');
                
                // Force reflow
                void resultSection.offsetWidth;
                
                solutionContainer.classList.add('animate-reveal', 'delay-1');
                explanationContainer.classList.add('animate-reveal', 'delay-2');
                
                // Refresh history if it's visible
                if (!historyContainer.classList.contains('hidden')) {
                    loadHistory();
                }
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (err) {
            loading.classList.add('hidden');
            alert(`Network or server error: ${err.message}`);
        }
    }

    async function loadHistory() {
        historyContainer.innerHTML = `
            <div style="display:flex; justify-content:center; padding:20px;">
                <div class="premium-spinner" style="width:30px;height:30px;">
                    <div class="spinner-ring" style="border-width:2px;"></div>
                    <div class="spinner-ring" style="border-width:2px;"></div>
                </div>
            </div>`;
        try {
            const response = await fetch('/api/history');
            const data = await response.json();
            
            historyContainer.innerHTML = '';
            if (!Array.isArray(data) || data.length === 0) {
                historyContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted);">No history found.</p>';
                return;
            }

            // Reverse to show newest first
            data.reverse().forEach((item, index) => {
                const date = new Date(item.timestamp).toLocaleString();
                const div = document.createElement('div');
                div.className = 'history-item';
                div.innerHTML = `
                    <div class="history-item-date">${date}</div>
                    <div class="history-item-problem">${item.problem}</div>
                    <div style="color:#e2e8f0;"><strong>Solution:</strong> ${item.solution}</div>
                `;
                
                const btn = document.createElement('button');
                btn.textContent = 'Show Explanation';
                btn.className = 'btn-secondary';
                btn.style.marginTop = '16px';
                btn.style.padding = '8px 16px';
                btn.style.fontSize = '0.9rem';
                
                const expDiv = document.createElement('div');
                expDiv.className = 'hidden';
                expDiv.style.marginTop = '16px';
                expDiv.style.padding = '20px';
                expDiv.style.background = 'rgba(0,0,0,0.4)';
                expDiv.style.borderRadius = '12px';
                expDiv.style.borderLeft = '3px solid var(--accent)';
                expDiv.id = `history-exp-${index}`;
                expDiv.innerHTML = marked.parse(item.explanation);
                
                btn.onclick = () => {
                    expDiv.classList.toggle('hidden');
                    btn.textContent = expDiv.classList.contains('hidden') ? 'Show Explanation' : 'Hide Explanation';
                    if (!expDiv.classList.contains('hidden') && window.MathJax) {
                        MathJax.typesetPromise([expDiv]).catch(function (err) {
                            console.error('MathJax error:', err.message);
                        });
                    }
                };
                
                div.appendChild(btn);
                div.appendChild(expDiv);
                historyContainer.appendChild(div);
            });
        } catch (err) {
            historyContainer.innerHTML = `<p style="color:#ef4444; text-align:center;">Error loading history: ${err.message}</p>`;
        }
    }
});
