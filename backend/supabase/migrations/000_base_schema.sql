CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    cpf VARCHAR(14) UNIQUE,
    senha TEXT NOT NULL DEFAULT '',
    tipo VARCHAR(30) NOT NULL DEFAULT 'cliente',
    sexo VARCHAR(20),
    idade INTEGER,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    pontos INTEGER NOT NULL DEFAULT 0,
    household_size INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT usuarios_tipo_check CHECK (tipo IN ('cliente', 'funcionario', 'admin', 'administrador')),
    CONSTRAINT usuarios_idade_check CHECK (idade IS NULL OR idade BETWEEN 0 AND 120),
    CONSTRAINT usuarios_household_size_check CHECK (household_size >= 1)
);

CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    codigo_nfc VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'disponivel',
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT tags_status_check CHECK (status IN ('disponivel', 'em_uso', 'indisponivel'))
);

CREATE TABLE IF NOT EXISTS reciclagens (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id),
    funcionario_id INTEGER REFERENCES usuarios(id),
    data_entrega TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'pendente',
    data_confirmacao TIMESTAMPTZ,
    CONSTRAINT reciclagens_status_check CHECK (status IN ('pendente', 'validada', 'rejeitada'))
);

CREATE INDEX IF NOT EXISTS idx_reciclagens_usuario ON reciclagens(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reciclagens_tag ON reciclagens(tag_id);
CREATE INDEX IF NOT EXISTS idx_reciclagens_status ON reciclagens(status);

CREATE TABLE IF NOT EXISTS recompensas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    reciclagem_id INTEGER UNIQUE REFERENCES reciclagens(id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL,
    valor INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'liberada',
    data_liberacao TIMESTAMPTZ,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT recompensas_status_check CHECK (status IN ('liberada', 'resgatada', 'cancelada'))
);

CREATE INDEX IF NOT EXISTS idx_recompensas_usuario ON recompensas(usuario_id);
