# Requisitos do sistema

## Objetivo

Apresentar o cardápio do restaurante fictício **Comida da Casa**, permitir montar uma sacola e encaminhar o pedido pelo WhatsApp, além de oferecer cadastro e login reais para a área do cliente.

## Requisitos funcionais

- **RF01:** apresentar a página inicial com apresentação, pratos do dia e passo a passo do pedido.
- **RF02:** permitir navegação entre Início, Cardápio, A casa, Contato e Área do cliente.
- **RF03:** listar quatro pratos com foto, descrição, preço e etiquetas.
- **RF04:** permitir ajustar a quantidade antes de adicionar um prato.
- **RF05:** manter a sacola ao navegar entre páginas e recarregar o navegador.
- **RF06:** permitir aumentar, diminuir e remover itens da sacola.
- **RF07:** calcular e exibir total em reais.
- **RF08:** abrir o WhatsApp com itens, quantidades e total do pedido.
- **RF09:** abrir o WhatsApp com mensagem pronta a partir do formulário de contato.
- **RF10:** permitir criar conta com nome, e-mail e senha.
- **RF11:** autenticar usuário e abrir uma sessão.
- **RF12:** proteger a página do painel e permitir encerrar a sessão.
- **RF13:** exibir créditos de imagens e fontes.
- **RF14:** adaptar o layout a computador e celular.

## Requisitos não funcionais

- **RNF01:** HTML5, CSS3 e JavaScript sem bibliotecas de front-end.
- **RNF02:** conteúdo em português do Brasil.
- **RNF03:** parte pública funciona sem servidor; autenticação exige PHP 8 e MySQL.
- **RNF04:** senhas gravadas somente como hash; consultas preparadas; saída escapada.
- **RNF05:** acessibilidade: navegação por teclado, foco preso na sacola, textos alternativos, movimento reduzido.
- **RNF06:** conteúdo principal legível sem JavaScript.
- **RNF07:** sem rolagem horizontal entre 320 px e 1440 px.

## Regras de negócio

- **RN01:** preços: Prato Feito R$ 20,00; Frango Grelhado R$ 22,00; Carne de Panela R$ 25,00; Feijoada R$ 28,00.
- **RN02:** subtotal = preço × quantidade; total = soma dos subtotais.
- **RN03:** quantidade zero remove o item.
- **RN04:** e-mail é único no cadastro; senha mínima de 6 caracteres.
- **RN05:** o pedido só é considerado confirmado na conversa com a cozinha; o site não processa pagamento.

## Fora do escopo

Pagamento online, painel administrativo, estoque, cupons, histórico de pedidos na conta e integração com API oficial do WhatsApp.
