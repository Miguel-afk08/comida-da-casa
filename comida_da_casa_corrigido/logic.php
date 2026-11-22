<?php

declare(strict_types=1);

session_start();
require_once "conexao.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: index.htm");
    exit;
}

$email = trim((string) ($_POST["email"] ?? ""));
$senha = (string) ($_POST["senha"] ?? "");
$erro = "";

if ($email === "" || $senha === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $erro = "Informe um e-mail válido e a senha.";
} else {
    try {
        $sql = "SELECT id, nome, email, senha FROM usuarios WHERE email = ? LIMIT 1";
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $usuario = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (is_array($usuario) && password_verify($senha, $usuario["senha"])) {
            session_regenerate_id(true);
            $_SESSION["usuario_id"] = (int) $usuario["id"];
            $_SESSION["usuario_nome"] = $usuario["nome"];
            $_SESSION["usuario_email"] = $usuario["email"];

            header("Location: painel.php");
            exit;
        }

        $erro = "E-mail ou senha incorretos.";
    } catch (mysqli_sql_exception $falha) {
        $erro = "Não foi possível concluir o login agora. Tente novamente em instantes.";
    }
}

if ($erro !== "") {
    http_response_code(401);
}
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Entrar — Comida da Casa</title>
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

            <p class="auth-quote">“Comida boa é a que faz <em>querer repetir</em> no dia seguinte.”</p>

            <div class="auth-brand-footer">
                <span>Rua do Bom Jesus, 120<br>Recife Antigo, Recife — PE</span>
                <span>Segunda a sábado<br>11h às 22h</span>
            </div>
        </aside>

        <main class="auth-main">
            <div class="auth-card">
                <span class="eyebrow">Área do cliente</span>
                <h1>Que bom te ver.</h1>
                <p class="sub">Entre para acessar sua conta e agilizar os próximos pedidos.</p>

                <p class="auth-alert" role="alert"><?= htmlspecialchars($erro, ENT_QUOTES, "UTF-8") ?></p>

                <form action="logic.php" method="post">
                    <div class="field">
                        <label for="email">E-mail</label>
                        <input type="email" id="email" name="email" autocomplete="email" placeholder="voce@email.com" value="<?= htmlspecialchars($email, ENT_QUOTES, "UTF-8") ?>" required>
                    </div>

                    <div class="field">
                        <label for="senha">Senha</label>
                        <input type="password" id="senha" name="senha" autocomplete="current-password" placeholder="Sua senha" required autofocus>
                    </div>

                    <button type="submit" class="btn-submit">Entrar</button>
                </form>

                <p class="auth-alt">Ainda não tem conta? <a href="cadastro.htm">Criar conta</a></p>
                <a class="auth-back" href="../index.htm">← Voltar ao site</a>
            </div>
        </main>
    </div>
</body>

</html>
