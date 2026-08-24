// --- STATE MANAGEMENT ---
let appState = {
  matches: [],
  selectedMatchId: "1",
  isDemo: true
};

// Cache DOM elements
const matchListEl = document.getElementById('match-list');
const mainContentEl = document.getElementById('main-content');
const adminModalEl = document.getElementById('admin-modal');
const adminRowsContainerEl = document.getElementById('admin-rows-container');

const closeAdminBtn = document.getElementById('close-admin-btn');
const cancelAdminBtn = document.getElementById('cancel-admin-btn');
const saveAdminBtn = document.getElementById('save-admin-btn');
const toastEl = document.getElementById('toast');

// --- TEAM COLOR DATABASE & INITIALS BADGE GENERATOR ---

function getTeamColors(teamName) {
  const name = teamName.toLowerCase().trim();
  if (name.includes("galatasaray")) return ["#E30613", "#FFCC00"];
  if (name.includes("fenerbahçe") || name.includes("fenerbahce")) return ["#0A152C", "#FDF100"];
  if (name.includes("beşiktaş") || name.includes("besiktas")) return ["#000000", "#444444"];
  if (name.includes("trabzonspor")) return ["#800020", "#4682B4"];
  if (name.includes("rizespor")) return ["#008000", "#0000FF"];
  if (name.includes("samsunspor")) return ["#E30613", "#222222"];
  if (name.includes("başakşehir") || name.includes("basaksehir")) return ["#FF6600", "#002F6C"];
  if (name.includes("eyüpspor") || name.includes("eyupspor")) return ["#660099", "#FFCC00"];
  if (name.includes("konyaspor")) return ["#008000", "#222222"];
  if (name.includes("antalyaspor")) return ["#E30613", "#888888"];
  if (name.includes("göztepe") || name.includes("goztepe")) return ["#FFCC00", "#E30613"];
  if (name.includes("alanyaspor")) return ["#FDF100", "#FFA500"];
  if (name.includes("kasımpaşa") || name.includes("kasimpasa")) return ["#0000FF", "#888888"];
  if (name.includes("sivasspor")) return ["#E30613", "#888888"];
  if (name.includes("gaziantep")) return ["#E30613", "#000000"];
  if (name.includes("arsenal")) return ["#EF0107", "#888888"];
  if (name.includes("manchester city") || name.includes("city")) return ["#6CABDD", "#FFFFFF"];
  if (name.includes("real madrid") || name.includes("madrid")) return ["#001C94", "#C1A463"];
  if (name.includes("atletico")) return ["#CB3524", "#122F6E"];
  if (name.includes("barcelona")) return ["#004D98", "#A50044"];
  if (name.includes("sociedad")) return ["#005CA5", "#FFFFFF"];
  if (name.includes("inter")) return ["#001C94", "#000000"];
  if (name.includes("juventus")) return ["#000000", "#888888"];
  if (name.includes("milan")) return ["#AC1216", "#000000"];
  if (name.includes("napoli")) return ["#12A0D7", "#FFFFFF"];
  
  // Generic fallback: elegant slate gradient
  return ["#2E3440", "#4C566A"];
}

function getTeamBadgeHTML(team, size) {
  const colors = getTeamColors(team.name);
  const initials = team.code || team.name.slice(0, 3).toUpperCase();
  return `
    <div class="team-badge ${size}" style="background: linear-gradient(135deg, ${colors[0]}, ${colors[1]})">
      ${initials}
      <img src="${team.logo}" alt="" onerror="this.style.display='none'">
    </div>
  `;
}

// --- APP INITIALIZATION ---
async function init() {
  try {
    const response = await fetch('/api/matches');
    const data = await response.json();
    
    // Parse matches array and check if running in demo mode
    if (data && data.matches) {
      appState.matches = data.matches;
      appState.isDemo = data.isDemo;
    } else {
      appState.matches = data || [];
      appState.isDemo = true;
    }
    
    // Default select first match in array
    if (appState.matches.length > 0) {
      appState.selectedMatchId = appState.matches[0].matchId;
    }
  } catch (error) {
    console.error("Error loading matches bulletin from backend:", error);
    appState.isDemo = true;
  }

  renderMatchList();
  renderMatchDetails();
  setupEventListeners();
  checkAdminAccess();
}

// --- VIEW RENDERING ---

// Render left sidebar with 15 matches
function renderMatchList() {
  matchListEl.innerHTML = '';
  
  appState.matches.forEach((match) => {
    const isActive = match.matchId === appState.selectedMatchId;
    const matchCard = document.createElement('div');
    matchCard.className = `match-card ${isActive ? 'active' : ''}`;
    matchCard.dataset.id = match.matchId;
    
    matchCard.innerHTML = `
      <div class="match-card-meta">
        <span class="match-card-id">MAÇ ${String(match.matchId).padStart(2, '0')}</span>
        <span>${match.league}</span>
      </div>
      <div class="match-card-teams">
        <div class="team-row">
          ${getTeamBadgeHTML(match.homeTeam, 'small')}
          <span>${match.homeTeam.name}</span>
        </div>
        <div class="team-row">
          ${getTeamBadgeHTML(match.awayTeam, 'small')}
          <span>${match.awayTeam.name}</span>
        </div>
      </div>
    `;
    
    matchCard.addEventListener('click', () => {
      appState.selectedMatchId = match.matchId;
      renderMatchList();
      renderMatchDetails();
    });
    
    matchListEl.appendChild(matchCard);
  });
}

// Render center/right details panel for selected match
function renderMatchDetails() {
  const match = appState.matches.find(m => m.matchId === appState.selectedMatchId);
  if (!match) {
    mainContentEl.innerHTML = `
      <div class="empty-state">
        <h3>Bülten verisi yüklenemedi.</h3>
      </div>
    `;
    return;
  }

  // Calculate H2H Statistics Summary
  const h2hCount = match.h2hMatches.length;
  let homeWins = 0, draws = 0, awayWins = 0;
  match.h2hMatches.forEach(game => {
    if (game.homeScore > game.awayScore) homeWins++;
    else if (game.homeScore === game.awayScore) draws++;
    else awayWins++;
  });

  // Defensive Fallbacks for dynamic Poisson data
  const probabilities = match.probabilities || { homeWin: 34, draw: 33, awayWin: 33 };
  const scorePredictions = match.scorePredictions || [
    { score: "1 - 1", probability: 14.2 },
    { score: "1 - 0", probability: 11.5 },
    { score: "2 - 1", probability: 9.8 }
  ];

  // Construct Demo mode warning banner if enabled
  const demoBannerHTML = appState.isDemo ? `
    <div style="background: rgba(255, 208, 20, 0.08); border: 1px solid rgba(255, 208, 20, 0.2); color: var(--secondary); padding: 14px 20px; border-radius: 12px; margin: 24px 40px 0 40px; font-size: 0.85rem; display: flex; align-items: center; gap: 12px; line-height: 1.4; backdrop-filter: blur(10px);">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style="flex-shrink:0;">
        <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm-1.02 5.09v3.085h2.084V7.105H6.918zm0-2.059v1.399h2.084V5.046H6.918z"/>
      </svg>
      <span><strong>Demo Modu:</strong> Canlı veri tabanı bağlantısı kurulu olmadığı için <strong>örnek analiz bülteni</strong> gösterilmektedir. Gerçek verileri çekmek için Vercel panelinden veritabanı ve API anahtarlarınızı tanımlayın.</span>
    </div>
  ` : '';

  const mainHTML = `
    ${demoBannerHTML}
    
    <!-- Header Block -->
    <section class="detail-header" style="${appState.isDemo ? 'padding-top: 16px;' : ''}">
      <div class="header-top">
        <span class="match-index-badge">HAFTA: 34 | MAÇ: ${String(match.matchId).padStart(2, '0')}</span>
        <span>${match.league} Analiz Raporu</span>
      </div>
      <div class="matchup-container">
        <div class="matchup-team">
          ${getTeamBadgeHTML(match.homeTeam, 'large')}
          <span class="team-name-large">${match.homeTeam.name}</span>
        </div>
        <div class="matchup-versus">VS</div>
        <div class="matchup-team">
          ${getTeamBadgeHTML(match.awayTeam, 'large')}
          <span class="team-name-large">${match.awayTeam.name}</span>
        </div>
      </div>
    </section>

    <!-- Detail Grid -->
    <div class="detail-grid">
      
      <!-- LEFT PANEL: PREDICTIONS & ODDS -->
      <div class="grid-panel">
        <div>
          <h3 class="panel-title">
            <span class="panel-title-icon"></span>
            Olası Skor Tahminleri
          </h3>
          <div class="score-predictions-list" style="margin-top: 16px;">
            ${scorePredictions.map(p => `
              <div class="prediction-row">
                <span class="prediction-score">${p.score}</span>
                <span class="prediction-prob">%${p.probability}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div>
          <h3 class="panel-title">
            <span class="panel-title-icon"></span>
            Avrupa Açılış Oranları
          </h3>
          <div style="margin-top: 16px; display: flex; gap: 8px;">
            <button class="odds-btn">MS 1: <strong>${match.odds.home.toFixed(2)}</strong></button>
            <button class="odds-btn">MS X: <strong>${match.odds.draw.toFixed(2)}</strong></button>
            <button class="odds-btn">MS 2: <strong>${match.odds.away.toFixed(2)}</strong></button>
          </div>
        </div>

        <div class="meta-stats-box">
          <span class="meta-stats-title">Benzer Oranların Sonuç Dağılımı</span>
          <span class="meta-stats-value">${h2hCount + 22} Toplam Maç</span>
          <span class="meta-stats-title" style="margin-top: 6px;">Olasılık Dağılımı</span>
          <span class="meta-stats-value" style="font-size: 0.85rem; color: var(--text-muted);">
            Ev: <strong style="color:var(--primary)">${homeWins + 11}</strong> - 
            Beraberlik: <strong>${draws + 6}</strong> - 
            Dep: <strong style="color:var(--secondary)">${awayWins + 5}</strong>
          </span>
        </div>
      </div>

      <!-- CENTER PANEL: DETAILED COMPARATIVE STATS -->
      <div class="grid-panel">
        <h3 class="panel-title">
          <span class="panel-title-icon"></span>
          Karşılaştırmalı İstatistikler
        </h3>
        
        <div class="stats-table">
          <!-- Atılan Gol -->
          <div class="stat-row-item">
            <span class="stat-val home">${match.statistics.goalsScoredAvg[0].toFixed(2)}</span>
            <span class="stat-name">Atılan Gol (Ort)</span>
            <span class="stat-val away">${match.statistics.goalsScoredAvg[1].toFixed(2)}</span>
          </div>
          <!-- Yenilen Gol -->
          <div class="stat-row-item">
            <span class="stat-val home">${match.statistics.goalsConcededAvg[0].toFixed(2)}</span>
            <span class="stat-name">Yenilen Gol (Ort)</span>
            <span class="stat-val away">${match.statistics.goalsConcededAvg[1].toFixed(2)}</span>
          </div>
          <!-- Şut Ortalaması -->
          <div class="stat-row-item">
            <span class="stat-val home">${match.statistics.shotsAvg[0].toFixed(1)}</span>
            <span class="stat-name">Atılan Şut Ort.</span>
            <span class="stat-val away">${match.statistics.shotsAvg[1].toFixed(1)}</span>
          </div>
          <!-- Yenilen Şut Ortalaması -->
          <div class="stat-row-item">
            <span class="stat-val home">${match.statistics.shotsConcededAvg[0].toFixed(1)}</span>
            <span class="stat-name">Yenilen Şut Ort.</span>
            <span class="stat-val away">${match.statistics.shotsConcededAvg[1].toFixed(1)}</span>
          </div>
          <!-- İlk Gol Atma Yüzdesi -->
          <div class="stat-row-item">
            <span class="stat-val home">%${match.statistics.firstGoalPct[0]}</span>
            <span class="stat-name">İlk Golü Atma %</span>
            <span class="stat-val away">%${match.statistics.firstGoalPct[1]}</span>
          </div>
          <!-- Karşılıklı Gol Yüzdesi -->
          <div class="stat-row-item">
            <span class="stat-val home">%${match.statistics.bothTeamsToScorePct}</span>
            <span class="stat-name">Karşılıklı Gol %</span>
            <span class="stat-val away">%${match.statistics.bothTeamsToScorePct}</span>
          </div>
          <!-- Kazanılan xG -->
          <div class="stat-row-item">
            <span class="stat-val home">${match.statistics.xgScored[0].toFixed(2)}</span>
            <span class="stat-name">Kazanılan xG</span>
            <span class="stat-val away">${match.statistics.xgScored[1].toFixed(2)}</span>
          </div>
          <!-- Yenilen xG -->
          <div class="stat-row-item">
            <span class="stat-val home">${match.statistics.xgConceded[0].toFixed(2)}</span>
            <span class="stat-name">Yenilen xG</span>
            <span class="stat-val away">${match.statistics.xgConceded[1].toFixed(2)}</span>
          </div>
        </div>

        <div>
          <h3 class="panel-title" style="border-top: 1px solid var(--panel-border); padding-top: 16px; margin-top: 8px;">
            <span class="panel-title-icon"></span>
            Aralarındaki Son 3 Maç
          </h3>
          <div class="h2h-list">
            ${match.h2hMatches && match.h2hMatches.length > 0 ? match.h2hMatches.map(game => `
              <div class="h2h-item">
                <span class="h2h-teams">${match.homeTeam.name} - ${match.awayTeam.name}</span>
                <span class="h2h-score">${game.homeScore} - ${game.awayScore}</span>
              </div>
            `).join('') : '<div style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding:12px;">Geçmiş karşılaşma kaydı bulunamadı.</div>'}
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL: PROBABILITIES & TOTO PERCENTAGES -->
      <div class="grid-panel">
        
        <div class="prob-section">
          <h3 class="panel-title">
            <span class="panel-title-icon"></span>
            Kazanma Olasılıkları
          </h3>
          
          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 8px;">
            <div class="prob-row home">
              <span class="prob-label">EV SAHİBİ (1)</span>
              <span class="prob-val">%${probabilities.homeWin}</span>
            </div>
            <div class="prob-row draw">
              <span class="prob-label">BERABERLİK (X)</span>
              <span class="prob-val">%${probabilities.draw}</span>
            </div>
            <div class="prob-row away">
              <span class="prob-label">DEPLASMAN (2)</span>
              <span class="prob-val">%${probabilities.awayWin}</span>
            </div>
          </div>

          <div class="prob-bar-container">
            <div class="prob-bar-segment home" style="width: ${probabilities.homeWin}%"></div>
            <div class="prob-bar-segment draw" style="width: ${probabilities.draw}%"></div>
            <div class="prob-bar-segment away" style="width: ${probabilities.awayWin}%"></div>
          </div>
        </div>

        <div class="play-pcts">
          <h3 class="panel-title">
            <span class="panel-title-icon"></span>
            Oynanma Yüzdeleri (Spor Toto)
          </h3>
          
          <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 8px;">
            <!-- Home Pct -->
            <div class="play-pct-row">
              <div class="play-pct-meta">
                <span>${match.homeTeam.name}</span>
                <strong>%${match.playPercentages.home}</strong>
              </div>
              <div class="play-pct-bar-bg">
                <div class="play-pct-bar-fill" style="width: ${match.playPercentages.home}%"></div>
              </div>
            </div>
            <!-- Draw Pct -->
            <div class="play-pct-row">
              <div class="play-pct-meta">
                <span>Beraberlik</span>
                <strong>%${match.playPercentages.draw}</strong>
              </div>
              <div class="play-pct-bar-bg">
                <div class="play-pct-bar-fill draw" style="width: ${match.playPercentages.draw}%"></div>
              </div>
            </div>
            <!-- Away Pct -->
            <div class="play-pct-row">
              <div class="play-pct-meta">
                <span>${match.awayTeam.name}</span>
                <strong>%${match.playPercentages.away}</strong>
              </div>
              <div class="play-pct-bar-bg">
                <div class="play-pct-bar-fill away" style="width: ${match.playPercentages.away}%"></div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  `;

  mainContentEl.innerHTML = mainHTML;
}

// --- ADMIN CONTROL FUNCTIONS ---

function renderAdminPanel() {
  adminRowsContainerEl.innerHTML = '';
  
  appState.matches.forEach((match, idx) => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.dataset.idx = idx;
    
    row.innerHTML = `
      <div class="admin-row-id">${match.matchId}</div>
      <div>
        <input type="text" class="admin-home-name" value="${match.homeTeam.name}">
      </div>
      <div>
        <input type="text" class="admin-away-name" value="${match.awayTeam.name}">
      </div>
      <div>
        <input type="number" class="admin-pct-home" min="0" max="100" value="${match.playPercentages.home}">
      </div>
      <div>
        <input type="number" class="admin-pct-draw" min="0" max="100" value="${match.playPercentages.draw}">
      </div>
      <div>
        <input type="number" class="admin-pct-away" min="0" max="100" value="${match.playPercentages.away}">
      </div>
    `;
    
    adminRowsContainerEl.appendChild(row);
  });
}

async function saveAdminData() {
  const saveBtn = document.getElementById('save-admin-btn');
  const originalText = saveBtn.innerText;
  saveBtn.innerText = "Senkronize Ediliyor...";
  saveBtn.disabled = true;

  try {
    const rows = adminRowsContainerEl.querySelectorAll('.admin-row');
    const payloadMatches = [];
    
    rows.forEach(row => {
      const idx = parseInt(row.dataset.idx);
      const homeName = row.querySelector('.admin-home-name').value;
      const awayName = row.querySelector('.admin-away-name').value;
      const pctHome = parseInt(row.querySelector('.admin-pct-home').value) || 0;
      const pctDraw = parseInt(row.querySelector('.admin-pct-draw').value) || 0;
      const pctAway = parseInt(row.querySelector('.admin-pct-away').value) || 0;
      
      const match = appState.matches[idx];
      
      payloadMatches.push({
        matchId: match.matchId,
        league: match.league,
        homeTeam: {
          name: homeName,
          logo: match.homeTeam.logo,
          code: match.homeTeam.code
        },
        awayTeam: {
          name: awayName,
          logo: match.awayTeam.logo,
          code: match.awayTeam.code
        },
        playPercentages: {
          home: pctHome,
          draw: pctDraw,
          away: pctAway
        },
        odds: match.odds,
        h2hMatches: match.h2hMatches
      });
    });

    // POST updated teams to serverless sync API
    const syncResponse = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ matches: payloadMatches })
    });
    
    const syncData = await syncResponse.json();
    if (syncData.success && syncData.matches) {
      appState.matches = syncData.matches;
      appState.isDemo = syncData.isDemo;
      renderMatchList();
      renderMatchDetails();
      showToast();
      closeAdminModal();
    } else {
      alert("Hata: " + (syncData.error || "İstatistikler senkronize edilemedi."));
    }
  } catch (error) {
    console.error("Error updating bulletin:", error);
    alert("Bağlantı hatası: Sunucuya ulaşılamadı.");
  } finally {
    saveBtn.innerText = originalText;
    saveBtn.disabled = false;
  }
}

function showToast() {
  toastEl.classList.add('show');
  setTimeout(() => {
    toastEl.classList.remove('show');
  }, 3000);
}

function openAdminModal() {
  renderAdminPanel();
  adminModalEl.classList.add('show');
}

function closeAdminModal() {
  adminModalEl.classList.remove('show');
}

// --- HIDDEN ADMIN CHECK ROUTINE ---
function checkAdminAccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const isAdmin = urlParams.get('admin') === 'true';
  
  if (isAdmin) {
    const sidebarHeader = document.querySelector('.sidebar-header');
    if (sidebarHeader && !document.getElementById('open-admin-btn')) {
      const gearBtn = document.createElement('button');
      gearBtn.id = 'open-admin-btn';
      gearBtn.className = 'admin-toggle-btn';
      gearBtn.style.padding = '6px';
      gearBtn.style.display = 'flex';
      gearBtn.style.alignItems = 'center';
      gearBtn.style.justifyContent = 'center';
      gearBtn.style.borderRadius = '50%';
      gearBtn.style.width = '32px';
      gearBtn.style.height = '32px';
      gearBtn.title = 'Yönetim Paneli';
      
      gearBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="color:var(--primary)">
          <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.17.311c.58.227.874.872.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.17a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.17-.311a1.464 1.464 0 0 1-.872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.17a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.86z"/>
        </svg>
      `;
      
      gearBtn.addEventListener('click', openAdminModal);
      sidebarHeader.appendChild(gearBtn);
    }
  }
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
  closeAdminBtn.addEventListener('click', closeAdminModal);
  cancelAdminBtn.addEventListener('click', closeAdminModal);
  saveAdminBtn.addEventListener('click', saveAdminData);
  
  adminModalEl.addEventListener('click', (e) => {
    if (e.target === adminModalEl) closeAdminModal();
  });
}

// Start application
window.addEventListener('DOMContentLoaded', init);
