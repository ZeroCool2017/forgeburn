import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Settings, User, Trash2, LogOut, ShieldAlert, Headphones,
  Globe, BookOpen, Palette, ChevronRight, ChevronDown,
} from 'lucide-react';
import QuoteManager from '@/components/forge/QuoteManager';
import SoundModePanel from '@/components/forge/SoundModePanel';
import PersonalizationForm from '@/components/forge/PersonalizationForm';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Collapsible section wrapper — keeps the page clean
function Section({ icon: Icon, label, children, defaultOpen = false, accent = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={`glass rounded-2xl overflow-hidden ${accent ? 'border-destructive/20' : ''}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/20 transition-colors"
      >
        <h2 className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${accent ? 'text-destructive' : 'text-muted-foreground'}`}>
          <Icon className="w-3.5 h-3.5" />
          {label}
        </h2>
        {open
          ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        }
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="px-5 pb-5"
        >
          {children}
        </motion.div>
      )}
    </section>
  );
}

export default function SettingsPage() {
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const handleLogout = () => base44.auth.logout('/');

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    await base44.auth.updateMe({ account_deleted: true, deleted_at: new Date().toISOString() });
    base44.auth.logout('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-primary/4 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-chart-3/4 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-safe-nav">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <Settings className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight font-display">Settings</h1>
            <p className="text-xs text-muted-foreground font-mono">carry-the-zero / config</p>
          </div>
        </motion.div>

        <div className="space-y-3">

          {/* Account — always visible, not collapsible */}
          <section className="glass rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              Account
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                {user?.full_name?.[0] ?? user?.email?.[0] ?? '?'}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{user?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground font-mono">{user?.email}</p>
              </div>
            </div>
          </section>

          {/* Sound & Music */}
          <Section icon={Headphones} label="Sound & Music" defaultOpen={true}>
            <div className="mb-3 border-l-2 border-primary/30 pl-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Three generative soundscapes — no loops, no files. Synthesized live in your browser using the Web Audio API.
                Each mode is designed for a different focus state.
              </p>
            </div>
            <SoundModePanel />
          </Section>

          {/* Personalization / Your World */}
          <Section icon={Globe} label="Your World">
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed border-l-2 border-primary/30 pl-3">
              Tell the Forge what matters to you. These inform your experience over time.
            </p>
            <PersonalizationForm />
          </Section>

          {/* Quote Library */}
          <Section icon={BookOpen} label="Quote Library">
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed border-l-2 border-primary/30 pl-3">
              Enable, disable, or add your own quotes. They appear in the QuoteBar and the Data Story carousel.
            </p>
            <QuoteManager />
          </Section>

          {/* Appearance note */}
          <Section icon={Palette} label="Appearance">
            <div className="space-y-3">
              <div className="border-l-2 border-primary/30 pl-3 mb-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Carry the Zero uses a single, intentional design system — Obsidian dark, violet accents, Cormorant Garamond display type.
                  It is not customizable by color. The aesthetic <em>is</em> the product.
                </p>
              </div>
              {/* Swatch preview */}
              <div className="flex gap-2">
                {[
                  { label: 'Background', color: 'hsl(0 0% 6%)', border: true },
                  { label: 'Primary', color: 'hsl(258 80% 68%)' },
                  { label: 'Accent', color: 'hsl(280 60% 58%)' },
                  { label: 'Chart 3', color: 'hsl(280 60% 62%)' },
                  { label: 'Destructive', color: 'hsl(0 68% 52%)' },
                ].map(s => (
                  <div key={s.label} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className="w-full aspect-square rounded-lg border border-border/30"
                      style={{ background: s.color }}
                    />
                    <p className="text-[8px] font-mono text-muted-foreground/50 text-center leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="pt-2 space-y-1.5">
                {[
                  { label: 'Display', value: 'Cormorant Garamond', style: 'font-display text-base italic' },
                  { label: 'Body', value: 'Inter', style: 'text-sm' },
                  { label: 'Mono', value: 'JetBrains Mono', style: 'text-xs font-mono' },
                ].map(f => (
                  <div key={f.label} className="flex items-baseline justify-between border-b border-border/20 pb-1.5">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{f.label}</span>
                    <span className={f.style}>{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Session */}
          <section className="glass rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5" />
              Session
            </h2>
            <Button
              variant="outline"
              className="w-full border-border/50 text-foreground hover:bg-secondary/50"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </section>

          {/* Danger zone */}
          <section className="glass rounded-2xl p-5 border-destructive/20">
            <h2 className="text-xs font-semibold text-destructive uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              Danger Zone
            </h2>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Permanently delete your account and all chain data. Cannot be undone.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2" disabled={deleteLoading}>
                  <Trash2 className="w-4 h-4" />
                  {deleteLoading ? 'Deleting…' : 'Delete Account'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass border-border/50 max-w-sm mx-4">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-destructive" />
                    Delete Account?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This will permanently delete your account and all your chain data. There is no going back.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-border/50 text-foreground">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </section>

          <section className="text-center py-4">
            <p className="text-xs text-muted-foreground font-mono">Carry the Zero · v1.0</p>
            <p className="text-xs text-muted-foreground/50 mt-0.5 font-display italic">Interest compounds on what you owe. So does freedom on what you build.</p>
          </section>
        </div>
      </div>
    </div>
  );
}