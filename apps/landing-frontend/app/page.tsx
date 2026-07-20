import {
  Shield,
  Lock,
  Eye,
  Globe,
  Smartphone,
  Users,
  Zap,
  Check,
  ArrowRight,
  Server,
  Key,
  Database,
  ExternalLink,
} from "lucide-react";

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">Arxeo</span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </a>
          <a
            href="#security"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Security
          </a>
          <a
            href="https://github.com/ER-28/arxeo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            GitHub
          </a>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="#"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Sign In
          </a>
          <a
            href="#pricing"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-light"
          >
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-accent/10 blur-3xl animate-pulse-glow" />
      </div>
      <div className="relative mx-auto max-w-7xl px-6 py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary-light">
          <ExternalLink className="h-4 w-4" />
          Open Source &middot; Community Driven
        </div>
        <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          Your passwords.{" "}
          <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
            Your control.
          </span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Arxeo is an open source password manager with end-to-end
          encryption. Self-host for free or use our managed cloud with plans for
          individuals, teams, and enterprises.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#pricing"
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white transition-all hover:bg-primary-light hover:shadow-lg hover:shadow-primary/25"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="https://github.com/ER-28/arxeo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-medium transition-colors hover:bg-card-hover"
          >
            <ExternalLink className="h-4 w-4" />
            View on GitHub
          </a>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-border pt-16 sm:max-w-lg sm:mx-auto">
          <div>
            <div className="text-2xl font-bold text-foreground">256-bit</div>
            <div className="text-sm text-muted-foreground">AES Encryption</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">Zero</div>
            <div className="text-sm text-muted-foreground">Knowledge</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">100%</div>
            <div className="text-sm text-muted-foreground">Open Source</div>
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description:
      "AES-256 encryption with zero-knowledge architecture. Your master password never leaves your device.",
  },
  {
    icon: Globe,
    title: "Cross-Platform Sync",
    description:
      "Access your vault from any device. Native apps for Windows, macOS, Linux, iOS, and Android.",
  },
  {
    icon: Key,
    title: "Password Generator",
    description:
      "Generate strong, unique passwords with customizable length, character types, and memorable passphrases.",
  },
  {
    icon: Smartphone,
    title: "2FA & Biometrics",
    description:
      "Two-factor authentication support with TOTP, WebAuthn, fingerprint, and Face ID login.",
  },
  {
    icon: Users,
    title: "Secure Sharing",
    description:
      "Share credentials with team members using encrypted channels with granular access controls.",
  },
  {
    icon: Zap,
    title: "Auto-Fill",
    description:
      "Browser extensions and native apps auto-fill login forms securely without exposing your vault.",
  },
];

function Features() {
  return (
    <section id="features" className="border-t border-border py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Everything you need to stay secure
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Enterprise-grade security with a consumer-friendly experience. All
            features available in the free self-hosted version.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:bg-card-hover"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary-light" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const plans = [
  {
    name: "Standard",
    price: { 1: 2.99, 5: 1.99, 10: 1.49 },
    description: "For individuals and small families",
    features: [
      "Unlimited passwords",
      "Unlimited devices",
      "Password generator",
      "Secure notes & cards",
      "Browser extensions",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
    tiers: [
      { label: "1 User", price: 2.99 },
      { label: "5 Users", price: 1.99 },
      { label: "10 Users", price: 1.49 },
    ],
  },
  {
    name: "Pro",
    price: 7.99,
    description: "For professionals and power users",
    features: [
      "Everything in Standard",
      "Advanced 2FA (TOTP, WebAuthn)",
      "Priority support",
      "Vault health reports",
      "Custom fields & folders",
      "API access",
      "Emergency access",
    ],
    cta: "Start Free Trial",
    popular: true,
    tiers: [
      { label: "1 User", price: 7.99 },
      { label: "5 Users", price: 5.99 },
      { label: "10 Users", price: 4.49 },
      { label: "25 Users", price: 3.49 },
    ],
  },
  {
    name: "Enterprise",
    price: 12.99,
    description: "For organizations with advanced needs",
    features: [
      "Everything in Pro",
      "SSO / SAML integration",
      "Admin console & audit logs",
      "Directory sync (LDAP/SCIM)",
      "Dedicated support & SLA",
      "Custom branding",
      "On-premise option",
      "Compliance reports",
    ],
    cta: "Contact Sales",
    popular: false,
    tiers: [
      { label: "25 Users", price: 12.99 },
      { label: "50 Users", price: 10.99 },
      { label: "100 Users", price: 8.99 },
      { label: "250+ Users", price: 6.99 },
    ],
  },
];

function Pricing() {
  return (
    <section id="pricing" className="border-t border-border py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Choose the plan that fits your needs. All plans include a 14-day
            free trial. Volume discounts available for larger teams.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border bg-card p-8 transition-all ${
                plan.popular
                  ? "border-primary shadow-lg shadow-primary/10"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-white">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    ${plan.tiers[0].price}
                  </span>
                  <span className="text-muted-foreground">/user/mo</span>
                </div>
                <div className="mt-4 space-y-2">
                  {plan.tiers.map((tier) => (
                    <div
                      key={tier.label}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {tier.label}
                      </span>
                      <span className="font-medium">
                        ${tier.price}/user/mo
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-light" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={`block w-full rounded-lg py-3 text-center text-sm font-medium transition-all ${
                  plan.popular
                    ? "bg-primary text-white hover:bg-primary-light hover:shadow-lg hover:shadow-primary/25"
                    : "border border-border bg-background text-foreground hover:bg-card-hover"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Security() {
  return (
    <section id="security" className="border-t border-border py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Security you can verify
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Arxeo is built on a zero-knowledge architecture. We can never
            access your data, and neither can anyone else.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Eye className="h-5 w-5 text-primary-light" />
            </div>
            <div>
              <h3 className="mb-1 font-semibold">Zero Knowledge</h3>
              <p className="text-sm text-muted-foreground">
                Your master password is never transmitted or stored on our
                servers.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Database className="h-5 w-5 text-primary-light" />
            </div>
            <div>
              <h3 className="mb-1 font-semibold">Encrypted at Rest</h3>
              <p className="text-sm text-muted-foreground">
                All vault data is encrypted with AES-256 before storage.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Server className="h-5 w-5 text-primary-light" />
            </div>
            <div>
              <h3 className="mb-1 font-semibold">Open Source</h3>
              <p className="text-sm text-muted-foreground">
                Fully auditable codebase. Verify our security claims yourself.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Arxeo</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Open source password manager with end-to-end encryption. Keep
              your digital life secure.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-foreground">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-foreground">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Downloads
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Extensions
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Security
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Status
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Arxeo. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/ER-28/arxeo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <Security />
      <Footer />
    </div>
  );
}
