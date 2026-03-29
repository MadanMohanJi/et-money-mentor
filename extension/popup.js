// State Variables
let currentTab = 'upload';
let currentTool = 'tax';
let uploadedBase64 = null;
let uploadedMimeType = null;

const RENDER_URL = "https://et-money-mentor-vmxa.onrender.com/api/analyze";

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-reset').addEventListener('click', resetApp);
    document.getElementById('tab-upload').addEventListener('click', () => switchTab('upload'));
    document.getElementById('tab-text').addEventListener('click', () => switchTab('text'));
    
    document.getElementById('section-upload').addEventListener('click', (e) => {
        if(e.target.id !== 'file-upload') document.getElementById('file-upload').click();
    });
    document.getElementById('file-upload').addEventListener('change', handleFileUpload);
    
    document.getElementById('analyze-btn').addEventListener('click', startAnalysis);
    
    document.getElementById('nav-tax').addEventListener('click', () => switchMainTool('tax'));
    document.getElementById('nav-mf').addEventListener('click', () => switchMainTool('mf'));
    document.getElementById('nav-fire').addEventListener('click', () => switchMainTool('fire'));
});

const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
};

function switchTab(tab) {
    currentTab = tab;
    document.getElementById('tab-upload').className = tab === 'upload' ? 'flex-1 py-2 text-sm font-semibold rounded-md bg-white shadow-sm text-red-600' : 'flex-1 py-2 text-sm font-semibold rounded-md text-gray-500';
    document.getElementById('tab-text').className = tab === 'text' ? 'flex-1 py-2 text-sm font-semibold rounded-md bg-white shadow-sm text-red-600' : 'flex-1 py-2 text-sm font-semibold rounded-md text-gray-500';
    document.getElementById('section-upload').classList.toggle('hidden', tab !== 'upload');
    document.getElementById('section-text').classList.toggle('hidden', tab !== 'text');
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('image-preview').src = e.target.result;
        document.getElementById('image-preview').classList.remove('hidden');
        uploadedBase64 = e.target.result.split(',')[1];
        uploadedMimeType = file.type;
    };
    reader.readAsDataURL(file);
}

function resetApp() {
    document.getElementById('input-view').classList.remove('hidden');
    document.getElementById('results-view').classList.add('hidden');
    document.getElementById('image-preview').classList.add('hidden');
    document.getElementById('error-message').classList.add('hidden');
    uploadedBase64 = null;
}

function switchMainTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.nav-btn').forEach(btn => { btn.classList.remove('text-red-600'); btn.classList.add('text-gray-400'); });
    document.getElementById(`nav-${tool}`).classList.replace('text-gray-400', 'text-red-600');
    
    const titles = {
        tax: ['Tax Wizard', 'Upload Form 16 to find deductions.'],
        mf: ['MF Portfolio X-Ray', 'Analyze mutual fund overlap & XIRR.'],
        fire: ['FIRE Path Planner', 'Calculate your retirement roadmap.']
    };
    document.getElementById('tool-title').innerText = titles[tool][0];
    document.getElementById('tool-desc').innerText = titles[tool][1];
    resetApp();
}

async function startAnalysis() {
    const textInput = document.getElementById('text-input').value.trim();
    if (currentTab === 'upload' && !uploadedBase64) return;
    
    document.getElementById('input-view').classList.add('hidden');
    document.getElementById('loading-view').classList.remove('hidden');
    document.getElementById('error-message').classList.add('hidden');

    let systemPrompt = "You are a professional financial AI. Return ONLY a JSON object. No conversational text.";
    if (currentTool === 'tax') {
        systemPrompt += ` Context: Indian Tax AY 2026-27. JSON Format: { "extractedData": { "grossSalary": 0, "total80C": 0, "hraExemption": 0, "otherDeductions": 0 }, "newRegime": { "taxableIncome": 0, "taxLiability": 0 }, "oldRegime": { "taxableIncome": 0, "taxLiability": 0 }, "recommendation": "string", "missingDeductionsFound": [] }`;
    } else if (currentTool === 'mf') {
        systemPrompt += ` Context: Mutual Funds. JSON Format: { "portfolioSummary": { "totalValue": 0, "topSectors": [] }, "metrics": { "estimatedXIRR": "string", "expenseRatioDrag": "string" }, "analysis": { "overlapWarning": "string", "rebalancingAction": "string" } }`;
    } else {
        systemPrompt += ` Context: FIRE Planning. JSON Format: { "fireMetrics": { "targetCorpus": 0, "yearsToRetirement": 0 }, "actionPlan": { "monthlySipRequired": 0, "emergencyFundTarget": 0 }, "assetAllocation": { "equity": 0, "debt": 0, "gold": 0 }, "advice": [] }`;
    }

    const payload = {
        systemPrompt: systemPrompt,
        userText: textInput || "Analyze the uploaded image.",
        imageBase64: currentTab === 'upload' ? uploadedBase64 : null,
        mimeType: currentTab === 'upload' ? uploadedMimeType : null
    };

    try {
        const response = await fetch(RENDER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Server error");

        // Safely parse the JSON string from Gemini
        const cleanJson = data.result.replace(/```json/gi, '').replace(/```/g, '').trim();
        const result = JSON.parse(cleanJson);

        document.getElementById('loading-view').classList.add('hidden');
        document.getElementById('results-view').classList.remove('hidden');

        if (currentTool === 'tax') displayTax(result);
        else if (currentTool === 'mf') displayMF(result);
        else displayFIRE(result);

    } catch (e) {
        console.error(e);
        document.getElementById('loading-view').classList.add('hidden');
        document.getElementById('input-view').classList.remove('hidden');
        const err = document.getElementById('error-message');
        err.innerText = "Error: " + e.message;
        err.classList.remove('hidden');
    }
}

function displayTax(data) {
    document.getElementById('tax-results').classList.remove('hidden');
    document.getElementById('mf-results').classList.add('hidden');
    document.getElementById('fire-results').classList.add('hidden');
    document.getElementById('res-gross').innerText = formatMoney(data.extractedData.grossSalary);
    document.getElementById('res-80c').innerText = formatMoney(data.extractedData.total80C);
    document.getElementById('res-hra').innerText = formatMoney(data.extractedData.hraExemption);
    document.getElementById('res-other').innerText = formatMoney(data.extractedData.otherDeductions);
    document.getElementById('res-old-tax').innerText = formatMoney(data.oldRegime.taxLiability);
    document.getElementById('res-new-tax').innerText = formatMoney(data.newRegime.taxLiability);
    document.getElementById('res-recommendation').innerText = data.recommendation;
    document.getElementById('res-missing').innerHTML = data.missingDeductionsFound.map(i => `<li>${i}</li>`).join('');
}

function displayMF(data) {
    document.getElementById('tax-results').classList.add('hidden');
    document.getElementById('mf-results').classList.remove('hidden');
    document.getElementById('fire-results').classList.add('hidden');
    document.getElementById('mf-value').innerText = formatMoney(data.portfolioSummary.totalValue);
    document.getElementById('mf-xirr').innerText = data.metrics.estimatedXIRR;
    document.getElementById('mf-drag').innerText = data.metrics.expenseRatioDrag;
    document.getElementById('mf-overlap').innerText = data.analysis.overlapWarning;
    document.getElementById('mf-rebalance').innerText = data.analysis.rebalancingAction;
}

function displayFIRE(data) {
    document.getElementById('tax-results').classList.add('hidden');
    document.getElementById('mf-results').classList.add('hidden');
    document.getElementById('fire-results').classList.remove('hidden');
    document.getElementById('fire-corpus').innerText = formatMoney(data.fireMetrics.targetCorpus);
    document.getElementById('fire-sip').innerText = formatMoney(data.actionPlan.monthlySipRequired);
    document.getElementById('fire-eq').innerText = data.assetAllocation.equity + '%';
    document.getElementById('fire-debt').innerText = data.assetAllocation.debt + '%';
    document.getElementById('fire-gold').innerText = data.assetAllocation.gold + '%';
    document.getElementById('fire-advice').innerHTML = data.advice.map(i => `<li>${i}</li>`).join('');
}