# Documentação técnica

## Visão geral

A parte pública é um site estático: HTML, uma folha de estilos e um único JavaScript compartilhado, sem etapa de build. A área do cliente é uma aplicação PHP/MySQL separada, servida pelo XAMPP.

```
site.html-loja-sql-atualizacao/
├── index.htm · cardapio.htm · sobre.htm · contato.htm · creditos.htm
├── style.css · script.js
├── img/  (fotos, favicon)
├── docs/
└── comida_da_casa_corrigido/  (PHP/MySQL)
```

## Front-end

| Arquivo | Responsabilidade |
|---|---|
| `index.htm` | Hero, pratos em destaque, história, passos do pedido e endereço |
| `cardapio.htm` | Lista dos pratos, painel de pedido (desktop) e barra fixa (celular) |
| `sobre.htm` | História, princípios e fotos |
| `contato.htm` | Informações e formulário que gera mensagem no WhatsApp |
| `creditos.htm` | Licenças das imagens e fontes e aviso de dados fictícios |
| `style.css` | Design system, componentes, responsividade e movimento reduzido |
| `script.js` | Fonte única dos pratos, sacola, drawer, navegação, formulário e reveal |

### Dados e sacola

- `DISHES` em `script.js` é a fonte única dos quatro pratos (id, nome, preço, imagem, descrição, etiquetas). A página inicial (`[data-featured]`) e o cardápio (`[data-menu]`) são renderizados a partir dele.
- A sacola fica em `localStorage`, chave `comida-da-casa:sacola:v1`, no formato `{ "id-do-prato": quantidade }`.
- O total usa `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`.
- O fechamento do pedido monta um link `https://wa.me/<numero>?text=<mensagem>` e o abre em nova aba. Número definido em `WHATSAPP`.

### Sacola lateral (drawer)

- Criada via JS no carregamento, com `role="dialog"`, `aria-modal="true"` e rótulo.
- Ao abrir: bloqueia o scroll do `body`, foca o botão de fechar, prende o foco dentro do painel, fecha com **Esc**, clique no fundo ou botão **X**.
- Ao fechar, devolve o foco ao botão que abriu e restaura o scroll.
- A classe `is-open` é aplicada no próximo frame para a transição de entrada funcionar.
- O painel usa `100dvh` e respeita `env(safe-area-inset-bottom)`.

### Responsividade

- Menu completo até 860 px vira menu suspenso pelo botão de três traços (com `aria-expanded`).
- O painel lateral de pedido dá lugar à barra fixa **Ver sacola** até 900 px.
- Testado de 320 px a 1440 px sem rolagem horizontal.
- Fotos usam `max-width: 100%` e `height: auto`, com atributos de tamanho para evitar salto de layout.

### Acessibilidade e SEO

- `lang="pt-BR"`, títulos e descrições por página, `theme-color` e favicon SVG.
- Link “Pular para o conteúdo”; foco visível; botões com rótulos; imagens com texto alternativo.
- `prefers-reduced-motion` desliga animações.
- O conteúdo principal não depende de JavaScript: o reveal só esconde elementos depois que o `IntersectionObserver` está ativo, e imagens/textos têm fallback em `<noscript>` no cardápio.
- Dados estruturados `Restaurant` em JSON-LD na página inicial.

## Área do cliente (PHP)

| Arquivo | Função |
|---|---|
| `index.htm` | Formulário de login (POST para `logic.php`) |
| `cadastro.htm` | Cadastro (POST para `cadastro_logic.php`) |
| `conexao.php` | Conexão `mysqli` com tratamento de falha |
| `logic.php` | Valida e-mail/senha, verifica o hash e inicia a sessão |
| `cadastro_logic.php` | Valida dados, verifica duplicidade e grava o hash |
| `painel.php` | Página protegida; exige sessão ativa |
| `logout.php` | Limpa sessão e cookie e volta ao login |
| `banco.sql` | Cria `sistema_login` e a tabela `usuarios` |
| `auth.css` | Estilos das telas de autenticação e do painel |

### Fluxo de autenticação

1. `cadastro_logic.php` valida nome, e-mail (`filter_var`) e senha (mínimo 6 caracteres, confirmação igual).
2. Verifica e-mail duplicado e grava com `password_hash(PASSWORD_DEFAULT)` via consulta preparada.
3. `logic.php` busca o usuário por e-mail, confere com `password_verify`, chama `session_regenerate_id(true)` e grava `usuario_id`, `usuario_nome` e `usuario_email` na sessão.
4. `painel.php` redireciona para o login se não houver sessão e escapa a saída com `htmlspecialchars`.
5. `logout.php` encerra a sessão e apaga o cookie.

Erros de login são genéricos (“e-mail ou senha incorretos”) para não revelar se o e-mail existe. Nenhuma mensagem interna do MySQL é exibida ao usuário.

## Limites

- Sem pagamento online, painel administrativo ou histórico de pedidos.
- A sacola vive apenas no navegador; limpar os dados do site zera a sacola.
- O site depende de Google Fonts; sem internet, cai nas fontes do sistema.
