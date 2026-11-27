CREATE TABLE IF NOT EXISTS users (
  subject TEXT PRIMARY KEY,
  email TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS saved_calculations (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL REFERENCES users(subject),
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 100),
  totalRise REAL NOT NULL,
  totalRun REAL NOT NULL,
  targetStepRise REAL NOT NULL,
  targetStepRun REAL NOT NULL,
  stringerWidth REAL NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS saved_calculations_by_owner
  ON saved_calculations (owner, createdAt DESC, id DESC);
