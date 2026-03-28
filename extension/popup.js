// State Variables
let currentTab = 'upload';
let currentTool = 'tax';
let uploadedBase64 = null;
let uploadedMimeType = null;

// Initialize all click events once the document is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Reset Button
    const btnReset = document.getElementById('btn-reset');
    if (btnReset) btnReset.addEventListener('click', resetApp);
    
    // Input Tabs
    const tabUpload = document.getElementById('tab-upload');
    const tabText = document.getElementById('tab-text');
    if (tabUpload) tabUpload.addEventListener('click', () => switchTab('upload'));
    if (tabText) tabText.addEventListener('click', () => switchTab('text'));
    
    // File Upload Area
    const sectionUpload = document.getElementById('section-upload');
    const fileInput = document.getElementById('file-upload');
    if (sectionUpload && fileInput) {
        sectionUpload.addEventListener('click', (e) => {
            if(e.target !== fileInput) {
                fileInput.click();
            }
        });
        fileInput.addEventListener('change', handleFileUpload);
    }
    
    // Main Action Button
    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) analyzeBtn.addEventListener('click', startAnalysis);
    
    // Export Button
    const btnExport = document.getElementById('btn-export');
    if (btnExport) {
        btnExport.addEventListener('click', () => {
            btnExport.innerHTML = `<i class="ph-bold ph-check-circle text-lg"></i> Successfully Exported!`;
            btnExport.classList.add('bg-green-100', 'text-green-700');
            setTimeout(() => {
                btnExport.innerHTML = `Export Report to ET Account`;
                btnExport.classList.remove('bg-green-100', 'text-green-700');
            }, 3000);
        });
    }
    
    // Bottom Navigation
    const navTax = document.getElementById('nav-tax');
    const navMf = document.getElementById('nav-mf');
    const navFire = document.getElementById('nav-fire');
    
    if (navTax) navTax.addEventListener('click', () => switchMainTool('tax'));
    if (navMf) navMf.addEventListener('click', () => switchMainTool('mf'));
    if (navFire) navFire.addEventListener('click', () => switchMainTool('fire'));
});

const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
};

function switchTab(tab) {
    currentTab = tab;
    const tabUpload = document.getElementById('tab-upload');
    const tabText = document.getElementById('tab-text');
    const sectionUpload = document.getElementById('section-upload');
    const sectionText = document.getElementById('section-text');

    tabUpload.className = tab === 'upload' 
        ? 'flex-1 py-2 text-sm font-semibold rounded-md bg-white shadow-sm text-red-600 transition' 
        : 'flex-1 py-2 text-sm font-semibold rounded-md text-gray-500 hover:text-gray-700 transition';
    
    tabText.className = tab === 'text' 
        ? 'flex-1 py-2 text-sm font-semibold rounded-md bg-white shadow-sm text-red-600 transition' 
        : 'flex-1 py-2 text-sm font-semibold rounded-md text-gray-500 hover:text-gray-700 transition';
    
    if (tab === 'upload') {
        sectionUpload.classList.remove('hidden');
        sectionText.classList.add('hidden');
    } else {
        sectionUpload.classList.add('hidden');
        sectionText.classList.remove('hidden');
    }
    document.getElementById('error-message').classList.add('hidden');
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const imgPreview = document.getElementById('image-preview');
        imgPreview.src = e.target.result;
        imgPreview.classList.remove('hidden');
        uploadedBase64 = e.target.result.split(',')[1];
        uploadedMimeType = file.type;
    };
    reader.readAsDataURL(file);
}

function resetApp() {
    document.getElementById('input-view').classList.remove('hidden');
    document.getElementById('results-view').classList.add('hidden');
    document.getElementById('error-message').classList.add('hidden');
    document.getElementById('image-preview').classList.add('hidden');
    document.getElementById('file-upload').value = '';
    document.getElementById('text-input').value = '';
    uploadedBase64 = null;
}

function switchMainTool(tool) {
    currentTool = tool;
    
    // Update Icons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-red-600');
        btn.classList.add('text-gray-400');
    });
    document.getElementById(`nav-${tool}`).classList.remove('text-gray-400');
    document.getElementById(`nav-${tool}`).classList.add('text-red-600');

    const titleEl = document.getElementById('tool-title');
    const descEl = document.getElementById('tool-desc');
    const textInput = document.getElementById('text-input');
    const fileUploadText = document.getElementById('file-upload-text');

    if(tool === 'tax') {
        titleEl.innerText = 'Tax Wizard';
        descEl.innerText = 'Upload Form 16 or type details to discover missing deductions.';
        textInput.placeholder = 'E.g., My gross salary is ₹18,00,000. I invest ₹1.5L in PPF, pay ₹30k for health insurance...';
        fileUploadText.innerHTML = 'Click to upload Form 16 or Salary Slip<br><span class="text-xs">(JPEG, PNG)</span>';
    } else if(tool === 'mf') {
        titleEl.innerText = 'MF Portfolio X-Ray';
        descEl.innerText = 'Upload CAMS statement to check overlap, XIRR & rebalancing.';
        textInput.placeholder = 'E.g., I have 5L in Parag Parikh Flexi, 3L in HDFC Midcap...';
        fileUploadText.innerHTML = 'Click to upload CAMS/KFintech Statement<br><span class="text-xs">(JPEG, PNG)</span>';
    } else if(tool === 'fire') {
        titleEl.innerText = 'FIRE Path Planner';
        descEl.innerText = 'Input age, income & expenses to get your retirement roadmap.';
        textInput.placeholder = 'E.g., I am 28, earn 1.5L/month, spend 50k, want to retire by 45.';
        fileUploadText.innerHTML = 'Click to upload current asset summary<br><span class="text-xs">(JPEG, PNG)</span>';
    }
    resetApp();
}

async function startAnalysis() {
    const textInput = document.getElementById('text-input').value.trim();
    if (currentTab === 'upload' && !uploadedBase64) { showError("Please upload an image first."); return; }
    if (currentTab === 'text' && !textInput) { showError("Please enter your details."); return; }

    document.getElementById('input-view').classList.add('hidden');
    document.getElementById('loading-view').classList.remove('hidden');
    document.getElementById('error-message').classList.add('hidden');

    let systemPrompt = "";
    if (currentTool === 'tax') {
        systemPrompt = `You are an expert Indian CA. Analyze data. Rules for AY 2026-27 (FY 25-26). Output ONLY valid JSON: { "extractedData": { "grossSalary": 0, "total80C": 0, "hraExemption": 0, "otherDeductions": 0 }, "newRegime": { "taxableIncome": 0, "taxLiability": 0 }, "oldRegime": { "taxableIncome": 0, "taxLiability": 0 }, "recommendation": "", "missingDeductionsFound": [""] }`;
    } else if (currentTool === 'mf') {
        systemPrompt = `You are a SEBI advisor. Analyze portfolio. Output ONLY valid JSON: { "portfolioSummary": { "totalValue": 0, "topSectors": [""] }, "metrics": { "estimatedXIRR": "", "expenseRatioDrag": "" }, "analysis": { "overlapWarning": "", "rebalancingAction": "" } }`;
    } else if (currentTool === 'fire') {
        systemPrompt = `You are a FIRE Planner. Calculate roadmap (12% equity, 6% inflation). Output ONLY valid JSON: { "fireMetrics": { "targetCorpus": 0, "yearsToRetirement": 0 }, "actionPlan": { "monthlySipRequired": 0, "emergencyFundTarget": 0 }, "assetAllocation": { "equity": 0, "debt": 0, "gold": 0 }, "advice": [""] }`;
    }

    const parts = [{ text: systemPrompt }];
    if (currentTab === 'upload') {
        parts.push({ inlineData: { mimeType: uploadedMimeType, data: uploadedBase64 } });
        parts.push({ text: "Analyze this image."});
    } else {
        parts.push({ text: "User Input: " + textInput });
    }

    // REMOVED generationConfig to avoid "Unknown name responseMimeType" errors
    const payload = { contents: [{ role: "user", parts: parts }] };

    // Update this to your live Render URL!
    const url = `https://et-money-mentor-vmxa.onrender.com/api/analyze`; 
    
    try {
        const response = await fetch(url, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        });
        
        if (!response.ok) throw new Error("Server error. Check backend logs.");
        
        const data = await response.json();
        let rawText = data.candidates[0].content.parts[0].text;
        
        // Sanitize LLM output
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiResult = JSON.parse(rawText);
        
        if (currentTool === 'tax') displayTaxResults(aiResult);
        else if (currentTool === 'mf') displayMFResults(aiResult);
        else if (currentTool === 'fire') displayFIREResults(aiResult);

    } catch (error) {
        console.error(error);
        document.getElementById('loading-view').classList.add('hidden');
        document.getElementById('input-view').classList.remove('hidden');
        showError("Analysis failed. Make sure your Render backend is live and the API key is correct.");
    }
}

function showError(msg) {
    const errDiv = document.getElementById('error-message');
    errDiv.innerText = msg;
    errDiv.classList.remove('hidden');
}

function displayTaxResults(data) {
    document.getElementById('loading-view').classList.add('hidden');
    document.getElementById('results-view').classList.remove('hidden');
    document.getElementById('tax-results').classList.remove('hidden');
    document.getElementById('mf-results').classList.add('hidden');
    document.getElementById('fire-results').classList.add('hidden');

    document.getElementById('res-gross').innerText = formatMoney(data.extractedData.grossSalary);
    document.getElementById('res-80c').innerText = formatMoney(data.extractedData.total80C);
    document.getElementById('res-hra').innerText = formatMoney(data.extractedData.hraExemption);
    document.getElementById('res-other').innerText = formatMoney(data.extractedData.otherDeductions);
    document.getElementById('res-old-tax').innerText = formatMoney(data.oldRegime.taxLiability);
    document.getElementById('res-new-tax').innerText = formatMoney(data.newRegime.taxLiability);
    document.getElementById('res-old-taxable').innerText = formatMoney(data.oldRegime.taxableIncome);
    document.getElementById('res-new-taxable').innerText = formatMoney(data.newRegime.taxableIncome);

    document.getElementById('res-recommendation').innerText = data.recommendation;
    const list = document.getElementById('res-missing');
    list.innerHTML = data.missingDeductionsFound.map(i => `<li class="flex items-start gap-2"><i class="ph-bold ph-arrow-right text-red-400 mt-1"></i><span>${i}</span></li>`).join('');
}

function displayMFResults(data) {
    document.getElementById('loading-view').classList.add('hidden');
    document.getElementById('results-view').classList.remove('hidden');
    document.getElementById('tax-results').classList.add('hidden');
    document.getElementById('fire-results').classList.add('hidden');
    document.getElementById('mf-results').classList.remove('hidden');

    document.getElementById('mf-value').innerText = formatMoney(data.portfolioSummary.totalValue);
    document.getElementById('mf-xirr').innerText = data.metrics.estimatedXIRR;
    document.getElementById('mf-drag').innerText = data.metrics.expenseRatioDrag;
    document.getElementById('mf-overlap').innerText = data.analysis.overlapWarning;
    document.getElementById('mf-rebalance').innerText = data.analysis.rebalancingAction;
}

function displayFIREResults(data) {
    document.getElementById('loading-view').classList.add('hidden');
    document.getElementById('results-view').classList.remove('hidden');
    document.getElementById('tax-results').classList.add('hidden');
    document.getElementById('mf-results').classList.add('hidden');
    document.getElementById('fire-results').classList.remove('hidden');

    document.getElementById('fire-corpus').innerText = formatMoney(data.fireMetrics.targetCorpus);
    document.getElementById('fire-years').innerText = data.fireMetrics.yearsToRetirement;
    document.getElementById('fire-sip').innerText = formatMoney(data.actionPlan.monthlySipRequired);
    document.getElementById('fire-eq').innerText = data.assetAllocation.equity + '%';
    document.getElementById('fire-debt').innerText = data.assetAllocation.debt + '%';
    document.getElementById('fire-gold').innerText = data.assetAllocation.gold + '%';
    document.getElementById('fire-advice').innerHTML = data.advice.map(i => `<li class="flex items-start gap-2"><i class="ph-bold ph-check text-purple-500 mt-1"></i><span>${i}</span></li>`).join('');
}