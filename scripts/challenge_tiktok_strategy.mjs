// =========================================================================
// ISABEL PEPE - EMPIRICAL STRESS TEST SUITE FOR TIKTOK STRATEGY
// File: scripts/challenge_tiktok_strategy.mjs
// =========================================================================

console.log('===============================================================');
console.log('   ISABEL PEPE - TIKTOK STRATEGY EMPIRICAL CHALLENGER SUITE   ');
console.log('===============================================================\n');

// -------------------------------------------------------------------------
// 1. BURST PACING & HOURLY BURN SIMULATION
// -------------------------------------------------------------------------
console.log('>>> [STRESS-TEST 1] BURST STRATEGY PACING & HOURLY BURN');

const dailyBudget = 20.00;
const schedules = [
  { name: 'Thu-Fri (Evening)', hours: 5.5, window: '18:00 - 23:30' },
  { name: 'Sat-Sun (Extended)', hours: 12.5, window: '11:00 - 23:30' },
];

const cpmScenarios = [
  { label: 'Low CPM (Off-peak)', cpm: 3.50 },
  { label: 'Standard CPM (E-commerce)', cpm: 5.50 },
  { label: 'High CPM (Weekend/Prime)', cpm: 8.50 },
  { label: 'Spike CPM (Q4/BFCM)', cpm: 13.00 },
];

schedules.forEach((s) => {
  const hourlyBurn = dailyBudget / s.hours;
  const minBurn = hourlyBurn / 60;
  console.log(`\nSchedule: ${s.name} | Active: ${s.window} (${s.hours}h)`);
  console.log(`- Required Hourly Burn: €${hourlyBurn.toFixed(2)}/h (€${minBurn.toFixed(3)}/min)`);

  cpmScenarios.forEach((c) => {
    const totalImpr = (dailyBudget / c.cpm) * 1000;
    const imprPerHour = totalImpr / s.hours;
    const imprPerMin = imprPerHour / 60;
    console.log(
      `  [${c.label} @ €${c.cpm.toFixed(2)}]: Total Impr = ${Math.round(totalImpr).toLocaleString()} | ` +
        `Rate = ${Math.round(imprPerHour)} imp/h (${imprPerMin.toFixed(1)} imp/min)`
    );
  });
});

// Pacing ratio between Thu-Fri and Sat-Sun
const pacingRatio = (dailyBudget / 5.5) / (dailyBudget / 12.5);
console.log(`\nBurn Rate Ratio (Thu-Fri vs Sat-Sun): ${pacingRatio.toFixed(2)}x`);

// First 60-Minute Exhaustion Risk Analysis
console.log('\n--- First 60-Minute Budget Exhaustion Analysis ---');
const firstHourExpectedThu = (1.0 / 5.5) * dailyBudget;
const firstHourExpectedSat = (1.0 / 12.5) * dailyBudget;
console.log(`Thu-Fri Theoretical Paced Spend (First 60 min): €${firstHourExpectedThu.toFixed(2)} (${((firstHourExpectedThu/dailyBudget)*100).toFixed(1)}%)`);
console.log(`Sat-Sun Theoretical Paced Spend (First 60 min): €${firstHourExpectedSat.toFixed(2)} (${((firstHourExpectedSat/dailyBudget)*100).toFixed(1)}%)`);

// -------------------------------------------------------------------------
// 2. CREATIVE VALIDATION SCORE (CVS) MATHEMATICAL EDGE CASES
// -------------------------------------------------------------------------
console.log('\n===============================================================');
console.log('>>> [STRESS-TEST 2] CVS FORMULA & CLASSIFICATION MATRIX EDGE CASES');

function normalizeHook(hook) {
  if (hook < 30.0) return 0;
  if (hook < 40.0) return ((hook - 30.0) / 10.0) * 50.0;
  if (hook < 50.0) return 50.0 + ((hook - 40.0) / 10.0) * 35.0;
  if (hook < 60.0) return 85.0 + ((hook - 50.0) / 10.0) * 15.0;
  return 100.0;
}

function normalizeRetention(ret) {
  if (ret < 30.0) return 0;
  if (ret < 40.0) return ((ret - 30.0) / 10.0) * 50.0;
  if (ret < 50.0) return 50.0 + ((ret - 40.0) / 10.0) * 35.0;
  if (ret < 65.0) return 85.0 + ((ret - 50.0) / 15.0) * 15.0;
  return 100.0;
}

function normalizeSave(save) {
  if (save < 0.60) return 0;
  if (save < 1.00) return ((save - 0.60) / 0.40) * 50.0;
  if (save < 1.50) return 50.0 + ((save - 1.00) / 0.50) * 35.0;
  if (save < 2.50) return 85.0 + ((save - 1.50) / 1.00) * 15.0;
  return 100.0;
}

function calculateCVS(hook, ret, save) {
  const sHook = normalizeHook(hook);
  const sRet = normalizeRetention(ret);
  const sSave = normalizeSave(save);
  const cvs = sHook * 0.35 + sRet * 0.35 + sSave * 0.30;
  return { cvs, sHook, sRet, sSave };
}

const testCases = [
  { name: 'Target Baseline (Isabel Pepe Target)', hook: 50.0, ret: 50.0, save: 1.5 },
  { name: 'Edge Case 1: High Hook, Collapsed Body (Clickbait)', hook: 80.0, ret: 20.0, save: 0.5 },
  { name: 'Edge Case 2: Weak Hook, Elite Retention/Save', hook: 40.0, ret: 65.0, save: 3.0 },
  { name: 'Edge Case 2 Post Re-edit (Hook boosted to 55%)', hook: 55.0, ret: 65.0, save: 3.0 },
  { name: 'Edge Case 3: Dead Zone (Hook 47%, High Ret/Save)', hook: 47.0, ret: 52.0, save: 1.6 },
  { name: 'Edge Case 4: False Positive Winner (High Hook/Ret, Low Save)', hook: 65.0, ret: 65.0, save: 1.3 },
  { name: 'Edge Case 5: Moderate Everything', hook: 45.0, ret: 45.0, save: 1.2 },
  { name: 'Edge Case 6: Pure Zero Fit', hook: 25.0, ret: 25.0, save: 0.4 },
];

testCases.forEach((tc) => {
  const res = calculateCVS(tc.hook, tc.ret, tc.save);
  console.log(`\nTest: ${tc.name}`);
  console.log(`  Inputs: Hook=${tc.hook}% | Retention=${tc.ret}% | Save=${tc.save}%`);
  console.log(
    `  Scores: S_hook=${res.sHook.toFixed(1)} | S_ret=${res.sRet.toFixed(1)} | S_save=${res.sSave.toFixed(1)}`
  );
  console.log(`  Composite CVS = ${res.cvs.toFixed(2)} / 100`);

  // Classify based on score
  let scoreTier = 'Unknown';
  if (res.cvs >= 85) scoreTier = 'Tier A (Winner)';
  else if (res.cvs >= 65) scoreTier = 'Tier B (Hook Re-edit)';
  else if (res.cvs >= 50) scoreTier = 'Tier C (Scroller Bait)';
  else scoreTier = 'Tier D (Da Scartare)';

  // Check qualitative criteria
  const passA = tc.hook >= 50 && tc.ret >= 50 && tc.save >= 1.5;
  const passB = tc.ret >= 50 && tc.save >= 1.5 && tc.hook < 45;
  const passC = tc.hook >= 50 && tc.ret < 38 && tc.save < 0.9;
  const passD = tc.hook < 40 && tc.ret < 40 && tc.save < 1.0;

  console.log(`  -> Score-based Tier: ${scoreTier}`);
  console.log(
    `  -> Qualitative Flags: Pass_TierA=${passA} | Pass_TierB=${passB} | Pass_TierC=${passC} | Pass_TierD=${passD}`
  );
  if (scoreTier.startsWith('Tier A') && !passA) {
    console.log(`  ⚠️ MISMATCH: Classified as Tier A by score, but FAILS Tier A qualitative criteria!`);
  }
  if (scoreTier.startsWith('Tier C') && !passC) {
    console.log(`  ⚠️ MISMATCH: Score lands in Tier C range, but does NOT match Tier C criteria!`);
  }
  if (scoreTier.startsWith('Tier D') && tc.hook >= 50) {
    console.log(`  ⚠️ DISCREPANCY: High Hook video dropped into Tier D (<50) due to 0-score components!`);
  }
});

// -------------------------------------------------------------------------
// 3. MARKET SIZING & AUDIENCE SATURATION SIMULATION (ITALY)
// -------------------------------------------------------------------------
console.log('\n===============================================================');
console.log('>>> [STRESS-TEST 3] MARKET SIZING & FREQUENCY SATURATION (ITALY)');

const audienceClusterA = {
  name: 'Cluster A: Women 22-54 (Jewelry / Luxury Shoppers)',
  totalTikTokWomen25_54: 6_100_000,
  interestPenetrationMin: 0.30,
  interestPenetrationMax: 0.45,
};

const audienceClusterB = {
  name: 'Cluster B: Men 25-45 (Gifting / Luxury Buyers)',
  totalTikTokMen25_44: 4_900_000,
  interestPenetrationMin: 0.20,
  interestPenetrationMax: 0.30,
};

const sizeAMin = audienceClusterA.totalTikTokWomen25_54 * audienceClusterA.interestPenetrationMin;
const sizeAMax = audienceClusterA.totalTikTokWomen25_54 * audienceClusterA.interestPenetrationMax;
const sizeBMin = audienceClusterB.totalTikTokMen25_44 * audienceClusterB.interestPenetrationMin;
const sizeBMax = audienceClusterB.totalTikTokMen25_44 * audienceClusterB.interestPenetrationMax;

console.log(`Cluster A Addressable Audience (Italy): ${Math.round(sizeAMin).toLocaleString()} - ${Math.round(sizeAMax).toLocaleString()}`);
console.log(`Cluster B Addressable Audience (Italy): ${Math.round(sizeBMin).toLocaleString()} - ${Math.round(sizeBMax).toLocaleString()}`);

// Weekly Impressions at 80€ budget across CPM levels
console.log('\n--- Reach & Frequency Projections at €80/week (€347/month) ---');
[4.0, 5.5, 7.5, 10.0].forEach((cpm) => {
  const weeklyImpr = (80 / cpm) * 1000;
  const monthlyImpr = weeklyImpr * 4.33;
  const annualImpr = weeklyImpr * 52;

  // Assuming realistic unique reach ratio of 0.85 in early weeks
  const weeklyUniqueReach = weeklyImpr * 0.85;
  const pctClusterA = (weeklyUniqueReach / ((sizeAMin + sizeAMax) / 2)) * 100;
  const pctClusterB = (weeklyUniqueReach / ((sizeBMin + sizeBMax) / 2)) * 100;

  console.log(`\nCPM €${cpm.toFixed(2)}:`);
  console.log(`  Weekly Impressions: ${Math.round(weeklyImpr).toLocaleString()} | Unique Reach: ~${Math.round(weeklyUniqueReach).toLocaleString()}`);
  console.log(`  Weekly Market Penetration: Cluster A = ${pctClusterA.toFixed(3)}% | Cluster B = ${pctClusterB.toFixed(3)}%`);
  console.log(`  Monthly Impressions: ${Math.round(monthlyImpr).toLocaleString()} | Annual Impressions: ${Math.round(annualImpr).toLocaleString()}`);
});

// Algorithmic Sub-Pocket Fatigue Simulation
console.log('\n--- Micro-Cohort / Sub-Pocket Fatigue Simulation ---');
const algorithmicSubPocket = 40_000; // Typical active engaged cluster size TikTok Lowest Cost targets
const cpmMid = 5.50;
const weeklyImprMid = (80 / cpmMid) * 1000; // ~14,545 impressions
console.log(`Targeting Sub-Pocket Pool Size: ${algorithmicSubPocket.toLocaleString()} active users`);
[1, 2, 3, 4, 6, 8].forEach((week) => {
  const cumImpr = weeklyImprMid * week;
  // Reach saturation model: Reach(n) = Pool * (1 - exp(-k * Impr / Pool))
  const reach = algorithmicSubPocket * (1 - Math.exp(-1.1 * (cumImpr / algorithmicSubPocket)));
  const frequency = cumImpr / reach;
  console.log(`  Week ${week} (Spend €${week * 80}): Cum Impr = ${Math.round(cumImpr).toLocaleString()} | Reach = ${Math.round(reach).toLocaleString()} | Frequency = ${frequency.toFixed(2)}x`);
});

// -------------------------------------------------------------------------
// 4. KILL RULES & SCALE THRESHOLDS UNDER CPM VOLATILITY
// -------------------------------------------------------------------------
console.log('\n===============================================================');
console.log('>>> [STRESS-TEST 4] KILL & SCALE THRESHOLDS UNDER CPM VOLATILITY');

// KILL-01: 10€ spend or 1000 imp, Hook < 30% and CTR < 0.60%
console.log('\n--- KILL-01 Stress-Test under CPM Volatility ---');
[3.5, 5.5, 8.5, 12.0, 16.0].forEach((cpm) => {
  const imprAt10Eur = (10 / cpm) * 1000;
  const clicksAt06CTR = imprAt10Eur * 0.006;
  console.log(
    `  CPM €${cpm.toFixed(2)}: €10 spend yields ${Math.round(imprAt10Eur)} impressions. ` +
      `CTR 0.60% threshold = ${clicksAt06CTR.toFixed(1)} clicks.`
  );
});

// KILL-02: 20€ spend, CPC > 0.85€ with < 20 clicks
console.log('\n--- KILL-02 Stress-Test (CPC > 0.85€) under CPM Volatility ---');
const testCTRs = [0.006, 0.008, 0.010, 0.012, 0.015];
[4.0, 6.0, 8.0, 10.0, 14.0].forEach((cpm) => {
  console.log(`\nEvaluating CPM €${cpm.toFixed(2)}:`);
  testCTRs.forEach((ctr) => {
    const cpc = cpm / (1000 * ctr);
    const clicksAt20Eur = 20 / cpc;
    const triggersKill02 = cpc > 0.85 && clicksAt20Eur < 20;
    console.log(
      `  CTR ${(ctr * 100).toFixed(1)}%: CPC = €${cpc.toFixed(2)} | Clicks at €20 = ${clicksAt20Eur.toFixed(1)} | KILL-02 Trigger: ${triggersKill02 ? '🚨 TRIGGERED (KILL)' : '✅ PASS'}`
    );
  });
});

// Scale Threshold: ROAS >= 3.0x on 80€ Burst (Poisson distribution of orders)
console.log('\n--- Scaling Threshold: ROAS >= 3.0x Feasibility Analysis ---');
const spendBurst = 80.00;
const targetROAS = 3.0;
const targetRevenue = spendBurst * targetROAS; // 240€
console.log(`Required Revenue for 3.0x ROAS: €${targetRevenue.toFixed(2)} on €${spendBurst.toFixed(2)} spend`);

const orderScenarios = [
  { desc: '2x Set Isabel Rose (A145)', orders: 2, aov: 149.00 },
  { desc: '2x Tennis Bracelet (3mm)', orders: 2, aov: 129.00 },
  { desc: '1x Set Isabel Rose + 1x Solitario', orders: 2, aov: 114.00 },
  { desc: '1x Set Isabel Rose only', orders: 1, aov: 149.00 },
  { desc: '1x Solitario Eden Rose only', orders: 1, aov: 89.00 },
];

orderScenarios.forEach((s) => {
  const rev = s.orders * s.aov;
  const roas = rev / spendBurst;
  console.log(
    `  Scenario [${s.desc}]: Revenue = €${rev.toFixed(2)} -> ROAS = ${roas.toFixed(2)}x (${roas >= 3.0 ? '✅ QUALIFIED' : '❌ UNQUALIFIED'})`
  );
});

// Poisson Probability of Getting >= 2 Orders on 80€ spend at different CVRs
console.log('\n--- Statistical Probability (Poisson) of >= 2 Orders on €80 Spend ---');
// lambda = Expected orders = (Spend / CPC) * CVR
const assumedCPC = 0.65;
const totalClicks = spendBurst / assumedCPC; // ~123.08 clicks

function poissonProb(k, lambda) {
  // P(X = k) = (lambda^k * exp(-lambda)) / k!
  let factorial = 1;
  for (let i = 1; i <= k; i++) factorial *= i;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial;
}

[0.006, 0.008, 0.010, 0.012, 0.015, 0.020].forEach((cvr) => {
  const lambda = totalClicks * cvr;
  const p0 = poissonProb(0, lambda);
  const p1 = poissonProb(1, lambda);
  const pAtLeast2 = 1 - (p0 + p1);
  console.log(
    `  CVR ${(cvr * 100).toFixed(1)}% (Clicks=${Math.round(totalClicks)}): Expected Orders = ${lambda.toFixed(2)} | ` +
      `P(0 orders) = ${(p0 * 100).toFixed(1)}% | P(1 order) = ${(p1 * 100).toFixed(1)}% | P(>= 2 orders) = ${(pAtLeast2 * 100).toFixed(1)}%`
  );
});

console.log('\n===============================================================');
console.log('                 SIMULATION COMPLETE                           ');
console.log('===============================================================');
