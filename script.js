/**
 * PLANEJADOR DE COMBATE & KILLS — v2.0
 *
 * REGRA CORRETA:
 *   1 Kill custa 1.5 Tickets.
 *   Kills = Tickets / 1.5
 *   Tickets = Kills * 1.5
 *
 * POWER INIMIGO:
 *   (HP Perdido * Meu Power) / 51
 *   HP Perdido é valor absoluto (ex: 50), NÃO porcentagem.
 *
 * CICLO DE RECOMPENSAS (140 kills):
 *   Marco 65 → +20 tickets
 *   Marco 120 → +20 tickets
 *   140 → reset para 0
 */

// ---- BOTS ----
// SF acontece 1x a cada 12h, sem acumular.
const BOTS = [
  { name: "Nenhum — 0 Tickets", tickets: 0 },
  { name: "Johnny — +10 Tickets", tickets: 10 },
  { name: "Max's Crew — +10 Tickets", tickets: 10 },
  { name: "Andrew the Butcher's Crew — +25 Tickets", tickets: 25 },
  { name: "Lobster Girl — +25 Tickets", tickets: 25 },
  { name: "Prime — +25 Tickets", tickets: 25 },
  { name: "Milos the Cutter — +25 Tickets", tickets: 25 },
  { name: "Laski — +25 Tickets", tickets: 25 },
  { name: "Giovanni — +35 Tickets", tickets: 35 }
];

const $ = (id) => document.getElementById(id);

// ---- FORMATAÇÃO ----
function fmt(v, dec = 0) {
  if (!Number.isFinite(v)) return "0";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec
  }).format(v);
}

function fmtCompact(v) {
  if (!Number.isFinite(v) || v === 0) return "0";
  const a = Math.abs(v);
  if (a >= 1e9) return (v / 1e9).toFixed(2).replace(/\.00$/, "") + "B";
  if (a >= 1e6) return (v / 1e6).toFixed(2).replace(/\.00$/, "") + "M";
  if (a >= 1e3) return (v / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return fmt(v);
}

// ---- MILESTONE HITS ----
// Conta quantas vezes o marco (65 ou 120) é atingido ao fazer X kills
// partindo de startPos dentro de um ciclo de 140.
function milestoneHits(startPos, kills, milestone) {
  if (kills <= 0) return 0;
  const p = ((startPos % 140) + 140) % 140;
  let d = (milestone - p) % 140;
  if (d <= 0) d += 140;
  if (kills < d) return 0;
  return 1 + Math.floor((kills - d) / 140);
}

// ---- DOM ----
const elCurrentTickets = $("currentTickets");
const elTargetKills    = $("targetKills");
const elBotSelect      = $("botSelect");
const elRewardPos      = $("rewardPos");
const elMyPower        = $("myPower");
const elHpLost         = $("hpLost");
const elConvTickets    = $("convTickets");
const elConvKills      = $("convKills");

// Popula select de bots
BOTS.forEach((bot, i) => {
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = bot.name;
  elBotSelect.appendChild(opt);
});
elBotSelect.value = "0";

// ---- RENDER SF ----
function renderSf() {
  const bot = BOTS[Number(elBotSelect.value) || 0];
  const tkt = bot.tickets;
  const kills = tkt / 1.5;

  if (tkt === 0) {
    $("sfResult").innerHTML = `
      <div>
        <span class="sf-val" style="color:var(--muted);">Nenhum SF selecionado</span>
      </div>
    `;
  } else {
    $("sfResult").innerHTML = `
      <div>
        <span class="sf-val gold">+${tkt} Tickets</span>
        <div class="sf-kills">Equivale a ${fmt(kills, 1)} kills (${tkt} ÷ 1.5)</div>
      </div>
    `;
  }
}

// ---- RENDER CYCLE STATUS ----
function renderCycle() {
  let pos = parseInt(elRewardPos.value, 10);
  if (isNaN(pos) || pos < 0) pos = 0;
  if (pos > 140) pos = 140;

  $("cycleBadge").textContent = `[${pos} / 140]`;
  $("cycleBar").style.width = `${(pos / 140) * 100}%`;

  const box = $("cycleStatus");

  if (pos >= 140) {
    box.innerHTML = `
      <span class="ok-text"><strong>Ciclo completo!</strong></span>
      O ciclo reinicia em <strong>[0 / 140]</strong>.
      Próximo bônus: <span class="hl">Marco 65 (+20 Tickets)</span> — faltam 65 kills.
    `;
  } else if (pos < 65) {
    box.innerHTML = `
      Posição: <strong>[${pos} / 140]</strong> — Nenhum bônus resgatado neste ciclo.<br>
      Próximo: <span class="hl">Marco 65 (+20 Tickets)</span> — faltam <strong>${65 - pos}</strong> kills.<br>
      Depois: <strong>Marco 120 (+20 Tickets)</strong> — faltam <strong>${120 - pos}</strong> kills.
    `;
  } else if (pos < 120) {
    box.innerHTML = `
      Posição: <strong>[${pos} / 140]</strong> — <span class="ok-text">✔ Marco 65 resgatado (+20 Tickets).</span><br>
      Próximo: <span class="hl">Marco 120 (+20 Tickets)</span> — faltam <strong>${120 - pos}</strong> kills.<br>
      Reset em 140 — faltam <strong>${140 - pos}</strong> kills.
    `;
  } else {
    box.innerHTML = `
      Posição: <strong>[${pos} / 140]</strong> — <span class="ok-text">✔ Marcos 65 e 120 resgatados (+40 Tickets).</span><br>
      Reset em <span class="hl">140</span> — faltam <strong>${140 - pos}</strong> kills para reiniciar o ciclo.
    `;
  }
}

// ---- CÁLCULO CONSOLIDADO + PLANEJADOR REVERSO ----
function recalc() {
  const currentTickets = Math.max(0, parseFloat(elCurrentTickets.value) || 0);
  const bot = BOTS[Number(elBotSelect.value) || 0];
  const sfTickets = bot.tickets;
  const cyclePos = Math.min(140, Math.max(0, parseInt(elRewardPos.value, 10) || 0));
  const targetKills = Math.max(0, parseFloat(elTargetKills.value) || 0);

  // SF
  $("metricSfTickets").textContent = sfTickets > 0 ? `+${sfTickets}` : "0";
  $("metricSfSub").textContent = sfTickets > 0
    ? `${bot.name.split("—")[0].trim()} (${fmt(sfTickets / 1.5, 1)} kills)`
    : "Nenhum SF selecionado";

  // Bônus de Ciclo — projetado sobre a capacidade ou meta
  // Se tem meta, calcula bônus no trajeto da meta; senão, calcula sobre
  // as kills possíveis com os tickets disponíveis (sem bônus, para evitar recursão).
  const baseTickets = currentTickets + sfTickets;
  const projectedKills = targetKills > 0 ? targetKills : baseTickets / 1.5;

  const hits65  = milestoneHits(cyclePos, projectedKills, 65);
  const hits120 = milestoneHits(cyclePos, projectedKills, 120);
  const totalHits = hits65 + hits120;
  const bonusTickets = totalHits * 20;

  $("metricBonusTickets").textContent = bonusTickets > 0 ? `+${fmt(bonusTickets)}` : "0";
  $("metricBonusSub").textContent = `${totalHits} marco(s) (${hits65}× no 65 | ${hits120}× no 120)`;

  // Saldo total
  const totalTickets = currentTickets + sfTickets + bonusTickets;
  const totalKills = totalTickets / 1.5;

  $("metricTotalTickets").textContent = fmt(totalTickets, 1);
  $("metricTotalKills").textContent = `= ${fmt(totalKills, 1)} kills possíveis`;

  // ---- PLANEJADOR REVERSO ----
  const plannerOut = $("plannerOutput");

  if (targetKills <= 0) {
    plannerOut.innerHTML = `
      <div class="banner neutral">
        <div>
          <div class="banner-title">Sem meta definida</div>
          <p class="banner-text">
            Com o saldo total de <strong>${fmt(totalTickets, 1)} tickets</strong>,
            você pode realizar até <strong>${fmt(totalKills, 1)} kills</strong>.
          </p>
        </div>
      </div>
    `;
    return;
  }

  // Custo bruto: Kills * 1.5
  const grossCost = targetKills * 1.5;
  const net = totalTickets - grossCost;
  const isOk = net >= 0;

  const breakdownHtml = `
    <div class="breakdown-row">
      <div class="bd-card">
        <span class="bd-label">Custo Bruto da Meta</span>
        <span class="bd-val">${fmt(grossCost, 1)} tkt</span>
      </div>
      <div class="bd-card">
        <span class="bd-label">Saldo Disponível</span>
        <span class="bd-val">${fmt(totalTickets, 1)} tkt</span>
      </div>
      <div class="bd-card">
        <span class="bd-label">Diferença Líquida</span>
        <span class="bd-val" style="color: ${isOk ? 'var(--green)' : 'var(--red)'};">
          ${isOk ? "+" : ""}${fmt(net, 1)} tkt
        </span>
      </div>
    </div>
  `;

  if (isOk) {
    const extraKills = net / 1.5;
    plannerOut.innerHTML = breakdownHtml + `
      <div class="banner ok">
        <div>
          <div class="banner-title">✔ Meta Garantida</div>
          <p class="banner-text">
            Sobram <strong>${fmt(net, 1)} tickets excedentes</strong>
            (mais ${fmt(extraKills, 1)} kills extras possíveis).
          </p>
        </div>
        <span class="banner-pill">+${fmt(net, 1)} Tickets</span>
      </div>
    `;
  } else {
    const deficit = Math.abs(net);
    plannerOut.innerHTML = breakdownHtml + `
      <div class="banner bad">
        <div>
          <div class="banner-title">⚠ Déficit de Recursos</div>
          <p class="banner-text">
            Para ${fmt(targetKills)} kills são necessários <strong>${fmt(grossCost, 1)} tickets</strong>.<br>
            Seu saldo total é <strong>${fmt(totalTickets, 1)} tickets</strong>.
            Faltam <strong>${fmt(deficit, 1)} tickets</strong>.
          </p>
        </div>
        <span class="banner-pill">−${fmt(deficit, 1)} Tickets</span>
      </div>
    `;
  }
}

// ---- POWER SCANNER ----
function calcPower() {
  const power = Math.max(0, parseFloat(elMyPower.value) || 0);
  const hpLost = Math.max(0, parseFloat(elHpLost.value) || 0);
  const result = (hpLost * power) / 51;

  const box = $("powerResult");

  if (power === 0 || hpLost === 0) {
    box.innerHTML = `
      <div class="power-label">Power Inimigo Estimado</div>
      <div class="power-num">—</div>
    `;
    return;
  }

  box.innerHTML = `
    <div class="power-label">Power Inimigo Estimado</div>
    <div class="power-num">${fmt(Math.round(result))}</div>
    <div class="power-compact">${fmtCompact(result)}</div>
  `;
}

// ---- CONVERSOR RÁPIDO ----
function convFromTickets() {
  const t = parseFloat(elConvTickets.value);
  if (!Number.isFinite(t) || t <= 0) {
    $("convKillsOut").querySelector("strong").textContent = "—";
    return;
  }
  $("convKillsOut").querySelector("strong").textContent = fmt(t / 1.5, 2);
}

function convFromKills() {
  const k = parseFloat(elConvKills.value);
  if (!Number.isFinite(k) || k <= 0) {
    $("convTicketsOut").querySelector("strong").textContent = "—";
    return;
  }
  $("convTicketsOut").querySelector("strong").textContent = fmt(k * 1.5, 2);
}

// Tabela de referência (Tickets → Kills = Tickets / 1.5)
function buildRefTable() {
  const vals = [50, 100, 150, 200, 300, 500, 750, 1000, 2000];
  const grid = $("refGrid");
  grid.innerHTML = vals.map(t => `
    <div class="ref-item">
      <span>${fmt(t)} tkt</span>
      <strong>${fmt(t / 1.5, 1)} kills</strong>
    </div>
  `).join("");
}

// ---- EVENT BINDINGS ----
// Painel + Planejador
elCurrentTickets.addEventListener("input", recalc);
elTargetKills.addEventListener("input", recalc);

// Quick buttons
document.querySelectorAll(".quick-btns button").forEach(btn => {
  btn.addEventListener("click", () => {
    elTargetKills.value = btn.getAttribute("data-val");
    recalc();
  });
});

// SF
elBotSelect.addEventListener("change", () => { renderSf(); recalc(); });

// Cycle
elRewardPos.addEventListener("input", () => { renderCycle(); recalc(); });

// Power
elMyPower.addEventListener("input", calcPower);
elHpLost.addEventListener("input", calcPower);

// Converter
elConvTickets.addEventListener("input", convFromTickets);
elConvKills.addEventListener("input", convFromKills);

// ---- INIT ----
renderSf();
renderCycle();
recalc();
calcPower();
buildRefTable();
