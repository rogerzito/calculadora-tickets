# Planejador de Combate & Kills — v2.0

Utilitário tático para gestão de tickets, assaltos de gangue (SF), progressão de recompensas e estimativa de poder inimigo. HTML, CSS e JavaScript puro com cálculos 100% locais e reatividade em tempo real.

---

## Fórmulas

### Tickets ↔ Kills

Cada **1 Kill custa 1.5 Tickets**.

| Operação | Fórmula | Exemplo |
| :--- | :--- | :--- |
| Kills possíveis com meus tickets | `Kills = Tickets / 1.5` | 150 tickets / 1.5 = **100 kills** |
| Tickets necessários para X kills | `Tickets = Kills * 1.5` | 100 kills * 1.5 = **150 tickets** |

### Power Inimigo (Power Scanner)

```
Power Inimigo = (HP Perdido * Meu Power) / 51
```

- **HP Perdido**: valor absoluto de HP perdido no ataque (ex: 50), **não é porcentagem**.
- **Meu Power**: power do jogador antes da luta (ex: 500000).
- Exemplo: `(50 * 500000) / 51 = 490,196`.

---

## Ciclo de Recompensas de Kills

O ciclo possui 140 posições e reinicia automaticamente ao completar:

| Marco | Bônus |
| :--- | :--- |
| Posição 65 / 140 | +20 tickets |
| Posição 120 / 140 | +20 tickets |
| Posição 140 / 140 | Ciclo reinicia em 0 |

Total possível por ciclo completo: **+40 tickets de bônus**.

---

## Assalto de Gangue (SF)

O SF acontece **1 vez a cada 12 horas reais** — não acumula. O seletor permite escolher o alvo ou "Nenhum" caso não vá fazer SF no momento.

| Alvo | Tickets | Kills Equivalentes |
| :--- | :--- | :--- |
| Johnny | 10 | 6.7 kills |
| Max's Crew | 10 | 6.7 kills |
| Andrew the Butcher's Crew | 25 | 16.7 kills |
| Lobster Girl | 25 | 16.7 kills |
| Prime | 25 | 16.7 kills |
| Milos the Cutter | 25 | 16.7 kills |
| Laski | 25 | 16.7 kills |
| Giovanni | 35 | 23.3 kills |

---

## Painel Consolidado & Planejador Reverso

O painel estratégico integra em tempo real:

1. **Tickets em Mãos** — estoque atual informado pelo jogador.
2. **Tickets de SF** — tickets do bot selecionado (único, sem acumular).
3. **Bônus de Ciclo** — marcos de 65 e 120 atingidos no trajeto projetado.
4. **Saldo Total** = Tickets em Mãos + Tickets de SF + Bônus de Ciclo.
5. **Kills Possíveis** = Saldo Total / 1.5.

### Planejador Reverso (Meta de Kills)

Ao definir uma meta de kills:

- **Custo bruto** = Meta * 1.5 tickets.
- O sistema abate automaticamente tickets em mãos, SF e bônus de ciclo.
- Exibe **tickets excedentes** ou **tickets faltantes** conforme o resultado.

---

## Como Usar

Abra `index.html` em qualquer navegador moderno. Sem dependências externas.
