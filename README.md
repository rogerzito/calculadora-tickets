# Ticket & Kill Calculator

Calculadora frontend em HTML, CSS e JavaScript puro.

## Fórmulas

### Tickets para Kills

`Tickets × 1,5 = Kills`

Exemplo:

`300 tickets × 1,5 = 450 kills`

### Kills para Tickets

`Kills ÷ 1,5 = Tickets`

Exemplo:

`300 kills ÷ 1,5 = 200 tickets`

### Power do inimigo

`Meu HP × Meu Power ÷ 51 = Power aproximado do inimigo`

## Rewards

O ciclo informado é:

- 0/140
- posição 65 → +20 tickets
- posição 120 → +20 tickets
- posição 140 → reinicia o ciclo em 0/140

## Bots

A lista de bots fica no começo de `script.js`, no array `BOTS`.

Cada bot possui:

- name
- power
- trusted
- tickets

A equivalência de kills do reward do bot usa a mesma regra principal:

`tickets × 1,5 = kills`
