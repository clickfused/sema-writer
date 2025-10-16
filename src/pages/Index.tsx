import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Target, FileText, TrendingUp, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-subtle)" }}>
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">SEO Blog Generator</span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
              <Button onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            AI-Powered SEO & AEO
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
              Blog Generator
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create fully optimized, 2000+ word blog posts with perfect SEO structure,
            semantic keywords, and AI-powered content generation in minutes.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              <Sparkles className="mr-2 h-5 w-5" />
              Start Generating
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              View Examples
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Target className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Multi-Keyword Focus</CardTitle>
              <CardDescription>
                Primary, secondary, semantic, and LSI keywords integrated naturally
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Perfect Structure</CardTitle>
              <CardDescription>
                H1, 10+ H2s, 5+ H3s per section for optimal content hierarchy
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>SEO Optimized</CardTitle>
              <CardDescription>
                Meta tags, descriptions, slugs - all optimized for search engines
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>AI Generation</CardTitle>
              <CardDescription>
                2000+ word content generated with advanced AI models
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground font-bold" style={{ background: "var(--gradient-primary)" }}>
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Add Your Keywords</h3>
                <p className="text-muted-foreground">
                  Input primary, secondary, semantic, and LSI keywords for your topic
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground font-bold" style={{ background: "var(--gradient-primary)" }}>
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">AI Generates Meta Tags</h3>
                <p className="text-muted-foreground">
                  Get optimized title (57 chars), description (157 chars), and URL slug
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground font-bold" style={{ background: "var(--gradient-primary)" }}>
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Build Heading Structure</h3>
                <p className="text-muted-foreground">
                  AI suggests H1, H2s, and H3s for perfect content hierarchy
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground font-bold" style={{ background: "var(--gradient-primary)" }}>
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Generate Full Content</h3>
                <p className="text-muted-foreground">
                  AI creates 2000+ word SEO-optimized blog post ready to publish
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Create Amazing Content?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start generating SEO-optimized blog posts in minutes
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            <Sparkles className="mr-2 h-5 w-5" />
            Get Started Free
          </Button>
        </div>
      </section>

      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 SEO Blog Generator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
