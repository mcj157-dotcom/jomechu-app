/**
 * 저메추 (저녁 메뉴 추천) - Application Logic
 * Toss Style Micro-interactions & State Management
 */

// Global State
let currentRecommendedMenu = null;
let currentModalMenu = null;
let currentTournamentWinner = null;

let activeCategory = 'all';
let activeCalorieFilter = 'all';

// Tournament State
let tourneyList = [];
let tourneyRound = [];
let tourneyNextRound = [];
let tourneyMatchIndex = 0;
let tourneyTotalMatches = 0;

// Roulette State
let rouletteItems = [];
let rouletteCurrentAngle = 0;
let isRouletteSpinning = false;
const ROULETTE_COLORS = [
  '#3182F6', // Toss Blue
  '#04B056', // Toss Green
  '#FF701E', // Orange
  '#8353E2', // Purple
  '#33B5E5', // Sky Blue
  '#F04452', // Coral Red
  '#E58B00', // Amber
  '#5C6BC0'  // Indigo
];

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initRandomRecommendation();
  initRoulette();
  initTournament();
  renderMenuList();
  updateAvgCalories();
});

/* ==========================================================================
   Clock & Header
   ========================================================================== */
function initClock() {
  const updateTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const el = document.getElementById('currentTimeText');
    if (el) {
      el.textContent = `${hours}:${minutes} 야근타임 🌙`;
    }
  };
  updateTime();
  setInterval(updateTime, 60000);
}

function updateAvgCalories() {
  const total = MENU_DATA.reduce((acc, cur) => acc + cur.calories, 0);
  const avg = Math.round(total / MENU_DATA.length);
  const avgEl = document.getElementById('avgCalText');
  if (avgEl) {
    avgEl.textContent = `${avg}kcal`;
  }
}

/* ==========================================================================
   Navigation Tabs
   ========================================================================== */
function switchTab(tabId) {
  // Update Tab Buttons
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-view').forEach(view => view.classList.remove('active'));

  if (tabId === 'random') {
    document.getElementById('tabRandom').classList.add('active');
    document.getElementById('viewRandom').classList.add('active');
  } else if (tabId === 'roulette') {
    document.getElementById('tabRoulette').classList.add('active');
    document.getElementById('viewRoulette').classList.add('active');
    drawRouletteWheel();
  } else if (tabId === 'tournament') {
    document.getElementById('tabTourney').classList.add('active');
    document.getElementById('viewTourney').classList.add('active');
  } else if (tabId === 'list') {
    document.getElementById('tabList').classList.add('active');
    document.getElementById('viewList').classList.add('active');
  }
}

/* ==========================================================================
   Roulette Wheel Implementation
   ========================================================================== */
function initRoulette() {
  changeRoulettePreset('random8');
}

function changeRoulettePreset(presetType, element) {
  if (element) {
    document.querySelectorAll('.roulette-preset-bar .filter-chip').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
  }

  if (presetType === 'random8') {
    const shuffled = [...MENU_DATA].sort(() => 0.5 - Math.random());
    rouletteItems = shuffled.slice(0, 8);
  } else if (presetType === 'korean') {
    rouletteItems = MENU_DATA.filter(m => m.category === 'korean').slice(0, 8);
  } else if (presetType === 'popular') {
    // Top popular selections
    const popularIds = [1, 2, 3, 4, 9, 10, 13, 14];
    rouletteItems = MENU_DATA.filter(m => popularIds.includes(m.id));
  } else if (presetType === 'diet') {
    rouletteItems = MENU_DATA.filter(m => m.calories <= 650).slice(0, 8);
  }

  drawRouletteWheel();
  if (element) {
    showToast(`룰렛 후보가 변경되었습니다. (${rouletteItems.length}개 메뉴)`);
  }
}

function shuffleRouletteItems() {
  if (isRouletteSpinning) return;
  rouletteItems = [...MENU_DATA].sort(() => 0.5 - Math.random()).slice(0, 8);
  document.querySelectorAll('.roulette-preset-bar .filter-chip').forEach(c => c.classList.remove('active'));
  const btn = document.getElementById('preset8Random');
  if (btn) btn.classList.add('active');
  drawRouletteWheel();
  showToast('룰렛 후보 메뉴를 새롭게 섞었습니다! 🔀');
}

function drawRouletteWheel() {
  const canvas = document.getElementById('rouletteCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const center = width / 2;
  const radius = center - 6;

  ctx.clearRect(0, 0, width, height);

  if (rouletteItems.length === 0) return;

  const sliceAngle = (2 * Math.PI) / rouletteItems.length;

  // Draw Segments
  for (let i = 0; i < rouletteItems.length; i++) {
    const angle = rouletteCurrentAngle + i * sliceAngle;
    const color = ROULETTE_COLORS[i % ROULETTE_COLORS.length];

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, angle, angle + sliceAngle);
    ctx.fillStyle = color;
    ctx.fill();

    // Segment Border
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Draw Text
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(angle + sliceAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px Pretendard, sans-serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 4;

    // Truncate long menu name for clean UI
    let menuName = rouletteItems[i].name;
    if (menuName.length > 7) {
      menuName = menuName.substring(0, 6) + '..';
    }

    ctx.fillText(menuName, radius - 18, 5);
    ctx.restore();
  }

  // Draw Outer Ring Accent
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, 2 * Math.PI);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();
}

function spinRoulette() {
  if (isRouletteSpinning || rouletteItems.length === 0) return;
  isRouletteSpinning = true;

  const spinBtn = document.getElementById('btnSpin');
  const centerBtn = document.getElementById('btnSpinCenter');
  if (spinBtn) spinBtn.disabled = true;
  if (centerBtn) centerBtn.disabled = true;

  // Random spin rotations: 5 to 8 full spins + random extra angle
  const fullSpins = 5 + Math.floor(Math.random() * 3);
  const extraAngle = Math.random() * 2 * Math.PI;
  const targetRotation = fullSpins * 2 * Math.PI + extraAngle;
  
  const startAngle = rouletteCurrentAngle;
  const startTime = performance.now();
  const duration = 3600; // 3.6 seconds smooth deceleration

  function animate(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease-out cubic for realistic friction deceleration
    const easeOutProgress = 1 - Math.pow(1 - progress, 3);
    rouletteCurrentAngle = startAngle + targetRotation * easeOutProgress;
    
    drawRouletteWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isRouletteSpinning = false;
      if (spinBtn) spinBtn.disabled = false;
      if (centerBtn) centerBtn.disabled = false;
      onRouletteFinish();
    }
  }

  requestAnimationFrame(animate);
}

function onRouletteFinish() {
  // Pointer is at the top (angle = 3 * Math.PI / 2 or -Math.PI / 2)
  const sliceAngle = (2 * Math.PI) / rouletteItems.length;
  // Normalize angle to [0, 2*PI)
  const normalized = (rouletteCurrentAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
  
  // The pointer is at 270 degrees (3*PI/2) relative to standard 0 degree (East)
  // Or top = 1.5 * Math.PI.
  let winningIndex = Math.floor(((1.5 * Math.PI - normalized + 2 * Math.PI) % (2 * Math.PI)) / sliceAngle);
  winningIndex = (winningIndex + rouletteItems.length) % rouletteItems.length;

  const winner = rouletteItems[winningIndex];
  
  launchConfetti();
  showToast(`🎯 룰렛 당첨! 오늘 저녁은 [${winner.name}]!`);
  
  // Open detail modal with winning menu after brief moment
  setTimeout(() => {
    openDetailModal(winner);
  }, 400);
}


/* ==========================================================================
   1. Smart Random Recommendation Logic
   ========================================================================== */
function initRandomRecommendation() {
  // Pick random menu as initial
  const initialIndex = Math.floor(Math.random() * MENU_DATA.length);
  setRecommendedMenu(MENU_DATA[initialIndex], false);
}

function triggerRandomRecommendation() {
  const overlay = document.getElementById('shufflingOverlay');
  const card = document.getElementById('recommendCard');
  const rerollBtn = document.getElementById('btnReroll');
  
  if (rerollBtn) rerollBtn.disabled = true;
  if (overlay) overlay.classList.add('active');
  if (card) card.classList.remove('highlight');

  const foodEmojis = ['🍱', '🍕', '🍣', '🍗', '🍲', '🍜', '🥗', '🥩', '🥘', '🥟'];
  let count = 0;
  const interval = setInterval(() => {
    count++;
    const randomEmoji = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
    const randomTemp = MENU_DATA[Math.floor(Math.random() * MENU_DATA.length)];
    
    document.querySelector('.spinner-icon').textContent = randomEmoji;
    document.getElementById('shufflingStatus').textContent = `${randomTemp.name} 스캔 중...`;
    
    if (count > 7) {
      clearInterval(interval);
      overlay.classList.remove('active');
      if (rerollBtn) rerollBtn.disabled = false;
      
      // Select new menu (different from previous if possible)
      let nextMenu;
      do {
        nextMenu = MENU_DATA[Math.floor(Math.random() * MENU_DATA.length)];
      } while (MENU_DATA.length > 1 && currentRecommendedMenu && nextMenu.id === currentRecommendedMenu.id);
      
      setRecommendedMenu(nextMenu, true);
    }
  }, 80);
}

function setRecommendedMenu(menu, fireConfettiEffect = false) {
  currentRecommendedMenu = menu;
  
  const cardImg = document.getElementById('cardFoodImg');
  const cardCat = document.getElementById('cardCategory');
  const cardCalVal = document.getElementById('cardCalorieVal');
  const cardRest = document.getElementById('cardRestaurant');
  const cardTitle = document.getElementById('cardMenuName');
  const cardDesc = document.getElementById('cardDesc');
  const cardPrice = document.getElementById('cardPrice');
  const cardTime = document.getElementById('cardTime');
  const card = document.getElementById('recommendCard');

  cardImg.src = menu.image;
  cardCat.textContent = menu.categoryName;
  cardCalVal.textContent = menu.calories;
  cardRest.innerHTML = `<span>🏢 ${menu.restaurant}</span>`;
  cardTitle.textContent = menu.name;
  cardDesc.textContent = menu.description;
  cardPrice.textContent = menu.price;
  cardTime.textContent = menu.deliveryTime;

  if (fireConfettiEffect) {
    card.classList.add('highlight');
    launchConfetti();
    showToast(`오늘 야근 저녁은 [${menu.name}] 어때요? 😋`);
  }
}

function openDeliveryLink(appType) {
  if (!currentRecommendedMenu) return;
  const url = appType === 'coupang' ? currentRecommendedMenu.coupangUrl : currentRecommendedMenu.yogiyoUrl;
  window.open(url, '_blank');
  showToast(`${appType === 'coupang' ? '쿠팡이츠' : '요기요'} 검색 페이지로 연결합니다.`);
}

function shareCurrentMenu() {
  if (!currentRecommendedMenu) return;
  const text = `[야근 저메추 픽 🍱]\n오늘 저녁은 '${currentRecommendedMenu.name}' 어떠세요?\n• 식당: ${currentRecommendedMenu.restaurant}\n• 칼로리: ${currentRecommendedMenu.calories} kcal\n• 가격: ${currentRecommendedMenu.price} (예상소요: ${currentRecommendedMenu.deliveryTime})\n• 배달 기준지: ${DELIVERY_LOCATION.address}\n\n쿠팡이츠: ${currentRecommendedMenu.coupangUrl}\n요기요: ${currentRecommendedMenu.yogiyoUrl}`;

  copyToClipboard(text, `'${currentRecommendedMenu.name}' 메뉴 정보가 복사되었습니다! 슬랙/카톡에 공유해보세요.`);
}

/* ==========================================================================
   2. Tournament Mode (2지선다 이상형 월드컵)
   ========================================================================== */
function initTournament() {
  // Shuffle 8 random menus from 20 dataset for concise tournament
  const shuffled = [...MENU_DATA].sort(() => 0.5 - Math.random());
  tourneyRound = shuffled.slice(0, 8);
  tourneyNextRound = [];
  tourneyMatchIndex = 0;
  tourneyTotalMatches = 4; // 8강 (4경기)

  document.getElementById('winnerBox').style.display = 'none';
  document.getElementById('versusContainer').style.display = 'flex';
  
  renderTournamentMatch();
}

function renderTournamentMatch() {
  const roundName = tourneyRound.length === 8 ? '8강전' : (tourneyRound.length === 4 ? '준결승 (4강)' : '결승전 (FINAL)');
  const matchNumber = (tourneyMatchIndex / 2) + 1;
  const totalMatchesInRound = tourneyRound.length / 2;

  document.getElementById('tourneyRoundText').textContent = `${roundName} (${matchNumber}/${totalMatchesInRound})`;

  const itemA = tourneyRound[tourneyMatchIndex];
  const itemB = tourneyRound[tourneyMatchIndex + 1];

  // Choice A
  document.getElementById('tourneyImgA').src = itemA.image;
  document.getElementById('tourneyCatA').textContent = itemA.categoryName;
  document.getElementById('tourneyTitleA').textContent = itemA.name;
  document.getElementById('tourneyRestA').textContent = itemA.restaurant;
  document.getElementById('tourneyCalA').textContent = `🔥 ${itemA.calories} kcal`;

  // Choice B
  document.getElementById('tourneyImgB').src = itemB.image;
  document.getElementById('tourneyCatB').textContent = itemB.categoryName;
  document.getElementById('tourneyTitleB').textContent = itemB.name;
  document.getElementById('tourneyRestB').textContent = itemB.restaurant;
  document.getElementById('tourneyCalB').textContent = `🔥 ${itemB.calories} kcal`;
}

function selectTourneyWinner(choiceOffset) {
  const winner = tourneyRound[tourneyMatchIndex + choiceOffset];
  tourneyNextRound.push(winner);
  tourneyMatchIndex += 2;

  if (tourneyMatchIndex >= tourneyRound.length) {
    // Current round finished
    if (tourneyNextRound.length === 1) {
      // We have the champion!
      showTournamentWinner(tourneyNextRound[0]);
      return;
    }
    // Advance to next round
    tourneyRound = [...tourneyNextRound];
    tourneyNextRound = [];
    tourneyMatchIndex = 0;
  }

  renderTournamentMatch();
}

function showTournamentWinner(winner) {
  currentTournamentWinner = winner;
  document.getElementById('versusContainer').style.display = 'none';
  const winnerBox = document.getElementById('winnerBox');
  winnerBox.style.display = 'block';

  document.getElementById('winnerMenuTitle').textContent = winner.name;
  document.getElementById('winnerDesc').textContent = `[${winner.restaurant}] - ${winner.description}`;
  document.getElementById('winnerImg').src = winner.image;
  document.getElementById('winnerCal').textContent = `🔥 ${winner.calories} kcal | ${winner.price}`;

  document.getElementById('tourneyRoundText').textContent = `👑 우승 메뉴 확정!`;
  launchConfetti();
  showToast(`🎉 팀원들의 선택: [${winner.name}] 우승!`);
}

function openWinnerDelivery(appType) {
  if (!currentTournamentWinner) return;
  const url = appType === 'coupang' ? currentTournamentWinner.coupangUrl : currentTournamentWinner.yogiyoUrl;
  window.open(url, '_blank');
}

function shareWinnerMenu() {
  if (!currentTournamentWinner) return;
  const text = `[🏆 토너먼트 우승 저녁 메뉴 픽!]\n팀원들과의 이상형 월드컵 결과, 오늘 야근 저녁은 '${currentTournamentWinner.name}'(으)로 결정되었습니다!\n\n• 매장: ${currentTournamentWinner.restaurant}\n• 칼로리: ${currentTournamentWinner.calories} kcal | 가격: ${currentTournamentWinner.price}\n• 배달주소: ${DELIVERY_LOCATION.address}\n\n쿠팡이츠: ${currentTournamentWinner.coupangUrl}\n요기요: ${currentTournamentWinner.yogiyoUrl}`;

  copyToClipboard(text, `우승 메뉴 '${currentTournamentWinner.name}' 공유 문구가 복사되었습니다.`);
}

function restartTournament() {
  initTournament();
  showToast('토너먼트를 새롭게 시작합니다!');
}

/* ==========================================================================
   3. All 20 Menu Explorer & Filtering
   ========================================================================== */
function renderMenuList() {
  const container = document.getElementById('menuListContainer');
  container.innerHTML = '';

  const filtered = MENU_DATA.filter(item => {
    // Category match
    const matchCat = activeCategory === 'all' || item.category === activeCategory;
    
    // Calorie match
    let matchCal = true;
    if (activeCalorieFilter === 'low') {
      matchCal = item.calories < 500;
    } else if (activeCalorieFilter === 'mid') {
      matchCal = item.calories >= 500 && item.calories <= 800;
    } else if (activeCalorieFilter === 'high') {
      matchCal = item.calories > 800;
    }

    return matchCat && matchCal;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; background: var(--bg-card); border-radius: var(--radius-lg); color: var(--text-muted);">
        <div style="font-size: 32px; margin-bottom: 8px;">🍽️</div>
        <div style="font-weight: 700; font-size: 15px; color: var(--text-body);">해당 조건의 메뉴가 없습니다.</div>
        <div style="font-size: 12px; margin-top: 4px;">필터를 변경해보세요.</div>
      </div>
    `;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'menu-card-item';
    card.onclick = () => openDetailModal(item);

    card.innerHTML = `
      <div class="menu-thumb">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
      </div>
      <div class="menu-item-body">
        <div class="menu-item-top">
          <span class="menu-item-cat">${item.categoryName}</span>
          <span class="menu-item-cal">🔥 ${item.calories} kcal</span>
        </div>
        <div class="menu-item-name">${item.name}</div>
        <div class="menu-item-rest">🏢 ${item.restaurant}</div>
        <div class="menu-item-bottom">
          <span class="menu-item-price">${item.price}</span>
          <div class="menu-item-apps">
            <span class="app-micro-badge chip-coupang">쿠팡</span>
            <span class="app-micro-badge chip-yogiyo">요기요</span>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function filterCategory(cat, element) {
  activeCategory = cat;
  document.querySelectorAll('#categoryFilterBar .filter-chip').forEach(btn => btn.classList.remove('active'));
  element.classList.add('active');
  renderMenuList();
}

function filterCalories(range, element) {
  activeCalorieFilter = range;
  document.querySelectorAll('.calorie-toggle-bar .cal-chip').forEach(btn => btn.classList.remove('active'));
  element.classList.add('active');
  renderMenuList();
}

/* ==========================================================================
   4. Detail Modal & Bottom Sheet
   ========================================================================== */
function openDetailModal(menu) {
  currentModalMenu = menu;
  const modal = document.getElementById('detailModal');
  
  document.getElementById('modalFoodImg').src = menu.image;
  document.getElementById('modalCategory').textContent = menu.categoryName;
  document.getElementById('modalCalorie').textContent = `🔥 ${menu.calories} kcal`;
  document.getElementById('modalRestaurant').textContent = `🏢 ${menu.restaurant}`;
  document.getElementById('modalMenuName').textContent = menu.name;
  document.getElementById('modalDesc').textContent = menu.description;
  document.getElementById('modalDeliveryTime').textContent = menu.deliveryTime;
  document.getElementById('modalPrice').textContent = menu.price;

  // Render Tags
  const tagsContainer = document.getElementById('modalTags');
  tagsContainer.innerHTML = '';
  menu.tags.forEach(tag => {
    const tagBadge = document.createElement('span');
    tagBadge.style.cssText = 'background: var(--toss-blue-light); color: var(--toss-blue); font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: var(--radius-xs);';
    tagBadge.textContent = `#${tag}`;
    tagsContainer.appendChild(tagBadge);
  });

  // Action buttons
  document.getElementById('modalBtnCoupang').onclick = () => {
    window.open(menu.coupangUrl, '_blank');
  };
  document.getElementById('modalBtnYogiyo').onclick = () => {
    window.open(menu.yogiyoUrl, '_blank');
  };

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
  const modal = document.getElementById('detailModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function closeModalOnBackdrop(e) {
  if (e.target.id === 'detailModal') {
    closeDetailModal();
  }
}

function shareModalMenu() {
  if (!currentModalMenu) return;
  const text = `[야근 저메추 추천 🍱]\n오늘 저녁 메뉴는 '${currentModalMenu.name}'(이)가 딱입니다!\n• 식당: ${currentModalMenu.restaurant}\n• 칼로리: ${currentModalMenu.calories} kcal | 가격: ${currentModalMenu.price}\n• 배달 가능지: ${DELIVERY_LOCATION.address}\n\n쿠팡이츠: ${currentModalMenu.coupangUrl}\n요기요: ${currentModalMenu.yogiyoUrl}`;

  copyToClipboard(text, `'${currentModalMenu.name}' 메뉴 정보가 복사되었습니다.`);
}

/* ==========================================================================
   Utilities: Confetti & Toast & Clipboard
   ========================================================================== */
function launchConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3182F6', '#04B056', '#FF701E', '#8353E2', '#FFDD00']
    });
  }
}

function showToast(message) {
  const toast = document.getElementById('toastMsg');
  const toastText = document.getElementById('toastText');
  
  if (!toast) return;
  toastText.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

function copyToClipboard(text, successMsg) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg);
    }).catch(() => {
      fallbackCopy(text, successMsg);
    });
  } else {
    fallbackCopy(text, successMsg);
  }
}

/* ==========================================================================
   PWA & Service Worker Registration
   ========================================================================== */
let deferredPrompt = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').then((reg) => {
      console.log('ServiceWorker registered with scope:', reg.scope);
    }).catch((err) => {
      console.log('ServiceWorker registration failed:', err);
    });
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showToast('📲 홈 화면에 [저메추] 앱을 설치할 수 있습니다!');
});

function promptInstallApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        showToast('저메추 앱이 설치되었습니다!');
      }
      deferredPrompt = null;
    });
  } else {
    showToast('브라우저 메뉴에서 [홈 화면에 추가]를 눌러 앱을 설치하세요.');
  }
}

