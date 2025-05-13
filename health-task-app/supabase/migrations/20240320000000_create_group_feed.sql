-- Create group_feed table
CREATE TABLE IF NOT EXISTS group_feed (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('task_completion', 'task_miss', 'comment', 'reaction')),
    content TEXT,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES group_feed(id) ON DELETE CASCADE,
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('image', 'video')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_group_feed_group_id ON group_feed(group_id);
CREATE INDEX IF NOT EXISTS idx_group_feed_user_id ON group_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_group_feed_parent_id ON group_feed(parent_id);
CREATE INDEX IF NOT EXISTS idx_group_feed_created_at ON group_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_feed_type ON group_feed(type);

-- Enable Row Level Security
ALTER TABLE group_feed ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Group members can view feed items"
    ON group_feed FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM group_members
            WHERE group_members.group_id = group_feed.group_id
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can insert feed items"
    ON group_feed FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM group_members
            WHERE group_members.group_id = group_feed.group_id
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own feed items"
    ON group_feed FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own feed items"
    ON group_feed FOR DELETE
    USING (user_id = auth.uid());

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON group_feed
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at(); 

-- Create storage bucket for group feed media
INSERT INTO storage.buckets (id, name, public)
VALUES ('group_feed_media', 'group_feed_media', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for media access
CREATE POLICY "Group members can access media"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'group_feed_media' AND
        EXISTS (
            SELECT 1 FROM group_feed
            JOIN group_members ON group_members.group_id = group_feed.group_id
            WHERE group_feed.media_url = storage.objects.name
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can upload media"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'group_feed_media' AND
        EXISTS (
            SELECT 1 FROM group_members
            WHERE group_members.group_id::text = SPLIT_PART(name, '/', 1)
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own media"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'group_feed_media' AND
        EXISTS (
            SELECT 1 FROM group_feed
            WHERE group_feed.media_url = storage.objects.name
            AND group_feed.user_id = auth.uid()
        )
    ); 