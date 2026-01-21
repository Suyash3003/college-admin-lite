-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create fees table
CREATE TABLE public.fees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    total_fees integer NOT NULL DEFAULT 0,
    fees_paid integer NOT NULL DEFAULT 0,
    fees_due integer GENERATED ALWAYS AS (total_fees - fees_paid) STORED,
    semester integer NOT NULL DEFAULT 1,
    academic_year text NOT NULL DEFAULT '2024-25',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on fees
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

-- Fees RLS: Admins have full access, students can only view their own fees
CREATE POLICY "Admins can manage all fees"
ON public.fees FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students can view own fees"
ON public.fees FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.students 
    WHERE students.id = fees.student_id 
    AND students.user_id = auth.uid()
  )
);

-- Create trigger for fees updated_at
CREATE TRIGGER update_fees_updated_at
BEFORE UPDATE ON public.fees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Drop existing overly permissive policies on students
DROP POLICY IF EXISTS "Allow public read access" ON public.students;
DROP POLICY IF EXISTS "Allow public insert access" ON public.students;
DROP POLICY IF EXISTS "Allow public update access" ON public.students;
DROP POLICY IF EXISTS "Allow public delete access" ON public.students;

-- Students RLS: Admins have full access, students can only view their own data
CREATE POLICY "Admins can manage all students"
ON public.students FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students can view own data"
ON public.students FOR SELECT
USING (auth.uid() = user_id);

-- Drop existing overly permissive policies on marks
DROP POLICY IF EXISTS "Allow public read access" ON public.marks;
DROP POLICY IF EXISTS "Allow public insert access" ON public.marks;
DROP POLICY IF EXISTS "Allow public update access" ON public.marks;
DROP POLICY IF EXISTS "Allow public delete access" ON public.marks;

-- Marks RLS: Admins have full access, students can only view their own marks
CREATE POLICY "Admins can manage all marks"
ON public.marks FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students can view own marks"
ON public.marks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.students 
    WHERE students.id = marks.student_id 
    AND students.user_id = auth.uid()
  )
);

-- Drop existing overly permissive policies on departments
DROP POLICY IF EXISTS "Allow public read access" ON public.departments;
DROP POLICY IF EXISTS "Allow public insert access" ON public.departments;
DROP POLICY IF EXISTS "Allow public update access" ON public.departments;
DROP POLICY IF EXISTS "Allow public delete access" ON public.departments;

-- Departments: Admins can manage, everyone authenticated can read
CREATE POLICY "Admins can manage departments"
ON public.departments FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view departments"
ON public.departments FOR SELECT
TO authenticated
USING (true);

-- Drop existing overly permissive policies on courses
DROP POLICY IF EXISTS "Allow public read access" ON public.courses;
DROP POLICY IF EXISTS "Allow public insert access" ON public.courses;
DROP POLICY IF EXISTS "Allow public update access" ON public.courses;
DROP POLICY IF EXISTS "Allow public delete access" ON public.courses;

-- Courses: Admins can manage, everyone authenticated can read
CREATE POLICY "Admins can manage courses"
ON public.courses FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view courses"
ON public.courses FOR SELECT
TO authenticated
USING (true);