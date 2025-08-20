-- FASE 1: Correzioni Database

-- Aggiungi 'comment_report' all'enum notification_type
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('like', 'comment', 'follow', 'mention', 'comment_report');
    ELSE
        -- Aggiungi comment_report se non esiste già
        BEGIN
            ALTER TYPE notification_type ADD VALUE 'comment_report';
        EXCEPTION
            WHEN duplicate_object THEN NULL; -- Ignora se esiste già
        END;
    END IF;
END $$;

-- Rimuovi il constraint univoco problematico su post_views per permettere visualizzazioni anonime
ALTER TABLE post_views DROP CONSTRAINT IF EXISTS post_views_post_id_user_id_key;

-- Crea un nuovo constraint che permette più visualizzazioni per utenti anonimi (user_id NULL)
CREATE UNIQUE INDEX IF NOT EXISTS post_views_user_unique 
ON post_views (post_id, user_id) 
WHERE user_id IS NOT NULL;

-- Aggiungi indici per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments (post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments (author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments (parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_user ON comment_likes (comment_id, user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views (post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_user ON post_likes (post_id, user_id);