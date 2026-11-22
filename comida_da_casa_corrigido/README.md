# Comida da Casa — área do cliente (PHP + MySQL)

Implementação do cadastro, login e painel usando PHP e MySQL, feita para rodar no XAMPP.

## O que tem aqui

| Arquivo | Função |
|---|---|
| `index.htm` | Tela de login |
| `cadastro.htm` | Formulário de cadastro |
| `logic.php` | Valida o login e abre a sessão |
| `cadastro_logic.php` | Valida o cadastro e grava a senha com `password_hash()` |
| `painel.php` | Área do cliente protegida por sessão |
| `logout.php` | Encerra a sessão e volta ao login |
| `conexao.php` | Conexão com o MySQL (localhost / root / senha vazia / sistema_login) |
| `banco.sql` | Cria o banco `sistema_login` e a tabela `usuarios` |
| `auth.css` | Estilo das telas de login, cadastro e painel |

## Como executar

1. Copie a pasta do projeto para `C:\xampp\htdocs\` (recomendado copiar o projeto inteiro, para os links do site funcionarem).
2. Abra o painel do XAMPP e inicie **Apache** e **MySQL**.
3. Acesse `http://localhost/phpmyadmin` e importe o arquivo `banco.sql`.
4. Abra `http://localhost/<nome-da-pasta>/comida_da_casa_corrigido/index.htm`.
5. Crie uma conta em **Criar conta** e entre.

## Configuração do banco

As credenciais ficam em `conexao.php`:

- servidor: `localhost`
- usuário: `root`
- senha: vazia
- banco: `sistema_login`

Se o seu MySQL tiver senha, ajuste o arquivo.

## Segurança aplicada

- Consultas preparadas (`mysqli`) em todas as operações com o banco.
- Senhas gravadas apenas como hash (`password_hash()` + `password_verify()`).
- Sessão renovada no login (`session_regenerate_id`) e destruída no logout.
- Validação de e-mail e tamanho de senha no servidor.
- Mensagem de erro de login genérica, sem revelar se o e-mail existe.
- Saída de dados do usuário escapada com `htmlspecialchars()`.

## Limitações

- O site principal (cardápio e sacola) funciona sem banco; o pedido é confirmado pelo WhatsApp.
- Ainda não há histórico de pedidos dentro da conta.
