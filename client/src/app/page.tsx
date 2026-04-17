import Image from "next/image";
import { ArrowRight, BookOpen, Shield, BarChart3, Globe } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background/80 backdrop-blur-md font-sans selection:bg-brand-500/20">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white font-bold text-xl shadow-lg shadow-brand-500/20">
              S
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">StrapLearn</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-brand-600">Solutions</a>
            <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-brand-600">Features</a>
            <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-brand-600">Pricing</a>
            <a href="/login" className="text-sm font-semibold text-foreground hover:text-brand-600 transition-colors">Log In</a>
            <a 
              href="/register" 
              className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-600 hover:shadow-brand-500/30 active:scale-95"
            >
              Get Started
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-32">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 lg:px-8">
          <div className="mx-auto max-w-7xl py-24 sm:py-32">
            <div className="text-center">
              <div className="mb-8 flex justify-center">
                <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-muted-foreground ring-1 ring-border hover:ring-brand-500/30 transition-all">
                  Introducing Enterprise Subscriptions.{' '}
                  <a href="#" className="font-semibold text-brand-600">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Read more <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                The Future of <span className="text-brand-500">Corporate Training</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                A multi-tenant Learning Management System designed for modern enterprises. 
                Deliver, track, and optimize training programs with ease and precision.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a
                  href="/register"
                  className="rounded-2xl bg-brand-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-brand-500/20 transition-all hover:bg-brand-600 hover:translate-y-[-2px] active:scale-95"
                >
                  Start Building — It's free
                </a>
                <a href="#features" className="group text-sm font-bold leading-6 text-foreground hover:text-brand-600 transition-colors">
                  View Demo <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </a>
              </div>
            </div>

            {/* Dashboard Preview Mockup */}
            <div className="mt-20 flow-root">
              <div className="rounded-3xl border border-border bg-card p-2 shadow-2xl lg:p-4">
                <div className="aspect-[16/9] w-full rounded-2xl bg-muted/30 overflow-hidden border border-border/50 flex items-center justify-center text-muted-foreground font-medium italic">
                   Professional LMS Dashboard interface visualization
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-24 lg:px-8 bg-brand-50/30 dark:bg-brand-900/5 rounded-[3rem]">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard 
              icon={<BookOpen className="h-6 w-6 text-brand-500" />}
              title="Course Authoring"
              description="Build engaging, interactive courses with our intuitive content editor."
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6 text-brand-500" />}
              title="Enterprise Security"
              description="Role-based access control and multi-tenant isolation at its core."
            />
            <FeatureCard 
              icon={<BarChart3 className="h-6 w-6 text-brand-500" />}
              title="Deep Analytics"
              description="Track progress, completion rates, and learning outcomes in real-time."
            />
            <FeatureCard 
              icon={<Globe className="h-6 w-6 text-brand-500" />}
              title="Global Scale"
              description="Deploy your training globally with ultra-low latency infrastructure."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-center text-sm leading-5 text-muted-foreground">
            &copy; {new Date().getFullYear()} StrapLearn Technologies Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="group rounded-3xl border border-border bg-card p-8 transition-all hover:shadow-premium hover:-translate-y-1">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/20 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-bold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

