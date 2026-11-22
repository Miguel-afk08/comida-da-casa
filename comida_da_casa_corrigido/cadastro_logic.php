<?php

declare(strict_types=1);

require_once "conexao.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: cadastro.htm");
    exit;
}

$nome = trim((string) ($_POST["nome"] ?? ""));
$email = trim((string) ($_POST["email"] ?? ""));
$senha = (string) ($_POST["senha"] ?? "");
$confirma = (string) ($_POST["confirma_senha"] ?? "");

$erro = "";
$sucesso = false;
$nomeTamanho = function_exists("mb_strlen") ? mb_strlen($nome) : strlen($nome);

if ($nome === "" || $email === "" || $senha === "" || $confirma === "") {
    $erro = "Preencha todos os campos.";
} elseif ($nomeTamanho < 2 || $nomeTamanho > 100) {
    $erro = "O nome deve ter entre 2 e 100 caracteres.";
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $erro = "Informe um e-mail válido.";
} elseif (strlen($senha) < 6) {
    $erro = "A senha precisa ter pelo menos 6 caracteres.";
} elseif (strlen($senha) > 72) {
    $erro = "A senha pode ter no máximo 72 caracteres.";
} elseif ($senha !== $confirma) {
    $erro = "As senhas não coincidem.";
} else {
    try {
        $consulta = $conexao->prepare("SELECT id FROM usuarios WHERE email = ? LIMIT 1");
        $consulta->bind_param("s", $email);
        $consulta->execute();
        $consulta->store_result();

        if ($consulta->num_rows > 0) {
            $erro = "Este e-mail já está cadastrado.";
        } else {
            $consulta->close();

            $hash = password_hash($senha, PASSWORD_DEFAULT);
            $insercao = $conexao->prepare("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)");
            $insercao->bind_param("sss", $nome, $email, $hash);
            $insercao->execute();
            $insercao->close();

            $sucesso = true;
        }
    } catch (mysqli_sql_exception $falha) {
        $erro = $falha->getCode() === 1062
            ? "Este e-mail já está cadastrado."
            : "Não foi possível criar a conta agora. Tente novamente em instantes.";
    }
}

if ($erro !== "") {
    http_response_code(422);
}
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Criar conta — Comida da Casa</title>
    <meta name="robots" content="noindex">
    <meta name="theme-color" content="#232a1c">
    <script>
    (function () {
        var tema = "light";
        try {
            tema = localStorage.getItem("comida-da-casa:tema:v1");
            if (!tema) tema = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        } catch (e) {}
        document.documentElement.setAttribute("data-theme", tema);
    })();
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="auth.css">
</head>

<body class="auth-body">
    <div class="auth">
        <aside class="auth-brand">
            <a class="brand" href="../index.htm">
                <span class="brand-name">Comida da Casa</span>
                <span class="brand-sub">Cozinha caseira · Recife</span>
            </a>

            <p class="auth-quote">“A gente cozinha como se fosse <em>para a própria família</em>.”</p>

            <div class="auth-brand-footer">
                <span>Rua do Bom Jesus, 120<br>Recife Antigo, Recife — PE</span>
                <span>Segunda a sábado<br>11h às 22h</span>
            </div>
        </aside>

        <main class="auth-main">
            <div class="auth-card">
                <?php if ($sucesso): ?>
                    <span class="eyebrow">Área do cliente</span>
                    <h1>Conta criada.</h1>
                    <p class="sub">Tudo certo. Agora é só entrar com o e-mail e a senha que você escolheu.</p>

                    <p class="auth-alert auth-alert--success" role="status">
                        Cadastro concluído para <strong><?= htmlspecialchars($email, ENT_QUOTES, "UTF-8") ?></strong>.
                    </p>

                    <a class="btn-submit" href="index.htm">Ir para o login</a>
                    <a class="auth-back" href="../index.htm">← Voltar ao site</a>
                <?php else: ?>
                    <span class="eyebrow">Área do cliente</span>
                    <h1>Criar conta.</h1>
                    <p class="sub">Leva um minuto. Depois é só entrar para acessar sua conta.</p>

                    <p class="auth-alert" role="alert"><?= htmlspecialchars($erro, ENT_QUOTES, "UTF-8") ?></p>

                    <form action="cadastro_logic.php" method="post">
                        <div class="field">
                            <label for="nome">Nome completo</label>
                            <input type="text" id="nome" name="nome" autocomplete="name" placeholder="Como podemos te chamar?" maxlength="100" value="<?= htmlspecialchars($nome, ENT_QUOTES, "UTF-8") ?>" required>
                        </div>

                        <div class="field">
                            <label for="email">E-mail</label>
                            <input type="email" id="email" name="email" autocomplete="email" placeholder="voce@email.com" maxlength="100" value="<?= htmlspecialchars($email, ENT_QUOTES, "UTF-8") ?>" required>
                        </div>

                        <div class="field">
                            <label for="senha">Senha</label>
                            <input type="password" id="senha" name="senha" autocomplete="new-password" placeholder="Crie uma senha" minlength="6" maxlength="72" required>
                            <span class="field-hint">Mínimo de 6 caracteres.</span>
                        </div>

                        <div class="field">
                            <label for="confirma_senha">Repetir senha</label>
                            <input type="password" id="confirma_senha" name="confirma_senha" autocomplete="new-password" placeholder="Repita a senha" minlength="6" maxlength="72" required>
                        </div>

                        <button type="submit" class="btn-submit">Cadastrar</button>
                    </form>

                    <p class="auth-alt">Já tem uma conta? <a href="index.htm">Entrar</a></p>
                    <a class="auth-back" href="../index.htm">← Voltar ao site</a>
                <?php endif; ?>
            </div>
        </main>
    </div>
</body>

</html>
