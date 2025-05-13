-- Create tasks table
CREATE TABLE tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    frequency TEXT NOT NULL,
    due_hour TIME NOT NULL,
    proof_type TEXT NOT NULL,
    assigned_by UUID REFERENCES auth.users(id),
    assigned_to UUID REFERENCES auth.users(id),
    group_id UUID REFERENCES groups(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create task_submissions table
CREATE TABLE task_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    proof_text TEXT,
    proof_image_url TEXT,
    feeling TEXT,
    side_effects TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can view tasks assigned to them or their group"
    ON tasks FOR SELECT
    USING (
        auth.uid() = assigned_to OR
        auth.uid() IN (
            SELECT user_id FROM group_members 
            WHERE group_id = tasks.group_id
        )
    );

CREATE POLICY "Doctors can create tasks for their patients"
    ON tasks FOR INSERT
    WITH CHECK (
        auth.uid() = assigned_by AND
        EXISTS (
            SELECT 1 FROM users
            WHERE id = assigned_to AND role = 'patient'
        )
    );

CREATE POLICY "Users can create tasks for themselves"
    ON tasks FOR INSERT
    WITH CHECK (
        auth.uid() = assigned_to
    );

-- Create policies for task_submissions
CREATE POLICY "Users can view their own submissions"
    ON task_submissions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own submissions"
    ON task_submissions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions"
    ON task_submissions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_submissions_updated_at
    BEFORE UPDATE ON task_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 