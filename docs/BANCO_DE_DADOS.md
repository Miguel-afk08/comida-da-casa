# Banco de dados

## Parte pública

O site público não usa banco. A sacola fica no `localStorage` do navegador, na chave `comida-da-casa:sacola:v1`, e o pedido é enviado pelo WhatsApp. Limpar os dados do site esvazia a sacola.

## Área do cliente

O script `comida_da_casa_corrigido/banco.sql` cria o banco `sistema_login` (utf8mb4) e a tabela `usuarios`:

| Campo | Tipo | Regra |
|---|---|---|
| `id` | INT UNSIGNED | chave primária, auto incremento |
| `nome` | VARCHAR(100) | obrigatório |
| `email` | VARCHAR(100) | obrigatório e único (`uq_usuarios_email`) |
| `senha` | VARCHAR(255) | hash gerado por `password_hash()` |
| `criado_em` | TIMESTAMP | padrão `CURRENT_TIMESTAMP` |

A tabela usa InnoDB e collation `utf8mb4_unicode_ci`.

### Importação

1. Inicie o MySQL no XAMPP.
2. Abra `http://localhost/phpmyadmin`.
3. Aba **Importar** → selecione `comida_da_casa_corrigido/banco.sql` → **Executar**.
4. Acesse a área do cliente e crie uma conta.

O script é idempotente (`CREATE DATABASE IF NOT EXISTS` e `CREATE TABLE IF NOT EXISTS`), então pode ser executado de novo sem apagar contas existentes.

### Conexão

Definida em `comida_da_casa_corrigido/conexao.php`:

- servidor: `localhost`
- usuário: `root`
- senha: vazia
- banco: `sistema_login`

Ajuste se o seu MySQL tiver outra configuração. Falhas de conexão são tratadas com mensagem amigável, sem expor detalhes do servidor.

## Relação com o pedido

O banco guarda apenas as contas. Itens, quantidades e total do pedido não são gravados; eles existem na sacola do navegador e na mensagem do WhatsApp. Um histórico de pedidos dentro da conta está fora do escopo desta versão.
