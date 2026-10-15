const BOTS = [
  { name: "Johnny", power: 600000, trusted: 4, tickets: 10 },
  { name: "Max's Crew", power: 1200000, trusted: 5, tickets: 10 },
  { name: "Andrew the Butcher's Crew", power: 2250000, trusted: 6, tickets: 25 },
  { name: "Lobster Girl", power: 3750000, trusted: 7, tickets: 25 },
  { name: "Prime", power: 4800000, trusted: 7, tickets: 25 },
  { name: "Milos the Cutter", power: 15750000, trusted: 8, tickets: 25 },
  { name: "Laski", power: 22500000, trusted: 8, tickets: 25 },
  { name: "Giovanni", power: 37500000, trusted: 8, tickets: 35 }
];

const $ = (id) => document.getElementById(id);

const format = (value, decimals = 0) =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);

const botSelect = $("botSelect");

BOTS.forEach((bot, index) => {
  const option = document.createElement("option");
  option.value = index;
  option.textContent =
    `${bot.name} — ${format(bot.power)} power — ${bot.tickets} tickets`;
  botSelect.appendChild(option);
});

function renderBot() {
  const bot = BOTS[Number(botSelect.value)];
  const kills = bot.tickets * 1.5;

  $("botInfo").innerHTML = `
    <div class="stat">
      <small>Assault power</small>
      <strong>${format(bot.power)}</strong>
    </div>
    <div class="stat">
      <small>Trusted members</small>
      <strong>${bot.trusted}</strong>
    </div>
    <div class="stat">
      <small>Tickets</small>
      <strong>${bot.tickets}</strong>
    </div>
    <div class="stat">
      <small>Kills equivalentes</small>
      <strong>${format(kills, 2)}</strong>
    </div>
  `;

  $("summary").innerHTML = `
    <div class="stat">
      <small>Bot</small>
      <strong>${bot.name}</strong>
    </div>
    <div class="stat">
      <small>Power</small>
      <strong>${format(bot.power)}</strong>
    </div>
    <div class="stat">
      <small>Trusted</small>
      <strong>${bot.trusted}</strong>
    </div>
    <div class="stat">
      <small>Reward</small>
      <strong>${bot.tickets} tickets = ${format(kills, 2)} kills</strong>
    </div>
  `;
}

/*
 * REGRA PRINCIPAL
 *
 * Tickets -> Kills:
 * tickets * 1.5
 *
 * Kills -> Tickets:
 * kills / 1.5
 */

$("calcKills").addEventListener("click", () => {
  const tickets = Number($("currentTickets").value);

  if (!Number.isFinite(tickets) || tickets < 0) {
    $("killsResult").textContent =
      "Informe uma quantidade válida de tickets.";
    return;
  }

  const kills = tickets * 1.5;

  $("killsResult").innerHTML =
    `Com <strong>${format(tickets, 2)}</strong> tickets, você consegue ` +
    `<strong>${format(kills, 2)} kills</strong>.`;
});

$("calcTickets").addEventListener("click", () => {
  const kills = Number($("targetKills").value);

  if (!Number.isFinite(kills) || kills < 0) {
    $("ticketsResult").textContent =
      "Informe uma quantidade válida de kills.";
    return;
  }

  const tickets = kills / 1.5;

  $("ticketsResult").innerHTML =
    `Para fazer <strong>${format(kills, 2)}</strong> kills, são necessários ` +
    `<strong>${format(tickets, 2)} tickets</strong>.`;
});

/*
 * Reward por posição.
 *
 * Ciclo:
 * 0/140
 * 65 -> +20 tickets
 * 120 -> +20 tickets
 * 140 -> reinicia para 0/140
 */

$("calcReward").addEventListener("click", () => {
  const position = Number($("rewardPosition").value);

  if (!Number.isInteger(position) || position < 0 || position > 140) {
    $("rewardResult").innerHTML =
      `<span class="reward-warning">
        Informe uma posição inteira entre 0 e 140.
      </span>`;
    return;
  }

  if (position >= 140) {
    $("rewardResult").innerHTML = `
      <span class="reward-positive">
        <strong>Ciclo completo!</strong>
      </span><br>
      Ao chegar em 140, a contagem volta para <strong>0/140</strong>.
      Próximo reward: <strong>65 (+20 tickets)</strong>.
    `;
    return;
  }

  if (position < 65) {
    $("rewardResult").innerHTML = `
      <span class="reward-neutral">
        Próximo reward: <strong>65 (+20 tickets)</strong>
      </span><br>
      Faltam <strong>${65 - position}</strong> posições.
      Depois, o próximo será em 120.
    `;
    return;
  }

  if (position < 120) {
    $("rewardResult").innerHTML = `
      <span class="reward-positive">
        Reward de 65 já alcançado: <strong>+20 tickets</strong>.
      </span><br>
      Próximo reward: <strong>120 (+20 tickets)</strong>.
      Faltam <strong>${120 - position}</strong> posições.
    `;
    return;
  }

  $("rewardResult").innerHTML = `
    <span class="reward-positive">
      Rewards de 65 e 120 já alcançados: <strong>+40 tickets</strong>.
    </span><br>
    Próximo marco: <strong>140</strong>.
    Faltam <strong>${140 - position}</strong> posições.
    Ao completar, o ciclo reinicia em <strong>0/140</strong>.
  `;
});

/*
 * Power inimigo:
 *
 * Meu HP antes da luta × meu Power antes da luta ÷ 51
 */

$("calcPower").addEventListener("click", () => {
  const hp = Number($("myHp").value);
  const power = Number($("myPower").value);

  if (
    !Number.isFinite(hp) ||
    hp < 0 ||
    !Number.isFinite(power) ||
    power < 0
  ) {
    $("powerResult").textContent =
      "Informe HP e power válidos.";
    return;
  }

  const enemyPower = (hp * power) / 51;

  $("powerResult").innerHTML =
    `Power inimigo estimado: <strong>${format(enemyPower)}</strong>`;
});

botSelect.addEventListener("change", renderBot);

renderBot();
