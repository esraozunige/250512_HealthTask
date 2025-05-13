-- Add streaks and status fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'NeedsHelp')),
ADD COLUMN IF NOT EXISTS last_streak_reset TIMESTAMP WITH TIME ZONE;

-- Create function to update streaks
CREATE OR REPLACE FUNCTION update_user_streaks()
RETURNS TRIGGER AS $$
BEGIN
    -- If task is completed, increment current_streak
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE users
        SET current_streak = current_streak + 1,
            longest_streak = GREATEST(longest_streak, current_streak + 1)
        WHERE id = NEW.user_id;
    -- If task is missed, reset current_streak and check for NeedsHelp status
    ELSIF NEW.status = 'failed' AND OLD.status != 'failed' THEN
        UPDATE users
        SET current_streak = 0,
            last_streak_reset = NOW(),
            status = CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM task_submissions ts
                    WHERE ts.user_id = users.id
                    AND ts.status = 'failed'
                    AND ts.created_at > NOW() - INTERVAL '14 days'
                    HAVING COUNT(*) >= 2
                ) THEN 'NeedsHelp'
                ELSE 'Active'
            END
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for streak updates
CREATE TRIGGER update_streaks_on_task_submission
    AFTER UPDATE ON task_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_streaks();

-- Create function to check and update NeedsHelp status
CREATE OR REPLACE FUNCTION check_needs_help_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user has 2 or more failed tasks in the last 14 days
    IF EXISTS (
        SELECT 1
        FROM task_submissions ts
        WHERE ts.user_id = NEW.id
        AND ts.status = 'failed'
        AND ts.created_at > NOW() - INTERVAL '14 days'
        HAVING COUNT(*) >= 2
    ) THEN
        NEW.status := 'NeedsHelp';
    ELSE
        NEW.status := 'Active';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for NeedsHelp status updates
CREATE TRIGGER update_needs_help_status
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION check_needs_help_status(); 