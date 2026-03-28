// State Variables
let currentTab = 'upload';
let currentTool = 'tax';
let uploadedBase64 = null;
let uploadedMimeType = null;

// Initialize all click events once the document is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-reset').addEventListener('click', resetApp);
    
    document.getElementById('tab-upload').addEventListener('click', () => switchTab('upload'));
    document.getElementById('tab-text').addEventListener('click', () => switchTab('text'));
    
    // Fixed upload click logic to prevent double-firing
    document.getElementById('section-upload').addEventListener('click', (e) => {
        if(e.target.id !== 'file-upload') {
            document.getElementById('file-upload').click();
        }
    });
    document.getElementById('file-upload').addEventListener('change', handleFileUpload);
    
    document.getElementById('analyze-btn').addEventListener('click', startAnalysis);
    
    document.getElementById('btn-export').addEventListener('click', () => {
        const btn = document.getElementById('btn-export');
        btn.innerHTML = `<i class="ph-bold ph-check-circle text-lg"></i> Successfully Exported!`;
        btn.classList.replace('bg-gray-100', 'bg-green-100');
        btn.classList.replace('text-gray-700', 'text-green-700');
        setTimeout(() => {
            btn.innerHTML = `Export Report to ET Account`;
            btn.classList.replace('bg-green-100', 'bg-gray-100');
            btn.classList.replace('text-green-700', 'text-gray-700');
        }, 3000);
    });
    
    document.getElementById('nav-tax').addEventListener('click', () => switchMainTool('tax'));
    document.getElementById('nav-mf').addEventListener('click', () => switchMainTool('mf'));
    document.getElementById('nav-fire').addEventListener('click', () => switchMainTool('fire'));
});

const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
};

function switchTab(tab) {
    currentTab = tab;
    document.getElementById('tab-upload').className = tab === 'upload' ? 'flex-1 py-2 text-sm font-semibold rounded-md bg-white shadow-sm text-red-600 transition' : 'flex-1 py-2 text-sm font-semibold rounded-md text-gray-500 hover:text-gray-700 transition';
    document.getElementById('tab-text').className = tab === 'text' ? 'flex-1 py-2 text-sm font-semibold rounded-md bg-white shadow-sm text-red-600 transition' : 'flex-1 py-2 text-sm font-semibold rounded-md text-gray-500 hover:text-gray-700 transition';
    document.getElementById('section-upload').classList.toggle('hidden', tab !== 'upload');
    document.getElementById('section-text').classList.toggle('hidden', tab !== 'text');
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
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.replace('text-red-600', 'text-gray-400'));
    document.getElementById(`nav-${tool}`).classList.replace('text-gray-400', 'text-red-600');

    const titleEl = document.getElementById('tool-title');
    const descEl = document.getElementById('tool-desc');
    const textInput = document.getElementById('text-input');
    const fileUploadText = document.getElementById('file-upload-text');

    if(tool === 'tax') {
        titleEl.innerText = 'Tax Wizard';
        descEl.innerText = 'Upload Form 16 or type details to discover missing deductions.';
        textInput.placeholder = 'E.g., My gross salary is ₹18,00,000. I invest ₹1.5L in PPF, pay ₹30k for health insurance, and pay ₹25k monthly rent.';
        fileUploadText.innerHTML = 'Click to upload Form 16 or Salary Slip<br><span class="text-xs">(JPEG, PNG)</span>';
    } else if(tool === 'mf') {
        titleEl.innerText = 'MF Portfolio X-Ray';
        descEl.innerText = 'Upload CAMS statement to check overlap, XIRR & rebalancing.';
        textInput.placeholder = 'E.g., I have 5L in Parag Parikh Flexi, 3L in HDFC Midcap, 2L in SBI Small Cap...';
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
    if (currentTab === 'text' && !textInput) { showError("Please enter your financial details."); return; }

    document.getElementById('input-view').classList.add('hidden');
    document.getElementById('loading-view').classList.remove('hidden');
    document.getElementById('error-message').classList.add('hidden');

    let systemPrompt = "";
    if (currentTool === 'tax') {
        systemPrompt = `You are an expert Indian Chartered Accountant acting as an AI Money Mentor. 
        Analyze the provided financial document image OR the text description. Extract the user's financial profile.
        CRITICAL RULES FOR AY 2026-27 (FY 2025-26):
        - New Regime: Standard Deduction ₹75,000. Slabs: 0-4L(0%), 4-8L(5%), 8-12L(10%), 12-16L(15%), 16-20L(20%), 20-24L(25%), >24L(30%). Rebate u/s 87A up to ₹12L income.
        - Old Regime: Standard Deduction ₹50,000. Slabs (age < 60): 0-2.5L(0%), 2.5-5L(5%), 5-10L(20%), >10L(30%). Rebate u/s 87A up to ₹5L income.
        - Add 4% Health & Education Cess to final tax liability in both regimes.
        - If data is missing or vague, make reasonable assumptions for a salaried individual.
        Output ONLY a valid JSON object matching exactly this schema:
        { "extractedData": { "grossSalary": number, "total80C": number, "hraExemption": number, "otherDeductions": number }, "newRegime": { "taxableIncome": number, "taxLiability": number }, "oldRegime": { "taxableIncome": number, "taxLiability": number }, "recommendation": "string", "missingDeductionsFound": ["string"] }`;
    } else if (currentTool === 'mf') {
        systemPrompt = `You are a SEBI registered investment advisor acting as an AI Money Mentor. Analyze the provided mutual fund statement image OR text description. Calculate a realistic portfolio summary, identify overlapping funds/sectors, and flag high expense ratios.
        Output ONLY a valid JSON object matching exactly this schema:
        { "portfolioSummary": { "totalValue": number, "topSectors": ["string"] }, "metrics": { "estimatedXIRR": "string", "expenseRatioDrag": "string" }, "analysis": { "overlapWarning": "string", "rebalancingAction": "string" } }`;
    } else if (currentTool === 'fire') {
        systemPrompt = `You are an expert FIRE Planner acting as an AI Money Mentor. Analyze the provided user profile text OR image. Extract age, income, and expenses to build a retirement roadmap. Assume an inflation rate of 6% and conservative equity returns of 12%. Calculate required corpus based on the 4% rule.
        Output ONLY a valid JSON object matching exactly this schema:
        { "fireMetrics": { "targetCorpus": number, "yearsToRetirement": number }, "actionPlan": { "monthlySipRequired": number, "emergencyFundTarget": number }, "assetAllocation": { "equity": number, "debt": number, "gold": number }, "advice": ["string"] }`;
    }

    const parts = [{ text: systemPrompt }];
    if (currentTab === 'upload') {
        parts.push({ inlineData: { mimeType: uploadedMimeType, data: uploadedBase64 } });
        parts.push({ text: "Please analyze the attached image."});
    } else {
        parts.push({ text: "\n\nUser Input Data: " + textInput });
    }

    const payload = { contents: [{ role: "user", parts: parts }], generationConfig: { responseMimeType: "application/json" } };

    // IMPORTANT: Make sure this URL points to your Render backend or localhost!
    const url = `https://et-money-mentor-vmxa.onrender.com/api/analyze`; 
    
    let retries = 2; 
    let success = false;
    let aiResult = null;

    while (retries > 0 && !success) {
        try {
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error("API call failed");
            const data = await response.json();
            let rawText = data.candidates[0].content.parts[0].text;
            rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            aiResult = JSON.parse(rawText);
            success = true;
        } catch (error) {
            console.error("Attempt failed:", error);
            retries--;
            if (retries === 0) {
                document.getElementById('loading-view').classList.add('hidden');
                document.getElementById('input-view').classList.remove('hidden');
                showError("Analysis failed. Make sure your local server is running, or update the URL to your live Render backend.");
                return;
            }
            await new Promise(r => setTimeout(r, 500)); 
        }
    }

    if (success && aiResult) {
        if (currentTool === 'tax') displayTaxResults(aiResult);
        else if (currentTool === 'mf') displayMFResults(aiResult);
        else if (currentTool === 'fire') displayFIREResults(aiResult);
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
    document.getElementById('res-old-taxable').innerText = formatMoney(data.oldRegime.taxableIncome);
    document.getElementById('res-old-tax').innerText = formatMoney(data.oldRegime.taxLiability);
    document.getElementById('res-new-taxable').innerText = formatMoney(data.newRegime.taxableIncome);
    document.getElementById('res-new-tax').innerText = formatMoney(data.newRegime.taxLiability);

    const oldCard = document.getElementById('card-old');
    const newCard = document.getElementById('card-new');
    oldCard.className = "border rounded-xl p-4 flex flex-col relative transition-all";
    newCard.className = "border rounded-xl p-4 flex flex-col relative transition-all";

    if (data.oldRegime.taxLiability < data.newRegime.taxLiability) {
        oldCard.classList.add('border-green-500', 'bg-green-50', 'shadow-md');
        document.getElementById('res-old-tax').classList.replace('text-gray-900', 'text-green-700');
    } else {
        newCard.classList.add('border-green-500', 'bg-green-50', 'shadow-md');
        document.getElementById('res-new-tax').classList.replace('text-gray-900', 'text-green-700');
    }

    document.getElementById('res-recommendation').innerText = data.recommendation;
    const missingList = document.getElementById('res-missing');
    missingList.innerHTML = '';
    if (data.missingDeductionsFound && data.missingDeductionsFound.length > 0) {
        data.missingDeductionsFound.forEach(item => {
            const li = document.createElement('li');
            li.className = "flex items-start gap-2";
            li.innerHTML = `<i class="ph-bold ph-arrow-right text-red-400 mt-1"></i><span>${item}</span>`;
            missingList.appendChild(li);
        });
    } else {
        missingList.innerHTML = `<li class="text-gray-500 italic">Your tax profile looks fully optimized!</li>`;
    }
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

    const adviceList = document.getElementById('fire-advice');
    adviceList.innerHTML = '';
    data.advice.forEach(item => {
        const li = document.createElement('li');
        li.className = "flex items-start gap-2";
        li.innerHTML = `<i class="ph-bold ph-check text-purple-500 mt-1"></i><span>${item}</span>`;
        adviceList.appendChild(li);
    });
}