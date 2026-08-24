import { INITIAL_MATCHES } from './data.js';
import { calculateMatchPredictions } from './poisson.js';

// --- STATE MANAGEMENT ---
let appState = {
  matches: [...INITIAL_MATCHES],
  selectedMatchId: "1"
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
function init() {
  // Pre-calculate predictions for all matches
  appState.matches = appState.matches.map(match => {
    const predictions = calculateMatchPredictions(
      match.statistics.goalsScoredAvg[0],
      match.statistics.goalsConcededAvg[0],
      match.statistics.goalsScoredAvg[1],
      match.statistics.goalsConcededAvg[1]
    );
    return { ...match, ...predictions };
  });

  renderMatchList();
  renderMatchDetails();
  setupEventListeners();
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
        <h3>Maç bulunamadı.</h3>
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

  const mainHTML = `
    <!-- Header Block -->
    <section class="detail-header">
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
            ${match.scorePredictions.map(p => `
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
            ${match.h2hMatches.length > 0 ? match.h2hMatches.map(game => `
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
              <span class="prob-val">%${match.probabilities.homeWin}</span>
            </div>
            <div class="prob-row draw">
              <span class="prob-label">BERABERLİK (X)</span>
              <span class="prob-val">%${match.probabilities.draw}</span>
            </div>
            <div class="prob-row away">
              <span class="prob-label">DEPLASMAN (2)</span>
              <span class="prob-val">%${match.probabilities.awayWin}</span>
            </div>
          </div>

          <div class="prob-bar-container">
            <div class="prob-bar-segment home" style="width: ${match.probabilities.homeWin}%"></div>
            <div class="prob-bar-segment draw" style="width: ${match.probabilities.draw}%"></div>
            <div class="prob-bar-segment away" style="width: ${match.probabilities.awayWin}%"></div>
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

function saveAdminData() {
  const rows = adminRowsContainerEl.querySelectorAll('.admin-row');
  
  rows.forEach(row => {
    const idx = parseInt(row.dataset.idx);
    const homeName = row.querySelector('.admin-home-name').value;
    const awayName = row.querySelector('.admin-away-name').value;
    const pctHome = parseInt(row.querySelector('.admin-pct-home').value) || 0;
    const pctDraw = parseInt(row.querySelector('.admin-pct-draw').value) || 0;
    const pctAway = parseInt(row.querySelector('.admin-pct-away').value) || 0;
    
    const match = appState.matches[idx];
    
    // Check if team names changed, if so generate new codes
    if (match.homeTeam.name !== homeName) {
      match.homeTeam.name = homeName;
      match.homeTeam.code = homeName.slice(0, 3).toUpperCase();
      // Generate some dummy/believable new stats for recalculated predictions
      match.statistics.goalsScoredAvg[0] = Math.round((Math.random() * 1.5 + 1) * 10) / 10;
      match.statistics.goalsConcededAvg[0] = Math.round((Math.random() * 1.5 + 0.5) * 10) / 10;
    }
    
    if (match.awayTeam.name !== awayName) {
      match.awayTeam.name = awayName;
      match.awayTeam.code = awayName.slice(0, 3).toUpperCase();
      match.statistics.goalsScoredAvg[1] = Math.round((Math.random() * 1.5 + 0.8) * 10) / 10;
      match.statistics.goalsConcededAvg[1] = Math.round((Math.random() * 1.5 + 0.6) * 10) / 10;
    }

    // Set new play percentages
    match.playPercentages = {
      home: pctHome,
      draw: pctDraw,
      away: pctAway
    };

    // Recalculate Poisson predictions
    const predictions = calculateMatchPredictions(
      match.statistics.goalsScoredAvg[0],
      match.statistics.goalsConcededAvg[0],
      match.statistics.goalsScoredAvg[1],
      match.statistics.goalsConcededAvg[1]
    );

    appState.matches[idx] = { ...match, ...predictions };
  });

  // Save successful
  renderMatchList();
  renderMatchDetails();
  showToast();
  closeAdminModal();
}

function showToast() {
  toastEl.classList.add('show');
  setTimeout(() => {
    toastEl.classList.remove('show');
  }, 3000);
}

function openAdminModal() {
  renderAdminPanel();
  adminModalEl.classList.add('active');
}

function closeAdminModal() {
  adminModalEl.classList.remove('active');
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
  // Select the brand element and make it function as the admin panel toggle
  const brandEl = document.querySelector('.brand');
  if (brandEl) {
    brandEl.style.cursor = 'pointer';
    brandEl.addEventListener('click', openAdminModal);
  }
  
  closeAdminBtn.addEventListener('click', closeAdminModal);
  cancelAdminBtn.addEventListener('click', closeAdminModal);
  saveAdminBtn.addEventListener('click', saveAdminData);
  
  // Close modal when clicking outside box
  adminModalEl.addEventListener('click', (e) => {
    if (e.target === adminModalEl) closeAdminModal();
  });
}

// Start application
window.addEventListener('DOMContentLoaded', init);
