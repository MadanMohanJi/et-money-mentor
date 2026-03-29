ET Money Mentor AI - Chrome Extension

Submission for the ET AI Hackathon 2026
Solving Problem Statement 9: AI Money Mentor


⚠️ Note to Judges: API Key & Architecture

For the sake of a frictionless evaluation experience and to avoid "cold-start" delays from free-tier backend servers, we have included a temporary, restricted Google Gemini API key directly within the submitted .zip extension files.

This allows you to load the extension and test the AI instantly without any setup. Please note this is purely for hackathon prototyping. In our production architecture (detailed below), all API calls are securely routed through a Node.js Express proxy hosted on Render.com, keeping keys completely hidden from the client. This temporary key will be revoked post-evaluation.

🚀 The Problem

95% of Indians lack a financial plan. Financial advisors charge ₹25,000+ per year and serve only High Net-worth Individuals (HNIs). Furthermore, retail investors are overwhelmed by complex documents like Form 16s and CAMS mutual fund statements, causing them to miss tax-saving opportunities and lose money to poor asset allocation.

💡 The Solution

We built an AI-powered personal finance mentor that lives where the user already spends their time: inside their browser.

By utilizing Google's Gemini 2.5 Flash multimodal capabilities, users can simply drag-and-drop complex financial PDFs into the extension. The AI acts as a robotic Chartered Accountant—extracting data, running complex math for the AY 2026-27 tax rules, and outputting actionable financial plans in under 5 seconds.

Core Tools Included:

Tax Wizard: Upload a Form 16. The AI auto-calculates Old vs. New tax regimes and flags missing 80C/80D deductions.

MF Portfolio X-Ray: Upload a CAMS statement. The AI calculates XIRR, flags expense drag, and checks for sector overlap.

FIRE Path Planner: Natural language input to instantly generate a retirement SIP roadmap and ideal asset allocation.

🛠 Setup & Installation Instructions

To run this project locally and test the extension:

Clone this repository to your local machine.

Get a free API key from Google AI Studio.

Open index.html in your code editor.

Locate the line const localApiKey = apiKey || "YOUR_GEMINI_API_KEY"; (around line 300) and replace "YOUR_GEMINI_API_KEY" with your actual key.

Open Google Chrome and go to chrome://extensions/.

Toggle Developer mode in the top right corner.

Click Load unpacked and select the folder containing your project files.

Click the puzzle piece icon in Chrome, pin the ET Money Mentor, and launch it!

🏗 Architecture Document

Our application is designed for extreme portability and low-friction execution. It utilizes a Serverless Edge Architecture.

1. Client Layer (Chrome Extension V3)

Built with pure HTML, Tailwind CSS, and Vanilla JavaScript to ensure a lightweight footprint (< 100kb).

Manages user states, tab routing, and real-time UI rendering (animations, loading states).

2. Data Pipeline & Prompt Routing

When a user submits data (image or text), the JS controller evaluates the current active tool (tax, mf, fire).

It dynamically assigns a highly-specialized System Persona Prompt (e.g., "You are an expert Indian CA" vs "You are a FIRE planner").

It enforces a strict JSON-schema response requirement to ensure the LLM outputs machine-readable data rather than unstructured text.

3. Intelligence Layer (Gemini 2.5 Flash)

Multimodal Ingestion: Uses vision capabilities to parse unstructured JPEGs/PNGs (Form 16s).

Financial Reasoning Engine: Processes the data against current fiscal rules (e.g., standard deduction limits, tax brackets) and computes recommendations autonomously.

4. Business Logic / Action Layer

The structured JSON is returned to the extension and rendered as an interactive dashboard.

An "Export to ET" pathway acts as the bridge to send this structured lead data to ET's CRM via API (mocked in this prototype).

📊 Impact Model (Business Case)

We estimate the business impact based on deploying this tool to a fraction of ET's existing massive user base.

Assumptions:

Target Audience: 1,000,000 active retail investors on ET platforms.

Adoption Rate: 5% of users install the extension (50,000 active users).

1. Time Saved (Efficiency Metric)

Manual tax planning & document reading takes the average retail investor ~30 minutes.

Our AI completes this in 5 seconds.

Impact: 50,000 users × 29.9 minutes saved = ~25,000 hours of manual friction eliminated annually.

2. Cost Reduction (User Value)

Standard consultation fee for a financial planner: ₹3,000 - ₹5,000.

Impact: Delivers roughly ₹15+ Crores in equivalent advisory value directly to ET readers for free, cementing brand loyalty.

3. Revenue Generation (Cross-Sell Alpha)

By auto-filling user profiles, ET gains deep intelligence (e.g., knowing exactly who has high expense drag in mutual funds or who is missing ₹50,000 in 80C deductions).

Assuming a conservative 1% conversion rate where these tailored insights lead users to purchase an ET Prime subscription (₹2,499/year) or execute a transaction via an ET partner.

Impact: 500 conversions × ₹2,499 = ₹12,49,500 in direct, net-new subscription revenue, entirely driven by AI-generated lead qualification.