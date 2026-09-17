# AGENTS.md

Este documento existe para orientar agentes de código (e humanos que trabalham
com eles) sobre o estado atual do repositório Meeting Cost CLI. Ele foi escrito
como uma primeira versão de contexto global: útil o bastante para não inventar
arquivos ou comandos, mas deliberadamente mais longo do que o estritamente
necessário. Leia o repositório antes de mudar qualquer coisa. Quando houver
dúvida entre este arquivo e o código-fonte, o código-fonte vence.

## Visão geral do produto

O produto é uma aplicação de linha de comando em Node.js chamada Meeting Cost
CLI. Ela estima o custo total de mão de obra de uma reunião a partir de três
entradas fornecidas pela linha de comando: número de participantes, duração da
reunião em minutos e custo por hora. A fórmula implementada multiplica o número
de participantes pela fração de hora correspondente à duração e pelo custo
horário. Em outras palavras, o custo total é
`participantes * (duraçãoEmMinutos / 60) * custoPorHora`.

O objetivo do produto é ser a menor aplicação útil possível nesta etapa do
curso: um cálculo de domínio puro, um ponto de entrada de CLI e documentação
mínima de projeto. Não há API HTTP, não há banco de dados, não há interface
gráfica e não há serviços externos. Tudo acontece no processo Node local via
argumentos de linha de comando e saída em stdout/stderr.

Vale repetir: o produto calcula o custo de mão de obra de uma reunião. Se um
agente for solicitado a adicionar autenticação, filas, microsserviços ou um
frontend, isso está fora do escopo atual descrito por este repositório.

## Estrutura real do repositório

A estrutura real do repositório, no momento em que este arquivo foi escrito, é
pequena e deve ser tratada como a fonte de verdade estrutural. Os arquivos e
diretórios relevantes são:

- `package.json` — manifesto npm, ESM (`"type": "module"`), engines Node `>=24`,
  e o único script declarado: `start`.
- `src/meeting-cost.js` — função de domínio pura e exportada
  `calculateMeetingCost`.
- `src/cli.js` — ponto de entrada da CLI: lê `process.argv`, chama o domínio e
  imprime resultado ou erro.
- `PROJETO.md` — descrição curta do produto e exemplo de uso.
- `README.md` — documentação do curso/tutorial do repositório (não altere
  sem pedido explícito).
- `LICENSE` — licença do repositório.
- `AGENTS.md` — este arquivo de contexto para agentes.

Não invente pastas como `tests/`, `lib/`, `dist/`, `.github/workflows/`,
`rules/`, `skills/` ou configuração MCP se elas ainda não existirem. A
estrutura real do repositório é a lista acima. Qualquer mudança estrutural deve
ser deliberada e justificada pelo pedido do usuário, não por hábito de
scaffolding.

Novamente, sobre a estrutura: o cálculo mora em `src/meeting-cost.js` e a
leitura de argumentos / saída de terminal mora em `src/cli.js`. Mantenha essa
separação. Não misture parsing de CLI dentro da função de domínio e não
embuta regras de validação de domínio apenas no ponto de entrada.

## Comandos que realmente existem hoje

Hoje existe um único script npm declarado em `package.json`:

```bash
npm start -- <participants> <durationMinutes> <hourlyCost>
```

Exemplo documentado e verificável:

```bash
npm start -- 6 45 120
```

Saída esperada para esse exemplo (conforme `PROJETO.md` e o comportamento
atual da CLI):

```text
Meeting cost: 540.00 (6 participants × 45 min × 120/hour)
```

Não existem, neste repositório, scripts npm como `test`, `lint`, `format`,
`typecheck`, `build` ou `dev`. Não invente esses comandos. Se o usuário pedir
para "rodar os testes" e não houver script de teste, diga isso claramente em
vez de fabricar uma suíte.

O comando `start` executa `node src/cli.js`. A aplicação usa somente recursos
nativos do Node.js e ESM. Não há dependências de produção instaladas no
`package.json` atual e não se deve assumir a existência de `package-lock.json`
como requisito deste arquivo de contexto.

## Invariantes de domínio derivados do código-fonte

As invariantes abaixo vêm diretamente de `src/meeting-cost.js`. Um agente não
deve relaxá-las sem um pedido explícito de mudança de comportamento.

1. `participants`, `durationMinutes` e `hourlyCost` devem ser números finitos
   (`Number.isFinite`). Valores `NaN`, `Infinity` e `-Infinity` são inválidos.
2. `participants` deve ser pelo menos `1`. Menos de um participante é erro.
3. `durationMinutes` deve ser maior que `0`. Duração zero ou negativa é erro.
4. `hourlyCost` deve ser maior ou igual a `0`. Custo por hora negativo é erro.
5. O resultado válido é
   `participants * (durationMinutes / 60) * hourlyCost`.

Essas invariantes de domínio também informam a CLI: `src/cli.js` converte os
argumentos com `Number(...)`, chama `calculateMeetingCost` e, se a função
lançar, imprime uma mensagem de erro acionável e o usage. Em caso de argumentos
ausentes, a CLI também falha com erro e usage, definindo `process.exitCode = 1`.

Repetindo a essência do domínio: rejeite não finitos; rejeite menos de um
participante; rejeite duração não positiva; rejeite custo horário negativo;
calcule custo total de mão de obra para entradas válidas.

## Restrições de ESM, Node e dependências

Este projeto é ESM. O `package.json` declara `"type": "module"`. Imports usam
extensão `.js` (por exemplo, `import { calculateMeetingCost } from "./meeting-cost.js"`).
Não converta o projeto para CommonJS sem pedido explícito.

O campo `engines` pede Node.js `>=24`. Prefira APIs nativas do Node. Não
adicione dependências npm só porque "é o padrão em outros projetos". Neste
estado do repositório, o código usa somente recursos nativos do Node.js e ESM.
Se for absolutamente necessário introduzir uma dependência, peça confirmação e
explique o motivo; não faça isso por iniciativa própria neste contexto.

Também vale reforçar o que já foi dito na visão geral e na estrutura: a
arquitetura desejada separa domínio puro e I/O de terminal. Preserve isso ao
editar arquivos em `src/`.

## Expectativas de validação e tratamento de erros

Validação de domínio ocorre na função pura exportada. A CLI é responsável por:

- Ler exatamente três argumentos posicionais após o script.
- Detectar argumentos ausentes e imprimir erro + usage em stderr.
- Converter strings de argv para números.
- Capturar erros lançados por `calculateMeetingCost`.
- Em sucesso, imprimir uma linha clara em stdout com o custo formatado em
  duas casas decimais e um resumo dos inputs.
- Em falha, imprimir `Error: ...`, o usage e sair com código de saída não zero
  via `process.exitCode = 1`.

Mensagens de erro devem permanecer acionáveis: diga o que está errado e mostre
como chamar a ferramenta. Não engula exceções. Não imprima stack traces longos
para erros de validação esperados, a menos que o usuário peça depuração
detalhada.

Mais uma vez: entradas inválidas produzem erro claro; entradas válidas produzem
resultado claro. Esse contrato é parte do produto.

## Limites de segurança

Mesmo sendo uma CLI pequena e local, agentes devem respeitar limites de
segurança básicos:

- Não embutir segredos, tokens, chaves de API ou credenciais em arquivos do
  repositório.
- Não executar comandos destrutivos (`rm -rf`, reset hard, force push, etc.)
  sem pedido explícito e compreensão do impacto.
- Não exfiltrar conteúdo do repositório para serviços externos sem necessidade
  clara do usuário.
- Não alterar `LICENSE` ou políticas legais sem solicitação explícita.
- Tratar argumentos da CLI como dados de entrada, não como código a ser
  avaliado (`eval` ou equivalente não é apropriado aqui).

A aplicação atual não acessa rede, sistema de arquivos do usuário além do
próprio processo Node, nem variáveis de ambiente obrigatórias. Mantenha esse
perfil simples a menos que o usuário peça o contrário.

## Ações que um agente não pode executar

Salvo pedido explícito e incompatível com as restrições do momento, um agente
trabalhando neste repositório **não deve**:

- Inventar comandos npm que não existem (`test`, `lint`, `build`, etc.).
- Inventar arquivos, pastas, serviços, bancos, CI ou requisitos inexistentes.
- Criar rules, skills, hooks, sensors, configuração MCP, `.gitignore` ou
  pipelines de CI apenas porque "todo projeto sério tem".
- Converter ESM em CommonJS sem necessidade.
- Misturar parsing de CLI dentro da função de domínio pura.
- Remover as validações de domínio listadas acima.
- Alterar `README.md`, `LICENSE`, `package.json` ou `PROJETO.md` sem pedido
  claro (este arquivo `AGENTS.md` é o artefato de contexto; mudanças nele
  também devem ser pedidas).
- Fazer commit automaticamente só porque arquivos mudaram.
- Instalar dependências sem motivo e sem alinhamento com o estado atual do
  projeto.

Se o usuário pedir algo fora desses limites, explique o conflito e peça
confirmação antes de prosseguir.

## Checklist de conclusão

Antes de considerar uma tarefa concluída neste repositório, verifique:

- [ ] O pedido do usuário foi atendido sem inventar arquivos ou comandos.
- [ ] A separação domínio (`src/meeting-cost.js`) vs CLI (`src/cli.js`) permanece.
- [ ] As invariantes de validação do domínio ainda valem (finitos, participantes
      ≥ 1, duração > 0, custo horário ≥ 0).
- [ ] O cálculo continua `participantes * (minutos / 60) * custoPorHora`.
- [ ] O único comando assumido sem evidência nova é `npm start -- ...`.
- [ ] ESM e Node `>=24` foram respeitados; sem dependências desnecessárias.
- [ ] Erros inválidos continuam acionáveis; sucessos continuam legíveis.
- [ ] Nenhum segredo foi introduzido; nenhuma ação destrutiva foi tomada sem
      pedido.
- [ ] `README.md`, `LICENSE` e demais arquivos fora de escopo não foram
      alterados sem solicitação.
- [ ] Se a tarefa era apenas documentação de agente, somente `AGENTS.md` foi
      criado ou editado.

Este checklist repete de propósito pontos já cobertos nas seções anteriores:
produto, estrutura, comandos reais, invariantes, ESM/dependências, erros,
segurança e proibições. A repetição é intencional para tornar o arquivo
verboso o bastante como primeira versão de contexto, sem inventar requisitos
que o código não implementa.
