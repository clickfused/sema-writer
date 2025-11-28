import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, FileText, TrendingUp, CheckCircle, Zap, Clock, Shield, Award, Users, BarChart3, Brain, Lightbulb, Rocket, Star, Quote, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import clickFusedLogo from "@/assets/click-fused-logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-subtle)" }}>
      <head>
        <title>Best Free AI Writer, Content Generator & Writing Assistant | Click Fused</title>
        <meta name="description" content="Discover the best free AI writer and content generator. Create SEO-optimized blog posts with our AI writing assistant. Free AI copywriter for content creation and blog generation." />
        <meta name="keywords" content="best free AI writer, content generator, writing assistant, AI writing tool, blog generator, SEO content writer, free AI copywriter, content creation software, automated writing assistant" />
      </head>

      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={clickFusedLogo} alt="Best Free AI Writer - Click Fused Logo" className="h-12 w-auto object-contain" />
              <div>
                <div className="text-xl font-bold">Best Free AI Writer by Click Fused</div>
                <div className="text-xs text-muted-foreground">Content Generator & Writing Assistant</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
              <Button onClick={() => navigate("/auth")} className="shadow-lg">
                Start Free AI Writer
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 animate-fade-in">
            ✨ Best Free AI Writer, Content Generator & Writing Assistant
          </div>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
            Best Free AI Writer for
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
              Content That Ranks & Converts
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover the best free AI writer and content generator for creating SEO-optimized blog posts. Our AI writing assistant helps you generate 1500+ word articles designed for Google, ChatGPT, Perplexity, and Gemini—all in minutes. This free AI copywriter is perfect for bloggers, content marketers, agencies, and businesses who need automated content creation with proven results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8 py-6 shadow-2xl hover:scale-105 transition-transform">
              <Rocket className="mr-2 h-6 w-6" />
              Start Free AI Writer Now
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="text-lg px-8 py-6">
              Watch AI Content Generator Demo
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <Card className="border-2 text-center">
              <CardHeader>
                <div className="text-4xl font-black text-primary">5M+</div>
                <div className="text-sm text-muted-foreground">Words Generated Monthly</div>
              </CardHeader>
            </Card>
            <Card className="border-2 text-center">
              <CardHeader>
                <div className="text-4xl font-black text-primary">4.9/5</div>
                <div className="text-sm text-muted-foreground">User Satisfaction Rating</div>
              </CardHeader>
            </Card>
            <Card className="border-2 text-center">
              <CardHeader>
                <div className="text-4xl font-black text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Hours Saved in Content Creation</div>
              </CardHeader>
            </Card>
          </div>
          <div className="flex items-center justify-center gap-8 mt-8 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              No Credit Card Required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              1500+ Words Per Article
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Multi-Engine Optimized
            </div>
          </div>
        </div>
      </section>

      {/* Features & Benefits */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Why This is the Best Free AI Writer & Content Generator</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our AI writing assistant combines cutting-edge technology with proven SEO strategies to deliver content that ranks on search engines and resonates with AI assistants. This free AI writer is built for content creators, marketers, and businesses who need a reliable content generation tool with automated writing capabilities and measurable results.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-2 hover:border-primary transition-colors hover:shadow-xl">
            <CardHeader>
              <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)" }}>
                <Brain className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Multi-Engine Optimization</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Ai Writer Click Fused optimizes your content for SEO (Google/Bing), AEO (Perplexity), GEO (ChatGPT/Gemini), and LLMO (AI comprehension). Unlike traditional tools that focus only on search engines, we ensure your content performs across all modern discovery platforms—maximizing visibility, traffic, and authority in the AI-driven web.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors hover:shadow-xl">
            <CardHeader>
              <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)" }}>
                <Target className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Intelligent Keyword Integration</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Ai Writer Click Fused naturally weaves primary, secondary, semantic, LSI, and NLP keywords throughout your content with surgical precision. Our AI maintains optimal keyword density (1-1.8%) while ensuring readability and natural flow. Every paragraph, heading, and FAQ is strategically crafted to target multiple search intents without keyword stuffing—delivering content that ranks and engages.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors hover:shadow-xl">
            <CardHeader>
              <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)" }}>
                <Clock className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Lightning-Fast Generation</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Ai Writer Click Fused generates comprehensive 1500+ word blog posts in under 5 minutes—complete with SEO-optimized meta tags, structured headings, engaging introductions, detailed paragraphs, and conversion-focused FAQs. What used to take hours of research and writing now happens in minutes, freeing you to focus on strategy, promotion, and scaling your content empire.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors hover:shadow-xl">
            <CardHeader>
              <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)" }}>
                <FileText className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Perfect Content Structure</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Ai Writer Click Fused creates perfectly structured content with H1 titles, 10+ H2 sections, and 5+ H3 subsections per topic. Every heading includes three query variations optimized for different engines: core SEO questions for Google/Bing, conversational phrasing for ChatGPT/Gemini, and long-tail variations for Perplexity/Claude. This multi-format approach ensures maximum discoverability across all platforms.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors hover:shadow-xl">
            <CardHeader>
              <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)" }}>
                <Award className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Framework-Driven Quality</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Ai Writer Click Fused offers multiple content frameworks: SAGE (Search + Answer + Generative + Experience), READ (Rhythm + Ease + Active voice + Digestibility), CRAFT, HUMAIZE (Humanize + Optimize + Contextualize + Empathize), and HYBRID combinations. Choose the framework that matches your brand voice and audience—ensuring every piece of content aligns with your strategic goals while maintaining premium quality.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors hover:shadow-xl">
            <CardHeader>
              <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)" }}>
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Real-Time Optimization</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Ai Writer Click Fused provides live keyword density tracking, SEO score monitoring, and content quality analysis as you generate content. See exactly how your secondary, semantic, and LSI keywords are distributed. Get instant feedback on readability, structure, and optimization—allowing you to fine-tune content before publication and ensure every article meets premium standards.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30 rounded-3xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Why This AI Writing Tool Outperforms Others</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our free content generator outperforms traditional AI writing tools with multi-engine optimization, framework flexibility, and smart keyword integration. Discover why content creators, digital agencies, and businesses choose this AI writing assistant for their content creation and blog generation needs.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-card rounded-2xl shadow-2xl overflow-hidden border-2">
            <div className="grid grid-cols-4 gap-4 p-6 bg-primary/5 border-b-2">
              <div className="font-bold text-lg">Feature</div>
              <div className="font-bold text-lg text-center">Ai Writer Click Fused</div>
              <div className="font-bold text-lg text-center text-muted-foreground">Generic AI Tools</div>
              <div className="font-bold text-lg text-center text-muted-foreground">Manual Writing</div>
            </div>

            <div className="divide-y">
              {[
                { feature: "Multi-Engine Optimization (SEO/AEO/GEO/LLMO)", clickFused: true, generic: false, manual: false },
                { feature: "1500+ Word Generation in Minutes", clickFused: true, generic: "Partial", manual: false },
                { feature: "Framework Selection (SAGE/READ/CRAFT)", clickFused: true, generic: false, manual: false },
                { feature: "Natural Keyword Integration (1-1.8%)", clickFused: true, generic: "Partial", manual: true },
                { feature: "Real-Time Density Tracking", clickFused: true, generic: false, manual: false },
                { feature: "Multi-Query Heading Variations", clickFused: true, generic: false, manual: false },
                { feature: "Brand Name Integration Formula", clickFused: true, generic: false, manual: true },
                { feature: "Location-Based Optimization", clickFused: true, generic: false, manual: true },
                { feature: "Perfect Content Structure (H1/H2/H3)", clickFused: true, generic: true, manual: true },
                { feature: "Time Investment Per Article", clickFused: "5 minutes", generic: "15-30 min", manual: "4-8 hours" },
              ].map((row, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-4 p-6 hover:bg-muted/20 transition-colors">
                  <div className="font-medium">{row.feature}</div>
                  <div className="text-center">
                    {typeof row.clickFused === 'boolean' ? (
                      row.clickFused ? (
                        <CheckCircle className="h-6 w-6 text-primary mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )
                    ) : (
                      <span className="font-semibold text-primary">{row.clickFused}</span>
                    )}
                  </div>
                  <div className="text-center text-muted-foreground">
                    {typeof row.generic === 'boolean' ? (
                      row.generic ? (
                        <CheckCircle className="h-6 w-6 mx-auto opacity-30" />
                      ) : (
                        <span>—</span>
                      )
                    ) : (
                      <span>{row.generic}</span>
                    )}
                  </div>
                  <div className="text-center text-muted-foreground">
                    {typeof row.manual === 'boolean' ? (
                      row.manual ? (
                        <CheckCircle className="h-6 w-6 mx-auto opacity-30" />
                      ) : (
                        <span>—</span>
                      )
                    ) : (
                      <span>{row.manual}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8 py-6 shadow-xl">
              <Star className="mr-2 h-5 w-5" />
              Try Best Free AI Writer - Start Now
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">See Ai Writer Click Fused In Action</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the power of Ai Writer Click Fused with our interactive workflow demo. Watch how our AI transforms simple keywords into comprehensive, SEO-optimized blog posts in just four steps.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-2 hover:shadow-2xl transition-all">
              <CardHeader>
                <div className="text-4xl font-black text-primary mb-2">Step 1</div>
                <CardTitle className="text-2xl">Input Your Keywords</CardTitle>
                <CardContent className="p-0 mt-4 space-y-3">
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground mb-1">Primary Keyword</div>
                    <div className="font-semibold">best ai writer assistant</div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground mb-1">Secondary Keywords</div>
                    <div className="font-semibold text-sm">AI content writer, writing assistant tool, automated writing</div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground mb-1">Semantic & LSI Keywords</div>
                    <div className="font-semibold text-sm">content generation, AI writing software, blog creation, SEO optimization</div>
                  </div>
                </CardContent>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-2 hover:shadow-2xl transition-all">
              <CardHeader>
                <div className="text-4xl font-black text-primary mb-2">Step 2</div>
                <CardTitle className="text-2xl">Generate Meta Tags</CardTitle>
                <CardContent className="p-0 mt-4 space-y-3">
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground mb-1">Meta Title (54 chars)</div>
                    <div className="font-semibold text-sm">Best AI Writer Assistant | Click Fused - Free Tool</div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground mb-1">Meta Description (153 chars)</div>
                    <div className="font-semibold text-sm">Discover the best AI writer assistant by Click Fused. Generate SEO-optimized content in minutes with our free AI writing tool and content generator.</div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground mb-1">URL Slug</div>
                    <div className="font-semibold text-sm">best-ai-writer-assistant</div>
                  </div>
                </CardContent>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-2 hover:shadow-2xl transition-all">
              <CardHeader>
                <div className="text-4xl font-black text-primary mb-2">Step 3</div>
                <CardTitle className="text-2xl">Build Heading Structure</CardTitle>
                <CardContent className="p-0 mt-4 space-y-2">
                  <div className="bg-card p-3 rounded-lg border">
                    <div className="font-bold text-primary">H1:</div>
                    <div className="text-sm">Best AI Writer Assistant for Content Creation</div>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <div className="font-bold text-primary">H2:</div>
                    <div className="text-sm">What Makes an AI Writer Assistant Effective?</div>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <div className="font-bold text-primary">H3:</div>
                    <div className="text-sm">Advanced Content Generation Capabilities</div>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <div className="font-bold text-primary">H3:</div>
                    <div className="text-sm">SEO Optimization and Keyword Integration</div>
                  </div>
                  <div className="text-sm text-muted-foreground text-center mt-2">+ 8 more H2s & 40+ H3s</div>
                </CardContent>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-2 hover:shadow-2xl transition-all">
              <CardHeader>
                <div className="text-4xl font-black text-primary mb-2">Step 4</div>
                <CardTitle className="text-2xl">Generate Full Content</CardTitle>
                <CardContent className="p-0 mt-4 space-y-3">
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground mb-2">AI-Generated Paragraph Example:</div>
                    <div className="text-sm leading-relaxed">
                      <span className="font-bold text-primary">Click Fused</span> delivers the <span className="font-semibold">most powerful and intelligent</span> AI writer assistant, transforming how content creators produce SEO-optimized articles. This advanced writing assistant tool leverages cutting-edge AI technology to generate comprehensive blog posts with natural keyword integration, perfect content structure, and multi-engine optimization...
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-primary/10 p-3 rounded-lg">
                    <div className="text-sm font-semibold">Word Count: 1,652</div>
                    <div className="text-sm font-semibold">SEO Score: 96/100</div>
                  </div>
                  <div className="flex items-center justify-between bg-primary/10 p-3 rounded-lg">
                    <div className="text-sm font-semibold">Keyword Density: 1.5%</div>
                    <div className="text-sm font-semibold">Ready to Publish ✓</div>
                  </div>
                </CardContent>
              </CardHeader>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8 py-6 shadow-xl">
              <Lightbulb className="mr-2 h-5 w-5" />
              Try The Full Demo - Free Access
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works - Detailed */}
      <section className="container mx-auto px-4 py-20 bg-muted/30 rounded-3xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How Ai Writer Click Fused Works</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ai Writer Click Fused uses a proven four-step workflow that transforms your content ideas into publish-ready blog posts. Our AI-powered system handles the heavy lifting while you maintain complete creative control.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-12">
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-primary-foreground font-black text-2xl shadow-xl" style={{ background: "var(--gradient-primary)" }}>
              1
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold mb-4">Add Your Strategic Keywords</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Ai Writer Click Fused starts with your keyword research. Input your primary keyword (the main topic), secondary keywords (supporting themes), semantic keywords (related concepts), and LSI keywords (latent semantic indexing terms). Our intelligent system understands the relationships between these keywords and plans content that naturally integrates them without stuffing or awkward phrasing.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The AI analyzes search intent across multiple engines—understanding how Google users search differently than ChatGPT users, and how Perplexity handles long-tail queries. This multi-dimensional keyword analysis ensures your content resonates with both traditional search engines and modern AI assistants, maximizing your organic reach and authority positioning.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-primary-foreground font-black text-2xl shadow-xl" style={{ background: "var(--gradient-primary)" }}>
              2
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold mb-4">AI Generates Optimized Meta Tags</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Ai Writer Click Fused automatically creates SEO-optimized meta titles (maximum 57 characters), compelling meta descriptions (maximum 157 characters), and clean URL slugs that follow best practices. These aren't generic templates—our AI crafts unique meta tags that incorporate your primary keyword, include power words that increase click-through rates, and create emotional hooks that stand out in search results.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The AI understands modern search behavior and creates meta tags optimized for featured snippets, knowledge panels, and AI-generated summaries. Your content gets maximum visibility across all platforms—from Google's search results to ChatGPT's recommendations to Perplexity's answers.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-primary-foreground font-black text-2xl shadow-xl" style={{ background: "var(--gradient-primary)" }}>
              3
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold mb-4">Build Perfect Content Structure</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Ai Writer Click Fused creates a comprehensive heading hierarchy with one powerful H1 title, 10+ strategically placed H2 sections, and 5+ H3 subsections under each H2. This structure isn't random—it follows proven content architecture patterns that search engines and AI assistants prefer. Each heading includes three query variations: a core SEO question optimized for Google/Bing, a conversational variation styled for ChatGPT/Gemini, and a long-tail variation designed for Perplexity/Claude.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                This multi-format heading approach ensures your content captures traffic from multiple search intents and discovery channels. Users searching different ways all find your content—whether they ask Google a direct question, have a conversation with ChatGPT, or explore topics through Perplexity's research interface.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-primary-foreground font-black text-2xl shadow-xl" style={{ background: "var(--gradient-primary)" }}>
              4
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold mb-4">Generate Premium Content</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Ai Writer Click Fused generates 1500+ words of high-quality, publish-ready content using your selected framework (SAGE, READ, CRAFT, HUMAIZE, or HYBRID). Every paragraph follows our proven formula: brand name + 2-3 power words + naturally integrated keywords + comprehensive answer. This formula ensures consistent brand presence, emotional engagement, keyword optimization, and valuable information—all in every single paragraph.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The AI maintains strict keyword density control (1-1.8% for secondary, semantic, and LSI keywords combined), ensures natural language flow, and creates content that humans want to read and share. You get real-time feedback on keyword distribution, SEO score, content quality, and optimization metrics—allowing you to publish with confidence knowing your content meets premium standards for both search engines and human readers.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8 py-6 shadow-xl">
            <Rocket className="mr-2 h-6 w-6" />
            Start Free AI Content Generator Now
          </Button>
          <p className="text-sm text-muted-foreground mt-4">No credit card required • Best free AI writer • Cancel anytime</p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Trusted by Content Creators Using Our AI Writer</h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of bloggers, marketers, and businesses using the best free AI writing assistant for content creation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <Card className="border-2 hover:shadow-xl transition-all">
            <CardHeader>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <Quote className="h-8 w-8 text-primary/30 mb-4" />
              <CardDescription className="text-base leading-relaxed text-foreground">
                "I almost couldn't believe it was real! The content quality is exceptional. I shared the results with colleagues who couldn't believe it was AI-generated. Ai Writer Click Fused is worth every penny!"
              </CardDescription>
              <div className="mt-4 pt-4 border-t">
                <div className="font-semibold">Sarah Mitchell</div>
                <div className="text-sm text-muted-foreground">Content Marketing Manager</div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-xl transition-all">
            <CardHeader>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <Quote className="h-8 w-8 text-primary/30 mb-4" />
              <CardDescription className="text-base leading-relaxed text-foreground">
                "Ai Writer Click Fused has been an absolute game-changer for our agency. It helps us generate professional, accurate, and SEO-optimized content at scale. The multi-engine optimization is brilliant!"
              </CardDescription>
              <div className="mt-4 pt-4 border-t">
                <div className="font-semibold">Peter Kumar</div>
                <div className="text-sm text-muted-foreground">Digital Marketing Agency Owner</div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-xl transition-all">
            <CardHeader>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <Quote className="h-8 w-8 text-primary/30 mb-4" />
              <CardDescription className="text-base leading-relaxed text-foreground">
                "I've tried other AI writing tools, but none compare to Click Fused's speed, accuracy, and depth. The keyword density tracking and framework options make it the best AI writing tool available!"
              </CardDescription>
              <div className="mt-4 pt-4 border-t">
                <div className="font-semibold">Abdi Ahmed</div>
                <div className="text-sm text-muted-foreground">Freelance Content Writer</div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30 rounded-3xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Strikingly Powerful, Yet Free Forever</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            All features completely free—pay only when you need extra capacity. No credit card required to start.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-4 border-primary shadow-2xl">
            <CardHeader className="text-center pb-8">
              <div className="inline-block px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-4">
                FREE FOREVER
              </div>
              <CardTitle className="text-4xl mb-4">Full Access Plan</CardTitle>
              <div className="mb-6">
                <span className="text-6xl font-black text-primary">$0</span>
                <span className="text-2xl text-muted-foreground">/forever</span>
              </div>
              <CardDescription className="text-lg max-w-2xl mx-auto leading-relaxed">
                Get unlimited access to all features, frameworks, and optimization tools. Optionally upgrade capacity with pay-as-you-go pricing when you need it.
              </CardDescription>
              <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-12 py-6 mt-6 shadow-xl">
                <Rocket className="mr-2 h-6 w-6" />
                Start Creating Free - No Card Required
              </Button>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-4 max-w-3xl mx-auto">
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-base">Unlimited Blog Generation</div>
                    <div className="text-sm text-muted-foreground">Create as many articles as you need</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-base">1500+ Words Per Article</div>
                    <div className="text-sm text-muted-foreground">Comprehensive long-form content</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-base">All Content Frameworks</div>
                    <div className="text-sm text-muted-foreground">SAGE, READ, CRAFT, HUMAIZE, HYBRID</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-base">Multi-Engine Optimization</div>
                    <div className="text-sm text-muted-foreground">SEO, AEO, GEO, LLMO optimization</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-base">Keyword Density Tracking</div>
                    <div className="text-sm text-muted-foreground">Real-time optimization monitoring</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-base">WordPress Publishing</div>
                    <div className="text-sm text-muted-foreground">Direct publishing integration</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-base">Perfect Content Structure</div>
                    <div className="text-sm text-muted-foreground">H1/H2/H3 hierarchy with query variations</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-base">SEO Meta Tags Generation</div>
                    <div className="text-sm text-muted-foreground">Optimized titles, descriptions, slugs</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-base">FAQ Content Generation</div>
                    <div className="text-sm text-muted-foreground">Engaging Q&A sections</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-base">Brand Voice Integration</div>
                    <div className="text-sm text-muted-foreground">Natural brand name placement</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-base">Rich Text Editor</div>
                    <div className="text-sm text-muted-foreground">WYSIWYG content editing</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-base">Auto-Save Functionality</div>
                    <div className="text-sm text-muted-foreground">Never lose your work</div>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t">
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold mb-2">Optional: Pay-As-You-Go Upgrades</h4>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Need extra capacity or advanced features? Pay only for what you use, when you need it.
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  <div className="text-center p-4 bg-card rounded-lg border-2">
                    <div className="text-2xl font-bold text-primary mb-1">$0.01</div>
                    <div className="text-sm text-muted-foreground">per 1,000 words generated</div>
                  </div>
                  <div className="text-center p-4 bg-card rounded-lg border-2">
                    <div className="text-2xl font-bold text-primary mb-1">$0.05</div>
                    <div className="text-sm text-muted-foreground">per API request (advanced)</div>
                  </div>
                  <div className="text-center p-4 bg-card rounded-lg border-2">
                    <div className="text-2xl font-bold text-primary mb-1">$5</div>
                    <div className="text-sm text-muted-foreground">per team member/month (optional)</div>
                  </div>
                </div>
                <div className="text-center mt-6">
                  <p className="text-sm text-muted-foreground">
                    💡 Most users stay on the free plan forever. Upgrade pricing only applies if you choose to scale beyond free limits.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">Free updates, new features, and unlimited content generation—forever</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 via-transparent to-primary/5 rounded-3xl p-12 border-2 shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Content Strategy?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Ai Writer Click Fused empowers you to create professional, SEO-optimized blog posts that rank on Google, get cited by ChatGPT, appear in Perplexity answers, and drive real business results. Start free today—no credit card required, no hidden fees, no commitments.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="text-xl px-12 py-8 shadow-2xl hover:scale-105 transition-transform">
            <Sparkles className="mr-3 h-7 w-7" />
            Start Using Best Free AI Writer Now
          </Button>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Best Free Content Generator
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Join 5,000+ AI Writing Users
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Proven SEO Content Results
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16 bg-card/50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={clickFusedLogo} alt="Best Free AI Writer & Content Generator Logo" className="h-10 w-auto object-contain" />
              <div>
                <div className="font-bold">Best Free AI Writer by Click Fused</div>
                <div className="text-xs text-muted-foreground">AI Content Generator & Writing Assistant</div>
              </div>
            </div>
            <div className="text-center text-muted-foreground">
              <p>&copy; 2025 Click Fused. All rights reserved.</p>
              <p className="text-sm mt-1">Best free AI writer for SEO content creation and automated blog generation</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
