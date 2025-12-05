-- Create frameworks table
CREATE TABLE public.frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  formula text,
  system_prompt text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.frameworks ENABLE ROW LEVEL SECURITY;

-- Everyone can view active frameworks
CREATE POLICY "Anyone can view active frameworks"
ON public.frameworks
FOR SELECT
USING (is_active = true);

-- Only admins can manage frameworks
CREATE POLICY "Admins can insert frameworks"
ON public.frameworks
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update frameworks"
ON public.frameworks
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete frameworks"
ON public.frameworks
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all frameworks (including inactive)
CREATE POLICY "Admins can view all frameworks"
ON public.frameworks
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_frameworks_updated_at
BEFORE UPDATE ON public.frameworks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default frameworks
INSERT INTO public.frameworks (name, description, formula, system_prompt) VALUES
('SAGE', 'Structure + Authority + Guidance + Engagement', '(Structure × 0.3) + (Authority × 0.25) + (Guidance × 0.25) + (Engagement × 0.2)', 'Write content that is well-structured with clear sections, demonstrates expertise and authority, provides actionable guidance, and engages readers with compelling narratives.'),
('READ', 'Rhythm + Engagement + Accessibility + Direction', '(Rhythm × 0.25) + (Engagement × 0.3) + (Accessibility × 0.25) + (Direction × 0.2)', 'Create content with natural reading rhythm, engaging hooks, accessible language for all levels, and clear directional flow guiding readers through the content.'),
('CRAFT', 'Clear + Relevant + Accurate + Factual + Terse', '(Clarity × 0.25) + (Relevance × 0.25) + (Accuracy × 0.2) + (Factual × 0.2) + (Terseness × 0.1)', 'Produce clear, concise content that is highly relevant to the topic, factually accurate, and avoids unnecessary verbosity while maintaining completeness.'),
('HUMAIZE', 'Human-like + Natural + Contextual', '(Human-tone × 0.35) + (Natural-flow × 0.35) + (Context × 0.3)', 'Write in a conversational, human-like tone with natural sentence variations, contractions, and contextual awareness that bypasses AI detection.'),
('HYBRID', 'All Frameworks Combined - Recommended', '(SAGE × 0.3) + (READ × 0.25) + (CRAFT × 0.25) + (HUMAIZE × 0.2)', 'Combine all framework strengths: structured authority with engaging rhythm, clear accurate content written in natural human tone. Optimized for SEO+AEO+GEO+LLMO.');