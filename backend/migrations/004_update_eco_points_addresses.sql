-- Atualizar endereços dos eco-pontos conforme informado pelo usuário
-- Execute no Supabase SQL Editor

UPDATE eco_pontos SET endereco = 'Rua Manaus, 1524 – Country, Cascavel/PR' WHERE nome = 'Ecoponto Manaus';
UPDATE eco_pontos SET endereco = 'Rua Valmor Frasson, 79 – Brasília, Cascavel/PR', nome = 'Ecoponto Brasília - Unicacoop' WHERE nome = 'Ecoponto Brasília';
UPDATE eco_pontos SET endereco = 'Rua Hibiscos, 153–181 – Brasmadeira, Cascavel/PR' WHERE nome = 'Ecoponto Melissa';
UPDATE eco_pontos SET endereco = 'Rua Aparecida dos Portos – Guarujá, Cascavel/PR' WHERE nome = 'Ecoponto Quebec';
UPDATE eco_pontos SET endereco = 'Cascavel Velho, Cascavel/PR' WHERE nome = 'Ecoponto Cascavel Velho';
UPDATE eco_pontos SET endereco = 'Santa Cruz, Cascavel/PR' WHERE nome = 'Ecoponto Santa Cruz';
