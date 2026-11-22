# Comida da Casa

Site de restaurante feito como trabalho acadêmico: cardápio com sacola, contato pelo WhatsApp e uma área do cliente com cadastro e login em PHP/MySQL. A parte pública é estática (HTML, CSS e JavaScript, sem build) e a área do cliente roda no XAMPP.

## Páginas

| Arquivo | Conteúdo |
|---|---|
| `index.htm` | Início: apresentação, pratos do dia e como pedir |
| `cardapio.htm` | Cardápio completo, quantidades e sacola |
| `sobre.htm` | História, princípios e fotos da casa |
| `contato.htm` | Endereço, horário e formulário que abre o WhatsApp |
| `creditos.htm` | Créditos das imagens e fontes, aviso de dados fictícios |
| `style.css` | Estilos compartilhados (desktop e celular) |
| `script.js` | Pratos, sacola, formulário, menu e animações |
| `img/` | Fotos dos pratos e favicon |

A área do cliente fica em [`comida_da_casa_corrigido/`](comida_da_casa_corrigido/README.md): login, cadastro, painel protegido por sessão e logout.

## Como rodar a parte pública

Abra `index.htm` no navegador ou sirva a pasta com um servidor local:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Como rodar a área do cliente

1. Copie o projeto inteiro para `C:\xampp\htdocs\`.
2. No XAMPP, inicie **Apache** e **MySQL**.
3. Importe `comida_da_casa_corrigido/banco.sql` no phpMyAdmin.
4. Acesse `http://localhost/<pasta-do-projeto>/comida_da_casa_corrigido/index.htm`.

Passo a passo completo em [`docs/INSTALACAO.md`](docs/INSTALACAO.md).

## Funcionalidades

- Sacola com quantidades, total e persistência no navegador (`localStorage`).
- Fechamento do pedido por link do WhatsApp com itens e total já escritos.
- Formulário de contato que monta a mensagem no WhatsApp.
- Cadastro com senha criptografada (`password_hash`), login por sessão e logout.
- Layout responsivo (testado de 320 px a telas grandes), navegação por teclado,
  foco preso na sacola, `prefers-reduced-motion` e textos alternativos nas imagens.
- Conteúdo visível mesmo sem JavaScript; a sacola depende de JS.

## O que personalizar antes de publicar

- **WhatsApp:** `script.js` (`WHATSAPP`) e os links `wa.me` em `index.htm`, `contato.htm` e no rodapé.
- **Pratos e preços:** array `DISHES` em `script.js`.
- **Endereço, horário e e-mail:** páginas e rodapés.
- **Banco:** credenciais em `comida_da_casa_corrigido/conexao.php`.

## Limitações

- Não há pagamento online nem painel administrativo.
- O pedido não é gravado no banco; ele é confirmado pelo WhatsApp.
- Nome, endereço, telefone, preços e relatos são fictícios (ver `creditos.htm`).

## Documentação

- [Instalação e execução](docs/INSTALACAO.md)
- [Manual do usuário](docs/MANUAL_DO_USUARIO.md)
- [Documentação técnica](docs/DOCUMENTACAO_TECNICA.md)
- [Requisitos](docs/REQUISITOS.md)
- [Banco de dados](docs/BANCO_DE_DADOS.md)
