# Instalação e execução

## Parte pública (HTML, CSS e JavaScript)

Não precisa de banco nem de servidor. Duas opções:

1. Abra `index.htm` com dois cliques.
2. Ou sirva a pasta do projeto com um servidor local:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

> Um servidor local é recomendado porque evita bloqueios de arquivos no modo `file://` e reproduz o endereço usado em produção.

## Área do cliente (PHP + MySQL)

Pré-requisitos: XAMPP com **Apache**, **MySQL** e PHP com `mysqli`.

1. Copie o projeto inteiro para `C:\xampp\htdocs\` (copiar tudo mantém o link “Voltar ao site” funcionando).
2. Abra o painel do XAMPP e inicie **Apache** e **MySQL**.
3. Acesse `http://localhost/phpmyadmin`.
4. Na aba **Importar**, selecione `comida_da_casa_corrigido/banco.sql` e execute.
   O script cria o banco `sistema_login` e a tabela `usuarios`.
5. Abra `http://localhost/<pasta-do-projeto>/comida_da_casa_corrigido/cadastro.htm`, crie uma conta e entre.
6. A área logada fica em `painel.php`; o botão **Sair** encerra a sessão.

A conexão padrão está em `comida_da_casa_corrigido/conexao.php`:

- servidor: `localhost`
- usuário: `root`
- senha: vazia
- banco: `sistema_login`

Se o seu MySQL usar senha, ajuste esse arquivo.

### Alternativa sem Apache

Com o MySQL ligado, é possível usar o servidor embutido do PHP a partir da raiz do projeto:

```bash
C:\xampp\php\php.exe -S localhost:8080
```

Acesse `http://localhost:8080/comida_da_casa_corrigido/index.htm`.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| “Não foi possível conectar ao banco” | MySQL parado ou credenciais diferentes de `conexao.php` |
| Página em branco em `painel.php` | Sessão expirada; entre novamente |
| Fotos não aparecem | A pasta `img/` não foi copiada junto |
| Link da área do cliente quebrado | A pasta foi copiada sem o restante do projeto ou com outro nome (os links são relativos) |
