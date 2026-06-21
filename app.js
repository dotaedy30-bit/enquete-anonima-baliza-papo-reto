const API_BASE = 'https://enquete-anonima-bpr.onrender.com/api';
const ESTIMATED_TOTAL = 3000;

function calcPct(votes) {
  return (votes / ESTIMATED_TOTAL) * 100;
}

const state = {
  hasVoted: !!localStorage.getItem('poll_has_voted'),
  votedCandidateId: parseInt(localStorage.getItem('poll_voted_for')) || null,
  deviceHash: localStorage.getItem('poll_device_hash') || generateDeviceHash(),
  candidates: [],
  totalVotes: 0,
};

function generateDeviceHash() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const hash = Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  localStorage.setItem('poll_device_hash', hash);
  return hash;
}

function showToast(message, type) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 4000);
}

function hideToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('hidden');
}

function getInitials(name) {
  return name
    .split(' ')
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
}

function renderCandidates() {
  const container = document.getElementById('candidates-container');
  container.innerHTML = '';

  state.candidates.forEach((c) => {
    const card = document.createElement('div');
    card.className = 'candidate-card';
    card.style.animation = `appEntrance 0.4s ease-out ${state.candidates.indexOf(c) * 0.1}s both`;

    const hasPhoto = c.photo_url && c.photo_url.trim() !== '';

    const isVoted = state.votedCandidateId === c.id;

    const isAnulado = c.status && c.status.toLowerCase().includes('anulado');

    const pct = calcPct(c.votes);

    card.innerHTML = `
      <div class="candidate-header">
        ${
          hasPhoto
            ? `<img class="candidate-avatar" src="${c.photo_url}" alt="${c.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="candidate-avatar-placeholder" style="display:none">${getInitials(c.name)}</div>`
            : `<div class="candidate-avatar-placeholder">${getInitials(c.name)}</div>`
        }
        <div class="candidate-info">
          <div class="candidate-name">
            ${c.name}
            ${isAnulado ? `<span class="candidate-status anulado">${c.status}</span>` : ''}
          </div>
          <div class="candidate-party">${c.party}</div>
          <div class="candidate-number">${c.number}</div>
        </div>
      </div>
      <div class="candidate-stats">
        <div class="stat-row">
          <span class="stat-votes"><strong id="votes-${c.id}">${c.votes}</strong> votos</span>
          <span class="stat-percentage" id="pct-${c.id}">${pct.toFixed(2).replace('.', ',')}%</span>
        </div>
      </div>
      <div class="bar-wrapper">
        <div class="bar-fill" id="bar-${c.id}" style="width:${pct}%"></div>
      </div>
      <button class="vote-btn ${isVoted ? 'voted' : ''}" id="btn-${c.id}" ${state.hasVoted ? 'disabled' : ''}>
        ${isVoted ? 'Seu voto' : state.hasVoted ? 'Votação encerrada' : 'Votar'}
      </button>
    `;

    container.appendChild(card);

    const btn = card.querySelector('.vote-btn');
    if (!state.hasVoted) {
      btn.addEventListener('click', () => handleVote(c.id));
    }
  });
}

function renderChart() {
  const container = document.getElementById('chartContainer');

  if (!state.candidates || state.candidates.length === 0) {
    container.innerHTML = `
      <div class="chart-empty">
        <p>Nenhum candidato encontrado</p>
      </div>
    `;
    return;
  }

  const withPct = state.candidates.map((c) => ({ ...c, pct: calcPct(c.votes) }));
  const sorted = [...withPct].sort((a, b) => b.pct - a.pct);

  container.innerHTML = `
    <div class="chart-bar-group">
      ${sorted.map((c, i) => {
        const hasPhoto = c.photo_url && c.photo_url.trim() !== '';
        const barHeight = Math.max(4, Math.min(c.pct, 100));
        return `
          <div class="chart-bar-item">
            <div class="chart-bar-avatar-wrapper">
              <div class="chart-bar-pct">${c.pct.toFixed(2).replace('.', ',')}%</div>
              ${
                hasPhoto
                  ? `<img class="chart-bar-avatar" src="${c.photo_url}" alt="${c.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="chart-bar-avatar-placeholder" style="display:none">${getInitials(c.name)}</div>`
                  : `<div class="chart-bar-avatar-placeholder">${getInitials(c.name)}</div>`
              }
            </div>
            <div class="chart-bar-fill-wrapper">
              <div class="chart-bar-track">
                <div class="chart-bar-fill color-${i + 1}" style="height:${barHeight}px"></div>
              </div>
              <div class="chart-bar-info">
                <div class="chart-bar-name">${c.name}</div>
                <div class="chart-bar-party">${c.party}</div>
                <div class="chart-bar-votes">${c.votes} votos</div>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  requestAnimationFrame(() => {
    container.querySelectorAll('.chart-bar-fill').forEach((el) => {
      const i = Array.from(el.parentElement.parentElement.parentElement.parentElement.children).indexOf(el.parentElement.parentElement.parentElement);
      const candidate = sorted[i];
      if (candidate) {
        const height = Math.max(4, Math.min(candidate.pct, 100));
        el.style.height = `${height}px`;
      }
    });
  });
}

function renderInfoCard() {
  const participation = (state.totalVotes / ESTIMATED_TOTAL) * 100;
  const container = document.getElementById('infoCard');
  container.innerHTML = `
    <div class="info-card-title">Dados da Enquete</div>
    <div class="info-card-row">
      <span class="info-card-label">Total de votos registrados</span>
      <span class="info-card-value highlight">${state.totalVotes}</span>
    </div>
    <div class="info-card-row">
      <span class="info-card-label">Base estimada da enquete</span>
      <span class="info-card-value highlight">${ESTIMATED_TOTAL.toLocaleString('pt-BR')} pessoas</span>
    </div>
    <div class="info-card-row">
      <span class="info-card-label">Participação estimada</span>
      <span class="info-card-value highlight">${participation.toFixed(2).replace('.', ',')}%</span>
    </div>
  `;
}

function openModal() {
  const modal = document.getElementById('resultModal');
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  renderChart();
  renderInfoCard();
}

function closeModal() {
  const modal = document.getElementById('resultModal');
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

async function fetchResults() {
  try {
    const res = await fetch(`${API_BASE}/results`);
    const data = await res.json();
    state.candidates = data.candidates;
    state.totalVotes = data.total_votes;
    renderCandidates();
  } catch (err) {
    console.error('Erro ao carregar resultados:', err);
    const container = document.getElementById('candidates-container');
    container.innerHTML = `
      <div class="candidate-card" style="text-align:center;padding:40px 20px;color:var(--gray-500)">
        <p style="font-size:15px;font-weight:600">Não foi possível carregar os resultados.</p>
        <p style="font-size:13px;margin-top:6px">Verifique se o servidor está rodando.</p>
        <button onclick="location.reload()" style="margin-top:16px;padding:10px 24px;background:var(--blue-600);color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer">Tentar novamente</button>
      </div>
    `;
  }
}

async function handleVote(candidateId) {
  if (state.hasVoted) {
    showToast('Este dispositivo já participou da enquete.', 'error');
    return;
  }

  const btn = document.getElementById(`btn-${candidateId}`);
  if (!btn) return;
  btn.disabled = true;
  btn.textContent = 'Registrando...';

  hideToast();

  try {
    const res = await fetch(`${API_BASE}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate_id: candidateId,
        device_hash: state.deviceHash,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 409) {
        state.hasVoted = true;
        localStorage.setItem('poll_has_voted', '1');
        showToast(data.error || 'Este dispositivo já participou da enquete.', 'error');
        renderCandidates();
      } else {
        showToast(data.error || 'Erro ao registrar voto.', 'error');
        btn.disabled = false;
        btn.textContent = 'Votar';
      }
      return;
    }

    state.hasVoted = true;
    state.votedCandidateId = candidateId;
    localStorage.setItem('poll_has_voted', '1');
    localStorage.setItem('poll_voted_for', candidateId.toString());

    state.candidates = data.candidates;
    state.totalVotes = data.total_votes;
    renderCandidates();
    showToast(data.message || 'Seu voto foi registrado com sucesso', 'success');
  } catch (err) {
    console.error('Erro ao votar:', err);
    showToast('Erro de conexão com o servidor.', 'error');
    btn.disabled = false;
    btn.textContent = 'Votar';
  }
}

function init() {
  document.getElementById('hamburgerBtn').addEventListener('click', openModal);
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.querySelector('.modal-backdrop').addEventListener('click', closeModal);

  setTimeout(() => {
    const splash = document.getElementById('splash');
    splash.classList.add('fade-out');
    setTimeout(() => {
      splash.style.display = 'none';
      document.getElementById('app').classList.remove('hidden');
      fetchResults();
    }, 600);
  }, 2500);
}

document.addEventListener('DOMContentLoaded', init);
