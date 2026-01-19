-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roll_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  year INTEGER NOT NULL CHECK (year >= 1 AND year <= 4),
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL CHECK (credits > 0),
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marks table
CREATE TABLE public.marks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  marks_obtained INTEGER NOT NULL CHECK (marks_obtained >= 0),
  max_marks INTEGER NOT NULL DEFAULT 100 CHECK (max_marks > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, course_id)
);

-- Enable RLS on all tables (but allow public access for this demo project)
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (this is a demo project)
CREATE POLICY "Allow public read access" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.departments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.departments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.departments FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.students FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.courses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.courses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.courses FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.marks FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.marks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.marks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.marks FOR DELETE USING (true);