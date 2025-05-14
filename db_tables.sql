import { supabase } from '../lib/supabase';

-- 1. users
create table users (
  id uuid primary key default uuid_generate_v4(),
  email text unique,
  role text not null,
  full_name text,
  profile_photo text,
  current_streak int default 0,
  longest_streak int default 0,
  created_at timestamp default now()
);

-- 2. groups
create table groups (
  id uuid primary key default uuid_generate_v4(),
  doctor_id uuid references users(id),
  patient_id uuid references users(id),
  created_at timestamp default now()
);

-- 3. group_members
create table group_members (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references groups(id),
  user_id uuid references users(id),
  role text not null,
  joined_at timestamp default now()
);

-- 4. invitations
create table invitations (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  code text not null unique,
  role text not null,
  inviter_id uuid references users(id),
  group_id uuid references groups(id),
  status text not null default 'pending',
  created_at timestamp default now()
);

-- 5. uploads
create table uploads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  file_url text not null,
  file_type text,
  created_at timestamp default now(),
  status text default 'active'
);

-- 6. tasks
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references groups(id),
  assigned_by uuid references users(id),
  assigned_to uuid references users(id),
  title text,
  description text,
  frequency text,
  due_hour time,
  proof_type text,
  is_active boolean default true,
  start_date date,
  created_at timestamp default now()
);

-- 7. task_submissions
create table task_submissions (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id),
  user_id uuid references users(id),
  proof text,
  upload_id uuid references uploads(id),
  submitted_at timestamp default now(),
  status text
);

-- 8. secrets
create table secrets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  group_id uuid references groups(id),
  content text,
  revealed boolean default false,
  revealed_at timestamp
);

-- 9. group_feed
create table group_feed (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references groups(id),
  user_id uuid references users(id),
  type text,
  content text,
  created_at timestamp default now(),
  parent_id uuid references group_feed(id)
);

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://feoxkgnpbfdxhoilawxf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlb3hrZ25wYmZkeGhvaWxhd3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyOTYxMzQsImV4cCI6MjA2MTg3MjEzNH0.hz-UJTEaY7xQRnrDYaJ_BV49B0_Ce-Qi92qcK_lYztw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


-- RLS Queries

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_feed ENABLE ROW LEVEL SECURITY;

-- USERS
CREATE POLICY "Insert own user row"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Select own user row"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Update own user row"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- GROUPS
CREATE POLICY "Access own groups"
  ON groups FOR SELECT
  USING (
    auth.uid() = doctor_id OR
    auth.uid() = patient_id
  );

CREATE POLICY "Doctors insert groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

-- GROUP_MEMBERS
CREATE POLICY "Select own group membership"
  ON group_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Insert own group membership"
  ON group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- INVITATIONS
CREATE POLICY "Select own invitations"
  ON invitations FOR SELECT
  USING (auth.uid() = inviter_id);

CREATE POLICY "Insert own invitations"
  ON invitations FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Verify invitation code"
  ON invitations FOR SELECT
  USING (status = 'pending');

CREATE POLICY "Update invitation status"
  ON invitations FOR UPDATE
  USING (status = 'pending')
  WITH CHECK (status = 'accepted');

-- UPLOADS
CREATE POLICY "Select own uploads"
  ON uploads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Insert own uploads"
  ON uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- TASKS
CREATE POLICY "Access tasks"
  ON tasks FOR SELECT
  USING (
    auth.uid() = assigned_by OR
    auth.uid() = assigned_to
  );

CREATE POLICY "Insert task by doctor"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = assigned_by);

-- TASK_SUBMISSIONS
CREATE POLICY "Select own task submissions"
  ON task_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Insert own task submissions"
  ON task_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- SECRETS
CREATE POLICY "Select own secrets"
  ON secrets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Insert own secrets"
  ON secrets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- GROUP_FEED
CREATE POLICY "Access group feed if member"
  ON group_feed FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_feed.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Insert own group feed posts"
  ON group_feed FOR INSERT
  WITH CHECK (auth.uid() = user_id);

  ALTER TABLE tasks
ADD COLUMN icon text;

ALTER TABLE tasks
ADD COLUMN status text DEFAULT 'pending';

ALTER TABLE users
ADD COLUMN streak_category text DEFAULT 'active';

create table task_templates (
  id uuid primary key default uuid_generate_v4(),
  doctor_id uuid references users(id),
  group_id uuid references groups(id),
  title text not null,
  description text,
  icon text,
  frequency text,
  due_hour time,
  proof_type text,
  created_at timestamp with time zone default now()
);

alter table tasks add column template_id uuid references task_templates(id);
