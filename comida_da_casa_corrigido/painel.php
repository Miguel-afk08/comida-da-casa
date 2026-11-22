<?php

declare(strict_types=1);

session_start();

if (empty($_SESSION["usuario_nome"])) {
    header("Location: index.htm");
    exit;
}

$nome = (string) $_SESSION["usuario_nome"];
$email = (string) ($_SESSION["usuario_email"] ?? "");
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Minha conta — Comida da Casa</title>
    <meta name="robots" content="noindex">
    <meta name="theme-color" content="#f6f1e7">
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
    <link rel="icon" href="../img/favicon.svg" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="auth.css">
</head>

<body class="auth-body">
    <header class="auth-top">
        <a class="brand" href="../index.htm">
            <span class="brand-name">Comida da Casa</span>
            <span class="brand-sub">Cozinha caseira · Recife</span>
        </a>
        <div class="auth-top-actions">
            <button type="button" class="theme-toggle" data-theme-toggle aria-pressed="false" aria-label="Mudar para o tema escuro">
                <svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7"/></svg>
                <svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.2 8.2 0 1 0 10.2 10.2Z"/></svg>
            </button>
            <a class="auth-back" href="logout.php">Sair</a>
        </div>
    </header>

    <main class="panel-shell">
        <div class="panel-card">
            <span class="eyebrow">Área do cliente</span>
            <h1>Olá, <?= htmlspecialchars($nome, ENT_QUOTES, "UTF-8") ?>.</h1>
            <p>Sua conta está ativa. Por enquanto, os pedidos continuam sendo confirmados pelo WhatsApp — o histórico dentro do site ainda está em construção.</p>

            <div class="panel-meta">
                <span>E-mail: <strong><?= htmlspecialchars($email, ENT_QUOTES, "UTF-8") ?></strong></span>
                <span>Sessão: <strong>ativa</strong></span>
            </div>

            <div class="panel-actions">
                <a class="btn-submit" href="../cardapio.htm">Ver o cardápio</a>
                <a class="btn-ghost" href="logout.php">Encerrar sessão</a>
            </div>

            <p class="auth-note">Você só vê esta página com a sessão aberta. Ao sair, o acesso é encerrado no servidor.</p>
        </div>
    </main>

    <script>
    (function () {
        function temaAtual() {
            return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        }
        function aplicar(t) {
            document.documentElement.setAttribute("data-theme", t);
            try { localStorage.setItem("comida-da-casa:tema:v1", t); } catch (e) {}
            var meta = document.querySelector('meta[name="theme-color"]');
            if (meta) meta.setAttribute("content", t === "dark" ? "#171310" : "#f6f1e7");
            document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
                var escuro = t === "dark";
                btn.setAttribute("aria-pressed", String(escuro));
                btn.setAttribute("aria-label", escuro ? "Mudar para o tema claro" : "Mudar para o tema escuro");
            });
        }
        document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                document.documentElement.classList.add("theme-switching");
                setTimeout(function () {
                    document.documentElement.classList.remove("theme-switching");
                }, 450);
                aplicar(temaAtual() === "dark" ? "light" : "dark");
            });
        });
        aplicar(temaAtual());
    })();
    </script>
</body>

</html>
