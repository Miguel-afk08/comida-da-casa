<?php

declare(strict_types=1);

/*
 * Conexão com o MySQL do XAMPP.
 * Se o seu ambiente usar outra configuração, ajuste as quatro variáveis abaixo.
 */
$servidor = "localhost";
$usuario = "root";
$senha = "";
$banco = "sistema_login";

try {
    $conexao = new mysqli($servidor, $usuario, $senha, $banco);
    $conexao->set_charset("utf8mb4");

    if ($conexao->connect_error) {
        throw new RuntimeException($conexao->connect_error);
    }
} catch (Throwable $falha) {
    http_response_code(500);
    exit("Não foi possível conectar ao banco de dados. Inicie o MySQL no XAMPP e confira se o banco 'sistema_login' foi importado (arquivo banco.sql).");
}
