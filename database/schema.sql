
-- =====================================================
-- ONLINE VOTING AND POLLING SYSTEM
-- DATABASE: SQLite
-- =====================================================

PRAGMA foreign_keys = ON;


-- =====================================================
-- 1. USERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    full_name TEXT NOT NULL
        CHECK (length(trim(full_name)) BETWEEN 2 AND 80),

    email TEXT NOT NULL COLLATE NOCASE UNIQUE,

    password_hash TEXT NOT NULL
        CHECK (length(password_hash) > 0),

    neighborhood TEXT NOT NULL DEFAULT '',

    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',

    updates_enabled INTEGER NOT NULL DEFAULT 1
        CHECK (updates_enabled IN (0, 1)),

    role TEXT NOT NULL DEFAULT 'voter'
        CHECK (role IN ('voter', 'admin')),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- Automatically update updated_at when a user record changes.
CREATE TRIGGER IF NOT EXISTS update_users_timestamp
AFTER UPDATE ON users
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE users
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;


-- =====================================================
-- 2. ELECTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS elections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL
        CHECK (length(trim(name)) BETWEEN 1 AND 90),

    category TEXT NOT NULL
        CHECK (
            category IN (
                'Community',
                'Local projects',
                'Education'
            )
        ),

    status TEXT NOT NULL DEFAULT 'upcoming'
        CHECK (status IN ('upcoming', 'open', 'closed')),

    opens_at TEXT,

    closes_at TEXT,

    created_by INTEGER
        REFERENCES users(id) ON DELETE SET NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (
        opens_at IS NULL
        OR closes_at IS NULL
        OR opens_at <= closes_at
    )
);


CREATE INDEX IF NOT EXISTS idx_elections_status_close
ON elections(status, closes_at);


-- =====================================================
-- 3. CANDIDATES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    election_id INTEGER NOT NULL
        REFERENCES elections(id) ON DELETE CASCADE,

    name TEXT NOT NULL
        CHECK (length(trim(name)) > 0),

    description TEXT NOT NULL DEFAULT '',

    sort_order INTEGER NOT NULL DEFAULT 0,

    UNIQUE (id, election_id),

    UNIQUE (election_id, name)
);


-- =====================================================
-- 4. ELECTION VOTES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS election_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    election_id INTEGER NOT NULL
        REFERENCES elections(id) ON DELETE CASCADE,

    candidate_id INTEGER NOT NULL,

    voter_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,

    cast_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Prevent a user from voting twice in the same election.
    UNIQUE (election_id, voter_id),

    -- Ensure the selected candidate belongs to this election.
    FOREIGN KEY (candidate_id, election_id)
        REFERENCES candidates(id, election_id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_election_votes_candidate
ON election_votes(election_id, candidate_id);


-- =====================================================
-- 5. POLLS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS polls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    title TEXT NOT NULL
        CHECK (length(trim(title)) BETWEEN 1 AND 150),

    description TEXT NOT NULL DEFAULT '',

    category TEXT NOT NULL
        CHECK (
            category IN (
                'Community',
                'Local projects',
                'Education'
            )
        ),

    status TEXT NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'closed')),

    opens_at TEXT,

    closes_at TEXT,

    created_by INTEGER
        REFERENCES users(id) ON DELETE SET NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (
        opens_at IS NULL
        OR closes_at IS NULL
        OR opens_at <= closes_at
    )
);


CREATE INDEX IF NOT EXISTS idx_polls_status_close
ON polls(status, closes_at);


-- =====================================================
-- 6. POLL OPTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS poll_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    poll_id INTEGER NOT NULL
        REFERENCES polls(id) ON DELETE CASCADE,

    label TEXT NOT NULL
        CHECK (length(trim(label)) > 0),

    sort_order INTEGER NOT NULL DEFAULT 0,

    UNIQUE (id, poll_id),

    UNIQUE (poll_id, label)
);


-- =====================================================
-- 7. POLL RESPONSES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS poll_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    poll_id INTEGER NOT NULL
        REFERENCES polls(id) ON DELETE CASCADE,

    option_id INTEGER NOT NULL,

    user_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,

    submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Prevent multiple responses from the same user to one poll.
    UNIQUE (poll_id, user_id),

    